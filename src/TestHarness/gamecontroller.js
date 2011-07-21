var fs = require('fs'),
    GameController = require('../common/GameController').GameController,
    QuestionHierarchy = require('../common/QuestionHierarchy'),
    model = require('./model'),
    util = require('../common/Utilities');


exports.gameController = function (outputPath, configPath)
{
    if (!configPath) configPath = __dirname + '/games.json';
    var config = JSON.parse(fs.readFileSync(configPath));
    
    var gc = new GameController();
    
    gc.allConditionNames = function allConditionNames ()
    {
        var conditions = util.allDictKeys(config.conditions);
        conditions.sort();
        return conditions;
    };
    
    gc.getAvailableStagesForPlayer = function (playerState, callback)
    {
        callback(config.conditions[playerState.condition].stages);
    };
    
    gc.getStage = function (stageID, callback)
    {
        callback(makeStage(config, stageID));
    };
    
    gc.getPlayerState = function (playerID, callback)
    {
        model.Student.find(playerID).on('success', function (student)
        {
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
    
    gc.getGameEngineForQuestionSet = function (questionSet, callback)
    {
        var engineID = config.stages[questionSet.parent.id].engine;
        callback(makeEngine(config.engines[engineID]));
    };
    
    return gc;
};

function makeStage(config, stageID)
{
    var stageConfig = config.stages[stageID];
    if (!stageConfig) return null;
    
    var stage = new QuestionHierarchy.Stage(stageID, stageConfig.gameProperties);
    
    stage.getAllQuestionSetIDs = function (callback)
    {
        callback(stageConfig.questionSets);
    };
    
    stage.getQuestionSet = function (questionSetID, callback)
    {
        var qsConfig = config.questionSets[questionSetID];
        var qs = null;
        if (qsConfig)
        {
            qs = new QuestionHierarchy.QuestionSet(stage, questionSetID, qsConfig);
        }
        callback(qs);
    };
    
    // getNextQuestionSet is random with replacement.
    stage.getNextQuestionSet = function (playerState, callback)
    {
        var qsID = util.randomItem(stageConfig.questionSets);
        stage.getQuestionSet(qsID, callback);
    };
    
    return stage;
}

function makeEngine(engineConfig)
{
    return {
        toJSON: function ()
        {
            return engineConfig;
        }
    }
}
