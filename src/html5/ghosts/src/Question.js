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

// Import the cocos2d module
var cocos = require('cocos2d');
var geo = require('geometry');
var events = require('events');

// Project imports
var MultiLabel = require('MultiLabel').MultiLabel;

// Static imports
var XML = require('XML').XML;
var GC = require('GhostsControl').GhostsControl;

var Question = cocos.nodes.Node.extend({
    answer      : -1,       // Holds the index of the correct answer
    correct     : null,     // Holds if this question is answered correctly or not
    chosen      : null,     // Choice chosen by the player

    questionText: null,     // Array of strings containing the question
    choices     : null,     // Stores the list of question answers
    
    hintable    : false,    // When true, the question can be hinted
    hinted      : false,    // When true, the question has already been hinted
    
    init: function(opts) {
        Question.superclass.init.call(this);
        
        //TODO: Actual loading
        
        this.set('anchorPoint', new geo.Point(0, 0));
        
        this.questionText = opts.qText;
        this.choices = [];
        // Randomize ordering of choices
        for(var i=2; i>=0; i-=1) {
            var r = Math.floor(Math.random() * (i+1));
            this.choices.push(opts.choices[r]);
            opts.choices.splice(r, 1);
            if(r == 0 && this.answer == -1) {
                this.answer = 2 - i;
            }
        }
        
        // Create background for question
        this.bg = cocos.nodes.Sprite.create({file: '/resources/green.png'});
        this.bg.set('anchorPoint', new geo.Point(0, 0));
        var cs = this.bg.get('contentSize');
        this.bg.set('scaleX', 250 / cs.width);
        this.bg.set('scaleY', 200 / cs.height);
        this.bg.set('zOrder', -1);
        this.addChild({child: this.bg});
        
        this.text = MultiLabel.create(230, 25, '20', 'Helvetica', this.questionText);
        this.addChild({child: this.text});
        
        // Create choices
        var choice;
        var lopts = {fontSize: '20', fontColor: '#000000'};
        for(var i=0; i<this.choices.length; i+=1) {
            lopts['string'] = this.choices[i];
            choice = cocos.nodes.Label.create(lopts);
            choice.set('position', new geo.Point(50 + 75*i, 250));
            this.addChild({child: choice});
        }
    },
    
    // Refreshes state variables in case question is reused in a single playthrough
    refresh: function() {
        this.hinted = false;
        this.correct = null;
        this.chosen = null;
    },
    
    // Submits the indicated choice as the player's answer
    selectAnswer: function(ans) {
        this.chosen = ans;
    
        if(ans == this.answer) {
            this.correct = true;
            GC.AM.playSound('correct');
            return true;
        }
        
        this.correct = false;
        GC.AM.playSound('wrong');
        return false;
    },
    
    // Called when the player aborts the question due to movement
    abort: function() {
        this.chosen = -1;
        this.corrent = false;
    },
    
    // Returns true if a hint can be given and a second attempt on the question can be made
    isHintable: function() {
        return (this.hintable && !this.hinted);
    },
    
    // Returns the choice index selected or -1 if none are selected
    processClick: function(x, y) {
        var p = this.get('position');
        var lx = x - p.x;
        var ly = y - p.y;
        
        if(225 < ly && ly < 275) {
            if(25 < lx && lx < 75) {
                return 0;
            }
            else if(100 < lx && lx < 150) {
                return 1;
            }
            else if(175 < lx && lx < 225) {
                return 2;
            }
        }
        
        return -1;
    }
});

exports.Question = Question;