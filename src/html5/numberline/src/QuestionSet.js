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

// Engine Imports
var cocos = require('cocos2d');
var geo = require('geometry');
var events = require('events');

// Static Imports
var XML = require('XML').XML;

// Project Imports
var Question = require('Question').Question;
var NumberLine = require('NumberLine').NumberLine;

// Holds the in game representation of a QuestionSubset
var QuestionSet = cocos.nodes.Node.extend({
    numberline   : null,        // Holds the numberline for this set of questions
    questions    : null,        // List of questions in this QuestionSet
    current      : -1,          // Index of the current question being presented (within this set)
    lineColor    : '#FFFFFF',   // Current numberline color
    
    init: function (node) {
        QuestionSet.superclass.init.call(this);
    
        // Statically binding functions used only as callbacks
        this.resetColor = this.resetColor.bind(this);
        this.onQuestionTimeout = this.onQuestionTimeout.bind(this)
        
        this.set('position', new geo.Point(100, 200));
        this.numberline = NumberLine.create(XML.getChildByName(node, 'NUMBER_LINE'));
        
        // Get XML representation
        var ql = XML.getChildrenByName(node, 'QUESTION')
        this.questions = [];
        
        // Build the list of questions in the subset
        for(var i=0; i<ql.length; i++) {
            this.questions.push(Question.create(ql[i]));
            events.addListener(this.questions[i], 'questionTimeout', this.onQuestionTimeout);
        }
        
        this.addChild({child: this.numberline});
        this.numberline.set('position', new geo.Point(30, 20));
    },
    
    // Advance to the next question
    nextQuestion: function() {
        if(this.current < this.questions.length - 1) {
            // Advance to next question
            events.trigger(this, 'beforeNextQuestion');
            
            // Remove the current question only if this is not a first question
            if(this.current > -1) {
                this.removeChild({child: this.questions[this.current]});
            }
            this.current += 1;
            
            setTimeout(this.nextQuestionCallback.bind(this), 1000);
        }
        else {
            var that = this;
            setTimeout(function() {events.trigger(that, 'endOfSet')}, 1000);
        }
    },
    
    // Finish advancing to the next question
    nextQuestionCallback: function() {
        this.questions[this.current].set('position', new geo.Point(250, 100));
        this.addChild({child: this.questions[this.current]});
        this.questions[this.current].scheduleUpdate();
        events.trigger(this, 'nextQuestion');
        
        if(this.questions[this.current].timeLimit != null) {
            events.trigger(this, 'questionTimerStart', this.questions[this.current].timeLimit);
        }
    },
    
    // Answers the current question
    giveAnswer: function(ans) {
        ans -= (this.get('position').x + this.numberline.get('position').x);
        ans /= this.numberline.length;
        
        console.log('Answer given: ' + ans);
        
        //Prevent off line answers
        if(ans > 1.05) {
            return;
        }
        ans = Math.min(ans, 1);
        
        if(ans < -0.05) {
            return
        }
        ans = Math.max(ans, 0);
    
        //TODO: Allow for more than 2 'bands' for results
        // Correct feedback
        if(this.questions[this.current].answerQuestion(ans)) {
            events.trigger(this, 'rightAnswer');
            this.set('lineColor', '#22FF22');
        }
        // Incorrect feedback
        else {
            events.trigger(this, 'wrongAnswer');
            this.set('lineColor', '#FF2222');
        }
        
        var that = this;
        setTimeout(this.resetColor, 1000);
        
        this.nextQuestion();
    },
    
    // Handles questions timing out
    onQuestionTimeout: function () {
        events.trigger(this, 'questionTimeout');
        this.set('lineColor', '#220000');
        
        var that = this;
        setTimeout(this.resetColor, 1000);
        
        this.nextQuestion();
    },
    
    resetColor: function() {
        this.set('lineColor', '#FFFFFF');
    },
    
    set_lineColor: function(c) {
        this.lineColor = c;
        this.numberline.lineColor = c;
    },
    
    draw: function (context) {
        context.strokeStyle = this.get('lineColor');
        context.lineWidth = 6;
        
        // Left side arrow
        context.beginPath();
        context.moveTo(20,  0);
        context.lineTo( 0, 20);
        context.lineTo(20, 40);
        context.stroke();
        
        context.beginPath();
        context.moveTo( 0, 20);
        context.lineTo(30, 20);
        context.closePath();
        context.stroke();
        
        // Right side arrow
        context.moveTo(540,  0);
        context.lineTo(560, 20);
        context.lineTo(540, 40);
        context.stroke();
        
        context.beginPath();
        context.moveTo(560, 20);
        context.lineTo(530, 20);
        context.closePath();
        context.stroke();
    }
});

exports.QuestionSet = QuestionSet;