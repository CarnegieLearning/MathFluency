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

var LabelBG = require('LabelBG').LabelBG;   //HACK

// Static Imports
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
    
    endOfGameCallback : null,   // Holds the name of the window function to call back to at the end of the game
    
    version     : 'v 0.2.0',    // Current version number
    
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
        Content.registerContent(LabelBG.identifier, LabelBG);   //HACK
        
        // Explicitly enable audio
        AudioMixer.enabled = true;
        var dir = 'sound/mathattack/'
        // Set up basic audio
        var AM = AudioMixer.create();
        this.set('audioMixer', AM);
        
        var MM = AudioMixer.create();
        this.set('musicMixer', MM);
        
        this.ended = false;
        
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
        var vtag = cocos.nodes.Label.create({string: this.get('version')})
        vtag.set('anchor-point', new geo.Point(0.5, 0.5));
        vtag.set('position', new geo.Point(850, 590));
        this.addChild({child: vtag});
    },
    
    // Three second countdown before the game begins (after pressing the start button on the menu layer)
    // TODO: Make countdown more noticible
    countdown: function () {
        // Set audio levels
        this.musicMixer.setMasterVolume(0.35);
        
        setTimeout(this.startGame.bind(this), 2500);
        
        var cd = cocos.nodes.Label.create({string: '3', fontColor: '#000000'});
        cd.set('scaleX', 10);
        cd.set('scaleY', 10);
        cd.set('position', new geo.Point(450, 300));
        
        this.set('cdt', cd);
        this.addChild({child: cd});
        
        var that = this;
        setTimeout(function () { that.get('cdt').set('string', '2'); }, 750)
        setTimeout(function () { that.get('cdt').set('string', '1'); }, 1500)
        setTimeout(function () { that.get('cdt').set('string', 'GO!'); that.get('cdt').set('position', new geo.Point(300, 300)); }, 2250)
        setTimeout(function () { that.removeChild(that.get('cdt')); }, 2750)
        
        // Catch window unloads at this point as aborts
        $(window).unload(this.endOfGame.bind(this, null));
    },
    
    // Starts the game
    startGame: function () {
        this.scheduleUpdate();
        this.game.startGame();
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

    /*/ Writes the output xml file as a string and returns it
    // TODO: Decide on a new format if needed and update
    writeXML: function(state) {
        // Get needed values
        var ref = this.get('gameID');
        var d = this.get('dash');
        var e = d.get('elapsedTime');
        var p = d.get('pTime');
        var m = ' - ';
        
        // Determine medal string
        if(state == 'FINISH') {
            if(e + p < RC.times[1])
                m = "Gold";
            else if(e + p < RC.times[2])
                m = "Silver";
            else if(e + p < RC.times[3])
                m = "Bronze";
        }
        
        // Convert times to milliseconds for reporting
        e = Math.round(e * 1000)
        p = Math.round(p * 1000)
        
        // Build the XML string
        var x =
        '<OUTPUT>\n' + 
        '    <GAME_REFERENCE_NUMBER ID="' + ref + '"/>\n' + 
        '    <SCORE_SUMMARY>\n' + 
        '        <Score CorrectAnswers="' + correct +'" ElapsedTime="' + e + '" PenaltyTime="' + p + '" TotalScore="' + (e + p) +'" Medal="' + m + '"/>\n' + 
        '    </SCORE_SUMMARY>\n' +
        '    <SCORE_DETAILS>\n';
                var i = 0;
                var ql = this.get('questionList');
                while(i < ql.length) {
                x += '        <SCORE QuestionIndex="' + (i+1) +'" AnswerValue="' +  ql[i].get('correctAnswer') + '" TimeTaken="' + Math.round(ql[i].get('timeElapsed') * 1000) + '" LaneChosen="' + ql[i].get('answer') + '"/>\n';
                i += 1;
                }
            x += '    </SCORE_DETAILS>\n' + 
        '    <END_STATE STATE="' + state + '"/>\n' +
        '</OUTPUT>';
        
        return x;
    },*/
    
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
    
    muteMusicHandler: function() {
        var MM = this.get('musicMixer');
        MM.setMute(!MM.get('muted'));
    },
    
    // Called every frame, manages keyboard input
    update: function(dt) {
        // 'ESC' Abort game, discreet
        if(this.checkBinding('ABORT') == KeyboardLayer.PRESS) {
            this.endOfGame(false);
        }
        
    },
    
    // Callback for mouseDown events
    mouseDown: function (evt) {
        if(!this.ended) {
            this.game.input(evt.locationInCanvas.x, evt.locationInCanvas.y);
        }
        
        console.log(evt.locationInCanvas.x + ' , ' + evt.locationInCanvas.y);
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
        opts['normalImage']   = dir + 'buttonStartNormal.png';
        opts['selectedImage'] = dir + 'buttonStartClick.png';
        opts['disabledImage'] = dir + 'buttonStartNormal.png';
        // We use this callback so we can do cleanup before handing everything over to the main game
        opts['callback'] = this.startButtonCallback.bind(this);
        
        var sb = cocos.nodes.MenuItemImage.create(opts);
        sb.set('position', new geo.Point(0, 0));
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
    events.addListener(menu, 'musicMuteEvent', app.muteMusicHandler.bind(app));
    events.addListener(menu, 'audioMuteEvent', app.muteAudioHandler.bind(app));
    
    // Add our layers to the scene
    scene.addChild({child: app});
    scene.addChild({child: menu});
    
    // Allow the App layer to directly access the UI layer
    app.set('menuLayer', menu);
    
    // Run the scene
    director.runWithScene(scene);
};