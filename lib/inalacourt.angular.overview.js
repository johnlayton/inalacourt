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
    var app = angular.module ( "overview", ['leaflet-directive'] );
    app.controller ( "Overview", [ '$scope', '$location', function ( $scope, $location ) {
      angular.extend ( $scope, {
        center : {
          lat : -37,
          lng : 144,
          zoom : 3
        },
        defaults : {
          scrollWheelZoom : false,
          attributionControl : false,
          tileLayer : "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
          tileLayerOptions : {
            opacity : 0.9,
            detectRetina : true,
            reuseTiles : true
          }
        }
      } );
      $scope.$on ( 'leafletDirectiveMap.click', function ( event ) {
        $location.path ( "/" );
      } );
    }] );
    return app;
  };
} ));
