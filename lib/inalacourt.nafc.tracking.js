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
    var app = angular.module ( "tracking", ['leaflet-directive'] );

    app.controller ( "Tracking", [ '$scope', '$http', 'leafletData', function ( $scope, $http, leafletData ) {
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
          //tileLayer : "http://localhost:8888/{z}/{x}/{y}.png",
          tileLayerOptions : {
            opacity : 0.9,
            detectRetina : true,
            attribution : '',
            reuseTiles : true
          }
        },
        //layers : {
        //  baselayers : {
        //    osm : {
        //      name : 'ArcGis Online',
        //      type : 'xyz',
        //      url : 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png',
        //      layerOptions : {
        //        continuousWorld : true
        //      }
        //    }
        //  }
        //},
        toggleFlyover : function ( e ) {
          var container = L.DomUtil.get ( 'container' );
          if ( L.DomUtil.hasClass ( container, 'flyover-open' ) ) {
            L.DomUtil.removeClass ( container, 'flyover-open' );
          }
          else {
            L.DomUtil.addClass ( container, 'flyover-open' );
          }
        }
      } );
      leafletData.getMap ().then ( function ( map ) {

        function updateFlyover ( inBoundAssets ) {
          var a;
          var callsign;
          var list = [];
          for ( var key in inBoundAssets ) {
            if ( !inBoundAssets.hasOwnProperty ( key ) ) {
              continue;
            }

            a = inBoundAssets[key];

            callsign = (a.arena && a.arena.callsign) ? a.arena.callsign : a.asset.regn;
            list.push ( "<li>" + callsign + "</li>" );
          }
          list.sort ();

          L.DomUtil.get ( 'flyover-content' ).innerHTML = "<ul>" + list.join ( "" ) + "</ul>";
        }

        map.setView ( [-37.8, 144.9], 5 );

        var arcgis_url = "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png";
        var underlays = {
          "arcgis" : L.tileLayer ( arcgis_url, { maxZoom : 18 } ).addTo ( map )
        };

        var overlays = {
          "fire truck" : new L.LayerGroup (),
          "aircraft" : new L.LayerGroup (),
          "helicopter" : new L.LayerGroup (),
          "passenger vehicle" : new L.LayerGroup (),
          "person" : new L.LayerGroup (),
          "truck" : new L.LayerGroup ()
        };

        var icon = function ( data ) {
          return "http://stocksoftware.com.au/images/logo.png";
        };

        var message = function ( previous, current ) {
          return "From [" + previous + "]\nTo [" + current + "]";
        };

        var title = function ( data ) {
          return data.asset.regn;
        };

        var information = L.control.information ( { template : t } ).addTo ( map );

        function highlightFeature ( layer ) {
          return function highlightFeature ( e ) {
            information.clear ();
          }
        }

        function resetHighlight ( e ) {
          information.clear ();
        }

        var eachFeature = function ( feature, layer ) {
          layer.on ( {
            mouseover : highlightFeature ( feature ),
            mouseout : resetHighlight
          } );
        };

        var color = function ( status ) {
          var statuses = {
            'out_of_control' : 'red',
            'being_controlled' : 'grey',
            'under_control' : 'lightgreen'
          };
          return statuses[status] || 'black';
        };

        var style = function ( feature ) {
          var status = ( feature.properties['STATUS'] || "Unknown" ).toLocaleLowerCase ().replace ( /\ /g, '_' );
          return {
            fillColor : color ( status ),
            weight : 2,
            opacity : 1,
            color : 'black',
            dashArray : '3',
            fillOpacity : 0.7
          };
        };

        var panTo = function ( marker ) {
          return function () {
            map.panTo ( marker.getLatLng (), {
              pan : { animate : true },
              zoom : { animate : true }
            } );
          }
        };

        L.geoJson.ajax ( '/incidents', {
          style : style,
          onEachFeature : eachFeature
        } ).addTo ( map );

        var layer = L.layerGroup ( [] );

        var assets = {};
        var bounds = map.getBounds ();
        var inBounds = {};
        //var asset = i.connect ( "/asset", { transports : ['websocket'] } );

        io.connect ().on ( 'position', function ( data ) {
          var marker;
          var position = L.latLng ( data.position.coords.latitude, data.position.coords.longitude );
          if ( !assets[data.identity] ) {
            marker = L.dynaMarker ( position, {
              title : title ( data ),
              template : t.markers,
              data : { properties : data },
              icon : L.divIcon ( {
                iconAnchor : [ 14, 14 ],
                className : 'leaflet-div-icon',
                html : t.markers ( map.getZoom (), data )
              } )
            } );
            //marker.addTo ( overlays[ data.asset.type.toLocaleLowerCase ()/*.replace( / /g, '_' )*/ ] );
            marker.addTo ( layer );
            marker.on ( 'mouseover', function ( e ) {
              map.addLayer ( e.target.options.track =
                             e.target.options.track ||
                             L.geoJson.ajax ( '/details?id=' + data.identity + '&type=linestring&hours=48', { } ) );
              information.update ( "asset", L.extend ( {}, data.asset, data.arena ) );
            } );
            marker.on ( 'mouseout', function ( e ) {
              map.removeLayer ( e.target.options.track );
              information.clear ();
            } );
            assets[data.identity] = marker;
            updateInBounds ( data.identity, marker, position );
            updateFlyover ( inBounds );
          }
          else {
            var marker = assets[data.identity];
            if ( marker.getLatLng ().lat != position.lat ||
                 marker.getLatLng ().lng != position.lng ) {
              map.notification ( icon ( data ), title ( data ),
                message ( marker.getLatLng (), position ), null, null,
                panTo ( marker ) );
              if ( marker.options.track ) {
                marker.options.track.refresh ();
              }
              marker.setLatLng ( position )
              marker.setData ( { properties : data } );
              updateInBounds ( data.identity, marker, position );
              updateFlyover ( inBounds );
            }
          }
        } );

        layer.addTo ( map );
        //L.control.clusters ( underlays, overlays, { html : t.clustered } ).addTo ( map );
        L.control.notification ().addTo ( map );
        L.control.fullscreen ().addTo ( map );
        L.control.scale ( { imperial : false } ).addTo ( map );
        //L.control.search ( {layer : layer, initial : false} ).addTo ( map );
        //L.hash ( map );

        var updateInBounds = function ( assetKey, assetMarker, pos ) {
          if ( bounds.contains ( pos ) ) {
            inBounds[assetKey] = assetMarker.options.data.properties;
          }
          else {
            delete inBounds[assetKey];
          }
        };

        var resetBounds = function () {
          bounds = map.getBounds ();
          var a;

          for ( var key in assets ) {
            if ( !assets.hasOwnProperty ( key ) ) {
              continue;
            }

            a = assets[key];
            updateInBounds ( key, a, a.getLatLng () );
          }

          updateFlyover ( inBounds );
        };

        map.on ( "move", function () {
          resetBounds ()
        } );
        map.on ( "zoom", function () {
          resetBounds ()
        } );
      } );
    } ] );

    return app;
  };
} ))
;
