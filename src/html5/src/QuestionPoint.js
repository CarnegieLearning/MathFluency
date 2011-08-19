var cocos = require('cocos2d');
var events = require('events');
var geom = require('geometry');

var FractionRenderer = require('FractionRenderer').FractionRenderer
    
var QuestionPoint = cocos.nodes.Node.extend({
    correctAnswer: null,
    answeredCorrectly: null,
    coneL:null,
    coneR:null,
    timeElapsed:null,
    speed:null,
    totalDist:null,
    coveredDist:null,
    init: function(ans) {
        QuestionPoint.superclass.init.call(this);
        this.set('correctAnswer', ans);
        
        this.set('timeElapsed', 0.0);
        this.set('speed', 1000);
        this.set('totalDist', 5000);
        this.set('coveredDist', 0);
        
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
        
        this.scheduleUpdate();
    },
    
    answerQuestion: function(ans) {
        if(this.get('correctAnswer') == ans) {
            this.set('answeredCorrectly', true);
            return true;
        }
        this.set('answeredCorrectly', false);
        return false;
    },
    
    update: function(dt) {
        var te = this.get('timeElapsed') + dt;
        this.set('timeElapsed', te);
        
        if(te - 1 > 0) {
            var cd = this.get('coveredDist');
            cd += this.get('speed') * dt;
            this.set('coveredDist', cd);
        
            var pc = cd / this.get('totalDist');
            
            if(pc > 0.92) {
                events.trigger(this, "QuestionTimeExpired");
            }
            
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

exports.QuestionPoint = QuestionPoint