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
    , through = require ( 'through' )
    , path = require ( 'path' )
    , util = require ( 'util' )
    , arena = require ( './inalacourt.arena.nsw.js' );

  var db;

  return function ( name ) {
    if ( !db ) {
      db = level ( path.join ( 'data', name ), { valueEncoding : 'json' } )
    }
    return {
      put : function ( item, callback ) {
        var key = item.deviceID + "!" + new Date ( item.transmitted ).toISOString ();
        db.get ( key, function ( err, data ) {
          if ( err && err.notFound ) {
            db.put ( key, item, function ( err, item ) {
              if ( !err ) {
                callback ( null, arena ( item ) );
              }
            } );
          }
        } );
      },
      list : function ( id, hours ) {
        var date = new Date ( new Date () - ( 1000 * 60 * 60 * ( hours || 48 ) ) );
        var opts = {
          start : ( id ? id + '!' : '' ) + date.toISOString (),
          end : ( id ? id + '!' : '' ) + '\xff'
        };
        return db.createReadStream ( opts )
                 .pipe ( through ( function ( data ) {
                   this.queue ( arena ( data.value ) );
                 } ) );
      },
      latest : function ( callback ) {
        var stream = through ( function ( data ) {
          this.queue ( data );
        } );
        var current = {};
        db.createReadStream ( {
          start : '\x00',
          end : '\xff'
        } ).on ( 'data',function ( data ) {
          if ( current.key && current.value &&
               current.value.deviceID != data.value.deviceID ) {
            stream.write ( arena ( current.value ) );
            if ( callback ) {
              callback ( null, arena ( current.value ) );
            }
          }
          current = {
            key : data.key,
            value : data.value
          };
        } ).on ( 'end',function () {
          if ( callback ) {
            callback ( null, arena ( current.value ) );
          }
          stream.write ( arena ( current.value ) );
          stream.end ();
        } ).on ( 'error', function ( err ) {
          if ( callback ) {
            callback ( err );
          }
        } );

        return stream;
      },
      current : function ( id, callback ) {
        var stream = through ( function ( data ) {
          this.queue ( data );
        } );
        var current = {};
        db.createReadStream ( {
          start : ( id ? id + '!' : '' ) + '\x00',
          end : ( id ? id + '!' : '' ) + '\xff'
        } ).on ( 'data',function ( data ) {
          if ( current.key && current.value &&
               current.value.deviceID != data.value.deviceID ) {
            stream.write ( arena ( current.value ) );
            if ( callback ) {
              callback ( null, arena ( current.value ) );
            }
          }
          current = {
            key : data.key,
            value : data.value
          };
        } ).on ( 'end',function () {
          if ( callback ) {
            callback ( null, arena ( current.value ) );
          }
          stream.write ( arena ( current.value ) );
          stream.end ();
        } ).on ( 'error', function ( err ) {
          if ( callback ) {
            callback ( err );
          }
        } );

        return stream;
      },
      get : function ( key, callback ) {
        db.get ( key, function ( err, data ) {
          callback ( null, arena ( data ) );
        } );
      }
    };
  };
} ));