Package.describe({
    summary: "Meteor sliding user session management"
});

Package.on_use(function (api) {

    api.use(['jquery', 'underscore', 'templating', 'standard-app-packages'], 'client');
    api.add_files('lib/shared.js', ['client', 'server']);
    api.add_files('lib/client/activeSessions.html', 'client');
    api.add_files('lib/client/activeSessions.js', 'client');
    api.add_files('lib/client/css/activeSessions.css', 'client');
    api.add_files('lib/server/activeSessions.js', 'server');

});