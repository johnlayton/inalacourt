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
  var _ = require ( "lodash" );

  return function ( angular ) {
    var app = angular.module ( "playback", ['leaflet-directive', 'ngResource'] );

    app.factory ( 'Devices', function ( $resource ) {
      return $resource ( '/devices',
        {
        },
        { /*get : {method : 'GET'},*/
          list : { method : 'GET', isArray : true}
        } );
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

    app.filter ( 'byType', function () {
      return function ( input, type ) {
        var out = [];
        for ( var i = 0; i < input.length; i++ ) {
          if ( input[i].type === type ) {
            out.push ( input[i] );
          }
        }
        return out;
      };
    } );

    app.factory('time', function($timeout) {
      var time = {};

      (function tick() {
        time.now = new Date().toString();
        $timeout(tick, 1000);
      })();
      return time;
    });

    app.directive ( "nafcPlaybackControl", function ( Devices ) {
      return {
        restrict : "AE",
        scope : {
          toggle : '&',
          byType : '&',
          select : '&',
          current : '=',
          playing : '=',
          available : '=',
          selected : '='
        },
        templateUrl : 'nafc_playback_control.html',
        link : function ( $scope, element, attrs, $filter ) {
        }
      };
    } );

    app.controller ( "Playback",
      function ( $scope, $http, $filter, leafletData, Tracks, Devices, time ) {
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
            tileLayer : "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png",
            //tileLayer : "http://localhost:8888/{z}/{x}/{y}.png",
            tileLayerOptions : {
              opacity : 0.9,
              detectRetina : true,
              attribution : '',
              reuseTiles : true
            }
          },
          //current : {},
          playing : false,
          selected : null,
          available : []
        } );
        //$scope.time = time;
        $scope.current = {}
        $scope.select = function ( asset ) {
          $scope.selected = asset;
        };
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
        $scope.setCurrentTime = function ( time ) {
          $scope.current.time = time;
        };
        $scope.$watch ( "selected", function ( selected ) {
          if ( selected ) {
            Tracks.get ( { id : selected.id, type : 'points', hours : 1000 }, function ( data ) {
              leafletData.getMap ( "playback" ).then ( function ( map ) {
                ( $scope.playback =
                  ( $scope.playback ||
                    L.playback ( { callback : $scope.setCurrentTime } ).addTo ( map ) ) ).addTrack ( data );
              } );
            } );
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
