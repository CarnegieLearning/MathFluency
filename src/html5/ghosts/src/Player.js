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

var Player = cocos.nodes.Node.extend({
    row     : -1,   // Current row position
    col     : -1,   // Current col position
    
    startR  : 0,    // Starting row position for the level
    startC  : 0,    // Starting col position for the level
    
    moveR   : -1,   // Destination row for current move
    moveC   : -1,   // Destination col for current move
    
    moveSpd : 0.25, // Seconds it takes for the player to move 1 cell
    
    init: function() {
        Player.superclass.init.call(this);
    
        this.sprite = cocos.nodes.Sprite.create({file: '/resources/hero.png'});
        this.addChild({child: this.sprite});
        
        // Statically bind as these should only be called due to triggering events
        this.moveThreshold = this.moveThreshold.bind(this);
        this.moveComplete = this.moveComplete.bind(this);
    },
    
    // Moves the player to the specified coordinates
    teleport: function(r, c) {
        this.row = r;
        this.col = c;
        
        this.set('position', new geo.Point(c * 50 + 25, r * 50 + 25));
    },
    
    // Returns true if the player can accept a new movement destination
    canMove: function() {
        if(this.moveR != -1 || this.moveC != -1) {
            return false;
        }
        return true;
    },
    
    // Moves the player over time to the specified destination
    move: function(r, c) {
        // Temporary placeholder to keep things concise
        var p = this.get('position');
        
        // Only create needed MOT
        var m;
        var once = false;
        if(c != this.col) {
            m = MOT.create(p.x, (c - this.col) * 50, this.moveSpd);
            m.bindFunc(this, this.updateX);
            
            events.addListener(m, 'Completed', this.moveComplete)
            once = true;
        }
        if(r != this.row) {
            m = MOT.create(p.y, (r - this.row) * 50, this.moveSpd);
            m.bindFunc(this, this.updateY);
            
            if(!once) {
                events.addListener(m, 'Completed', this.moveComplete)
            }
        }
        
        // Store the destination
        this.moveR = r;
        this.moveC = c;
        
        setTimeout(this.moveThreshold, this.moveSpd * 500);   // Converting sec to ms and dividing by 2
        
        return true;
    },
    
    // Triggers when the enemy transitions into a new cell
    // STATICALLY BOUND
    moveThreshold: function() {
        events.trigger(this, 'moved');
        
        this.row = this.moveR;
        this.col = this.moveC;
    },
    
    // Movement has finished, reset destination variables to allow a new destination
    // STATICALLY BOUND
    moveComplete: function() {
        this.moveR = -1;
        this.moveC = -1;
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
    
    // Resets the player to the start of the level
    reset: function() {
        this.teleport(this.startR, this.startC);
    }
});

exports.Player = Player;