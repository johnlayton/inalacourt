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
  var sphmerc = new (require ( 'sphericalmercator' ))
    , underscore = require ( 'underscore' );

  return function ( app ) {

    var sourceurl = function ( source, params ) {
      var url = source.host.protocol + "://" + source.host.domain
      if ( source.host.port ) {
        url += ":" + source.host.port
      }
      if ( source.path ) {
        url += "/" + source.path
      }
      if ( source.query ) {
        url += ( "?" + underscore.map ( source.query,function ( value, name ) {
          return "" + name + "=" + value;
        } ).join ( "&" ) )
      }
      if ( params ) {
        url += ( "&" + underscore.map ( params,function ( value, name ) {
          return "" + name + "=" + value;
        } ).join ( "&" ) )
      }
      return url
    }

    var tileurl = function ( name, type ) {
      return "http://localhost:8888/" + name + "/{z}/{x}/{y}." + type
    }

    var jsonurl = function ( name ) {
      return "http://localhost:8888/" + name + ".json"
    }

    var tilespec = function ( name, type ) {
      return {
        id : name,
        scheme : "xyz",
        minzoom : 8,
        maxzoom : 14,
        bounds : [ 138.1641, -41.5086 , 153.6328, -30.1451 ],
        version : "1.0.0",
        center : [
          145.89845,
          -35.82685,
          12
        ],
        tiles : [
          tileurl ( name, type )
        ]
      };
    }

    var params = function ( req, keys, unknown ) {
      return underscore.inject ( keys, function ( value, key ) {
        if ( !value && req.param ( key ) ) {
          return req.param ( key );
        }
        else {
          return value;
        }
      }, unknown ? unknown : '' )
    }

    var parsebox = function ( text ) {
      return text.split ( ',' );
    }

    var bbox = function ( req ) {
      if ( req.param ( 'BBOX' ) ) {
        return parsebox ( req.param ( 'BBOX' ) );
      }
      if ( req.param ( 'bbox' ) ) {
        return parsebox ( req.param ( 'bbox' ) );
      }
      if ( req.param ( 'x' ) && req.param ( 'y' ) && req.param ( 'z' ) ) {
        return sphmerc.bbox ( req.param ( 'x' ), req.param ( 'y' ), req.param ( 'z' ), false, 'WGS84' );
      }
      return []
    }

    var parsetypes = function ( text ) {
      return text.split ( ',' );
    }

    var types = function ( req ) {
      if ( req.param ( 'TYPES' ) ) {
        return parsetypes ( req.param ( 'TYPES' ) );
      }
      if ( req.param ( 'types' ) ) {
        return parsetypes ( req.param ( 'types' ) );
      }
      return []
    }

    underscore.each ( [
      {
        name : 'mapscape',
        source : {
          host : {
            protocol : 'https',
            domain : 'emap.dse.vic.gov.au'
          },
          path : 'ArcGIS/rest/services/mapscape/MapServer/export',
          query : {
            bboxsr : '4326',
            imagesr : '3857',
            size : '256,256',
            format : 'PNG',
            f : 'image',
            transparent : 'true',
            layers : 'show:2'
          }
        }
      }
    ], function ( map ) {
      app.get ( '/' + map.name + '.json', function ( req, res ) {
        res.set ( "Content-Type", "application/json" );
        res.end ( JSON.stringify ( tilespec ( map.name ) ) );
      } );
      app.get ( '/' + map.name + '.jsonp', function ( req, res ) {
        res.set ( "Content-Type", "application/json" );
        res.end ( req.query.callback + "(" + JSON.stringify ( tilespec ( map.name ) ) + ")" );
      } );
      app.get ( '/' + map.name + '/:z/:x/:y.*', function ( req, res ) {
        require ( map.source.host.protocol ).get ( sourceurl ( map.source, { bbox : bbox ( req ) } ),
          function ( agres ) {
            res.set ( "Content-Type", "image/png" );
            agres
              //.pipe( writecache( req ) )
              .pipe ( res );
          } ).on ( 'error', function ( e ) {
          error ( "EMAP Error ", e.message );
          res.send ( 'Tile rendering error: ' + e + '\n' );
          res.close();
        } );
      } );
    } );
  }
} ));