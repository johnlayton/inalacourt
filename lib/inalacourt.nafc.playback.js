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

      //var leaf = angular.module ( "leaflet-directive" );

 /*
      angular.module("leaflet-directive").directive('myLegend', function ($log, leafletHelpers) {
        return {
          restrict: "A",
          scope: false,
          replace: false,
          transclude: false,
          require: 'leaflet',

          link: function(scope, element, attrs, controller) {
            var isArray      = leafletHelpers.isArray,
              leafletScope = controller.getLeafletScope(),
              legend       = leafletScope.legend;

            controller.getMap().then(function(map) {
              if (!isArray(legend.colors) || !isArray(legend.labels) || legend.colors.length !== legend.labels.length) {
                $log.warn("[AngularJS - Leaflet] legend.colors and legend.labels must be set.");
              } else {
                var legendClass = legend.legendClass ? legend.legendClass : "legend";
                var position = legend.position || 'bottomright';
                var leafletLegend = L.control({ position: position });
                leafletLegend.onAdd = function (map) {
                  var div = L.DomUtil.create('div', legendClass);
                  for (var i = 0; i < legend.colors.length; i++) {
                    div.innerHTML +=
                    '<div><i style="background:' + legend.colors[i] + '"></i>' + legend.labels[i] + '</div>';
                  }
                  return div;
                };
                leafletLegend.addTo(map);
              }
            });
          }
        };
      });
*/
      /*
      angular.module("leaflet-directive").directive('myMap', function ($log, leafletHelpers) {
      //leaf.directive ( "myMap", function ($log, $q, leafletData, leafletHelpers, leafletMapDefaults) {
        return {
          restrict: "AE",
          scope: false,
          replace: false,
          transclude: false,
          require: 'leaflet',

          template : '<div>{{ map_id }}</div>',

          link : function ( $scope, element, attrs, controller ) {
            controller.getMap ().then ( function ( map ) {

              console.log ( "Got Map ..." );
              console.log ( map );

              $scope.map_id = map.id;

            } )
          }
        }
      } );
      */

      app.directive ( "nafcPlaybackControl", function () {
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
          //require : 'leaflet',

          //restrict: "A",
          //scope: false,
          //replace: false,
          //transclude: false,
          //require: 'leaflet',

          templateUrl : 'nafc_playback_control.html',

          link : function ( $scope, element, attrs, controller ) {

            /*
            controller.getMap ().then ( function ( map ) {

              console.log ( "Got Map ..." );
              console.log ( map );

            } )
            */

          }
        };
      } );

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

      /*
       app.factory ( 'time', function ( $timeout ) {
       var time = {};

       (function tick () {
       time.now = new Date ().toString ();
       $timeout ( tick, 1000 );
       }) ();
       return time;
       } );
       */

      //app.directive ( "nafcPlaybackControl", function ( Devices ) {
      //  return {
      //    restrict : "AE",
      //    scope : {
      //      toggle : '&',
      //      byType : '&',
      //      select : '&',
      //      current : '=',
      //      playing : '=',
      //      available : '=',
      //      selected : '='
      //    },
      //    require : '^leaflet',
      //    templateUrl : 'nafc_playback_control.html',
      //    link : function ( $scope, element, attrs, $filter ) {
      //
      //      controller.getMap ().then ( function ( map ) {
      //
      //        console.log ( "Got Map ..." );
      //        console.log ( map );
      //
      //      } )
      //
      //    }
      //  };
      //} );

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
            available : []
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
                //leafletData.getMap ( "playback" ).then ( function ( map ) {
                //  ( $scope.playback =
                //    ( $scope.playback ||
                //      L.playback ( { callback : $scope.setCurrentTime } ).addTo ( map ) ) ).addTrack ( data );
                //} );
              } );
            }
          } );
          $scope.$watch ( "current.time", function ( current ) {

          } );
          Devices.list ( { }, function ( data ) {
            $scope.available = data;
          } );
          leafletData.getMap ( "playback" ).then ( function ( map ) {
            $scope.playback = $scope.playback || L.playback ( { callback : $scope.setCurrentTime } );
            $scope.playback.addTo ( map );
          } );
        } );
      return app;
    };
  }
))
;
