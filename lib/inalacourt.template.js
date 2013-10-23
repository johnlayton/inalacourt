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

  var un = require ( 'underscore' );
  var hg = require ( 'hyperglue' );
  var fs = require ( 'fs' );

  var y_offset = function(data) {
    var types = { unknwon: 0, aircraft : 1, helicopter : 24 };
    var type = data.asset.type ? data.asset.type.toLocaleLowerCase () : "unknown";
    return ( types[ type] ? types[ type] : 1 ) * 28;
  };

  var x_offset = function(data) {
    return 28 + ( Math.floor ( data.telemetry.track / 10 ) * 28 );
  };

  var pos = function ( data ) {
    var s = "background-position: -_x_px -_y_px";
    var x = x_offset( data );
    var y = y_offset( data );
    return s.replace ( /_x_/g, x )
            .replace ( /_y_/g, y );
  };

  var regn = function ( data ) {
    return data.asset.regn;
  };

  var course = function ( data ) {
    return data.telemetry.track;
  };

  var altitude = function ( data ) {
    return data.telemetry.altitude;
  };

  var speed = function ( data ) {
    return data.telemetry.speed;
  };

  var icon = function ( data ) {
    var html = fs.readFileSync ( __dirname + "/../html/markers/_icononly.html" );
    return data ? hg ( html, {
      '.icon' : {
        style : pos ( data )
      }
    } ).outerHTML : 'Missing Properties';
  };

  var call = function ( data ) {
    var html = fs.readFileSync ( __dirname + "/../html/markers/_regnonly.html" );
    return data ? hg ( html, {
      '.icon' : {
        style : pos ( data )
      },
      '.regn' : regn ( data )
    } ).outerHTML : 'Missing Properties';
  };

  var tele = function ( data ) {
    var html = fs.readFileSync ( __dirname + "/../html/markers/_fulltele.html" );
    return data ? hg ( html, {
      '.icon' : {
        style : pos ( data )
      },
      '.regn' : regn ( data ),
      '.altitude' : altitude ( data ),
      '.speed' : speed ( data ),
      '.course' : course ( data )
    } ).outerHTML : 'Missing Properties';
  };

  return {

    /*
    request : function ( identity ) {
      var xml = fs.readFileSync ( __dirname + "/../xml/_request.xml" );
      return xml.toString ()
        .replace ( /_username_/g, identity.username || "" )
        .replace ( /_password_/g, identity.password || "" )
    },
    */

    properties : function ( type, data ) {
      var title = function ( type ) {
        return type;
      }
      var html = fs.readFileSync ( __dirname + "/../html/popups/_properties.html" );
      var arr = un.map ( data, function ( value, key ) {
        return {
          '.type' : key,
          '.definition' : value
        }
      } );
      return data ? hg ( html, {
        '.title' : title ( type ),
        '.item' : arr
      } ).outerHTML : 'Missing Properties';
    },

    markers : function ( zoom, data ) {
      return [
        icon, icon, icon, icon, icon,
        icon, icon, icon, icon, icon,
        icon, call, call, call, call,
        tele, tele, tele, tele, tele
      ][ zoom ] ( data );
    }

  };

} ));