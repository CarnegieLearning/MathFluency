var cocos = require('cocos2d');
var events = require('events');
var geom = require('geometry');

var LabelBG = require('LabelBG').LabelBG;

// Represents a single question to be answered by the player
// TODO: Build with an options object to allow easier initialization when customizing away from default values
var Question = cocos.nodes.Node.extend({
    correctAnswer: null,        //The correct response
    answeredCorrectly: null,    //Stores if question has been correctly/incorrectly (null=not answered)
    coneL:null,                 //Holds the left delimiter
    coneR:null,                 //Holds the left delimiter
    timeElapsed:null,           //Real time elapsed since start of question (including delimeterStaticTime)
    speed:null,                 //Speed in "units"/second of the player's car
    totalDist:null,             //Distance in "units" player needs to cover before answering
    coveredDist:null,           //Distance in "units" covered thus far
    delimeterStaticTime:null,   //Duration that the question will remain static in the distance (seconds)
    init: function(ans, d1, d2) {
        Question.superclass.init.call(this);
        
        // Initialize all variables
        this.set('correctAnswer', ans);
        this.set('timeElapsed', 0.0);
        this.set('speed', 1000);
        this.set('totalDist', 5000 / 0.92); //0.92 is to account for the question being evaluated at 92% distance
        this.set('coveredDist', 0);
        this.set('delimeterStaticTime', 1);
        
        // Create and display the question content
        var opts = Object()
        opts["string"] = d1;
        opts["fontColor"] = '#000000';
        var delim = LabelBG.create(opts, '#FFFFFF');
        delim.set('zOrder', 100);
        this.addChild({child: delim});
        this.set('coneL', delim);
        
        opts["string"] = d2;
        opts["fontColor"] = '#000000';
        delim = LabelBG.create(opts, '#FFFFFF');
        delim.set('zOrder', 101);
        this.addChild({child: delim});
        this.set('coneR', delim);
        
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
        
        return null;
    },
    
    // Manages question timing and movement
    update: function(dt) {
        var te = this.get('timeElapsed') + dt;
        this.set('timeElapsed', te);
        
        var pc = 0;
        
        // Creates a delay before the content starts to move
        // TODO: Possibly vary the delay based on player's speed
        if(te - this.get('delimeterStaticTime') > 0) {
            var cd = this.get('coveredDist');
            cd += this.get('speed') * dt;
            this.set('coveredDist', cd);
        
            pc = cd / this.get('totalDist');
            
            // Approximately even with the car AND unanswered
            if(pc > 0.92 && this.get('answeredCorrectly') == null) {
                events.trigger(this, "QuestionTimeExpired");
            }
            
            // Illusion of distance
            pc = Math.pow(pc, 3);
        }
        
        var scale = 0.75 + 0.75 * pc;
        
        // Places/Moves the delimeters
        var move = this.get('coneL');
        move.set('position', new geom.Point(390 - 90 * pc + move.contentSize.width * scale * pc / 2, 50 + 560 * pc));
        move.set('scaleX', scale);
        move.set('scaleY', scale);
        
        move = this.get('coneR');
        move.set('position', new geom.Point(410 + 90 * pc + move.contentSize.width * scale * (1 - pc / 2), 50 + 560 * pc));
        move.set('scaleX', scale);
        move.set('scaleY', scale);
    },
});

// TODO: Write static helper for building an options object to initialize a question

exports.Question = Question