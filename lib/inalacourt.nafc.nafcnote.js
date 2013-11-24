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
      var app = angular.module ( "nafcnote", [] );

      app.factory ( 'socket', function ( $rootScope ) {
        var socket = io.connect ( "/note", { transports : ['websocket'] } );
        return {
          on : function ( eventName, callback ) {
            socket.on ( eventName, function () {
              var args = arguments;
              $rootScope.$apply ( function () {
                callback.apply ( socket, args );
              } );
            } );
          },
          emit : function ( eventName, data, callback ) {
            socket.emit ( eventName, data, function () {
              var args = arguments;
              $rootScope.$apply ( function () {
                if ( callback ) {
                  callback.apply ( socket, args );
                }
              } );
            } );
          }
        };
      } );

      app.directive ( 'stickyNote', function ( socket ) {
        var controller = function ( $scope ) {
          // Incoming
          socket.on ( 'onNoteUpdated', function ( data ) {
            // Update if the same note
            if ( data.id == $scope.note.id ) {
              $scope.note.title = data.title;
              $scope.note.body = data.body;
            }
          } );

          // Outgoing
          $scope.updateNote = function ( note ) {
            socket.emit ( 'updateNote', note );
          };

          $scope.deleteNote = function ( id ) {
            $scope.ondelete ( {
              id : id
            } );
          };

        };
        return {
          restrict : 'AE',
          replace : true,
          scope : {
            note : '=',
            ondelete : '&'
          },
          link : function ( $scope, element, attrs, controller ) {
            element.draggable ( {
              stop : function ( event, ui ) {
                socket.emit ( 'moveNote', {
                  id : $scope.note.id,
                  x : ui.position.left,
                  y : ui.position.top
                } );
              }
            } );

            socket.on ( 'onNoteMoved', function ( data ) {
              // Update if the same note
              if ( data.id == $scope.note.id ) {
                element.animate ( {
                  left : data.x,
                  top : data.y
                } );
              }
            } );

            // Some DOM initiation to make it nice
            element.css ( 'left', '10px' );
            element.css ( 'top', '50px' );
            element.hide ().fadeIn ();

            $scope.updateNote = function ( note ) {
              socket.emit ( 'updateNote', note );
            };

            element.on('blur keyup change', function() {
              $scope.updateNote( $scope.note )
            });
          },
          controller : controller
        }
      } );

      app.controller ( 'NafcNote', function ( $scope, socket ) {
        $scope.notes = [];

        // Incoming
        socket.on ( 'onNoteCreated', function ( data ) {
          $scope.notes.push ( data );
        } );

        socket.on ( 'onNoteDeleted', function ( data ) {
          $scope.handleDeletedNoted ( data.id );
        } );

        // Outgoing
        $scope.createNote = function () {
          var note = {
            id : new Date ().getTime (),
            title : 'New Note',
            body : 'Pending'
          };

          $scope.notes.push ( note );
          socket.emit ( 'createNote', note );
        };

        $scope.deleteNote = function ( id ) {
          $scope.handleDeletedNoted ( id );
          socket.emit ( 'deleteNote', {id : id} );
        };

        $scope.handleDeletedNoted = function ( id ) {
          var oldNotes = $scope.notes,
            newNotes = [];

          angular.forEach ( oldNotes, function ( note ) {
            if ( note.id !== id ) {
              newNotes.push ( note );
            }
          } );

          $scope.notes = newNotes;
        };

      } );

      /*
       app.controller ( "NafcNote",
       [ '$scope', '$location', '$http',
       function ( $scope, $location, $http ) {
       angular.extend ( $scope, {
       notes : []
       } );
       }] );
       */
      return app;
    };
  }
))
;
