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
var util = require('util');

// Static Imports
var Content = require('Content').Content;
var NLC = require('NumberLineControl').NumberLineControl;
var XML = require('XML').XML;

// Represents a single question to be answered by the player
var Question = cocos.nodes.Node.extend({
	displayValue  : null,     // Content to display to the player
	correctValue  : null,     // The exact correct answer
	tolerance	  : 0.05,     // Allowable difference between response and answer
	
    playerValue	  : null,     // Player's response to the question
    isCorrect     : null,     // Stores truth value
    isTimeout     : false,    // If true, the player timed out of responding to this question
    
    responseTime  : 0,        // Amount of time it took player to respond
    timeLimit     : null,     // Maximum amount of time allowed to answer this Question
    
    ptsCorrect    : null,     // Local override for points on correct answer
    ptsIncorrect  : null,     // Local override for points on incorrect answer
    ptsTimeout    : null,     // Local override for points on question timeout
    ptsQuestBonus : null,     // Local override for points per second remaining on question timer
    
    pointsEarned  : null,     // Number of points earned on this question
    
    init: function(node) {
        Question.superclass.init.call(this);
        
		this.displayValue = Content.buildFrom(XML.getChildByName(node, 'CONTENT'));
		this.correctValue = XML.getChildByName(node, 'ANSWER').value;
        
        // Load override values, if value is not overridden, use NLC default/global value
        util.each('timeLimit tolerance ptsCorrect ptsIncorrect ptsTimeout ptsQuestBonus'.w(), util.callback(this, function (name) {
            if(node.attributes.hasOwnProperty(name)) {
                this[name] = node.attributes[name];
            }
            else {
                this[name] = NLC[name]
            }
        }));
		
		this.addChild({child: this.displayValue});
    },
    
    // Called when the question is answered, sets and returns the result
    answerQuestion: function(ans) {
		this.playerValue = ans; // Store the player's response to the question
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this);
        
		// Evaluate the response
        //TODO: Implement bands of correctness rather than just correct/incorrect
		if(Math.abs(ans - this.correctValue) < this.tolerance) {
            this.pointsEarned = this.ptsCorrect + Math.floor(this.getTimeLeft()) * this.ptsQuestBonus;
            this.isCorrect = true;
			return true;
		}
        
        this.pointsEarned = this.ptsIncorrect;
        this.isCorrect = false;
		return false;
    },
    
    // Returns the amount of time remaining for the question
    getTimeLeft: function () {
        if(this.timeLimit != null) {
            return this.timeLimit - this.responseTime;
        }
        return 0;
    },
    
    // Called every frame
    update: function(dt) {
        if(this.playerValue == null) {
            this.responseTime += dt;
            
            // Only worry about timeout if the question has a time limit
            if(this.timeLimit != null) {
                if(this.responseTime > this.timeLimit) {
                    this.responseTime = this.timeLimit;
                    this.isCorrect = false;
                    this.isTimeout = true;
                    this.pointsEarned = this.ptsTimeout != null ? this.ptsTimeout : NLC.ptsTimeout;
                    events.trigger(this, 'questionTimeout');
                }
            }
        }
    }
});

// TODO: Write static helper for building an options object to initialize a question

exports.Question = Question