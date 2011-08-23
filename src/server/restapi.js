"use strict";

var express = require('express');

/*
    Title: restapi
    
    This module creates an expressjs webapp that calls out to the given <GameController> and sends the results back as JSON.  For example, the REST API can be installed within a parent webapp at the sub-URL '/api' by doing:
    
    | var gc = createMyGameController(...);
    | var app = require('express').createServer();
    | app.use('/api', require('restapi')(gc));
    
    If the current request's session object has a `playerID' key, the <PlayerState> for that player will be loaded and used as the context.  Alternatively, the parent app can populate the `playerState' property of the request object to get the same effect.
    
    In general, all data objects are turned into JSON by calling a `toJSON' method.
    
    * Specs: <http://fluencychallenge.com/wiki/DesignAndImplementation/GameController#RESTAPI>
*/

module.exports = function restapi(gameController)
{
    var app = express.createServer(),
        gc = gameController;
    
    app.use(express.bodyParser());
    
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
            if (!stage) return next(new Error('Cannot find stage with ID ' + stageID));
            
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
                if (!questionSet) return next(new Error('Cannot find question set with ID ' + questionSet + ' in stage ' + req.stage.id));
                
                req.questionSet = questionSet;
                next();
            });
        }
    });
    
    // REST API endpoints that call out to the game controller.
    
    /*
        Method: GET /stage/:stageID?
        
        If stageID is specified, sends the results of <GameController.getStage>.  Otherwise, calls <GameController.getAvailableStagesForPlayer> and returns an object with the key `stageIDs' with an array of stage ID strings.
    */
    app.get('/stage/:stageID?', function (req, res, next)
    {
        if (req.stage)
        {
            res.send(req.stage.toJSON());
        }
        else
        {
            gc.getAvailableStagesForPlayer(req.playerState, function (stages)
            {
                res.send({'stages': stages});
            });
        }
    });
    
    /*
        Method: GET /stage/:stageID/questionSet/:questionSetID?
        
        If questionSetID is specified, sends the results of <Stage.getQuestionSet>.  Otherwise, calls <Stage.getAllQuestionSetIDs> and returns an object with the key `questionSetIDs' with an array of question set ID strings.
    */
    app.get('/stage/:stageID/questionSet/:questionSetID?', function (req, res, next)
    {
        if (req.params.questionSetID)
        {
            if (req.questionSet) res.send(req.questionSet.toJSON());
            else  res.send({});
        }
        else
        {
            req.stage.getAllQuestionSetIDs(function (questionSetIDs)
            {
                res.send({'questionSetIDs': questionSetIDs});
            });
        }
    });
    
    /*
        Method: GET /stage/:stageID/questionSet/:questionSetID/engine
        
        Sends the engine configuration for the given <QuestionSet> by calling <GameController.getGameEngineForQuestionSet>.
    */
    app.get('/stage/:stageID/questionSet/:questionSetID/engine', function (req, res, next)
    {
        gc.getGameEngineForQuestionSet(req.questionSet, function (engine)
        {
            if (!engine) return next(new Error('Cannot find engine for question set ' + req.questionSet.id));
            
            res.send(engine.toJSON());
        });
    });
    
    /*
        Method: POST /stage/:stageID/questionSet/:questionSetID/results
        
        Saves the body of the request as the results for the given question set by calling <GameController.saveQuestionSetResults>.  Sends an empty object on success, or an error object with status 500 on failure.
    */
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
