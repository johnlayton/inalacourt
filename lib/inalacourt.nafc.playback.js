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
  var p = require ( "iplayback" );

  return function ( angular ) {
    var app = angular.module ( "playback", ['leaflet-directive', 'ngResource'] );

    app.factory ( 'Devices', function ( $resource ) {
      return $resource ( '/devices', {  }, { /*get : {method : 'GET'},*/ list : { method : 'GET', isArray : true} } );
    } );

    app.factory ( 'Tracks', function ( $resource ) {
      return $resource ( '/tracks?id=:id&type=:type&hours=:hours',
        {
          id : '@id',
          type : '@type',
          hours : '@hours'
        },
        {
          get : {method : 'GET'}
        } );
    } );

    app.directive ( 'myComponent', function () {
      return {
        restrict : 'E',
        scope : {
          /* NOTE: Normally I would set my attributes and bindings
           to be the same name but I wanted to delineate between
           parent and isolated scope. */
          isolatedAttributeFoo : '@attributeFoo',
          isolatedBindingFoo : '=bindingFoo',
          isolatedExpressionFoo : '&'
        }
      };
    } );

    app.directive ( "nafcPlaybackControl", function ( Devices ) {
      return {
        restrict : "AE",
        //replace  : true,
        scope : {
          toggle : '&',
          playing : '=',
          available : '=',
          selected : '='
        },
        templateUrl : 'nafc_playback_control.html',
        link : function ( $scope, element, attrs ) {
        }
      };
    } );

    app.controller ( "Playback",
      function ( $scope, $http, leafletData, Tracks, Devices ) {
        angular.extend ( $scope, {
          melbourne : {
            lat : -37.26,
            lng : 143.86,
            zoom : 4
          },
          canberra : {
            lat : -35.3075,
            lng : 149.124417,
            zoom : 8
          },
          defaults : {
            scrollWheelZoom : false,
            attributionControl : false,
            //tileLayer : "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png",
            tileLayer : "http://localhost:8888/{z}/{x}/{y}.png",
            tileLayerOptions : {
              opacity : 0.9,
              detectRetina : true,
              attribution : '',
              reuseTiles : true
            }
          },
          playing : false,
          selected : null,
          available : [],
          tracks : []
        } );
        $scope.foo = 'Hello!';
        $scope.updateFoo = function ( newFoo ) {
          $scope.foo = newFoo;
        }
        $scope.togglePlayback = function () {
          $scope.playing = !$scope.playing;
          if ( $scope.playback && $scope.playing ) {
            $scope.playback.start ();
          }
          else if ( $scope.playback && !$scope.playing ) {
            $scope.playback.stop ();
          }
          else {
          }
        };
        $scope.$watch ( "selected", function ( asset ) {
          //if ( selected && selected.length > 0 ) {
          //  selected.forEach ( function ( asset ) {
          if ( asset ) {
            Tracks.get ( { id : asset.id, type : 'multipoint', hours : 1000 }, function ( data ) {
              leafletData.getMap ( "playback" ).then ( function ( map ) {
                $scope.playback = $scope.playback || L.playback ( map, [ data ] );
                //$scope.playback.addTracks( [ data ] );
                //$scope.playback.setTracks ( data );
                map.setView( data.geometry.coordinates[0], 10 );
              } );
            } );
            //  } );
          }
        } );
        Devices.list ( { }, function ( data ) {
          $scope.available = data;
          $scope.them = data;
        } );
      } );
    return app;
  };
} ));
