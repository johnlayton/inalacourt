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

    var app = angular.module ( "nafc",
      ['ngRoute', 'uiSlider', 'ui.bootstrap.datetimepicker', 'ui-rangeSlider',
       'incident', 'overview', 'playback', 'victoria', 'broadcast', 'tracking', 'nafcnote'] );

    app.value ( '$anchorScroll', angular.noop );

    app.config ( ['$routeProvider', '$locationProvider', function ( $routeProvider, $locationProvider ) {
      $routeProvider
        .when ( '/', { templateUrl : 'nafc/summary' } )
        .when ( '/overview', { templateUrl : 'nafc/overview' } )
        .when ( '/tracking', { templateUrl : 'nafc/tracking' } )
        .when ( '/playback', { templateUrl : 'nafc/playback' } )
        //.when ( '/incident', { templateUrl : 'nafc/incident' } )
        //.when ( '/victoria', { templateUrl : 'nafc/victoria' } )
        //.when ( '/broadcast', { templateUrl : 'nafc/broadcast' } )
        .when ( '/nafcnote', { templateUrl : 'nafc/nafcnote' } )
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
      }] );

    //app.controller ( 'Position', function ( $scope, socket ) {
    //  socket.on ( 'position', function ( data ) {
    //    $scope.name = data.asset.regn;
    //  } );
    //  //socket.on ( 'send:time', function ( data ) {
    //  //  $scope.time = data.time;
    //  //} );
    //} );

    return app;
  };
} ));
