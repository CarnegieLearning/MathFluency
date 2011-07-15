var express = require('express');

module.exports = function restapi(gameController)
{
    var app = express.createServer(),
        gc = gameController;
    
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: "keyboard cat" }));
    
    // Middleware to load the playerState when session.playerID is set.
    app.use(function (req, res, next)
    {
        if (!req.session.playerID) return next();

        gc.getPlayerState(req.session.playerID, function (playerState)
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
    
    // REST API endpoints that call out to the game controller.
    app.post('/login', function (req, res)
    {
        var playerID = req.body.playerID;
        var password = req.body.password;
        gc.authenticatePlayer(playerID, password, function (playerState)
        {
            if ('playerID' in playerState)
            {
                req.session.playerID = playerState.playerID;
                res.send(playerState.toJSON());
            }
            else
            {
                res.send(403);
            }
        });
    });
    app.get('/stage/:stageID?', function (req, res)
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
    app.get('/stage/:stageID/questionSet/:questionSetID?', function (req, res)
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
    app.get('/stage/:stageID/questionSet/:questionSetID/engine', function (req, res)
    {
        gc.getGameEngineForQuestionSet(req.questionSet, function (engine)
        {
            res.send(engine.toJSON());
        });
    });
    app.post('/stage/:stageID/questionSet/:questionSetID/results', function (req, res)
    {
        gc.saveQuestionSetResults(req.playerState, req.questionSet, req.rawBody, function ()
        {
            res.send({});
        });
    });
    
    return app;
};
