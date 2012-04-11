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
var EOGD = require('EndOfGameDisplay').EndOfGameDisplay;
var Game = require('Game').Game;
var KeyboardLayer = require('KeyboardLayer').KeyboardLayer;
var Preloader = require('Preloader').Preloader;

// Static Imports
var MAC = require('MathAttackControl').MathAttackControl;
var MOT = require('ModifyOverTime').ModifyOverTime;
var XML = require('XML').XML;
var Content = require('Content').Content;

// TODO: De-magic number these
/* Zorder
0   Anything not mentioned
*/

// Create a new layer
// TODO: Clean up main, it is getting bloated
var FluencyApp = KeyboardLayer.extend({
    questionList: [],       // List of all questions in the input
    audioMixer  : null,     // AudioMixer for sound effects
    musicMixer  : null,     // AudioMixer for music
    gameID      : '',       // Unique ID for the game
    
    started     : false,    // When true, the game has started
    ended       : false,    // When true, the game has ended
    
    endOfGameCallback : null,   // Holds the name of the window function to call back to at the end of the game
    
    version     : 'v 0.9.5',    // Current version number
    
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
        
        // Load custom font
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', 'http://themes.googleusercontent.com/static/fonts/terminaldosis/v5/SwfduKDlxm7-vFPpKzhxuQTqTpp7o-vVvHh7B9lSITo.woff', true);
        //xmlhttp.open('GET', 'sound/TerminalDosis-ExtraBold.ttf', true);
        xmlhttp.onreadystatechange=function() {
            if (xmlhttp.readyState==4) {
                if(xmlhttp.status == 200 || xmlhttp.status == 304) {
                    // Font is loaded
                }
            }
        }
        xmlhttp.send(null);
        
        // Explicitly enable audio
        AudioMixer.enabled = true;
        
        // Set up basic audio
        var dir = 'sound/mathattack/';
        var AM = AudioMixer.create();
        this.set('audioMixer', AM);
        
        var MM = AudioMixer.create();
        MM.loadSound('bg', dir + 'PuzzlePrelude8-1-10v1');
        this.set('musicMixer', MM);
        
        // Create 'preloader' to buy time for initialization and loading
        var preloader = Preloader.create();
        this.addChild({child: preloader});
        this.set('preloader', preloader);
        
        events.addListener(preloader, 'loaded', this.delayedInit.bind(this));
    },
    
    delayedInit: function() {
        // Remove the 'preloader'
        var preloader = this.get('preloader');
        this.removeChild({child: preloader});
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(preloader);
        this.set('preloader', null);
        
        // Get "command line" arguments from the div tag
        var app_div = $('#cocos_test_app');
        var xml_path = app_div.attr('data');
        this.set('gameID', app_div.attr('gameid'));
        this.set('endOfGameCallback', app_div.attr('callback'));
        
        // Allow this Layer to catch mouse events
        this.set('isMouseEnabled', true);
        
        // Set up remote resources, default value allows for running 'locally'
        // TODO: Remove default in production, replace with error
        __remote_resources__["resources/testset.xml"] = {meta: {mimetype: "application/xml"}, data: xml_path ? xml_path : "ma.xml"};
        
        // Preload remote resources
        var p = cocos.Preloader.create();
        events.addListener(p, 'complete', this.runRemotely.bind(this));
        p.load();
        
        events.trigger(this, 'loaded');
    },
    
    // Parses the level xml file
    parseXML: function(xmlDoc) {
        var xml = XML.parser(xmlDoc.firstChild);
    
        // Parse and process questions
        this.game = Game.create(xml);
        
        this.preprocessingComplete();
    },
    
    // The 'real init()' called after all the preloading/parsing is completed
    preprocessingComplete: function () {
        // Create key bindings
        this.setBinding('ABORT', [27]); // [ESC]
        
        this.addChild({child: this.game});
        
        // Add version number
        var vtag = cocos.nodes.Label.create({string: this.get('version')});
        vtag.set('anchor-point', new geo.Point(0.5, 0.5));
        vtag.set('position', new geo.Point(850, 590));
        this.addChild({child: vtag});
    },
    
    // Three second countdown before the game begins (after pressing the start button on the menu layer)
    // TODO: Make countdown more noticible
    countdown: function() {
        // Set audio levels
        this.musicMixer.setMasterVolume(0.35);
        
        setTimeout(this.startGame.bind(this), 2500);
        
        var cd = cocos.nodes.Label.create({string: '3', fontColor: '#000000', fontName: MAC.font});
        cd.set('scaleX', 10);
        cd.set('scaleY', 10);
        cd.set('position', new geo.Point(450, 300));
        
        this.set('cdt', cd);
        this.addChild({child: cd});
        
        var that = this;
        setTimeout(function () { that.get('cdt').set('string', '2'); }, 750);
        setTimeout(function () { that.get('cdt').set('string', '1'); }, 1500);
        setTimeout(function () { that.get('cdt').set('string', 'GO!'); that.get('cdt').set('position', new geo.Point(375, 300)); }, 2250);
        setTimeout(function () { that.removeChild(that.get('cdt')); }, 2750);
        
        // Catch window unloads at this point as aborts
        $(window).unload(this.endOfGame.bind(this, null));
    },
    
    // Starts the game
    startGame: function() {
        this.started = true;
        events.addListener(this.game, 'endOfGame', this.endOfGame.bind(this, true));
        
        this.musicMixer.loopSound('bg');
        
        this.scheduleUpdate();
        this.game.startGame();
    },
    
    // Called when game ends, should collect results, display them to the screen and output the result XML
    // finished = null on window.unload, false on abort, true on completion
    endOfGame: function(finished) {
        if(this.ended)
            return;
        this.ended = true;
        $(window).unbind('unload')
        
        // Stopping the game
        s = cocos.Scheduler.get('sharedScheduler');
        s.unscheduleUpdateForTarget(this);
        s.unscheduleUpdateForTarget(this.game);
        
        // Remove the menu layer
        this.menuLayer.removeChild({child: this.menuLayer.musicButtonOn});
        this.menuLayer.removeChild({child: this.menuLayer.musicButtonOff});
        this.menuLayer.removeChild({child: this.menuLayer.volumeButtonOn});
        this.menuLayer.removeChild({child: this.menuLayer.volumeButtonOff});
        
        // Checks to see if abort was related to window.unload
        if(finished != null) {
            var rs = [];
            
            for(var i=0; i<this.game.questions.length; i+=1) {
                rs[i] = this.game.questions[i].score;
            }
            
            this.fadeOut();
            
            var e = EOGD.create(this.game.timeElapsed, !finished, rs);
            e.set('position', new geo.Point(210, 25));
            e.set('zOrder', 12);
            
            this.addChild({child: e});
            setTimeout(e.start.bind(e), 1000);
            
            console.log(this.writeXML('FINISH'));
        }
    
        // If the 'command line' specified a call back, feed the callback the xml
        if(this.get('endOfGameCallback')) {
            if(finished) {
                window[this.get('endOfGameCallback')](this.writeXML('FINISH'));
            }
            else {
                window[this.get('endOfGameCallback')](this.writeXML('ABORT'));
            }
        }
    },
    
    fadeOut: function() {
        this.fadePane = cocos.nodes.Sprite.create({file: '/resources/whiteback.png'});
        this.fadePane.set('position', new geo.Point(450, 300));
        this.fadePane.set('zOrder', 1);
        this.fadePane.set('opacity',0);
        this.addChild({child: this.fadePane});
    
        MOT.create(0, 255, 0.5).bind(this.fadePane, 'opacity');
        
        var that = this;
        MOT.create(0, 255, 1).bind(that.fadePane, 'opacity');
    },

    // Writes the output xml file as a string and returns it
    // TODO: Decide on a new format if needed and update
    writeXML: function(state) {
        // Get needed values
        var ref = this.get('gameID');
        var g = this.game;
        
        var t = g.timeElapsed;
        var s = g.score;
        var m = ' - ';
        
        // Determine medal string
        if(state == 'FINISH') {
            if(s >= MAC.medalScores[1])
                m = "Gold";
            else if(s >= MAC.medalScores[2])
                m = "Silver";
            else if(s >= MAC.medalScores[3])
                m = "Bronze";
        }
        
        // Convert times to milliseconds for reporting
        t = Math.round(t * 1000);
        
        // Question level details
        var detail = '';
        for(var i=0; i<g.questions.length; i+=1) {
            detail += g.questions[i].toXML(i+1);
        }
        
        // Build the XML string
        var x =
        '<OUTPUT>\n' + 
        '    <GAME_REFERENCE_NUMBER ID="' + ref + '"/>\n' + 
        '    <SCORE_SUMMARY>\n' + 
        '        <Score CorrectAnswers="' + g.rightTotal + '" IncorrectAnswers="' + g.wrongTotal + '" BonusSeconds="' + g.bonusTotal + '" ElapsedTime="' + t + '" Score="' + s +'" Medal="' + m + '"/>\n' + 
        '    </SCORE_SUMMARY>\n' +
        '    <SCORE_DETAIL>\n' +
                detail +
        '    </SCORE_DETAIL>\n' + 
        '    <END_STATE STATE="' + state + '"/>\n' +
        '</OUTPUT>';
        
        return x;
    },
    
    // Code to be run when the game is finished
    cleanup: function() {
        // Clear the bind
        $(window).unbind('unload');
        
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
        var MM = this.get('musicMixer');
        MM.setMute(!MM.get('muted'));
    },
    
    // Called every frame, manages keyboard input
    update: function(dt) {
        // 'ESC' Abort game, discreet
        if(this.checkBinding('ABORT') == KeyboardLayer.PRESS && this.started && !this.ended) {
            this.game.abortGame();
            this.endOfGame(false);
        }
        
    },
    
    // Callback for mouseDown events
    mouseDown: function (evt) {
        if(this.started && !this.ended) {
            this.game.input(evt.locationInCanvas.x, evt.locationInCanvas.y);
        }
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
        var dir = '/resources/';
    
        // Create the button
        var opts = Object();
        opts['normalImage']   = dir + 'button-start.png';
        opts['selectedImage'] = dir + 'button-start.png';
        opts['disabledImage'] = dir + 'button-start.png';
        // We use this callback so we can do cleanup before handing everything over to the main game
        opts['callback'] = this.startButtonCallback.bind(this);
        
        var sb = cocos.nodes.MenuItemImage.create(opts);
        sb.set('position', new geo.Point(0, 0));
        sb.set('scaleX', 0.5);
        sb.set('scaleY', 0.5);
        this.set('startButton', sb);
        this.addChild({child: sb});
        
        // Create the volume control
        dir = '/resources/';
        // TODO: Make a better basic (toggle)button (extend MenuItemImage?)
        opts['normalImage'] = dir + 'fx-on.png';
        opts['selectedImage'] = dir + 'fx-click.png';
        opts['disabledImage'] = dir + 'fx-click.png';
        opts['callback'] = this.volumeCallback.bind(this);
        
        var vc = cocos.nodes.MenuItemImage.create(opts);
        vc.set('position', new geo.Point(425, 170));
        this.set('volumeButtonOn', vc);
        this.addChild({child: vc});
        
        opts['normalImage'] = dir + 'music-on.png';
        opts['selectedImage'] = dir + 'music-click.png';
        opts['disabledImage'] = dir + 'music-click.png';
        opts['callback'] = this.musicCallback.bind(this);
        vc = cocos.nodes.MenuItemImage.create(opts);
        vc.set('position', new geo.Point(425, 205));
        this.set('musicButtonOn', vc);
        this.addChild({child: vc});
        
        opts['normalImage'] = dir + 'fx-off.png';
        opts['selectedImage'] = dir + 'fx-click.png';
        opts['disabledImage'] = dir + 'fx-click.png';
        opts['callback'] = this.volumeCallback.bind(this);
        
        vc = cocos.nodes.MenuItemImage.create(opts);
        vc.set('position', new geo.Point(425, 170));
        this.set('volumeButtonOff', vc);
        
        opts['normalImage'] = dir + 'music-off.png';
        opts['selectedImage'] = dir + 'music-click.png';
        opts['disabledImage'] = dir + 'music-click.png';
        opts['callback'] = this.musicCallback.bind(this);
        vc = cocos.nodes.MenuItemImage.create(opts);
        vc.set('position', new geo.Point(425, 205));
        this.set('musicButtonOff', vc);
    },
    
    // Called when the button is pressed, clears the button, then hands control over to the main game
    startButtonCallback: function() {
        this.removeChild(this.get('startButton'));
        events.trigger(this, "startGameEvent");
    },
    
    volumeCallback: function() {
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
    
    // Setup the director
    var director = cocos.Director.get('sharedDirector');
    director.attachInView(document.getElementById('cocos_test_app'));
    
    var scene = cocos.nodes.Scene.create();     // Create a scene
    var app = FluencyApp.create();              // Create the layers
    var menu = MenuLayer.create();
    
    // Set up inter-layer events
    events.addListener(app, 'loaded', menu.createMenu.bind(menu));
    
    events.addListener(menu, 'startGameEvent', app.countdown.bind(app));
    events.addListener(menu, 'muteAudioEvent', app.muteAudioHandler.bind(app));
    events.addListener(menu, 'muteMusicEvent', app.muteMusicHandler.bind(app));
    
    // Add our layers to the scene
    scene.addChild({child: app});
    scene.addChild({child: menu});
    
    // Allow the App layer to directly access the UI layer
    app.set('menuLayer', menu);
    app.set('scene', scene);
    
    // Run the scene
    director.runWithScene(scene);
};