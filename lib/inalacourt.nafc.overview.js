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
    var app = angular.module ( "overview", ['leaflet-directive', 'nafc-resources'] );

    app.controller ( "Overview", [ '$scope', 'socket-markers', function ( $scope, socketMarkers ) {
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
        //markers: {},
        layers: {
          baselayers: {
            osm: {
              name: 'OpenStreetMap',
              type: 'xyz',
              url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              layerOptions: {
                subdomains: ['a', 'b', 'c'],
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                continuousWorld: true
              }
            },
            cycle: {
              name: 'OpenCycleMap',
              type: 'xyz',
              url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
              layerOptions: {
                subdomains: ['a', 'b', 'c'],
                attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                continuousWorld: true
              }
            }
          }
        }
      } );

      socketMarkers.manage( {} );
      //$scope.$on ( 'leafletDirectiveMap.click', function ( event ) {
      //  $location.path ( "/" );
      //} );
      //socket.on ( 'position', function ( data ) {
      //  $scope.markers[ data.identity ] =  {
      //    lat: parseFloat( data.position.coords.latitude ),
      //    lng: parseFloat( data.position.coords.longitude ),
      //    message: data.asset.regn
      //  };
      //} );
      //socket_markers.manage($scope.markers);
    }] );

    return app;
  };
} ));
