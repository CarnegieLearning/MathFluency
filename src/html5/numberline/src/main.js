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
var Intermission = require('Intermission').Intermission;
var KeyboardLayer = require('KeyboardLayer').KeyboardLayer
var PNode = require('PerspectiveNode').PerspectiveNode;

// Static Imports
var MOT = require('ModifyOverTime').ModifyOverTime;
var XML = require('XML').XML;

// TODO: De-magic number these
/* Zorder
0   Anything not mentioned
*/

// Create a new layer
// TODO: Clean up main, it is getting bloated
var FluencyApp = KeyboardLayer.extend({
    audioMixer  : null,     // AudioMixer
    gameID      : '',       // Unique ID for the game
    questionList: [],       // List of all question sets in the input
	current		: -1,		// The index of the current QuestionSet
	crosshairs	: null,		// The cursor location
    
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
        
		this.crosshairs = cocos.nodes.Node.create({file: resources('/resources/crosshairs.png')});
		this.crosshairs.set('position', new geo.Point(400, 300));
		this.addChild({child: this.crosshairs});
		
        // Set up remote resources, default value allows for running 'locally'
        // TODO: Remove default in production, replace with error
        __remote_resources__["resources/testset.xml"] = {meta: {mimetype: "application/xml"}, data: xml_path ? xml_path : "set002.xml"};
        
        // Preload remote resources
        var p = cocos.Preloader.create();
        events.addListener(p, 'complete', this.runRemotely.bind(this));
        p.load();
    },
	
//============ Event handlers ==================================================
	
	// Callback for when a QuestionSet ends
	onEndOfSet: function() {
		if(this.current > -1) {
			this.removeChild({child: this.questionList[this.current]});
		}
		if(this.current > this.questionList.length) {
			this.current += 1;
			this.addChild({child: this.questionList[this.current]});
		}
		else {
			// End game
		}
	},
	
	// Callback for whenever the mouse is moved in canvas
	mouseMoved: function(evt) {
		var pt = this.crosshairs.get('position');
		pt.x = evt.locationInCanvas.x;
		this.crosshairs.set('position', pt);
	},
	
	// Callback for mouseDown events
	mouseDown: function (evt) {
		this.answerQuestion(1);
	},
	
	// Callback for mouseUp events
	mouseUp: function (evt) {
		// Not needed currently
	},
	
//==============================================================================
	
	// Remote resources loaded successfully, proceed as normal
    runRemotely: function() {
        if(resource("resources/testset.xml") !== undefined) {
            this.parseXML(resource("resources/testset.xml"));
        }
        else {
            console.log("ERROR: No remote XML found to parse.");
        }
    },
    
    // The 'real init()' called after all the preloading/parsing is completed
    preprocessingComplete: function () {
    },
    
    // Three second countdown before the game begins (after pressing the start button on the menu layer)
    // TODO: Make countdown more noticible
    countdown: function () {
        setTimeout(this.startGame.bind(this), RC.initialCountdown);
        
        $(window).unload(this.endOfGame.bind(this, null));
    },
    
    // Starts the game
    startGame: function () {
        // Schedule per frame update function
        this.scheduleUpdate();
    },
    
    // Called when game ends, should collect results, display them to the screen and output the result XML
    endOfGame: function(finished) {
        $(window).unbind('unload')
    
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this);
    
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
    
    // Handles answering the current question
    answerQuestion: function(ans) {
		this.questionList.giveAnswer(ans);
    },
    
    // Called every frame, manages keyboard input
    update: function(dt) {
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
    
    // Get director
    var director = cocos.Director.get('sharedDirector');

    // Attach director to our <div> element
    director.attachInView(document.getElementById('cocos_test_app'));
    
    // Create a scene
    var scene = cocos.nodes.Scene.create();

    // Create our layers
    var app = FluencyApp.create();
    
    // Add our layers to the scene
    scene.addChild({child: app});

    // Run the scene
    director.runWithScene(scene);
};
