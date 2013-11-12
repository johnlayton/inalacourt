var database = require ( "./../lib/inalacourt.database.js" );
var uuid     = require ( "uuid" );

var db = database ( "test_" + uuid() )

//console.log( require ( 'util' ).inspect ( db ) )

console.log( "------------" )

db.put ( { deviceID : 1, value : "a", transmitted : new Date ( "Tue Nov 09 2013 18:26:10 GMT+1100" ) },
  function ( err, item ) {
    //console.log ( require ( 'util' ).inspect ( err ) )
    //console.log ( require ( 'util' ).inspect ( item ) )
  } );
db.put ( { deviceID : 1, value : "b", transmitted : new Date ( "Tue Nov 10 2013 18:26:10 GMT+1100" ) },
  function ( err, item ) {
    //console.log ( require ( 'util' ).inspect ( err ) )
    //console.log ( require ( 'util' ).inspect ( item ) )
  } );
db.put ( { deviceID : 1, value : "c", transmitted : new Date ( "Tue Nov 11 2013 18:26:10 GMT+1100" ) },
  function ( err, item ) {
    //console.log ( require ( 'util' ).inspect ( err ) )
    //console.log ( require ( 'util' ).inspect ( item ) )
  } );
db.put ( { deviceID : 2, value : "a", transmitted : new Date ( "Tue Nov 09 2013 18:26:10 GMT+1100" ) },
  function ( err, item ) {
    //console.log ( require ( 'util' ).inspect ( err ) )
    //console.log ( require ( 'util' ).inspect ( item ) )
  } );
db.put ( { deviceID : 2, value : "b", transmitted : new Date ( "Tue Nov 09 2013 18:27:10 GMT+1100" ) },
  function ( err, item ) {
    //console.log ( require ( 'util' ).inspect ( err ) )
    //console.log ( require ( 'util' ).inspect ( item ) )
  } );
db.put ( { deviceID : 2, value : "c", transmitted : new Date ( "Tue Nov 12 2013 18:26:10 GMT+1100" ) },
  function ( err, item ) {
    //console.log ( require ( 'util' ).inspect ( err ) )
    //console.log ( require ( 'util' ).inspect ( item ) )
    db.latest ( function ( err, item ) {
      //console.log ( require ( 'util' ).inspect ( err ) )
      console.log ( require ( 'util' ).inspect ( item ) )
    } );
  } );

console.log( "------------" )

