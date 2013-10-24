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

  var yOffset = function(data) {
    var types = { unknwon: 0, aircraft : 1, helicopter : 24 };
    var type = data.asset.type ? data.asset.type.toLocaleLowerCase () : "unknown";
    return ( types[ type] ? types[ type] : 1 ) * 28;
  };

  var xOffset = function(data) {
    return 28 + ( Math.floor ( data.telemetry.track / 10 ) * 28 );
  };

  var iconClass = function ( data ) {
    return speed( data ) > 0 ? 'icon active' : 'icon stationary';
  };

  var iconStyle = function ( data ) {
    var s = 'background-position: -_x_px -_y_px;");';
    var x = xOffset( data );
    var y = yOffset( data );
    return s.replace ( /_x_/g, x )
            .replace ( /_y_/g, y );
  };

  var callsign = function ( data ) {
    if( data.arena && data.arena.callsign )
    {
      return data.arena.callsign;
    }
    else if( data.asset.regn && data.asset.regn.search(/ /) >= 0)
    {
      return data.asset.regn.match( /^([^ ]*) /)[1];
    }
    else
    {
      return data.asset.regn;
    }
  };

  var water = function ( data ) {
    var fixedWing = data.asset.type && data.asset.type.toLowerCase() == "aircraft";
    if( data.arena && data.arena.capacity > 0 )
    {
      return ( data.arena.belly_tank || fixedWing ? "Belly tank: " : "Bucket: " ) + data.arena.capacity + " L";
    }
    else
    {
      return "";
    }
  };

  var model = function ( data ) {
    if( data.asset.make )
    {
      return data.asset.make + " " + data.asset.model;
    }
    else
    {
      return "";
    }
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
    if ( data ) {
      var htmlFile = fs.readFileSync ( __dirname + "/../html/markers/_icononly.html" );
      return hg ( htmlFile, {
        '.icon' : {
          style : iconStyle ( data ),
          class: iconClass( data )
        }
      } ).outerHTML;
    } else {
      return 'Missing Properties';
    }
  };

  var call = function ( data ) {
    if ( data ) {
      var htmlFile = fs.readFileSync ( __dirname + "/../html/markers/_regnonly.html" );
      return hg ( htmlFile, {
        '.icon' : {
          style : iconStyle ( data ),
          class: iconClass( data )
        },
        '.callsign' : callsign ( data )
      } ).outerHTML;
    } else {
      return 'Missing Properties';
    }
  };

  var tele = function ( data ) {
    if ( data ) {
      var htmlFile = fs.readFileSync ( __dirname + "/../html/markers/_fulltele.html" );
      return hg ( htmlFile, {
        '.icon' : {
          style : iconStyle ( data ),
          class: iconClass( data )
        },
        '.callsign' : callsign ( data ),
        '.model' : model ( data ),
        '.water' : water ( data )
      } ).outerHTML;
    } else {
      return 'Missing Properties';
    }
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
      var arr = un.map ( data, function ( value, key ) {
        return {
          '.type' : key,
          '.definition' : value
        }
      } );
      if ( data ) {
        var htmlFile = fs.readFileSync ( __dirname + "/../html/popups/_properties.html" );
        return hg( htmlFile, {
          '.title' : title ( type ),
          '.item' : arr
        } ).outerHTML;
      } else {
        return 'Missing Properties';
      }
    },

    markers : function ( zoom, data ) {
      return [
        icon, icon, icon, icon, icon,
        icon, icon, icon, icon, icon,
        call, call, call, tele, tele,
        tele, tele, tele, tele, tele
      ][ zoom ] ( data );
    }

  };

} ));