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

var LabelBG = require('LabelBG').LabelBG;
var PNode = require('PerspectiveNode').PerspectiveNode;

// Represents a single question to be answered by the player
var Question = PNode.extend({
    correctAnswer    : null,    // The correct response
    answeredCorrectly: null,    // Stores if question has been correctly/incorrectly (null=not answered)
    coneL            : null,    // Holds the left delimiter
    coneR            : null,    // Holds the left delimiter
    timeElapsed      : 0.0,     // Real time elapsed since start of question (including delimeterStaticTime)
    // TODO: Build delimeters internally or externally?
    init: function(ans, d1, d2, z) {
        var superOpts = {
            xCoordinate : 0,
            zCoordinate : z,
            lockX       : true,
            minScale    : 1,
            maxScale    : 1
        }
        Question.superclass.init.call(this, superOpts);
        
        // Initialize all variables
        this.set('correctAnswer', ans);
        
        // Create and display the question content
        var opts = {
            string      : d1,
            fontColor   : '#000000',
            bgColor     : '#FFFFFF',
            zOrder      : 100,
            lockY       : true,
            silent      : true,
            minScale    : 0.75,
            alignH      : 0.5,
            alignV      : 1,
            visibility  : 3,
            xCoordinate : -1.5,
            zCoordinate : z
        }
        var delim = LabelBG.create(opts);
        delim.scheduleUpdate();
        this.addChild({child: delim});
        this.set('coneL', delim);
        
        opts['string'] = d2;
        opts['xCoordinate'] = 1.5;
        delim = LabelBG.create(opts);
        delim.scheduleUpdate();
        this.addChild({child: delim});
        this.set('coneR', delim);
    },
    
    // Called when the question is answered, sets and returns the result
    answerQuestion: function(ans) {
        if(this.get('answeredCorrectly') == null) {
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
        
        if(this.get('added') && this.get('answeredCorrectly') == null) {
            var te = this.get('timeElapsed') + dt;
            this.set('timeElapsed', te);
            
            if(PNode.cameraZ + PNode.carDist >= this.get('zCoordinate')) {
                events.trigger(this, "questionTimeExpired", this);
            }
        }
    },
});

// TODO: Write static helper for building an options object to initialize a question

exports.Question = Question