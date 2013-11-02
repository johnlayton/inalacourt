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
    var app = angular.module ( "incident", ['leaflet-directive'] );
    app.controller ( "Incident", [ '$scope', '$http', function ( $scope, $http ) {
      angular.extend ( $scope, {
        melbourne : {
          lat : -37.26,
          lng : 143.86,
          zoom : 4
        },
        defaults : {
          scrollWheelZoom : false
        }
      } );
      // Get the countries geojson data from a JSON
      $http.get ( "/incidents" ).success ( function ( data, status ) {
        angular.extend ( $scope, {
          geojson : {
            data : data,
            style : {
              fillColor : "red",
              weight : 2,
              opacity : 1,
              color : 'white',
              dashArray : '3',
              fillOpacity : 0.7
            }
          }
        } );
      } );
    }] );
    return app;
  };
} ));
