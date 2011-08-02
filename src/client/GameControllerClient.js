var GameControllerBase = require('../common/GameController').GameController,
    QuestionHierarchy = require('../common/QuestionHierarchy'),
    PlayerState = require('../common/PlayerState').PlayerState,
    util = require('../common/Utilities');

/*
    Class: GameControllerClient
    
    A client subclass of <GameController> that uses XHR to fetch data from the server.
*/
exports.GameControllerClient = function GameControllerClient(baseURL)
{
    GameControllerClient.superConstructor.call(this);
    
    this.baseURL = baseURL || '';
    this.engineConstructors = {};
    var self = this;
    
    /*
        Method: registerEngineConstructor
        
        Registers a constructor for the given engine type string.  The constructor will get called with the JSON data sent from the server when calling <getGameEngineForQuestionSet>, and should construct an object with a <run> method.
        
        Parameters:
            type - A string that will match the `type' property sent from the server.
            constructor - A constructor for the game engine.
    */
    this.registerEngineConstructor = function (type, constructor)
    {
        self.engineConstructors[type] = constructor;
    };
    
    this.getAvailableStagesForPlayer = function (playerState, callback)
    {
        $.getJSON(this.baseURL + '/stage', function (data)
        {
            callback(data.stageIDs);
        });
    };
    
    this.getStage = function (stageID, callback)
    {
        $.getJSON(this.baseURL + '/stage/' + stageID, function (data)
        {
            callback(new Stage(self.baseURL, data));
        });
    };
    
    this.getGameEngineForQuestionSet = function (questionSet, callback)
    {
        $.getJSON(this.baseURL + '/stage/' + questionSet.parent.id + '/questionSet/' + questionSet.id + '/engine', function (data)
        {
            var constructor = self.engineConstructors[data.type];
            callback(new constructor(data));
        });
    };
    
    this.saveQuestionSetResults = function (playerState, questionSet, results, callback)
    {
        $.post(this.baseURL + '/stage/' + questionSet.parent.id + '/questionSet/' + questionSet.id + '/results', results)
        .success(function ()
        {
            callback();
        })
        .error(function (jqXHR, textStatus, errorThrown)
        {
            callback(errorThrown);
        });
    };
};
util.extend(exports.GameControllerClient, GameControllerBase);


function Stage(baseURL, json)
{
    Stage.superConstructor.call(this, json);
    var self = this;
    
    this.getAllQuestionSetIDs = function (callback)
    {
        $.getJSON(baseURL + '/stage/' + this.id + '/questionSet', function (data)
        {
            callback(data.questionSetIDs);
        });
    };
    
    this.getQuestionSet = function (questionSetID, callback)
    {
        $.getJSON(baseURL + '/stage/' + this.id + '/questionSet/' + questionSetID, function (data)
        {
            callback(new QuestionHierarchy.QuestionSet(self, data));
        });
    };
    
    this.getNextQuestionSet = function (playerState, callback)
    {
        // Ignore playerState since this should be session tracked on the server.
        self.getQuestionSet('next', callback);
    };
}
util.extend(Stage, QuestionHierarchy.Stage);
