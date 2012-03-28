var swfobject = require('./lib/swfobject').swfobject,
    uuid = require('../node_modules/node-uuid/uuid');

/*
    Class: JavaGameEngine
    
    A client game engine that instantiates an External Adobe Flash-based fluency task game engine.  The config JSON should contain the following keys:
    
    * params - Any flash params that should be passed on to the swf program.
    * swfPath - The URL to the swf file to launch.
*/
exports.JavaGameEngine = function JavaGameEngine(json)
{
    this.params = json.params;
    this.params.callback = 'JavaGameEngineDoneCallback';
    this.height = '768px';
    this.width = '1024px';
    this.classPath = this.params.classPath;
    this.code = this.params.code;
    if( this.params.divid )
        this.divid = this.params.divid
    else
        this.divid = 'java_game';
        
    var self = this;
    
    this.run = function (questionSet, div, callback)
    {
        var props = questionSet.allGameProperties();
        registerDoneCallback(callback);
        $('#game-container').height( self.height );
        var app_div = $('<div>');
        app_div.attr('id', self.divid );
        app_div.attr('gameID', uuid() + '::' + 'JavaGameEngine' + '::' + questionSet.parent.id + '::' + questionSet.id);
        app_div.attr('callback', 'JavaGameEngineDoneCallback');
    
        for( var p in this.params ){
            if( p == 'divid' || p == 'script' )
                continue;
            app_div.attr( p, this.params[p] );
        }
        $(div).empty().append(app_div);
        
        var head = document.getElementsByTagName('head')[0];
        var applet = document.createElement('applet');
        applet.code = self.code;
        applet.archive = slef.classPath;
        head.appendChild(applet);
    };
};

var currentDoneCallback,
    currentDoneCallbackTimeout;

function registerDoneCallback(callback)
{
    currentDoneCallback = callback;
}

window.JavaGameEngineDoneCallback = function JavaGameEngineDoneCallback(results)
{
    // When a game is aborted, a finish callback and an abort callback happen in quick succession. This can lead to duplicate data on the server. To work around this issue, we delay calling the real callback, only letting the last one through.
    if (currentDoneCallbackTimeout)
    {
        clearTimeout(currentDoneCallbackTimeout);
    }
    currentDoneCallbackTimeout = setTimeout(function ()
    {
        currentDoneCallback(results);
    }, 100);
};
