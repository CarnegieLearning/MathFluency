var QuestionHierarchy = require('../common/QuestionHierarchy');
var util = require('../common/Utilities');

function Stage(id, myGameProps)
{
    Stage.superConstructor.call(this, id, myGameProps);
}
util.extend(Stage, QuestionHierarchy.Stage);
Stage.prototype.toJSON = function ()
{
    return {
        id: this.id,
        myGameProperties: this.myGameProperties
    }
}
Stage.prototype.getQuestionSet = function (questionSetID, callback)
{
    callback(new QuestionHierarchy.QuestionSet(this, questionSetID));
}


function Engine(baseURL)
{
    this.toJSON = function ()
    {
        return {baseURL: baseURL, swfPath: 'Shell.swf'};
    }
}


exports.engines = {
    'snowboard': new Engine('static/private/FT1-Snowboarding'),
    'racer': new Engine()
}


exports.stages = [
    new Stage('snowboard1', {
        engineID: 'snowboard',
        input_xml: 'assets/xml/FT1_5_020.xml',
        asset_url: '',
        asset_name: 'ExternalAsset'
    }),
    new Stage('racer1', {engineID: 'racer'})
];
