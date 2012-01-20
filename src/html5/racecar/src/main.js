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
var Background = require('Background').Background;
var Dashboard = require('Dashboard').Dashboard
var Intermission = require('Intermission').Intermission;
var KeyboardLayer = require('KeyboardLayer').KeyboardLayer
var Player = require('Player').Player;
var PNode = require('PerspectiveNode').PerspectiveNode;
var Question = require('Question').Question;
var EOGD = require('EndOfGameDisplay').EndOfGameDisplay;
var Preloader = require('Preloader').Preloader;

var LabelBG = require('LabelBG').LabelBG;   //HACK

// Static Imports
var RC = require('RaceControl').RaceControl;
var MOT = require('ModifyOverTime').ModifyOverTime;
var XML = require('XML').XML;
var Content = require('Content').Content;

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
    player      : null,     // Holds the player
    background  : null,     // Holds the the background object
    dash        : null,     // Holds the right hand side dashboard
    questionList: [],       // List of all questions in the input
    audioMixer  : null,     // AudioMixer for sound effects
    musicMixer  : null,     // AudioMixer for music
    medalCars   : [],       // Contains the pace cars
    gameID      : '',       // Unique ID for the game
	inters		: [],       // Holds the list of checkpoints
    
    bgFade      : false,    // True when crossfading between bg tracks
    bgFast      : false,    // True when playing bg_fast, false when playing bg_slow
    
    lanePosX    : {2: [-2, 2], 3:[-3, 0, 3]},
    lane        : 1,
    
    endOfGameCallback : null,   //Holds the name of the window function to call back to at the end of the game
    
    version     : 'v 0.3.0',    // Current version number
    
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
        // Set up basic audio
        var AM = AudioMixer.create();
        AM.loadSound('screech', "sound/CarScreech2");
        AM.loadSound('decel', "sound/SlowDown");
        AM.loadSound('accel', "sound/SpeedUp");
        AM.loadSound('turbo', "sound/Turboboost");
        AM.loadSound('start', "sound/EngineStart");
        AM.loadSound('hum', "sound/Engine Hum");
        AM.loadSound('correct', "sound/Correct v1");
        AM.loadSound('wrong', "sound/Incorrect v1");
        AM.loadSound('finish', "sound/FinishLine v1");
        AM.loadSound('intermission', "sound/Numberchange v1");
        AM.loadSound('countdown', "sound/countdown");
        this.set('audioMixer', AM);
        
        var MM = AudioMixer.create();
        MM.loadSound('bg_slow', "sound/race bg slow");
        MM.loadSound('bg_fast', "sound/race bg fast2");
        this.set('musicMixer', MM);
        
        events.addListener(MM, 'crossFadeComplete', this.onCrossFadeComplete.bind(this));
        
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
    
        // Static binds
        this.addMeHandler = this.addMeHandler.bind(this)
        this.answerQuestion = this.answerQuestion.bind(this)
        this.removeMeHandler = this.removeMeHandler.bind(this)
        
        // Create player
        var player = Player.create();
        player.set('position', new geo.Point(400, 450));
        this.set('player', player);
        
        // Create dashboard
        var dash = Dashboard.create();
        dash.set('position', new geo.Point(800, 0));
        this.set('dash', dash);
        
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
        events.addListener(p, 'complete', this.runRemotely.bind(this));
        p.load();
        
        events.trigger(this, 'loaded');
    },
    
    // Parses the level xml file
    parseXML: function(xmlDoc) {
        var xml = XML.parser(xmlDoc.firstChild);
    
        var medals = this.parseMedals(xml); // Parse medal information
        this.parseAudio(xml);               // Parse the audio information
        this.parseSpeed(xml);               // Parse and set player speed values
        this.parsePenalty(xml);             // Get the penalty time for incorrect answers
    
        // Parse and process questions
        RC.finishLine = this.parseProblemSet(xml) + RC.finishSpacing;
        
        // Process medal information
        medals[0] = RC.finishLine / this.get('player').get('maxSpeed');
        medals[medals.length] = medals[medals.length - 1] * 1.5;
        RC.times = medals;

        // Sanity check
        if(medals[0] > medals[1]) {
            console.log("WARNING: Calculated minimum time (" + medal[0] +") is longer than the maximum allowed time for a gold medal (" + medal[1] +").");
        }
        
        this.preprocessingComplete();
    },
    
    // Parse the medal values
    parseMedals: function (xml) {
        var ret = [];
        var node = XML.getDeepChildByName(xml, 'MEDALS');
        if(node != null) {
            var id, val;
            for(var i in node.children) {
                id = node.children[i].attributes['Id'];
                val = node.children[i].attributes['MEDAL_THRESHOLD'];
                
                if(id != null && val != null) {
                    if(val > 1000) {
                        val /= 1000;
                    }
                    
                    ret[id] = val;
                }
                else {
                    console.log('ERROR: Missing or corrupted medal data');
                }
            }
        }
        else {
            console.log('ERROR: No medal data found for stage');
        }
        
        return ret;
    },
    
    // Parse the audio information
    parseAudio: function (xml) {
        var node = XML.getDeepChildByName(xml, 'AudioSettings');
        if(node) {
            RC.crossFadeSpeed = node['crossFadeSpeed'] == null ? RC.crossFadeSpeed : node['crossFadeSpeed'];
        }
    },
    
    // Parse the penalty settings
    parsePenalty: function (xml) {
        var node = XML.getDeepChildByName(xml, 'PenaltySettings');
        if(node != null) {
            if(node.attributes['TimeLost'] != null) {
                RC.penaltyTime = node.attributes['TimeLost'];
            }
            if(node.attributes['SpeedLost'] != null) {
                RC.penaltySpeed = node.attributes['SpeedLost'] * -1;
            }
        }
    },
    
    // Parse and set player speed values
    parseSpeed: function (xml) {
        var node = XML.getDeepChildByName(xml, 'SpeedSettings');
        
        var max = node.attributes['Max'];
        var min = node.attributes['Min'];
        var speed = node.attributes['Default'];
        var accel = node.attributes['Acceleration'];
        var decel = node.attributes['Deceleration'];
        var turbo = node.attributes['Turbo'];
      
        // Heper function for setting values without overwritting defaults
        var helper = function(obj, key, val){
            if(val != null) {
                obj.set(key, val);
            }
        }
        
        // Set the values on the player
        var p = this.get('player')
        helper(p, 'maxSpeed', max);
        helper(p, 'minSpeed', min);
        helper(p, 'zVelocity', speed==null ? min : speed);
        helper(p, 'acceleration', accel);
        helper(p, 'deceleration', decel);
        helper(p, 'turboSpeed', turbo==null ? max : turbo);
    },
    
    // Parses the PROBLEM_SET
    parseProblemSet: function (xml) {
        var problemRoot = XML.getDeepChildByName(xml, 'PROBLEM_SET');
        var subsets = problemRoot.children;
        var z = 0;
        var once = true;
        
        for(var i in subsets) {
            z = this.parseProblemSubset(subsets[i], z, once);
            once = false;
        }
        
        return z;
    },
    
    // Parses a subset within the PROBLEM_SET
    parseProblemSubset: function (subset, z, once) {
        
        var interContent = Content.buildFrom(subset.children[0]);
        
        // Not the first subset
        if(!once) {
            z += RC.intermissionSpacing;
            // Gets the intermission value
            
            var inter = Intermission.create(interContent, z);
            events.addListener(inter, 'changeSelector', this.get('player').startIntermission.bind(this.get('player')));
            events.addListener(inter, 'changeSelector', this.pause.bind(this));
            inter.idle();
			
            // Append the intermission to the list of intermissions
			var temp = this.get('inters');
			temp.push(z);
			this.set('inters', temp);
			
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
			opts['content'] = cocos.nodes.Sprite.create({file: '/resources/checkpoint_p.png',});
			
			var fl = PNode.create(opts);
			events.addListener(fl, 'addMe', this.addMeHandler);
			fl.idle();
			fl.set('zOrder', -5);
        }
        else {
            this.set('startSelector', interContent);
        }
        
        // Interate over questions in subset
        var list = this.get('questionList');
        for(var i=1; i<subset.children.length; i+=1) {
            z += RC.questionSpacing;

            // Create a question
            list[list.length] = Question.create(subset.children[i], z);
            events.addListener(list[list.length - 1], 'questionTimeExpired', this.answerQuestion);
            events.addListener(list[list.length - 1], 'addMe', this.addMeHandler);
            list[list.length - 1].idle();
        }
        
        this.set('questionList', list);
        
        return z;
    },
    
    // The 'real init()' called after all the preloading/parsing is completed
    preprocessingComplete: function () {
        // Create key bindings
        this.setBinding('MOVE_LEFT',    [65, 37]);  // [A, ARROW_LEFT]
        this.setBinding('MOVE_RIGHT',   [68, 39]);  // [D, ARROW_RIGHT]
        this.setBinding('SPEED_UP',     [87, 38]);  // [W, ARROW_UP]
        this.setBinding('SPEED_DOWN',   [83, 40]);  // [S, ARROW_DOWN]
        this.setBinding('TURBO',        [32]);      // [SPACE]
        this.setBinding('ABORT',        [27]);      // [ESC]
        this.setBinding('SHOW_FPS',     [80]);      // [P]
        
        // Draw background
        var bg = Background.create();
        bg.set('zOrder', -10);
        this.set('background', bg);
        this.addChild({child: bg});
        
        var player = this.get('player');
        player.set('xCoordinate', this.lanePosX[RC.curNumLanes][1]);
        
        // Add the right hand side dash
        var dash = this.get('dash');
        dash.set('maxSpeed', player.get('maxSpeed'));
        this.addChild({child: dash});
        dash.set('zOrder', -1);
		dash.set('checkpoints', this.get('inters'));
        
        events.addListener(player, 'IntermissionComplete', this.unpause.bind(this));
        
        // Add player
        this.addChild({child: player});
        
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
        opts['content'] = cocos.nodes.Sprite.create({file: '/resources/finishline.png',});
        opts['content'].set('scaleX', 2);
        opts['content'].set('scaleY', 0.5);
        
        var fl = PNode.create(opts);
        events.addListener(fl, 'addMe', this.addMeHandler);
        fl.idle();
        fl.set('zOrder', -5);
        
        // Add version number
        var vtag = cocos.nodes.Label.create({string: this.get('version')})
        vtag.set('anchor-point', new geo.Point(0.5, 0.5));
        vtag.set('position', new geo.Point(850, 590));
        this.addChild({child: vtag});
        
        // Create FPS meter
        var fps = cocos.nodes.Label.create({string: '0 FPS'})
        fps.set('position', new geo.Point(20, 20));
        this.fps = fps;
        this.fpsTracker = [30, 30, 30, 30, 30];
        this.fpsToggle = false;
        
        // Calculate new min safe time
        var m = Math.min(RC.questionSpacing, RC.intermissionSpacing);
        m = Math.min(m, RC.finishSpacing);
        
        RC.maxTimeWindow = m / player.get('maxSpeed') * 0.9;
        
        // Generate things to the side of the road
        var sprite = cocos.nodes.Sprite.create({file: '/resources/tree_1.png',});
        
        for(var t=10; t<RC.finishLine + 100; t += Math.ceil(Math.random()*6+4)) {
            if(Math.random() < 0.25) {
                var p = PNode.create({xCoordinate: 4 * Math.random() + 5.5, zCoordinate: t, content: sprite, alignH: 0.5, alignV: 0.5})
                p.set('zOrder', -4);
                events.addListener(p, 'addMe', this.addMeHandler);
                p.idle();
            }
            if(Math.random() < 0.25) {
                var p = PNode.create({xCoordinate: -4 * Math.random() - 5.5, zCoordinate: t, content: sprite, alignH: 0.5, alignV: 0.5})
                p.set('zOrder', -4);
                events.addListener(p, 'addMe', this.addMeHandler);
                p.idle();
            }
        }
    },
    
    // Three second countdown before the game begins (after pressing the start button on the menu layer)
    // TODO: Make countdown more noticible
    countdown: function () {
        var medalCars = []
        
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
        
        // Ghost cars representing medal cutoffs
        // TODO: Make seperate class, support lines in addition to cars
        for(var i=0; i<3; i+= 1) {
            var car = cocos.nodes.Sprite.create({file: '/resources/car'+i+'.png'});
            car.set('opacity', 192);
        
            opts['content'] = car
            medalCars[i] = PNode.create(opts)
            medalCars[i].zVelocity = RC.finishLine / RC.times[i+1];
            
            events.addListener(medalCars[i], 'addMe', this.addMeHandler);
            events.addListener(medalCars[i], 'removeMe', this.removeMeHandler);
            medalCars[i].delOnDrop = false;
        }
        
        this.set('medalCars', medalCars);
        
        // Set audio levels
        this.musicMixer.setMasterVolume(0.35);

        this.audioMixer.getSound('accel').setVolume(0.8);
        this.audioMixer.getSound('screech').setVolume(0.5);
        
        this.audioMixer.playSound('countdown');
    
        this.get('dash').bindTo('speed', this.get('player'), 'zVelocity');
        this.get('dash').bindTo('playerZ', this.get('player'), 'zCoordinate');
        this.get('dash').bindTo('goldZ', this.medalCars[0], 'zCoordinate');
        this.get('dash').bindTo('silverZ', this.medalCars[1], 'zCoordinate');
        this.get('dash').bindTo('bronzeZ', this.medalCars[2], 'zCoordinate');
        setTimeout(this.startGame.bind(this), RC.initialCountdown);
        this.get('audioMixer').playSound('bg');
        
        var cd = cocos.nodes.Label.create({string: '3', textColor: '#000000'});
        cd.set('scaleX', 10);
        cd.set('scaleY', 10);
        cd.set('position', new geo.Point(400, 300));
        
        this.set('cdt', cd);
        this.addChild({child: cd});
        
        // Set the starting value on the player's car
        this.get('player').changeSelectorByForce(this.get('startSelector'));
        
        var that = this;
        setTimeout(function () { that.get('cdt').set('string', '2'); }, 750)
        setTimeout(function () { that.get('cdt').set('string', '1'); }, 1500)
        setTimeout(function () { that.get('cdt').set('string', 'GO!'); that.get('cdt').set('position', new geo.Point(300, 300)); }, 2250)
        setTimeout(function () { that.removeChild(that.get('cdt')); }, 2750)
        
        this.audioMixer.playSound('start');
        this.audioMixer.loopSound('hum');
        
        // Catch window unloads at this point as aborts
        $(window).unload(this.endOfGame.bind(this, null));
    },
    
    // Starts the game
    startGame: function () {
        this.scheduleUpdate();          // Start keyboard input and fps tracking
        var p = this.get('player');
        p.scheduleUpdate();             // Start the player
        this.get('dash').start();       // Start timer and dash updates
        
        // Accelerate the player to their default speed after starting
        var ds = p.get('zVelocity');
        p.set('zVelocity', 0);
        MOT.create(0, ds, 0.2).bind(p, 'zVelocity');
        
        this.medalCars[0].scheduleUpdate();
        this.addChild({child: this.medalCars[0]});
        this.medalCars[1].scheduleUpdate();
        this.addChild({child: this.medalCars[1]});
        this.medalCars[2].scheduleUpdate();
        this.addChild({child: this.medalCars[2]});
        
        // Start background music
        this.musicMixer.loopSound('bg_slow');
        this.musicMixer.getSound('bg_fast').setVolume(0);
        this.musicMixer.loopSound('bg_fast');
    },
    
	// Pauses the dashboard and medal cars
    pause: function () {
        this.get('dash').pauseTimer();
        
        this.audioMixer.playSound('intermission');
        
        var mc = this.get('medalCars');
        
        for(var i=0; i<3; i+=1) {
            mc[i].prepause = mc[i].zVelocity;
            mc[i].zVelocity = 0;
        }
        
        this.set('medalCars', mc);
    },
    
	// Unpauses the dashboard and medal cars
    unpause: function () {
        this.get('dash').unpauseTimer();
        
        var mc = this.get('medalCars');
        
        for(var i=0; i<3; i+=1) {
            mc[i].zVelocity = mc[i].prepause;
            mc[i].prepause = 0;
        }
        
        this.set('medalCars', mc);
    },
    
    // Handles add requests from PerspectiveNodes
    // TODO: Make a PerspectiveView class to handle these functions?
    // STATIC BIND
    addMeHandler: function (toAdd) {
        this.addChild({child: toAdd});
        events.addListener(toAdd, 'removeMe', this.removeMeHandler);
    },
    
    // Handles removal requests from PerspectiveNodes
    // STATIC BIND
    removeMeHandler: function (toRemove) {
        this.removeChild(toRemove);
    },
    
    onCrossFadeComplete: function () {
        this.bgFade = false;
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
        
        // Fade out background music tracks at the end of the game
        var s;
        s = this.musicMixer.getSound('bg_fast');
        MOT.create(s.volume, -1, 2).bindFunc(s, s.setVolume);
        s = this.musicMixer.getSound('bg_slow');
        MOT.create(s.volume, -1, 2).bindFunc(s, s.setVolume);
        
        this.audioMixer.stopSound('hum');
        this.audioMixer.playSound('finish');
    
        // Stop the player from moving further and the dash from increasing the elapsed time
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this.get('player'));
        
        this.dash.pauseTimer();
        
        // Stops the medal pace cars
        var mc = this.get('medalCars');
        mc[0].set('zVelocity', 0);
        mc[1].set('zVelocity', 0);
        mc[2].set('zVelocity', 0);
    
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
        
        var tt = this.get('dash').getTotalTime()
        var m = 1;
        
        if(finished) {
            while(m < 4 && RC.times[m] < tt) {
                m += 1;
            }
        }
        else {
            m = 4;
        }
        
        // Checks to see if abort was related to window.unload
        if(finished != null) {
            //alert("Correct: " + correct + '\nTotal Time: ' + tt + '\nMedal Earned: ' + RC.medalNames[m] );
            var e = EOGD.create(this.get('dash').get('elapsedTime'), incorrect + unanswered, !finished);
            e.set('position', new geo.Point(200, 50));
            this.addChild({child: e});
            var that = this;
            events.addListener(e, 'almostComplete', function () {that.get('menuLayer').addRetryButton();});
            events.addListener(e, 'complete', this.cleanup.bind(this));
            this.eogd = e;
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

    // Writes the output xml file as a string and returns it
    // TODO: Decide on a new format if needed and update
    writeXML: function(correct, state) {
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
    
    // Handles answering the current question when time expires
    // STATIC BIND
    answerQuestion: function(question) {
        var result = question.answerQuestion(this.lane);

        var player = this.get('player');
        
        // Handle correct / incorrect feedback
        if(result) {
            this.audioMixer.playSound('correct', true);
        }
        else {
            var dash = this.get('dash');
            var t = dash.elapsedTime + dash.pTime + parseFloat(RC.penaltyTime);
        
            player.wipeout(1);
            dash.modifyPenaltyTime(RC.penaltyTime);
            
            this.audioMixer.playSound('wrong', true);
            
            // Update medal car velocities to account for penalty time
            var c = this.get('medalCars')
            for(var i=0; i<3; i+=1) {
                var rd = RC.finishLine - c[i].get('zCoordinate');
                var rt = RC.times[i+1] - t;
                
                if(rt > 0.1 && rd > 0) {
                    c[i].set('zVelocity', rd / rt);
                }
                else if (rd > 0) {
                    c[i].set('zVelocity', rd / 0.1);
                }
            }
            
            this.set('medalCars', c);
        }
        
        player.endTurboBoost();
    },
    
    // Toggles the AudioMixer's mute
    muteHandler: function() {
        var AM = this.get('audioMixer');
        AM.setMute(!AM.get('muted'));
    },
    
    muteMusicHandler: function() {
        var AM = this.get('musicMixer');
        AM.setMute(!AM.get('muted'));
    },
    
    // Called every frame, manages keyboard input
    update: function(dt) {
        var player = this.get('player');
        var playerX = player.get('xCoordinate');
        
        if(player.get('zCoordinate') > RC.finishLine && this.eogd == null) {
            this.endOfGame(true);
        }
        
        if(this.checkAnyKey() && this.eogd != null) {
            this.eogd.skipAnimation();
        }
        
    // Move the player according to keyboard
        // 'A' / 'LEFT' Move left, discreet
        if(this.checkBinding('MOVE_LEFT') == KeyboardLayer.PRESS) {
            if(this.lane > 0) {
                this.lane -= 1;
                player.set('xCoordinate', this.lanePosX[RC.curNumLanes][this.lane]);
                this.audioMixer.playSound('screech', true);
            }
        }
        // 'D' / 'RIGHT' Move right, discreet
        else if(this.checkBinding('MOVE_RIGHT') == KeyboardLayer.PRESS) {
            if(this.lane < RC.curNumLanes-1) {
                this.lane += 1;
                player.set('xCoordinate', this.lanePosX[RC.curNumLanes][this.lane]);
                this.audioMixer.playSound('screech', true);
            }
        }
        
        var decel_lock = false;
        
        // 'S' / 'DOWN' Slow down, press
        if(this.checkBinding('SPEED_DOWN') > KeyboardLayer.UP) {
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
            
        if(!decel_lock && this.checkBinding('SPEED_UP') > KeyboardLayer.UP) {
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
        if(this.checkBinding('TURBO') == KeyboardLayer.PRESS) {
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
        
        // Log spikes to console if FPS tracker is enabled
        if(this.fpsToggle) {
            if(1 / dt < 20) {
                console.log('FPS Spike down frame ( ' + cur.toFixed(1) + ' FPS / ' + (dt*1000).toFixed(0) + ' ms dt )');
            }
        }
        
        // Smooth over multiple frames
        this.fps.set('fontColor', '#FFFFFF');
        for(t in this.fpsTracker){
            sub += this.fpsTracker[t];
            
            // Flash red on low framerate spikes
            if(this.fpsTracker[t] < 20) {
                this.fps.set('fontColor', '#DD2222');
            }
        }
        
        // Update the FPS tracker label
        this.fps.set('string', (sub / this.fpsTracker.length).toFixed(1) + ' FPS');
        
        // 'P' Toggle showing FPS tracker, discreet
        if(this.checkBinding('SHOW_FPS') == KeyboardLayer.PRESS) {
            if(!this.get('fpsToggle')) {
                this.addChild({child: this.fps});
                this.fpsToggle = true;
            }
            else {
                this.removeChild({child: this.fps});
                this.fpsToggle = false;
            }
        }
    },
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
        
        // Create the volume control
        // TODO: Make a better basic (toggle)button (extend MenuItemImage?)
        opts['normalImage'] = '/resources/volume-control.png';
        opts['selectedImage'] = '/resources/volume-control.png';
        opts['disabledImage'] = '/resources/volume-control.png';
        opts['callback'] = this.volumeCallback.bind(this);
        
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
        opts['callback'] = this.volumeCallback.bind(this);
        
        vc = cocos.nodes.MenuItemImage.create(opts);
        vc.set('position', new geo.Point(425, 250));
        this.set('volumeButtonOff', vc);
        
        opts['callback'] = this.musicCallback.bind(this);
        vc = cocos.nodes.MenuItemImage.create(opts);
        vc.set('position', new geo.Point(375, 250));
        this.set('musicButtonOff', vc);
    },
    
    // Called when the button is pressed, clears the button, then hands control over to the main game
    startButtonCallback: function() {
        this.removeChild(this.get('startButton'));
        events.trigger(this, "startGameEvent");
    },
    
    // Called when the volume button is pressed
    // TODO: Seperate this into two functions (mute/unmute)?
    // TODO: Implement a slider/levels to set master volume
    volumeCallback: function() {
        events.trigger(this, "muteEvent");
        
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
        opts['normalImage'] = '/resources/Retry_Up.png';
        opts['selectedImage'] = '/resources/Retry_Down.png';
        opts['disabledImage'] = '/resources/Retry_Up.png';
        opts['callback'] = this.retryButtonCallback.bind(this);
        
        var b = cocos.nodes.MenuItemImage.create(opts);
        b.set('position', new geo.Point(10-450+300, 230-300+125));
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
    
    // Setup the director
    var director = cocos.Director.get('sharedDirector');
    director.attachInView(document.getElementById('cocos_test_app'));
    
    var scene = cocos.nodes.Scene.create();     // Create a scene
    var app = FluencyApp.create();              // Create the layers
    var menu = MenuLayer.create();
    
    // Set up inter-layer events
    events.addListener(app, 'loaded', menu.createMenu.bind(menu));
    
    events.addListener(menu, 'startGameEvent', app.countdown.bind(app));
    events.addListener(menu, 'muteEvent', app.muteHandler.bind(app));
    events.addListener(menu, 'muteMusicEvent', app.muteMusicHandler.bind(app));
    
    // Add our layers to the scene
    scene.addChild({child: app});
    scene.addChild({child: menu});
    
    // Allow the App layer to directly access the UI layer
    app.set('menuLayer', menu);
    
    // Run the scene
    director.runWithScene(scene);
};