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
    var app = angular.module ( "terrain", ['leaflet-directive'] );
    app.controller ( "Terrain", [ '$scope', '$http', function ( $scope, $http ) {
      angular.extend ( $scope, {
        melbourne : {
          lat : -37.26,
          lng : 143.86,
          zoom : 4
        },
        defaults : {
          scrollWheelZoom : false,
          attributionControl : false,
          //tileLayer : "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
          tileLayer : "http://localhost:8888/arcgisrelief/{z}/{x}/{y}.png",
          tileLayerOptions : {
            opacity : 0.9,
            detectRetina : true,
            attribution : '',
            reuseTiles : true
          }
        }
      } );
      // Get the countries geojson data from a JSON
      $http.get ( "http://localhost:8888/elevation_500.json" ).success ( function ( data, status ) {
        angular.extend ( $scope, {
          geojson : {
            data : data,
            style : {
              //fillColor : "red",
              weight : 2,
              opacity : 1,
              color : 'black',
              //dashArray : '3',
              fillOpacity : 0.7
            }
          }
        } );
      } );
    }] );
    return app;
  };
} ));
