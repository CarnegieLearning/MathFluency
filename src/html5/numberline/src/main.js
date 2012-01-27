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
var NLC = require('NumberLineControl').NumberLineControl;
var XML = require('XML').XML;

// Project Imports
var EOGD = require('EndOfGameDisplay').EndOfGameDisplay;
var HUD = require('HUD').HUD;
var QuestionSet = require('QuestionSet').QuestionSet;
var Question = require('Question').Question;
var ClawNode = require('Claw').ClawNode;
var Preloader = require('Preloader').Preloader;

// TODO: De-magic number these
/* Zorder
-10 Cabinet Background
-3  Claw Bar
-2  ClawNode (Claw.js)
-1  Cabinet Foreground
0   Anything not mentioned
2   End Of Game Display
*/

// Create a new layer
// TODO: Clean up main, it is getting bloated0
var FluencyApp = KeyboardLayer.extend({
    audioMixer  : null,     // AudioMixer
    gameID      : '',       // Unique ID for the game
    version     : 'v 0.9',  // The version number
    
    questionList: [],       // List of all question sets in the input
    current     : -1,       // The index of the current QuestionSet
    
    cursor      : null,     // The cursor location
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
        
        // Set up basic audio
        var AM = AudioMixer.create();
        this.set('audioMixer', AM);
        
        // Run the 'preloader'
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
    
        // Allow this Layer to catch mouse events
        this.set('isMouseEnabled', true);
        
        // Get "command line" arguments from the div tag
        var app_div = $('#cocos_test_app')
        var xml_path = app_div.attr('data');
        this.set('gameID', app_div.attr('gameid'));
        this.set('endOfGameCallback', app_div.attr('callback'));
        
        // Create the player's cursor
        this.cursor = cocos.nodes.Sprite.create({file: '/resources/General_Wireframe/Red_Dot.png'});
        
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
        this.versionLabel.set('position', new geo.Point(875, 590));
        this.addChild({child: this.versionLabel});
        
        this.claw = ClawNode.create();
        this.claw.set('position', new geo.Point(100, 160));
        this.claw.set('anchorPoint', new geo.Point(0.5, 0));
        this.claw.set('zOrder', -2)
        this.addChild({child: this.claw});
        
        // Cabinet Background
        this.bg = cocos.nodes.Sprite.create({file: '/resources/General_Wireframe/Cabinet/Cabinet_Background.png'});
        this.bg.set('scaleX', 0.8);
        this.bg.set('scaleY', 0.8);
        this.bg.set('anchorPoint', new geo.Point(0, 0));
        this.bg.set('zOrder', -10);
        this.addChild({child: this.bg});
        
        //Claw Bar
        this.bar = cocos.nodes.Sprite.create({file: '/resources/General_Wireframe/Claw_Bar.png'});
        this.bar.set('position', new geo.Point(-5, 190));
        this.bar.set('anchorPoint', new geo.Point(0, 0));
        this.bar.set('zOrder', -3);
        this.addChild({child: this.bar});
        
        // Cabinet Foreground
        this.fg = cocos.nodes.Sprite.create({file: '/resources/General_Wireframe/Cabinet/Cabinet_Foreground.png'});
        this.fg.set('scaleX', 0.8);
        this.fg.set('scaleY', 0.8);
        this.fg.set('anchorPoint', new geo.Point(0, 0));
        this.fg.set('zOrder', -1);
        this.addChild({child: this.fg});
        
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
            
            if(this.current != 0) {
                c.nextQuestion();
            }
            // Special case, first set
            else {
                c.nextQuestionForced();
            }
            
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
            var pt = this.cursor.get('position');
            pt.x = Math.max(Math.min(evt.locationInCanvas.x, this.max_x), this.min_x);
            
            this.cursor.set('position', pt);
        }
    },
    
    // Callback for mouseDown events
    mouseDown: function (evt) {
        if(!this.ended && this.current > -1 && !this.hud.paused) {
            this.answerQuestion(evt.locationInCanvas.x);
        }
        
        console.log(evt.locationInCanvas.x + ' , ' + evt.locationInCanvas.y);
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
        
        var bands = XML.getDeepChildByName(root, 'BANDS');
        if(bands != null) {
            for(var i=0; i<bands.children.length; i++) {
                //TODO: Load bands from XML file
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
            
            qCount += this.questionList[i].questions.length;
        }
        
        NLC.medalScores[0] = qCount * Question.ptsCorrect;
        
        // Loading completed
        this.loadingComplete();
    },
    
    // The 'real init' called after all the preloading/parsing is completed
    loadingComplete: function () {
        NLC.calcProportions();
        
        this.hud.delayedInit();
        
        events.addListener(this.hud, 'stageTimeExpired', this.endOfGame.bind(this));
        
        this.menu.createMenu();
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
        
        this.addChild({child: this.cursor});
        this.cursor.set('position', new geo.Point((this.min_x + this.max_x) / 2, 200 + QuestionSet.NumberLineY));
        this.cursor.set('zOrder', 10);
        
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
        this.removeChild({child: this.cursor});
        this.removeChild({child: this.questionList[this.current]});
    
        // Bonus points for finishing quickly
        if(finished) {
            this.hud.modifyScore(Math.floor(this.hud.timeLeft) * NLC.ptsStageBonus)
        }
    
        var ql = this.get('questionList')
        var correct = 0, almost = 0, incorrect = 0, unanswered = 0;
        var summary = [];
        
        // Tally question results
        for(var i=0; i<ql.length; i+=1) {
            for(var j=0; j<ql[i].questions.length; j+=1) {
                if(ql[i].questions[j].correctness == 0) {
                    correct += 1;
                }
                else if(ql[i].questions[j].correctness == 1) {
                    almost += 1;
                }
                else if(!ql[i].questions[j].correctness == 2){
                    incorrect += 1;
                }
                else if(ql[i].questions[j].isTimeout) {
                    unanswered += 1;
                }
                summary.push([ql[i].questions[j].correctValue, ql[i].questions[j].playerValue]);
                //else question was not reached and thus is not counted
            }
        }
        
        // Checks to see if abort was related to window.unload
        if(finished != null) {
            var e = EOGD.create(this.hud.elapsed, !finished, [correct, almost, (unanswered + incorrect)]);
            e.set('position', new geo.Point(210, 25));
            e.set('zOrder', 2);
            this.addChild({child: e});
            events.addListener(e, 'animationCompleted', this.menu.endGameButtons.bind(this.menu));
            e.start();
        }
    
        // If the 'command line' specified a call back, feed the callback the xml
        if(this.get('endOfGameCallback')) {
            if(finished) {
                window[this.get('endOfGameCallback')](this.writeXML(summary, correct, almost, incorrect, 'FINISH'));
            }
            else {
                window[this.get('endOfGameCallback')](this.writeXML(summary, correct, almost, incorrect, 'ABORT'));
            }
        }
    },
    
    // Cleans up critical running code so subsequent games can be played
    cleanup: function() {
    },

    // Writes the output xml file as a string and returns it
    writeXML: function(summary, correct, almost, incorrect, state) {
        // Get needed values
        var ref = this.get('gameID');
        
        var m;
        
        // Determine medal string
        if(this.hud.score > NLC.medalScores[1] && state == 'FINISH') {
            m = "Gold";
        }
        else if(this.hud.score > NLC.medalScores[2] && state == 'FINISH') {
            m = "Silver";
        }
        else if(this.hud.score > NLC.medalScores[3] && state == 'FINISH') {
            m = "Bronze";
        }
        else {
            m = " - ";
        }
        
        // Build the XML string
        var x =
        '<OUTPUT>\n' + 
        '    <GAME_REFERENCE_NUMBER ID="' + ref + '"/>\n' + 
        '    <SCORE_SUMMARY>\n' + 
        '        <Score Correct="' + correct +'" Almost="' + almost + '" Incorrect="' + incorrect + '" TotalScore="' + this.hud.score +'" Medal="' + m + '"/>\n' + 
        '    </SCORE_SUMMARY>\n' +
        '    <SCORE_DETAILS>\n';
                var i = 0;
                while(i < summary.length) {
                x += '        <SCORE QuestionIndex="' + (i+1) +'" AnswerValue="' +  summary[i][0] + '" AnswerGiven="' + summary[i][1] + '"/>\n';
                i += 1;
                }
            x += '    </SCORE_DETAILS>\n' + 
        '    <END_STATE STATE="' + state + '"/>\n' +
        '</OUTPUT>';
        
        return x;
    },

//============ In Game =========================================================
    
    // Handles answering the current question
    answerQuestion: function(ans) {
        if(!this.answerLock)
            var retVal = this.questionList[this.current].giveAnswer(ans)
            if(retVal >= 0 && retVal <= 2) {
                this.answerLock = true;
                this.claw.grabAt(ans, retVal);
                this.hud.modifyItemCount();
            }
    },
    
    // Removes the answer lock, allowing the player to answer the question
    unlock: function() {
        this.answerLock = false;
    },
    
    // Called every frame, manages keyboard input
    update: function(dt) {
        var pos = this.cursor.get('position');
    
        // Keyboard controls
        // Move the cursor to the left
        if(this.checkBinding('MOVE_LEFT') > KeyboardLayer.UP) {
            pos.x = Math.max(pos.x - 5, this.min_x);
        }
        
        // Move the cursor to the right
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
    
    retryButtonHandler: function(evt) {
        window.runStage(window.currentSequence, window.currentStage);
    }
});

var MenuLayer = cocos.nodes.Menu.extend({
    startButton : null,     // Holds the button to start the game
    startGame   : null,     // Holds the function in the app that starts the game
    init: function() {
        MenuLayer.superclass.init.call(this, {});
    },
    
    createMenu: function() {
        // Create the button
        var dir = '/resources/Buttons/';
        var opts = Object();
        opts['normalImage'] = dir + 'Start_Norm.png';
        opts['selectedImage'] = dir + 'Start_Down.png';
        opts['disabledImage'] = dir + 'Start_Norm.png';
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
    
    // Adds the next level and retry buttons to the score card
    endGameButtons: function() {
        var dir = '/resources/Buttons/';
        var opts = Object();
        opts['normalImage'] = dir + 'Retry_Norm.png';
        opts['selectedImage'] = dir + 'Retry_Down.png';
        opts['disabledImage'] = dir + 'Retry_Norm.png';
        opts['callback'] = this.retryButtonCallback.bind(this);
        
        var b = cocos.nodes.MenuItemImage.create(opts);
        b.set('position', new geo.Point(-190, 25));
        b.set('anchorPoint', new geo.Point(0, 0));
        b.set('scaleX', 0.3);
        b.set('scaleY', 0.3);
        this.addChild({child: b});
        /*
        opts['normalImage'] = dir + 'Next_Norm.png';
        opts['selectedImage'] = dir + 'Next_Down.png';
        opts['disabledImage'] = dir + 'Next_Norm.png';
        opts['callback'] = this.nextButtonCallback.bind(this);
        
        b = cocos.nodes.MenuItemImage.create(opts);
        b.set('position', new geo.Point(-190, 150));
        b.set('anchorPoint', new geo.Point(0, 0));
        b.set('scaleX', 0.3);
        b.set('scaleY', 0.3);
        this.addChild({child: b});*/
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
    events.addListener(menu, 'retryGameEvent', app.retryButtonHandler.bind(app));
    
    // Add our layers to the scene
    scene.addChild({child: app});
    scene.addChild({child: menu});

    // Run the scene
    director.runWithScene(scene);
};
