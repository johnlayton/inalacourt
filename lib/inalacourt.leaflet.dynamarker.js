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

  L.DynaMarker = L.Marker.extend ( {

    options : {
      template: function( zoom, data ) {
        "<div><b>" + zoom + "</b> - " + data + "</div>";
      }
    },

    initialize : function ( latlng, options ) {
      L.Marker.prototype.initialize.call ( this, latlng, options )
      L.setOptions ( this, options );
    },

    onAdd : function ( map ) {
      L.Marker.prototype.onAdd.call ( this, map );
      this.modify( this.getLatLng(), this.options.data );
      map.on ( 'zoomend', this.zoom, this );
    },

    onRemove : function ( map ) {
      L.Marker.prototype.onRemove.call ( this, map );
      map.off ( { 'zoomend' : this.zoom }, this );
    },

    zoom : function () {
      this.setIcon ( new L.divIcon( {
        iconAnchor : [ 14, 14 ],
        className : 'leaflet-div-icon',
        html : this.options.template( this._map.getZoom (), this.options.data )
      } ) );
    },

    move : function ( latLng, time ) {
      if ( L.DomUtil.TRANSITION ) {
        if ( this._icon ) {
          this._icon.style[L.DomUtil.TRANSITION] = 'all ' + time + 'ms linear';
          if ( this._popup && this._popup._wrapper ) {
            this._popup._wrapper.style[L.DomUtil.TRANSITION] = 'all ' + time + 'ms linear';
          }
        }
        if ( this._shadow ) {
          this._shadow.style[L.DomUtil.TRANSITION] = 'all ' + time + 'ms linear';
        }
      }
      this.setLatLng ( latLng );
      this.setIcon ( new L.divIcon( {
        iconAnchor : [ 14, 14 ],
        className : 'leaflet-div-icon',
        html : this.options.template( this._map.getZoom (), this.options.data )
      } ) );
    },

    modify : function ( latlng, data ) {
      this.move ( latlng, 1000 );
      this.setIcon ( new L.divIcon( {
        iconAnchor : [ 14, 14 ],
        className : 'leaflet-div-icon',
        html : this.options.template( this._map.getZoom (), data )
      } ) );
      this.options.data = data;
    }
  } );

  L.dynaMarker = function ( latlng, options ) {
    return new L.DynaMarker ( latlng, options );
  };

} ));