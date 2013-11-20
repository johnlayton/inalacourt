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

      app.directive ( "nafcPlaybackControl", function (leafletData) {
        console.log( leafletData );
        console.log( this );
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

          link : function ( $scope, element, attrs ) {
            console.log( $scope );
             leafletData.getMap ("playback").then ( function ( map ) {
               console.log ( "Got Map ..." );
               console.log ( map );
             } )
          }
        };
      } );

      app.factory ( 'Devices', function ( $resource ) {
        return $resource ( '/devices', { }, { get : { method : 'GET' }, list : { method : 'GET', isArray : true } } );
      } );

      app.factory ( 'Tracks', function ( $resource ) {
        return $resource ( '/tracks?id=:id&type=:type&hours=:hours', { id : '@id', type : '@type', hours : '@hours' }, { get : {method : 'GET'} } );
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

      app.controller ( "Playback",
        function ( $scope, $http, $filter, leafletData, Tracks, Devices ) {
          angular.extend ( $scope, {
            canberra : {
              lat : -35.3075,
              lng : 149.124417,
              zoom : 10
            },
            defaults : {
              scrollWheelZoom : false,
              attributionControl : false,
              tileLayer : "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png",
              tileLayerOptions : {
                opacity : 0.9,
                detectRetina : true,
                attribution : '',
                reuseTiles : true
              }
            },
            current : {},
            playing : false,
            selected : null,
            available : [],
            startDate : new Date(),
            endDate : new Date(),
            position : {
              name: 'Potato Master',
              minAge: 25,
              maxAge: 40
            }
          } );
          $scope.selectAsset = function ( asset ) {
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
                $scope.playback.addTrack ( data );
              } );
            }
          } );
          $scope.$watch ( "current.time", function ( current ) {

          } );
          Devices.list ( { }, function ( data ) {
            $scope.available = data;
          } );
          leafletData.getMap ( "playback" ).then ( function ( map ) {
            $scope.playback = $scope.playback || L.playback ( {
              callback : $scope.setCurrentTime
            } );
            $scope.playback.addTo ( map );
          } );
        } );
      return app;
    };
  }
))
;
