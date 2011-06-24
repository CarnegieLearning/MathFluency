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


function runServer(port)
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
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.bodyParser());
    app.use(app.router);
    app.set('view options', {layout: false});
    
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
    
    app.use(express.directory(__dirname + '/../..'));
    app.use(express.static(__dirname + '/../static'));
    app.get('/js/node_modules/*', subdirStaticMiddleware(__dirname + '/../../node_modules'));
    app.get('/js/common/*', subdirStaticMiddleware(__dirname + '/../common'));
    app.get('/js/*', subdirStaticMiddleware(__dirname + '/../client'));
    app.get(/^\/(:?index\.html)?$/, function (req, res)
    {
        res.render(__dirname + '/templates/example.ejs')
    });
    app.get('/stage/:stageID?', function (req, res)
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
    app.get('/stage/:stageID/questionSet/:questionSetID/engine', function (req, res)
    {
        var questionSet = req.stage;
        gc.getGameEngineForQuestionSet(req.questionSet, function (engine)
        {
            res.send(engine.toJSON());
        });
    });
    
    app.listen(8000);
    
    console.log('Server running on port ' + port);
}

function subdirStaticMiddleware(root)
{
    var staticMiddleware = express.static(root);
    return function (req, res, next)
    {
        var url = urllib.parse(req.url);
        url.pathname = req.params[0];
        console.log('Serving static path ' + url.pathname + ' for request ' + req.url);
        req.url = urllib.format(url);
        staticMiddleware(req, res, next);
    };
}

if (require.main === module) runServer(8000);
