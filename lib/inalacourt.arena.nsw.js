(function ( root, factory ) {
  if ( typeof exports === 'object' ) {
    module.exports = factory();
  }
  else if ( typeof define === 'function' && define.amd ) {
    define( [], factory );
  }
  else {
    root.returnExports = factory();
  }
}( this, function () {

  nswData = require ( '../data/nsw_data.json' );

  return function ( item ) {

    //console.log( item )

    var arena = function ( regn ) {
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
    };
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
        altitude : item.altitude,
        transmitted : item.transmitted
      },
      position : {
        coords : {
          latitude : item.latitude,
          longitude : item.longitude
        }
      },
      arena : arena( item.assetRegn )
    };
  };

} ));