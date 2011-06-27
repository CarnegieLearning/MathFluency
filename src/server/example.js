/*
    Title: Example Server
    
    An example implementation of a <Game Controller at http://fluencychallenge.com/wiki/DesignAndImplementation/GameController> which serves a website and allows users to play through several static sequences of problems from a choice of game engines.
*/

var http = require('http'),
    urllib = require('url'),
    express = require('express'),
    GameController = require('../common/GameController').GameController,
    PlayerState = require('../common/PlayerState').PlayerState,
    exampleGames = require('./exampleGames');


function runServer(port, rootPath)
{
    // Create our simple GameController instance that doesn't keep any player state info, and returns our static set of stages.
    var gc = new GameController();
    gc.getPlayerState = function (playerID, authentication, callback)
    {
        setTimeout(callback, 0, new PlayerState(playerID));
    }
    gc.getStage = function (stageID, callback)
    {
        for (var i = 0; i < exampleGames.stages.length; i++)
        {
            if (exampleGames.stages[i].id == stageID)
            {
                setTimeout(callback, 0, exampleGames.stages[i]);
                return;
            }
        }
    }
    gc.getAvailableStagesForPlayer = function (playerState, callback)
    {
        // playerState is ignored since everyone sees the same static stages.
        setTimeout(callback, 0, exampleGames.stages);
    }
    gc.getGameEngineForQuestionSet = function (questionSet, callback)
    {
        var engineID = questionSet.allGameProperties().engineID;
        setTimeout(callback, 0, exampleGames.engines[engineID]);
    }
    
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
    app.configure('development', function ()
    {
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        app.use(express.logger());
    });
    
    app.param('playerID', function (req, res, next, playerID)
    {
        gc.getPlayerState(playerID, null, function (playerState)
        {
            req.playerState = playerState;
            next();
        });
    });
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
    app.use(rootPath + '/static', express.directory(__dirname + '/../static'));
    
    // Dynamic handlers for index template -- require a trailing slash so client-side relative paths work correctly.
    app.get(new RegExp('^' + rootPath + '$'), function (req, res)
    {
        res.redirect(rootPath + '/');
    });
    app.get(new RegExp('^' + rootPath + '/(:?index\\.html)?$'), function (req, res)
    {
        res.render(__dirname + '/templates/example.ejs');
    });
    
    // Dynamic handlers for AJAX API.
    app.get(rootPath + '/stage/:stageID?', function (req, res)
    {
        if (req.stage)
        {
            res.send(req.stage.toJSON());
        }
        else
        {
            gc.getAvailableStagesForPlayer(req.playerState, function (stages)
            {
                res.send({'stageIDs': stages.map(function (stage)
                {
                    return stage.id;
                })});
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
    
    // Start the server.
    app.listen(port);
    console.log('Server running on port ' + port + ' with URL root ' + rootPath);
}

if (require.main === module)
{
    if (process.argv.length != 4)
    {
        console.log('Invalid argument(s).');
        console.log('Usage: node example.js PORT ROOT');
        console.log('PORT is the server port (e.g. 80)');
        console.log('ROOT is the server URL root path (e.g. "/fluencydemo")');
        process.exit(1);
    }
    var port = parseInt(process.argv[2]);
    var root = process.argv[3];
    runServer(port, root);
}
