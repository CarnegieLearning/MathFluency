var cocos = require('cocos2d');
var events = require('events');
var geom = require('geometry');

var FractionRenderer = require('FractionRenderer').FractionRenderer
    
var Question = cocos.nodes.Node.extend({
    correctAnswer: null,        //The correct response
    answeredCorrectly: null,    //Stores if question has been correctly/incorrectly (null=not answered)
    coneL:null,                 //Holds the left delimiter
    coneR:null,                 //Holds the left delimiter
    timeElapsed:null,           //Real time elapsed since start of question
    speed:null,                 //Speed in "units" of the player's car
    totalDist:null,             //Distance in "units" player needs to cover before answering
    coveredDist:null,           //Distance in "units" covered thus far
    init: function(ans) {
        QuestionPoint.superclass.init.call(this);
        
        // Initialize all variables
        this.set('correctAnswer', ans);
        this.set('timeElapsed', 0.0);
        this.set('speed', 1000);
        this.set('totalDist', 5000);
        this.set('coveredDist', 0);
        
        // Create and display the question content
        var fr = FractionRenderer.create("1", "4");
        fr.set('position', new geom.Point(390, 50));
        fr.set('anchorPoint', new geom.Point(0.5, 1));
        fr.set('scaleX', 0.75);
        fr.set('scaleY', 0.75);
        this.addChild({child: fr});
        this.set('coneL', fr);
        
        fr = FractionRenderer.create("3", "4");
        fr.set('position', new geom.Point(410, 50));
        fr.set('anchorPoint', new geom.Point(0.5, 1));
        fr.set('scaleX', 0.75);
        fr.set('scaleY', 0.75);
        this.addChild({child: fr});
        this.set('coneR', fr);
        
        // Schedule the per frame update
        this.scheduleUpdate();
    },
    
    // Called when the question is answered, sets and returns the result
    answerQuestion: function(ans) {
        if(this.get('answeredCorrectly') == null) {
            if(this.get('correctAnswer') == ans) {
                this.set('answeredCorrectly', true);
                return true;
            }
            this.set('answeredCorrectly', false);
            return false;
        }
    },
    
    // Manages question timing and movement
    update: function(dt) {
        var te = this.get('timeElapsed') + dt;
        this.set('timeElapsed', te);
        
        // Creates a delay before the content starts to move
        if(te - 1 > 0) {
            var cd = this.get('coveredDist');
            cd += this.get('speed') * dt;
            this.set('coveredDist', cd);
        
            var pc = cd / this.get('totalDist');
            
            // Approximately even with the car AND unanswered
            if(pc > 0.92 && this.get('answeredCorrectly') == null) {
                events.trigger(this, "QuestionTimeExpired");
            }
            
            // Illusion of distance
            pc = Math.pow(pc, 3);
        
            var move = this.get('coneL');
            move.set('position', new geom.Point(390 - 90 * pc, 50 + 560 * pc));
            move.set('scaleX', 0.75 + 0.75 * pc);
            move.set('scaleY', 0.75 + 0.75 * pc);
            
            move = this.get('coneR');
            move.set('position', new geom.Point(410 + 90 * pc, 50 + 560 * pc));
            move.set('scaleX', 0.75 + 0.75 * pc);
            move.set('scaleY', 0.75 + 0.75 * pc);
        }
    }
});

exports.Question = Question