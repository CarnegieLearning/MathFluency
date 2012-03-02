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

var Ball = require('Ball').Ball;

var Content = require('Content').Content;
var XML = require('XML').XML;

var Question = cocos.nodes.Node.extend({
    qContent    : null,     // Content displayed as question
    
    balls       : null,     // Array of all active balls
    
    elapsedTime : 0,        // Time elapsed on this question
    right       : 0,        // Number of correct answers selected
    wrong       : 0,        // Number of incorrect answers selected
    bonus       : 0,
    
    timeLimit   : 30,       // Time allowed for this question
    
    init: function(xml) {
        Question.superclass.init.call(this);
        
        // Position the Question inside the frame of the GameView's foreground.
        this.set('position', new geo.Point(61, 77));
        this.set('anchorPoint', new geo.Point(0, 0));
        
        // Modify the content's display settings
        var displayHack = XML.getChildByName(XML.getChildByName(xml, 'EQUATION'), 'ContentSettings');
        displayHack.attributes['fontSize'] = 48;
        displayHack.attributes['bgShow'] = false;
        
        // Question content to be displayed
        this.qContent = Content.buildFrom(XML.getChildByName(xml, 'EQUATION'));
        this.qContent.set('position', new geo.Point(135, 30));
        this.qContent.set('anchorPoint', new geo.Point(0, 0));
        this.qContent.set('zOrder', 5);
        
        // Box that the question content appears within
        this.qBox = cocos.nodes.Sprite.create({file: '/resources/questionBox.png'});
        this.qBox.set('position', new geo.Point(400, 24));
        this.qBox.set('zOrder', 2);
        this.addChild({child: this.qBox});
        
        this.qBox.addChild({child: this.qContent});
        
        // Generate the balls for the question
        this.balls = [];
        var xb = XML.getChildrenByName(XML.getChildByName(xml, 'BALLS'), 'BALL');
        for(var i=0; i<xb.length; i+=1) {
            this.balls.push(Ball.create(xb[i]));
            this.addChild({child: this.balls[i]});
        }
    },
    
    // Resolve mouse input for this question
    input: function(x, y) {
        // Bring values into Question coordinate space
        var p = this.get('position');
        x -= p.x;
        y -= p.y;
        
        // Check translated coordinates against the question's balls
        for(var i=0; i<this.balls.length; i+=1) {
            if(this.balls[i].isCollidingPoint(x, y)) {
                var rv = 0;
                
                if(this.balls[i].correct) {
                    rv = 1;
                }
                else if(this.balls[i].bonus) {
                    rv = 2;
                }
                
                var ll = this.balls[i].lineLoc;
                
                this.removeChild(this.balls[i]);
                this.balls.splice(i, 1);
                
                return {retVal: rv, lineLoc: ll};
            }
        }
        
        return {retVal: -1};
    },
    
    // Deals with ball motion and collision
    update: function(dt) {
        this.elapsedTime += dt;
        
        // Move balls
        var i=0;
        for(var i=0; i<this.balls.length; i+=1) {
            this.balls[i].move(dt);
        }
        
        /*/ The check for and resolve any collisions
        for(var i=0; i<this.balls.length; i+=1) {
            for(var j=i+1; j<this.balls.length; j+=1) {
                if(this.balls[i].isColliding(this.balls[j])) {
                    //this.balls.collide(this.balls[j]);
                }
            }
        }//*/
    },
    
    toXML: function(i) {
        return '        <Question Number= "' + i + '" Correct= "' + this.right + '" Incorrect= "' + this.wrong + '" Bonus= "' + this.bonus +'" />\n';
    }
});

Question.height     = 468;
Question.width      = 792;
Question.bufferW    = 20;       // Minimum buffer value = radius
Question.hardW      = true;

exports.Question = Question;