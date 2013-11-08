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

  L.Control.Information = L.Control.extend ( {
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
      var informationClassName = 'leaflet-control-information';
      this._div = L.DomUtil.create ( 'div', informationClassName + ' leaflet-bar' );
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
    informationControl : true
  } );

  L.Map.addInitHook ( function () {
    //if ( this.options.informationControl ) {
    //  this.informationControl = (new L.Control.Information ()).addTo ( this );
    //}
  } );

  L.control.information = function ( options ) {
    return new L.Control.Information ( options );
  };

} ))
;