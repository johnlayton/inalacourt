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
  L.Control.Flyover = L.Control.extend ( {
    options : {
      position : 'topright',
      collapsed : true,
      layer : new L.LayerGroup ()
    },

    initialize : function ( options ) {
      L.setOptions ( this, options );
      this._layer = this.options.layer;
    },

    onAdd : function ( map ) {
      this._initLayout ();
      this._update ();

      map
        .on ( 'move', this._onViewChange, this )
        .on ( 'zoom', this._onViewChange, this )
        .on ( 'viewreset', this._onViewChange, this )
        .on ( 'click', this._collapse, this );

      this._map = map;
      return this._container;
    },

    onRemove : function ( map ) {
      map
        .off ( 'move', this._onViewChange )
        .off ( 'zoom', this._onViewChange )
        .off ( 'viewreset', this._onViewChange )
        .off ( 'click', this._collapse );
    },

    _onViewChange : function ( e ) {
      this._update ();
    },

    _initLayout : function () {
      var className = this._className = 'leaflet-control-flyover',
        container = this._container = L.DomUtil.create ( 'div', className );

      if ( !L.Browser.touch ) {
        L.DomEvent.disableClickPropagation ( container );
        L.DomEvent.on ( container, 'mousewheel', L.DomEvent.stopPropagation );
      }
      else {
        L.DomEvent.on ( container, 'click', L.DomEvent.stopPropagation );
      }
      var markers = this._markers = L.DomUtil.create ( 'div', className + '-list', container );
    },

    _update : function () {
      this._collapse ();

      if ( !this._container || !this._markers ) {
        return;
      }

      this._markers.innerHTML = '';
      var self = this;
      this._layer.getLayers ().forEach ( function ( layer ) {
        if ( self._map.getBounds ().contains ( layer.getLatLng () ) ) {

          var link = L.DomUtil.create ( 'a', self._className + '-link', self._markers );
          link.href = '#';
          link.title = layer.options.title;
          link.innerHTML = layer.options.title;

          if ( L.Browser.touch ) {
            L.DomEvent.on ( link, 'click', L.DomEvent.stop );
            L.DomEvent.on ( link, 'click', self._expand, this );
            L.DomEvent.on ( link, 'click', function ( e ) {
              self._map.setView ( layer.getLatLng (), 10 )
            } );
          }
          else {
            L.DomEvent.on ( link, 'focus', self._expand, this );
            L.DomEvent.on ( link, 'click', function ( e ) {
              self._map.setView ( layer.getLatLng (), 10 )
            } );
          }
          self._expand ();
        }
      } );
    },

    _expand : function () {
      L.DomUtil.addClass ( this._container, this._className + '-expanded' );
    },

    _collapse : function () {
      this._container.className = this._container.className.replace ( ' ' + this._className + +'-expanded', '' );
    }

  } );

  L.Map.mergeOptions ( {
    flyoverControl : true
  } );

  L.Map.addInitHook ( function () {
    if ( this.options.flyoverControl ) {
      this.flyoverControl = (new L.Control.Flyover ()).addTo ( this );
    }
  } );

  L.control.flyover = function ( options ) {
    return new L.Control.Flyover ( options );
  };

} ));