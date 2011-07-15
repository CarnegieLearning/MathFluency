/*
    Title: Example Server
    
    An example implementation of a <Game Controller at http://fluencychallenge.com/wiki/DesignAndImplementation/GameController> which serves a website and allows users to play through several static sequences of problems from a choice of game engines.
*/

var urllib = require('url'),
    express = require('express'),
    restapi = require('../server/restapi'),
    games = require('./games');


function runServer(port, rootPath, outputPath)
{
    var gc = games.gameController(outputPath);
    
    // Create a simple server that presents a single HTML page and responds to AJAX API requests to launch the static games.
    var app = express.createServer();
    if (rootPath && rootPath != '/')
    {
        app.set('home', rootPath);
    }
    else
    {
        rootPath = '';
    }
    app.set('view options', {layout: false});
    app.configure('development', function ()
    {
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        app.use(express.logger());
    });
    
    // Static handlers for client-side JS and game assessts, etc.
    app.use(rootPath + '/js/node_modules', express.static(__dirname + '/../../node_modules'));
    app.use(rootPath + '/js/common', express.static(__dirname + '/../common'));
    app.use(rootPath + '/js/client', express.static(__dirname + '/../client'));
    app.use(rootPath + '/js', express.static(__dirname));
    app.use(rootPath + '/static', express.static(__dirname + '/../static'));
    app.use(rootPath + '/static', express.directory(__dirname + '/../static', {icons:true}));
    app.use(rootPath + '/output', express.static(outputPath));
    app.use(rootPath + '/output', express.directory(outputPath, {icons:true}));
    
    // Dynamic handlers for index template -- require a trailing slash so client-side relative paths work correctly.
    app.get(new RegExp('^' + rootPath + '$'), function (req, res)
    {
        res.redirect(rootPath + '/');
    });
    app.get(new RegExp('^' + rootPath + '/(:?index\\.html)?$'), function (req, res)
    {
        res.render(__dirname + '/templates/example.ejs', {
            playerID: (req.session && req.session.playerID) || ''
        });
    });
    
    // The REST API handler.
    app.use(rootPath + '/api', restapi(gc));
    
    // Start the server.
    app.listen(port);
    console.log('Server running on port ' + port + ' with URL root ' + rootPath);
}

if (require.main === module)
{
    if (process.argv.length != 5)
    {
        console.log('Invalid argument(s).');
        console.log('Usage: node example.js PORT ROOT OUTPUT');
        console.log('PORT is the server port (e.g. 80)');
        console.log('ROOT is the server URL root path (e.g. "/fluencydemo")');
        console.log('OUTPUT is the file output directory path, which must be writable.');
        process.exit(1);
    }
    var port = parseInt(process.argv[2]);
    var root = process.argv[3];
    var output = process.argv[4];
    runServer(port, root, output);
}
