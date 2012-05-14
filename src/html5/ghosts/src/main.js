/*
Copyright 2011, Carnegie Learning

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

// Import the cocos2d module
var cocos = require('cocos2d');
var geo = require('geometry');
var events = require('events');

// Project Imports
var AudioMixer = require('AudioMixer').AudioMixer;
var Game = require('Game').Game;
var KeyboardLayer = require('KeyboardLayer').KeyboardLayer
var Preloader = require('Preloader').Preloader;

// Static Imports
var MOT = require('ModifyOverTime').ModifyOverTime;
var XML = require('XML').XML;
var Content = require('Content').Content;
var GC = require('GhostsControl').GhostsControl;

// TODO: De-magic number these
/* Zorder
-10 Background
-5  Finish Line
-4  Trees
-1  Dashboard
0   Anything not mentioned
100 Question Delimiters
*/

// Create a new layer
// TODO: Clean up main, it is getting bloated
var FluencyApp = KeyboardLayer.extend({
    audioMixer  : null,     // AudioMixer for sound effects
    musicMixer  : null,     // AudioMixer for music
    gameID      : '',       // Unique ID for the game
    
    endOfGameCallback : null,   //Holds the name of the window function to call back to at the end of the game
    
    version     : 'v 1.1.0',    // Current version number
    
    // Remote resources loaded successfully, proceed as normal
    runRemotely: function() {
        if(resource("resources/testset.xml") !== undefined) {
            this.parseXML(resource("resources/testset.xml"));
        }
        else {
            console.log("ERROR: No remote XML found to parse.");
        }
    },
    
    // Not the 'real init', sets up and starts preloading
    init: function() {
        // You must always call the super class version of init
        FluencyApp.superclass.init.call(this);
        
        Content.initialize();
        
        this.set('isMouseEnabled', true);
        
        // Explicitly enable audio
        AudioMixer.enabled = true;
        // Set up basic audio
        var AM = AudioMixer.create();
        var dir = "sound/ghosts/";
        this.set('audioMixer', AM);
        AM.loadSound('button', dir + 'Correct v2');
        AM.loadSound('wrong', dir + 'Incorrect v1');
        AM.loadSound('correct', dir + 'GoV_1');
        GC.AM = AM;
        
        var MM = AudioMixer.create();
        this.set('musicMixer', MM);
        MM.loadSound('intro', dir + 'EarlyOneMorning4-24-12v10');
        MM.loadSound('bg', dir + 'EggsAndCheese4-24-12v10');
        MM.loadSound('question', dir + 'HumptyDumptyPlease4-24-12v10');
        GC.MM = MM;
        
        var preloader = Preloader.create();
        this.addChild({child: preloader});
        this.set('preloader', preloader);
        
        events.addListener(preloader, 'loaded', this.delayedInit.bind(this));
    },
    
    delayedInit: function() {
        // Remove the 'preloader'
        var preloader = this.get('preloader')
        this.removeChild({child: preloader});
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(preloader);
        this.set('preloader', null);
        
        // Get "command line" arguments from the div tag
        var app_div = $('#cocos_test_app')
        var xml_path = app_div.attr('data');
        this.set('gameID', app_div.attr('gameid'));
        this.set('endOfGameCallback', app_div.attr('callback'));
        
        // Set up remote resources, default value allows for running 'locally'
        // TODO: Remove default in production, replace with error
        __remote_resources__["resources/testset.xml"] = {meta: {mimetype: "application/xml"}, data: xml_path ? xml_path : "set002.xml"};
        
        // Preload remote resources
        var p = cocos.Preloader.create();
        //events.addListener(p, 'complete', this.runRemotely.bind(this));
        events.addListener(p, 'complete', this.preprocessingComplete.bind(this));
        p.load();
        
        events.trigger(this, 'loaded');
    },
    
    // Parses the level xml file
    parseXML: function(xmlDoc) {
        var xml = XML.parser(xmlDoc.firstChild);
        
        this.preprocessingComplete();
    },
    
    // The 'real init()' called after all the preloading/parsing is completed
    preprocessingComplete: function() {
        this.game = Game.create();
        this.game.set('position', new geo.Point(0, 0));
        this.game.set('anchorPoint', new geo.Point(50, 0));
        this.addChild({child: this.game});
        events.addListener(this.game, 'endOfGame', this.endOfGame.bind(this, true));
    
        // Create key bindings
        this.setBinding('MOVE_LEFT',    [65, 37]);  // [A, ARROW_LEFT]
        this.setBinding('MOVE_RIGHT',   [68, 39]);  // [D, ARROW_RIGHT]
        this.setBinding('MOVE_UP',      [87, 38]);  // [W, ARROW_UP]
        this.setBinding('MOVE_DOWN',    [83, 40]);  // [S, ARROW_DOWN]
        
        // Add version number
        var vtag = cocos.nodes.Label.create({string: this.get('version')});
        vtag.set('anchor-point', new geo.Point(0.5, 0.5));
        vtag.set('position', new geo.Point(850, 590));
        this.addChild({child: vtag});
        
        // Create back pane to force redraws
        this.bg = cocos.nodes.Sprite.create({file: '/resources/fade.png'});
        this.bg.set('position', new geo.Point(450, 300));
        this.bg.set('zOrder', -10);
        this.addChild({child: this.bg});
    },
    
    // Starts the game
    startGame: function() {
        // Catch window unloads at this point as aborts
        $(window).bind('beforeunload', this.unloadCatcher.bind(this));
        
        this.musicMixer.setMasterVolume(0.35);              // Set audio levels
        $(window).unload(this.endOfGame.bind(this, null));  // Catch window unloads at this point as aborts
        
        events.addListener(this.game, 'endIntro', this.menuLayer.addVolumeControl.bind(this.menuLayer));
        
        this.game.start();                                  // 
        this.scheduleUpdate();                              // Start keyboard input tracking
    },
    
    // Handles attempts to leave the page
    unloadCatcher: function () { 
        if (!this.game.finished) {
            // Push data to server in case that the player confirms leaving the page
            if(this.get('endOfGameCallback')) {
                window[this.get('endOfGameCallback')](this.writeXML('ABORT'));
            }
            return 'Are you sure you want to leave the page and quit the game?';
        }
    },
    
    // Called when game ends, should collect results, display them to the screen and output the result XML
    // finished = null on window.unload, false on abort, true on completion
    endOfGame: function(finished) {
        if(finished != null) {
            $(window).unbind('unload')
            $(window).unload(this.cleanup.bind(this, null));
        }
        else {
            this.cleanup();
        }
        
        // Checks to see if abort was related to window.unload
        if(finished != null) {
        }
        
        this.get('musicMixer').stopSound('bg');
        
        console.log(this.writeXML('FINISH'));
        
        // If the 'command line' specified a call back, feed the callback the xml
        if(this.get('endOfGameCallback')) {
            if(finished) {
                window[this.get('endOfGameCallback')](this.writeXML('FINISH'));
            }
            else {
                window[this.get('endOfGameCallback')](this.writeXML('ABORT'));
            }
        }
        
        this.cleanup();
    },

    // Writes the output xml file as a string and returns it
    // TODO: Decide on a new format if needed and update
    writeXML: function(state) {
        // Get needed values
        var ref = this.get('gameID');
        
        // Build the XML string
        var x =
        '<OUTPUT>\n' + 
        '    <GAME_REFERENCE_NUMBER ID="' + ref + '"/>\n' + 
        '    <SCORE_SUMMARY>\n' +
        '        <SCORE ElapsedTime="' + Math.round(this.elapsedTime*1000) + '" Score="0" Medal="-"/>\n' +
        '    </SCORE_SUMMARY>\n' +
        this.game.toXML() +
        '    <END_STATE STATE="' + state + '"/>\n' +
        '</OUTPUT>';
        
        return x;
    },
    
    // Code to be run when the game is finished
    cleanup: function() {
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this);
        
        var d = cocos.Director.get('sharedDirector');
        
        // Stop the main loop and clear the scenes
        d.stopAnimation();
        delete d.sceneStack.pop();
        delete d.sceneStack.pop();
        
        // Clear the setup functions
        d.attachInView = null;
        d.runWithScene = null;
        
        // Clear the animating functions
        d.startAnimation = null;
        d.animate = null;
        d.drawScene = null;
        
        // Clear the instance
        d._instance = null;
    },
    
    // Toggles the AudioMixer's mute
    muteAudioHandler: function() {
        var AM = this.get('audioMixer');
        AM.setMute(!AM.get('muted'));
    },
    
    // Toggles the MusicMixer's mute
    muteMusicHandler: function() {
        var AM = this.get('musicMixer');
        AM.setMute(!AM.get('muted'));
    },
    
    // Called every frame, manages keyboard input
    update: function(dt) {
        // 'A' / 'LEFT' Move left, discreet
        if(this.checkBinding('MOVE_LEFT') == KeyboardLayer.PRESS) {
            this.game.movePlayer(0, -1);
        }
        // 'D' / 'RIGHT' Move right, discreet
        else if(this.checkBinding('MOVE_RIGHT') == KeyboardLayer.PRESS) {
            this.game.movePlayer(0, 1);
        }
        // 'S' / 'DOWN' Move down, discreet
        else if(this.checkBinding('MOVE_DOWN') == KeyboardLayer.PRESS) {
            this.game.movePlayer(1, 0);
        }
        // 'W' / 'UP' Move up, discreet
        else if(this.checkBinding('MOVE_UP') == KeyboardLayer.PRESS) {
            this.game.movePlayer(-1, 0);
        }
        
        // 'ESC' Abort game, discreet
        if(this.checkBinding('ABORT') == KeyboardLayer.PRESS) {
            //this.endOfGame(false);
        }
    },
    
    // Catches the mouse down event
    mouseDown: function (evt) {
        this.game.processMouseDown(evt.locationInCanvas.x, evt.locationInCanvas.y);
    },
    
    // Catches the mouse up event
    mouseUp: function (evt) {
        this.game.processMouseUp(evt.locationInCanvas.x, evt.locationInCanvas.y);
    },
    
    // Catches the mouse drag event
    mouseDragged: function (evt) {
        this.game.processMouseDrag(evt.locationInCanvas.x, evt.locationInCanvas.y);
    }
});

// For button-like interactions (e.g. starting the game)
// TODO: Extend Menu with functions making it easier to tie the Menu into an app
var MenuLayer = cocos.nodes.Menu.extend({
    startButton : null,     // Holds the button to start the game
    startGame   : null,     // Holds the function in the app that starts the game
    
    muted       : false,    // State of the volume mute button
    mutedMusic  : false,    // State of the volume mute button
    
    init: function() {
        MenuLayer.superclass.init.call(this, {});
    },
    
    createMenu: function() {
        // Create the button
        var opts = Object();
        opts['normalImage'] = '/resources/snow_start.png';
        opts['selectedImage'] = '/resources/snow_start.png';
        opts['disabledImage'] = '/resources/snow_start.png';
        // We use this callback so we can do cleanup before handing everything over to the main game
        opts['callback'] = this.startButtonCallback.bind(this);
        
        var sb = cocos.nodes.MenuItemImage.create(opts);
        sb.set('position', new geo.Point(-50, 0));
        sb.set('scaleX', 0.5);
        sb.set('scaleY', 0.5);
        this.set('startButton', sb);
        this.addChild({child: sb});
    },
    
    // Called when the button is pressed, clears the button, then hands control over to the main game
    startButtonCallback: function() {
        this.removeChild(this.get('startButton'));
        events.trigger(this, "startGameEvent");
    },
    
    addVolumeControl: function() {
        var opts = {};
        // Create the volume control
        // TODO: Make a better basic (toggle)button (extend MenuItemImage?)
        opts['normalImage'] = '/resources/volume-control.png';
        opts['selectedImage'] = '/resources/volume-control.png';
        opts['disabledImage'] = '/resources/volume-control.png';
        opts['callback'] = this.audioCallback.bind(this);
        
        var vc = cocos.nodes.MenuItemImage.create(opts);
        vc.set('position', new geo.Point(425, 250));
        this.set('volumeButtonOn', vc);
        this.addChild({child: vc});
        
        opts['callback'] = this.musicCallback.bind(this);
        vc = cocos.nodes.MenuItemImage.create(opts);
        vc.set('position', new geo.Point(375, 250));
        this.set('musicButtonOn', vc);
        this.addChild({child: vc});
        
        opts['normalImage'] = '/resources/volume-control-off.png';
        opts['selectedImage'] = '/resources/volume-control-off.png';
        opts['disabledImage'] = '/resources/volume-control-off.png';
        opts['callback'] = this.audioCallback.bind(this);
        
        vc = cocos.nodes.MenuItemImage.create(opts);
        vc.set('position', new geo.Point(425, 250));
        this.set('volumeButtonOff', vc);
        
        opts['callback'] = this.musicCallback.bind(this);
        vc = cocos.nodes.MenuItemImage.create(opts);
        vc.set('position', new geo.Point(375, 250));
        this.set('musicButtonOff', vc);
    },
    
    // Called when the volume button is pressed
    // TODO: Seperate this into two functions (mute/unmute)?
    // TODO: Implement a slider/levels to set master volume
    audioCallback: function() {
        events.trigger(this, "muteAudioEvent");
        
        var m = this.get('muted')
        if(!m) {
            this.removeChild(this.get('volumeButtonOn'));
            this.addChild({child: this.get('volumeButtonOff')});
        }
        else {
            this.removeChild(this.get('volumeButtonOff'));
            this.addChild({child: this.get('volumeButtonOn')});
        }
        this.set('muted', !m);
    },
    
    musicCallback: function() {
        events.trigger(this, "muteMusicEvent");
        
        var m = this.get('mutedMusic')
        if(!m) {
            this.removeChild(this.get('musicButtonOn'));
            this.addChild({child: this.get('musicButtonOff')});
        }
        else {
            this.removeChild(this.get('musicButtonOff'));
            this.addChild({child: this.get('musicButtonOn')});
        }
        this.set('mutedMusic', !m);
    },
    
    // Adds the retry button to the MenuLayer
    addRetryButton: function() {
        var opts = Object();
        opts['normalImage'] = '/resources/scoreboard/Retry_Up.png';
        opts['selectedImage'] = '/resources/scoreboard/Retry_Down.png';
        opts['disabledImage'] = '/resources/scoreboard/Retry_Up.png';
        opts['callback'] = this.retryButtonCallback.bind(this);
        
        var b = cocos.nodes.MenuItemImage.create(opts);
        b.set('position', new geo.Point(10-450+300, 230-300+175));
        b.set('scaleX', 0.8);
        b.set('scaleY', 0.8);
        this.addChild({child: b});
    },
    
    retryButtonCallback: function() {
        window.runStage(window.currentSequence, window.currentStage);
    }
});

// Initialise application
exports.main = function() {
    // From: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
    // This defines function.bind for web browsers that have not implemented it:
    // Firefox < 4 ; Chrome < 7 ; IE < 9 ; Safari (all) ; Opera (all)
    if (!Function.prototype.bind) {  
        Function.prototype.bind = function (oThis) {  
        
            if (typeof this !== "function") { // closest thing possible to the ECMAScript 5 internal IsCallable function  
                throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");  
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {},
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
                };  

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }
    
    //HACK: Emergency FF12
    window.cancelRequestAnimFrame = (function() {
      return window.cancelCancelRequestAnimationFrame ||
             window.webkitCancelRequestAnimationFrame ||
             window.mozCancelRequestAnimationFrame ||
             window.oCancelRequestAnimationFrame ||
             window.msCancelRequestAnimationFrame ||
             window.clearTimeout;

    })(); 
    
    // Setup the director
    var director = cocos.Director.get('sharedDirector');
    director.attachInView(document.getElementById('cocos_test_app'));
    
    var scene = cocos.nodes.Scene.create();     // Create a scene
    var app = FluencyApp.create();              // Create the layers
    var menu = MenuLayer.create();
    
    // Allow the App layer to directly access the UI layer
    app.set('menuLayer', menu);
    
    // Set up inter-layer events
    events.addListener(app, 'loaded', menu.createMenu.bind(menu));
    
    events.addListener(menu, 'startGameEvent', app.startGame.bind(app));
    events.addListener(menu, 'muteAudioEvent', app.muteAudioHandler.bind(app));
    events.addListener(menu, 'muteMusicEvent', app.muteMusicHandler.bind(app));
    
    // Add our layers to the scene
    scene.addChild({child: app});
    scene.addChild({child: menu});
    
    // Run the scene
    director.runWithScene(scene);
};