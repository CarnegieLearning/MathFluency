/*
    Title: Example Server
    
    An example implementation of a <Game Controller at http://fluencychallenge.com/wiki/DesignAndImplementation/GameController> which serves a website and allows users to play through several static sequences of problems from a choice of game engines.
*/

var http = require('http'),
    urllib = require('url'),
    express = require('express'),
    fs = require('fs'),
    GameController = require('../common/GameController').GameController,
    PlayerState = require('../common/PlayerState').PlayerState,
    exampleGames = require('./exampleGames');


function runServer(port, rootPath, outputPath)
{
    // Create our simple GameController instance that doesn't keep any player state info, and returns our static set of stages.
    var gc = new GameController();
    gc.getPlayerState = function (playerID, authentication, callback)
    {
        callback(new PlayerState(playerID));
    };
    gc.getStage = function (stageID, callback)
    {
        for (var i = 0; i < exampleGames.stages.length; i++)
        {
            if (exampleGames.stages[i].id == stageID)
            {
                return callback(exampleGames.stages[i]);
            }
        }
    };
    gc.getAvailableStagesForPlayer = function (playerState, callback)
    {
        // playerState is ignored since everyone sees the same static stages.
        callback(exampleGames.stages.map(function (x) {return x.id;}));
    };
    gc.getGameEngineForQuestionSet = function (questionSet, callback)
    {
        var engineID = questionSet.allGameProperties().engineID;
        callback(exampleGames.engines[engineID]);
    };
    gc.saveQuestionSetResults = function (playerState, questionSet, results, callback)
    {
        var date = new Date();
        var playerID = (playerState ? playerState.id : 'unknown');
        var filename = outputPath + '/' + playerID + '-' + date.getUTCFullYear() + date.getUTCMonth() + date.getUTCDate() + '-' + date.getUTCHours() + date.getUTCMinutes() + '.xml';
        fs.writeFile(filename, results, callback);
    };
    
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
    
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: "keyboard cat" }));
    
    app.configure('development', function ()
    {
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        app.use(express.logger());
    });
    
    // Middleware to load the playerState when session.playerID is set.
    app.use(function (req, res, next)
    {
        if (!req.session || !req.session.playerID) return next();

        gc.getPlayerState(req.session.playerID, null, function (playerState)
        {
            req.playerState = playerState;
            next();
        });
    });
    
    // Parse and load stageID and questionSetID params if they are present in the URL.
    app.param('stageID', function (req, res, next, stageID)
    {
        gc.getStage(stageID, function (stage)
        {
            req.stage = stage;
            next();
        });
    });
    app.param('questionSetID', function (req, res, next, questionSetID)
    {
        req.stage.getQuestionSet(questionSetID, function (questionSet)
        {
            req.questionSet = questionSet;
            next();
        });
    });
    
    // Static handlers for client-side JS and game assessts, etc.
    app.use(rootPath + '/js/node_modules', express.static(__dirname + '/../../node_modules'));
    app.use(rootPath + '/js/common', express.static(__dirname + '/../common'));
    app.use(rootPath + '/js/client', express.static(__dirname + '/../client'));
    app.use(rootPath + '/static', express.static(__dirname + '/../static'));
    app.use(rootPath + '/static', express.directory(__dirname + '/../static', {icons:true}));
    app.use(rootPath + '/output', express.static(__dirname + '/../output'));
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
    
    // Dynamic handlers for AJAX API.
    app.get(rootPath + '/login/:playerID', function (req, res)
    {
        req.session.playerID = req.params.playerID;
        gc.getPlayerState(req.params.playerID, null, function (playerState)
        {
            res.send(playerState.toJSON());
        });
    });
    app.get(rootPath + '/stage/:stageID?', function (req, res)
    {
        if (req.stage)
        {
            res.send(req.stage.toJSON());
        }
        else
        {
            gc.getAvailableStagesForPlayer(req.playerState, function (stageIDs)
            {
                res.send({'stageIDs': stageIDs});
            });
        }
    });
    app.get(rootPath + '/stage/:stageID/questionSet/:questionSetID?', function (req, res)
    {
        if (req.questionSet)
        {
            res.send(req.questionSet.toJSON());
        }
        else
        {
            req.stage.getAllQuestionSetIDs(function (questionSetIDs)
            {
                res.send({'questionSetIDs': questionSetIDs});
            });
        }
    });
    app.get(rootPath + '/stage/:stageID/questionSet/:questionSetID/engine', function (req, res)
    {
        gc.getGameEngineForQuestionSet(req.questionSet, function (engine)
        {
            res.send(engine.toJSON());
        });
    });
    app.post(rootPath + '/stage/:stageID/questionSet/:questionSetID/results', function (req, res)
    {
        gc.saveQuestionSetResults(req.playerState, req.questionSet, req.rawBody, function ()
        {
            res.send({});
        });
    });
    
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
