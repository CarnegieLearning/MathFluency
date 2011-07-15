var GameController = require('../common/GameController').GameController,
    PlayerState = require('../common/PlayerState').PlayerState,
    QuestionHierarchy = require('../common/QuestionHierarchy'),
    util = require('../common/Utilities'),
    fs = require('fs');

exports.gameController = function (outputPath)
{
    // Create a simple GameController instance that doesn't keep any player state info, and returns our static set of stages.
    var gc = new GameController();
    gc.getStage = function (stageID, callback)
    {
        callback(util.findInArray(stages, stageID, 'id'));
    };
    gc.getAvailableStagesForPlayer = function (playerState, callback)
    {
        // playerState is ignored since everyone sees the same static stages.
        callback(stages.map(function (x) {return x.id;}));
    };
    gc.getGameEngineForQuestionSet = function (questionSet, callback)
    {
        var engineID = questionSet.allGameProperties().engineID;
        callback(engines[engineID]);
    };
    gc.saveQuestionSetResults = function (playerState, questionSet, results, callback)
    {
        var date = new Date();
        var playerID = (playerState ? playerState.playerID : 'unknown');
        var filename = outputPath + '/' + playerID + '-' + date.format('yyyymmdd-HHMMss', true) + '.xml';
        fs.writeFile(filename, results, callback);
    };
    
    return gc;
};

function Stage(id, myGameProps, questionSetDicts)
{
    Stage.superConstructor.call(this, id, myGameProps);
    
    this.questionSets = [];
    for (var i = 0; i < questionSetDicts.length; i++)
    {
        this.questionSets.push(new QuestionSet(this, questionSetDicts[i]));
    }
}
util.extend(Stage, QuestionHierarchy.Stage);
Stage.prototype.getQuestionSet = function (questionSetID, callback)
{
    callback(util.findInArray(this.questionSets, questionSetID, 'id'));
};
Stage.prototype.getAllQuestionSetIDs = function (callback)
{
    callback(this.questionSets.map(function (x) {return x.id;}));
};


function QuestionSet(parent, json)
{
    var id = json.id;
    delete json.id;
    QuestionSet.superConstructor.call(this, parent, id, json);
}
util.extend(QuestionSet, QuestionHierarchy.QuestionSet);


function Engine(baseURL)
{
    this.toJSON = function ()
    {
        return {baseURL: baseURL, swfPath: 'Shell.swf'};
    }
}


var engines = {
    'snowboard': new Engine('static/private/FT1-Snowboarding'),
    'racer': new Engine('static/private/FT1-Racer'),
    'pie': new Engine('static/private/FT2-PieTheClown')
}


var stages = [
    new Stage('sequence-1', {
            asset_url: '',
            asset_name: 'ExternalAsset'
        },
        [
            {
                id: 'snowboard-1',
                engineID: 'snowboard',
                input_xml: 'assets/xml/FT1_5_020.xml'
            },
            {
                id: 'pie-1',
                engineID: 'pie',
                input_xml: 'assets/xml/FT2pie_int_001.xml'
            },
            {
                id: 'pie-2',
                engineID: 'pie',
                input_xml: 'assets/xml/FT2pie_Perc1_001.xml'
            }
        ]
    ),
    new Stage('sequence-2 (empty)', {}, [])
];
