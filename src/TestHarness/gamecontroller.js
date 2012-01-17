"use strict";

var fs = require('fs'),
    xml2js = require('xml2js'),
    uuid = require('node-uuid'),
    async = require('async'),
    path = require('path'),
    GameController = require('../common/GameController').GameController,
    QuestionHierarchy = require('../common/QuestionHierarchy'),
    constants = require('../common/Constants'),
    util = require('../common/Utilities');


exports.gameController = function (serverConfig, model)
{
    var gameConfig = serverConfig.gameConfig,
        outputPath = serverConfig.outputPath,
        debug = serverConfig.debug;
    
    var cachedConfig = null;
    function config()
    {
        if (cachedConfig && !debug)
        {
            return cachedConfig;
        }
        else
        {
            console.log('Reading game config: ' + gameConfig);
            cachedConfig = JSON.parse(fs.readFileSync(gameConfig));
            populateConfig(cachedConfig, serverConfig);
            return cachedConfig;
        }
    }
    
    var gc = new GameController();
    
    gc.allConditionNames = function ()
    {
        var conditions = util.allDictKeys(config().conditions);
        conditions.sort();
        return conditions;
    };
    
    gc.getAvailableSequencesForPlayer = function (playerState, callback)
    {
        var conf = config();
        // if we have no player, then we return a sequences with all stages
        if( ! playerState ){
            var allStages = conf.stages;
            var stageIDs = util.allDictKeys(allStages).sort();
            var defaultTFn = defaultTransition;
            var sequences = { "Default": makeSequence( "Default", 
                                                       { displayName : "Default",
                                                         transitionFn: defaultTFn,
                                                         stages : stageIDs },
                                                       conf ) };
            //this is the instructor view: unlock all stages
            for( var i in sequences["Default"].stages ){
                sequences["Default"].stages[i].locked = false;
            }
            return callback(sequences);
        }
        // need to fetch any unlocked stages from the DB, using a serial (blocking) process
        var sequences = conf.conditions[playerState.condition];
        var fetchSeq = {};
        for( var seqID in sequences ){
            fetchSeq[seqID] = sequences[seqID].makeAvailableStagesFn(playerState);
        }
        async.series( fetchSeq, function(error, results)
        {
            if( error ){
                console.log('ERROR fetching stages serially: '+ error );
                return callback(null);
            }
            for( var seqID in results ){
                sequences[seqID].stages = results[seqID];
            }
            callback(sequences);
        });
    };
    
    gc.getAvailableStagesForPlayer = function (playerState, callback)
    {
        gc.getAvailableSequencesForPlayer( playerState, function(sequences)
        {
            var availStages = new Array();
            for( var seqID in sequences ){
                sequences[seqID].stages.map( function(stage)
                {
                    availStages.push( stage );
                } );
            }
            callback(availStages);
        } );
    };
    
    gc.getSequence = function (seqID, callback)
    {
        var conf = config();
        for( var cndID in conf.conditions ){
            if( conf.conditions[cndID][seqID] ){
                return callback(conf.conditions[cndID][seqID]);
            }
        }
        callback(null);
    };
    
    gc.getStage = function (stageID, callback)
    {
        callback(config().stages[stageID]);
    };
    
    gc.getPlayerState = function (playerID, callback)
    {
        model.Student.find(playerID).on('success', function (student)
        {
            student.playerID = student.loginID;
            callback(student);
        })
        .on('failure', function (error)
        {
            callback(null);
        });
    };
    
    gc.savePlayerState = function (playerState, callback)
    {
        playerState.save().on('success', function ()
        {
            callback(playerState);
        })
        .on('failure', function (error)
        {
            callback(null);
        });
    };
    
    gc.getGameEngineForQuestionSet = function (questionSet, playerState, callback)
    {
        var engine = config().engines[questionSet.parent.engineID];
        if( questionSet.getFlashParams ){
            questionSet.getFlashParams( playerState, function( params )
            {
                engine.params = params;
            });
        }
        callback( engine );
    };
    
    gc.saveQuestionSetResults = function (playerState, sequence, questionSet, text, callback)
    {
        // No longer abort on playerState == null
        if (!playerState)
        {
            console.log('Saving question set results while playerState is null (this is probably instructor preview).');
        }
        
        var timestamp = Date.now();
        
        // TODO: need to handle different game engines differently. This currently only works with the CL flash games.
        var parser = new xml2js.Parser()
        parser.on('end', function (data)
        {
            var refNode = data.GAME_REFERENCE_NUMBER,
                refID = refNode ? refNode['@'].ID.split('::') : [uuid()],
                UUID = refID.length == 0 ? uuid() : refID[0],
                filename = UUID + '.xml',
                filepath = outputPath + '/' + filename,
                scoreNode = data.SCORE_SUMMARY.Score,
                scoreAttr = (scoreNode ? scoreNode['@'] : {}),
                endNode = data.END_STATE,
                endAttr = (endNode ? endNode['@'] : {}),
                qsOutcomeAttributes = {
                    dataFile: filename,
                    condition: playerState ? playerState.condition : null,
                    stageID: questionSet.parent.id,
                    questionSetID: questionSet.id,
                    endTime: Math.round(timestamp / 1000),
                    elapsedMS: scoreAttr.ElapsedTime || scoreAttr.TOTAL_ELAPSED_TIME || 0,
                    score: scoreAttr.TotalScore || scoreAttr.TOTAL_SCORE || 0,
                    endState: constants.endState.stringToCode(endAttr.STATE),
                    medal: constants.medal.stringToCode(scoreAttr.Medal || scoreAttr.MEDAL_EARNED || 'none')
                };
            
            async.parallel([
                function (callback)
                {
                    // Catch the null playerState safely
                    console.log('Writing data file for ' + (playerState ? playerState.loginID : 'null') + ' to ' + filepath);
                    fs.writeFile(filepath, text, callback);
                },
                function (callback)
                {
                    // Do not write null playerState data to the SQL server
                    if (!playerState)
                    {
                        console.log('Not pushing question set results to SQL as playerState is null (this is probably instructor preview).');
                        return callback();
                    }
                
                    model.QuestionSetOutcome.find({where: {dataFile: filename}})
                    .on('success', function (existingRecord)
                    {
                        if (existingRecord)
                        {
                            console.log('Updating existing QuestionSetOutcome record for ' + filename);
                            existingRecord.updateAttributes(qsOutcomeAttributes)
                            .on('success', function () {callback();})
                            .on('failure', callback);
                        }
                        else
                        {
                            console.log('Creating QuestionSetOutcome for ' + filename);
                            var qsOutcome = model.QuestionSetOutcome.build(qsOutcomeAttributes);                            
                            // Setting a relation implicitly does a save().
                            qsOutcome.setStudent(playerState)
                            .on('success', function () {callback();})
                            .on('failure', callback);
                        }
                    })
                    .on('error', callback);
                },
                function (callback)
                {
                    if( ! playerState )
                        return callback();
                    playerState.lastSequence = sequence.id;
                    playerState.lastStage = qsOutcomeAttributes.stageID;
                    gc.savePlayerState( playerState, function(ps)
                    {
                        console.log('saved player state '+ ps.playerID );
                        var transitionFn = eval(sequence.transitionFn);
                        if( ! transitionFn( qsOutcomeAttributes ) ){
                            return callback();
                        }
                        console.log('Unlocking next stage…');
                        sequence.getNextStage( playerState, function(stage)
                        {
                            console.log('… stage '+ stage.id );
                            stage.locked = false;
                            gc.addOrUpdateSA( playerState, stage, qsOutcomeAttributes.medal, function()
                            {   
                                callback();
                            });
                        });
                    });
                }
            ], callback);
        }).parseString(text);
    };
    
    gc.addOrUpdateSA = function( playerState, stage, medal, callback )
    {
        playerState.getStageAvailabilities().on('success', function(stageAvailabilities)
        {
            // update if we have the entry already
            for( var i in stageAvailabilities ){
                var sa = stageAvailabilities[i];
                if( stage.id == sa.stageID ){
                    sa.medal = medal;
                    sa.isLocked = stage.locked;
                    
                    sa.save().on('success', function()
                    {
                        console.log('updated sa!');
                        return callback();
                    }).on('error', function(error)
                    {
                        console.log('error saving sa '+ sa.stageID +' for student '+ playerState.loginID +':'+ error );
                        return callback();
                    });
                }
            }
            // otherwise we add a new one
            var sa = model.StageAvailability.build({
                'stageID' : stage.id,
                'medal': medal,
                'isLocked' : stage.locked
            });
            sa.setStudent( playerState ).on('success', function(sa)
            {
                sa.save().on('success', function()
                {
                    console.log('created new sa!');
                    callback();
                }).on('error', function(error)
                {
                    console.log('error saving sa '+ sa.stageID +' for student '+ playerState.loginID +':'+ error );
                    callback();
                });                
            }).on('error', function(error)
            {
                console.log('unable to set student '+ playerState.loginID +' on sa '+ sa.stageID +':'+ error  );
                callback();
            });
        }).on('error', function(error)
        {
            console.log('unable to retrieve StageAvailabilities for student '+ playerState.loginID +':'+ error );
            callback();
        });
    };
    
    return gc;
};

function defaultTransition( outcomeAttrs )
{
    console.log('Won medal: '+ outcomeAttrs.medal );   
    return outcomeAttrs.medal != 0;
}


function populateConfig(config, serverConfig)
{
    // Populate engines.
    
    for (var engineID in config.engines)
    {
        config.engines[engineID] = makeEngine(config.engines[engineID]);
    }
    
    // Populate stages.
    
    for (var stageID in config.stages)
    {
        config.stages[stageID] = makeStage(stageID, config, serverConfig);
    }
    
    // Populate conditions & sequences
    for( var cndID in config.conditions )
    {
        for( var seqID in config.conditions[cndID] )
        {
            config.conditions[cndID][seqID] = makeSequence(seqID, config.conditions[cndID][seqID], config );
        }
    }
}

function makeEngine(engineConfig)
{
    if (engineConfig.type == 'CLFlashGameEngine'){
        engineConfig.swfPath = '/fluency/games/' + engineConfig.cli_task_id;
        engineConfig.dataPath = '/fluency/data/' + engineConfig.cli_task_id;
    }
    else if (engineConfig.type == 'CLHTML5GameEngine') {
        engineConfig.scriptPath = '/fluency/games/' + engineConfig.cli_task_id;
        engineConfig.dataPath = '/fluency/data/' + engineConfig.cli_task_id;
    }
    else if( engineConfig.type == 'ExtFlashGameEngine'){
        engineConfig.swfPath = engineConfig.swfPath;
    }
    
    engineConfig.toJSON = function ()
    {
        return engineConfig;
    };
    
    return engineConfig;
}


function makeSequence( seqID, seqConfig, gameConfig )
{
    var defaultTFn = "defaultTransition";
    var sequence = new QuestionHierarchy.Sequence(seqID, seqConfig.displayName, seqConfig.gameProperties);
    if( ! sequence.transitionFn )
        sequence.transitionFn = defaultTFn;
    for( var i in seqConfig.stages ){
        var stageID = seqConfig.stages[i];
        if( gameConfig ){
            sequence.stages[i] = gameConfig.stages[stageID];
            if( i == 0 )
                sequence.stages[i].locked = false;
        } else {
            sequence.stages[i] = stageID;
        }
    }
    
    sequence.makeAvailableStagesFn = function(playerState)
    {
        return function(callback)
        {
//            console.log('fetching available stages from db…');
            playerState.getStageAvailabilities().on('success', function(stageAvailabilities)
            {
//                console.log('player '+ playerState.loginID +' has '+ stageAvailabilities.length +' SAs');
                for( var i in stageAvailabilities ){
                    var stageID = stageAvailabilities[i].stageID;
                    var isLocked = stageAvailabilities[i].isLocked; 
                    for( var n in sequence.stages ){
                        if( sequence.stages[n].id == stageID ){
//                            console.log('sequence: '+ sequence.id +' stage: '+ stageID +' isLocked: '+ isLocked );
                            sequence.stages[n].locked = ( isLocked ? true : false );
                            break;
                        }
                    }
                }
                // the first stage is always available
                sequence.stages[0].locked = false;
//                console.log('passing on available stages');
                callback(null,sequence.stages);
            }).on('error', function(error){
                callback(error,null);
            });
        };
    }
    
    sequence.getNextStage = function(playerState, callback)
    {
        // get the next stage in this sequence
        if( playerState.lastSequence == sequence.id )
            for( var i in sequence.stages )
                if( sequence.stages[i].id == playerState.lastStage )
                    if( sequence.stages[i+1] )
                        return callback( sequence.stages[i+1] );
        // otherwise we find the first locked one
        for( var i in sequence.stages )
            if( sequence.stages[i].locked )
                return callback( sequence.stages[i] );
        // otherwise we return the last stage in the sequence
        callback( sequence.stages[ sequence.stages.length - 1 ] );
    }
    
    sequence.toJSON = function()
    {
        var json = QuestionHierarchy.QuestionEntity.prototype.toJSON.call( this );
        json.transitionFn = sequence.transitionFn;
        return json;
    }
    
    return sequence;
}

function makeStage(stageID, config, serverConfig)
{
    var stageConfig = config.stages[stageID];
    var engineConfig = config.engines[stageConfig.engine];
    
    var stage = new QuestionHierarchy.Stage(stageID, stageConfig.displayName, stageConfig.gameProperties);
    stage.engineID = stageConfig.engine;
    stage.engineType = engineConfig.type;
    stage.locked = true;

    if (stageConfig.cli_fluency_task)
    {
        var engineDataPath = path.join(serverConfig.dataPath, engineConfig.cli_task_id);
        stage._cachedCLITaskConfig = null;
        
        stage.getCLITaskConfig = function (callback)
        {
            if (stage._cachedCLITaskConfig)
            {
                callback(null, stage._cachedCLITaskConfig);
            }
            else
            {
                var filepath = path.join(engineDataPath, stageConfig.cli_fluency_task, 'dataset.xml');
                console.log('Reading CLI Flash task configuration: ' + filepath);
                fs.readFile(filepath, function (err, str)
                {
                    if (err)
                    {
                        console.log('Error reading CLI Flash task config: ' + err.message);
                        return callback(err);
                    }
                    
                    var parser = new xml2js.Parser();
                    parser.on('end', function (data)
                    {
                        var taskConfig = {};
                        if( data.datafile instanceof Array ){
	                        for (var i in data.datafile)
	                        {
	                            var xml = data.datafile[i]['@']['name'];
	                            var id = data.datafile[i]['@']['id'];
	                            var qs = new QuestionHierarchy.QuestionSet(stage, id, id, {
	                                input: stageConfig.cli_fluency_task + '/' + xml
	                            });
	                            taskConfig[id] = qs;
	                        }
                        } else {
                            var xml = data.datafile['@']['name'];
                            var id = data.datafile['@']['id'];
                            var qs = new QuestionHierarchy.QuestionSet(stage, id, id, {
                                input: stageConfig.cli_fluency_task + '/' + xml
                            });
                            taskConfig[id] = qs;
                        }
                        stage._cachedCLITaskConfig = taskConfig;
                        callback(null, taskConfig);
                    });
                    parser.parseString(str);
                });
            }
        }
        
        stage.getAllQuestionSetIDs = function (callback)
        {
            stage.getCLITaskConfig(function (err, taskConfig)
            {
                if (err) return callback(null);
                callback(util.allDictKeys(taskConfig));
            });
        }
        
        stage.getQuestionSet = function (questionSetID, callback)
        {
            stage.getCLITaskConfig(function (err, taskConfig)
            {
                if (err) return callback(null);
                callback(taskConfig[questionSetID]);
            });
        }
        
        stage.getInstructionsHTML = function (baseURL, callback)
        {
            var instructionsPath = path.join(engineDataPath, 'ft_instructions.html'),
                tipsPath = path.join(engineDataPath, stageConfig.cli_fluency_task, 'ft_tips.html');
            async.map([instructionsPath, tipsPath],
                function (path, callback)
                {
                    fs.readFile(path, 'utf8', function (err, str)
                    {
                        if (err)
                        {
                            if (err.code == 'ENOENT')
                            {
                                return callback(null, '<p>Not available.</p>');
                            }
                            else
                            {
                                return callback(err);
                            }
                        }
                        
                        // Remove the <?xml...?> declaration and resolve relative image paths.
                        str = str.replace(/<\?xml [^>]*\?>/, '')
                                 .replace(/(<img src=['"])\.\//g, '$1' + baseURL + '/data/' + engineConfig.cli_task_id + '/');
                        callback(err, str);
                    });
                },
                function (error, results)
                {
                    if (error) return callback(error);
                    
                    var html = '<h2>Instructions</h2>' + results[0] + '<h2>Tips</h2>' + results[1];
                    callback(null, html);
                });
        };
    }
    else if( stage.engineType == 'ExtFlashGameEngine' )
    {   
        stage.getAllQuestionSetIDs = function (callback)
        {
            callback( [ stage.id ] );
        }
        
        stage.getQuestionSet = function (questionSetID, callback)
        {
            if( questionSetID != stage.id ){
                console.log('no such question set as '+ questionSetID +' for stage '+ stage.id);
                return callback(null);
            }
            var qs = new QuestionHierarchy.QuestionSet(stage, stage.id, stage.displayName, {} );
            
            qs.getFlashParams = function( playerState, callback )
            {
                var params = { 'lname': qs.id };
                if( playerState )
                    params.uid = playerState.playerID;
                callback( params );
            }
            
            callback( qs );
        }
    }
    else
    {
        throw "Cannot parse game stage configuration: " + JSON.stringify(stageConfig);
    }
    
    // getNextQuestionSet is random with replacement.
    stage.getNextQuestionSet = function (playerState, callback)
    {
        stage.getAllQuestionSetIDs(function (ids)
        {
            stage.getQuestionSet(ids && util.randomItem(ids), callback);
        });
    };
    
    stage.toJSON = function()
    {
        var json = QuestionHierarchy.QuestionEntity.prototype.toJSON.call( this );
        json.locked = stage.locked;
        return json;
    }
    
    return stage;
}

