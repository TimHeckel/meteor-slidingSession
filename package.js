Package.describe({
    summary: "Meteor sliding user session management"
});

Package.on_use(function (api) {

    api.use(['jquery', 'underscore', 'templating'], 'client');
    api.add_files([
    	 'lib/shared.js'
    	, 'lib/client/activeSessions.html'
        , 'lib/client/activeSessions.js'
        , 'lib/client/css/activeSessions.css'
       
    ], 'client');

    api.add_files([
	 	'lib/shared.js'
    	, 'lib/server/activeSessions.js'
    ], 'server');

});