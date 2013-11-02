#!/bin/env node

var connect = require ( 'connect' )
  , express = require ( 'express' )
  , fs = require ( 'fs' )
  , fsx = require ( 'fs-extra' )
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
  , jsonstream = require ( 'JSONStream' )
  , report = require ( './lib/inalacourt.tracplus.js' )
  , geojson = require ( './lib/inalacourt.geojson.js' )
  , database = require ( './lib/inalacourt.database.js' )
  , emap = require ( './lib/inalacourt.emap.js' )
  , emap_tiles = require ( './lib/inalacourt.emap.tiles.js' )
  , georss = require ( './lib/inalacourt.georss.js' )
  , esrijson = require ( './lib/inalacourt.esri2json.js' )
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
  information : {
    library : './lib/inalacourt.information.js',
    options : { expose : 'information' }
  },
  application : {
    library : './lib/inalacourt.angular.application.js',
    options : { expose : 'application' }
  },
  incident : {
    library : './lib/inalacourt.angular.incident.js',
    options : { expose : 'incident' }
  },
  overview : {
    library : './lib/inalacourt.angular.overview.js',
    options : { expose : 'overview' }
  },
  terrain : {
    library : './lib/inalacourt.angular.terrain.js',
    options : { expose : 'terrain' }
  },
  victoria : {
    library : './lib/inalacourt.angular.victoria.js',
    options : { expose : 'victoria' }
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
  res.render ( 'application', {
    title : 'NAFC Aircraft Tracking',
    agent : agent
  } );
} );

app.get ( "/nafc/summary", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render ( 'summary', {
    title : 'NAFC Overview',
    agent : agent
  } );
} );

app.get ( "/nafc/overview", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render ( 'overview', {
    title : 'NAFC Overview',
    agent : agent
  } );
} );

app.get ( "/nafc/terrain", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render ( 'terrain', {
    title : 'NAFC Terrain',
    agent : agent
  } );
} );

app.get ( "/nafc/incident", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render ( 'incident', {
    title : 'NAFC Incident Monitoring',
    agent : agent
  } );
} );

app.get ( "/nafc/victoria", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render ( 'victoria', {
    title : 'NAFC State Regional Boundaries',
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
    .pipe ( oppressor ( req ) )
    .pipe ( res )
} );

app.get ( "/regions", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.set ( "Content-Type", "application/json" );
  var handler = through ( function ( data ) {
    this.queue ( JSON.stringify ( data ) );
  } );
  handler
    .pipe ( oppressor ( req ) )
    .pipe ( res )
  //var file = path.join ( "data", req.param ( 'file' ).toString () + ".json" );
  var file = path.join ( "data", "regions.json" );
  handler.write ( esrijson ( fsx.readJsonFileSync ( file ) ) );
  handler.end ();
} );

app.get ( "/details", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.set ( "Content-Type", "application/json" );
  database ( "reports" )
    .list ( ( req.param ( 'id' ) || 1 ), ( req.param ( 'hours' ) || 24 ) )
    .pipe ( geojson ( req.param ( 'type' ) || "points" ) )
    .pipe ( oppressor ( req ) )
    .pipe ( res )
} );

app.get ( "/browserify.js", function ( req, res ) {
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

emap_tiles( app );

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

/*
 https://emap.dse.vic.gov.au/ArcGIS/rest/services/boundaries/MapServer/2/query?where=OBJECTID+%3E+0&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson
            https://emap.dse.vic.gov.au/arcgis/rest/services/incidents/MapServer/0/query?where=OBJECTID+%3E+0&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson
            https://emap.dse.vic.gov.au/arcgis/rest/services/todays_incidents/MapServer/0/query?where=OBJECTID+%3E+0&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson
 Regions -> https://emap.dse.vic.gov.au/ArcGIS/rest/services/boundaries/MapServer/2/query?returnGeometry=true&spatialRel=esriSpatialRelIntersects&where=1+%3d+1&outSR=4326&outFields=*&f=json&
 Burns   -> https://emap.dse.vic.gov.au/ArcGIS/rest/services/phoenix/MapServer/1/query?returnGeometry=true&spatialRel=esriSpatialRelIntersects&where=1+%3d+1&outSR=4326&outFields=*&f=json&
 */

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