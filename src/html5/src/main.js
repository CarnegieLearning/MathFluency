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
    
// Create a new layer
var FluencyApp = KeyboardLayer.extend({
    player: null,
    currentQuestion:null,
    questionList:null,
    init: function() {
        // You must always call the super class version of init
        FluencyApp.superclass.init.call(this);
        
        this.addChild({child: Background.create()});
        
        var player = Player.create();
        player.set('position', new geo.Point(400, 450));
        this.addChild({child: player});
        this.set('player', player);
        
        this.set('elapsedTime', 0.0);
        
        var ql = [];
        var qp;
        var i = 0;
        while(i < 3) {
            qp = QuestionPoint.create(1);
            events.addListener(qp, "QuestionTimeExpired", this.timeExpiredHandler);
            ql[i] = qp;
            i += 1;
        }
        
        this.set('questionList', ql);
        this.set('currentQuestion', 0);
            
        this.addChild({child: ql[0]});
        
        this.scheduleUpdate();
    },
    
    timeExpiredHandler: function(event) {
        var player = this.get('player');
        var playerPos = player.get('position');
        
        var ql = this.get('questionList');
        var cq = this.get('currentQuestion');
        
        if(playerPos < 325) {
            ql[cq].answer(0)
        }
        else if(playerPos < 475) {
            ql[cq].answer(1)
        }
        else {
            ql[cq].answer(2)
        }
        
        var opts = Object();
        opts["interval"] = 1
        opts["method"] = this.nextQuestion
        this.schedule(opts);
    },
    
    nextQuestion: function() {
        var ql = this.get('questionList');
        var cq = this.get('currentQuestion');
        
        if(cq < ql.length - 1) {
            this.removeChild({child: ql[cq]});
            cq += 1;
            this.addChild({child: ql[cq]});
        }
        else {
            //End of game
        }
    },
    
    update: function(dt) {
        var player = this.get('player');
        var playerPos = player.get('position');
        
        //Move the player according to keyboard
        if(this.checkKey(65)) {
            playerPos.x -= 250 * dt
            if(playerPos.x < 225) {
                playerPos.x = 225
            }
            player.set('position', playerPos);
            
            if(playerPos.x < 325) {
            }
        }
        else if(this.checkKey(68)) {
            playerPos.x += 250 * dt
            if(playerPos.x > 575) {
                playerPos.x = 575
            }
            player.set('position', playerPos);
            
            if(playerPos.x > 475) {
            }
        }
        
        //Rotate the player to keep the visual angles realistic
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
