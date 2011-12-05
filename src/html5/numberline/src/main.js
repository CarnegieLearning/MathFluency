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

// Global Imports
var AudioMixer = require('AudioMixer').AudioMixer;
var KeyboardLayer = require('KeyboardLayer').KeyboardLayer

// Static Imports
var Content = require('Content').Content;
var MOT = require('ModifyOverTime').ModifyOverTime;
var XML = require('XML').XML;

// Project Imports
var Background = require('Background').Background;
var HUD = require('HUD').HUD;
var QuestionSet = require('QuestionSet').QuestionSet;

// TODO: De-magic number these
/* Zorder
-10 Background
0   Anything not mentioned
1   Hashmarks
*/

// Create a new layer
// TODO: Clean up main, it is getting bloated0
var FluencyApp = KeyboardLayer.extend({
    audioMixer  : null,     // AudioMixer
    gameID      : '',       // Unique ID for the game
    questionList: [],       // List of all question sets in the input
	current		: -1,		// The index of the current QuestionSet
	crosshairs	: null,		// The cursor location
    hud         : null,     // Holds the player's heads up display
    ended       : false,    // If true, the gamew has ended
    version     : 'v 0.0',  // The version number
    
    endOfGameCallback : null,   //Holds the name of the window function to call back to at the end of the game
    
    // Not the 'real init', sets up and starts preloading
    init: function() {
        // You must always call the super class version of init
        FluencyApp.superclass.init.call(this);
        
		this.set('isMouseEnabled', true);
		
        // Set up basic audio
        var AM = AudioMixer.create();
        this.set('audioMixer', AM);
        
        // Get "command line" arguments from the div tag
        var app_div = $('#cocos_test_app')
        var xml_path = app_div.attr('data');
        this.set('gameID', app_div.attr('gameid'));
        this.set('endOfGameCallback', app_div.attr('callback'));
        
		this.crosshairs = cocos.nodes.Sprite.create({file: '/resources/crosshairs.png'});
        this.crosshairs.set('scale', 0.25);
        
        // Set keyboard key bindings
        this.setBinding('MOVE_LEFT',    [65, 37]);  // [A, ARROW_LEFT]
        this.setBinding('MOVE_RIGHT',   [68, 39]);  // [D, ARROW_RIGHT]
        this.setBinding('ANSWER',       [32, 13]);  // [SPACE, ENTER]
		
        // Create and add the HUD
        var h = HUD.create();
        this.set('hud', h);
        this.addChild({child: h});
        
        // Set up remote resources, default value allows for running 'locally'
        // TODO: Remove default in production, replace with error
        __remote_resources__["/resources/testset.xml"] = {meta: {mimetype: "application/xml"}, data: xml_path ? xml_path : "numberline.xml"};
        
        // Preload remote resources
        var p = cocos.Preloader.create();
        events.addListener(p, 'complete', this.runRemotely.bind(this));
        p.load();
    },
	
//============ Event handlers ==================================================
	
	// Callback for when a QuestionSet ends
	onEndOfSet: function() {
		if(this.current < this.questionList.length - 1) {
            if(this.current > -1) {
                this.removeChild({child: this.questionList[this.current]});
            }
			this.current += 1;
			this.addChild({child: this.questionList[this.current]});
            this.questionList[this.current].nextQuestion();
		}
		else {
			// End game
            this.endOfGame(true);
		}
	},
	
	// Callback for whenever the mouse is moved in canvas
	mouseMoved: function(evt) {
        if(this.current > -1 && !this.ended) {
            var pt = this.crosshairs.get('position');
        
            var c = this.questionList[this.current];
            var min_x = c.get('position').x + c.numberline.get('position').x;
            var max_x = min_x + c.numberline.length;
            pt.x = Math.max(Math.min(evt.locationInCanvas.x, max_x), min_x);
            
            this.crosshairs.set('position', pt);
        }
	},
	
	// Callback for mouseDown events
	mouseDown: function (evt) {
        if(!this.ended && this.current > -1) {
            this.answerQuestion(evt.locationInCanvas.x);
        }
	},
	
//============ Pre Game ========================================================
	
	// Remote resources loaded successfully, proceed as normal
    runRemotely: function() {
        if(resource("/resources/testset.xml") !== undefined) {
            console.log(resource("/resources/testset.xml"));
            this.loadXML(XML.parser(resource("/resources/testset.xml").firstChild));
        }
        else {
            console.log("ERROR: No remote XML found to parse.");
        }
    },
    
    loadXML: function(root) {
        console.log(root);
        
        this.hud.setTimeLeft(XML.getDeepChildByName(root, 'TIME_LIMIT').value);
        
        var set = XML.getDeepChildByName(root, 'PROBLEM_SET');
        for(var i=0; i<set.children.length; i++) {
            this.questionList.push(QuestionSet.create(set.children[i]));
            events.addListener(this.questionList[i], 'endOfSet', this.onEndOfSet.bind(this));
            events.addListener(this.questionList[i], 'beforeNextQuestion', this.hud.onBeforeNextQuestion);
            events.addListener(this.questionList[i], 'questionTimerStart', this.hud.onQuestionTimerStart);
        }
        
        this.preprocessingComplete();
    },
    
    // The 'real init()' called after all the preloading/parsing is completed
    preprocessingComplete: function () {
        this.background = Background.create();
        this.addChild({child: this.background});
        
        this.versionLabel = cocos.nodes.Label.create({string: this.version});
        this.versionLabel.set('position', new geo.Point(800, 500));
        this.addChild({child: this.versionLabel});
        
        events.addListener(this.hud, 'stageTimeExpired', this.endOfGame.bind(this));
    },
    
    // Three second countdown before the game begins (after pressing the start button on the menu layer)
    // TODO: Make countdown more noticible
    countdown: function () {
        setTimeout(this.startGame.bind(this), 3000);
        
        //$(window).unload(this.endOfGame.bind(this, null));
    },
    
    // Starts the game
    startGame: function () {
        // Schedule per frame update function
        this.scheduleUpdate();
        
        this.onEndOfSet();
        
        this.addChild({child: this.crosshairs});
        this.crosshairs.set('position', new geo.Point(400, 220));
        this.crosshairs.set('zOrder', 10);
        
        this.hud.startGame();
    },

//============ Post Game =======================================================
    
    // Called when game ends, should collect results, display them to the screen and output the result XML
    endOfGame: function(finished) {
        //$(window).unbind('unload')
    
        s = cocos.Scheduler.get('sharedScheduler')
        s.unscheduleUpdateForTarget(this);
        s.unscheduleUpdateForTarget(this.hud);
        
        this.ended = true;
        
        this.removeChild({child: this.crosshairs});
        this.removeChild({child: this.questionList[this.current]});
    
        var ql = this.get('questionList')
        var i = 0, correct = 0, incorrect = 0, unanswered = 0;
        
        // Tally question results
        while(i < ql.length) {
            if(ql[i].get('answeredCorrectly')) {
                correct += 1;
            }
            else if(ql[i].get('answeredCorrectly') == false) {
                incorrect += 1;
            }
            else {
                unanswered += 1;
            }
            i += 1;
        }
        
        // Checks to see if abort was related to window.unload
        if(finished != null) {
        }
    
        // If the 'command line' specified a call back, feed the callback the xml
        if(this.get('endOfGameCallback')) {
            if(finished) {
                window[this.get('endOfGameCallback')](this.writeXML(correct, 'FINISH'));
            }
            else {
                window[this.get('endOfGameCallback')](this.writeXML(correct, 'ABORT'));
            }
        }
    },
	
	cleanup: function() {
	},

    // Writes the output xml file as a string and returns it
    writeXML: function(correct, state) {
    },

//============ In Game =========================================================
    
    // Handles answering the current question
    answerQuestion: function(ans) {
		this.questionList[this.current].giveAnswer(ans);
    },
    
    // Called every frame, manages keyboard input
    update: function(dt) {
        var pos = this.crosshairs.get('position');
    
        // Keyboard controls
        if(this.checkBinding('MOVE_LEFT') > KeyboardLayer.UP) {
            var c = this.questionList[this.current];
            var min_x = c.get('position').x + c.numberline.get('position').x;
            pos.x = Math.max(pos.x - 5, min_x);
        }
        if(this.checkBinding('MOVE_RIGHT') > KeyboardLayer.UP) {
            var c = this.questionList[this.current];
            var max_x = c.get('position').x + c.numberline.get('position').x + c.numberline.length;
            pos.x = Math.min(pos.x + 5, max_x);
        }
        if(this.checkBinding('ANSWER') == KeyboardLayer.PRESS) {
            this.answerQuestion(pos.x);
        }
	},
});

var MenuLayer = cocos.nodes.Menu.extend({
    startButton : null,     // Holds the button to start the game
    startGame   : null,     // Holds the function in the app that starts the game
    init: function(hook) {
        MenuLayer.superclass.init.call(this, {});
        
        // Create the button
        var opts = Object();
        opts['normalImage'] = '/resources/start-button.png';
        opts['selectedImage'] = '/resources/start-button.png';
        opts['disabledImage'] = '/resources/start-button.png';
        // We use this callback so we can do cleanup before handing everything over to the main game
        opts['callback'] = this.startButtonCallback.bind(this);
        
        var sb = cocos.nodes.MenuItemImage.create(opts);
        sb.set('position', new geo.Point(0, 0));
        sb.set('scaleX', 0.5);
        sb.set('scaleY', 0.5);
        this.set('startButton', sb);
        this.addChild({child: sb});
        
        var vc = cocos.nodes.MenuItemImage.create(opts);
        vc.set('position', new geo.Point(400, 250));
        this.set('volumeButtonOff', vc);
    },
    
    // Called when the button is pressed, clears the button, then hands control over to the main game
    startButtonCallback: function() {
        this.removeChild(this.get('startButton'));
        events.trigger(this, 'startGameEvent');
    },
});

//========== Main program body ================================================

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
    
    Content.initialize();
    
    // Attach director to our <div> element
    var director = cocos.Director.get('sharedDirector');
    director.attachInView(document.getElementById('cocos_test_app'));
    
    // Create a scene and layers
    var scene = cocos.nodes.Scene.create();
    var app = FluencyApp.create();
    var menu = MenuLayer.create();
    
    // Set up inter-layer events
    events.addListener(menu, 'startGameEvent', app.countdown.bind(app));
    
    // Add our layers to the scene
    scene.addChild({child: app});
    scene.addChild({child: menu});

    // Run the scene
    director.runWithScene(scene);
};
