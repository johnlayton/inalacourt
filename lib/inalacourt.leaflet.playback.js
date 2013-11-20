(function ( root, factory ) {
  if ( typeof exports === 'object' ) {
    module.exports = factory ();
  }
  else if ( typeof define === 'function' && define.amd ) {
    define ( [], factory );
  }
  else {
    root.returnExports = factory ();
  }
} ( this, function () {

  var _ = require ( "lodash" );
  var l = require ( "geoutil" );

  var debug = function ( message ) {
    console.log ( "[" + new Date () + "] -> " + message );
  }

  L.Track = L.Class.extend ( {

    options : {
      coordsToLatLng : function ( coords ) {
        return new L.LatLng ( coords[1], coords[0] );
      },
      latLngToCoords : function ( latLng ) {
        return [ latLng.lng, latLng.lat ];
      }
    },

    initialize : function ( geojson, options ) {
      L.setOptions ( this, options );
      this._geojson = geojson;
    },

    update : function ( marker, time ) {
      console.log ( "========================" )
      console.log ( new Date ( time ) );
      console.log ( "========================" )

      var self = this,
      // Initial point before time
        a = _.last ( _.select ( self._geojson, function ( feature ) {
          return self._transmitted ( feature ) < time;
        } ) ),
      // Final point past current time
        b = _.first ( _.select ( self._geojson, function ( feature ) {
          return self._transmitted ( feature ) > time;
        } ) ),
      // All points between last time and this time
        c = _.select ( self._geojson, function ( feature ) {
          return ( self._transmitted ( feature ) >= self._last ) &&
                 ( self._transmitted ( feature ) <= time );
        } );

      // Abort outside range of data
      if ( ( time < self._transmitted ( _.head ( self._geojson ) ) ) ||
           ( time > self._transmitted ( _.last ( self._geojson ) ) ) ) {
        return;
      }

      /*
       if ( ( !a || !b ) && ( time < self._transmitted ( _.head ( self._geojson ) ) ) ) {
       //a = self._geojson[0]
       //b = self._geojson[1] || self._geojson[0]
       return;
       }

       if ( ( !a || !b ) && ( time > self._transmitted ( _.last ( self._geojson ) ) ) ) {
       //a = self._geojson[Math.max ( ( self._geojson.length - 2 ), 0 )]
       //a = self._geojson[Math.max ( ( self._geojson.length - 1 ), 1 )] || self._geojson[0]
       return;
       }
       */

      c.push ( self._createFeature ( _.last ( c ) || self._markerToFeature ( marker ), b, time ) );

      // Move between all points
      _.forEach ( c, function ( feature ) {
        marker.setLatLng ( self._coordinates ( feature ) )
        marker.setData ( feature )
      } );

      self._last = time;
    },

    _properties : function ( a, b, t ) {
      var a_pos = this._coordinates ( a ), b_pos = this._coordinates ( b ),
        a_time = this._transmitted ( a ), b_time = this._transmitted ( b );

      var result = _.clone ( a.properties );

      result.telemetry.speed = this._interpolate (
        parseInt ( a.properties.telemetry.speed ),
        parseInt ( b.properties.telemetry.speed ),
        a_time, b_time, t ).toString ();
      result.telemetry.altitude = this._interpolate (
        parseInt ( a.properties.telemetry.altitude ),
        parseInt ( b.properties.telemetry.altitude ),
        a_time, b_time, t ).toString ();
      result.telemetry.track = L.latLng (
          this._interpolate ( a_pos.lat, b_pos.lat, a_time, b_time, t ),
          this._interpolate ( a_pos.lng, b_pos.lng, a_time, b_time, t ) )
        .bearingTo ( b_pos );
      result.telemetry.transmitted = t;
      return result;
    },

    _position : function ( a, b, t ) {
      try {
        var a_pos = this._coordinates ( a ), b_pos = this._coordinates ( b ),
          a_time = this._transmitted ( a ), b_time = this._transmitted ( b );
        var latlng = L.latLng (
          this._interpolate ( a_pos.lat, b_pos.lat, a_time, b_time, t ),
          this._interpolate ( a_pos.lng, b_pos.lng, a_time, b_time, t ) );
        return latlng
      }
      catch ( e ) {
        console.log ( 'err: cant interpolate a point' );
      }
    },

    _interpolate : function ( y1, y2, x1, x2, x ) {
      return y1 + ( ( y2 - y1 ) * ( ( x - x1 ) / ( x2 - x1 ) ) );
    },

    _transmitted : function ( feature ) {
      return new Date ( feature.properties.telemetry.transmitted );
    },

    _coordinates : function ( feature ) {
      return this.options.coordsToLatLng ( feature.geometry.coordinates );
    },

    _createFeature : function ( a, b, t ) {
      return {
        geometry : {
          coordinates : this.options.latLngToCoords ( this._position ( a, b, t ) )
        },
        properties : this._properties ( a, b, t )
      };
    },

    _markerToFeature : function ( marker ) {
      return {
        geometry : {
          coordinates : this.options.latLngToCoords ( marker.getLatLng () )
        },
        properties : marker.options.data.properties
      };
    }

  } );

  L.Playback = L.Class.extend ( {

    options : {
      callback : function ( time ) {
        console.log ( time );
      }
    },

    initialize : function ( options ) {
      L.setOptions ( this, options );
    },

    addTo : function ( map ) {
      map.addLayer ( this );
      return this;
    },

    onAdd : function ( map ) {
      this._map = map;
    },

    start : function () {
      if ( this._timer ) {
        return;
      }
      this._timer = window.setInterval ( this._tick, 1000, this );
    },

    stop : function () {
      if ( !this._timer ) {
        return;
      }
      clearInterval ( this._timer );
      this._timer = null;
    },

    addTrack : function ( geojson ) {
      var features = L.Util.isArray ( geojson ) ? geojson : geojson.features,
        i, len, feature;

      if ( features ) {
        for ( i = 0, len = features.length; i < len; i++ ) {
          feature = features[i];
          //if ( feature.geometries || feature.geometry || feature.features || feature.coordinates ) {
          if ( feature.geometries || feature.geometry || feature.coordinates ) {
            this.addTrack ( features[i] );
          }
        }

        this._current =
        this._start =
        new Date ( Math.min ( this._start || new Date ().getTime (),
          new Date ( features[0].properties.telemetry.transmitted ).getTime () ) );

        this._finish =
        new Date ( Math.max ( this._finish || new Date ( 0 ).getTime (),
          new Date ( features[features.length - 1].properties.telemetry.transmitted ).getTime () ) );

        this._track = new L.Track ( features );

        if ( this._marker ) {
          this._map.removeLayer ( this._marker );
        }

        this._marker = L.dynaMarker ( [ features[0].geometry.coordinates[1],
                                        features[0].geometry.coordinates[0] ], {
          template : t.markers,
          data : features[0],
          icon : L.divIcon ( {
            iconAnchor : [ 14, 14 ],
            className : 'leaflet-div-icon',
            html : t.markers ( this._map.getZoom (), features[0].properties )
          } )
        } );

        var url = '/details?id=' + features[0].properties.identity + '&type=linestring';
        this._map.addLayer ( L.geoJson.ajax ( url, { } ) );
        this._map.addLayer ( this._marker );
        this._map.setView ( this._marker.getLatLng (), 12 );

        this.options.callback ( this._start );

        return this;
      }

      return this;
    },

    _tick : function ( self ) {
      self._current =
      new Date ( Math.min ( Math.max ( self._start,
        ( self._current || self._start ) + ( self._step || ( 1000 * 60 ) ) ), self._finish ) );
      self._track.update ( self._marker, self._current );
      /*
       self._map.setView ( self._marker.getLatLng () );
       self.options.callback ( new Date ( self._current ) );
       */
    }
  } );

  /*
   L.Map.mergeOptions ( {
   informationControl : true
   } );

   L.Map.addInitHook ( function () {
   //if ( this.options.informationControl ) {
   //  this.informationControl = (new L.Control.Information ()).addTo ( this );
   //}
   } );
   */

  L.playback = function ( options ) {
    return new L.Playback ( options );
  };

} ))
;