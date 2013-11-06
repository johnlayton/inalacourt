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

  return function ( angular ) {
    angular.module ( 'nafc-resources', [ 'btford.socket-io' ] )
    //angular.module ( 'leaflet-directive', [ 'btford.socket-io' ] )
      .service ( 'socket-markers', function ( $log, socket ) {
      this.manage = function ( markers ) {
        //console.log ( "Manage Markers" )
        //console.log ( require ( 'util' ).inspect ( markers ) );
      };
    } );
  };

} ));