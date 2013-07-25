var _logout, _observeSession, _lastUserId = null;
Deps.autorun(function () {
    if (Meteor.user()) {
        _lastUserId = Meteor.userId();
        var _checkAugment = window.setInterval(function() {
            if (Meteor.slidingSession && Meteor.userId()) {
                window.clearInterval(_checkAugment);

                //initial load
                Meteor.slidingSession.augmentUser({ _id: Meteor.userId() }, false, function(augmented) {

                    if (!ActiveSessions.findOne(Meteor.userId())) {
                        ActiveSessions.insert(augmented);
                    } else {
                        console.log("user probably has a different tab open with the same login")
                    }

                    //observing now...
                    _observeSession = ActiveSessions.find({ _id: Meteor.userId() }).observe({
                        changed: function (doc) {
                            if (doc.heartbeat === false) {
                                ActiveSessions.update({ _id: Meteor.userId() }, { $set: { heartbeat: true, isActive: false } });
                            }
                        }
                        , removed: function(doc) {
                            //the login tokens have been wiped, and the user should logout
                            window.clearTimeout(_logout);
                            _logout = window.setTimeout(function() {
                                Meteor.user() && Meteor.logout(function() {
                                    _observeSession && _observeSession.stop();
                                     Meteor.slidingSession.onSessionTimeout();
                                });
                            }, 1000);
                        }
                    });

                });
            }
        }, 1000);
    } else if (!Meteor.loggingIn()) {
        console.log("removing session ", _lastUserId);
        ActiveSessions.remove({ _id: _lastUserId });
        console.log("user must be logging out prior to idle timeout OR closing the browser early....so wipe the active session!");
    }
});

var _mmTime;
Meteor.startup(function() {
    var _mm = function(e) {
        window.clearTimeout(_mmTime);
        _mmTime = window.setTimeout(function() {
            ActiveSessions.update({ _id: Meteor.userId() }, { $set: { isActive: true } });
        }, 1000);
    }
    $(document.body).bind("mousemove", _mm);
});

Template.active_sessions.created = function() {
     Deps.autorun(function() {
        console.log("subscribing with client", Session.get(Meteor.slidingSessionActiveUserQuery));
        Meteor.subscribe("activeSessions", Session.get(Meteor.slidingSessionActiveUserQuery));
    });
 };

Template.active_sessions.user = function() {
    return ActiveSessions.find(Session.get(Meteor.slidingSessionActiveUserFilterQuery));
};

Template.active_sessions.displayActiveSessionStart = function() {
    return Meteor.slidingSession && Meteor.slidingSession.displayActiveSessionStart();
};

Template.active_sessions.displayActiveSessionEnd = function() {
    return Meteor.slidingSession && Meteor.slidingSession.displayActiveSessionEnd();
};

Template.active_sessions.displayActiveSession = function(activeSession) {
    return Meteor.slidingSession && Meteor.slidingSession.displayActiveSession(activeSession);
};

Template.active_sessions.notice = function() {
    return Meteor.slidingSession && Meteor.slidingSession.displayActiveSessionNotice(
        ActiveSessions.find(Session.get(Meteor.slidingSessionActiveUserFilterQuery)).count()
    );
};

Template.active_sessions.canUserSeeActiveSessions = function(activeSession) {
    return Meteor.slidingSession && Meteor.slidingSession.canUserSeeActiveSessions(activeSession);
};

Template.active_sessions.events({
    "click .active_sessions_box_switch": function(e, template) {
        var ele = $(e.target), par = $(".active_sessions_box"), toggle = ele.attr("data-toggle-status");
        switch (toggle) {
            case "open":
                ele.html("&#9650").attr("data-toggle-status", "close");
                par.removeClass("active_sessions_box_open").addClass("active_sessions_box_close");
                break;
            case "close":
                ele.html("&#9660").attr("data-toggle-status", "open");
                par.removeClass("active_sessions_box_close").addClass("active_sessions_box_open");
                break;
        }
    }
});