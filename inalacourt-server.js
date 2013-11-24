#!/bin/env node
var connect = require ( 'connect' )
  , express = require ( 'express' )
  , _ = require ( 'lodash' )
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
  , tracplus = require ( './lib/inalacourt.tracplus.js' )
  , geojson = require ( './lib/inalacourt.geojson.js' )
  , reports = require ( './lib/inalacourt.reports.js' )
  , notes = require ( './lib/inalacourt.notes.js' )
  , emap = require ( './lib/inalacourt.emap.js' )
  , emap_tiles = require ( './lib/inalacourt.emap.tiles.js' )
  , georss = require ( './lib/inalacourt.georss.js' )
  , temporal = require("temporal")
  , esrijson = require ( './lib/inalacourt.esri2json.js' );

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
  app.set ( 'port', process.env.PORT || 3000 );
  app.set ( 'username', process.env.GATEWAY_USERNAME || "username" );
  app.set ( 'password', process.env.GATEWAY_PASSWORD || "password" );
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
  util : {
    library : 'util',
    options : { expose : 'util' }
  },
  lodash : {
    library : 'lodash',
    options : { expose : 'lodash' }
  },
  io : {
    library : 'socket.io-browserify',
    options : { expose : 'socket.io' }
  },
  console : {
    library : './lib/inalacourt.console.js',
    options : { expose : 'console' }
  },

  geoutil : {
    library : './lib/inalacourt.leaflet.geoutil.js',
    options : { expose : 'geoutil' }
  },
  notifications : {
    library : './lib/inalacourt.leaflet.notifications.js',
    options : { expose : 'notifications' }
  },
  template : {
    library : './lib/inalacourt.template.js',
    options : { expose : 'template' }
  },
  navigation : {
    library : './lib/inalacourt.leaflet.navigation.js',
    options : { expose : 'navigation' }
  },
  information : {
    library : './lib/inalacourt.leaflet.information.js',
    options : { expose : 'information' }
  },
  iplayback : {
    library : './lib/inalacourt.leaflet.playback.js',
    options : { expose : 'iplayback' }
  },
  dynamarker : {
    library : './lib/inalacourt.leaflet.dynamarker.js',
    options : { expose : 'dynamarker' }
  },
  clusters : {
    library : './lib/inalacourt.leaflet.clusters.js',
    options : { expose : 'clusters' }
  },
  flyover : {
    library : './lib/inalacourt.leaflet.flyover.js',
    options : { expose : 'flyover' }
  },

  extensions : {
    library : './lib/inalacourt.angular.extensions.js',
    options : { expose : 'extensions' }
  },
  directives : {
    library : './lib/inalacourt.angular.directives.js',
    options : { expose : 'directives' }
  },

  services : {
    library : './lib/inalacourt.nafc.services.js',
    options : { expose : 'services' }
  },

  application : {
    library : './lib/inalacourt.nafc.application.js',
    options : { expose : 'application' }
  },

  incident : {
    library : './lib/inalacourt.nafc.incident.js',
    options : { expose : 'incident' }
  },
  nafcnote : {
    library : './lib/inalacourt.nafc.nafcnote.js',
    options : { expose : 'nafcnote' }
  },
  broadcast : {
    library : './lib/inalacourt.nafc.broadcast.js',
    options : { expose : 'broadcast' }
  },
  overview : {
    library : './lib/inalacourt.nafc.overview.js',
    options : { expose : 'overview' }
  },
  tracking : {
    library : './lib/inalacourt.nafc.tracking.js',
    options : { expose : 'tracking' }
  },
  playback : {
    library : './lib/inalacourt.nafc.playback.js',
    options : { expose : 'playback' }
  },
  openlyrs : {
    library : './lib/inalacourt.nafc.openlyrs.js',
    options : { expose : 'openlyrs' }
  },
  victoria : {
    library : './lib/inalacourt.nafc.victoria.js',
    options : { expose : 'victoria' }
  }
};

/*
 Routes
 */

/*
 Nafc
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

app.get ( "/nafc/tracking", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render ( 'tracking', {
    title : 'NAFC Tracking',
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

app.get ( "/nafc/broadcast", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render ( 'broadcast', {
    title : 'NAFC Public Information',
    agent : agent
  } );
} );

app.get ( "/nafc/playback", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render ( 'playback', {
    title : 'NAFC Playback',
    agent : agent
  } );
} );

app.get ( "/nafc/openlyrs", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render ( 'openlyrs', {
    title : 'NAFC Open Layers',
    agent : agent
  } );
} );

app.get ( "/nafc/nafcnote", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render ( 'nafcnote', {
    title : 'NAFC Notes',
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

/*
 Data Feeds
 */
app.get ( "/incidents", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.set ( "Content-Type", "application/json" );
  georss ( "http://www.rfs.nsw.gov.au/feeds/majorIncidents.xml", function ( err ) {
    error ( "Incident Feed Error", util.inspect ( err ) );
  } )
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
  var file = path.join ( "data", "regions.json" );
  handler.write ( esrijson ( fsx.readJsonFileSync ( file ) ) );
  handler.end ();
} );

app.get ( "/details", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.set ( "Content-Type", "application/json" );
  reports ()
    .list ( ( req.param ( 'id' ) || 1 ), req.param ( 'hours' ) )
    .pipe ( geojson ( req.param ( 'type' ) || "points" ) )
    .pipe ( oppressor ( req ) )
    .pipe ( res )
} );

app.get ( "/tracks", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.set ( "Content-Type", "application/json" );
  reports ()
    .list ( ( req.param ( 'id' ) || 1 ), req.param ( 'hours' ) )
    .pipe ( geojson ( req.param ( 'type' ) || "multipoint" ) )
    .pipe ( oppressor ( req ) )
    .pipe ( res )
} );

app.get ( "/devices", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.set ( "Content-Type", "application/json" );
  reports ()
    .latest ()
    .pipe ( req.param ( 'id' ) ? geojson ( "passthrough" ) : geojson ( "identity" ) )
    .pipe ( oppressor ( req ) )
    .pipe ( res )
} );

//emap_data( app );
emap_tiles ( app );

app.get ( "/browserify.js", function ( req, res ) {
  res.set ( "Content-Type", "application/javascript" );
  underscore.inject ( req.param ( 'libs' ) ? req.param ( 'libs' ).split ( ',' ) : underscore.keys ( libs ),
    function ( b, include ) {
      return libs[include].options ?
             b.require ( libs[include].library, libs[include].options ) :
             b.require ( libs[include].library )
    }, browser () )
    .transform ( 'brfs' )
    .bundle ( /*function ( err, src ) {
     if ( err ) {
     console.log( src )
     error ( "Browserify Bundle", err )
     }
     } */ )
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
 Listen for web sockets
 */
var io = require ( 'socket.io' ).listen ( server );
io.set ( 'log level', 1 );

var sockets = io.of ( '/asset' );
io.sockets.on ( 'connection', function ( socket ) {
  reports ().latest ( function ( err, item ) {
    socket.emit ( 'position', item );
  } );
} );

temporal.loop( 10000, function() {
  console.log( "Tracplus Query..." )
  var identity = {
    username : app.get ( "username" ),
    password : app.get ( "password" )
  };
  tracplus ( identity, function ( err, item ) {
    if ( err ) {
      error ( "Report", err );
    }
    else {
      reports ().put ( item, function ( err, item ) {
        io.sockets.emit ( 'position', item );
      } );
    }
  } );
});


io.of ( '/note' ).on ( 'connection', function ( socket ) {

  var toItem = function ( note, date ) {
    return {
      id : note.id,
      date : date,
      note : note
    };
  };

  var toNote = function ( item ) {
    return item.note;
  };

  notes ().latest ( function ( err, item ) {
    socket.emit ( 'onNoteCreated', toNote ( item ) );
    socket.emit ( 'onNoteMoved', toNote ( item ) );
    socket.emit ( 'onNoteUpdated', toNote ( item ) );
  } );

  socket.on ( 'createNote', function ( data ) {
    notes ().put ( toItem ( data, new Date () ), function ( err, item ) {
      socket.broadcast.emit ( 'onNoteCreated', data );
    } );
  } );

  socket.on ( 'updateNote', function ( data ) {
    notes ().current ( data.id , function(err, item) {
      var self = _.clone( item );
      self.title = data.title;
      self.body = data.body;
      notes ().put ( toItem ( self, new Date () ), function ( err, item ) {
        socket.broadcast.emit ( 'onNoteUpdated', item );
      } );
    });
  } );

  socket.on ( 'moveNote', function ( data ) {
    notes ().current ( data.id , function(err, item) {
      var self = _.clone( item );
      self.x = data.x;
      self.y = data.y;
      notes ().put ( toItem ( self, new Date () ), function ( err, item ) {
        socket.broadcast.emit ( 'onNoteUpdated', item );
      } );
    });
  } );

  socket.on ( 'deleteNote', function ( data ) {
    socket.broadcast.emit ( 'onNoteDeleted', data );
  } );
} );
/*
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