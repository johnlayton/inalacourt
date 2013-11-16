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

  var through = require ( 'through' );
  var un = require ( 'underscore' );

  var handlers = {
    linestring : (function () {
      function LineString () {
        this.open = function () {
          return '{ "type" : "Feature", "geometry": { "type" : "LineString", "coordinates": [ ';
        };
        this.data = function ( data ) {

          console.log( data );

          return [
            data.position.coords.longitude,
            data.position.coords.latitude
          ];
        };
        this.close = function () {
          return ' ] } }';
        };
      }

      return {
        create : function () {
          return new LineString ();
        }
      }
    } ()),
    points : (function () {
      function Points () {
        this.open = function () {
          return '{ "type": "FeatureCollection", "features": [ ';
        };
        this.data = function ( data ) {
          var position = data.position;
          var telemetry = data.telemetry;
          return {
            type : "Feature",
            geometry : {
              type : "Point",
              coordinates : [
                position.coords.longitude,
                position.coords.latitude
              ]
            },
            properties : {
              speed : telemetry.speed,
              track : telemetry.track,
              altitude : telemetry.altitude,
              transmitted : new Date ( telemetry.transmitted ).getTime ()
            }
          }
        };
        this.close = function () {
          return ' ] }';
        };
      }

      return {
        create : function () {
          return new Points ();
        }
      }
    } ()),
    georss : (function () {
      function GeoRSS () {
        this.open = function () {
          return '{ "type": "FeatureCollection", "features": [ ';
        };
        this.data = function ( data ) {
          var feature = {
            type : "Feature",
            geometry : {
              type : "GeometryCollection",
              geometries : [ ]
            },
            properties : {
              title       : data.title,
              category    : data.category,
              description : data.description
            }
          };
          if ( data.description ) {
            feature.properties = un.reduce ( data.description.split ( '<br />' ), function ( a, b ) {
              a[b.split ( ':' )[0]] = b.split ( ':' )[1].trim ();
              return a;
            }, feature.properties );
          }
          /*
           if ( data["georss:point"] ) {
           var geom = {
           type : "Point",
           coordinates : [ data["georss:point"].split ( " " )[1],
           data["georss:point"].split ( " " )[0] ]
           };
           feature.geometry.geometries.push ( geom );
           }
           */
          if ( data["georss:polygon"] ) {
            var geom = {
              type : "MultiPolygon",
              coordinates : [ ]
            };
            geom.coordinates.push ( data["georss:polygon"].map ( function ( item ) {
              var i = item.split ( " " ),
                k = [];
              for ( var j = 0; j < i.length; j += 2 ) {
                k.push ( [ i[ j + 1 ], i[j] ] );
              }
              return k;
            } ) );
            feature.geometry.geometries.push ( geom );
          }
          return  feature;
        };
        this.close = function () {
          return ' ] }';
        };
      }

      return {
        create : function () {
          return new GeoRSS ();
        }
      }
    } () ),
    passthough : (function () {
      function Unknown () {
        this.open = function () {
          return "[";
        };
        this.data = function ( data ) {
          return data;
        };
        this.close = function () {
          return "]";
        };
      }

      return {
        create : function () {
          return new Unknown ();
        }
      }
    } ()),
    identity : (function () {
      function Unknown () {
        this.open = function () {
          return "[";
        };
        this.data = function ( data ) {
          return { id: data.identity, name: data.asset.regn, type: data.asset.type };
        };
        this.close = function () {
          return "]";
        };
      }

      return {
        create : function () {
          return new Unknown ();
        }
      }
    } ()),
    multipoint : (function () {
      function MultiPoint () {
        var times = [];
        this.open = function () {
          return '{ "type" : "Feature", "geometry": { "type" : "MultiPoint", "coordinates": [ ';
        };
        this.data = function ( data ) {
          times.push ( new Date ( data.telemetry.transmitted ).getTime () );
          var position = data.position;
          return [
            position.coords.longitude,
            position.coords.latitude
            //data.value.longitude, data.value.latitude
          ];
        };
        this.close = function () {
          return ' ] }, "properties": ' + JSON.stringify ( { time : times } ) + ' }';
        };
      }

      return {
        create : function () {
          return new MultiPoint ();
        }
      }
    } ()),
    unknown : (function () {
      function Unknown () {
        this.open = function () {
          return "[";
        };
        this.data = function ( data ) {
          return data.value;
        };
        this.close = function () {
          return "]";
        };
      }

      return {
        create : function () {
          return new Unknown ();
        }
      }
    } ())
  };

  return function ( type ) {

    var handler = ( handlers[type] || handlers['unknown'] ).create (),
      on = handler.data,
      op = handler.open,
      cl = handler.close,
      se = handler.concat || function() { return ',' };

    var stream
      , first = true
      , anyData = false;

    stream = through (
      function ( data ) {
        anyData = true;
        var json = JSON.stringify ( on ( data ) );
        if ( first ) {
          first = false;
          stream.queue ( op () )
          stream.queue ( json )
        }
        else {
          stream.queue ( se () )
          stream.queue ( json )
        }
      },
      function ( data ) {
        if ( !anyData ) {
          stream.queue ( op () )
        }
        stream.queue ( cl () )
        stream.queue ( null )
      } );

    return stream
  }

} ));