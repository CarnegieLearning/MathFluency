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

var cocos = require('cocos');
var events = require('events');

var QuestionSet = cocos.nodes.Node.extend({
	numberline	: null,		// Holds the numberline for this set of questions
	questions	: [],		// List of questions in this QuestionSet
	current		: -1,		// Index of the current question being presented
	init: function (n, q) {
		this.numberline = n;
		this.questions = q;
		
		this.addChild({child: this.numberline});
	},
	
	// Advance to the next question
	nextQuestion: function() {
		if(this.current < this.questions.length) {
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
			events.trigger(this, 'onEndOfSet');
		}
	},
	
	// Finish advancing to the next question
	nextQuestionCallback() {
		this.addChild({child: this.questions[this.current]});
		events.trigger(this, 'onNextQuestion');
	}
	
	// Answers the current question
	giveAnswer: function(ans) {
		if(this.questions[this.current].answerQuestion(ans)) {
			// Correct feedback
			events.trigger(this, 'onRightAnswer');
		}
		else {
			// Incorrect feedback
			events.trigger(this, 'onWrongAnswer');
		}
	},
});

exports.QuestionSet = QuestionSet;