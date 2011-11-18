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
var geo = require('geometry');
var events = require('events');

// Static Imports
var Content = require('Content').Content;
var XML = require('XML').XML;

// Represents a single question to be answered by the player
var Question = cocos.nodes.Node.extend({
	displayValue: null,		// Content to display to the player
	correctValue: null,		// The exact correct answer
	tolerance	: 0.05,		// Allowable difference between response and answer
	playerValue	: null,		// Player's response to the question
    isCorrect   : null,     // Stores truth value
    isTimeout   : false,    // If true, the player timed out of responding to this question
    responseTime: 0,        // Amount of time it took player to respond
    timeLimit   : null,     // Maximum amount of time allowed to answer this Question
    timeLabel   : null,
    
    init: function(node) {
        Question.superclass.init.call(this);
        
		this.displayValue = Content.buildFrom(XML.getChildByName(node, 'CONTENT'));
		this.correctValue = XML.getChildByName(node, 'ANSWER').value;
        
        if(node.attributes.hasOwnProperty('timeLimit')) {
            console.log('Time Limit: ' + node.attributes['timeLimit'])
            this.timeLimit = node.attributes['timeLimit'];
            this.timeLabel = cocos.nodes.Label.create({string: this.timeLimit});
            this.timeLabel.set('position', new geo.Point(0,50));
            this.addChild({child: this.timeLabel});
        }
		
		this.addChild({child: this.displayValue});
    },
    
    // Called when the question is answered, sets and returns the result
    answerQuestion: function(ans) {
		this.playerValue = ans; // Store the player's response to the question
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this);
        
		// Evaluate the response
		if(Math.abs(ans - this.correctValue) < this.tolerance) {
            this.isCorrect = true;
			return true;
		}
        this.isCorrect = false;
		return false;
    },
    
    update: function(dt) {
        if(this.playerValue == null) {
            this.responseTime += dt;
            
            if(this.timeLimit != null) {
                if(this.responseTime > this.timeLimit) {
                    this.responseTime = this.timeLimit;
                    this.isCorrect = false;
                    events.trigger(this, 'questionTimeout');
                }
                
                this.timeLabel.string = (this.timeLimit - this.responseTime).toFixed(1);
            }
        }
    }
});

// TODO: Write static helper for building an options object to initialize a question

exports.Question = Question