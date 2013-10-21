(function ( root, factory ) {
  if ( typeof exports === 'object' ) {
    module.exports = factory();
  }
  else if ( typeof define === 'function' && define.amd ) {
    define( [], factory );
  }
  else {
    root.returnExports = factory();
  }
}( this, function () {

  L.DynaMarker = L.Class.extend({

    includes: L.Mixin.Events,

    options: {
      icon: new L.Icon.Default(),
      title: '',
      clickable: true,
      draggable: false,
      keyboard: true,
      zIndexOffset: 0,
      opacity: 1,
      riseOnHover: false,
      riseOffset: 250
    },

    initialize: function (latlng, options) {
      L.setOptions(this, options);
      this._latlng = L.latLng(latlng);
    },

    onAdd: function (map) {
      this._map = map;

      map.on('viewreset', this.update, this);
      map.on('zoomend', this.zoom, this);

      this._initIcon();
      this.update();
      this.fire('add');

      if (map.options.zoomAnimation && map.options.markerZoomAnimation) {
        map.on('zoomanim', this._animateZoom, this);
      }
    },

    addTo: function (map) {
      map.addLayer(this);
      return this;
    },

    onRemove: function (map) {
      if (this.dragging) {
        this.dragging.disable();
      }

      this._removeIcon();
      this._removeShadow();

      this.fire('remove');

      map.off({
        'viewreset': this.update,
        'zoomend': this.zoom,
        'zoomanim': this._animateZoom
      }, this);

      this._map = null;
    },

    getLatLng: function () {
      return this._latlng;
    },

    setLatLng: function (latlng) {
      this._latlng = L.latLng(latlng);

      this.update();

      return this.fire('move', { latlng: this._latlng });
    },

    setZIndexOffset: function (offset) {
      this.options.zIndexOffset = offset;
      this.update();

      return this;
    },

    setIcon: function (icon) {

      this.options.icon = icon;

      if (this._map) {
        this._initIcon();
        this.update();
      }

      if (this._popup) {
        this.bindPopup(this._popup);
      }

      return this;
    },

    update: function () {
      if (this._icon) {
        var pos = this._map.latLngToLayerPoint(this._latlng).round();
        this._setPos(pos);
      }
      return this;
    },

    zoom: function()
    {
      this._setZoom( this._map.getZoom() );
    },

    _initIcon: function () {
      var options = this.options,
        map = this._map,
        animation = (map.options.zoomAnimation && map.options.markerZoomAnimation),
        classToAdd = animation ? 'leaflet-zoom-animated' : 'leaflet-zoom-hide';

      var icon = options.icon.createIcon(this._icon, this._map),
        addIcon = false;

      // if we're not reusing the icon, remove the old one and init new one
      if (icon !== this._icon) {
        if (this._icon) {
          this._removeIcon();
        }
        addIcon = true;

        if (options.title) {
          icon.title = options.title;
        }
      }

      L.DomUtil.addClass(icon, classToAdd);

      if (options.keyboard) {
        icon.tabIndex = '0';
      }

      this._icon = icon;

      this._initInteraction();

      if (options.riseOnHover) {
        L.DomEvent
          .on(icon, 'mouseover', this._bringToFront, this)
          .on(icon, 'mouseout', this._resetZIndex, this);
      }

      var newShadow = options.icon.createShadow(this._shadow),
        addShadow = false;

      if (newShadow !== this._shadow) {
        this._removeShadow();
        addShadow = true;
      }

      if (newShadow) {
        L.DomUtil.addClass(newShadow, classToAdd);
      }
      this._shadow = newShadow;


      if (options.opacity < 1) {
        this._updateOpacity();
      }


      var panes = this._map._panes;

      if (addIcon) {
        panes.markerPane.appendChild(this._icon);
      }

      if (newShadow && addShadow) {
        panes.shadowPane.appendChild(this._shadow);
      }
    },

    _removeIcon: function () {
      if (this.options.riseOnHover) {
        L.DomEvent
          .off(this._icon, 'mouseover', this._bringToFront)
          .off(this._icon, 'mouseout', this._resetZIndex);
      }

      this._map._panes.markerPane.removeChild(this._icon);

      this._icon = null;
    },

    _removeShadow: function () {
      if (this._shadow) {
        this._map._panes.shadowPane.removeChild(this._shadow);
      }
      this._shadow = null;
    },

    _setZoom: function (zoom) {
      this._initIcon();
    },

    _setPos: function (pos) {
      L.DomUtil.setPosition(this._icon, pos);

      if (this._shadow) {
        L.DomUtil.setPosition(this._shadow, pos);
      }

      this._zIndex = pos.y + this.options.zIndexOffset;

      this._resetZIndex();
    },

    _updateZIndex: function (offset) {
      this._icon.style.zIndex = this._zIndex + offset;
    },

    _animateZoom: function (opt) {
      var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center);
      this._setPos(pos);
    },

    _initInteraction: function () {

      if (!this.options.clickable) { return; }

      // TODO refactor into something shared with Map/Path/etc. to DRY it up

      var icon = this._icon,
        events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

      L.DomUtil.addClass(icon, 'leaflet-clickable');
      L.DomEvent.on(icon, 'click', this._onMouseClick, this);
      L.DomEvent.on(icon, 'keypress', this._onKeyPress, this);

      for (var i = 0; i < events.length; i++) {
        L.DomEvent.on(icon, events[i], this._fireMouseEvent, this);
      }

      if (L.Handler.MarkerDrag) {
        this.dragging = new L.Handler.MarkerDrag(this);

        if (this.options.draggable) {
          this.dragging.enable();
        }
      }
    },

    _onMouseClick: function (e) {
      var wasDragged = this.dragging && this.dragging.moved();

      if (this.hasEventListeners(e.type) || wasDragged) {
        L.DomEvent.stopPropagation(e);
      }

      if (wasDragged) { return; }

      if ((!this.dragging || !this.dragging._enabled) && this._map.dragging && this._map.dragging.moved()) { return; }

      this.fire(e.type, {
        originalEvent: e,
        latlng: this._latlng
      });
    },

    _onKeyPress: function (e) {
      if (e.keyCode === 13) {
        this.fire('click', {
          originalEvent: e,
          latlng: this._latlng
        });
      }
    },

    _fireMouseEvent: function (e) {

      this.fire(e.type, {
        originalEvent: e,
        latlng: this._latlng
      });

      // TODO proper custom event propagation
      // this line will always be called if marker is in a FeatureGroup
      if (e.type === 'contextmenu' && this.hasEventListeners(e.type)) {
        L.DomEvent.preventDefault(e);
      }
      if (e.type !== 'mousedown') {
        L.DomEvent.stopPropagation(e);
      } else {
        L.DomEvent.preventDefault(e);
      }
    },

    setOpacity: function (opacity) {
      this.options.opacity = opacity;
      if (this._map) {
        this._updateOpacity();
      }

      return this;
    },

    _updateOpacity: function () {
      L.DomUtil.setOpacity(this._icon, this.options.opacity);
      if (this._shadow) {
        L.DomUtil.setOpacity(this._shadow, this.options.opacity);
      }
    },

    _bringToFront: function () {
      this._updateZIndex(this.options.riseOffset);
    },

    _resetZIndex: function () {
      this._updateZIndex(0);
    }
  });

  L.DynaMarker.include({
    openPopup: function () {
      if (this._popup && this._map && !this._map.hasLayer(this._popup)) {
        this._popup.setLatLng(this._latlng);
        this._map.openPopup(this._popup);
      }

      return this;
    },

    closePopup: function () {
      if (this._popup) {
        this._popup._close();
      }
      return this;
    },

    togglePopup: function () {
      if (this._popup) {
        if (this._popup._isOpen) {
          this.closePopup();
        } else {
          this.openPopup();
        }
      }
      return this;
    },

    bindPopup: function (content, options) {
      var anchor = L.point(this.options.icon.options.popupAnchor || [0, 0]);

      anchor = anchor.add(L.Popup.prototype.options.offset);

      if (options && options.offset) {
        anchor = anchor.add(options.offset);
      }

      options = L.extend({offset: anchor}, options);

      if (!this._popupHandlersAdded) {
        this
          .on('click', this.togglePopup, this)
          .on('remove', this.closePopup, this)
          .on('move', this._movePopup, this);
        this._popupHandlersAdded = true;
      }

      if (content instanceof L.Popup) {
        L.setOptions(content, options);
        this._popup = content;
      } else {
        this._popup = new L.Popup(options, this)
          .setContent(content);
      }

      return this;
    },

    setPopupContent: function (content) {
      if (this._popup) {
        this._popup.setContent(content);
      }
      return this;
    },

    unbindPopup: function () {
      if (this._popup) {
        this._popup = null;
        this
          .off('click', this.togglePopup, this)
          .off('remove', this.closePopup, this)
          .off('move', this._movePopup, this);
        this._popupHandlersAdded = false;
      }
      return this;
    },

    _movePopup: function (e) {
      this._popup.setLatLng(e.latlng);
    }
  });

  L.dynaMarker = function (latlng, options) {
    return new L.DynaMarker(latlng, options);
  };

  L.DynaIcon = L.Icon.extend({
    options: {
      iconAnchor: [ 14, 14 ],
      /*
       iconSize: [12, 12], // also can be set through CSS
       iconAnchor: (Point)
       popupAnchor: (Point)
       html: (String)
       bgPos: (Point)
       */
      className: 'leaflet-div-icon',
      html: false
    },

    createIcon: function (oldIcon, map) {
      var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
        options = this.options;

      if ( options.markers ) {
        div.innerHTML = options.markers( map.getZoom(), options.data )
      } else if (options.html !== false) {
        div.innerHTML = options.html;
      } else {
        div.innerHTML = '';
      }

      if (options.bgPos) {
        div.style.backgroundPosition =
        (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
      }

      this._setIconStyles(div, 'icon');
      return div;
    },

    createShadow: function () {
      return null;
    }
  });

  L.dynaIcon = function (options) {
    return new L.DynaIcon(options);
  };

} ));