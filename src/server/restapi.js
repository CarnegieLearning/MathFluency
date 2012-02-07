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
    
    // Parse and load seqID, stageID and questionSetID params if they are present in the URL.
    app.param('seqID', function( req, res, next, seqID )
    {
        gc.getAvailableSequencesForPlayer( req.playerState, function(sequences)
        {
            req.sequence = sequences[seqID];
            next();
        });
    });
    app.param('stageID', function (req, res, next, stageID)
    {
        // maybe we should find the next stage in sequence
        if( stageID == 'next' && req.sequence && req.playerState ){
            req.sequence.getNextStage( req.playerState, function (stg)
            {
                req.stage = stg;
            });
            return next();
        }
        if( req.playerState ){
            console.log("fetching stages for player…");
            gc.getAvailableStagesForPlayer( req.playerState, function(stages)
            {
                console.log("searching "+ stages.length +" stages");
                stages.map( function(stage)
                {
                    if( stage.id == stageID ){
                        console.log("found stage "+ stageID);
                        req.stage = stage;
                        return;
                    }
                } );
                next();
            } );
        } else {
            gc.getStage(stageID, function (stage)
            {
                if (!stage) return next(new Error('Cannot find stage with ID ' + stageID));
                
                req.stage = stage;
                next();
            });
        }
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
        Method: GET /sequence/:seqID?
        
        If  seqID is specified, and the player has such a sequences, then we send it,
        otherwise we send all available sequences for the player        
    */
    app.get('/sequence/:seqID?', function (req, res, next)
    {
        if (req.sequence)
        {
            res.send(req.sequence.toJSON());
        }
        else
        {
            gc.getAvailableSequencesForPlayer(req.playerState, function (sequences)
            {
                res.send({'sequences': sequences});
            });
        }
    });
    
    /*
        Method: GET /sequence/:seqID/stage/:stageID?
        
        If stageID is specified, then we send the results of GameController.getStage, otherwise
        we send all stages in the specified sequence.
    */
    app.get('/sequence/:seqID/stage/:stageID?', function (req, res, next)
    {
        if( req.stage ){
            res.send( req.stage.toJSON() );
        } else if( ! req.playerState ){
                console.log("no playerState, must be instructor. Sending all stages: ");
                res.send({'stages': req.sequence.stages});
        } else {
            var availFn = req.sequence.makeAvailableStagesFn( req.playerState );
            availFn( function( error, stageLocking )
            {
                if( error )
                    return next(new Error('Cannot fetch stageLocking: ' + error));
                var stagesJSON = new Array();
                var stages = req.sequence.stages;
                for( var i in stages ){
                    var stj = stages[i].toJSON();
                    stj.locked = ( stageLocking[ stages[i].id ] ? true : false );
                    stagesJSON.push( stj );
                }
                res.send({'stages': stagesJSON});
            });
        }
    });
    
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
                var stagesJSON = new Array();
                for( var i in stages ){
                    var stj = stages[i].toJSON();
                    stj.locked = false;
                    if( req.playerState ){
                        for( var seqID in req.playerState.stageLocking ){
                            if( req.playerState.stageLocking[seqID][stages[i].id] ){
                                stj.locked = true;
                                break;
                            }
                        }
                    }
                    stagesJSON.push( stj );
                }
                res.send({'stages': stagesJSON});
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
        gc.getGameEngineForQuestionSet(req.questionSet, req.playerState, function (engine)
        {
            if (!engine) return next(new Error('Cannot find engine for question set ' + req.questionSet.id));
            
            res.send(engine.toJSON());
        });
    });
    
    /*
        Method: POST /sequence/:seqID/stage/:stageID/questionSet/:questionSetID/results
        
        Saves the body of the request as the results for the given question set by calling <GameController.saveQuestionSetResults>.  Sends an empty object on success, or an error object with status 500 on failure.
    */
    app.post('/sequence/:seqID/stage/:stageID/questionSet/:questionSetID/results', function (req, res, next)
    {
//        for( var p in req ){
//            if( typeof(req[p]) != 'function' )
//                console.log('req.'+ p +' ('+ typeof(req[p]) +') = '+ req[p] );
//        }
//        for( var p in req.body ){
//           console.log('req.body.'+ p +' ('+ typeof(req.body[p]) +') = '+ req.body[p] );
//        }
//        console.log('body is '+ typeof( req.body ) +' content '+ req.body.results );
        gc.saveQuestionSetResults(req.playerState, req.sequence, req.questionSet, req.body.results, function (error)
        {
            if (error)
            {
                console.log('Error saving question set results:');
                console.log(error);
                next(error);
            }
            else
            {
                gc.getAvailableStagesForPlayer(req.playerState, function (stages)
                {
                   var stagesJSON = new Array();
                   for( var i in stages ){
                       var stj = stages[i].toJSON();
                       stj.locked = false;
                       if( req.playerState ){
                           for( var seqID in req.playerState.stageLocking ){
                               if( req.playerState.stageLocking[seqID][stages[i].id] ){
                                   stj.locked = true;
                                   break;
                               }
                           }
                       }
                       stagesJSON.push( stj );
                   }
                   res.send({'stages': stagesJSON});
                });
            }
        });
    });
    
    return app;
};
