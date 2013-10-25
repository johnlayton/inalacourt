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

  L.Control.Legend = L.Control.extend ( {
    options : {
      position : 'bottomright',
      template : function ( name ) {
        return function ( data ) {
          JSON.stringify ( data );
        }
      }
    },

    initialize : function ( options ) {
      L.setOptions ( this, options );
    },

    onAdd : function ( map ) {
      var legendClassName = 'leaflet-control-legend';
      this._div = L.DomUtil.create ( 'div', legendClassName + ' leaflet-bar' );
      this.update ();
      return this._div;
    },

    update : function ( type, data ) {
      if ( type && data ) {
        this._div.innerHTML = this.options.template[ type ] ( data );
      }
      else {
        this._div.innerHTML = "";
      }
    }
  } );

  L.Map.mergeOptions ( {
    legendControl : true
  } );

  L.Map.addInitHook ( function () {
    if ( this.options.legendControl ) {
      this.legendControl = (new L.Control.Legend ()).addTo ( this );
    }
  } );

  L.control.legend = function ( options ) {
    return new L.Control.Legend ( options );
  };

} ))
;