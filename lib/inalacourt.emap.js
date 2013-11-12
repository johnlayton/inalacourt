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

  var http = require ( 'http' );
  var util = require ( 'util' );
  var through = require ( 'through' );
  var jsonstream = require ( 'JSONStream' );
  var request = require ( 'request' );

  var template = "https://emap.dse.vic.gov.au/ArcGIS/rest/services/_service_/MapServer/_id_/query?returnGeometry=true&spatialRel=esriSpatialRelIntersects&where=1+%3d+1&outSR=4326&outFields=*&f=json"
  var urls = {
    phoenix : {
      "0" : template.replace ( /_service_/g, 'phoenix' ).replace ( /_id_/g, "0" ),
      "1" : template.replace ( /_service_/g, 'phoenix' ).replace ( /_id_/g, "1" )
    },
    boundaries : {
      "0" : template.replace ( /_service_/g, 'boundaries' ).replace ( /_id_/g, "0" ),
      "1" : template.replace ( /_service_/g, 'boundaries' ).replace ( /_id_/g, "1" ),
      "2" : template.replace ( /_service_/g, 'boundaries' ).replace ( /_id_/g, "2" )
    }
  };

  var handler = function () {

    var op = "[",
      cl = "]",
      se = ',';

    var stream
      , first = true
      , anyData = false;

    stream = through (
      function ( json ) {
        anyData = true;
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

  var report = function ( url, cb ) {
    //var h = through ( function ( data ) {
    //  this.queue ( data );
    //} );
    //http.get ( ( url || urls['phoenix'][0] ),function ( res ) {
    //  res.setEncoding ( 'utf8' );
    //  jsonstream.parse ( [ 'features' ] )
    //} ).on ( 'error', function ( err ) {
    //  cb ( err );
    //} );
    //var data = request ( ( url || urls['phoenix']["1"] ) );

    //console.log ( data )
    request ( ( url || urls['phoenix']["1"] ), function ( error, response, body ) {
      if ( !error && response.statusCode == 200 ) {
        //console.log ( body ) // Print the google web page.
        cb ( body );
      }
    } );

    //return h;
  };

  return report;

} ));