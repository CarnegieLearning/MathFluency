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

// Import the cocos2d module
var cocos = require('cocos2d');
var geo = require('geometry');

var Enemy = cocos.nodes.Node.extend({
    row         : -1,       // Current row position
    col         : -1,       // Current col position
    
    path        : null,     // Path the enemy takes during the level and will continously loop on it
    pathPoint   : 0,        // Current location on the path
    pathDir     : 1,        // Direction of path array traversal
    pathLoop    : true,     // If true, path will loop end to end; false will switch directions when hitting an end
    
    moveDelay   : 500,      // Minimum real world ms needed before the enemy to takes each step
    delay       : 0,        // Current accumulated delay
    
    init: function(opts) {
        Enemy.superclass.init.call(this);
        
        this.path = opts.path;
        this.moveDelay = opts.delay;
        
        this.pathDir = opts.pathDir;
        this.pathLoop = opts.pathLoop;
        
        this.sprite = cocos.nodes.Sprite.create({file: '/resources/monsters_mon' + opts.type +'.png'});
        this.addChild({child: this.sprite});
    },
    
    // Moves the enemy to the specified coordinates
    teleport: function(r, c) {
        this.row = r;
        this.col = c;
        
        this.set('position', new geo.Point(c * 50 + 25, r * 50 + 25));
    },
    
    // Resets the monster to level starting conditions
    reset: function() {
        this.pathPoint = 0;
        this.teleport(this.path[0].row, this.path[0].col);
        this.delay = 0;
    },
    
    // Given delay of current frame, returns true if this enemy needs to move in the current frame, false otherwise
    checkMove: function(dt) {
        this.delay += dt;
        if(this.moveDelay < this.delay) {
            this.delay -= this.moveDelay;
            return true;
        }
        return false;
    },
    
    // Gets the next location on the enemy's path
    getDestination: function() {
        this.pathPoint += this.pathDir;
        // Positive direction, end of path
        if(this.pathPoint >= this.path.length) {
            if(this.pathLoop) {
                this.pathPoint = 0;
            }
            else {
                this.pathPoint = this.path.length - 2;
                this.pathDir = -1;
            }
        }
        // Negative direction, end of path
        else if(this.pathPoint < 0) {
            if(this.pathLoop) {
                this.pathPoint = this.path.length - 1;
            }
            else {
                this.pathPoint = 1;
                this.pathDir = 1;
            }
        }
        
        return this.path[this.pathPoint];
    }
});

exports.Enemy = Enemy;