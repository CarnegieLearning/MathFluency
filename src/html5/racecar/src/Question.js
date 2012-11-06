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

var Content = require('/Content');
var PNode = require('/PerspectiveNode');
var RC = require('/RaceControl');
var XML = require('/XML');

// Represents a single question to be answered by the player
function Question (node, z) {
    var superOpts = {
        xCoordinate : 0,
        zCoordinate : z,
        lockX       : true,
        minScale    : 1,
        maxScale    : 1
    }
    Question.superclass.constructor.call(this, superOpts);
    
    // Build delimiters for question
    this.delimiters = [];
    for(var i=0; i<node.children.length-1; i+=1) {
        this.buildDelim(node.children[i], z, i==0 ? 1 : -1);
        this.delimiters[i].xCoordinate = RC.delimiterSpacing[node.children.length][i];
    }
    
    //HACK: need better way of determining/setting this
    RC.curNumLanes = node.children.length;

    this.correctAnswer = node.children[i].attributes['VALUE'];
    
    return this;
}
    
Question.inherit(PNode, {
    correctAnswer    : null,    // The correct response
    answer           : null,    // The answer provided by the player
    answeredCorrectly: null,    // Stores if question has been correctly/incorrectly (null=not answered)
    delimiters       : null,    // Holds the delimiters
    timeElapsed      : 0.0,     // Real time elapsed since start of question (including delimeterStaticTime)

    buildDelim: function(node, z, flip) {
        var sign = new cocos.nodes.Sprite({file: '/resources/roadSignA.png'});
        sign.scaleX = 0.20 * flip;
        sign.scaleY = 0.20;
        
        var c = Content.buildFrom(node);
        c.scaleX = 5 * flip;
        c.scaleY = -5;
        sign.addChild({child: c});
        c.anchorPoint = new geom.Point(0.0, 0.0);       //HACK: (0, 0) works and (0.5, 0.5) does not work but should be correct
        c.position = new geom.Point(180, -270);
        c.bgShow = false;
        
        var pSet = XML.getChildByName(node, 'PerspectiveSettings');
        pSet = (pSet == null) ? {attributes:{}} : pSet;
        
        // Create option settings
        var opts = {
            lockY       : true,
            silent      : true,
            minScale    : pSet.attributes['minScale']   == null ? 1.2 : pSet.attributes['minScale'],
            maxScale    : pSet.attributes['maxScale']   == null ? 3.2 : pSet.attributes['maxScale'],
            alignH      : 0.87,
            alignV      : 0,
            visibility  : pSet.attributes['visibility'] == null ? 5.5 : pSet.attributes['visibility'],
            xCoordinate : 0,
            zCoordinate : z,
            content     : sign
        }
        
        // Create the first delimiter
        var delim = new PNode(opts);
        delim.scheduleUpdate();
        this.addChild({child: delim});
        this.delimiters.push(delim);
    },
    
    // Called when the question is answered, sets and returns the result
    answerQuestion: function(ans) {
        if(this.answeredCorrectly == null) {
            this.answer = ans;
            if(this.correctAnswer == ans) {
                this.answeredCorrectly = true;
                return true;
            }
            this.answeredCorrectly = false;
            return false;
        }
        
        return null;
    },
    
    // Manages question timing and movement
    update: function(dt) {
        Question.superclass.update.call(this, dt);
        
        if(this.added) {
            if(this.answeredCorrectly == null) {
                this.timeElapsed = this.timeElapsed + dt;
                
                // TODO: Get the chaseDist from the player, otherwise answers will be up to a meter late
                if(PNode.cameraZ + 13 >= this.zCoordinate) {
                    events.trigger(this, 'questionTimeExpired', this);
                }
            }
        }
    },
	
	// Should prevent race condition of being removed before being answered
	onExit: function () {
		if(this.answeredCorrectly == null) {
			events.trigger(this, 'questionTimeExpired', this);
		}
        Question.superclass.onExit.call(this);
    },
});

module.exports = Question