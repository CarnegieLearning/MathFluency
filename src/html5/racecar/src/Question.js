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
var XML = require('XML').XML;

// Represents a single question to be answered by the player
var Question = PNode.extend({
    correctAnswer    : null,    // The correct response
    answer           : null,    // The answer provided by the player
    answeredCorrectly: null,    // Stores if question has been correctly/incorrectly (null=not answered)
    coneL            : null,    // Holds the left delimiter
    coneR            : null,    // Holds the left delimiter
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
        
        // Two lane case
        if(node.children.length == 2) {
        }
        // Three lane case
        else if(node.children.length == 3) {
        
            // Parse the first delimiter
            var cNode = node.children[0];
            var c = Content.buildFrom(cNode);
            c.set('position', new geom.Point(c.get('contentSize').width / 2, 0))
            
            var pSet = XML.getChildByName(cNode, 'PerspectiveSettings');
            pSet = pSet == null ? {attributes:{}} : pSet;
            
            var v   = pSet.attributes['visibility'] == null ? 5 : pSet.attributes['visibility'];
            var max = pSet.attributes['maxScale']   == null ? 4 : pSet.attributes['maxScale'];
            var min = pSet.attributes['minScale']   == null ? 1 : pSet.attributes['minScale'];
        
            // Create option settings
            var opts = {
                lockY       : true,
                silent      : true,
                minScale    : min,
                maxScale    : max,
                alignH      : 1,
                alignV      : 1,
                visibility  : v,
                xCoordinate : -1.5,
                zCoordinate : z,
                content     : c
            }
        
            // Create the first delimiter
            var delim = PNode.create(opts);
            delim.scheduleUpdate();
            this.addChild({child: delim});
            this.set('coneL', delim);
        
            // Parse the second delimiter
            cNode = node.children[1];
            c = Content.buildFrom(cNode);
            c.set('position', new geom.Point(c.get('contentSize').width / 2, 0))
            
            var pSet = XML.getChildByName(cNode, 'PerspectiveSettings');
            pSet = pSet == null ? {attributes:{}} : pSet;
        
            // Reconfigure settings for second delimiter
            opts['xCoordinate'] = 1.5;
            opts['alignH']      = 0;
            opts['content']     = c;
            opts['visibility']  = pSet.attributes['visibility'] == null ? 5 : pSet.attributes['visibility'];
            opts['maxScale']    = pSet.attributes['maxScale']   == null ? 4 : pSet.attributes['maxScale'];
            opts['minScale']    = pSet.attributes['minScale']   == null ? 1 : pSet.attributes['minScale'];
        
            // Create the second delimiter
            delim = PNode.create(opts);
            delim.scheduleUpdate();
            this.addChild({child: delim});
            this.set('coneR', delim);
            
            // Set the answer lane
            this.set('correctAnswer', node.children[2].attributes['VALUE']);
        }
        else {
            console.log('ERROR: Incorrect number of child nodes for Question');
        }
        
        return this
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
            
            this.coneL.set('alignH', 1 - shift);
            this.coneR.set('alignH', 0 + shift);
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

// TODO: Write static helper for building an options object to initialize a question

exports.Question = Question