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

// A single square in the game board
var Tile = cocos.nodes.Node.extend({
    enemyCount  : 0,        // Number of enemies present in tile
    
    collision   : false,    // Solid for player if true
    safetyZone  : false,    // Player immune to monsters here if true
    playerBit   : false,    // If true, player is currently in the tile
    
    init: function(loadVal) {
        Tile.superclass.init.call(this);
        
        if(loadVal == 1) {
            this.collision = true;
        }
        else if(loadVal == 2) {
            this.safetyZone = true;
        }
    },
    
    // Moves the player into this tile if possible
    movePlayerIn: function() {
        if(this.collision) {
            return 0;
        }
        
        else if(this.enemyCount > 0 && !this.safetyZone) {
            return -1;
        }
        
        this.playerBit = true;
        
        return 1;
    },
    
    // Resets the Tile to start of level conditions
    reset: function() {
        if(this.hasChest) {
            this.chestClosed = true;
        }
    },
    
    // Moves the player out of this tile if possible
    movePlayerOut: function() {
        if(this.playerBit) {
            this.playerBit = false;
            return true;
        }
        
        return false;
    },
    
    // Moves an enemy into this tile
    moveEnemyIn: function(enemy) {
        this.enemyCount += 1;
        
        if(this.playerBit && !this.safetyZone) {
            return -1;
        }
        return 1;
    },
    
    // Moves an enemy out of this tile if it still exists
    moveEnemyOut: function(enemy) {
        if(this.enemyCount > 0) {
            this.enemyCount -= 1;
            return true;
        }
        
        return false;
    }
});

exports.Tile = Tile;