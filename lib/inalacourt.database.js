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
        db.put ( key, item, function ( err, data ) {
          callback ( null, data );
        } );
      },
      list : function ( id ) {
        return db.createReadStream ( {
          start : ( id ? id + '!' : '' ) + '\x00',
          end   : ( id ? id + '!' : '' ) + '\xff'
        } )
      },
      get : function ( key, callback ) {
        db.get ( key, function ( err, data ) {
          callback ( null, data );
        } );
      }
    };
  };

  /*
   return function () {
   console.log( " Template Function Called ... " );
   console.log( arguments.join( ", " ) );
   }
   */

  /*
   var nano = require( 'nano' )( 'http://localhost:5984' );
   var db_name = "places";
   var db = nano.use( db_name );

   //http://localhost:5984/places/_design/main/_spatial/points?bbox=143,-45,160,-35
   nano.db.create( db_name, function () {
   db.insert(
   { "spatial": {
   "points": function ( doc ) {
   if ( doc.geometry.coordinates ) {
   emit( { type: "Point",
   coordinates: [doc.geometry.coordinates[0], doc.geometry.coordinates[1]]
   }, [doc._id, doc.geometry]
   );
   }
   }
   }
   },
   '_design/main',
   function ( err, res ) {
   if ( err ) {
   debug( 'Failure', util.inspect( err ) );
   }
   else {
   debug( 'Success', util.inspect( res ) );
   }
   }
   );
   } );
   */

} ));