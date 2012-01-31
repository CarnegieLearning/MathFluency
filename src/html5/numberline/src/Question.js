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
var XML = require('XML').XML;

// Represents a single question to be answered by the player
var Question = cocos.nodes.Node.extend({
	displayValue  : null,     // Content to display to the player
	correctValue  : null,     // The exact correct answer
    bandRanges    : null,     // 
    bandPts       : null,     // 
	
    playerValue	  : null,     // Player's response to the question
    correctness   : null,     // Stores truth value
    isTimeout     : false,    // If true, the player timed out of responding to this question
    
    responseTime  : 0,        // Amount of time it took player to respond
    timeLimit     : null,     // Maximum amount of time allowed to answer this Question
    paused        : false,    // Stores if the question timer is paused
    
    ptsTimeout    : null,     // Local override for points on question timeout
    
    pointsEarned  : null,     // Number of points earned on this question
    
    init: function(node) {
        Question.superclass.init.call(this);
        
        var displayHack = XML.getDeepChildByName(node, 'ContentSettings')
        displayHack.attributes['bgShow'] = false;
        displayHack.attributes['fontSize'] = 36;
        displayHack.attributes['fontColor'] = '#FFFFFF';
        
		this.displayValue = Content.buildFrom(XML.getChildByName(node, 'Content'));
		this.correctValue = XML.getChildByName(node, 'Answer').attributes['VALUE'];
        
        // Load override values, if value is not overridden, use static default value
        util.each('timeLimit ptsTimeout bandRanges bandPts'.w(), util.callback(this, function (name) {
            if(node.attributes.hasOwnProperty(name)) {
                this[name] = node.attributes[name];
            }
            else if(Question.hasOwnProperty(name)) {
                this[name] = Question[name]
            }
            else {
                console.log("Question - Unrecognized Option : " + name);
            }
        }));
        
		var cs = this.displayValue.get('contentSize');
        this.displayValue.set('position', new geo.Point(cs.width / 2, cs.height / 2));
		this.addChild({child: this.displayValue});
    },
    
    // Called when the question is answered, sets and returns the result
    answerQuestion: function(ans) {
		this.playerValue = ans; // Store the player's response to the question
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this);
        
		// Evaluate the response
        var i=0;
        for(var i=0; i<this.bandRanges.length; i+=1) {
            if(Math.abs(ans - this.correctValue) < this.bandRanges[i]) {
                this.pointsEarned = this.bandPts[i];
                this.correctness = i;
                return i;
            }
        }
        
        this.pointsEarned = this.bandPts[i];
        this.correctness = i;
		return i;
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
        if(!this.paused && this.playerValue == null) {
            this.responseTime += dt;
            
            // Only worry about timeout if the question has a time limit
            if(this.timeLimit != null) {
                if(this.responseTime > this.timeLimit) {
                    this.responseTime = this.timeLimit;
                    this.isCorrect = false;
                    this.isTimeout = true;
                    this.pointsEarned = this.ptsTimeout != null ? this.ptsTimeout : Question.ptsTimeout;
                    events.trigger(this, 'questionTimeout');
                }
            }
        }
    }
});

// Defaults for Question values //////////
Question.ptsTimeout    = 0;             // Points given for having a specific question time out

Question.timeLimit     = null;          // Default time limit for individual questions
Question.bandRanges    = [0.05, 0.10]   // Default limits of each correctness band (final band is anything greater than the last entry)
Question.bandPts       = [100, 25, 0]   // Default value for answers in each of the bands
//////////////////////////////////////////

// TODO: Write static helper for building an options object to initialize a question

exports.Question = Question