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
var geom = require('geometry');

var Content = require('Content').Content;
var PNode = require('PerspectiveNode').PerspectiveNode;
var RC = require('RaceControl').RaceControl;
var XML = require('XML').XML;

// Represents a single question to be answered by the player
var Question = PNode.extend({
    correctAnswer    : null,    // The correct response
    answer           : null,    // The answer provided by the player
    answeredCorrectly: null,    // Stores if question has been correctly/incorrectly (null=not answered)
    delimiters       : null,    // Holds the delimiters
    timeElapsed      : 0.0,     // Real time elapsed since start of question (including delimeterStaticTime)
    init: function(node, z) {
        var superOpts = {
            xCoordinate : 0,
            zCoordinate : z,
            lockX       : true,
            minScale    : 1,
            maxScale    : 1
        }
        Question.superclass.init.call(this, superOpts);
        
        // Build delimiters for question
        this.delimiters = [];
        for(var i=0; i<node.children.length-1; i+=1) {
            this.buildDelim(node.children[i], z);
            this.delimiters[i].xCoordinate = RC.delimiterSpacing[node.children.length][i];
        }
        
        //HACK: need better way of determining/setting this
        RC.curNumLanes = node.children.length;

        this.set('correctAnswer', node.children[i].attributes['VALUE']);
        
        return this
    },
    
    buildDelim: function(node, z) {
        var c = Content.buildFrom(node);
        c.set('position', new geom.Point(c.get('contentSize').width / 2, 0))
        
        var pSet = XML.getChildByName(node, 'PerspectiveSettings');
        pSet = pSet == null ? {attributes:{}} : pSet;
        
        // Create option settings
        var opts = {
            lockY       : true,
            silent      : true,
            minScale    : pSet.attributes['minScale']   == null ? 1 : pSet.attributes['minScale'],
            maxScale    : pSet.attributes['maxScale']   == null ? 4 : pSet.attributes['maxScale'],
            alignH      : 0.5,
            alignV      : 1,
            visibility  : pSet.attributes['visibility'] == null ? 5 : pSet.attributes['visibility'],
            xCoordinate : 0,
            zCoordinate : z,
            content     : c
        }
    
        // Create the first delimiter
        var delim = PNode.create(opts);
        delim.scheduleUpdate();
        this.addChild({child: delim});
        this.delimiters.push(delim);
    },
    
    // Called when the question is answered, sets and returns the result
    answerQuestion: function(ans) {
        if(this.get('answeredCorrectly') == null) {
            this.set('answer', ans);
            if(this.get('correctAnswer') == ans) {
                this.set('answeredCorrectly', true);
                return true;
            }
            this.set('answeredCorrectly', false);
            return false;
        }
        
        return null;
    },
    
    // Manages question timing and movement
    update: function(dt) {
        Question.superclass.update.call(this, dt);
        
        if(this.added) {
            if(this.answeredCorrectly == null) {
                this.set('timeElapsed', this.timeElapsed + dt);
                
                // TODO: Get the chaseDist from the player, otherwise answers will be up to a meter late
                if(PNode.cameraZ + 6 >= this.zCoordinate) {
                    events.trigger(this, "questionTimeExpired", this);
                }
            }
            
            // Pulls the delimiters more onto the lane lines as they progress down the screen
            var shift = (this.position.y - PNode.horizonStart) / PNode.horizonHeight / 1.5;
            
            if(this.delimiters.length > 1) {
                this.delimiters[0].set('alignH', 1 - shift);
                this.delimiters[this.delimiters.length-1].set('alignH', 0 + shift);
            }
        }
    },
	
	// Should prevent race condition of being removed before being answered
	onExit: function () {
		if(this.answeredCorrectly == null) {
			events.trigger(this, "questionTimeExpired", this);
		}
        Question.superclass.onExit.call(this);
    },
});

exports.Question = Question