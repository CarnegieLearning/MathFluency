var swfobject = require('./lib/swfobject').swfobject;

exports.CLFlashGameEngine = function CLFlashGameEngine(json)
{
    this.dataPath = json.dataPath;
    this.swfPath = json.swfPath;
    var self = this;
    this.run = function (questionSet, div, callback)
    {
        var props = questionSet.allGameProperties();
        registerDoneCallback(callback);
        var flashID = 'CLFlashGameEngine_flashID';
        $(div).empty().append($('<div>').attr('id', flashID));
        swfobject.embedSWF(
            self.swfPath + '/Shell.swf',
            flashID,
            props.width || 974,
            props.height || 570,
            props.flashVersion || "10.0.0",
            false,
            {
                game_id: questionSet.parent.id + '::' + questionSet.id,
                input_xml: self.dataPath + '/' + props.input,
                asset_name: 'ExternalAsset',
                asset_url: self.swfPath,
                callback: 'CLFLashGameEngineDoneCallback'
            });
    };
};

var currentDoneCallback;

function registerDoneCallback(callback)
{
    currentDoneCallback = callback;
}

window.CLFLashGameEngineDoneCallback = function CLFLashGameEngineDoneCallback(xml)
{
    currentDoneCallback(xml);
};
