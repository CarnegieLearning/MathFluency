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

// Cocos imports
var cocos = require('cocos2d');
var geo = require('geometry');

// Project imports
var Ball = require('Ball').Ball;

// Static imports
var Content = require('Content').Content;
var XML = require('XML').XML;

var Question = cocos.nodes.Node.extend({
    qContent    : null,     // Content displayed as question
    
    balls       : null,     // Array of all active balls
    history     : null,     // Cronological list of choices' {returnValue, lineLocation}
    
    elapsedTime : 0,        // Time elapsed on this question
    timeStop    : false,    // When true, freezes elapsedTime
    timeLimit   : 0,        // Time allowed for this question
    
    right       : 0,        // Number of correct answers selected
    rightTotal  : 0,        // Total numer of correct answers for the question
    
    wrong       : 0,        // Number of incorrect answers selected
    wrongTotal  : 0,        // Total numer of incorrect answers for the question
    
    bonus       : 0,        // Number of seconds remaining after completing
    
    score       : 0,        // Total score gained on this question
    
    init: function(xml) {
        Question.superclass.init.call(this);
        
        // Position the Question inside the frame of the GameView's foreground.
        this.set('position', new geo.Point(60, 77));
        this.set('anchorPoint', new geo.Point(0, 0));
        
        // Modify the content's display settings
        var displayHack = XML.getChildByName(XML.getChildByName(xml, 'EQUATION'), 'ContentSettings');
        displayHack.attributes['fontSize'] = 50;
        displayHack.attributes['bgShow'] = false;
        
        // Question content to be displayed
        this.qContent = Content.buildFrom(XML.getChildByName(xml, 'EQUATION'));
        this.qContent.set('position', new geo.Point(135, 35));
        this.qContent.set('anchorPoint', new geo.Point(0, 0));
        this.qContent.set('zOrder', 5);
        
        // Box that the question content appears within
        this.qBox = cocos.nodes.Sprite.create({file: '/resources/questionBox.png'});
        this.qBox.set('position', new geo.Point(400, 5));
        this.qBox.set('anchorPoint', new geo.Point(0.5, 0));
        this.qBox.set('zOrder', 2);
        this.addChild({child: this.qBox});
        
        this.qBox.addChild({child: this.qContent});
        
        // Generate the balls for the question
        this.balls = [];
        var xb = XML.getChildrenByName(XML.getChildByName(xml, 'BALLS'), 'BALL');
        for(var i=0; i<xb.length; i+=1) {
            this.balls.push(Ball.create(xb[i]));
            
            // Keep trying to place the ball until it is no longer colliding
            var flag = true;
            while(flag) {
                flag = false;
                for(var j=0; j<this.balls.length-1; j+=1) {
                    if(this.balls[i].isColliding(this.balls[j])) {
                        flag = true;
                        this.balls[i].randomlyPlace();
                        j = this.balls.length;
                    }
                }
            }
            
            this.addChild({child: this.balls[i]});
            
            if(this.balls[i].correct) {
                this.rightTotal += 1;
            }
            else {
                this.wrongTotal += 1;
            }
        }
        
        // Initialize choice history
        this.history = [];
        
        // Set the time limit for question if it differs from the default
        if(xml.attributes.hasOwnProperty('timeLimit')) {
            this.timeLimit = parseInt(xml.attributes['timeLimit']);
        }
    },
    
    // Resolve mouse input for this question
    input: function(x, y) {
        // Bring values into Question coordinate space
        var p = this.get('position');
        x -= p.x;
        y -= p.y;
        
        // Check translated coordinates against the question's balls
        for(var i=this.balls.length-1; i>-1; i-=1) {
            if(this.balls[i].isCollidingPoint(x, y)) {
                this.balls[i].click();
                
                var rv = 0;
                
                if(this.balls[i].correct) {
                    rv = 1;
                }
                else if(this.balls[i].bonus) {
                    rv = 2;
                }
                
                // Get the ball's line location and store the ball in the history
                var ll = this.balls[i].lineLoc;
                this.history.push({retVal: rv, lineLoc: ll, rTime: Math.round(this.elapsedTime * 1000)});
                
                // Return the results
                return {retVal: rv, lineLoc: ll};
            }
        }
        
        // Click empty space case
        return {retVal: -1};
    },
    
    // Deals with ball motion and collision
    update: function(dt) {
        if(!this.timeStop) {
            this.elapsedTime += dt;
        }
        
        // Move balls
        for(var i=0; i<this.balls.length; i+=1) {
            this.balls[i].move(dt);
        }
        
        // Check for and resolve any collisions
        for(var i=0; i<this.balls.length; i+=1) {
            if(this.balls[i].clicked && this.balls[i].expload) {
                continue;
            }
        
            for(var j=i+1; j<this.balls.length; j+=1) {
                if(this.balls[j].clicked && this.balls[j].expload) {
                    continue;
                }
            
                if(this.balls[i].isColliding(this.balls[j])) {
                    this.balls[i].collide(this.balls[j]);
                }
            }
        }
    },
    
    // Returns a XML representation of the question result
    toXML: function(i) {
        var xml = '        <Question Number="' + i + '" Correct="' + this.right + '" Incorrect="' + this.wrong + '" Bonus="' + this.bonus +'" ElapsedTime="' + Math.round(this.elapsedTime * 1000) +'">\n';
        for(var j=0; j<this.history.length; j+=1) {
            xml += this.choiceXML(this.history[j], j);
        }
        xml += '        </Question>\n';
        
        return xml;
    },
    
    // Converts a choice in the history to a XML representation
    choiceXML: function(obj, n) {
        return '            <Choice Number="' + n + '" LineLoc="' + obj.lineLoc + '" ReturnValue="' + obj.retVal + '" ResponseTime="' + obj.rTime + '" />\n'
    }
});

exports.Question = Question;