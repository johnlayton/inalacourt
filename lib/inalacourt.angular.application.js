(function ( root, factory ) {
  if ( typeof exports === 'object' ) {
    module.exports = factory();
  }
  else if ( typeof define === 'function' && define.amd ) {
    define( [], factory );
  }
  else {
    root.returnExports = factory();
  }
}( this, function () {
  return function ( angular ) {
    var app = angular.module ( "nafc", ['ngRoute', 'incident', 'overview', 'terrain', 'victoria'] );
    app.value ( '$anchorScroll', angular.noop );
    app.config ( ['$routeProvider', '$locationProvider', function ( $routeProvider, $locationProvider ) {
      $routeProvider
        .when ( '/',         { templateUrl : 'nafc/summary' } )
        .when ( '/summary',  { templateUrl : 'nafc/summary' } )
        .when ( '/overview', { templateUrl : 'nafc/overview' } )
        .when ( '/incident', { templateUrl : 'nafc/incident' } )
        .when ( '/victoria', { templateUrl : 'nafc/victoria' } )
        .when ( '/terrain',  { templateUrl : 'nafc/terrain' } )
        .otherwise ( {redirectTo : '/'} );
      $locationProvider.hashPrefix ( '!' );
    }] );
    app.controller ( "Main",
      [ '$scope', '$route', '$routeParams', '$location',
        function ( $scope, $route, $routeParams, $location ) {
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
    return app;
  };
} ));
