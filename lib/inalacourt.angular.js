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

} ( this, function ( ) {

  var app = angular.module ( "nafc", ['ngRoute', 'leaflet-directive'] );

  app.value ( '$anchorScroll', angular.noop );

  app.config ( ['$routeProvider', '$locationProvider', function ( $routeProvider, $locationProvider ) {
    $routeProvider
      .when ( '/', { templateUrl : 'main' } )
      .when ( '/overview', { templateUrl : 'nafc/overview' } )
      .when ( '/incidents', { templateUrl : 'nafc/incidents' } )
      .otherwise ( {redirectTo : '/'} );
    $locationProvider.hashPrefix ( '!' );
  }] );

  app.controller ( "Main",
    [ '$scope', '$route', '$routeParams', '$location', function ( $scope, $route, $routeParams, $location ) {
      $scope.$watch (
        function () {
          return $location.path ();
        },
        function ( value ) {
          if ( !value ) {
            return;
          }
          var section = value.match ( /^\/([^\/])*/ );
          if ( section.length > 0 ) {
            $scope.activeTab = section[0].replace ( /^\//, "" );
          }
        } );

      $scope.$watch (
        function () {
          return $routeParams.example;
        },
        function ( value ) {
          $scope.exampleTab = $routeParams.example;
        } );
    }] );

  app.controller("Overview", [ '$scope', '$location', function($scope, $location) {
    angular.extend($scope, {
      center: {
        lat: 40.095,
        lng: -3.823,
        zoom: 3
      },
      defaults: {
        scrollWheelZoom: false,
        attributionControl: false,
        tileLayer: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
        tileLayerOptions: {
          opacity: 0.9,
          detectRetina: true,
          reuseTiles: true
        }
      }
    });

    $scope.$on('leafletDirectiveMap.click', function(event){
      $location.path("/");
    });
  }]);

  app.controller("Incidents", [ '$scope', '$location', function($scope, $location) {
    angular.extend($scope, {
      center: {
        lat: -37.095,
        lng: 144.823,
        zoom: 10
      },
      defaults: {
        scrollWheelZoom: false,
        attributionControl: false,
        tileLayer: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
        tileLayerOptions: {
          opacity: 0.9,
          detectRetina: true,
          reuseTiles: true
        }
      }
    });

    $scope.$on('leafletDirectiveMap.click', function(event){
      $location.path("/");
    });
  }]);

  return app;
} ));
