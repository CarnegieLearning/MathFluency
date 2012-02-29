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
    qContent    : null,
    correctVal  : 0,
    
    balls       : null,
    
    elapsedTime : 0,
    corrects    : 0,
    misses      : 0,
    
    maxMisses   : 3,
    maxCorrects : 0,
    
    init: function(xml) {
        Question.superclass.init.call(this);
        
        this.set('anchorPoint', new geo.Point(0, 0));
        
        this.qContent = Content.buildFrom(XML.getChildByName(xml, 'EQUATION'));
        
        this.balls = [];
        var xb = XML.getChildrenByName(XML.getChildByName(xml, 'BALLS'), 'BALL');
        for(var i=0; i<xb.length; i+=1) {
            this.balls.push(Ball.create(xb[i]));
            this.addChild({child: this.balls[i]});
        }
    },
    
    input: function(x, y) {
        // Bring values into Question coordinate space
        var p = this.get('position');
        x -= p.x;
        y -= p.y;
        
        // Check translated coordinates against the question's balls
        for(var i=0; i<this.balls.length; i+=1) {
            if(this.balls[i].isCollidingPoint(x, y)) {
                
                if(balls[i].correct) {
                    
                }
                else if(balls[i].bonus) {
                }
                else {
                }
                
                this.removeChild(this.balls[i]);
                this.balls.splice(i, 1);
            }
        }
    },
    
    update: function(dt) {
        this.elapsedTime += dt;
        
        // Move balls
        var i=0;
        for(var i=0; i<this.balls.length; i+=1) {
            this.balls[i].move();
        }
        
        // The check for and resolve any collisions
        for(var i=0; i<this.balls.length; i+=1) {
            for(var j=i+1; j<this.balls.length; j+=1) {
                if(this.balls[i].isColliding(this.balls[j])) {
                    //this.balls.collide(this.balls[j]);
                }
            }
        }
    }
});

Question.height     = 468;
Question.width      = 792;
Question.bufferW    = 20;       // Minimum buffer value = radius
Question.hardW      = true;

exports.Question = Question;