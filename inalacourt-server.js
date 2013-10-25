#!/bin/env node

var connect = require ( 'connect' )
  , express = require ( 'express' )
  , fs = require ( 'fs' )
  , ejs = require ( 'ejs' )
  , util = require ( 'util' )
  , browser = require ( 'browserify' )
  , path = require ( 'path' )
  , oppressor = require ( 'oppressor' )
  , underscore = require ( 'underscore' )
  , http = require ( 'http' )
  , colors = require ( 'colors' )
  , brfs = require ( 'brfs' )
  , through = require ( 'through' )
  , report = require ( './lib/inalacourt.tracplus.js' )
  , geojson = require ( './lib/inalacourt.geojson.js' )
  , database = require ( './lib/inalacourt.database.js' )
  , georss = require ( './lib/inalacourt.georss.js' )
  , nswData = require ( './data/nsw_data.json' );

var app = express ();

var cross = function ( req, res, next ) {
  res.header ( 'Access-Control-Allow-Origin', '*' );
  res.header ( 'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS' );
  res.header ( 'Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With' );
  if ( 'OPTIONS' == req.method ) {
    res.send ( 200 );
  }
  else {
    next ();
  }
};

app.configure ( function () {
  app.set ( 'port', process.env.PORT || 8080 );
  app.set ( 'views', __dirname + '/views' );
  app.set ( 'view engine', 'ejs' );
  app.use ( cross );
  app.use ( express.favicon () );
  app.use ( express.logger ( 'dev' ) );
  app.use ( express.bodyParser () );
  app.use ( express.methodOverride () );
  app.use ( app.router );
  app.use ( connect.static ( path.join ( __dirname ) ) );
  app.use ( require ( 'less-middleware' ) ( {
    src : path.join ( __dirname, '/less' ), dest : path.join ( __dirname, '/public' )
  } ) );
} );

app.configure ( 'development', function () {
  app.use ( express.errorHandler ( { dumpExceptions : true, showStack : true } ) );
} );

/*
 Browserify libs exposed
 */
var libs = {
  io : {
    library : 'socket.io-browserify',
    options : { expose : 'socket.io' }
  },
  template : {
    library : './lib/inalacourt.template.js',
    options : { expose : 'template' }
  },
  notifications : {
    library : './lib/inalacourt.notifications.js',
    options : { expose : 'notifications' }
  },
  dynamarker : {
    library : './lib/inalacourt.dynamarker.js',
    options : { expose : 'dynamarker' }
  },
  util : {
    library : 'util',
    options : { expose : 'util' }
  }
};

/*
 Routes
 */
app.get ( "/", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render ( 'tracking', {
    title : 'Tracking',
    agent : agent
  } );
} );

app.get ( "/tracking", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render ( 'tracking', {
    title : 'Tracking',
    agent : agent
  } );
} );

app.get ( "/incidents", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.set ( "Content-Type", "application/json" );
  georss ( "http://www.rfs.nsw.gov.au/feeds/majorIncidents.xml" )
    .pipe ( geojson ( req.param ( 'type' ) || "georss" ) )
    .pipe ( res )
} );

app.get ( "/details/:id", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.set ( "Content-Type", "application/json" );
  database ( "reports" )
    .list ( req.params.id )
    .pipe ( geojson ( req.param ( 'type' ) || "points" ) )
    .pipe ( oppressor ( req ) )
    .pipe ( res )
} );

app.get ( "/browserify/load", function ( req, res ) {
  res.set ( "Content-Type", "application/javascript" );
  underscore.inject ( req.param ( 'libs' ) ? req.param ( 'libs' ).split ( ',' ) : underscore.keys ( libs ),
    function ( b, include ) {
      return libs[include].options ?
             b.require ( libs[include].library, libs[include].options ) :
             b.require ( libs[include].library )
    }, browser () )
    .transform ( 'brfs' )
    .bundle ( function ( err, src ) {
    if ( err ) {
      error ( "Browserify Bundle", err )
    }
  } )
    .pipe ( oppressor ( req ) )
    .pipe ( res )
} );

/*
 Create Server
 */
var server = http.createServer ( app ).listen ( app.get ( 'port' ), "0.0.0.0", function () {
  debug ( "inalacourt running", util.inspect ( app ) );
} );

/*
 Object representation of the device report
 */
var extracted = function ( item ) {
  var nsw_data = lookupNswData ( item.assetRegn );
  return {
    identity : item.deviceID,
    asset : {
      type : item.assetType,
      regn : item.assetRegn,
      name : item.assetName,
      make : item.assetMake,
      model : item.assetModel
    },
    telemetry : {
      speed : item.speed,
      track : item.track,
      altitude : item.altitude
    },
    position : {
      coords : {
        latitude : item.latitude,
        longitude : item.longitude
      }
    },
    arena : nsw_data
  };
};

var lookupNswData = function ( regn ) {
  if ( regn.search ( /VH-.../ ) >= 0 ) {
    rego_code = regn.match ( /VH-(...)/ )[1];
    return nswData[ rego_code ];
  }
  if ( regn.search ( /N[0-9]{3}[^ ]* / ) >= 0 ) {
    rego_code = regn.match ( /(N[0-9]{3}[^ ]*) / )[1];
    return nswData[ rego_code ];
  }
  else {
    return null;
  }
}

/*
 Listen for web sockets
 */
var io = require ( 'socket.io' ).listen ( server );
io.set ( 'log level', 1 );
var sockets = io.of ( '/asset' );
sockets.on ( 'connection', function ( socket ) {
  database ( 'reports' ).latest ( function ( err, itm ) {
    socket.emit ( 'position', extracted ( itm ) );
  } );
} );

setInterval ( function () {
  var identity = {
    username : process.env.GATEWAY_USERNAME || "username",
    password : process.env.GATEWAY_PASSWORD || "password"
  };
  report ( identity, function ( err, item ) {
    if ( err ) {
      error ( "Report", err );
    }
    else {
      database ( 'reports' ).put ( item, function ( err, itm ) {
        sockets.emit ( 'position', extracted ( itm ) );
      } );
    }
  } );
}, 10000 );

/**
 * Show red error message in console
 * @param title
 * @param message
 */
var error = function ( title, message ) {
  var fill = "========================================================";
  var line = "==========${title}==========";
  var date = new Date ().toLocaleTimeString ();

  var header = line.replace ( "${title}", " " + title + " " + date + " " );
  var footer = line.replace ( "${title}", fill.substring ( 0, title.length + date.length + 3 ) );

  util.debug ( header.red );
  util.debug ( message.red );
  util.debug ( footer.red );
};

/**
 * Show blue debug message in console
 * @param title
 * @param message
 */
var debug = function ( title, message ) {
  var fill = "========================================================";
  var line = "==========${title}==========";
  var date = new Date ().toLocaleTimeString ();

  var header = line.replace ( "${title}", " " + title + " " + date + " " );
  var footer = line.replace ( "${title}", fill.substring ( 0, title.length + date.length + 3 ) );

  util.debug ( header.blue );
  util.debug ( message.blue );
  util.debug ( footer.blue );
};