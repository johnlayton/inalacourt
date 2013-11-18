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

  if ( typeof Number.prototype.toRad == 'undefined' ) {
    Number.prototype.toRad = function () {
      return this * Math.PI / 180;
    };
  }

  if ( typeof Number.prototype.toDeg == 'undefined' ) {
    Number.prototype.toDeg = function () {
      return this * 180 / Math.PI;
    };
  }

  if ( typeof L.LatLng.prototype.bearingTo == 'undefined' ) {
    L.LatLng.prototype.bearingTo = function ( other ) {

      var point = L.latLng ( other );

      var lat1 = this.lat.toRad (), lat2 = point.lat.toRad ();
      var dLon = (point.lng - this.lng).toRad ();

      var y = Math.sin ( dLon ) * Math.cos ( lat2 );
      var x = Math.cos ( lat1 ) * Math.sin ( lat2 ) -
              Math.sin ( lat1 ) * Math.cos ( lat2 ) * Math.cos ( dLon );
      var brng = Math.atan2 ( y, x );

      return (brng.toDeg () + 360) % 360;

    };
  }

  if ( typeof L.LatLng.prototype.bearingTo == 'undefined' ) {
    L.LatLng.prototype.bearingFrom = function ( point ) {

      var latlng = L.latLng ( other );

      var lat1 = latlng.lat.toRad (),
        lat2 = this.lat.toRad (),
        dLon = (this.lng - point.lng).toRad ();

      var y = Math.sin ( dLon ) * Math.cos ( lat2 );
      var x = Math.cos ( lat1 ) * Math.sin ( lat2 ) -
              Math.sin ( lat1 ) * Math.cos ( lat2 ) * Math.cos ( dLon );

      var brng = Math.atan2 ( y, x );

      return (brng.toDeg () + 180) % 360;
    };
  }

} ));