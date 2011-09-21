var swfobject = require('./lib/swfobject').swfobject,
    uuid = require('../node_modules/node-uuid/uuid');

/*
    Class: CLFlashGameEngine
    
    A client game engine that instantiates an Adobe Flash-based Carnegie Learning fluency task game engine.  The config JSON should contain the following keys:
    
    * dataPath - The base URL to input data.
    * swfPath - The base URL to the directory containing the Shell.swf and ExternalAssets.xml files.
    
    When the <run> method is called, the questionSet (or its parent stage) should define the following property:
    
    * input - The name of the input file XML file relative to dataPath.
*/
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
                game_id: uuid() + '::' + 'CLFlashGameEngine' + '::' + questionSet.parent.id + '::' + questionSet.id,
                input_xml: self.dataPath + '/' + props.input,
                asset_name: 'ExternalAsset',
                asset_url: self.swfPath,
                callback: 'CLFLashGameEngineDoneCallback'
            });
    };
};

var currentDoneCallback,
    currentDoneCallbackTimeout;

function registerDoneCallback(callback)
{
    currentDoneCallback = callback;
}

window.CLFLashGameEngineDoneCallback = function CLFLashGameEngineDoneCallback(xml)
{
    // When a game is aborted, a finish callback and an abort callback happen in quick succession. This can lead to duplicate data on the server. To work around this issue, we delay calling the real callback, only letting the last one through.
    if (currentDoneCallbackTimeout)
    {
        clearTimeout(currentDoneCallbackTimeout);
    }
    currentDoneCallbackTimeout = setTimeout(function ()
    {
        currentDoneCallback(xml);
    }, 100);
};
