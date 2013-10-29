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
      position : 'bottomright'
    },

    initialize : function ( options ) {
      L.setOptions ( this, options );
    },

    onAdd : function ( map ) {
      var className = this._className = 'leaflet-control-information';
      return this._container = L.DomUtil.create ( 'div', className + ' leaflet-bar' );
    },

    update : function ( type, data ) {
      if ( type && data ) {
        this._container.innerHTML = this.options.template[ type ] ( data );
        this._expand ();
      }
      else {
        this.clear ();
      }
    },

    clear : function () {
      this._collapse ();
      this._container.innerHTML = "";
    },

    _expand : function () {
      L.DomUtil.addClass ( this._container, this._className + '-expanded' );
    },

    _collapse : function () {
      this._container.className = this._container.className.replace ( this._className + '-expanded', '' );
    }
  } );

  L.Map.mergeOptions ( {
    informationControl : true
  } );

  L.Map.addInitHook ( function () {
    if ( this.options.informationControl ) {
      this.informationControl = (new L.Control.Information ()).addTo ( this );
    }
  } );

  L.control.information = function ( options ) {
    return new L.Control.Information ( options );
  };

} ))
;