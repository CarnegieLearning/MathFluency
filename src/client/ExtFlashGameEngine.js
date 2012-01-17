var swfobject = require('./lib/swfobject').swfobject,
    uuid = require('../node_modules/node-uuid/uuid');

/*
    Class: ExtFlashGameEngine
    
    A client game engine that instantiates an External Adobe Flash-based fluency task game engine.  The config JSON should contain the following keys:
    
    * params - Any flash params that should be passed on to the swf program.
    * swfPath - The URL to the swf file to launch.
*/
exports.ExtFlashGameEngine = function ExtFlashGameEngine(json)
{
    alert('ExtFlashGame with params '+ json.params );
    this.params = json.params;
    this.swfPath = json.swfPath;
    var self = this;
    this.run = function (questionSet, div, callback)
    {
        var props = questionSet.allGameProperties();
        registerDoneCallback(callback);
        var flashID = 'CLFlashGameEngine_flashID';
        $('#game-container').height('570px');
        $(div).empty().append($('<div>').attr('id', flashID));
        swfobject.embedSWF(
            self.swfPath, //
            flashID,
            props.width || 974,
            props.height || 570,
            props.flashVersion || "10.0.0",
            false,
            self.params );
    };
};

var currentDoneCallback,
    currentDoneCallbackTimeout;

function registerDoneCallback(callback)
{
    currentDoneCallback = callback;
}

window.ExtFLashGameEngineDoneCallback = function ExtFLashGameEngineDoneCallback(xml)
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
