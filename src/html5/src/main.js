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
var PSprite = require('PerspectiveSprite').PerspectiveSprite;
var Question = require('Question').Question;
var RC = require('RaceControl').RaceControl;
    
// Create a new layer
var FluencyApp = KeyboardLayer.extend({
    player      : null, // Holds the player
    background  : null, // Holds the the background object
    dash        : null, // Holds the right hand side dashboard
    questionList: [],   // List of all questions in the input
    speed       : 20,   // Current speed in meters/second
    speedMin    : 10,   // Minimum speed in meters/second
    speedMax    : 100,  // Maximum speed in meters/second
    speedDeltaR : 0,    // Rate at which speed changes in meters/second^2
    speedDeltaT : 0,    // Remaining duration of game enforced speed change
    audioMixer  : null, // AudioMixer
    // Not the 'real init', sets up and starts preloading
    init: function() {
        // You must always call the super class version of init
        FluencyApp.superclass.init.call(this);
        
        // Set up basic audio
        var AM = AudioMixer.create();
        AM.loadSound('bg', "sound/01 Yellow Line");
        AM.loadSound('wipeout', "sound/Carscreech");
        this.set('audioMixer', AM);
        
        // Uncomment to run locally
        this.runLocally();
        return;
        
        // Set up remote resources
        __remote_resources__["resources/testset.xml"] = {meta: {mimetype: "text/xml"}, data: "set001.xml"};
        
        // Preload remote resources
        var p = cocos.Preloader.create();
        events.addListener(p, 'complete', this.runRemotely.bind(this));
        p.load();
    },
    
    // Remote resources failed to load, generate dummy data then proceed
    // TODO: Determine what to do if we get 404s in production
    runLocally: function() {
        console.log("Now running locally from this point forward");
        
        var list = [];
        for(var i=0; i<6; i+=1) {
            var inter = Intermission.create(20+i, i*500+10);
            events.addListener(inter, 'changeSelector', this.intermissionHandler.bind(this));
            inter.kickstart();
            for(var j=1; j<4; j+=1) {
                list[list.length] = Question.create(1, 10+i, 30+i, i*500 + j*150 + 10);
                events.addListener(list[list.length - 1], 'questionTimeExpired', this.answerQuestion.bind(this));
                events.addListener(list[list.length - 1], 'addMe', this.addMeHandler.bind(this));
                list[list.length - 1].kickstart();
            }
        }
        
        this.set('questionList', list);
        
        var player = Player.create();
        player.set('position', new geo.Point(400, 450));
        this.set('player', player);
        
        for(var t=0; t<3300; t += Math.ceil(Math.random()*6+4)) {
            if(Math.random() < 0.25) {
                var p = PSprite.create({xCoordinate: 4 * Math.random() + 5.5, zCoordinate: t, sprite: '/resources/tree_1.png', silent: true})
                this.addChild({child: p})
            }
            if(Math.random() < 0.25) {
                var p = PSprite.create({xCoordinate: -4 * Math.random() - 5.5, zCoordinate: t, sprite: '/resources/tree_1.png', silent: true})
                this.addChild({child: p})
            }
        }
        
        this.preprocessingComplete();
    },
    
    // Remote resources loaded successfully, proceed as normal
    runRemotely: function() {
        this.parseXML(resource("resources/testset.xml"));
    },
    
    // Parses (part of) the level xml file
    // TODO: Decide on input file format and rewrite this as needed.
    parseXML: function(xmlDoc) {
        var problemRoot = xmlDoc.getElementsByTagName('PROBLEM_SET')[0];
        
        var qlist = QuestionList.create();

        var subset = problemRoot.firstElementChild;
        
        while(subset != null) {
            var node = subset.firstElementChild;
            if(qlist.addIntermission(node.getAttribute("VALUE"))) {
                var player = Player.create();
                player.set('position', new geo.Point(400, 450));
                player.changeSelector(node.getAttribute("VALUE"));
                this.set('player', player);
            }
            
            var d1, d2, ans;
            node = node.nextElementSibling;
            
            while(node != null) {
                var vals = node.firstElementChild;
                var delims = vals.firstElementChild;
                d1 = delims.getAttribute("VALUE");
                d2 = delims.nextElementSibling.getAttribute("VALUE");
                while(vals != null) {
                    if(vals.tagName == "ANSWER") {
                        ans = vals.getAttribute("VALUE");
                    }
                    
                    vals = vals.nextElementSibling;
                }
                
                qlist.addQuestion(Question.create(ans, d1, d2));
                
                node = node.nextElementSibling;
            }
            
            subset = subset.nextElementSibling;
        }
        
        this.set('questionList', qlist);
        
        this.preprocessingComplete();
    },
    
    // The 'real init()' called after all the preloading/parsing is completed
    preprocessingComplete: function () {
        // Create key bindings
        this.setBinding('MOVE_LEFT',    [65, 37]);  // [A, ARROW_LEFT]
        this.setBinding('MOVE_RIGHT',   [68, 39]);  // [D, ARROW_RIGHT]
        this.setBinding('SPEED_UP',     [87, 38]);  // [W, ARROW_UP]
        this.setBinding('SPEED_DOWN',   [83, 40]);  // [S, ARROW_DOWN]
        
        // Draw background
        var bg = Background.create();
        bg.set('zOrder', -1);
        this.set('background', bg);
        this.addChild({child: bg});
        
        // Create the right hand side dash
        var dash = Dashboard.create();
        dash.set('position', new geo.Point(800, 0));
        this.set('dash', dash);
        this.addChild({child: dash});
        
        this.addChild({child: this.get('player')});
    },
    
    // Three second countdown before the game begins (after pressing the start button on the menu layer)
    countdown: function () {
        this.get('dash').start();
        this.get('dash').bindTo('speed', this, 'speed');
        setTimeout(this.startGame.bind(this), 3000);
        this.get('audioMixer').playSound('bg');
    },
    
    // Starts the game
    startGame: function () {
        // Schedule per frame update function
        this.scheduleUpdate();
    },
    
    // Handles add requests from PerspectiveNodes
    addMeHandler: function (toAdd) {
        this.addChild({child: toAdd});
        events.addListener(toAdd, 'removeMe', this.removeMeHandler.bind(this));
    },
    
    // Handles removal requests from PerspectiveNodes
    removeMeHandler: function (toRemove) {
        this.removeChild(toRemove);
    },
    
    // Called when game ends, should collect results, display them to the screen and output the result XML
    // TODO: Calculate the rest of the statistics needed
    // TODO: Format into XML and send to server
    endOfGame: function(evt) {
        // Stop the dash from updating and increasing the overall elapsed time
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this.get('dash'));
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
        alert("Correct: " + correct);
    },
    
    // Handles when an intermission occurs
    // TODO: Add more visuals on intermission (eg. overhead signs in ft1)
    intermissionHandler: function(selector) {
        if(selector) {
            this.get('player').changeSelector(selector);
            console.log("New subset starting");
        }
        else {
            console.log("****ERROR: no new selector given for new subset");
        }
    },
    
    //Handles answering the current question when time expires
    answerQuestion: function(question) {
        var result;
        
        var player = this.get('player');
        var playerX = player.get('xCoordinate');
        
        // Determine answer based on the lane
        if(playerX < PNode.roadWidth / -6) {
            result = question.answerQuestion(0);
        }
        else if(playerX < PNode.roadWidth / 6) {
            result = question.answerQuestion(1);
        }
        else {
            result = question.answerQuestion(2);
        }
        
        // Handle correct / incorrect feedback
        if(result) {
            // TODO: correct sounds effects
        }
        else {
            player.wipeout(1, 2);
            this.get('audioMixer').playSound('wipeout', true);
            this.get('dash').modifyPenaltyTime(8);
            this.speedChange(this.get('speed') / -2, 1);
        }
    },
    
    // Enforce a speed change on the player
    speedChange: function (amt, dur) {
        // Only apply if we are finished with a previous change
        // TODO: Queue multiple changes? (or replace current change with he new change)
        if(this.get('speedDeltaT') == 0) {
            this.set('speedDeltaT', dur);
            this.set('speedDeltaR', amt / dur);
            
            return true;
        }
        return false;
    },
    
    // Toggles the AudioMixer's mute
    muteHandler: function() {
        var AM = this.get('audioMixer');
        AM.setMute(!AM.get('muted'));
    },
    
    // Called every frame, manages keyboard input
    update: function(dt) {
        if(PNode.cameraZ + PNode.carDist > RC.finishLine) {
            this.endOfGame();
            return;
        }
    
        var player = this.get('player');
        var playerX = player.get('xCoordinate');
        var s = this.get('speed');
        
    // Move the player according to keyboard
        // 'A' / 'LEFT' Move left, discreet
        if(this.checkBinding('MOVE_LEFT') == KeyboardLayer.PRESS) {
            playerX -= 3
            if(playerX < -3) {
                playerX = -3
            }
            player.set('xCoordinate', playerX);
        }
        // 'D' / 'RIGHT' Move right, discreet
        else if(this.checkBinding('MOVE_RIGHT') == KeyboardLayer.PRESS) {
            playerX += 3
            if(playerX > 3) {
                playerX = 3
            }
            player.set('xCoordinate', playerX);
        }
        
        // Game enforced speed changes take priority over player requested acceleration
        var sdt = this.get('speedDeltaT');
        if(sdt > 0) {
            this.set('speedDeltaT', Math.max(sdt - dt, 0));
            var amt = Math.min(Math.max(s + this.get('speedDeltaR') * dt, this.get('speedMin')), this.get('speedMax')) - s
            this.set('speed', s + amt);
            PNode.carDist += amt / 40 * 0.25;
        }
        // 'S' / 'DOWN' Slow down, press
        // TODO: Paramatertize acceleration, modify carDist to move along a range instead of absolutely
        else if(this.checkBinding('SPEED_DOWN') > KeyboardLayer.UP) {
            if(s > this.get('speedMin')) {
                s -= 40 * dt;
                PNode.carDist -= 0.25 * dt;
                this.set('speed', s);
            }
        }
        // 'W' / 'UP' Speed up, press
        else if(this.checkBinding('SPEED_UP') > KeyboardLayer.UP) {
            if(s < this.get('speedMax')) {
                s += 40 * dt;
                PNode.carDist += 0.25 * dt;
                this.set('speed', s);
            }
        }
        
        PNode.cameraZ += s * dt;
    },
});

// For button-like interactions (e.g. starting the game)
// TODO: Extend Menu with functions making it easier to tie the Menu into an app
var MenuLayer = cocos.nodes.Menu.extend({
    startButton : null,     // Holds the button to start the game
    startGame   : null,     // Holds the function in the app that starts the game
    muted       : false,    // State of the volume mute button
    init: function(hook) {
        MenuLayer.superclass.init.call(this, {});
        
        // Create the button
        var opts = Object();
        opts['normalImage'] = '/resources/start-button.jpeg';
        opts['selectedImage'] = '/resources/start-button.jpeg';
        opts['disabledImage'] = '/resources/start-button.jpeg';
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
        vc.set('position', new geo.Point(400, 250));
        this.set('volumeButtonOn', vc);
        this.addChild({child: vc});
        
        opts['normalImage'] = '/resources/volume-control-off.png';
        opts['selectedImage'] = '/resources/volume-control-off.png';
        opts['disabledImage'] = '/resources/volume-control-off.png';
        opts['callback'] = this.volumeCallback.bind(this);
        
        var vc = cocos.nodes.MenuItemImage.create(opts);
        vc.set('position', new geo.Point(400, 250));
        this.set('volumeButtonOff', vc);
        
        // Store the function to call when pressing the button
        this.set('startGame', hook);
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
    }
});

// Initialise application
exports.main = function() {
    // Get director
    var director = cocos.Director.get('sharedDirector');

    // Attach director to our <div> element
    director.attachInView(document.getElementById('cocos_test_app'));
    
    // Create a scene
    var scene = cocos.nodes.Scene.create();

    // Create our layers
    var app = FluencyApp.create();
    var menu = MenuLayer.create();
    
    // Set up inter-layer events
    events.addListener(menu, "startGameEvent", app.countdown.bind(app));
    events.addListener(menu, "muteEvent", app.muteHandler.bind(app));
    
    // Add our layers to the scene
    scene.addChild({child: app});
    scene.addChild({child: menu});

    // Run the scene
    director.runWithScene(scene);
};
