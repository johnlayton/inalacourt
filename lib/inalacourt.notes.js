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
    , util = require ( 'util' );

  var db;

  return function () {
    if ( !db ) {
      db = level ( path.join ( 'data', 'notes' ), { valueEncoding : 'json' } )
    }
    return {
      put : function ( item, callback ) {
        var key = item.id + "!" + new Date ( item.date ).toISOString ();
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
        var start = hours ? new Date ( new Date () - ( 1000 * 60 * 60 * hours ) ).toISOString () : '\x00';
        var end = '\xff';
        var opts = {
          start : ( id ? id + '!' : '' ) + start,
          end : ( id ? id + '!' : '' ) + end
        };
        return db.createReadStream ( opts )
          .pipe ( through ( function ( data ) {
            this.queue ( data.value );
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
               current.value.id != data.value.id ) {
            stream.write ( current.value );
            if ( callback ) {
              callback ( null, current.value );
            }
          }
          current = {
            key : data.key,
            value : data.value
          };
        } ).on ( 'end',function () {
          if ( current && current.value ) {
            if ( callback ) {
              callback ( null, current.value );
            }
            stream.write ( current.value );
          }
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
               current.value.id != data.value.id ) {
            stream.write ( current.value );
            if ( callback ) {
              callback ( null, current.value );
            }
          }
          current = {
            key : data.key,
            value : data.value
          };
        } ).on ( 'end',function () {
          if ( callback ) {
            callback ( null, current.value );
          }
          stream.write ( current.value );
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
          callback ( null, data );
        } );
      }
    };
  };
} ));