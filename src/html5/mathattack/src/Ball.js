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

// Static imports
var Content = require('Content').Content;
var XML = require('XML').XML;

var Ball = cocos.nodes.Node.extend({
    v       : null,     // Velocity vector of the ball
    p       : null,     // Position of the ball
    
    radius  : 37,       // Radius of the ball
    
    correct : false,    // If true, the ball is a correct answer
    bonus   : false,    // If true, the ball is a bonus ball
    lineLoc : 0,        // Location on the numberline that the ball is associated with
    
    content : null,     // Holds the content to be displayed on the ball
    ball    : null,     // Holds the sprite of a blank ball
    
    init: function(xml) {
        Ball.superclass.init.call(this);
        
        // Randomly set position and initialize velocity
        this.p = new geo.Point(Math.random()*750+20, Math.random()*400+20);
        this.v = new geo.Point(Math.random()*80-40, Math.random()*40-20);
        
        this.set('position', this.p);
        
        // Initialize booleans and line location
        this.correct = xml.attributes['correct'] == 'false' ? false : true;
        this.bonus = xml.attributes['bonus'] == 'false' ? false : true;
        this.lineLoc = xml.attributes['lineLoc'];
        
        // Create the visible representation of the ball
        this.ball = cocos.nodes.Sprite.create({file: '/resources/ball-blank.png'});
        this.addChild({child: this.ball});
        
        // Configure how the text is displayed on ball
        var displayHack = XML.getDeepChildByName(xml, 'ContentSettings')
        displayHack.attributes['fontColor'] = '#FFF';
        displayHack.attributes['fontSize'] = 36;
        displayHack.attributes['bgShow'] = false;
        
        // Create and display the content on the ball
        this.content = Content.buildFrom(XML.getChildByName(xml, 'Content'));
        this.content.set('anchorPoint', new geo.Point(0, 0));
        this.addChild({child: this.content});
    },
    
    // Moves the ball based on its current velocity vector and time elapsed since last frame
    move: function(dt) {
        // Move the ball based on its velocity and elapsed time
        this.p.x += this.v.x * dt;
        this.p.y += this.v.y * dt;
        
        // Wrap balls around from one side to another
        if(this.p.x < -1 * 40) {
            this.p.x += (792 + 80);
        }
        else if(this.p.x > 792 + 40) {
            this.p.x -= (792 + 80);
        }
        
        // Force slow moving balls back onto the screen
        // TODO: Handle edge case of two balls bouncing against each other
        // TODO: Handle corner case of multiple balls in perfect opposition
        // TODO: Handle corner case of exactly 0 x velocity
        if(this.p.x < 0) {
            if(this.v.x > -10 && this.v.x < 0)
                this.p.x -= 15 * dt;
            else if(this.v.x < 10 && this.v.x > 0)
                this.p.x += 15 * dt;
        }
        else if(this.p.x > 790) {
            if(this.v.x > -10 && this.v.x < 0)
                this.p.x -= 15 * dt;
            else if(this.v.x < 10 && this.v.x > 0)
                this.p.x += 15 * dt;
        }
        
        // Bounce balls off of the top and bottom of the screen
        if(this.p.y - this.radius < 0) {
            this.v.y *= -1;
        }
        else if(this.p.y + this.radius > 450) {
            this.v.y *= -1;
        }
    },
    
    // Checks to see if this ball is colliding with the provided coordinates
    isCollidingPoint: function(x, y) {
        var dx = Math.abs(this.p.x - x);
        var dy = Math.abs(this.p.y - y);
        
        if(dx < this.radius && dy < this.radius) {
            if(Math.sqrt(dx * dx + dy * dy) < this.radius) {
                return true;
            }
        }
    },
    
    // Checks to see if this balls is colliding with the other specified ball
    isColliding: function(other) {
        var twoR = this.radius + other.radius;
        
        // Distance between center points
        var dx = Math.abs(this.p.x - other.p.x);
        var dy = Math.abs(this.p.y - other.p.y);
        
        // Quick check (most checks should kick out here)
        if(dx < twoR && dy < twoR) {
            // Compute proper distance and check
            if(Math.sqrt(dx * dx + dy * dy) < twoR) {
                return true;
            }
        }
        
        return false;
    },
    
    // Resolves a collision between this and the other ball
    collide: function(other) {
        // minimum translation distance to push balls apart after intersecting
        var delta = Vector(this.p.x - other.p.x, this.p.y - other.p.y)
        var deltaLen = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
        var mtd = delta.multBy(((this.radius + other.radius)-deltaLen)/deltaLen); 

        // push-pull them apart based off their mass
        this.p = geo.ccpAdd(this.p, mtd);
        other.p = other.ccpSub(this.p, mtd);
/*
        // impact speed
        Vector2d v = (this.v.subtract(other.v));
        float vn = v.dot(mtd.normalize());

        // sphere intersecting but moving away from each other already
        if (vn > 0.0) return;

        // collision impulse
        float i = (-(1.0 + Constants.restitution) * vn) / (im1 + im2);
        Vector2d impulse = mtd.multiply(i);

        // change in momentum
        this.velocity = this.velocity.add(impulse.multiply(im1));
        ball.velocity = ball.velocity.subtract(impulse.multiply(im2));*/
    },
});

exports.Ball = Ball;