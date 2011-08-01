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
        if (!req.session || !req.session.playerID) return next();

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
        if (questionSetID == 'next')
        {
            req.stage.getNextQuestionSet(req.playerState, function (questionSet)
            {
                req.questionSet = questionSet;
                next();
            });
        }
        else
        {
            req.stage.getQuestionSet(questionSetID, function (questionSet)
            {
                req.questionSet = questionSet;
                next();
            });
        }
    });
    
    // REST API endpoints that call out to the game controller.
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
        gc.saveQuestionSetResults(req.playerState, req.questionSet, req.rawBody, function (error)
        {
            if (error)
            {
                console.log('Error saving question set results:');
                console.log(error);
                res.send(error, 500);
            }
            else
            {
                res.send({});
            }
        });
    });
    
    return app;
};
