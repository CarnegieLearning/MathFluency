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

var geo = require('geometry');

var Question = require('Question').Question;

var Ball = BObject.extend({
    v       : null,
    p       : null,
    
    radius  : 10,
    
    correct : false,
    bonus   : false,
    
    content : null,

    init: function() {
        Ball.superclass.init.call(this);
        
        this.loc = new geo.Point(0, 0);
        this.nextLoc = new geo.Point(0, 0);
        
        this.v = Vector(0, 0);
    },
    
    move: function(dt) {
        v.addTo(p);
        
        if(p.x < -1 * Question.bufferW) {
            p.x += Question.width + Question.bufferW;
        }
        else if(p.x > Question.width + Question.bufferW) {
            p.x -= Question.width + Question.bufferW;
        }
        
        if(p.y - this.radius < 0) {
            v.y *= -1;
        }
        else if(p.y + this.radius > Question.height) {
            v.y *= -1;
        }
    },
    
    isColliding: function(other) {
        var twoR = this.radius + other.radius;
        
        var dx = Math.abs(this.nextLoc.x - other.nextLoc.x);
        var dy = Math.abs(this.nextLoc.y - other.nextLoc.y);
        
        if(dx < twoR && dy < twoR) {
            if(Math.sqrt(dx * dx + dy * dy) < twoR) {
                return true;
            }
        }
        
        return false;
    },
    
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

var Vector = function(x, y) {
    this.x = 0;
    this.y = 0;
    
    addTo = function(pt) {
        pt.x += this.x;
        pt.y += this.y;
    }
    
    addRet = function(pt) {
        return geo.ccp(pt.x + this.x, pt.y + this.y);
    }
    
    multBy = function(m) {
        return Vector(this.x * m, this.y * m);
    }
}

exports.Ball = Ball;