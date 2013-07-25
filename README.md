###Meteor Sliding User Session - Meteor Smart Package

This package provides a simple mechanism to manage idle timeouts; it also includes a widget to display currently active sessions. This is a very early release.

More details will be forthcoming, but in simplest terms:

1. Install [meteorite](https://github.com/oortcloud/meteorite)
2. `mrt add slidingSession`

###Configure

Meteor Paginator provides templates and callbacks to easily page your subscribed data, provided you follow the below conventions.

####Put this code in `/lib` at your application's root (so it is accessible by both client and server)

    Meteor.startup(function() {
      Meteor.slidingSession = { 
        augmentUser: function(u, isServer, cb) {
          //do you need to save anything onto the activeSession object (u) before it is written to the database...
          if (isServer) {
            //server side augmentation...just modify u.something = true and you're done
          } else {
            //change u.something = true; then use the cb(u) to send the change...
          }
        }
        , getSessionTimeout: function() {
            return 60 * 90; //number of seconds a user can idle before timeout...(defaults to 90 minutes)
        }
        , getSessionCheckInterval: function() {
            return 30; //interval to check for expired users....used with the {{>active_sessions}} template in the lower right
        }
        , displayActiveSessionStart: function() {
            return "<div class='padding-5'><table class='table table-striped table-condensed'>"; //what header for your active_sessions widget
        }
        , displayActiveSessionEnd: function() {
            return "</table></div>"; //what footer?
        }
        , displayActiveSession: function(activeSession) {
            return "<div>" + Meteor.users.findOne({ _id: activeSession._id }).profile.name + "</div>" //what user specific data to show for this row?
        }
        , displayActiveSessionNotice: function(cnt) {
          return "There are " + cnt + " users online."; //cnt is how many active users...this shows when the widget is collapsed
        }
        , onSessionTimeout: function() {
            setTimeout(function() {
              bootbox.alert("<h3 class='text-info'>Your session has timed out.</h3>");
            }, 750);
        }
        , canUserSeeActiveSessions: function() {
            //return true or false fi the logged in user can see the active sessions
        }
      };
    });