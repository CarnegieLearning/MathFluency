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
var QuestionPoint = require('QuestionPoint').QuestionPoint;
var Preloader = require('Preloader').Preloader;
    
// Create a new layer
var FluencyApp = KeyboardLayer.extend({
    player: null,
    currentQuestion:null,
    questionList:null,
    speed:null,
    init: function() {
        // You must always call the super class version of init
        FluencyApp.superclass.init.call(this);
        
        //Basic preloading
        var pre = Preloader.create();
        pre.queueLoad("resources/tree.png", "resources/tree.png");
        events.addListener(pre, "complete", this.init_preloaded.bind(this));
        pre.startLoad();
    },
    
    init_preloaded: function (evt) {
        // Binding context onto event handlers
        this.timeExpiredHandler = this.timeExpiredHandler.bind(this);
        this.nextQuestion = this.nextQuestion.bind(this);
        var self = this;
        
        // Initializing variables
        this.addChild({child: Background.create()});
        
        var player = Player.create();
        player.set('position', new geo.Point(400, 450));
        this.addChild({child: player});
        this.set('player', player);
        
        this.set('elapsedTime', 0.0);
        this.set('speed', 1000);
        
        //Build question list
        var ql = [], qp, i = 0;
        while(i < 3) {
            qp = QuestionPoint.create(1);
            events.addListener(qp, "QuestionTimeExpired", this.timeExpiredHandler);
            ql[i] = qp;
            i += 1;
        }
        
        this.set('questionList', ql);
        this.set('currentQuestion', 0);
            
        this.addChild({child: ql[0]});
        
        //var sprite = cocos.nodes.Sprite.create({file: 'resources/tree.png',});
        //sprite.set('position', new geo.Point(400, 450));
        //self.addChild({child: sprite});
        
        // Schedule per frame update function
        this.scheduleUpdate();
    },
    
    // Callback for when a question has no more time left to answer, evaluates the player's answer
    timeExpiredHandler: function(event) {
        var player = this.get('player');
        var playerPos = player.get('position');
        
        var ql = this.get('questionList');
        var cq = this.get('currentQuestion');
        
        // Determine player's answer based on their position
        if(playerPos.x < 325) {
            ql[cq].answerQuestion(0);
        }
        else if(playerPos.x < 475) {
            ql[cq].answerQuestion(1);
        }
        else {
            ql[cq].answerQuestion(2);
        }
        
        setTimeout(this.nextQuestion, 1000);
        return null;
    },
    
    // Loads the next question in the questionList
    nextQuestion: function() {
        var ql = this.get('questionList');
        var cq = this.get('currentQuestion');
        
        this.removeChild(ql[cq]);
        
        //Proceed to next question
        if(cq < ql.length - 1) {
            cq += 1;
            ql[cq].set('speed', this.get('speed'));
            this.addChild(ql[cq]);
            this.set('currentQuestion', cq);
        }
        //Otherwise end the game
        else {
            this.endOfGame()
        }
    },
    
    // Called when game ends, should collect results, display them to the screen and output the result XML
    endOfGame: function() {
        var ql = this.get('questionList');
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
            }
        }
        // 'S' Slow down, press
        if(this.checkKey(83) == 1) {
            var s = this.get('speed');
            if(s > 250) {
                s /= 2;
            }
            this.set('speed', s);
            this.get('questionList')[this.get('currentQuestion')].set('speed', s);
        }
        // 'W' Speed up, press
        else if(this.checkKey(87) == 1) {
            var s = this.get('speed');
            if(s < 4000) {
                s *= 2;
            }
            this.set('speed', s);
            this.get('questionList')[this.get('currentQuestion')].set('speed', s);
        }
        
        //Rotate the player as they move to keep the visual angles realistic
        if(400.0 - playerPos.x > 0) {
            player.set('rotation', (90 - 180.0/Math.PI * Math.atan(400.0 / (400.0 - playerPos.x))) / 1.5)
        }
        else {
            player.set('rotation', (90 - 180.0/Math.PI * Math.atan(400.0 / (playerPos.x - 400.0))) / -1.5)
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
