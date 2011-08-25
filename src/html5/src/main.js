// Import the cocos2d module
var cocos = require('cocos2d');
// Import the geometry module
var geo = require('geometry');

var events = require('events');

//Project Imports
var Player = require('Player').Player;
var KeyboardLayer = require('KeyboardLayer').KeyboardLayer
var FractionRenderer = require('FractionRenderer').FractionRenderer
var Background = require('Background').Background;
var Question = require('Question').Question;
var QuestionList = require('QuestionList').QuestionList;
var Preloader = require('Preloader').Preloader;
    
// Create a new layer
var FluencyApp = KeyboardLayer.extend({
    player: null,
    currentQuestion:null,
    questionList:null,
    // Not the 'real init', sets up and starts preloading
    init: function() {
        // You must always call the super class version of init
        FluencyApp.superclass.init.call(this);
        
        //Basic preloading
        var pre = Preloader.create();
        pre.queueLoad("RemoteImage", "resources/tree.png", "resources/tree.png");
        pre.queueLoad("RemoteResource", "resources/testset.xml", "set001.xml");
        events.addListener(pre, "complete", this.parseXML.bind(this));
        pre.startLoad();
    },
    // Parses the level xml file
    parseXML: function(evt) {
        var xmlDoc=document.implementation.createDocument("","",null);
        xmlDoc = new DOMParser().parseFromString(resource('resources/testset.xml'), 'text/xml');
        
        var problemRoot = xmlDoc.getElementsByTagName('PROBLEM_SET')[0];
        
        var qlist = QuestionList.create();

        var subset = problemRoot.firstElementChild;
        
        while(subset != null) {
            var node = subset.firstElementChild;
            qlist.addIntermission({selector: node.getAttribute("VALUE")});
            
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
        
        qlist.set('zOrder', 99);
        this.set('questionList', qlist);
        this.addChild({child: qlist});
        
        this.preprocessingComplete();
    },
    // The 'real init()' called after all the preloading/parsing is completed
    preprocessingComplete: function () {
        // Binding context onto event handlers
        var self = this;
        
        // Initializing variables
        this.addChild({child: Background.create()});
        
        var player = Player.create();
        player.set('position', new geo.Point(400, 450));
        this.addChild({child: player});
        this.set('player', player);
        
        this.set('elapsedTime', 0.0);
        
        var qlist = this.get('questionList');
        events.addListener(qlist, 'noQuestionsRemaining', this.endOfGame.bind(this));
        events.addListener(qlist, 'intermission', this.intermissionHandler.bind(this));
        qlist.nextQuestion();
        
        //var sprite = cocos.nodes.Sprite.create({file: 'resources/tree.png',});
        //sprite.set('position', new geo.Point(400, 450));
        //self.addChild({child: sprite});
        
        // Schedule per frame update function
        this.scheduleUpdate();
    },
    
    // Called when game ends, should collect results, display them to the screen and output the result XML
    endOfGame: function(evt) {
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
    intermissionHandler: function(evt) {
        if(arguments.length > 0) {
            this.get('player').changeSelector(arguments[0].selector);
            console.log("New subset starting");
            setTimeout(this.get('questionList').nextQuestion, 1000);
        }
        else {
            console.log("****ERROR: no new selector given for new subset");
        }
    },
    
    // Called every frame, manages the player's movement/rotation currently
    update: function(dt) {
        var player = this.get('player');
        var playerPos = player.get('position');
        
    // Move the player according to keyboard
        // 'A' Move left, continuous
        if(this.checkKey(65) > 0) {
            playerPos.x -= 250 * dt
            if(playerPos.x < 225) {
                playerPos.x = 225
            }
            player.set('position', playerPos);
            
            if(playerPos.x < 325) {
                this.get('questionList').set('currentAnswer', 0);
            }
            else if(playerPos.x < 475) {
                this.get('questionList').set('currentAnswer', 1);
            }
            else {
                this.get('questionList').set('currentAnswer', 2);
            }
        }
        // 'D' Move right, continuous
        else if(this.checkKey(68) > 0) {
            playerPos.x += 250 * dt
            if(playerPos.x > 575) {
                playerPos.x = 575
            }
            player.set('position', playerPos);
            
            if(playerPos.x > 475) {
                this.get('questionList').set('currentAnswer', 2);
            }
            else if(playerPos.x > 325) {
                this.get('questionList').set('currentAnswer', 1);
            }
            else {
                this.get('questionList').set('currentAnswer', 0);
            }
        }
        // 'S' Slow down, press
        if(this.checkKey(83) == 1) {
            if(this.get('questionList').slowDown()) {
                playerPos.y += 5;
                player.set('position', playerPos);
            }
        }
        // 'W' Speed up, press
        else if(this.checkKey(87) == 1) {
            if(this.get('questionList').speedUp()) {
                playerPos.y -= 5;
                player.set('position', playerPos);
            }
        }
        
        //Rotate the player as they move to keep the visual angles realistic
        if(400.0 - playerPos.x > 0) {
            player.set('rotation', (90 - 180.0/Math.PI * Math.atan((playerPos.y - 50) / (400.0 - playerPos.x))) / 1.5)
        }
        else {
            player.set('rotation', (90 - 180.0/Math.PI * Math.atan((playerPos.y - 50) / (playerPos.x - 400.0))) / -1.5)
        }
    },
});

exports.main = function() {
    // Initialise application
    
    // Get director
    var director = cocos.Director.get('sharedDirector');

    // Attach director to our <div> element
    director.attachInView(document.getElementById('cocos_test_app'));
    
    // Create a scene
    var scene = cocos.nodes.Scene.create();

    // Add our layer to the scene
    scene.addChild({child: FluencyApp.create()});

    // Run the scene
    director.runWithScene(scene);
};
