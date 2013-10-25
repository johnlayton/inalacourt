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

  var level = require ( 'level' )
    , path = require ( 'path' )
    , util = require ( 'util' )

  var db;

  return function ( name ) {
    if ( !db ) {
      db = level ( path.join ( 'data', name ), { valueEncoding : 'json' } )
    }
    return {
      put : function ( item, callback ) {
        var key = item.deviceID + "!" + item.transmitted;
        db.get ( key, function ( err, data ) {
          if ( err && err.notFound ) {
            db.put ( key, item, function ( err, itm ) {
              if ( !err ) {
                callback ( null, item );
              }
            } );
          }
        } );
      },
      list : function ( id, hours ) {
        var date = new Date( new Date() - ( 1000 * 60 * 60 * ( hours || 48 ) ) );
        var opts = {
          start : ( id ? id + '!' : '' ) + date.toISOString (),
          end : ( id ? id + '!' : '' ) + '\xff'
        };
        return db.createReadStream ( opts )
      },
      latest : function ( callback ) {
        var current;
        db.createReadStream ( {
          start : '\x00',
          end : '\xff'
        } ).on ( 'data', function ( data ) {
          if ( current && !( current == data.value.deviceID ) ) {
            callback ( null, data.value );
          }
          current = data.value.deviceID;
        } );
      },
      get : function ( key, callback ) {
        db.get ( key, function ( err, data ) {
          callback ( null, data );
        } );
      }
    };
  };
} ));