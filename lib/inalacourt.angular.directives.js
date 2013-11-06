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
    angular.module ( "leaflet-directive"/*, [ 'nafc-resources' ]*/ )
      .directive ( 'olayers', function ( $log ) {
      return {
        restrict : "E",
        scope : false,
        replace : false,
        transclude : false,
        require : '^leaflet',

        link : function ( $scope, element, attrs, controller ) {

          console.log( "Layers = " + layers )

          controller.getLayers()

          //controller.getMap ().then ( function ( map ) {
          //  L.control.fullscreen ().addTo ( map );
          //} );
        }
      };
    } )
      .directive ( 'olayer', function ( $log ) {
      return {
        restrict : "E",
        scope : false,
        replace : false,
        transclude : false,
        require : '^leaflet',

        link : function ( $scope, element, attrs, controller ) {

          console.log( "Layers = " + layers )

          controller.getLayers()

          //controller.getMap ().then ( function ( map ) {
          //  L.control.fullscreen ().addTo ( map );
          //} );
        }
      };
    } )
      .directive ( 'fullscreen', function ( $log ) {
      return {
        restrict : "E",
        scope : false,
        replace : false,
        transclude : false,
        require : '^leaflet',

        link : function ( $scope, element, attrs, controller ) {
          controller.getMap ().then ( function ( map ) {
            L.control.fullscreen ().addTo ( map );
          } );
        }
      };
    } )
      .directive ( 'scale', function ( $log ) {
      return {
        restrict : "A",
        scope : false,
        replace : false,
        transclude : false,
        require : '^leaflet',

        link : function ( $scope, element, attrs, controller ) {
          controller.getMap ().then ( function ( map ) {
            L.control.scale ().addTo ( map );
          } );
        }
      };
    } )
      .directive ( 'information', function ( $log ) {
      return {
        restrict : "E",
        scope : false,
        replace : false,
        transclude : false,
        require : '^leaflet',

        link : function ( $scope, element, attrs, controller ) {
          controller.getMap ().then ( function ( map ) {
            L.control.information ( attrs ).addTo ( map );
          } );
        }
      };
    } )
      .directive ( 'notifications', function ( $log ) {
      //console.log ( require ( 'util' ).inspect ( "Use Notifications" ) );
      return {
        restrict : "E",
        scope : false,
        replace : false,
        transclude : false,
        require : '^leaflet',

        link : function ( $scope, element, attrs, controller ) {
          controller.getMap ().then ( function ( map ) {
            L.control.notification ( attrs ).addTo ( map );
          } );
        }
      };
    } )/*;
     angular.module ( "nafc-resources", [] ) */
      .directive ( 'dynaMarkers', function () {
      //console.log ( require ( 'util' ).inspect ( "Use Dyna Markers" ) );
      return {
        restrict : "E",
        scope : false,
        replace : false,
        transclude : false,
        require : '^leaflet',

        link : function ( $scope, element, attrs, controller ) {
          console.log ( require ( 'util' ).inspect ( controller ) );
          //socket_markers.manage ( {} );
          //controller.getMap ().then ( function ( map ) {
          //  L.control.scale ().addTo ( map );
          //} );
        }
      };
    } );
  };

} ));