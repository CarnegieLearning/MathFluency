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
var util = require('util');

// Global Imports
var AudioMixer = require('AudioMixer').AudioMixer;
var KeyboardLayer = require('KeyboardLayer').KeyboardLayer

// Static Imports
var Content = require('Content').Content;
var MOT = require('ModifyOverTime').ModifyOverTime;
var NLC = require('NumberLineControl').NumberLineControl;
var XML = require('XML').XML;

// Project Imports
var Background = require('Background').Background;
var EOGD = require('EndOfGameDisplay').EndOfGameDisplay;
var HUD = require('HUD').HUD;
var QuestionSet = require('QuestionSet').QuestionSet;
var Question = require('Question').Question;

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
    version     : 'v 0.1',  // The version number
    
    questionList: [],       // List of all question sets in the input
    current     : -1,       // The index of the current QuestionSet
    
    crosshairs  : null,     // The cursor location
    hud         : null,     // Holds the player's heads up display
    ended       : false,    // If true, the gamew has ended
    
    answerLock  : true,     // 
    
    min_x       : 0,        // Minimum x value of crosshair
    max_x       : 0,        // Maximum x value of crosshair
    
    endOfGameCallback : null,   //Holds the name of the window function to call back to at the end of the game
    
    // Not the 'real init', sets up and starts preloading
    init: function(menu) {
        // You must always call the super class version of init
        FluencyApp.superclass.init.call(this);
        
        // Keep a reference to the menu layer
        this.menu = menu;
        
        // Allow this Layer to catch mouse events
        this.set('isMouseEnabled', true);
        
        // Set up basic audio
        var AM = AudioMixer.create();
        this.set('audioMixer', AM);
        
        // Get "command line" arguments from the div tag
        var app_div = $('#cocos_test_app')
        var xml_path = app_div.attr('data');
        this.set('gameID', app_div.attr('gameid'));
        this.set('endOfGameCallback', app_div.attr('callback'));
        
        // Create the player's crosshairs
        this.crosshairs = cocos.nodes.Sprite.create({file: '/resources/crosshairs.png'});
        this.crosshairs.set('scale', 0.25);
        
        // Set keyboard key bindings
        this.setBinding('MOVE_LEFT',    [65, 37]);  // [A, ARROW_LEFT]
        this.setBinding('MOVE_RIGHT',   [68, 39]);  // [D, ARROW_RIGHT]
        this.setBinding('ANSWER',       [32, 13]);  // [SPACE, ENTER]
        this.setBinding('ABORT',        [27]);      // [ESC]
        this.setBinding('DEBUG_PAUSE',  [80]);      // [P]
        
        // Create and add the HUD
        var h = HUD.create();
        this.set('hud', h);
        this.addChild({child: h});
        
        // Display version number
        this.versionLabel = cocos.nodes.Label.create({string: this.version});
        this.versionLabel.set('position', new geo.Point(800, 500));
        this.addChild({child: this.versionLabel});
        
        // Set up remote resources, default value allows for running 'locally'
        // TODO: Remove default in production, replace with error message
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
            var c = this.questionList[this.current];
            
            this.addChild({child: c});
            c.nextQuestion();
            
            this.min_x = c.get('position').x + c.numberline.get('position').x;
            this.max_x = this.min_x + c.numberline.length;
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
            pt.x = Math.max(Math.min(evt.locationInCanvas.x, this.max_x), this.min_x);
            
            this.crosshairs.set('position', pt);
        }
    },
    
    // Callback for mouseDown events
    mouseDown: function (evt) {
        if(!this.ended && this.current > -1 && !this.hud.paused) {
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
    
    // Parses the XML file and builds objects depending on it
    loadXML: function(root) {
        console.log(root);
        
        // Load time limits
        this.hud.setTimeLeft(XML.getDeepChildByName(root, 'TIME_LIMIT').value);
        
        // Load global scoring values
        var score = XML.getDeepChildByName(root, 'SCORING');
        if(score != null) {
            util.each('ptsCorrect ptsIncorrect ptsTimeout ptsQuestBonus'.w(), util.callback(this, function (name) {
                if(score.attributes.hasOwnProperty(name)) {
                    Question[name] = parseInt(score.attributes[name]);
                }
            }));
        }
        
        var medals = XML.getDeepChildByName(root, 'MEDALS');
        if(medals != null) {
            for(var i=0; i<medals.children.length; i++) {
                var m = medals.children[i]
                if(m.attributes.hasOwnProperty('Id') && m.attributes.hasOwnProperty('Score'))
                    NLC.medalScores[m.attributes['Id']] = parseInt(m.attributes['Score']);
            }
        }
        
        // Load the ProblemSet
        var qCount = 0
        var set = XML.getDeepChildByName(root, 'PROBLEM_SET');
        for(var i=0; i<set.children.length; i++) {
            // Loads a ProblemSubset
            this.questionList.push(QuestionSet.create(set.children[i]));
            events.addListener(this.questionList[i], 'endOfSet', this.onEndOfSet.bind(this));
            events.addListener(this.questionList[i], 'beforeNextQuestion', this.hud.onBeforeNextQuestion);
            events.addListener(this.questionList[i], 'questionTimerStart', this.hud.onQuestionTimerStart);
            events.addListener(this.questionList[i], 'scoreChange', this.hud.modifyScore.bind(this.hud));
            events.addListener(this.questionList[i], 'nextQuestion', this.unlock.bind(this));
            
            qCount += this.questionList[0].questions.length;
        }
        
        NLC.medalScores[0] = qCount * Question.ptsCorrect;
        
        // Loading completed
        this.loadingComplete();
    },
    
    // The 'real init' called after all the preloading/parsing is completed
    loadingComplete: function () {
        NLC.calcProportions();
        
        this.hud.delayedInit();
    
        this.background = Background.create();
        this.addChild({child: this.background});
        
        events.addListener(this.hud, 'stageTimeExpired', this.endOfGame.bind(this));
    },
    
    // Three second countdown before the game begins (after pressing the start button on the menu layer)
    // TODO: Make countdown more noticible
    countdown: function () {
        setTimeout(this.startGame.bind(this), 3000);
        
        var cd = cocos.nodes.Label.create({string: '3', textColor: '#000000'});
        cd.set('scaleX', 10);
        cd.set('scaleY', 10);
        cd.set('position', new geo.Point(400, 300));
        
        this.set('cdt', cd);
        this.addChild({child: cd});
        
        var that = this;
        setTimeout(function () { that.get('cdt').set('string', '2'); }, 1000)
        setTimeout(function () { that.get('cdt').set('string', '1'); }, 2000)
        setTimeout(function () { that.get('cdt').set('string', 'GO!'); that.get('cdt').set('position', new geo.Point(300, 300)); }, 3000)
        setTimeout(function () { that.removeChild(that.get('cdt')); }, 3500)
        
        //$(window).unload(this.endOfGame.bind(this, null));
    },
    
    // Starts the game
    startGame: function () {
        // Schedule per frame update function
        this.scheduleUpdate();
        
        this.onEndOfSet();
        
        this.addChild({child: this.crosshairs});
        this.crosshairs.set('position', new geo.Point((this.min_x + this.max_x) / 2, 220));
        this.crosshairs.set('zOrder', 10);
        
        this.hud.startGame();
    },

//============ Post Game =======================================================
    
    // Called when game ends, should collect results, display them to the screen and output the result XML
    endOfGame: function(finished) {
        if(this.ended)
            return;
    
        //$(window).unbind('unload')
        
        // Stopping the game
        s = cocos.Scheduler.get('sharedScheduler')
        s.unscheduleUpdateForTarget(this);
        s.unscheduleUpdateForTarget(this.hud);
        
        this.ended = true;
        
        // Removing any remaining visible content
        this.removeChild({child: this.crosshairs});
        this.removeChild({child: this.questionList[this.current]});
    
        // Bonus points for finishing quickly
        if(finished) {
            this.hud.modifyScore(Math.floor(this.hud.timeLeft) * NLC.ptsStageBonus)
        }
    
        var ql = this.get('questionList')
        var i = 0, correct = 0, incorrect = 0, unanswered = 0;
        
        // Tally question results
        for(subset in ql) {
            for(i in ql[subset].questions) {
                if(ql[subset].questions[i].isCorrect) {
                    correct += 1;
                }
                else if(ql[subset].questions[i].isTimeout) {
                    unanswered += 1;
                }
                else if(!ql[subset].questions[i].isCorrect){
                    incorrect += 1;
                }
                //else question was not reached and thus is not counted
            }
        }
        
        // Checks to see if abort was related to window.unload
        if(finished != null) {
            var e = EOGD.create(this.hud.elapsed, !finished, [correct, 0, (unanswered + incorrect)]);
            e.set('position', new geo.Point(250, 75));
            this.addChild({child: e});
            events.addListener(e, 'animationCompleted', this.menu.endGameButtons.bind(this.menu));
            e.start();
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
    
    // Cleans up critical running code so subsequent games can be played
    cleanup: function() {
    },

    // Writes the output xml file as a string and returns it
    writeXML: function(correct, state) {
    },

//============ In Game =========================================================
    
    // Handles answering the current question
    answerQuestion: function(ans) {
        if(!this.answerLock)
            if(this.questionList[this.current].giveAnswer(ans))
                this.answerLock = true;
    },
    
    // Removes the answer lock, allowing the player to answer the question
    unlock: function() {
        this.answerLock = false;
    },
    
    // Called every frame, manages keyboard input
    update: function(dt) {
        var pos = this.crosshairs.get('position');
    
        // Keyboard controls
        // Move the crosshairs to the left
        if(this.checkBinding('MOVE_LEFT') > KeyboardLayer.UP) {
            pos.x = Math.max(pos.x - 5, this.min_x);
        }
        
        // Move the crosshairs to the right
        if(this.checkBinding('MOVE_RIGHT') > KeyboardLayer.UP) {
            pos.x = Math.min(pos.x + 5, this.max_x);
        }
        
        // Select the current crosshair position as the answer
        if(this.checkBinding('ANSWER') == KeyboardLayer.PRESS && !this.hud.paused) {
            this.answerQuestion(pos.x);
        }
        
        // Quit the game
        if(this.checkBinding('ABORT') == KeyboardLayer.PRESS) {
            this.endOfGame(false);
        }
        
        // Pause the game
        if(this.checkBinding('DEBUG_PAUSE') == KeyboardLayer.PRESS) {
            this.hud.paused = !this.hud.paused;
            
            if(this.questionList[this.current].current < this.questionList[this.current].questions.length) {
                this.questionList[this.current].questions[this.questionList[this.current].current].paused = this.hud.paused;
            }
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
        opts['normalImage'] = '/resources/Start_Up.png';
        opts['selectedImage'] = '/resources/Start_Down.png';
        opts['disabledImage'] = '/resources/Start_Up.png';
        // We use this callback so we can do cleanup before handing everything over to the main game
        opts['callback'] = this.startButtonCallback.bind(this);
        
        var sb = cocos.nodes.MenuItemImage.create(opts);
        sb.set('position', new geo.Point(0, 0));
        this.set('startButton', sb);
        this.addChild({child: sb});
        
        var vc = cocos.nodes.MenuItemImage.create(opts);
        vc.set('position', new geo.Point(400, 250));
        this.set('volumeButtonOff', vc);
    },
    
    endGameButtons: function() {
        var opts = Object();
        opts['normalImage'] = '/resources/Retry_Up.png';
        opts['selectedImage'] = '/resources/Retry_Down.png';
        opts['disabledImage'] = '/resources/Retry_Up.png';
        opts['callback'] = this.retryButtonCallback.bind(this);
        
        var b = cocos.nodes.MenuItemImage.create(opts);
        b.set('position', new geo.Point(-25, 150));
        b.set('scaleX', 0.8);
        b.set('scaleY', 0.8);
        this.addChild({child: b});
        
        opts['normalImage'] = '/resources/Next_Up.png';
        opts['selectedImage'] = '/resources/Next_Down.png';
        opts['disabledImage'] = '/resources/Next_Up.png';
        opts['callback'] = this.nextButtonCallback.bind(this);
        
        b = cocos.nodes.MenuItemImage.create(opts);
        b.set('scaleX', 0.8);
        b.set('scaleY', 0.8);
        b.set('position', new geo.Point(-150, 150));
        this.addChild({child: b});
    },
    
    // Called when the button is pressed, clears the button, then hands control over to the main game
    startButtonCallback: function() {
        this.removeChild(this.get('startButton'));
        events.trigger(this, 'startGameEvent');
    },
    
    retryButtonCallback: function() {
        events.trigger(this, 'retryGameEvent');
    },
    
    nextButtonCallback: function() {
        events.trigger(this, 'nextGameEvent');
    }
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
    var menu = MenuLayer.create();
    var app = FluencyApp.create(menu);
    
    // Set up inter-layer events
    events.addListener(menu, 'startGameEvent', app.countdown.bind(app));
    
    // Add our layers to the scene
    scene.addChild({child: app});
    scene.addChild({child: menu});

    // Run the scene
    director.runWithScene(scene);
};
