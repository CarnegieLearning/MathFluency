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
        this.onQuestionTimeout = this.onQuestionTimeout.bind(this)
        
        this.set('position', new geo.Point(150, 200));
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
        this.numberline.set('position', new geo.Point(QuestionSet.NumberLineX, QuestionSet.NumberLineY));
        
        this.correctLocator = cocos.nodes.Sprite.create({file: '/resources/General_Wireframe/Green_Star.png'});
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
            
            setTimeout(this.nextQuestionCallback.bind(this), QuestionSet.QDelay);
        }
        else {
            var that = this;
            setTimeout(function() {events.trigger(that, 'endOfSet')}, QuestionSet.QDelay);
        }
    },
    
    nextQuestionForced: function() {
        events.trigger(this, 'beforeNextQuestion');
        
        if(this.current > -1) {
            this.removeChild({child: this.questions[this.current]});
        }
        this.current += 1;
        
        this.nextQuestionCallback()
    },
    
    // Finish advancing to the next question
    nextQuestionCallback: function() {
        this.questions[this.current].set('position', new geo.Point(235, -130));
        this.addChild({child: this.questions[this.current]});
        this.questions[this.current].scheduleUpdate();
        events.trigger(this, 'nextQuestion');
        
        if(this.questions[this.current].timeLimit != null) {
            events.trigger(this, 'questionTimerStart', this.questions[this.current].timeLimit);
        }
    },
    
    // Answers the current question
    // Returns: -1 if the answer was not valid, [0-2] if te answer was valid
    giveAnswer: function(ans) {
        ans -= (this.get('position').x + this.numberline.get('position').x);
        ans /= this.numberline.length;
        
        console.log('Answer given: ' + ans);
        
        //Prevent off line answers
        if(ans > 1.05) {
            return -1;
        }
        ans = Math.min(ans, 1);
        
        if(ans < -0.05) {
            return -1;
        }
        ans = Math.max(ans, 0);
        
        var retVal = this.questions[this.current].answerQuestion(ans);
        // Correct feedback
        //TODO: Remove hardcoding
        if(retVal < 2) {
            events.trigger(this, 'rightAnswer');
        }
        // Incorrect feedback
        else {
            events.trigger(this, 'wrongAnswer');
        }
        
        events.trigger(this, 'scoreChange', this.questions[this.current].pointsEarned);

        var x = this.questions[this.current].correctValue * this.numberline.length + QuestionSet.NumberLineX;
        this.correctLocator.set('position', new geo.Point(x, QuestionSet.NumberLineY));
        this.addChild({child: this.correctLocator});
        
        this.nextQuestion();
        
        return retVal;
    },
    
    // Handles questions timing out
    onQuestionTimeout: function () {
        events.trigger(this, 'questionTimeout');
        events.trigger(this, 'scoreChange', this.questions[this.current].pointsEarned);
        this.set('lineColor', '#220000');
        
        this.nextQuestion();
    },
});

QuestionSet.NumberLineX = 225 - 150;
QuestionSet.NumberLineY = 510 - 200;

QuestionSet.QDelay = 3500;              // Delay (in ms) between answering a question and advancing to the next one

exports.QuestionSet = QuestionSet;