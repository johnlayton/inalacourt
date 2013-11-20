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

    app.controller ( "Overview", [ '$scope', 'socket-markers', 'leafletData', function ( $scope, socketMarkers, leafletData ) {
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
        layers : {
        }
      } );
      leafletData.getMap ( 'overview' ).then ( function ( map ) {

        var b = "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/";
        var f = '/{z}/{x}/{y}.png';
        var g = '/{z}/{y}/{x}.png';

        //var map = L.map ( 'map', {
        //  attributionControl : false
        //} ).setView ( [-37.8, 144.9], 5 );
        //
        var underlays = {
          "arcgis" : L.tileLayer ( b + g, { maxZoom : 18 } ).addTo ( map )
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

        var title = function ( data ) {
          return data.asset.regn;
        };

        var message = function ( previous, current ) {
          return "From [" + previous + "]\nTo [" + current + "]";
        };

        var create_icon = function ( data ) {
          return L.dynaIcon ( { markers : t.markers, data : data } )
        };

        var assets = {};
        //i.connect ( "/asset", { transports : ['websocket'] } )
        //  .on ( 'position', function ( data ) {
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
            marker.addTo ( overlays[ data.asset.type.toLocaleLowerCase ()/*.replace( / /g, '_' )*/ ] );
            //marker.addTo ( layer );
            marker.on ( 'mouseover', function ( e ) {
              map.addLayer ( e.target.options.track =
                             e.target.options.track ||
                             L.geoJson.ajax ( '/details?id=' + data.identity + '&type=linestring&hours=48', { } ) );
            } );
            marker.on ( 'mouseout', function ( e ) {
              map.removeLayer ( e.target.options.track );
            } );
            assets[data.identity] = marker;
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
            }
          }
        } );

        L.control.clusters ( underlays, overlays, { html : t.clustered } ).addTo ( map );
      } );

      socketMarkers.manage ( {} );

    }] );

    return app;
  };
} ));
