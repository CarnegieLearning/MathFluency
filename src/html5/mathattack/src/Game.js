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

var cocos = require('cocos2d');
var events = require('events');

var GameView = require('GameView').GameView;
var Question = require('Question').Question;

var MAC = require('MathAttackControl').MathAttackControl;
var XML = require('XML').XML;

var Game = cocos.nodes.Node.extend({
    questions       : null,     // List of questions for the current stage
    timeRemaining   : 60,       // Time remaining on current stage
    timeElapsed     : 0,        // Time elapsed on current stage
    score           : 0,        // Current score
    currentQuestion : -1,       // Current question index
    
    view            : null,     // Holds the GameView
    
    right           : 0,        // Number of correct answers for the current question
    wrong           : 0,        // Number of incorrect answers for the current question
    
    rightTotal      : 0,        // Total correct answers for the stage
    wrongTotal      : 0,        // Total incorrect answers for the stage
    bonusTotal      : 0,        // Total number of bonus seconds for the stage
    
    transition      : false,    // True during question transitions, blocks input when true

    init: function(xml) {
        Game.superclass.init.call(this);
        
        var medals = XML.getDeepChildByName(xml, 'MEDALS');
        if(medals != null) {
            for(var i=0; i<medals.children.length; i++) {
                var m = medals.children[i]
                if(m.attributes.hasOwnProperty('Id') && m.attributes.hasOwnProperty('Score'))
                    MAC.medalScores[m.attributes['Id']] = parseInt(m.attributes['Score']);
            }
        }
        MAC.medalScores[0] = MAC.medalScores[1] * 1.4;
        MAC.calcProportions();
        
        this.questions = [];
        var problemRoot = XML.getDeepChildByName(xml, 'PROBLEM_SET');
        var q = XML.getChildrenByName(problemRoot, 'QUESTION');
        for(var i=0; i<q.length; i+=1) {
            this.questions.push(Question.create(q[i]));
        }
        
        this.view = GameView.create();
        this.addChild({child: this.view});
    },
    
    // Fade screen out in prepartion for a question swap.
    prepareNextQuestion: function() {
        if(!this.transition) {
            this.transition = true;
            this.view.fadeCycle();
            setTimeout(this.nextQuestion.bind(this), 500);
        }
    },
    
    // Move to next question, or trigger the end of the game
    nextQuestion: function() {
        // Remove the previous question, if there was one
        if(this.currentQuestion > -1) {
            this.questions[this.currentQuestion].right = this.right;
            this.questions[this.currentQuestion].wrong = this.wrong;
        
            this.view.removeChild({child: this.questions[this.currentQuestion]});
            cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this.questions[this.currentQuestion]);
        }
    
        // Progress through the question array
        this.currentQuestion += 1;
        
        // Check for end of game (due to running out of questions)
        if(this.currentQuestion < this.questions.length) {
            
            // Setup and add the next question
            this.view.addChild({child: this.questions[this.currentQuestion]});
            this.questions[this.currentQuestion].scheduleUpdate();
            this.view.nextQuestion();
            
            // Reset answer type totals
            this.right = 0;
            this.wrong = 0;
            
            // Set the current round's timer
            this.timeRemaining = this.questions[this.currentQuestion].timeLimit;
            
            // No longer transitioning, enable input
            this.transition = false;
        }
        else {
            // Clear icons and numberline at the end of the game
            this.view.resetCounters();
            this.view.line.clearAllSlots();
            
            events.trigger(this, 'endOfGame');
        }
    },
    
    // Resolve mouse click input
    input: function(x, y) {
        // Ignore if we do not have a valid question
        if(this.currentQuestion < 0 || this.currentQuestion >= this.questions.length || this.transition)
            return;
    
        // Get the result from the quesion
        var rv = this.questions[this.currentQuestion].input(x, y);
        
        // Update view based on return value
        if(rv.retVal == 1) {
            this.view.line.correctSlot(rv.lineLoc);
            this.view.enableRemaining(this.right);
            this.right += 1;
            this.rightTotal += 1;
            
            this.modifyScore(200);
        }
        else if(rv.retVal == 2) {
            this.modifyScore(1000);
        }
        else if(rv.retVal == 0) {
            this.view.line.incorrectSlot(rv.lineLoc);
            this.view.enableMiss(this.wrong);
            this.wrong += 1;
            this.wrongTotal += 1;
        }
        
        // If we have hit an answer limit, move to the next question
        if(this.right >= 7 || this.wrong >= 3) {
            // Only apply time bonus for correctly ending a round
            if(this.right >= 7) {
                var bonus = Math.round(this.timeRemaining);
                
                this.modifyScore(bonus * 50);
                this.bonusTotal += bonus;
                this.questions[this.currentQuestion].bonus = bonus;
            }
            this.prepareNextQuestion();
        }
    },
    
    // Starts the game
    startGame: function() {
        this.scheduleUpdate();
        this.nextQuestion();
    },
    
    // Change the player's score value
    modifyScore: function(val) {
        this.score += val;
        this.view.scoreCount.set('string', this.score);
        this.view.scoreCount._updateLabelContentSize();
    },
    
    // Tracks time
    update: function(dt) {
        // Update timers
        this.timeElapsed += dt;
        this.timeRemaining -= dt;
        
        // Check for end of the game (due to timer running out)
        if(this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.prepareNextQuestion();
        }
        
        // Update the numerical displays of the GameView
        if(this.timeRemaining.toFixed) {
            this.view.timeCount.set('string', this.timeRemaining.toFixed(0));
        }
    }
});

exports.Game = Game;