var _logout, _observeSession, _lastUserId = null;
Deps.autorun(function () {
    if (Meteor.user()) {
        _lastUserId = Meteor.userId();
        var _checkAugment = window.setInterval(function() {
            if (Meteor.slidingSession && Meteor.userId()) {
                window.clearInterval(_checkAugment);

                //initial load
                Meteor.slidingSession.augmentUser({ _id: Meteor.userId() }, false, function(augmented) {

                    console.log("want to insert ", augmented);
                    if (!ActiveSessions.findOne(Meteor.userId())) {
                        console.log("inserted!");
                        ActiveSessions.insert(augmented);
                    }

                    //observing now...
                    _observeSession = ActiveSessions.find({ _id: Meteor.userId() }).observe({
                        changed: function (doc) {
                            if (doc.heartbeat === false) {
                                console.log("setting heartbeat back ", doc);
                                ActiveSessions.update({ _id: Meteor.userId() }, { $set: { heartbeat: true, isActive: false } });
                            }
                        }
                        , removed: function(doc) {
                            //the login tokens have been wiped, and the user should logout
                            console.log("active session removed!", doc);
                            window.clearTimeout(_logout);
                            _logout = window.setTimeout(function() {
                                Meteor.user() && Meteor.logout(function() {
                                    _observeSession && _observeSession.stop();
                                     Meteor.slidingSession.onSessionTimeout();
                                });
                            }, 100);
                        }
                    });

                });
            }

        }, 1000);
    }
});

var _mmTime;
Meteor.startup(function() {
    var _ensure = window.setInterval(function() {
        if ($(document.body)) {
            window.clearInterval(_ensure);
            var _mm = function(e) {
                window.clearTimeout(_mmTime);
                _mmTime = window.setTimeout(function() {
                    if (Meteor.user()) {
                        console.log("setting to active");
                        ActiveSessions.update({ _id: Meteor.userId() }, { $set: { isActive: true } });
                    }
                }, 500);
            };
            $(document).bind("mousemove", _mm);
        }
    }, 100);
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