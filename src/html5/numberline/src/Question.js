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

// Represents a single question to be answered by the player
var Question = cocos.nodes.Node.extend({
	displayValue: null,		// Content to display to the player
	correctValue: null,		// The exact correct answer
	tolerance	: 0.05,		// Allowable difference between response and answer
	playerValue	: null,		// Player's response to the question
    init: function(dv, cv) {
		this.displayValue = dv;
		this.correctValue = cv;
		
		this.child(this.displayValue);
    },
    
    // Called when the question is answered, sets and returns the result
    answerQuestion: function(ans) {
		this.playerValue = ans; // Store the player's response to the question
		
		// Evaluate the response
		if(Math.abs(ans - this.correctValue) > this.tolerance) {
			return true;
		}
		return false;
    },
});

// TODO: Write static helper for building an options object to initialize a question

exports.Question = Question