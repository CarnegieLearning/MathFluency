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
    
    this.registerEngineConstructor = function (type, constructor)
    {
        self.engineConstructors[type] = constructor;
    };
    
    this.authenticatePlayer = function (playerID, password, callback)
    {
        var playerState = new PlayerState(playerID);
        $.post(this.baseURL + '/login', {playerID: playerID, password: password}, function (data)
        {
            playerState.updateWithJSON(data);
            callback(playerState);
        });
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
        $.post(this.baseURL + '/stage/' + questionSet.parent.id + '/questionSet/' + questionSet.id + '/results', results, function (data)
        {
            callback(data);
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
