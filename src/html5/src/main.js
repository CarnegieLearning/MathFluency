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
var QuestionList = require('QuestionList').QuestionList;
var Preloader = require('Preloader').Preloader;
var LabelBG = require('LabelBG').LabelBG;
    
// Create a new layer
var FluencyApp = KeyboardLayer.extend({
    player: null,           // Holds the instance of the player
    background:null,        // Holds the instance of the background object
    currentQuestion:null,   // The current question displayed
    questionList:null,      // List of all questions in the input
    speed:null,             // Current speed in units/second
    speedMin:null,          // Minimum speed in units/second
    speedMax:null,          // Maximum speed in units/second
    nextQuestionDelay:null, // Delay between finishing a question and starting the next one (milliseconds)
    // Not the 'real init', sets up and starts preloading
    init: function() {
        // You must always call the super class version of init
        FluencyApp.superclass.init.call(this);
        
        // Uncomment to run locally
        //this.runLocally()
        
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
        
        var qlist = QuestionList.create();
        for(var i=0; i<6; i+=1) {
            qlist.addIntermission({selector: 20+i});
            for(var j=0; j<3; j+=1) {
                qlist.addQuestion(Question.create(1, 10+i, 30+i));
            }
        }
        
        this.set('questionList', qlist);
        
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
        
        this.set('elapsedTime', 0.0);
        this.set('speed', 1000);
        this.set('speedMin', 250);
        this.set('speedMax', 8000);
        this.set('nextQuestionDelay', 1000);
        
        // Setup event handling on the QuestionList
        var qlist = this.get('questionList');
        events.addListener(qlist, 'noQuestionsRemaining', this.endOfGame.bind(this));
        events.addListener(qlist, 'intermission', this.intermissionHandler.bind(this));
        events.addListener(qlist, 'QuestionReady', this.nextQuestion.bind(this));
    },
    
    // Three second countdown before the game begins
    countdown: function () {
        this.get('background').get('dash').start();
        setTimeout(this.startGame.bind(this), 3000);
    },
    
    startGame: function () {
        // Start the game
        this.get('questionList').nextQuestion();

        // Schedule per frame update function
        this.scheduleUpdate();
    },
    
    // Called when game ends, should collect results, display them to the screen and output the result XML
    // TODO: Calculate the rest of the statistics needed
    // TODO: Format into XML and send to server
    endOfGame: function(evt) {
        // Stop the dash from updating and increasing the overall elapsed time
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this.get('background').get('dash'));
    
        // Make sure we remove the final question
        var cq = this.get('currentQuestion');
        if(cq != null) {
            this.removeChild(cq);
        }
    
        var ql = this.get('questionList').get('questions');
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
            setTimeout(this.get('questionList').nextQuestion, this.get('nextQuestionDelay'));
        }
        else {
            console.log("****ERROR: no new selector given for new subset");
        }
    },
    
    // Handles switching in the next question
    nextQuestion: function(question) {
        var cq = this.get('currentQuestion');
        if(cq != null) {
            cq.unbind('speed');
            this.removeChild(cq);
        }
        
        question.set('speed', this.get('speed'));
        question.bindTo('speed', this, 'speed', true);
        events.addListener(question, 'QuestionTimeExpired', this.answerQuestion.bind(this));
        
        this.addChild(question);
        this.set('currentQuestion', question);
    },
    
    //Handles answering the current question when time expires
    answerQuestion: function() {
        var cq = this.get('currentQuestion');
        var result;
        
        var player = this.get('player');
        var playerPos = player.get('position');
        
        // Determine answer based on the lane
        if(playerPos.x < 325) {
            result = cq.answerQuestion(0);
        }
        else if(playerPos.x < 475) {
            result = cq.answerQuestion(1);
        }
        else {
            result = cq.answerQuestion(2);
        }
        
        // Store the question back in the list
        this.get('questionList').storeQuestion(cq);
        
        // Handle correct / incorrect feedback
        if(result) {
        }
        else {
            player.wipeout(1);
            this.get('background').get('dash').modifyPenaltyTime(8);
        }
        
        // Delays the next question from appearing
        setTimeout(this.get('questionList').nextQuestion, this.get('nextQuestionDelay'));
    },
    
    // Called every frame, manages keyboard input
    update: function(dt) {
        var player = this.get('player');
        var playerPos = player.get('position');
        var s = this.get('speed');
        
    // Move the player according to keyboard
        // 'A' Move left, continuous
        if(this.checkKey(65) > 0) {
            playerPos.x -= 250 * dt
            if(playerPos.x < 225) {
                playerPos.x = 225
            }
            player.set('position', playerPos);
        }
        // 'D' Move right, continuous
        else if(this.checkKey(68) > 0) {
            playerPos.x += 250 * dt
            if(playerPos.x > 575) {
                playerPos.x = 575
            }
            player.set('position', playerPos);
        }
        // 'S' Slow down, press
        // TODO: Discreet or continuous for speed changes?
        // TODO: Parameterize acceleration/braking?
        if(this.checkKey(83) == 1) {
            if(s > this.get('speedMin')) {
                s /= 2;
                this.set('speed', s);
                
                console.log("Slowing down, current speed: " + s);
            }
        }
        // 'W' Speed up, press
        else if(this.checkKey(87) == 1) {
            if(s < this.get('speedMax')) {
                s *= 2;
                this.set('speed', s);
                
                console.log("Speeding up, current speed: " + s);
            }
        }
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
