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
var Chest = require('Chest').Chest;
var Enemy = require('Enemy').Enemy;
var Player = require('Player').Player;
var Tile = require('Tile').Tile;

// Represents one full level of the game
var Level = cocos.nodes.Node.extend({
    rowMax  : 1,        // Max size of level in rows
    colMax  : 1,        // Max size of level in columns

    bg      : null,     // Background image
    objects : null,     // Contains list of objects in the level

    board   : null,     // Contains two dimensional array of Tiles
    enemies : null,     // Contains the list of enemies for the level
    
    player  : null,     // Reference to the player
    startR  : 0,        // Starting row for player
    startC  : 0,        // Starting col for player
    endR    : 0,        // Ending row for player
    endC    : 0,        // Ending col for player
    
    chestMax    : 0,    // Total chests in level
    chests      : 0,    // Current count of opened chests
    chestLink   : null, // Shortcut to all chests in level
    
    init: function(opts) {
        Level.superclass.init.call(this);
        
        this.set('position', new geo.Point(opts.offsetX, opts.offsetY));
        this.set('anchorPoint', new geo.Point(0, 0));
        
        this.rowMax = opts.rowMax;
        this.colMax = opts.colMax;
    
        this.bg = cocos.nodes.Sprite.create({file: opts.image});
        this.bg.set('position', new geo.Point(0, 0));
        this.bg.set('anchorPoint', new geo.Point(0, 0));
        this.bg.set('zOrder', -5);
        this.addChild({child: this.bg});
    
        this.objects = [];
        this.enemies = [];
        this.chestLink = [];
        
        for(var i=0; i<opts.enemies.length; i+=1) {
            this.enemies.push(Enemy.create(opts.enemies[i]));
            this.addChild({child: this.enemies[i]});
        }
        
        // Initialize the board
        this.board = [];
        for(var i=0; i<this.rowMax; i+=1) {
            this.board.push([]);
            for(var j=0; j<this.colMax; j+=1) {
                if(opts.collision[i][j] < 3) {
                    this.board[i].push(Tile.create(opts.collision[i][j]));
                }
                else {
                    var chest = Chest.create(opts.collision[i][j])
                    this.board[i].push(chest);
                    this.chestLink.push(chest);
                }
                this.board[i][j].set('position', new geo.Point(j * 50 + 25, i * 50 + 25));
                this.board[i][j].set('zOrder', -1);
                this.addChild({child: this.board[i][j]});
                
                if(opts.collision[i][j] == 2) {
                    this.chestMax += 1;
                }
            }
        }
        
        this.startR = opts.startR;
        this.startC = opts.startC;
        this.endR = opts.endR;
        this.endC = opts.endC;
        
        this.player = Player.create();
        this.addChild({child: this.player});
    },
    
    // Starts the level for the first time
    start: function() {
        this.scheduleUpdate();
        this.player.teleport(this.startR, this.startC);
        
        for(var i=0; i<this.enemies.length; i+= 1) {
            this.enemies[i].reset();
        }
    },
    
    // Stops the level
    stop: function() {
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this);
    },
    
    // Resets all chests
    restart: function() {
        this.chests = 0;
        
        for(var i=0; i<this.chestLink.length; i+=1) {
            this.chestLink[i].closeChest();
        }
    },
    
    // Moves the player the specified direction and distance
    movePlayer: function(deltaR, deltaC) {
        var dr = this.player.row + deltaR;
        var dc = this.player.col + deltaC;
        
        var ret = this.movePlayerAssist(dr, dc);
        console.log(ret);
        if(ret == 1) {
            this.board[this.player.row][this.player.col].movePlayerOut();
            this.player.teleport(dr, dc);
        }
        else if(ret == -1) {
            this.restart();
        }
        else if(ret == 2) {
            if(this.board[dr][dc].openChest()) {
                this.chests += 1;
            }
        }
        
        else if(this.player.row == this.endR && this.player.col == this.endC) {
            // Attempting to exit
            if(this.chests >= this.chestMax) {
                events.trigger(this, 'levelCompleted');
            }
        }
        
        return ret;
    },
    
    // Makes sure the destination is valid before checking
    movePlayerAssist: function(r, c) {
        if(r > -1 && r < this.rowMax && c > -1 && c < this.colMax) {
            return this.board[r][c].movePlayerIn();
        }
        
        return 0;
    },
    
    // Moves the specified enemy to the specified destination
    moveEnemy: function(i, dr, dc) {
        this.board[this.enemies[i].row][this.enemies[i].col].moveEnemyOut();
        
        this.enemies[i].teleport(dr, dc);
        
        // Move enemy and check for player collision
        if(this.board[dr][dc].moveEnemyIn() == -1) {
            this.restart();
        }
    },
    
    // Check to see if any enemies need to move
    update: function(dt) {
        for(var i=0; i<this.enemies.length; i+=1) {
            if(this.enemies[i].checkMove(dt)) {
                var d = this.enemies[i].getDestination();
                this.moveEnemy(i, d.row, d.col);
            }
        }
    }
});

Level.Level1 = {rowMax: 7, colMax: 9, startR: 3, startC: 6, endR: 3, endC: 0, offsetX: 100, offsetY: 50, image: '/resources/level1.png',
    enemies: [],
    collision: 
    [[0,0,0,0,0,1,3,0,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[0,0,1,1,1,1,0,0,0]
    ,[0,0,0,0,0,0,0,1,0]
    ,[0,0,1,3,1,0,0,0,0]
    ,[0,0,0,0,0,0,0,0,0]
    ,[0,0,1,1,1,4,1,1,1]]
}

Level.Level2 = {rowMax: 7, colMax: 10, startR: 3, startC: 9, endR: 0, endC: 2, offsetX: 50, offsetY: 50, image: '/resources/level2.png',
    enemies:
    [
        {
            delay: 1.0, type: 1, pathDir: 1, pathLoop: true,
            path:
            [{row: 5, col: 3}, {row: 5, col: 4}, {row: 5, col: 5}, {row: 5, col: 6}, {row: 5, col: 7}, {row: 4, col: 7},
             {row: 3, col: 7}, {row: 2, col: 7}, {row: 2, col: 6}, {row: 2, col: 5}, {row: 2, col: 4}, {row: 2, col: 3},
             {row: 2, col: 2}, {row: 2, col: 1}, {row: 3, col: 1}, {row: 4, col: 1}, {row: 5, col: 1}, {row: 5, col: 2}]
        },
        {
            delay: 0.5, type: 3, pathDir: 1, pathLoop: true,
            path:
            [{row: 1, col: 0}, {row: 2, col: 0}, {row: 2, col: 1}, {row: 3, col: 1}, {row: 4, col: 1}, {row: 5, col: 1},
             {row: 5, col: 0}, {row: 5, col: 1}, {row: 6, col: 1}, {row: 6, col: 2}, {row: 5, col: 2}, {row: 5, col: 3},
             {row: 5, col: 4}, {row: 6, col: 4}, {row: 6, col: 5}, {row: 5, col: 5}, {row: 5, col: 6}, {row: 5, col: 7},
             {row: 6, col: 7}, {row: 6, col: 8}, {row: 5, col: 8}, {row: 4, col: 8}, {row: 3, col: 8}, {row: 3, col: 9},
             {row: 3, col: 8}, {row: 2, col: 8}, {row: 1, col: 8}, {row: 0, col: 8}, {row: 1, col: 8}, {row: 1, col: 7},
             {row: 1, col: 6}, {row: 1, col: 5}, {row: 1, col: 4}, {row: 1, col: 3}, {row: 0, col: 3}, {row: 0, col: 2},
             {row: 0, col: 1}, {row: 0, col: 0}]
        },
        {
            delay: 1.0, type: 4, pathDir: 1, pathLoop: false,
            path:
            [{row: 6, col: 8}, {row: 5, col: 8}, {row: 4, col: 8}, {row: 3, col: 8}, {row: 2, col: 8}, {row: 1, col: 8},
             {row: 0, col: 8}]
        }
    ],
    collision: 
    [[0,0,0,0,1,1,1,1,4,1]
    ,[0,0,0,0,0,0,0,0,0,1]
    ,[0,0,0,0,0,0,0,0,0,1]
    ,[1,0,1,1,3,1,1,0,0,0]
    ,[1,0,1,1,1,1,1,0,0,1]
    ,[0,0,0,0,0,0,0,0,0,1]
    ,[1,4,0,1,0,0,1,0,0,1]]
}

Level.Level3 = {rowMax: 9, colMax: 12, startR: 6, startC: 11, endR: 2, endC: 5, offsetX: 0, offsetY: 0, image: '/resources/level3.png',
    enemies: [
        {
            delay: 1.0, type: 1, pathDir: 1, pathLoop: true,
            path:
            [{row: 7, col: 3}, {row: 7, col: 4}, {row: 7, col: 5}, {row: 6, col: 5}, {row: 5, col: 5}, {row: 4, col: 5},
             {row: 4, col: 4}, {row: 4, col: 3}, {row: 4, col: 2}, {row: 5, col: 2}, {row: 6, col: 2}, {row: 7, col: 2}]
        },
        {
            delay: 1.5, type: 1, pathDir: 1, pathLoop: false,
            path:
            [{row: 5, col: 0}, {row: 5, col: 1}, {row: 5, col: 2}, {row: 6, col: 2}, {row: 7, col: 2}, {row: 8, col: 2},
             {row: 8, col: 1}, {row: 8, col: 0}]
        },
        {
            delay: 1.0, type: 2, pathDir: 1, pathLoop: true,
            path:
            [{row: 3, col: 2}, {row: 4, col: 3}, {row: 3, col: 4}, {row: 2, col: 5}, {row: 1, col: 4}, {row: 0, col: 3},
             {row: 1, col: 4}, {row: 2, col: 5}, {row: 3, col: 4}, {row: 4, col: 3}, {row: 3, col: 2}, {row: 2, col: 1}]
        }
    ],
    collision: 
    [[1,1,1,0,0,1,1,1,1,1,1,1]
    ,[1,1,1,0,0,0,1,1,1,1,1,1]
    ,[3,0,0,0,0,0,1,1,1,1,1,1]
    ,[1,0,0,0,0,0,1,1,1,1,1,1]
    ,[1,0,0,0,0,0,1,1,1,1,1,1]
    ,[0,0,0,1,1,4,0,0,0,1,1,1]
    ,[1,1,0,1,1,0,0,0,0,0,0,0]
    ,[1,1,0,0,0,0,1,1,1,1,0,0]
    ,[4,0,0,0,0,0,1,1,1,1,1,1]]
}

Level.Level4 = {rowMax: 6, colMax: 8, startR: 5, startC: 5, endR: 1, endC: 0, offsetX: 100, offsetY: 50, image: '/resources/level4.png',
    enemies:
    [
        {
            delay: 1.0, type: 1, pathDir: 1, pathLoop: true,
            path:
            [{row: 1, col: 2}, {row: 1, col: 1}, {row: 1, col: 0}, {row: 2, col: 0}, {row: 3, col: 0}, {row: 4, col: 0},
             {row: 4, col: 1}, {row: 4, col: 2}, {row: 3, col: 2}, {row: 3, col: 3}, {row: 4, col: 3}, {row: 4, col: 4},
             {row: 4, col: 5}, {row: 3, col: 5}, {row: 3, col: 6}, {row: 3, col: 7}, {row: 2, col: 7}, {row: 1, col: 7},
             {row: 1, col: 6}, {row: 1, col: 5}, {row: 1, col: 4}, {row: 1, col: 3}]
        },
        {
            delay: 1.0, type: 2, pathDir: 1, pathLoop: true,
            path:
            [{row: 4, col: 2}, {row: 5, col: 3}]
        },
        {
            delay: 0.5, type: 3, pathDir: 1, pathLoop: true,
            path:
            [{row: 2, col: 0}, {row: 3, col: 0}, {row: 4, col: 0}, {row: 5, col: 0}, {row: 5, col: 1}, {row: 5, col: 2},
             {row: 5, col: 3}, {row: 4, col: 3}, {row: 4, col: 4}, {row: 4, col: 5}, {row: 5, col: 5}, {row: 4, col: 5},
             {row: 4, col: 6}, {row: 4, col: 7}, {row: 5, col: 7}, {row: 4, col: 7}, {row: 3, col: 7}, {row: 2, col: 7},
             {row: 1, col: 7}, {row: 1, col: 6}, {row: 1, col: 5}, {row: 1, col: 4}, {row: 1, col: 3}, {row: 1, col: 2},
             {row: 0, col: 2}, {row: 0, col: 1}, {row: 0, col: 0}, {row: 1, col: 0}]
        }
    ],
    collision: 
    [[0,0,0,1,1,1,1,1]
    ,[0,0,0,0,4,0,2,0]
    ,[0,1,1,1,1,1,1,0]
    ,[0,1,0,0,1,0,0,0]
    ,[0,0,0,0,0,0,0,0]
    ,[0,2,0,4,1,0,1,4]]
}

Level.Level5 = {rowMax: 9, colMax: 12, startR: 4, startC: 10, endR: 0, endC: 10, offsetX: 0, offsetY: 0, image: '/resources/level5.png',
    enemies:
    [
        {
            delay: 1.0, type: 1, pathDir: 1, pathLoop: false,
            path:
            [{row: 4, col: 1}, {row: 4, col: 2}, {row: 4, col: 3}, {row: 4, col: 4}, {row: 3, col: 4}, {row: 2, col: 4},
             {row: 1, col: 4}, {row: 0, col: 4}, {row: 0, col: 3}, {row: 0, col: 2}, {row: 0, col: 1}]
        },
        {
            delay: 1.0, type: 2, pathDir: 1, pathLoop: true,
            path:
            [{row: 3, col: 5}, {row: 4, col: 6}, {row: 3, col: 7}, {row: 4, col: 6}, {row: 3, col: 5}, {row: 2, col: 4},
             {row: 1, col: 5}, {row: 2, col: 6}, {row: 3, col: 7}, {row: 2, col: 6}, {row: 1, col: 5}, {row: 2, col: 4},
             {row: 3, col: 5}, {row: 4, col: 6}, {row: 3, col: 7}, {row: 4, col: 6}]
        },
        {
            delay: 1.0, type: 2, pathDir: 1, pathLoop: true,
            path:
            [{row: 6, col: 2}, {row: 7, col: 3}, {row: 8, col: 4}, {row: 7, col: 3}, {row: 6, col: 2}, {row: 5, col: 1}]
        },
        {
            delay: 1.0, type: 4, pathDir: 1, pathLoop: false,
            path:
            [{row: 4, col: 7}, {row: 3, col: 7}, {row: 2, col: 7}, {row: 1, col: 7}, {row: 0, col: 7}]
        }
    ],
    collision: 
    [[1,4,0,0,0,1,1,4,1,0,0,1]
    ,[1,1,1,1,0,0,0,0,1,0,0,0]
    ,[1,1,1,1,0,0,0,0,1,0,0,0]
    ,[1,1,1,1,0,0,0,0,0,0,0,0]
    ,[1,0,0,0,0,0,0,0,1,0,0,0]
    ,[0,0,0,0,1,1,1,1,1,1,1,1]
    ,[0,0,0,0,0,1,1,1,1,1,1,1]
    ,[1,1,0,0,0,3,1,1,1,1,1,1]
    ,[1,1,1,0,0,1,1,1,1,1,1,1]]
}

exports.Level = Level