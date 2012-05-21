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
var events = require('events');

// Static imports
var MOT = require('ModifyOverTime').ModifyOverTime;

// Class that implements the enemies the player must avoid
var Enemy = cocos.nodes.Node.extend({
    row         : -1,       // Current row position
    col         : -1,       // Current col position
    
    path        : null,     // Path the enemy takes during the level and will continously loop on it
    pathPoint   : 0,        // Current location on the path
    pathDir     : 1,        // Direction of path array traversal
    pathLoop    : true,     // If true, path will loop end to end; false will switch directions when hitting an end
    
    moveDelay   : 5,        // Minimum real world sec needed before the enemy to takes each step
    delay       : 0,        // Current accumulated delay
    moveLock    : false,    // When true, cannot move even if it is time to move
    
    init: function(opts) {
        Enemy.superclass.init.call(this);
        
        // Configure enemy
        this.path = opts.path;
        this.moveDelay = opts.delay;
        
        this.pathDir = opts.pathDir;
        this.pathLoop = opts.pathLoop;
        
        // Display sprite of the enemy
        this.sprite = cocos.nodes.Sprite.create({file: '/resources/monsters_mon' + opts.type +'.png'});
        this.addChild({child: this.sprite});
        
        // Statically bind as this should only be called through the setTimeout in move()
        this.moveThreshold = this.moveThreshold.bind(this);
        this.moveComplete = this.moveComplete.bind(this);
    },
    
    // Moves the enemy to the specified coordinates
    teleport: function(r, c) {
        this.row = r;
        this.col = c;
        
        this.set('position', new geo.Point(c * 50 + 25, r * 50 + 25));
    },
    
    // Moves the enemy smoothly over time
    move: function() {
        // Temporary placeholders to keep things concise
        var p = this.get('position');
        var d = this.getDestination();
        
        var once = false;
    
        // Only create MOTs if needed
        if(d.col != this.col) {
            var m = MOT.create(p.x, (d.col - this.col) * 50, this.moveDelay);
            m.bindFunc(this, this.updateX);
            events.addListener(m, 'Completed', this.moveComplete)
            once = true;
        }
        if(d.row != this.row) {
            var m = MOT.create(p.y, (d.row - this.row) * 50, this.moveDelay);
            m.bindFunc(this, this.updateY);
            if(!once) {
                events.addListener(m, 'Completed', this.moveComplete)
            }
        }
        
        this.moveLock = true;
        setTimeout(this.moveThreshold, this.moveDelay * 500);   // Converting sec to ms and dividing by 2
    },
    
    // Called when the MOT(s) complete to allow the next move step to occur
    // STATICALLY BOUND
    moveComplete: function() {
        this.moveLock = false;
    },
    
    // Triggers when the enemy transitions into a new cell
    // STATICALLY BOUND
    moveThreshold: function() {
        events.trigger(this, 'moved');
        
        this.row = this.path[this.pathPoint].row;
        this.col = this.path[this.pathPoint].col;
    },
    
    // Used to smoothly update X position indepenantly
    updateX: function(x) {
        var p = this.get('position');
        p.x = x;
        this.set('position', p);
    },
    
    // Used to smoothly update Y position indepenantly
    updateY: function(y) {
        var p = this.get('position');
        p.y = y;
        this.set('position', p);
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
        if(this.moveDelay < this.delay && !this.moveLock) {
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
    },
});

exports.Enemy = Enemy;