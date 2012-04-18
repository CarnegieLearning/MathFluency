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

// Project imports
var Level = require('Level').Level;

var Game = cocos.nodes.Node.extend({
    levels      : null, // Contains a list of levels in the game
    
    currentLevel: -1,   // The index of the current level

    init: function(xml) {
        Game.superclass.init.call(this);
    
        this.levels = [
            Level.create(Level.Level1),
            Level.create(Level.Level2),
            Level.create(Level.Level3),
            Level.create(Level.Level4),
            Level.create(Level.Level5)];
    },
    
    // Unloads the current level (if any) and then loads the specified level
    loadLevel: function(i) {
        if(this.currentLevel != -1) {
            this.levels[this.currentLevel].stop();
            this.removeChild({child: this.levels[this.currentLevel]});
        }
        
        if(i > -1 && i < this.levels.length) {
            this.currentLevel = i;
            this.addChild({child: this.levels[i]});
            
            events.addListener(this.levels[i], 'levelCompleted', this.nextLevel.bind(this));
            this.levels[i].start();
            
            return true;
        }
        
        return false;
    },
    
    // Handles to process of loading the subsequent level
    nextLevel: function() {
        if(this.loadLevel(this.currentLevel + 1)) {
            // Level loaded successfully
        }
        // No more levels
        else {
            cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this);
            events.trigger('endOfGame');
        }
    },
    
    // Have the current level move the player by the specified delta
    movePlayer: function(deltaR, deltaC) {
        this.levels[this.currentLevel].movePlayer(deltaR, deltaC)
    },
    
    // Starts the game
    start: function() {
        this.scheduleUpdate();
        this.nextLevel();
    },
    
    update: function() {
    }
});

exports.Game = Game;