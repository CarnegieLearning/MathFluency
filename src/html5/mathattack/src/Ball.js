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
var Texture2D = require('cocos2d').Texture2D;

// Static imports
var Content = require('Content').Content;
var MAC = require('MathAttackControl').MathAttackControl;
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
    
    clicked : false,    // True if the ball has already been clicked
    expload : false,    // True if the ball exploads
    
    init: function(xml) {
        Ball.superclass.init.call(this);
        
        // Randomly set position and initialize velocity
        this.randomlyPlace();
        this.v = Vector.create((Math.random()*40+40) * (Math.random() > 0.5 ? 1 : -1), (Math.random()*20+20) * (Math.random() > 0.5 ? 1 : -1));
        
        // Initialize booleans and line location
        this.correct = xml.attributes['correct'] == 'false' ? false : true;
        this.bonus = xml.attributes['bonus'] == 'false' ? false : true;
        this.lineLoc = xml.attributes['lineLoc'];
        
        // Generate standard ball
        if(!this.bonus) {
            // Create the visible representation of the ball
            this.ball = cocos.nodes.Sprite.create({file: '/resources/ball-blank.png'});
            this.addChild({child: this.ball});
            
            // Configure how the text is displayed on ball
            var displayHack = XML.getDeepChildByName(xml, 'ContentSettings')
            displayHack.attributes['fontName'] = MAC.font;
            displayHack.attributes['fontColor'] = '#FFF';
            displayHack.attributes['fontSize'] = 44;
            displayHack.attributes['bgShow'] = false;
            
            // Create and display the content on the ball
            this.content = Content.buildFrom(XML.getChildByName(xml, 'Content'));
            this.content.set('anchorPoint', new geo.Point(0, 0));
            this.addChild({child: this.content});
            
            // Load animation
            var anim = [];
            
            if(this.correct) {
                var r = geo.rectMake(0, 0, 170, 170);
                for(var i=1; i<=11; i++) {
                    anim.push(cocos.SpriteFrame.create({texture: Texture2D.create({file: module.dirname + '/resources/correct/explosion-correct-' + (i >= 10 ? i : '0' + i) + '.png'}), rect: r}));
                }
            }
            else {
                var r = geo.rectMake(0, 0, 100, 100);
                for(var i=1; i<=10; i++) {
                    anim.push(cocos.SpriteFrame.create({texture: Texture2D.create({file: module.dirname + '/resources/wrong/explosion-wrong-' + (i >= 10 ? i : '0' + i) + '.png'}), rect: r}));
                }
            }
            
            this.animNode = cocos.nodes.Sprite.create();
            this.animation = cocos.Animation.create({frames: anim, delay: 0.05});
        }
        // Generate bonus ball
        else {
            if(this.lineLoc == 5) {
                this.ball = cocos.nodes.Sprite.create({file: '/resources/bonus-time.png'});
            }
            else {
                console.log('Invalid bonus ball lineLoc');
            }
            
            this.addChild({child: this.ball});
        }
    },
    
    // Randomly set position 
    randomlyPlace: function() {
        this.p = new geo.Point(Math.random()*750+20, Math.random()*360+40);
        this.set('position', this.p);
    },
    
    // Moves the ball based on its current velocity vector and time elapsed since last frame
    move: function(dt) {
        // Move the ball based on its velocity and elapsed time
        this.p.x += this.v.x * dt;
        this.p.y += this.v.y * dt;
        
        // Wrap balls around from one side to another
        if(MAC.sideMargin > -1) {
            if(this.p.x < -1 * MAC.sideMargin) {
                this.p.x += (792 + MAC.sideMargin * 2);
            }
            else if(this.p.x > 792 + MAC.sideMargin) {
                this.p.x -= (792 + MAC.sideMargin * 2);
            }
        }
        // Non positive values result in hard edges
        else {
            if(this.p.x - this.radius < 0 && this.v.x < 0) {
                this.v.x *= -1;
            }
            else if(this.p.x + this.radius > 792 && this.v.x > 0) {
                this.v.x *= -1;
            }
        }
        
        // Force slow moving balls back onto the screen
        // TODO: Handle edge case of two balls bouncing against each other
        // TODO: Handle corner case of multiple balls in perfect opposition
        // TODO: Handle corner case of exactly 0 x velocity
        if(this.p.x < 0) {
            if(this.v.x > -40 && this.v.x < 0)
                this.p.x -= 15 * dt;
            else if(this.v.x < 40 && this.v.x > 0)
                this.p.x += 15 * dt;
        }
        else if(this.p.x > 790) {
            if(this.v.x > -40 && this.v.x < 0)
                this.p.x -= 15 * dt;
            else if(this.v.x < 40 && this.v.x > 0)
                this.p.x += 15 * dt;
        }
        
        // Bounce balls off of the top and bottom of the screen
        if(this.p.y - this.radius < 0 && this.v.y < 0) {
            this.v.y *= -1;
        }
        else if(this.p.y + this.radius > 450 && this.v.y > 0) {
            this.v.y *= -1;
        }
    },
    
    // Performs needed actions when ball is clicked
    click: function() {
        if(!this.clicked) {
            this.clicked = true;
            this.removeChild({child: this.ball});
            
            // Create new 'clicked' ball
            if((this.correct && MAC.rightExpload) || (!this.bonus && MAC.wrongExpload)) {
                this.expload = true;
                this.addChild({child: this.animNode});
                this.removeChild({child: this.content});
                this.animNode.runAction(cocos.actions.Animate.create({animation: this.animation, restoreOriginalFrame: false}));
            }
            else {
                if(this.correct) {
                    this.ball = cocos.nodes.Sprite.create({file: '/resources/ball-right.png'});
                }
                else if(!this.bonus) {
                    this.ball = cocos.nodes.Sprite.create({file: '/resources/ball-wrong.png'});
                }
                
                this.ball.set('zOrder', -1);
                this.addChild({child: this.ball});
            }
        }
    },
    
    // Checks to see if this ball is colliding with the provided coordinates
    isCollidingPoint: function(x, y) {
        if(this.clicked) {
            return false;
        }
    
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
        // Determine recoil to move each ball out of the other
        var seg = Vector.create(other.p.x - this.p.x, other.p.y - this.p.y);
        
        var recoil = (this.radius + other.radius - seg.length()) / 2;
        var norm = seg.normalize();
        
        // Seperate interpenetrating objects to the point of collision
        this.p.x -= norm.x * recoil;
        this.p.y -= norm.y * recoil;
        this.set('position', this.p);
        
        other.p.x += norm.x * recoil;
        other.p.y += norm.y * recoil;
        other.set('position', other.p);
        
        // Rotate vectors to make y axis perpendicular to collision
        var ang = seg.angle();
        
        var trv = this.v.rotate(ang);
        var orv = other.v.rotate(ang);
        
        // Get masses and initial impact velocities
        var m1 = this.radius * this.radius;
        var m2 = other.radius * other.radius;
        
        var v1i = trv.y;
        var v2i = orv.y;
        
        // Change velocities due to impact with regard to relative masses
        trv.y = v1i * (m1 - m2) / (m1 + m2) + v2i * (2  * m2) / (m1 + m2);
        orv.y = v1i * (2  * m1) / (m1 + m2) + v2i * (m2 - m1) / (m2 + m1);
        
        // Rotate velocities back into normal coordinate space
        this.v = trv.rotate(-1 * ang);
        other.v = orv.rotate(-1 * ang);
    },
});

// Simple Vector object to help with collision math
var Vector = BObject.extend({
    init: function(x, y) {
        this.x = x;
        this.y = y;
    },
    
    // Returns a rotated copy of vector
    rotate: function(rad) {
        var newX = this.x * Math.cos(rad) - this.y * Math.sin(rad);
        var newY = this.x * Math.sin(rad) + this.y * Math.cos(rad);

        return Vector.create(newX, newY);
    },

    // Returns the vector's length
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    
    // Returns the vector's 'angle'
    angle: function() {
        var y = this.y == 0 ? 0.000001 : this.y;
        return Math.atan(this.x / y);
    },
    
    // Returns a normalized copy of the vector
    normalize: function() {
        return Vector.create(this.x / this.length(), this.y / this.length());
    }
});

exports.Ball = Ball;