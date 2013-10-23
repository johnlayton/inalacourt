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

  var meta = {
    linestring : {
      open : function () {
        return '{ "type" : "Feature", "geometry": { "type" : "LineString", "coordinates": [ ';
      },
      close : function () {
        return ' ] } }';
      },
      data : function ( data ) {
        return [
          data.value.longitude, data.value.latitude
        ];
      }
    },
    points : {
      open : function () {
        return '{ "type": "FeatureCollection", "features": [ ';
      },
      close : function () {
        return ' ] }';
      },
      data : function ( data ) {
        var item = data.value;
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              item.longitude,
              item.latitude
            ]
          },
          properties: {
            speed: item.speed,
            track: item.track,
            altitude: item.altitude
          }
        }
      }
    },
    unknown : {
      open : function () {
        return "[";
      },
      close : function () {
        return "]";
      },
      data : function ( data ) {
        return data.value;
      }
    }
  }

  return function ( type ) {

    var op = ( meta[type] || meta['unknown'] ).open (),
      cl = ( meta[type] || meta['unknown'] ).close (),
      se = ',';

    var stream
      , first = true
      , anyData = false;

    stream = through (
      function ( data ) {
        anyData = true
        var json = JSON.stringify ( ( meta[type] || meta['unknown'] ).data ( data ) );
        if ( first ) {
          first = false;
          stream.queue ( op )
          stream.queue ( json )
        }
        else {
          stream.queue ( se )
          stream.queue ( json )
        }
      },
      function ( data ) {
        if ( !anyData ) {
          stream.queue ( op )
        }
        stream.queue ( cl )
        stream.queue ( null )
      } );

    return stream
  }

} ));