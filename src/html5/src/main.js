// Import the cocos2d module
var cocos = require('cocos2d');
var geo = require('geometry');
var events = require('events');

// Project Imports
var Player = require('Player').Player;
var KeyboardLayer = require('KeyboardLayer').KeyboardLayer
var FractionRenderer = require('FractionRenderer').FractionRenderer
var Background = require('Background').Background;
var Question = require('Question').Question;
var LabelBG = require('LabelBG').LabelBG;
var PNode = require('PerspectiveNode').PerspectiveNode;
var Intermission = require('Intermission').Intermission;
var RC = require('RaceControl').RaceControl;
    
// Create a new layer
var FluencyApp = KeyboardLayer.extend({
    player      : null, // Holds the instance of the player
    background  : null, // Holds the instance of the background object
    questionList: [],   // List of all questions in the input
    speed       : 20,   // Current speed in meters/second
    speedMin    : 10,   // Minimum speed in meters/second
    speedMax    : 100,  // Maximum speed in meters/second
    speedDeltaR : 0,    // Rate at which speed changes in meters/second^2
    speedDeltaT : 0,    // Remaining duration of game enforced speed change
    // Not the 'real init', sets up and starts preloading
    init: function() {
        // You must always call the super class version of init
        FluencyApp.superclass.init.call(this);
        
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
        // Initializing variables
        var bg = Background.create();
        this.set('background', bg);
        this.addChild({child: bg});
        
        this.addChild({child: this.get('player')});
    },
    
    // Three second countdown before the game begins (after pressing the start button on the menu layer)
    countdown: function () {
        this.get('background').get('dash').start();
        this.get('background').get('dash').bindTo('speed', this, 'speed');
        setTimeout(this.startGame.bind(this), 3000);
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
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this.get('background').get('dash'));
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
        }
        else {
            player.wipeout(1, 2);
            this.get('background').get('dash').modifyPenaltyTime(8);
            this.speedChange(this.get('speed') / -2, 1);
        }
    },
    
    speedChange: function (amt, dur) {
        // Only apply if we are finished with a previous change
        if(this.get('speedDeltaT') == 0) {
            this.set('speedDeltaT', dur);
            this.set('speedDeltaR', amt / dur);
            
            return true;
        }
        return false;
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
        // 'A' Move left, continuous
        if(this.checkKey(65) > 0) {
            playerX -= 3 * dt
            if(playerX < -4) {
                playerX = -4
            }
            player.set('xCoordinate', playerX);
        }
        // 'D' Move right, continuous
        else if(this.checkKey(68) > 0) {
            playerX += 3 * dt
            if(playerX > 4) {
                playerX = 4
            }
            player.set('xCoordinate', playerX);
        }
        
        // Game enforced speed changes take priority
        var sdt = this.get('speedDeltaT');
        if(sdt > 0) {
            this.set('speedDeltaT', Math.max(sdt - dt, 0));
            var amt = Math.min(Math.max(s + this.get('speedDeltaR') * dt, this.get('speedMin')), this.get('speedMax')) - s
            this.set('speed', s + amt);
            PNode.carDist += amt / 40 * 0.25;
        }
        // 'S' Slow down, press
        else if(this.checkKey(83) > 0) {
            if(s > this.get('speedMin')) {
                s -= 40 * dt;
                PNode.carDist -= 0.25 * dt;
                this.set('speed', s);
            }
        }
        // 'W' Speed up, press
        else if(this.checkKey(87) > 0) {
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
var MenuLayer = cocos.nodes.Menu.extend({
    startButton:null,   //Holds the button to start the game
    startGame:null,     //Holds the function in the app that starts the game
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
        
        // Store the function to call when pressing the button
        this.set('startGame', hook);
    },
    
    // Called when the button is pressed, clears the button, then hands control over to the main game
    startButtonCallback: function() {
        this.removeChild(this.get('startButton'));
        this.get('startGame').call();
    }
});

exports.main = function() {
    // Initialise application
    
    // Get director
    var director = cocos.Director.get('sharedDirector');

    // Attach director to our <div> element
    director.attachInView(document.getElementById('cocos_test_app'));
    
    // Create a scene
    var scene = cocos.nodes.Scene.create();

    // Add our layers to the scene
    var app = FluencyApp.create();
    scene.addChild({child: app});
    var menu = MenuLayer.create(app.countdown.bind(app));
    scene.addChild({child: menu});

    // Run the scene
    director.runWithScene(scene);
};
