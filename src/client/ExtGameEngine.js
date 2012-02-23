var swfobject = require('./lib/swfobject').swfobject,
    uuid = require('../node_modules/node-uuid/uuid');

/*
    Class: ExtGameEngine
    
    A client game engine that instantiates an External Adobe Flash-based fluency task game engine.  The config JSON should contain the following keys:
    
    * params - Any flash params that should be passed on to the swf program.
    * swfPath - The URL to the swf file to launch.
*/
exports.ExtGameEngine = function ExtGameEngine(json)
{
    this.params = json.params;
    this.params.callback = 'ExtGameEngineDoneCallback';
    this.isFlashGame = false;
    if( json.swfPath ){
        this.isFlashGame = true;
        this.swfPath = json.swfPath;
        this.divid = 'CLFlashGameEngine_flashID';
        this.height = '570px';
    } else {
        this.height = '610px';
        this.scriptPath = this.params.scriptPath;
        if( this.params.divid )
            this.divid = this.params.divid
        else
            this.divid = 'cocos_test_app';
        if( this.params.script )
            this.script = this.params.script;
        else
            this.script = 'cocos_test.js';
    }
    var self = this;
    
    this.run = function (questionSet, div, callback)
    {
        var props = questionSet.allGameProperties();
        registerDoneCallback(callback);
        $('#game-container').height( self.height );
        var app_div = $('<div>');
        app_div.attr('id', self.divid );
        
        if( self.isFlashGame ){
            swfobject.embedSWF(
                self.swfPath, //
                flashID,
                props.width || 974,
                props.height || 570,
                props.flashVersion || "10.0.0",
                false,
                self.params,
                {
                    'AllowScriptAccess': 'always'
                } );
                $(div).empty().append(app_div);
        } else {
            app_div.attr('gameID', uuid() + '::' + 'ExtGameEngine' + '::' + questionSet.parent.id + '::' + questionSet.id);
            app_div.attr('callback', 'ExtGameEngineDoneCallback');
            
            for( var p in this.params ){
                if( p == 'divid' || p == 'script' )
                    continue;
                app_div.attr( p, this.params[p] );
            }
            $(div).empty().append(app_div);
            
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = self.scriptPath + '/' + self.script;
            head.appendChild(script);
        }
    };
};

var currentDoneCallback,
    currentDoneCallbackTimeout;

function registerDoneCallback(callback)
{
    currentDoneCallback = callback;
}

window.ExtGameEngineDoneCallback = function ExtGameEngineDoneCallback(results)
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
