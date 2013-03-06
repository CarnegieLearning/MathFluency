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
    
    Games developed with this code must be released with CC-Attribution and use
    the splash screen image/animation located at www.yyy.com as the form of attrubtion.
*/

// Import the cocos2d module
var cocos = require('cocos2d');
var geo = require('geometry');
var events = require('events');
var remote = require('remote_resources');
var Texture2D = require('cocos2d').Texture2D;

// Project Imports
var AudioMixer = require('/AudioMixer');
var Background = require('/Background');
var Dashboard = require('/Dashboard');
var Intermission = require('/Intermission');
var KeyboardLayer = require('/KeyboardLayer');
var Player = require('/Player');
var PNode = require('/PerspectiveNode');
var PNodeA = require('/PerspectiveNodeAnim');
var Question = require('/Question');
var EOGD = require('/EndOfGameDisplay');
var PreloadScene = require('/PreloadScene');
var SplashScreen = require('/SplashScreen');

// Scripting System import and shortcuts
var RS = require('/ScriptingSystem-Racecar');
var ER = RS.eventRelay;

// Static Imports
var RC = require('/RaceControl');
var MOT = require('/ModifyOverTime');
var XML = require('/XML');
var Content = require('/Content');

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
function FluencyApp () {
    // You must always call the super class version of init
    FluencyApp.superclass.constructor.call(this);
    
    Content.initialize();
    
    this.loadGame();
    this.isMouseEnabled = true;
}

FluencyApp.inherit(RS.RacecarScripting, {
    player      : null,     // Holds the player
    background  : null,     // Holds the the background object
    dash        : null,     // Holds the right hand side dashboard
    audioMixer  : null,     // AudioMixer for sound effects
    musicMixer  : null,     // AudioMixer for music
	
    questionList: [],       // List of all questions in the input
	interList	: [],		// Refenences to all intermissions
	roadList	: [],		// Refences to all items on the sid eof the road
    medalCars   : [],       // Contains the pace cars
    inters		: [],       // Holds the list of checkpoints
	
    gameID      : '',       // Unique ID for the game
    
    bgFade      : false,    // True when crossfading between bg tracks
    bgFast      : false,    // True when playing bg_fast, false when playing bg_slow
    
    lanePosX    : {2: [-3, 3], 3: [-3.8, 0, 3.8]},
    lane        : 1,
    
    endOfGameCallback : null,   // Holds the name of the window function to call back to at the end of the game
    
    velocityLock: false,    // Prevents turbo and (ac/de)celleration when true
    laneLock:[0, 0, 0],     // 0 prevents nothing, 1 prevents moving in, 2 prevents moving out, 3 prevents both
    
    revertableVelocity: 0,  // Holds the player velocity prior to a setVelocity Action which enables the revertVelocity Action
    
    skipSplash  : false,    // When true, skip the splash screen completely
    
    version     : 'v 3.1',    // Current version number

    // Begin Overhaul
    
    // Only things done once per GAME are done here
    loadGame: function() {
        // Explicitly enable audio
        AudioMixer.enabled = true;
        var dir = 'sound/'
        // Set up basic audio
        var AM = new AudioMixer();
        AM.loadSound('screech',      dir + 'CarScreech2');
        AM.loadSound('decel',        dir + 'SlowDown');
        AM.loadSound('accel',        dir + 'SpeedUp');
        AM.loadSound('turbo',        dir + 'Turboboost');
        AM.loadSound('start',        dir + 'EngineStart');
        AM.loadSound('hum',          dir + 'Engine Hum');
        AM.loadSound('correct',      dir + 'Correct v1');
        AM.loadSound('wrong',        dir + 'Incorrect v1');
        AM.loadSound('finish',       dir + 'FinishLine v1');
        AM.loadSound('intermission', dir + 'Numberchange v1');
        AM.loadSound('countdown',    dir + 'countdown');
        this.audioMixer = AM;
        
        var MM = new AudioMixer();
        MM.loadSound('bg_slow', dir + 'Racecar v3-2');
        MM.loadSound('bg_fast', dir + 'Racecar FAST v3-2');
        MM.loadSound('bg_open', dir + 'Racecar Opening Chord');
        this.musicMixer = MM;

        events.addListener(MM, 'crossFadeComplete', this.onCrossFadeComplete.bind(this));

        // Create key bindings
        this.setBinding('MOVE_LEFT',    [65, 37]);  // [A, ARROW_LEFT]
        this.setBinding('MOVE_RIGHT',   [68, 39]);  // [D, ARROW_RIGHT]
        this.setBinding('SPEED_UP',     [87, 38]);  // [W, ARROW_UP]
        this.setBinding('SPEED_DOWN',   [83, 40]);  // [S, ARROW_DOWN]
        this.setBinding('TURBO',        [32]);      // [SPACE]
        this.setBinding('ABORT',        [27]);      // [ESC]
        this.setBinding('SHOW_FPS',     [80]);      // [P]
        
        // Generate things to the side of the road
        var dir = '/resources/sidewalk_stuff/';
        this.roadSprites = [
            new cocos.nodes.Sprite({file: dir + 'sideWalkCrack01.png',}),
            new cocos.nodes.Sprite({file: dir + 'sideWalkCrack02.png',}),
            new cocos.nodes.Sprite({file: dir + 'tire.png',}),
            new cocos.nodes.Sprite({file: dir + 'tirePile01.png',}),
            new cocos.nodes.Sprite({file: dir + 'tirePile02.png',})
        ];
        
        var anim = [];
        var texture = new Texture2D({file: module.dirname + '/resources/sidewalk_stuff/trashCanSheet.png'});
        for(var i=0; i<18; i+=1) {
            anim.push(new cocos.SpriteFrame({texture: texture, rect: geo.rectMake(i*140, 0, 140, 200)}));
        }
        
        this.roadAnim = [new cocos.Animation({frames: anim, delay: 0.1})];
        
        // I declare this line the savior of jQuery, delivering the code from months of annoying interrupts
        window.$ = window.parent.$;
    
        // Static binds
        this.addMeHandler = this.addMeHandler.bind(this)
        this.answerQuestion = this.answerQuestion.bind(this)
        this.removeMeHandler = this.removeMeHandler.bind(this)
        
        this.scriptedBindings();
        
        // Until menu based loading is implemented
        this.getLevel();
        
        //HACK: Using $.browser for detection is bad (and can be spoofed)
        if(!$.browser.mozilla && !$.browser.msie) {
            RC.textOffset = 0.5
        }
    },
    
    // The GREAT DIVIDE
    
    // Initializes level specific variables to their defaults
    initializeValues: function() {
        this.player = null;
        this.dash = null;
        this.eogd = null;
        
        this.questionList= [];
		this.interList   = [];
		this.roadList    = [];
        this.medalCars   = [];
        this.inters		 = [];
		
        this.gameID      = '';
        
        this.bgFade      = false;
        this.bgFast      = false;
        
        this.lane        = 1;
        
        this.laneLock    = [0, 0, 0];
        this.velocityLock = false;
        
        this.revertableVelocity = 0;
        
        this.fpsToggle = false;
    },
    
    // Remove level specific objects
    removePrevGame: function() {
		this.finishLine.cleanup();
		
		this.removeHelper(this.questionList);
		this.removeHelper(this.medalCars);
		this.removeHelper(this.interList);
		this.removeHelper(this.roadList);
		
		this.clearObject(this.player);
        this.clearObject(this.dash);
        this.clearObject(this.eogd);
        this.clearObject(this.background);
        this.clearObject(this.finishLine);
        this.clearObject(this.xml);
        
        this.ss_reinitialize();
    },
	
	// Helper function to clean up arrays of objects
	removeHelper: function (arr) {
		for(var i=0; i<arr.length; i+=1) {
			this.removeChild({child: arr[i]});
			arr[i].cleanup();
			this.clearObject(arr[i]);
		}
	},
    
    // Helper function for clearing out objects at end of game
    clearObject: function(obj) {
        this.removeChild({child: obj});
        events.clearInstanceListeners(obj);
        obj = null;
    },
    
	// Gets the XML file of the level, either from text fields if present, otherwise from the server
    getLevel: function() {
        try {
            var dynScript = $('#dynScriptField');
            var dynLoad = $('#dynLoadField');
            
            // Clunky, but allows for both single (content) load and split (content/script) load cases
            if(dynLoad.length == 1) {
                if(dynScript.length == 1) {
                    this.xml = $.parseXML(dynScript.val());
                }
				
				this.loadLevel($.parseXML(dynLoad.val()));
            }
            // Otherwise get "command line" arguments from the div tag
            else {
                var app_div = $('#cocos_test_app');
                if(app_div) {
                    var xml_path = app_div.attr('data');
                    this.gameID = app_div.attr('gameid');
                    this.endOfGameCallback = app_div.attr('callback');
                }
                
                // Set up remote resources, default value allows for running 'locally'
                var that = this;
                $.get(xml_path ? xml_path : 'set002_scripting.xml', function(data) {
                    that.loadLevel(data);
                });
            }
        }
        catch (e) {
            console.log(e);
        }
    },
    
    // Things that need to be done once per LEVEL are done here
    loadLevel: function(data) {
        // Reset game wide values
        this.initializeValues();
        
        // Check for the data
        if(data == undefined) {
            throw new Error('No XML level data found to load.');
        }
        
        this.parseXML(data);
        
        this.preprocessingComplete();
    },
    
    // End Overhaul
    
    // Parses the level xml file
    parseXML: function(xmlDoc) {
        console.log(xmlDoc);
        
        RC.parseSpacing(xmlDoc);    // Parses question and checkpoint spacing
        
        // Parse and process questions
        RC.finishLine = this.parseProblemSet(xmlDoc) + RC.finishSpacing;
        RS.DistanceTrigger.relPoints['finish'] = RC.finishLine;
        
        RC.parseMedals(xmlDoc);     // Parse medal information
        RC.parseAudio(xmlDoc);      // Parse the audio information
        RC.parseSpeed(xmlDoc);      // Parse and set player speed values
        RC.parsePenalty(xmlDoc);    // Get the penalty time for incorrect answers
        
        RC.postParse();             // Calculate values derived from parsed xml
        
        if(!this.xml) {
            this.xml = xmlDoc;
        }
        
        // Prime the scripting system
        var node = $(this.xml).find('SCRIPTING');
        if(node) {
            this.xml = node;
        }
        
        this.audioHook = this.audioMixer;
    },
    
    // Parses the PROBLEM_SET
    parseProblemSet: function (xml) {
        var problemRoot = $(xml).find('PROBLEM_SET');
        var subsets = $(problemRoot).children('PROBLEM_SUBSET');
        var z = RC.initialSpacing;
        var once = true;
        
        for(var i=0; i<subsets.length; i+=1) {
            z = this.parseProblemSubset(subsets[i], z, once);
            once = false;
        }
        
        return z;
    },
    
    // Parses a subset within the PROBLEM_SET
    parseProblemSubset: function (subset, z, once) {
        
        var interContent = Content.buildFrom($(subset).children('TARGET')[0]);
        interContent.scale = 2;
        
        // Not the first subset
        if(!once) {
            z += RC.intermissionSpacing;
            
            // Gets the intermission value
            var inter = new Intermission(interContent, z);
            events.addListener(inter, 'changeSelector', this.startIntermission.bind(this));
            inter.idle();
			
            // Append the intermission to the list of intermissions
			this.inters.push(z);
            RS.DistanceTrigger.relPoints['checkpoint'].push(z)
			this.interList.push(inter);
			
			// Add checkpoint marker to the race track
			var opts = {
				maxScale    : 1.00,
				alignH      : 0.5,
				alignV      : 0,
				visibility  : 1,
				xCoordinate : 0,
				zCoordinate : z,
				dropoffDist : -10,
			}
			opts['content'] = new cocos.nodes.Sprite({file: '/resources/checkPoint.png',});
			opts['content'].scaleX = 1.5;
			
			var fl = new PNode(opts);
			events.addListener(fl, 'addMe', this.addMeHandler);
			fl.idle();
			fl.zOrder = -5;
        }
        else {
            this.startSelector = interContent;
        }
        
        // Interate over questions in subset
        var list = this.questionList;
        var problems = $(subset).children('QUESTION');
        for(var i=0; i<problems.length; i+=1) {
            z += RC.questionSpacing;

            // Create a question
            list[list.length] = new Question(problems[i], z);
            events.addListener(list[list.length - 1], 'questionTimeExpired', this.answerQuestion);
            events.addListener(list[list.length - 1], 'addMe', this.addMeHandler);
            list[list.length - 1].idle();
            RS.DistanceTrigger.relPoints['question'].push(z)
        }
        
        return z;
    },
    
    // The 'real init()' called after all the preloading/parsing is completed
    preprocessingComplete: function () {
        // Create player
        this.player = new Player();
        this.player.xCoordinate = this.lanePosX[RC.curNumLanes][1];
        this.player.updatePosition();
        this.addChild({child: this.player});
        
        // Create dashboard
        var dash = new Dashboard(this.inters);
        dash.position = new geo.Point(0, 0);
        this.dash = dash;
        
        // Add the left hand side dash
        dash.maxSpeed = this.player.maxSpeed;
        this.addChild({child: dash});
        dash.zOrder = -1;
        
        // Draw background
        var bg = new Background();
        bg.zOrder = -10;
        this.background = bg;
        this.addChild({child: bg});
        
        events.addListener(this.player, 'IntermissionComplete', this.unpause.bind(this));
        
        // Create finish line
        var opts = {
            maxScale    : 1.00,
            alignH      : 0.5,
            alignV      : 0,
            visibility  : 1,
            xCoordinate : 0,
            zCoordinate : RC.finishLine,
            dropoffDist : -10,
        }
        opts['content'] = new cocos.nodes.Sprite({file: '/resources/finishline.png',});
        opts['content'].scaleX = 1.5;
        
        this.finishLine = new PNode(opts);
        events.addListener(this.finishLine, 'addMe', this.addMeHandler);
        this.finishLine.idle();
        this.finishLine.zOrder = -5;
        
        // Add version number
        var vtag = new cocos.nodes.Label({string: this.version})
        vtag.anchorPoint = new geo.Point(0.5, 0.5);
        vtag.position = new geo.Point(850, 590);
        this.addChild({child: vtag});
        
        // Create FPS meter
        var fps = new cocos.nodes.Label({string: '0 FPS'})
        fps.position = new geo.Point(20, 580);
        this.fps = fps;
        this.fpsTracker = [30, 30, 30, 30, 30];
        this.fpsToggle = false;
        
        // Add sprites to the roadsides
        this.populateRoadSide(1);
        this.populateRoadSide(-1);
        
        // Ghost cars representing medal cutoffs
        // TODO: Make seperate class, support lines in addition to cars
        this.medalCars = [];
        var names = ['Gold', 'Silver', 'Bronze']
        var hacks = ['goldZ', 'silverZ', 'bronzeZ']
        for(var i=0; i<3; i+= 1) {
            opts['content'] = new cocos.nodes.Sprite({file: '/resources/Cars/car'+names[i]+'01.png'});
            this.medalCars[i] = new PNode(opts)
            this.medalCars[i].zVelocity = RC.finishLine / RC.times[i+1];
            
            events.addListener(this.medalCars[i], 'addMe', this.addMeHandler);
            events.addListener(this.medalCars[i], 'removeMe', this.removeMeHandler);
            this.medalCars[i].delOnDrop = false;
            
            //HACK: Should be a cleaner way of doing this instead of a straight bypass
            this.medalCars[i].dash    = this.dash;
            this.medalCars[i].dashStr = hacks[i];
            //ENDHACK
        }
        
        if(!this.skipSplash) {
            this.splash = new SplashScreen(['/resources/splash.png']);
            events.addListener(this.splash, 'splashScreensCompleted', this.splashCallback.bind(this));;
            this.splash.zOrder = 110;
            this.addChild({child: this.splash});
            this.splash.start();
        }
        else {
            this.createStartButton();
			this.menu.addChild({child: this.startButton});
            
            var that = this;
            setTimeout(function() {
                that.loadScriptingXML(that.xml);
                that.dash._updateLabelContentSize();
            }, 40);
        }
    },
    
    // Places sprites on either right side of road (inverter = 1) or left (inverter = -1)
    populateRoadSide: function(inverter) {
        var choice = 0;
        var p;
        for(var t=5; t<RC.finishLine + 100; t += Math.ceil(Math.random()*6 + 4)) {
            if(Math.random() < 0.5) {
                choice = Math.floor(Math.random() * (this.roadSprites.length + this.roadAnim.length));
                if(choice < 5) {
                    p = new PNode({xCoordinate: (inverter * 10) * Math.random() + (inverter * 6), zCoordinate: t, content: this.roadSprites[choice], alignH: 0.5, alignV: 0.5})
                }
                else {
                    p = new PNodeA({xCoordinate: (inverter * 10) * Math.random() + (inverter * 6), zCoordinate: t, content: new cocos.nodes.Sprite(), alignH: 0.5, alignV: 0.5})
                    p.prepareAnimation(new cocos.actions.Animate({animation: this.roadAnim[choice - this.roadSprites.length]}));
                }
                p.zOrder = -4;
                events.addListener(p, 'addMe', this.addMeHandler);
                p.idle();
				this.roadList.push(p);
            }
        }
    },
    
    // Callback for when the splash screen if finished
    splashCallback: function() {
        this.buildMenu();
        this.musicMixer.setMasterVolume(0.35);
        this.ss_audioHook = this.musicMixer;
        this.loadScriptingXML(this.xml);
        this.dash._updateLabelContentSize();
    },
    
    // Three second countdown before the game begins (after pressing the start button on the menu layer)
    countdown: function () {
        this.removeStartButton();
        
        var opts = {
            maxScale    : 1.00,
            alignH      : 0.5,
            alignV      : 0,
            visibility  : 1,
            xCoordinate : 4.5,
            zCoordinate : 0,
            dropoffDist : -10,
            delOnDrop   : false,
        }
        
        this.player.dash = this.dash;
        
        // Set audio levels
        this.audioMixer.setTrackVolume('accel', 0.8)
        this.audioMixer.setTrackVolume('screech', 0.5)
        
        this.audioMixer.playSound('countdown');
        
        setTimeout(this.startGame.bind(this), RC.initialCountdown);
        
        var cd = new cocos.nodes.Label({string: '3', textColor: '#000000', fontName: RC.font});
        cd.scaleX = 10;
        cd.scaleY = 10;
        cd.position = new geo.Point(450, 300);
        
        this.cdt = cd;
        this.addChild({child: cd});
        
        // Set the starting value on the player's car
        this.player.changeSelectorByForce(this.startSelector);
        
        var that = this;
        setTimeout(function () { that.cdt.string = '2'; }, 750);
        setTimeout(function () {
            that.cdt.string = '1';
            that.cdt._updateLabelContentSize();
        }, 1500);
        setTimeout(function () {
            that.cdt.string = 'GO!';
            that.cdt._updateLabelContentSize();
        }, 2250);
        setTimeout(function () { that.removeChild(that.cdt); }, 2750);
        
        this.audioMixer.playSound('start');
        this.audioMixer.loopSound('hum');
        
        // Catch window unloads at this point as aborts
        $(window).unbind('unload')
        $(window).unload(this.endOfGame.bind(this, null));
    },
    
    // Starts the game
    startGame: function () {
        cocos.Director.sharedDirector.swallowKeys = true;
    
        var p = this.player;
        p.scheduleUpdate();             // Start the player
        this.dash.start();              // Start timer and dash updates
        
        // Accelerate the player to their default speed after starting
        p.zVelocity = 0;
        (new MOT(0, p.zVelocity, 0.2)).bind(p, 'zVelocity');
        
        this.medalCars[0].scheduleUpdate();
        this.addChild({child: this.medalCars[0]});
        this.medalCars[1].scheduleUpdate();
        this.addChild({child: this.medalCars[1]});
        this.medalCars[2].scheduleUpdate();
        this.addChild({child: this.medalCars[2]});
        
        // Start background music
        this.musicMixer.loopSound('bg_slow');
        this.musicMixer.playSound('bg_open');
        this.musicMixer.setTrackVolume('bg_fast', 0);
        this.musicMixer.loopSound('bg_fast');
        
        // Start the ScriptingSystem's game timer
        this.ss_started = true;
    },
    
    // Function that allows the Scripting System to remove the standard start button
    removeStartButton: function() {
        this.menu.removeChild({child: this.startButton});
    },
    
    startIntermission: function(newVal, location) {
        this.player.startIntermission(newVal, location);
        this.pause();
    },
    
	// Pauses the dashboard and medal cars
    pause: function () {
        this.dash.pauseTimer();
        
        this.audioMixer.playSound('intermission');
        
        var mc = this.medalCars;
        
        for(var i=0; i<3; i+=1) {
            mc[i].prepause = mc[i].zVelocity;
            mc[i].zVelocity = 0;
        }
    },
    
	// Unpauses the dashboard and medal cars
    unpause: function () {
        this.dash.unpauseTimer();
        
        var mc = this.medalCars;
        
        for(var i=0; i<3; i+=1) {
            mc[i].zVelocity = mc[i].prepause;
            mc[i].prepause = 0;
        }
    },
    
    // Handles add requests from PerspectiveNodes
    // STATIC BIND
    //TODO: Make a PerspectiveView class to handle these functions?
    addMeHandler: function (toAdd) {
        this.addChild({child: toAdd});
        events.addListener(toAdd, 'removeMe', this.removeMeHandler);
    },
    
    // Handles removal requests from PerspectiveNodes
    // STATIC BIND
    removeMeHandler: function (toRemove) {
        this.removeChild(toRemove);
    },
    
    // Callback let the main program know when a cross fade has completed
    onCrossFadeComplete: function () {
        this.bgFade = false;
    },
    
    // Called when game ends, should collect results, display them to the screen and output the result XML
    // finished = null on window.unload, false on abort, true on completion
    endOfGame: function(finished) {
        cocos.Director.sharedDirector.swallowKeys = false;
    
        if(finished != null) {
            $(window).unbind('unload')
            $(window).unload(this.cleanup.bind(this));
        }
        else {
            this.cleanup();
        }
        
        // Fade out background music tracks at the end of the game
        var s;
        
        s = this.musicMixer.getSound('bg_fast');
        if(s) {
            (new MOT(s.volume, -1, 2)).bindFunc(s, s.setVolume);
        }
        
        s = this.musicMixer.getSound('bg_slow');
        if(s) {
            (new MOT(s.volume, -1, 2)).bindFunc(s, s.setVolume);
        }
        
        // Stop the ambient engine hum from looping and play the finish sound
        this.audioMixer.stopSound('hum');
        this.audioMixer.playSound('finish');
    
        // Stop the player from moving further and the dash from increasing the elapsed time
        cocos.Scheduler.sharedScheduler.unscheduleUpdateForTarget(this.player);
        cocos.Scheduler.sharedScheduler.unscheduleUpdateForTarget(this.dash);
        //this.dash.pauseTimer();
        
        this.player.newSelector = null;
        this.player.changeSelector(null);
        
        // Stops the medal pace cars
        this.medalCars[0].zVelocity = 0;
        this.medalCars[1].zVelocity = 0;
        this.medalCars[2].zVelocity = 0;
    
        var ql = this.questionList;
        var i = 0, correct = 0, incorrect = 0, unanswered = 0;
        
        // Tally question results
        while(i < ql.length) {
            if(ql[i].answeredCorrectly) {
                correct += 1;
            }
            else if(ql[i].answeredCorrectly == false) {
                incorrect += 1;
            }
            else {
                unanswered += 1;
            }
            
            i += 1;
        }
        
        // Checks to see if abort was related to window.unload
        if(finished != null) {
            var e = new EOGD(this.dash.elapsedTime, incorrect + unanswered, !finished);
            e.position = new geo.Point(50, 150);
            this.addChild({child: e});
            var that = this;
            events.addListener(e, 'almostComplete', this.addRetryButton.bind(this));
            this.eogd = e;
            e.start();
        }
        
        // Prepare the output
        var xmlOut;
        if(finished) {
            xmlOut = this.writeXML(correct, 'FINISH');
        }
        else {
            xmlOut = this.writeXML(correct, 'ABORT');
        }
        
        // If the 'command line' specified a call back, feed the callback the xml
        if(this.endOfGameCallback) {
            window[this.endOfGameCallback](xmlOut);
        }
        
        // Look for dynamic display field
        var dynDisp = $('#dynDispField');
        if(dynDisp.length == 1) {
            dynDisp.attr('value', xmlOut)
        }
    },

    // Writes the output xml file as a string and returns it
    //TODO: Decide on a new format if needed and update
    writeXML: function(correct, state) {
        // Get needed values
        var d = this.dash;
        var e = d.elapsedTime;
        var p = d.pCount * RC.penaltyTime;
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
        '    <GAME_REFERENCE_NUMBER ID="' + this.gameID + '"/>\n' + 
        '    <SCORE_SUMMARY>\n' + 
        '        <Score CorrectAnswers="' + correct + '" ElapsedTime="' + e + '" PenaltyTime="' + p + '" TotalScore="' + (e + p) + '" Medal="' + m + '"/>\n' + 
        '    </SCORE_SUMMARY>\n' +
        '    <SCORE_DETAILS>\n';
                var i = 0;
                var ql = this.questionList;
                while(i < ql.length) {
                x += '        <SCORE QuestionIndex="' + (i+1) +'" AnswerValue="' +  ql[i].correctAnswer + '" TimeTaken="'+ Math.round(ql[i].timeElapsed * 1000) + '" LaneChosen="' + ql[i].answer + '"/>\n';
                i += 1;
                }
            x += '    </SCORE_DETAILS>\n' + 
        '    <END_STATE STATE="' + state + '"/>\n' +
        '</OUTPUT>';
        
        return x;
    },
    
    // Code to be run when the game is finished
    cleanup: function() {
        // Clear the bind
        $(window).unbind('unload');
        
        cocos.Scheduler.sharedScheduler.unscheduleUpdateForTarget(this);
        
        var d = cocos.Director.sharedDirector;
        
        d.swallowKeys = false;
        
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
    
    // Handles answering the current question when time expires
    // STATIC BIND
    answerQuestion: function(question) {
        //HACK: Find a better place/way to do this
        RS.CorrectLaneTrigger.lastCorrect = question.correctAnswer;
        //ENDHACK
        var result = question.answerQuestion(this.lane);
        
        // Handle correct / incorrect feedback
        if(result) {
            this.audioMixer.playSound('correct', true);
            
            events.trigger(ER, 'answerQuestionTrigger', true);
        }
        else {
            var t = this.dash.elapsedTime + this.dash.pTime + parseFloat(RC.penaltyTime);
        
            this.player.wipeout(1);
            this.dash.modifyPenaltyCount();
            
            //this.audioMixer.playSound('wrong', true);
            this.audioMixer.playSound('screech', true);
            
            // Update medal car velocities to account for penalty time
            for(var i=0; i<3; i+=1) {
                var rd = RC.finishLine - this.medalCars[i].zCoordinate;
                var rt = RC.times[i+1] - t;
                
                if(rt > 0.1 && rd > 0) {
                    this.medalCars[i].zVelocity = rd / rt;
                }
                else if (rd > 0) {
                    this.medalCars[i].zVelocity = rd / 0.1;
                }
            }
            
            events.trigger(ER, 'answerQuestionTrigger', false);
        }
        
        this.player.endTurboBoost();
    },
    
    // Crude initial version of the mouse based movement
    //TODO: Ignore clicks near/on menu buttons
    mouseDown: function(evt) {
        if(this.ss_started) {
            // 'A' / 'LEFT' Move left, discreet
            if(evt.locationInCanvas.x < this.player.position.x) {
                if(this.lane > 0) {
                    this.moveLane(this.lane, this.lane-1);
                    this.player.xCoordinate = this.lanePosX[RC.curNumLanes][this.lane];
                    this.audioMixer.playSound('accel', true);
                }
            }
            // 'D' / 'RIGHT' Move right, discreet
            else if(evt.locationInCanvas.x > this.position.x) {
                if(this.lane < RC.curNumLanes-1) {
                    this.moveLane(this.lane, this.lane+1);
                    this.player.xCoordinate = this.lanePosX[RC.curNumLanes][this.lane];
                    this.audioMixer.playSound('accel', true);
                }
            }
        }
    },
    
    // Called every frame, manages keyboard input
    update: function(dt) {
        // Must call superclass.update for ScriptingSystem to function
        FluencyApp.superclass.update.call(this, dt);
        
        // Do not run the rest of update until the game has started
        if(!this.ss_started) {
            // Allow the player to fast foward through the splash screens
            if(this.splash && this.splash.isActive() && this.checkAnyKey()) {
                this.splash.skip();
            }
            
            return;
        }
        
        var player = this.player;
        
        // Update the skyline
        this.background.progress(player.zCoordinate / RC.finishLine);
        
        // Check if the race is finished
        if(player.zCoordinate > RC.finishLine && this.eogd == null) {
            this.endOfGame(true);
        }
        
    // Move the player according to keyboard
        // 'A' / 'LEFT' Move left, discreet
        if(this.checkBinding('MOVE_LEFT') == KeyboardLayer.PRESS) {
            if(this.lane > 0) {
                this.moveLane(this.lane, this.lane-1);
                player.xCoordinate = this.lanePosX[RC.curNumLanes][this.lane];
                this.audioMixer.playSound('accel', true);
            }
        }
        // 'D' / 'RIGHT' Move right, discreet
        else if(this.checkBinding('MOVE_RIGHT') == KeyboardLayer.PRESS) {
            if(this.lane < RC.curNumLanes-1) {
                this.moveLane(this.lane, this.lane+1);
                player.xCoordinate = this.lanePosX[RC.curNumLanes][this.lane];
                this.audioMixer.playSound('accel', true);
            }
        }
        
        var decel_lock = false;
        
        // 'S' / 'DOWN' Slow down, press
        if(this.checkBinding('SPEED_DOWN') > KeyboardLayer.UP && !this.velocityLock) {
            player.decelerate(dt);
            this.audioMixer.loopSound('decel')
        
            // Cross fade tracks if needed and able
            if(this.bgFast && !this.bgFade && player.zVelocity < RC.crossFadeSpeed) {
                this.musicMixer.crossFade('bg_fast', 'bg_slow', 2);
                this.bgFast = false;
                this.bgFade = true;
            }
            
            // Prevents triggering both acceleration and deceleration
            decel_lock = true;
        }
        // 'W' / 'UP' Speed up, press
        else
            this.audioMixer.stopSound('decel');
            
        if(!decel_lock && this.checkBinding('SPEED_UP') > KeyboardLayer.UP && !this.velocityLock) {
            player.accelerate(dt);
            this.audioMixer.loopSound('accel')
            
            // Cross fade tracks if needed and able
            if(!this.bgFast && !this.bgFade && player.zVelocity > RC.crossFadeSpeed) {
                this.musicMixer.crossFade('bg_slow', 'bg_fast', 2);
                this.bgFast = true;
                this.bgFade = true;
            }
        }
        else
            this.audioMixer.stopSound('accel');
        
        // 'SPACE' turbo boost, discreet
        if(this.checkBinding('TURBO') == KeyboardLayer.PRESS && !this.velocityLock) {
            if(player.startTurboBoost())
                this.audioMixer.playSound('turbo', true);
        }
        
        // 'ESC' Abort game, discreet
        if(this.checkBinding('ABORT') == KeyboardLayer.PRESS) {
            this.endOfGame(false);
        }
        
        var sub = parseFloat(0);    // Zero the subtotal
        var cur = 1 / dt;           // Store the current frame's fps
        
        this.fpsTracker.shift();    // Get rid of oldest frame
        this.fpsTracker.push(cur);  // Add this frame
        
        // Log low FPS spikes to console if FPS tracker is enabled
        if(this.fpsToggle) {
            if(1 / dt < 10) {
                console.log('FPS Spike down frame ( ' + cur.toFixed(1) + ' FPS / ' + (dt*1000).toFixed(0) + ' ms dt )');
            }
        }
        
        // Smooth over multiple frames
        this.fps.fontColor = '#FFFFFF';
        for(t in this.fpsTracker){
            sub += this.fpsTracker[t];
            
            // Turn red on low framerate
            if(this.fpsTracker[t] < 20) {
                this.fps.fontColor = '#DD2222';
            }
        }
        
        // Update the FPS tracker label
        this.fps.string = (sub / this.fpsTracker.length).toFixed(1) + ' FPS';
        
        // 'P' Toggle showing FPS tracker, discreet
        if(this.checkBinding('SHOW_FPS') == KeyboardLayer.PRESS) {
            if(!this.fpsToggle) {
                this.addChild({child: this.fps});
                this.fpsToggle = true;
            }
            else {
                this.removeChild({child: this.fps});
                this.fpsToggle = false;
            }
        }
        
        // Update game specific, continually checked scripting Triggers
        RS.AbsoluteLaneTrigger.currentLane = this.lane;
        RS.DistanceTrigger.currentDistance = this.player.zCoordinate;
        RS.VelocityTrigger.currentVelocity = this.dash.getSpeed();      // dash.getSpeed() correctly accounts for pauses
    },
    
    // Resolve the requested lane movement against the laneLock array
    moveLane: function(from, to) {
        if(this.laneLock[from] == 2 || this.laneLock[from] == 3
        || this.laneLock[to] == 1   || this.laneLock[to] == 3) {
            return false;
        }
        
        if(!this.player.changeLane(to)) {
            return false;
        }
        
        this.lane = to;
        this.player.xCoordinate = this.lanePosX[RC.curNumLanes][to];
        return true;
    },

// Scripting Hookup Functions //////////////////////////////////////////////////////////////////////
    
    // Catch RacecarScripting Action events
    scriptedBindings: function() {
        events.addListener(ER, 'HideMedalCarEvent',         this.scriptedHideMedalCar.bind(this));
        events.addListener(ER, 'LockAbsoluteLaneEvent',     this.scriptedLockAbsoluteLane.bind(this));
        events.addListener(ER, 'LockVelocityEvent',         this.scriptedLockVelocity.bind(this));
        events.addListener(ER, 'RevertVelocityEvent',       this.scriptedRevertVelocity.bind(this));
        events.addListener(ER, 'SetAbsoluteLaneEvent',      this.scriptedSetAbsoluteLane.bind(this));
        events.addListener(ER, 'SetVelocityEvent',          this.scriptedSetVelocity.bind(this));
        events.addListener(ER, 'ShowMedalCarEvent',         this.scriptedShowMedalCar.bind(this));
        events.addListener(ER, 'StartTimerEvent',           this.scriptedStartTimer.bind(this));
        events.addListener(ER, 'StopTimerEvent',            this.scriptedStopTimer.bind(this));
        events.addListener(ER, 'UnlockAbsoluteLaneEvent',   this.scriptedUnlockAbsoluteLane.bind(this));
        events.addListener(ER, 'UnlockVelocityEvent',       this.scriptedUnlockVelocity.bind(this));
    },
    
    // Hides the specified medal car and associated minimap dot
    scriptedHideMedalCar: function(c) {
        this.removeChild({child: this.medalCars[c]});
        this.medalCars[c].disabled = true;
        this.dash.removeChild({child: this.dash.miniDots[c]});
    },
    
    // Enforces locking restrictions on the specified lane
    scriptedLockAbsoluteLane: function(l, d) {
        if(this.laneLock[l] == 0) {
            this.laneLock[l] = d;
        }
        else if(this.laneLock[l] != 3 && (this.laneLock[l] + d == 3 || d == 3)) {
            this.laneLock[l] = 3;
        }
    },
    
    // Prevents the player from changing velocity
    scriptedLockVelocity: function() {
        this.velocityLock = true;
    },
    
    // Sets the velocity to the value it was before the last set/revert velocity was called
    scriptedRevertVelocity: function() {
        var tmp = this.player.zVelocity;
        this.player.zVelocity = this.revertableVelocity;
        this.revertableVelocity = tmp;
    },
    
    // Forces the player into the specified lane
    scriptedSetAbsoluteLane: function(l) {
        this.lane = l;
        this.player.xCoordinate = this.lanePosX[RC.curNumLanes][this.lane];
    },
    
    // Sets the player's velocity to the specified value
    scriptedSetVelocity: function(v) {
        this.revertableVelocity = this.player.zVelocity;
        this.player.zVelocity = v;
    },
    
    // Shows the specified medal car and associated minimap dot
    scriptedShowMedalCar: function(c) {
        this.addChild({child: this.medalCars[c]});
        this.medalCars[c].disabled = true;
        this.dash.addChild({child: this.dash.miniDots[c]});
    },
    
    // Starts the game timer
    scriptedStartTimer: function() {
        this.dash.unpauseTimer();
        for(var i=0; i<3; i+=1) {
            this.medalCars[i].zVelocity = this.medalCars[i].prepause;
        }
    },
    
    // Stops the game timer
    scriptedStopTimer: function() {
        this.dash.pauseTimer();
        
        for(var i=0; i<3; i+=1) {
            this.medalCars[i].prepause = this.medalCars[i].zVelocity;
            this.medalCars[i].zVelocity = 0;
        }
    },
    
    // Allows the player to change velocity
    scriptedUnlockVelocity: function() {
        this.velocityLock = false;
    },
    
    // Lifts locking restriction for a specific lane
    scriptedUnlockAbsoluteLane: function(l, d) {
        if(this.laneLock[l] == 3)
            this.laneLock[l] -= d;
        else if(this.laneLock[l] != 0 && (this.laneLock[l] == d || d == 3)) {
            this.laneLock[l] = 0;
        }
    },

// Menu Related Functions //////////////////////////////////////////////////////////////////////////
    
    //Builds and displays the initial 'menu' of the start button and music/sfx mute/unmute buttons
    buildMenu: function() {
        this.createStartButton();
    
        var dir = '/resources/Buttons/';
    
        // Create the button
        var opts = Object();
        
        // Create the volume control
        dir = '/resources/Dashboard/';
        // TODO: Make a better basic (toggle)button (extend MenuItemImage?)
        opts['normalImage']   = dir + 'dashBoardSoundOn.png';
        opts['selectedImage'] = dir + 'dashBoardSoundOn.png';
        opts['disabledImage'] = dir + 'dashBoardSoundOn.png';
        opts['callback'] = this.audioCallback.bind(this);
        
        var vc = new cocos.nodes.MenuItemImage(opts);
        vc.position = new geo.Point(-420, -240);
        this.volumeButtonOn = vc;
        
        opts['normalImage']   = dir + 'dashBoardMusicOn.png';
        opts['selectedImage'] = dir + 'dashBoardMusicOn.png';
        opts['disabledImage'] = dir + 'dashBoardMusicOn.png';
        opts['callback'] = this.musicCallback.bind(this);
        
        vc = new cocos.nodes.MenuItemImage(opts);
        vc.position = new geo.Point(-420, -275);
        this.musicButtonOn = vc;
        
        opts['normalImage']   = dir + 'dashBoardSoundOff.png';
        opts['selectedImage'] = dir + 'dashBoardSoundOff.png';
        opts['disabledImage'] = dir + 'dashBoardSoundOff.png';
        opts['callback'] = this.audioCallback.bind(this);
        
        vc = new cocos.nodes.MenuItemImage(opts);
        vc.position = new geo.Point(-420, -240);
        this.volumeButtonOff = vc;
        
        opts['normalImage']   = dir + 'dashBoardMusicOff.png';
        opts['selectedImage'] = dir + 'dashBoardMusicOff.png';
        opts['disabledImage'] = dir + 'dashBoardMusicOff.png';
        opts['callback'] = this.musicCallback.bind(this);
        vc = new cocos.nodes.MenuItemImage(opts);
        vc.position = new geo.Point(-420, -275);
        this.musicButtonOff = vc;
        
        this.menu = new cocos.nodes.Menu({items: [this.startButton, this.musicButtonOn, this.volumeButtonOn]});
        
        this.addChild({child: this.menu, z: 15});
    },
    
    // Displays the start button on the screen
    createStartButton: function() {
        var dir = '/resources/Buttons/buttonStart';
        var opts = Object();
        opts['normalImage']   = dir + 'Normal.png';
        opts['selectedImage'] = dir + 'Click.png';
        opts['disabledImage'] = dir + 'Normal.png';
        // We use this callback so we can do cleanup before handing everything over to the main game
        opts['callback'] = this.countdown.bind(this)
        
        this.startButton = new cocos.nodes.MenuItemImage(opts);
        this.startButton.position = new geo.Point(0, 0);
        this.startButton.scaleX = 0.5;
        this.startButton.scaleY = 0.5;
    },
    
    // Displays the retry button on the screen
    addRetryButton: function() {
        var dir = '/resources/Buttons/buttonRetry';
        var opts = Object();
        opts['normalImage']   = dir + 'Normal.png';
        opts['selectedImage'] = dir + 'Click.png';
        opts['disabledImage'] = dir + 'Normal.png';
        opts['callback'] = this.retryLevel.bind(this)
        
        this.retryButton = new cocos.nodes.MenuItemImage(opts);
        this.retryButton.position = new geo.Point(0, -225);
        
        this.menu.addChild({child: this.retryButton});
    },
    
    // Restarts the level that the player just completed
    //TODO: Move out of Menu functions subsection?
    retryLevel: function() {
        this.skipSplash = true;
    
        this.removePrevGame();
        this.initializeValues();
        
        this.menu.removeChild({child: this.retryButton});
        
        PNode.cameraZ = 0;
        
        this.getLevel();
    },
    
    // Called when the volume button is pressed
    //TODO: Seperate this into two functions (mute/unmute)?
    //TODO: Implement a slider/levels to set master volume
    audioCallback: function() {
        if(!this.audioMixer.muted) {
            this.menu.removeChild(this.volumeButtonOn);
            this.menu.addChild({child: this.volumeButtonOff});
        }
        else {
            this.menu.removeChild(this.volumeButtonOff);
            this.menu.addChild({child: this.volumeButtonOn});
        }
        
        this.audioMixer.setMute(!this.audioMixer.muted);
    },
    
    // Called when the music button is pressed
    //TODO: Same as audioCallback
    musicCallback: function() {
        if(!this.musicMixer.muted) {
            this.menu.removeChild(this.musicButtonOn);
            this.menu.addChild({child: this.musicButtonOff});
        }
        else {
            this.menu.removeChild(this.musicButtonOff);
            this.menu.addChild({child: this.musicButtonOn});
        }
        
        this.musicMixer.setMute(!this.musicMixer.muted);
    }
})

// Main ////////////////////////////////////////////////////////////////////////////////////////////

// Initialise application
function main() {
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
    var director = cocos.Director.sharedDirector;
    
    events.addListener(director, 'ready', function(director) {
        var scene = new cocos.nodes.Scene();     // Create a scene
        var app = new FluencyApp();              // Create the layers

        // Add our layers to the scene
        scene.addChild(app);

        // Run the scene
        director.replaceScene(scene);
    });
    
    director.attachInView();
    director.preloadScene = new PreloadScene({emptyImage: '/resources/Loader/LoadingScreen00.png', fullImage: '/resources/Loader/LoadingScreen16.png'});
    director.runPreloadScene();
}

exports.main = main;