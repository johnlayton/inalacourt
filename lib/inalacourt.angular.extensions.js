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

    // Determine if a reference is defined
    function isDefined ( value ) {
      return angular.isDefined ( value );
    }

    // Determine if a reference is defined and not null
    function isDefinedAndNotNull ( value ) {
      return angular.isDefined ( value ) && value !== null;
    }

    // Determine if a reference is a number
    function isNumber ( value ) {
      return angular.isNumber ( value );
    }

    // Determine if a reference is a string
    function isString ( value ) {
      return angular.isString ( value );
    }

    // Determine if a reference is an array
    function isArray ( value ) {
      return angular.isArray ( value );
    }

    // Determine if a reference is an object
    function isObject ( value ) {
      return angular.isObject ( value );
    }

    // Determine if two objects have the same properties
    function equals ( o1, o2 ) {
      return angular.equals ( o1, o2 );
    }

    function safeApply ( $scope, fn ) {
      var phase = $scope.$root.$$phase;
      if ( phase === '$apply' || phase === '$digest' ) {
        $scope.$eval ( fn );
      }
      else {
        $scope.$apply ( fn );
      }
    }

    // Get the mapDefaults dictionary, and override the properties defined by the user
    function parseMapDefaults ( defaults ) {
      var mapDefaults = _getMapDefaults ();

      if ( isDefined ( defaults ) ) {
        mapDefaults.maxZoom = isDefined ( defaults.maxZoom ) ? parseInt ( defaults.maxZoom, 10 ) : mapDefaults.maxZoom;
        mapDefaults.minZoom = isDefined ( defaults.minZoom ) ? parseInt ( defaults.minZoom, 10 ) : mapDefaults.minZoom;
        mapDefaults.doubleClickZoom =
        isDefined ( defaults.doubleClickZoom ) ? defaults.doubleClickZoom : mapDefaults.doubleClickZoom;
        mapDefaults.scrollWheelZoom =
        isDefined ( defaults.scrollWheelZoom ) ? defaults.scrollWheelZoom : mapDefaults.doubleClickZoom;
        mapDefaults.zoomControl = isDefined ( defaults.zoomControl ) ? defaults.zoomControl : mapDefaults.zoomControl;
        mapDefaults.attributionControl =
        isDefined ( defaults.attributionControl ) ? defaults.attributionControl : mapDefaults.attributionControl;
        mapDefaults.tileLayer = isDefined ( defaults.tileLayer ) ? defaults.tileLayer : mapDefaults.tileLayer;
        mapDefaults.zoomControlPosition =
        isDefined ( defaults.zoomControlPosition ) ? defaults.zoomControlPosition : mapDefaults.zoomControlPosition;
        mapDefaults.keyboard = isDefined ( defaults.keyboard ) ? defaults.keyboard : mapDefaults.keyboard;
        mapDefaults.dragging = isDefined ( defaults.dragging ) ? defaults.dragging : mapDefaults.dragging;

        if ( isDefined ( defaults.tileLayerOptions ) ) {
          angular.copy ( defaults.tileLayerOptions, mapDefaults.tileLayerOptions );
        }
      }
      return mapDefaults;
    }

    function _getMapDefaults () {
      return {
        maxZoom : 14,
        minZoom : 1,
        keyboard : true,
        dragging : true,
        doubleClickZoom : true,
        scrollWheelZoom : true,
        zoomControl : true,
        attributionControl : true,
        zoomsliderControl : false,
        zoomControlPosition : 'topleft',
        controlLayersPosition : 'topright',
        tileLayer : 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        tileLayerOptions : {
          attribution : '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        },
        icon : {
          url : 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-icon.png',
          retinaUrl : 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-icon-2x.png',
          size : [25, 41],
          anchor : [12, 40],
          popup : [0, -40],
          shadow : {
            url : 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-shadow.png',
            retinaUrl : 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-shadow.png',
            size : [41, 41],
            anchor : [12, 40]
          }
        },
        path : {
          weight : 10,
          opacity : 1,
          color : '#0000ff'
        },
        center : {
          lat : 0,
          lng : 0,
          zoom : 1
        }
      };
    }
/*
    angular.module ( "leaflet-directive" )
      .directive ( 'myDirective', function ( $log, leafletData ) {
      return {
        restrict : "A",
        scope: {
          propName: "=myDirective"
        },
        //scope : true,
        replace : false,
        transclude : false,
        require : '^leaflet',
        //require: 'leaflet',
        controller : function ( $scope ) {
          this.getLayers = function () {
            return $scope.leafletLayers;
          };
        },
        link : function ( $scope, element, attrs, controller ) {
          console.log( $scope )
        }
      };
    });
*/
    angular.module ( "leaflet-directive" )
      .directive ( 'ilayers', function ( $log, leafletData ) {
      return {
        restrict : "E",
        scope : true,
        replace : false,
        transclude : false,
        require : '^leaflet',
        //require: 'leaflet',
        controller : function ( $scope ) {
          this.getLayers = function () {
            return $scope.leafletLayers;
          };
        },
        link : function ( $scope, element, attrs, controller ) {
          var defaults = parseMapDefaults ( $scope.defaults );
          var layers = $scope.layers;
          controller.getMap ().then ( function ( map ) {
            setupLayers ( map, layers, defaults );
            function setupLayers ( map, layers, defaults ) {
              if ( isDefined ( layers ) ) {
                // Do we have a baselayers property?
                if ( !isDefined ( layers.baselayers ) || Object.keys ( $scope.layers.baselayers ).length <= 0 ) {
                  // No baselayers property
                  $log.error ( '[AngularJS - Leaflet] At least one baselayer has to be defined' );
                  return;
                }
                // We have baselayers to add to the map
                $scope.leafletLayers = {};
                leafletData.setLayers ( $scope.leafletLayers, attrs.id );

                $scope.leafletLayers.baselayers = {};
                $scope.leafletLayers.controls = {};
                $scope.leafletLayers.controls.layers = new L.control.navigation ();
                $scope.leafletLayers.controls.layers.setPosition ( defaults.controlLayersPosition );
                $scope.leafletLayers.controls.layers.addTo ( map );

                // Setup all baselayers definitions
                var top = false;
                for ( var layerName in layers.baselayers ) {
                  var newBaseLayer = createLayer ( layers.baselayers[layerName] );
                  if ( newBaseLayer !== null ) {
                    $scope.leafletLayers.baselayers[layerName] = newBaseLayer;
                    // Only add the visible layer to the map, layer control manages the addition to the map
                    // of layers in its control
                    if ( layers.baselayers[layerName].top === true ) {
                      map.addLayer ( $scope.leafletLayers.baselayers[layerName] );
                      top = true;
                    }
                    $scope.leafletLayers.controls.layers.addBaseLayer ( $scope.leafletLayers.baselayers[layerName],
                      layers.baselayers[layerName].name );
                  }
                }
                // If there is no visible layer add first to the map
                if ( !top && Object.keys ( $scope.leafletLayers.baselayers ).length > 0 ) {
                  map.addLayer ( $scope.leafletLayers.baselayers[Object.keys ( layers.baselayers )[0]] );
                }
                // Setup the Overlays
                $scope.leafletLayers.overlays = {};
                for ( layerName in layers.overlays ) {
                  var newOverlayLayer = createLayer ( layers.overlays[layerName] );
                  if ( newOverlayLayer !== null ) {
                    $scope.leafletLayers.overlays[layerName] = newOverlayLayer;
                    // Only add the visible layer to the map, layer control manages the addition to the map
                    // of layers in its control
                    if ( layers.overlays[layerName].visible === true ) {
                      map.addLayer ( $scope.leafletLayers.overlays[layerName] );
                    }
                    $scope.leafletLayers.controls.layers.addOverlay ( $scope.leafletLayers.overlays[layerName],
                      layers.overlays[layerName].name );
                  }
                }

                // Watch for the base layers
                $scope.$watch ( 'layers.baselayers', function ( newBaseLayers ) {
                  // Delete layers from the array
                  for ( var name in $scope.leafletLayers.baselayers ) {
                    if ( newBaseLayers[name] === undefined ) {
                      // Remove the layer from the control
                      $scope.leafletLayers.controls.layers.removeLayer ( $scope.leafletLayers.baselayers[name] );
                      // Remove from the map if it's on it
                      if ( map.hasLayer ( $scope.leafletLayers.baselayers[name] ) ) {
                        map.removeLayer ( $scope.leafletLayers.baselayers[name] );
                      }
                      delete $scope.leafletLayers.baselayers[name];
                    }
                  }
                  // add new layers
                  for ( var new_name in newBaseLayers ) {
                    for ( var new_name in newBaseLayers ) {
                      if ( $scope.leafletLayers.baselayers[new_name] === undefined ) {
                        var testBaseLayer = createLayer ( newBaseLayers[new_name] );
                        if ( testBaseLayer !== null ) {
                          $scope.leafletLayers.baselayers[new_name] = testBaseLayer;
                          // Only add the visible layer to the map, layer control manages the addition to the map
                          // of layers in its control
                          if ( newBaseLayers[new_name].top === true ) {
                            map.addLayer ( $scope.leafletLayers.baselayers[new_name] );
                          }
                          $scope.leafletLayers.controls.layers.addBaseLayer ( $scope.leafletLayers.baselayers[new_name],
                            newBaseLayers[new_name].name );
                        }
                      }
                    }
                    if ( Object.keys ( $scope.leafletLayers.baselayers ).length <= 0 ) {
                      // No baselayers property
                      $log.error ( '[AngularJS - Leaflet] At least one baselayer has to be defined' );
                    }
                    else {
                      //we have layers, so we need to make, at least, one active
                      var found = false;
                      // serach for an active layer
                      for ( var key in $scope.leafletLayers.baselayers ) {
                        if ( map.hasLayer ( $scope.leafletLayers.baselayers[key] ) ) {
                          found = true;
                          break;
                        }
                      }
                      // If there is no active layer make one active
                      if ( !found ) {
                        map.addLayer ( $scope.leafletLayers.baselayers[Object.keys ( layers.baselayers )[0]] );
                      }
                    }
                  }
                }, true );

                // Watch for the overlay layers
                $scope.$watch ( 'layers.overlays', function ( newOverlayLayers ) {
                  // Delete layers from the array
                  for ( var name in $scope.leafletLayers.overlays ) {
                    if ( newOverlayLayers[name] === undefined ) {
                      // Remove the layer from the control
                      $scope.leafletLayers.controls.layers.removeLayer ( $scope.leafletLayers.overlays[name] );
                      // Remove from the map if it's on it
                      if ( map.hasLayer ( $scope.leafletLayers.overlays[name] ) ) {
                        map.removeLayer ( $scope.leafletLayers.overlays[name] );
                      }
                      // TODO: Depending on the layer type we will have to delete what's included on it
                      delete $scope.leafletLayers.overlays[name];
                    }
                  }
                  // add new layers
                  for ( var new_name in newOverlayLayers ) {
                    if ( $scope.leafletLayers.overlays[new_name] === undefined ) {
                      var testOverlayLayer = createLayer ( newOverlayLayers[new_name] );
                      if ( testOverlayLayer !== null ) {
                        $scope.leafletLayers.overlays[new_name] = testOverlayLayer;
                        $scope.leafletLayers.controls.layers.addOverlay ( $scope.leafletLayers.overlays[new_name],
                          newOverlayLayers[new_name].name );
                        if ( newOverlayLayers[new_name].visible === true ) {
                          map.addLayer ( $scope.leafletLayers.overlays[new_name] );
                        }
                      }
                    }
                  }
                }, true );
              }
            }

            function createLayer ( layerDefinition ) {
              // Check if the baselayer has a valid type
              if ( !isString ( layerDefinition.type ) ) {
                $log.error ( '[AngularJS - Leaflet] A base layer must have a type' );
                return null;
              }
              else if ( layerDefinition.type !== 'xyz' && layerDefinition.type !== 'wms' &&
                        layerDefinition.type !== 'group' && layerDefinition.type !== 'markercluster' &&
                        layerDefinition.type !== 'google' && layerDefinition.type !== 'bing' ) {
                $log.error ( '[AngularJS - Leaflet] A layer must have a valid type: "xyz, wms, group, google"' );
                return null;
              }
              if ( layerDefinition.type === 'xyz' || layerDefinition.type === 'wms' ) {
                // XYZ, WMS must have an url
                if ( !isString ( layerDefinition.url ) ) {
                  $log.error ( '[AngularJS - Leaflet] A base layer must have an url' );
                  return null;
                }
              }
              if ( !isString ( layerDefinition.name ) ) {
                $log.error ( '[AngularJS - Leaflet] A base layer must have a name' );
                return null;
              }
              if ( layerDefinition.layerParams === undefined || layerDefinition.layerParams === null ||
                   typeof layerDefinition.layerParams !== 'object' ) {
                layerDefinition.layerParams = {};
              }
              if ( layerDefinition.layerOptions === undefined || layerDefinition.layerOptions === null ||
                   typeof layerDefinition.layerOptions !== 'object' ) {
                layerDefinition.layerOptions = {};
              }
              // Mix the layer specific parameters with the general Leaflet options. Although this is an overhead
              // the definition of a base layers is more 'clean' if the two types of parameters are differentiated
              var layer = null;
              for ( var attrname in layerDefinition.layerParams ) {
                layerDefinition.layerOptions[attrname] = layerDefinition.layerParams[attrname];
              }
              switch ( layerDefinition.type ) {
                case 'xyz':
                  layer = createXyzLayer ( layerDefinition.url, layerDefinition.layerOptions );
                  break;
                case 'wms':
                  layer = createWmsLayer ( layerDefinition.url, layerDefinition.layerOptions );
                  break;
                case 'group':
                  layer = createGroupLayer ();
                  break;
                case 'markercluster':
                  layer = createMarkerClusterLayer ( layerDefinition.layerOptions );
                  break;
                case 'google':
                  layer = createGoogleLayer ( layerDefinition.layerType, layerDefinition.layerOptions );
                  break;
                case 'bing':
                  layer = createBingLayer ( layerDefinition.bingKey, layerDefinition.layerOptions );
                  break;
                default:
                  layer = null;
              }

              //TODO Add $watch to the layer properties

              return layer;
            }

            function createXyzLayer ( url, options ) {
              var layer = L.tileLayer ( url, options );
              return layer;
            }

            function createWmsLayer ( url, options ) {
              var layer = L.tileLayer.wms ( url, options );
              return layer;
            }

            function createGroupLayer () {
              var layer = L.layerGroup ();
              return layer;
            }

            function createMarkerClusterLayer ( options ) {
              if ( Helpers.MarkerClusterPlugin.isLoaded () ) {
                var layer = new L.MarkerClusterGroup ( options );
                return layer;
              }
              else {
                return null;
              }
            }

            function createGoogleLayer ( type, options ) {
              type = type || 'SATELLITE';
              if ( Helpers.GoogleLayerPlugin.isLoaded () ) {
                var layer = new L.Google ( type, options );
                return layer;
              }
              else {
                return null;
              }
            }

            function createBingLayer ( key, options ) {
              if ( Helpers.BingLayerPlugin.isLoaded () ) {
                var layer = new L.BingLayer ( key, options );
                return layer;
              }
              else {
                return null;
              }
            }
          } );
        }
      };
    } );

    angular.module ( "leaflet-directive" )
      .directive ( 'ilayer', function ( $log, leafletData ) {
      return {
        restrict : "E",
        scope : true,
        replace : false,
        transclude : false,
        require : 'ilayer',
        controller : function ( $scope ) {
          this.getLayers = function () {
            return $scope.leafletLayers;
          };
        },
        link : function ( $scope, element, attrs, controller ) {
          var defaults = parseMapDefaults ( $scope.defaults );
          var layers = $scope.layers;
          //console.log ( attrs );
          //console.log ( $scope );
          //console.log ( layers );
        }
      };
    } );
  };
} ) );