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

  L.Playback = L.Class.extend ( {
//L.Playback = L.LayerGroup.extend ( {

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

    addTrack : function ( geojson ) {
      var features = L.Util.isArray ( geojson ) ? geojson : geojson.features,
        i, len, feature;

      if ( features ) {
        for ( i = 0, len = features.length; i < len; i++ ) {
          feature = features[i];
          if ( feature.geometries || feature.geometry || feature.features || feature.coordinates ) {
            this.addTrack ( features[i] );
          }
        }
        return this;
      }

      var data = { asset: { type: "aircraft" } , telemetry: geojson.properties };
      var position = [ geojson.geometry.coordinates[1],
                       geojson.geometry.coordinates[0]  ]

      var marker = L.dynaMarker ( position, {
        //title : title ( data ),
        template : t.markers,
        data : data,
        icon : L.divIcon ( {
          iconAnchor : [ 14, 14 ],
          className : 'leaflet-div-icon',
          html : t.markers ( this._map.getZoom (), data )
        } )
      } );

      this._map.setView ( marker.getLatLng (), 8 );

      return this._map.addLayer ( marker );
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

} ));