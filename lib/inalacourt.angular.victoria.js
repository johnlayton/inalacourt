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
    var app = angular.module ( "victoria", ['leaflet-directive'] );
    app.controller ( "Victoria", [ '$scope', '$location', '$http',
                         function ( $scope,   $location,   $http  ) {
      angular.extend ( $scope, {
        melbourne : {
          lat : -37,
          lng : 144,
          zoom : 7
        },
        defaults : {
          scrollWheelZoom : false,
          attributionControl : false,
          tileLayer : "http://localhost:8080/mapscape/{z}/{x}/{y}.png",
          tileLayerOptions : {
            opacity : 0.9,
            detectRetina : true,
            attribution : '',
            reuseTiles : true
          }
        }
      } );
      $http.get ( "/regions" ).success ( function ( data, status ) {
        angular.extend ( $scope, {
          geojson : {
            data : data,
            style : {
              //fillColor : "red",
              weight : 2,
              opacity : 1,
              color : 'black',
              dashArray : '3',
              fillOpacity : 0.7
            }
          }
        } );
      } );
      $scope.$on ( 'leafletDirectiveMap.click', function ( event ) {
        $location.path ( "/" );
      } );
    }] );
    return app;
  };
} ));
