//this is the collection that stores active sessions
ActiveSessions = new Meteor.Collection("activeSessions");

//this is a constant for the session variable that does the querying on the active users
Meteor.slidingSessionActiveUserQuery = "__slidingSessionActiveUserQuery";

//this is a constant for the session variable that does the further filtering of the client's cache
Meteor.slidingSessionActiveUserFilterQuery = "__slidingSessionActiveUserFilterQuery";