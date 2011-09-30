var uuid = require('../node_modules/node-uuid/uuid');

/*
    Class: CLHTML5GameEngine
    
    A client game engine that instantiates an HTML5 Cocos-based Carnegie Learning fluency task game engine.  The config JSON should contain the following keys:
    
    * dataPath - The base URL to input data.
    * scriptPath - The base URL to the directory containing HTML5 javascript.
    
    When the <run> method is called, the questionSet (or its parent stage) should define the following property:
    
    * input - The name of the input file XML file relative to dataPath.
*/
exports.CLHTML5GameEngine = function CLHTML5GameEngine(json)
{
    this.scriptPath = json.scriptPath;
    this.dataPath = json.dataPath;
    var self = this;
    this.run = function (questionSet, div, callback)
    {
        var props = questionSet.allGameProperties();
        registerDoneCallback(callback);
        
        $('#game-container').height('610px');
        var app_div = $('<div>');
        app_div.attr('id', 'cocos_test_app');
        app_div.attr('data', self.dataPath + '/' + props.input);
        app_div.attr('gameID', uuid() + '::' + 'CLFlashGameEngine' + '::' + questionSet.parent.id + '::' + questionSet.id);
        app_div.attr('callback', 'CLHTML5GameEngineDoneCallback');
        
        $(div).empty().append(app_div);
        
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = self.scriptPath + '/' + 'cocos_test.js';
        head.appendChild(script);
    };
};

var currentDoneCallback,
    currentDoneCallbackTimeout;

function registerDoneCallback(callback)
{
    currentDoneCallback = callback;
}

window.CLHTML5GameEngineDoneCallback = function CLHTML5GameEngineDoneCallback(xml)
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
