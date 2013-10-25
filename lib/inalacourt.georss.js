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
  var XmlStream = require ( 'xml-stream' );

  var request = "http://www.rfs.nsw.gov.au/feeds/majorIncidents.xml";

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
    var h = through ( function ( data ) {
      this.queue ( data );
    } );
    http.get ( ( url || request ),function ( res ) {
      res.setEncoding ( 'utf8' );
      var xml = new XmlStream ( res );
      xml.collect ( 'georss:polygon' )
      xml.on ( 'endElement: item', function ( item ) {
        h.write ( item );
      } );
      xml.on ( "end", function () {
        h.end ();
      } )
    } ).on ( 'error', function ( err ) {
      cb ( err );
    } );
    return h;
  };

  return report;

} ));