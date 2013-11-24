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
    var app = angular.module ( "openlyrs", [] );

    app.controller ( "Openlyrs",
      [ '$scope', '$location', '$http',
        function ( $scope, $location, $http ) {
          angular.extend ( $scope, {
          } );

          //var map = new OpenLayers.Map("map");
          //var osm = new OpenLayers.Layer.OSM();
          //
          //map.addLayer(osm);
          //
          //map.zoomToMaxExtent();

          var map = new ol.Map ( {
            target : 'map',
            layers : [
              new ol.layer.Tile ( {
                source: new ol.source.OSM()
              } )
              //new ol.layer.Tile ( {
              //  source : new ol.source.MapQuestOpenAerial ()
              //} )
            ],
            view : new ol.View2D ( {
              center : ol.proj.transform ( [37.41, 8.82], 'EPSG:4326', 'EPSG:3857' ),
              zoom : 4
            } )
          } );

        }] );

    return app;
  };
} ));
