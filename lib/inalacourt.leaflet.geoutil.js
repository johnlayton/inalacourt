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

  L.extend ( L.LatLng, {

    bearingTo : function ( other ) {

      other = L.latLng(other);

      var d2r = L.LatLng.DEG_TO_RAD;

      var lat1 = this.lat * d2r,
          lat2 = other.lat * d2r;
      var dLon = (other.lng - this.lng) * d2r;

      var y = Math.sin ( dLon ) * Math.cos ( lat2 );
      var x = Math.cos ( lat1 ) * Math.sin ( lat2 ) -
              Math.sin ( lat1 ) * Math.cos ( lat2 ) * Math.cos ( dLon );
      var brng = Math.atan2 ( y, x );

      return (brng.toDeg () + 360) % 360;
    }
  } );

} ));