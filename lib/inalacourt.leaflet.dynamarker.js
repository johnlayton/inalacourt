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

  L.DynaMarker = L.Marker.extend ( {

    options : {
      coordsToLatLng : function ( coords ) {
        return new L.LatLng ( coords[1], coords[0] );
      },
      latLngToCoords : function ( latLng ) {
        return [ latLng.lng, latLng.lat ];
      },
      template : function ( zoom, data ) {
        "<div><b>" + zoom + "</b> - " + data + "</div>";
      },
      icon : new L.Icon.Default ()
    },

    initialize : function ( latlng, options ) {
      L.Marker.prototype.initialize.call ( this, latlng, options )
      L.setOptions ( this, options );
    },

    onAdd : function ( map ) {
      L.Marker.prototype.onAdd.call ( this, map );
      map.on ( 'zoomend', this.setDisplay, this );
    },

    onRemove : function ( map ) {
      L.Marker.prototype.onRemove.call ( this, map );
      map.off ( { 'zoomend' : this.setDisplay }, this );
    },

    setData : function ( data ) {
      this.options.data = data;
      this.setDisplay ();
      //this.setLatLng ( this.options.coordsToLatLng ( data.geometry.coordinates ) );
    },

    setDisplay : function () {
      this.setIcon ( new L.divIcon ( {
        iconAnchor : [ 14, 14 ],
        className : 'leaflet-div-icon',
        html : this.options.template ( this._map.getZoom (), this.options.data.properties )
      } ) );
      this._initIcon();
    }

  } );

  L.dynaMarker = function ( latlng, options ) {
    return new L.DynaMarker ( latlng, options );
  };

} ));