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

var XML = require('XML').XML;

var Game = cocos.nodes.Node.extend({
    questions       : null,     // List of questions for the current stage
    timeRemaining   : 60,       // Time remaining on current stage
    timeElapsed     : 0,        // Time elapsed on current stage
    score           : 0,        // Current score
    currentQuestion : -1,       // Current question index
    
    view            : null,     // Holds the GameView

    init: function(xml) {
        Game.superclass.init.call(this);
        
        this.questions = [];
        var problemRoot = XML.getDeepChildByName(xml, 'PROBLEM_SET');
        var q = XML.getChildrenByName(problemRoot, 'QUESTION');
        for(var i=0; i<q.length; i+=1) {
            this.questions.push(Question.create(q[i]));
        }
        
        this.view = GameView.create();
        this.addChild({child: this.view});
    },
    
    nextQuestion: function() {
        if(this.currentQuestion > -1) {
            this.removeChild({child: this.questions[this.currentQuestion]});
            cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this.questions[this.currentQuestion]);
        }
    
        this.currentQuestion += 1;
        
        // Check for end of game (due to running out of questions)
        if(this.currentQuestion < this.questions.length) {
            
            this.addChild({child: this.questions[this.currentQuestion]});
            this.questions[this.currentQuestion].scheduleUpdate();
            this.view.nextQuestion();
            
            events.trigger('nextQuestion');
        }
        else {
            events.trigger('endOfGame');
        }
    },
    
    input: function(x, y) {
        this.questions[this.currentQuestion].input(x, y);
    },
    
    startGame: function() {
        this.scheduleUpdate();
        this.nextQuestion();
    },
    
    update: function(dt) {
        this.timeElapsed += dt;
        this.timeRemaining -= dt;
        
        // Check for end of the game (due to timer running out)
        if(this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this);
            
            events.trigger('endOfGame');
        }
        
        // Update the numerical displays of the GameView
        if(this.timeRemaining.toFixed) {
            this.view.timeCount.set('string', this.timeRemaining.toFixed(0));
        }
        this.view.scoreCount.set('string', this.score);
    }
});

exports.Game = Game;