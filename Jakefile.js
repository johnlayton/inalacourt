var fs = require ( 'fs-extra' )
  , ncp = require ( 'ncp' ).ncp
  , path = require ( 'path' )
  , util = require ( 'util' )
  , _ = require ( 'underscore' );

var env = process.env;
var dev = '../..';
var pub = 'public';
var leaf = env.LEAFLET_PATH || path.join ( dev, pub, 'leaflet' );

var paths = {
  remote : [
    { src : path.join ( leaf, 'leaflet/dist' ),
      dest : 'dist' },
    { src : path.join ( leaf, 'leaflet.ajax/dist' ),
      dest : 'dist' },
    { src : path.join ( leaf, 'leaflet.pip/leaflet-pip.js' ),
      dest : 'dist/leaflet.pip.js' },
    { src : path.join ( leaf, 'leaflet.fullscreen/Control.Fullscreen.js' ),
      dest : 'dist/leaflet.fullscreen.js' },
    { src : path.join ( leaf, 'leaflet.fullscreen/Control.Fullscreen.css' ),
      dest : 'dist/leaflet.fullscreen.css' },
    { src : path.join ( leaf, 'leaflet.fullscreen/icon-fullscreen.png' ),
      dest : 'dist/icon-fullscreen.png' },
    { src : path.join ( leaf, 'leaflet.markercluster/dist/leaflet.markercluster-src.js' ),
      dest : 'dist/leaflet.markercluster-src.js' },
    { src : path.join ( leaf, 'leaflet.markercluster/dist/leaflet.markercluster.js' ),
      dest : 'dist/leaflet.markercluster.js' },
    { src : path.join ( leaf, 'leaflet.markercluster/dist/MarkerCluster.css' ),
      dest : 'dist/leaflet.markercluster.css' },
    { src : path.join ( leaf, 'leaflet.markercluster/dist/MarkerCluster.Default.css' ),
      dest : 'dist/leaflet.markercluster.default.css' },
    { src : path.join ( leaf, 'leaflet.markercluster/dist/MarkerCluster.Default.ie.css' ),
      dest : 'dist/leaflet.markercluster.default.ie.css' },
    { src : path.join ( leaf, 'leaflet.dvf/dist/leaflet-dvf.js' ),
      dest : 'dist/leaflet.dvf.js' },
    { src : path.join ( leaf, 'leaflet.dvf/dist/css/dvf.css' ),
      dest : 'dist/leaflet.dvf.css' },
    { src : path.join ( leaf, 'leaflet.draw/dist' ),
      dest : 'dist' },
    { src : path.join ( leaf, 'leaflet.label/dist' ),
      dest : 'dist' },
    { src : path.join ( leaf, 'leaflet.hash/leaflet-hash.js' ),
      dest : 'dist/leaflet.hash.js' },
    { src : path.join ( leaf, 'leaflet.search/leaflet-search.js' ),
      dest : 'dist/leaflet.search.js' },
    { src : path.join ( leaf, 'leaflet.search/leaflet-search.css' ),
      dest : 'dist/leaflet.search.css' },
    { src : path.join ( leaf, 'leaflet.search/images' ),
      dest : 'dist/images' }
  ],
  local : [
    path.join ( path.join ( dev, '/home' ), 'janstreet/dist' )
  ]
};

desc ( 'Copy resources into dist' );
task ( 'build', function () {
  _.each ( paths[env.ENV || 'remote'], function ( files ) {
    fs.copy ( path.join ( files.src ), path.join ( __dirname, files.dest ),
      function ( file ) {
        return file.toString().search(/\.js|\.png|\.css|\.jpg/);
      },
      function ( err ) {
        if ( err ) {
          util.debug ( "Problem with [" + files.src + "] - " + util.inspect ( err, false, 10 ) );
        }
        else {
          console.log ( "Added " + files.src + " to/as " + path.join ( __dirname, files.dest ) )
        }
      } );
  } );
} )

task ( 'default', ['build'] );
