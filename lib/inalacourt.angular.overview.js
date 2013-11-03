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
    app.controller ( "Overview", [ '$scope', '$location', 'socket', function ( $scope, $location, socket ) {
      angular.extend ( $scope, {
        canberra : {
          lat : -35.3075,
          lng : 149.124417,
          zoom : 8
        },
        defaults : {
          scrollWheelZoom : false,
          attributionControl : false,
          tileLayer : "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png",
          tileLayerOptions : {
            opacity : 0.9,
            detectRetina : true,
            reuseTiles : true
          }
        },
        markers: {}
      } );
      $scope.$on ( 'leafletDirectiveMap.click', function ( event ) {
        $location.path ( "/" );
      } );
      socket.on ( 'position', function ( data ) {
        console.log( data );
        $scope.markers[ data.identity ] =  {
          lat: parseFloat( data.position.coords.latitude ),
          lng: parseFloat( data.position.coords.longitude ),
          message: data.asset.regn
        };
      } );
    }] );
    return app;
  };
} ));
