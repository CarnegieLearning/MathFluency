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

// Cocos imports
var cocos = require('cocos2d');
var events = require('events');

// Project Imports
var GameView = require('GameView').GameView;
var Question = require('Question').Question;

// Static imports
var MAC = require('MathAttackControl').MathAttackControl;
var XML = require('XML').XML;

var Game = cocos.nodes.Node.extend({
    questions       : null,     // List of questions for the current stage
    timeRemaining   : 60,       // Time remaining on current stage
    timeElapsed     : 0,        // Time elapsed on current stage
    score           : 0,        // Current score
    currentQuestion : -1,       // Current question index
    
    view            : null,     // Holds the GameView
    
    useCombos       : false,    // Whether of not to use combos
    
    right           : 0,        // Number of correct answers for the current question
    wrong           : 0,        // Number of incorrect answers for the current question
    combo           : 0,        // Current combo multiplier
    
    rightTotal      : 0,        // Total correct answers for the stage
    wrongTotal      : 0,        // Total incorrect answers for the stage
    bonusTotal      : 0,        // Total number of bonus seconds for the stage
    comboTotal      : 0,        // Comboing total for the stage
    
    transition      : false,    // True during question transitions, blocks input when true

    init: function(xml) {
        Game.superclass.init.call(this);
        
        // Load medal cutoff values
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
        
        // Load scoring information
        var score = XML.getDeepChildByName(xml, 'ScoreSettings');
        if(score != null) {
            if(score.attributes.hasOwnProperty('useCombos')) {
                this.useCombos = score.attributes['useCombos'] == 'false' ? false : true;
            }
            if(score.attributes.hasOwnProperty('RightPts')) {
                MAC.RightPts = parseInt(score.attributes['RightPts']);
            }
            if(score.attributes.hasOwnProperty('WrongPts')) {
                MAC.WrongPts = parseInt(score.attributes['WrongPts']);
            }
            if(score.attributes.hasOwnProperty('BonusPts')) {
                MAC.BonusPts = parseInt(score.attributes['BonusPts']);
            }
        }
        
        var ball = XML.getDeepChildByName(xml, 'BallSettings');
        if(ball != null) {
            if(ball.attributes.hasOwnProperty('sideMargin')) {
                MAC.sideMargin = parseInt(ball.attributes['sideMargin']);
            }
            if(ball.attributes.hasOwnProperty('rightExpload')) {
                MAC.rightExpload = ball.attributes['rightExpload'] == 'false' ? false : true;
            }
            if(ball.attributes.hasOwnProperty('wrongExpload')) {
                MAC.wrongExpload = ball.attributes['wrongExpload'] == 'false' ? false : true;
            }
        }
        
        // Load questions
        this.questions = [];
        var problemRoot = XML.getDeepChildByName(xml, 'PROBLEM_SET');
        var q = XML.getChildrenByName(problemRoot, 'QUESTION');
        var max_c = 0;
        for(var i=0; i<q.length; i+=1) {
            this.questions.push(Question.create(q[i]));
            
            if(max_c < this.questions[i].rightTotal) {
                max_c = this.questions[i].rightTotal;
            }
        }
        
        this.view = GameView.create(max_c);
        this.addChild({child: this.view});
    },
    
    // Quit during the course of the game
    abortGame: function() {
        if(!this.transition) {
            this.transition = true;
            this.view.fadeCycle();
        }
        
        if(this.currentQuestion > -1) {
            this.questions[this.currentQuestion].right = this.right;
            this.questions[this.currentQuestion].wrong = this.wrong;
        
            this.view.removeChild({child: this.questions[this.currentQuestion]});
            cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this.questions[this.currentQuestion]);
        }
        
        this.view.resetCounters();
    },
    
    // Fade screen out in prepartion for a question swap.
    prepareNextQuestion: function() {
        if(!this.transition) {
            this.transition = true;
            this.view.fadeCycle();
            setTimeout(this.nextQuestion.bind(this), 500);
            
            if(this.currentQuestion > -1) {
                this.questions[this.currentQuestion].timeStop = true;
            }
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
            this.view.nextQuestion(this.questions[this.currentQuestion].rightTotal);
            
            // Reset answer type totals
            this.right = 0;
            this.wrong = 0;
            this.combo = 0;
            
            // Set the current round's timer
            this.timeRemaining = this.questions[this.currentQuestion].timeLimit;
            
            // No longer transitioning, enable input
            this.transition = false;
        }
        else {
            // Clear icons and numberline at the end of the game
            this.view.resetCounters();
            
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
            this.right += 1;
            this.rightTotal += 1;
            
            this.combo += 1;
            this.comboTotal += this.combo;
            this.view.addRight();
            
            this.modifyScore(MAC.RightPts * (this.useCombos ? this.combo : 1));
        }
        else if(rv.retVal == 2) {
            // Handle bonus effects here
        }
        else if(rv.retVal == 0) {
            this.view.addWrong();
            this.wrong += 1;
            this.wrongTotal += 1;
            this.combo = 0;         // C-C-C-Combo Breaker!
            
            this.modifyScore(MAC.WrongPts);
        }
        
        // If we have hit an answer limit, move to the next question
        if(this.right >= this.questions[this.currentQuestion].rightTotal || this.wrong >= this.questions[this.currentQuestion].wrongTotal) {
            // Only apply time bonus for correctly ending a round
            if(this.right >= this.questions[this.currentQuestion].rightTotal) {
                var bonus = Math.round(this.timeRemaining);
                
                this.modifyScore(bonus * MAC.BonusPts);
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
        this.questions[this.currentQuestion].score += val;
        this.score += val;
        this.view.updateScore(this.score, val);
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
            this.view.timeCount._updateLabelContentSize();
        }
    }
});

exports.Game = Game;