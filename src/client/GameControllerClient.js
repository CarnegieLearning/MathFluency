var GameControllerBase = require('/js/common/GameController').GameController,
    QuestionHierarchy = require('/js/common/QuestionHierarchy'),
    util = require('/js/common/Utilities');

/*
    Class: GameControllerClient
    
    A client subclass of <GameController> that uses XHR to fetch data from the server.
*/
exports.GameControllerClient = function GameControllerClient(baseURL)
{
    GameControllerClient.superConstructor.call(this);
    
    this.baseURL = baseURL || '';
    
    this.getAvailableStagesForPlayer = function (playerState, callback)
    {
        $.getJSON(this.baseURL + '/stage', function (data)
        {
            callback(data.stageIDs);
        });
    }
    
    this.getStage = function (stageID, callback)
    {
        $.getJSON(this.baseURL + '/stage/' + stageID, function (data)
        {
            callback(new Stage(data));
        });
    }
    
    this.getGameEngineForQuestionSet = function (questionSet, callback)
    {
        $.getJSON(this.baseURL + '/stage/' + questionSet.parent.id + '/questionSet/' + questionSet.id + '/engine', function (data)
        {
            callback(new CLFlashGameEngine(data));
        });
    }
}
util.extend(exports.GameControllerClient, GameControllerBase);


function Stage(json)
{
    Stage.superConstructor.call(this, json.id, json.myGameProperties);
    
    this.getAllQuestionSets = function (callback)
    {
        // TODO: fetch this from server. For now we're just going to create a single dummy question set.
        callback([new QuestionHierarchy.QuestionSet(this, 'dummy')]);
    }
}
util.extend(Stage, QuestionHierarchy.Stage);


function CLFlashGameEngine(json)
{
    this.baseURL = json.baseURL;
    this.swfPath = json.swfPath;
    var self = this;
    this.run = function (questionSet, div, callback)
    {
        var props = questionSet.allGameProperties();
        console.log("baseURL: " + self.baseURL);
        console.log(props);
        $(div).empty().flash({
            src: self.baseURL + '/' + self.swfPath,
            width: props.width || 974,
            height: props.height || 570,
            flashvars: {
                game_id: props.game_id || 1,
                input_xml: self.baseURL + '/' + props.input_xml,
                asset_name: props.asset_name,
                asset_url: self.baseURL + '/' + props.asset_url,
                callback: 'callDoneCallback'
            }
        },
        {version: 9});
    }
}

var currentDoneCallback;

function registerDoneCallback(callback)
{
    currentDoneCallback = callback;
}

function callDoneCallback(xml)
{
    alert("game finished");
    currentDoneCallback(xml);
}
