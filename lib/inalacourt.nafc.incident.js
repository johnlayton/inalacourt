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
  return function ( angular ) {
    var app = angular.module ( "incident", ['leaflet-directive'] );

    //app.factory ( 'VicIncidents', function ( $resource ) {
    //  return $resource ( 'eavle/api/e/:id',
    //    {
    //      id : '@id'
    //    },
    //    {
    //      get : {
    //        method : 'GET'
    //      },
    //      query : {
    //        method : 'GET',
    //        params : {
    //          fields : 'id,attributes[NAME,AGENCY,STATUS,REGION,TYPE,TYPE_GROUP,INCIDENT_OF_INTEREST,LATITUDE,LONGITUDE]',
    //          limit : 1000,
    //          criteria : 'INC_ID!=\'\''
    //        },
    //        isArray : false
    //      }
    //    } );
    //} );

    app.factory ( 'Incidents', function ( $http, $timeout ) {
      var incidents = {};
      (function tick () {
        $http.get ( '/incidents' )
          .success ( function ( data, status, headers, config ) {
          console.log ( data );
        } )
          .error ( function ( data, status, headers, config ) {
          console.log ( status );
        } );
        $timeout ( tick, 10000 );
      }) ();

      return incidents;
    } );

    /*
    app.factory ( 'time', function ( $timeout ) {
      var time = {};

      (function tick () {
        time.now = new Date ().toString ();
        $timeout ( tick, 10000 );
      }) ();

      return time;
    } );
    */

    app.factory ( 'Other', function ( $timeout ) {
      var other = {};

      (function tick () {
        other.incidents = [];
        //var number = ( Math.floor ( new Date ().getTime () / 1000 ) % 10 );
        var number = 3;
        for ( var i = 0; i < number; i++ ) {
          other.incidents.push ( {
            name : "Incident [" + i + "]"
          } );
        }
        $timeout ( tick, 100000 );
      }) ();

      return other;
    } );

    app.directive ( "nafcIncidentButton", function () {
      return {
        restrict : "AE",
        scope: {
          incident: '='
        },
        replace : true,
        transclude : false,
        templateUrl : 'nafc_incident_button.html',
        link : function ( $scope, element, attrs ) {
          console.log( $scope  );
        }
      };
    } );

    app.directive ( "nafcIncidentToolbar", function () {
      return {
        restrict : "AE",
        scope: {
          incidents: '='
        },
        replace : true,
        transclude : false,
        templateUrl : 'nafc_incident_toolbar.html',
        link : function ( $scope, element, attrs ) {
          console.log( $scope  );
        }
      };
    } );

    app.controller ( "Incident", [ '$scope', '$http', 'Other', function ( $scope, $http, Other ) {
      angular.extend ( $scope, {
        melbourne : {
          lat : -37.26,
          lng : 143.86,
          zoom : 4
        },
        canberra : {
          lat : -35.3075,
          lng : 149.124417,
          zoom : 8
        },
        other : Other,
        defaults : {
          scrollWheelZoom : false
        }
      } );

      $scope.$watch ( 'other.incidents', function ( incidents ) {
        //console.log ( "Updated Incidents" );
        //console.log ( incidents );
      } );

      //// Get the countries geojson data from a JSON
      //$http.get ( "/incidents" ).success ( function ( data, status ) {
      //  angular.extend ( $scope, {
      //    geojson : {
      //      data : data,
      //      style : {
      //        fillColor : "red",
      //        weight : 2,
      //        opacity : 1,
      //        color : 'white',
      //        dashArray : '3',
      //        fillOpacity : 0.7
      //      }
      //    }
      //  } );
      //} );
    }] );

    return app;
  };
} ));
