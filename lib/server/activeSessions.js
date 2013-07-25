Meteor.publish("activeSessions", function(query) {
	console.log("subscribing with ", query);
	return ActiveSessions.find(query);
});

var processSessionTimeouts = function() {

	var _expiredUsers = _.pluck(ActiveSessions.find({ heartbeat: false }).fetch(), "_id");

	//if the isActive is false it means the user has stopped moving around
	//so stamp the inactivity ONCE after the isActive flag is set to false
	//(the inactivityStart will be null only at the onset)
	ActiveSessions.update({ isActive: false, inactivityStart: null }
		, { $set: { inactivityStart: new Date().valueOf() } }
		, { multi: true });

	//set the active users inactivityStart date back to null
	ActiveSessions.update({ isActive: true }
		, { $set: { inactivityStart: null } }
		, { multi: true });

	//next, check the inactive users against the inactivity threshold
	var _current = new Date().valueOf()
		, _inactive = ActiveSessions.find({ isActive: false }).fetch();

	_.each(_inactive, function(iu) {

		var _secondsOfInactivity = ((_current - iu.inactivityStart)/1000)
			, _secondsOfInactivityAllowed = Meteor.slidingSession.getSessionTimeout(); //(60 * 90) * 1000; //90 minutes

		console.log("inactive for ", _secondsOfInactivity, _secondsOfInactivityAllowed);

		if (_secondsOfInactivity > _secondsOfInactivityAllowed) {
			_expiredUsers.push(iu._id);
		}

	});

	//set the heartbeats to false on the now-set inactive users
	//so the onlineuser gets removed...
	ActiveSessions.update({ _id: { $in: _expiredUsers } }, { $set: { heartbeat: false } }, { multi: true });

	//if the heartbeat is false remove the loginTokens because the user is gone
	Meteor.users.update({ _id: { $in: _expiredUsers } }, {
		$set: { "services.resume.loginTokens": [] }
	}, { multi: true });

	//finally remove all expired users (those due to browser shutdown and those due to inactivity)
	console.log("REMOVING " + ActiveSessions.find({ heartbeat: false }).count() + " sessions");
	ActiveSessions.remove({ heartbeat: false });
};

Meteor.startup(function() {
 	var _checkSessionSettings = Meteor.setInterval(function() {
    	if (Meteor.slidingSession) {
    		Meteor.clearInterval(_checkSessionSettings);

			var _interval = Meteor.slidingSession.getSessionCheckInterval() * 1000;

			console.log("interval ", _interval);

			//this is the call to track who is online
			var _heartbeat = Meteor.setInterval(function() {
				processSessionTimeouts();
				ActiveSessions.update({ heartbeat: true }, { $set: { heartbeat: false } }, { multi: true });
			}, _interval); //every 5 seconds

			//when the app restarts, remove all -- they will re-register
			ActiveSessions.remove({});
		}
	}, 1000);
});

ActiveSessions.allow({
    insert: function (userId, doc) {
        var _user = Meteor.users.findOne(doc._id);
        doc.heartbeat = true;
        doc.isActive = true;
        Meteor.slidingSession.augmentUser(doc, true);
        return userId === doc._id;
    },
    update: function (userId, doc, fields, modifier) {
        var _user = Meteor.users.findOne(doc._id);
        return userId === doc._id;
    },
    remove: function (userId, doc) {
        var _user = Meteor.users.findOne(doc._id);
        console.log(" wants to remove ", userId, doc._id);
        return true; //return userId === doc._id;
    },
    fetch: ['_id', 'userId']
});