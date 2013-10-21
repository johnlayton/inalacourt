var fs = require ( 'fs-extra' )
  , ncp = require ( 'ncp' ).ncp
  , path = require ( 'path' )
  , util = require ( 'util' )
  , _ = require ( 'underscore' );

var env = process.env;
var dev = '../..';
var pub = 'public';
var leaf = env.LEAFLET_PATH || path.join ( dev, pub, 'leaflet' );
var wax = env.WAX_PATH || path.join ( dev, pub, 'wax' );

var paths = {
  remote : [
    { src : path.join ( wax, 'dist' ),
      dest : 'dist' },
    { src : path.join ( leaf, 'Leaflet/dist' ),
      dest : 'dist' },
    { src : path.join ( leaf, 'Leaflet.ajax/dist' ),
      dest : 'dist' },
    { src : path.join ( leaf, 'Leaflet.pip/leaflet-pip.js' ),
      dest : 'dist/leaflet.pip.js' },
    { src : path.join ( leaf, 'Leaflet.fullscreen/Control.Fullscreen.js' ),
      dest : 'dist/leaflet.fullscreen.js' },
    { src : path.join ( leaf, 'Leaflet.fullscreen/Control.Fullscreen.css' ),
      dest : 'dist/leaflet.fullscreen.css' },
    { src : path.join ( leaf, 'Leaflet.fullscreen/icon-fullscreen.png' ),
      dest : 'dist/icon-fullscreen.png' },
    { src : path.join ( leaf, 'Leaflet.markercluster/dist/leaflet.markercluster-src.js' ),
      dest : 'dist/leaflet.markercluster-src.js' },
    { src : path.join ( leaf, 'Leaflet.markercluster/dist/leaflet.markercluster.js' ),
      dest : 'dist/leaflet.markercluster.js' },
    { src : path.join ( leaf, 'Leaflet.markercluster/dist/MarkerCluster.css' ),
      dest : 'dist/leaflet.markercluster.css' },
    { src : path.join ( leaf, 'Leaflet.markercluster/dist/MarkerCluster.Default.css' ),
      dest : 'dist/leaflet.markercluster.default.css' },
    { src : path.join ( leaf, 'Leaflet.markercluster/dist/MarkerCluster.Default.ie.css' ),
      dest : 'dist/leaflet.markercluster.default.ie.css' },
    { src : path.join ( leaf, 'Leaflet.dvf/dist/leaflet-dvf.js' ),
      dest : 'dist/leaflet.dvf.js' },
    { src : path.join ( leaf, 'Leaflet.dvf/dist/css/dvf.css' ),
      dest : 'dist/leaflet.dvf.css' },
    { src : path.join ( leaf, 'Leaflet.draw/dist' ),
      dest : 'dist' },
    { src : path.join ( leaf, 'Leaflet.label/dist' ),
      dest : 'dist' },
    { src : path.join ( leaf, 'Leaflet.hash/leaflet-hash.js' ),
      dest : 'dist/leaflet.hash.js' },
    { src : path.join ( leaf, 'Leaflet.search/leaflet-search.js' ),
      dest : 'dist/leaflet.search.js' },
    { src : path.join ( leaf, 'Leaflet.search/leaflet-search.css' ),
      dest : 'dist/leaflet.search.css' },
    { src : path.join ( leaf, 'Leaflet.search/images' ),
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
        return !file.toString().search(/.js|.png|.css|.jpg/i);
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
