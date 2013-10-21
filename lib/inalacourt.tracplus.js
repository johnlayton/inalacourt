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

  var http = require ( 'https' );
  var util = require ( 'util' );
  var XmlStream = require ( 'xml-stream' );

  var request = function ( identity ) {
    var template = "https://service.daestra.com/gateways/georss/gateway.aspx?user=_username_&pw=_password_&hours=6";

    console.log( template );

    var url = template.toString ()
      .replace ( /_username_/g, identity.username || "" )
      .replace ( /_password_/g, identity.password || "" );

    console.log( url );

    return url;
  };

  var report = function ( identity, cb ) {
    http.get ( request ( identity ),function ( res ) {
      res.setEncoding ( 'utf8' );
      new XmlStream ( res ).on ( 'endElement: item', function ( item ) {
        cb ( null, item );
      } );
    } ).on ( 'error', function ( err ) {
      cb ( err );
    } );
  };

  return report;

} ));