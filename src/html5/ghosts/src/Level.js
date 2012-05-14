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
var KeyQuestion = require('KeyQuestion').KeyQuestion;
var Player = require('Player').Player;
var TextBox = require('TextBox').TextBox;
var Tile = require('Tile').Tile;

var GC = require('GhostsControl').GhostsControl;

// Represents one full level of the game
var Level = cocos.nodes.Node.extend({
    offsetX : 0,        // How far over to place the level in the play area
    offsetY : 0,        // How far down to place the level in the play area

    rowMax  : 1,        // Max size of level in rows
    colMax  : 1,        // Max size of level in columns
    
    bg      : null,     // Background image

    board   : null,     // Contains two dimensional array of Tiles
    enemies : null,     // Contains the list of enemies for the level
    
    player  : null,     // Reference to the player
    startR  : 0,        // Starting row for player
    startC  : 0,        // Starting col for player
    endR    : 0,        // Ending row for player
    endC    : 0,        // Ending col for player
    
    drag    : null,     // Current Key being dragged
    dragFrom: -1,       // Location from which key is dragged
    
    chestMax    : 0,    // Total chests in level
    chests      : 0,    // Current count of opened chests
    chestLink   : null, // Shortcut to all chests in level
    
    keys        : null, // Array of collected keys
    keyQuestion : null, // The key question for the Level
    keyEnabled  : false,// True when the player is on the final question
    
    question    : null, // Reference to currently displayed question
    chestQ      : null, // Reference to the chest of the currently displayed question
    
    introText   : null, // Array of arrays of strings for the level's intro text
    
    pauseEnemies: false,// When true, enemies stop moving
    started     : false,// 
    
    elapsedTime : 0,    // Elapsed time on level in seconds (INCLUDES keyTime)
    keyTime     : 0,    // Elapsed time on KeyQuestion in seconds
    
    chestOrder  : null, // Array that holds the order the player visited chests (-1 designates key loss)
    chestCount  : null, // Array holds the total number of attempts per chest
    
    rText       : null, // Holds the text for 'CORRECT!'
    
    init: function(opts) {
        Level.superclass.init.call(this);
        
        this.set('position', new geo.Point(opts.offsetX, opts.offsetY + 50));
        this.set('anchorPoint', new geo.Point(0, 0));
        this.set('zOrder', 2);
        
        this.offsetX = opts.offsetX;
        this.offsetY = opts.offsetY;
        
        this.rowMax = opts.rowMax;
        this.colMax = opts.colMax;
    
        this.bg = cocos.nodes.Sprite.create({file: opts.image});
        this.bg.set('position', new geo.Point(0, 0));
        this.bg.set('anchorPoint', new geo.Point(0, 0));
        this.bg.set('zOrder', -5);
        this.addChild({child: this.bg});
        
        this.enemies = [];
        this.chestLink = [];
        
        this.chestOrder = [];
        this.chestCount = [0, 0, 0];
        
        this.keys = [];
        
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
                    var chest = Chest.create(opts.collision[i][j], opts.questions[this.chestLink.length], this.chestLink.length);
                    this.board[i].push(chest);
                    this.chestLink.push(chest);
                    
                    this.chestMax += 1;
                }
                this.board[i][j].set('position', new geo.Point(j * 50 + 25, i * 50 + 25));
                this.board[i][j].set('zOrder', -1);
                this.addChild({child: this.board[i][j]});
            }
        }
        
        // Store the starting and ending position
        this.startR = opts.startR;
        this.startC = opts.startC;
        this.endR = opts.endR;
        this.endC = opts.endC;
        
        this.introText = opts.introText;
        
        this.player = Player.create();
        this.addChild({child: this.player});
        
        this.keyQuestion = KeyQuestion.create(opts.keyQuestion);
        events.addListener(this.keyQuestion, 'correct', this.onFinalCorrect.bind(this));
        events.addListener(this.keyQuestion, 'wrong', this.onFinalWrong.bind(this));
        
        this.rText = cocos.nodes.Label.create({string: 'CORRECT!', fontColor: '#00CC00', fontSize: '32'});
        this.rText.set('position', new geo.Point(775 - this.offsetX, 100 - this.offsetY));
    },
    
    // Boots up the level for the first time
    boot: function() {
        this.player.teleport(this.startR, this.startC);
        
        for(var i=0; i<this.enemies.length; i+= 1) {
            this.enemies[i].reset();
        }
        
        var list = [];
        for(var i=this.introText.length-1; i>=0; i-=1) {
            list.push(TextBox.create({}, this.introText[i], 250, 200, '/resources/green.png', ((i<this.introText.length-1) ? list[list.length-1] : null)));
            list[list.length-1].set('position', new geo.Point(650, 50));
        }
        
        events.trigger(this, 'dialogPop', list[list.length-1]);
    },
    
    // Starts the level
    start: function() {
        if(!this.started) {
            this.scheduleUpdate();
            this.started = true;
        }
        this.pauseEnemies = false;
    },
    
    // Stops the level
    stop: function() {
        this.pauseEnemies = true;
    },
    
    // Resets all chests
    restart: function() {
        this.chests = 0;
        
        if(this.chestQ) {
            this.chestQ.nextQuestion();
            this.removeQuestion();
        }
        
        for(var i=0; i<this.chestLink.length; i+=1) {
            this.chestLink[i].closeChest();
        }
        
        for(var i=0; i<this.keys.length; i+=1) {
            this.removeChild({child: this.keys[i]});
        }
        this.keys = [];
        
        this.chestOrder.push(-1);
    },
    
    // Moves the player the specified direction and distance
    movePlayer: function(deltaR, deltaC) {
        // Prevents the player from moving during an active question
        if(this.question) {
            return;
        }
    
        var dr = this.player.row + deltaR;
        var dc = this.player.col + deltaC;
        
        var ret = this.movePlayerAssist(dr, dc);
        if(ret == 1) {
            this.board[this.player.row][this.player.col].movePlayerOut();
            this.player.teleport(dr, dc);
        }
        else if(ret == -1) {
            this.board[this.player.row][this.player.col].movePlayerOut();
            this.player.teleport(dr, dc);
            
            events.trigger(this, 'oneOff', 'hitByEnemy');
            this.restart();
        }
        else if(ret == 2) {
            var q = this.board[dr][dc].bumpChest()
            if(q) {
                this.chestQ = this.board[dr][dc];
                this.chestOrder.push(this.chestQ.chestNum);     // Log order of attempt
                this.chestCount[this.chestQ.chestNum] += 1;     // Log attempt at chest
                this.popQuestion(q);
            }
        }
        // Attempting to exit
        else if(this.player.row == this.endR && this.player.col == this.endC && this.keys.length == 3) {
            this.addChild({child: this.keyQuestion});
            this.keyQuestion.set('position', new geo.Point(0 - this.offsetX, 0 - this.offsetY));
            this.keyEnabled = true;
            
            GC.MM.crossFade('bg', 'question', 1);
            
            this.stop();
        }
        
        return ret;
    },
    
    // Makes sure the destination is valid before checking
    movePlayerAssist: function(r, c) {
        if(r == this.endR && c == this.endC && this.keys.length == 3) {
            events.trigger(this, 'oneOff', 'doorApproach');
        }
    
        if(r > -1 && r < this.rowMax && c > -1 && c < this.colMax) {
            return this.board[r][c].movePlayerIn();
        }
        
        return 0;
    },
    
    // Displays a chest question to the player
    popQuestion: function(q) {
        q.refresh();
        q.set('position', new geo.Point(650 - this.offsetX, 0 - this.offsetY));
        this.addChild({child: q});
        
        this.question = q;
    },
    
    // Puts the specified key into they player's keyring
    gainKey: function(k) {
        this.keys.push(k);
        k.reparent(this);
        k.place(this.keyPlacer(this.keys.length-1));
    },
    
    // Returns the coordinates to place the specified key number
    keyPlacer: function(i) {
        if(i == 0) {
            return {x: 725 - this.offsetX, y: 375 - this.offsetY};
        }
        else if(i == 1) {
            return {x: 775 - this.offsetX, y: 425 - this.offsetY};
        }
        else {
            return {x: 825 - this.offsetX, y: 375 - this.offsetY};
        }
    },
    
    // Removes the currently displayed question, if any
    removeQuestion: function() {
        if(this.question) {
            this.removeChild({child: this.question});
            this.chestQ = null;
            this.question = null;
        }
    },
    
    // Moves the specified enemy to the specified destination
    moveEnemy: function(i, dr, dc) {
        this.board[this.enemies[i].row][this.enemies[i].col].moveEnemyOut();
        
        this.enemies[i].teleport(dr, dc);
        
        // Move enemy and check for player collision
        if(this.board[dr][dc].moveEnemyIn() == -1) {
            events.trigger(this, 'oneOff', 'hitByEnemy');
            this.restart();
        }
    },
    
    // Called when the final door question is answered correctly
    onFinalCorrect: function() {
        GC.MM.crossFade('question', 'bg', 1);
    
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this);
        events.trigger(this, 'levelCompleted');
    },
    
    // Called when the final door question is answered wrongly
    onFinalWrong: function() {
    },
    
    // Returns a string with the collected data in XML format
    toXML: function() {
        var t = '    ';
        var string = "";
        
        string += t+t+'<Level ElapsedTime="' + Math.round(this.elapsedTime*100)/100 + '">\n';
        string += t+t+t+'<KeyQuestion ElapsedTime="' + Math.round(this.keyTime*100)/100 + '"/>\n';
        string += t+t+t+'<ChestOrder>\n';
        for(var i=0; i<this.chestOrder.length; i+=1) {
        string += t+t+t+t+'<Chest Num="' + this.chestOrder[i] + '" Order="' + i + '"/>\n';
        }
        string += t+t+t+'</ChestOrder>\n';
        string += t+t+t+'<ChestAttempts>\n';
        for(var i=0; i<this.chestCount.length; i+=1) {
        string += t+t+t+t+'<Chest Num="' + i + '" Count="' + this.chestCount[i] + '"/>\n';
        }
        string += t+t+t+'</ChestAttempts>\n';
        string += t+t+'</Level>\n';
        
        return string;
    },
    
    // Check to see if any enemies need to move and track Level/KeyQuestion time
    update: function(dt) {
        this.elapsedTime += dt;
        if(this.keyEnabled) {
            this.keyTime += dt
        }
        
        if(!this.pauseEnemies) {
            for(var i=0; i<this.enemies.length; i+=1) {
                if(this.enemies[i].checkMove(dt)) {
                    var d = this.enemies[i].getDestination();
                    this.moveEnemy(i, d.row, d.col);
                }
            }
        }
    },
    
    // Checks if mouse input selects a answer to a question
    answerQuestion: function(x, y) {
        var p = this.get('position');
        var lx = x - p.x;
        var ly = y - p.y;
    
        var ret = this.question.processClick(lx, ly);
        // Checks if this MouseUp was on the same button that the original MouseDown was on
        if(this.butRef != ret) {
            var temp = this.butRef;
            this.butRef = -1;
            return temp;
        }
        
        if(ret == -1) {
            return -1;
        }
        
        if(this.question.selectAnswer(ret)) {
            this.chestQ.openChest();
            this.chests += 1;
            
            this.gainKey(this.chestQ.key);
            
            this.removeQuestion();
            
            this.addChild({child: this.rText});
            var that = this;
            setTimeout(function() { that.removeChild({child: that.rText})}, 3000);
            
            events.trigger(this, 'oneOff', 'keyAquired');
        }
        else if(this.question.isHintable()) {
            this.question.hinted = true;
        }
        else {
            this.chestQ.nextQuestion();
            this.removeQuestion();
        }
        
        return ret;
    },
    
////////  Mouse Event Handlers  /////////////////////////////////////////////////////////////////////////////
    
    // Processes Mouse Down event
    processMouseDown: function(x, y) {
        var p = this.get('position');
        var lx = x - p.x;
        var ly = y - p.y;
    
        // Chest question input
        if(this.question) {
            this.butRef = this.question.processClick(lx, ly);
            return this.butRef;
        }
        // KeyQuestion input
        else if(this.keyEnabled) {
            this.drag = this.keyQuestion.processMouseDown(x, y);
            if(this.drag) {
                this.drag.reparent(this);
                return -1;
            }
            
            if(400 < y && y < 450) {
                if(700 < x && x < 750 && this.keys[0] != null) {
                    this.dragFrom = 0;
                    this.drag = this.keys[0];
                }
                else if(800 < x && x < 850 && this.keys[2] != null) {
                    this.dragFrom = 2;
                    this.drag = this.keys[2];
                }
            }
            else if(450 < y && y < 500) {
                if(750 < x && x < 800 && this.keys[1] != null) {
                    this.dragFrom = 1;
                    this.drag = this.keys[1];
                }
            }
        }
        
        return -1;
    },
    
    // Processes Mouse Up events
    processMouseUp: function(x, y, pMove) {
        // Chest question input
        if(this.question) {
            return this.answerQuestion(x, y)
        }
        // KeyQuestion input
        else if(this.keyEnabled) {
            var ret = this.keyQuestion.processMouseUp(x, y);
            
            // Dragged Key from keyring to KeyQuestion
            if(ret > -1 && this.keyQuestion.active != ret) {
                if(this.dragFrom > -1) {
                    ret = this.keyQuestion.place(this.drag, -1, ret);
                    if(ret != null) {
                        this.keys[this.dragFrom] = ret;
                        ret.reparent(this);
                        ret.place(this.keyPlacer(this.dragFrom));
                    }
                    this.dragFrom = -1;
                }
                // Dragged Key around inside KeyQuestion
                else if(this.keyQuestion.active > -1) {
                    this.keyQuestion.place(this.drag, this.keyQuestion.active, ret);
                    this.keyQuestion.active = -1;
                }
                
                this.drag = null;
            }
            // Dropped key in a non slotted location
            else if(this.drag != null) {
                if(this.dragFrom > -1) {
                    this.dragFrom = -1;
                }
                else if(this.keyQuestion.active > -1) {
                    this.keyQuestion.active = -1;
                }
            
                this.drag.reset();
                this.drag = null;
            }
        }
        // Click based movement resolution
        else if(pMove) {
            var p = this.get('position');
            var lx = x - p.x - this.player.col * 50 - 25;
            var ly = y - p.y - this.player.row * 50 - 25;
            
            if(-75 < lx && lx < -25 && -25 < ly && ly < 25) {
                this.movePlayer(0, -1);
            }
            else if(25 < lx && lx < 75 && -25 < ly && ly < 25) {
                this.movePlayer(0, 1);
            }
            else if(-25 < lx && lx < 25 && -75 < ly && ly < -25) {
                this.movePlayer(-1, 0);
            }
            else if(-25 < lx && lx < 25 && 25 < ly && ly < 75) {
                this.movePlayer(1, 0);
            }
        }
        
        return -1;
    },
    
    // Processes Mouse Up events
    processMouseDrag: function(x, y) {
        if(this.drag) {
            var p = this.get('position');
            var lx = x - p.x;
            var ly = y - p.y;
        
            this.drag.set('position', new geo.Point(lx, ly));
        }
    }
});

Level.Level1 = {rowMax: 7, colMax: 9, startR: 3, startC: 6, endR: 3, endC: 0, offsetX: 100, offsetY: 50, image: '/resources/level01.png',
    enemies: [],
    collision: 
    [[0,0,0,0,0,1,3,0,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[0,0,1,1,1,1,0,0,0]
    ,[0,0,0,0,0,0,0,1,0]
    ,[0,0,1,3,1,0,0,0,0]
    ,[0,0,0,0,0,0,0,0,0]
    ,[0,0,1,1,1,4,1,1,1]],
    introText:
    [
        ["Oh!  A few details I forgot"],
        ["If you walk up to the treasure",
         "chests they'll display the",
         "question for you to answer",
         "to get the key."]
    ],
    keyQuestion: ['Drag your keys to the empty spaces and place them in the correct order to make a true statement.'],
    questions:
    [
        {   key: '>', order: 1,
            q: [
                {qText: ['Which is greater than?'], choices: ['>', '<', '~']},
                {qText: ['Which is less than?'], choices: ['<', '>', '~']},
                {qText: ['What does ">" mean?'], choices: ['Greater than', 'Equal to', 'Less than']}
            ]
        },
        {   key: '2', order: 2,
            q: [
                {qText: ['If you had two cups of tea,','and Great Auntie had more.','How many could she have had?'], choices: ['3', '2', '1']},
                {qText: ['The table is 3 wide.','The bookshelf is 5 wide.',"What's in between?"], choices: ['4', '3', '5']},
                {qText: ['You had two crumpets today.','Your Great Aunt had 7!','Which amount could be','the total number of starting crumpets?'], choices: ['9', '7', '5']}
            ]
        },
        {   key: '5', order: 0,
            q: [
                {qText: ['x < 7','x = ?'], choices: ['6', '8', '10']},
                {qText: ['8 < x','x = ?'], choices: ['12', '7', '3']},
                {qText: ['3 < x < 10','x = ?'], choices: ['6', '2', '13']}
            ]
        },
    ]
}

Level.Level2 = {rowMax: 7, colMax: 10, startR: 3, startC: 9, endR: 0, endC: 2, offsetX: 50, offsetY: 50, image: '/resources/level02.png',
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
            delay: 1.0, type: 3, pathDir: 1, pathLoop: true,
            path:
            [{row: 1, col: 0}, {row: 2, col: 0}, {row: 2, col: 1}, {row: 3, col: 1}, {row: 4, col: 1}, {row: 5, col: 1},
             {row: 5, col: 0}, {row: 5, col: 1}, {row: 6, col: 1}, {row: 6, col: 2}, {row: 5, col: 2}, {row: 5, col: 3},
             {row: 5, col: 4}, {row: 6, col: 4}, {row: 6, col: 5}, {row: 5, col: 5}, {row: 5, col: 6}, {row: 5, col: 7},
             {row: 6, col: 7}, {row: 6, col: 8}, {row: 5, col: 8}, {row: 4, col: 8}, {row: 3, col: 8}, {row: 3, col: 9},
             {row: 3, col: 8}, {row: 2, col: 8}, {row: 1, col: 8}, {row: 0, col: 8}, {row: 1, col: 8}, {row: 1, col: 7},
             {row: 1, col: 6}, {row: 1, col: 5}, {row: 1, col: 4}, {row: 1, col: 3}, {row: 0, col: 3}, {row: 0, col: 2},
             {row: 0, col: 1}, {row: 0, col: 0}]
        }
    ],
    collision: 
    [[0,0,0,0,1,1,1,1,4,1]
    ,[0,0,0,0,0,0,0,0,0,1]
    ,[0,0,0,0,0,0,0,0,0,1]
    ,[1,0,1,1,3,1,1,0,0,0]
    ,[1,0,1,1,1,1,1,0,0,1]
    ,[0,0,0,0,0,0,0,0,0,1]
    ,[1,4,0,1,0,0,1,0,0,1]],
    introText: 
    [
        ["Oh, dearie! I forgot to mention two",
         "things! My house has some...",
         "technical...modifications."],
        ['Also, the house is "haunted" with a',
         "few of my...err...don't let one of",
         "them touch you or... just don't."]
    ],
    keyQuestion: ['Drag your keys to the empty spaces and place them in the correct order to make a true statement.'],
    questions:
    [
        {   key: '45', order: 2,
            q: [
                {qText: ['Three monsters in this room,','zero in the previous.','Which number is in between?'], choices: ['2', '5', '-1']},
                {qText: ['The Angler bounces off things','at an angle.  The angle','is somewhere between 0 and 90.','What angle is it?'], choices: ['45', '125', '180']},
                {qText: ['Your Great Aunt sure has a lot','of plates!  Last you counted, she','had somewhere between 15 and 25.','Which could be the','number of plates she owns?'], choices: ['21', '14', '28']}
            ]
        },
        {   key: '<', order: 1,
            q: [
                {qText: ['5 > x + 2'], choices: ['1', '5', '7']},
                {qText: ['25 < x - 7'], choices: ['33', '18', '21']},
                {qText: ['17 < 13 + x'], choices: ['7', '4', '2']}
            ]
        },
        {   key: '25', order: 0,
            q: [
                {qText: ['3 < x - 5'], choices: ['9', '8', '3']},
                {qText: ['x + 9 < 12'], choices: ['2', '3', '6']},
                {qText: ['9 - x > 6'], choices: ['1', '3', '5']}
            ]
        },
    ]
}

Level.Level3 = {rowMax: 9, colMax: 12, startR: 6, startC: 11, endR: 2, endC: 5, offsetX: 0, offsetY: 0, image: '/resources/level03.png',
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
            delay: 1.5, type: 2, pathDir: 1, pathLoop: true,
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
    ,[1,1,0,0,0,0,0,1,1,1,0,0]
    ,[4,0,0,0,0,0,1,1,1,1,1,1]],
    introText:
    [
        ['Woah! Three "ghosts".',
         "Maybe I should call someone..."]
    ],
    keyQuestion: ['You know what to do! Order those keys to a true statement!'],
    questions:
    [
        {   key: '9', order: 0,
            q: [
                {qText: ['x - 6 > 9'], choices: ['17', '14', '11']},
                {qText: ['x + 3 > 5'], choices: ['5', '2', '1']},
                {qText: ['4 - x > 1'], choices: ['2', '4', '8']}
            ]
        },
        {   key: '>', order: 1,
            q: [
                {qText: ['1 < x - 7'], choices: ['10', '7', '4']},
                {qText: ['x - 7 > 1'], choices: ['9', '8', '7']},
                {qText: ['10 - x > 2'], choices: ['7', '11', '15']}
            ]
        },
        {   key: '5', order: 2,
            q: [
                {qText: ['9 > x > 4'], choices: ['7', '3', '1']},
                {qText: ['4 < x < 9'], choices: ['5', '1', '13']},
                {qText: ['12 > x > 7'], choices: ['9', '14', '3']}
            ]
        },
    ]
}

Level.Level4 = {rowMax: 6, colMax: 8, startR: 5, startC: 5, endR: 1, endC: 0, offsetX: 100, offsetY: 50, image: '/resources/level04.png',
    enemies:
    [
        {
            delay: 1.0, type: 1, pathDir: 1, pathLoop: true,
            path:
            [{row: 2, col: 2}, {row: 2, col: 1}, {row: 2, col: 0}, {row: 3, col: 0}, {row: 4, col: 0},
             {row: 4, col: 1}, {row: 4, col: 2}, {row: 4, col: 3}, {row: 4, col: 4},
             {row: 4, col: 5}, {row: 4, col: 6}, {row: 4, col: 7}, {row: 3, col: 7}, {row: 2, col: 7},
             {row: 2, col: 6}, {row: 2, col: 5}, {row: 2, col: 4}, {row: 2, col: 3}]
        },
        {
            delay: 1.0, type: 3, pathDir: 1, pathLoop: true,
            path:
            [{row: 2, col: 0}, {row: 3, col: 0}, {row: 4, col: 0}, {row: 5, col: 0}, {row: 5, col: 1}, {row: 5, col: 2},
             {row: 5, col: 3}, {row: 4, col: 3}, {row: 4, col: 4}, {row: 4, col: 5}, {row: 5, col: 5}, {row: 4, col: 5},
             {row: 4, col: 6}, {row: 4, col: 7}, {row: 5, col: 7}, {row: 4, col: 7}, {row: 3, col: 7}, {row: 2, col: 7},
             {row: 2, col: 6}, {row: 1, col: 6}, {row: 1, col: 5}, {row: 1, col: 4}, {row: 1, col: 3}, {row: 1, col: 2},
             {row: 0, col: 2}, {row: 0, col: 1}, {row: 0, col: 0}, {row: 1, col: 0}]
        }
    ],
    collision: 
    [[0,0,0,1,1,1,1,1]
    ,[0,0,0,0,4,2,0,1]
    ,[0,0,0,0,0,0,0,0]
    ,[0,1,1,1,1,1,1,0]
    ,[0,0,0,0,0,0,0,0]
    ,[0,2,0,4,1,0,1,4]],
    introText:
    [   
        ['Oh, hey, "safe" spots!',
         "If you stand on one of those,",
         "the ghosts don't effect you.",
         "",
         "That's handy!"]
    ],
    keyQuestion: ['Do it!'],
    questions:
    [
        {   key: '-5', order: 2,
            q: [
                {qText: ['1 < (x + 2) < 7'], choices: ['4', '7', '-2']},
                {qText: ['6 > (x - 0) -6'], choices: ['3', '8', '-10']},
                {qText: ['13 < (x + 8) < 33'], choices: ['13', '4', '30']}
            ]
        },
        {   key: '<', order: 1,
            q: [
                {qText: ['-5 > x'], choices: ['-9', '-3', '0']},
                {qText: ['-10 < x'], choices: ['1', '-11', '-15']},
                {qText: ['-15 > x'], choices: ['-20', '-15', '-10']}
            ]
        },
        {   key: '-15', order: 0,
            q: [
                {qText: ['2x > 9'], choices: ['5', '3', '4']},
                {qText: ['5x < 15'], choices: ['2', '3', '4']},
                {qText: ['7x < 25'], choices: ['3', '5', '7']}
            ]
        },
    ]
}

Level.Level5 = {rowMax: 9, colMax: 12, startR: 4, startC: 10, endR: 0, endC: 10, offsetX: 0, offsetY: 0, image: '/resources/level05.png',
    enemies:
    [
        {
            delay: 1.5, type: 1, pathDir: 1, pathLoop: false,
            path:
            [{row: 4, col: 1}, {row: 4, col: 2}, {row: 4, col: 3}, {row: 4, col: 4}, {row: 3, col: 4}, {row: 2, col: 4},
             {row: 1, col: 4}, {row: 0, col: 4}, {row: 0, col: 3}, {row: 0, col: 2}, {row: 0, col: 1}]
        },
        {
            delay: 2.5, type: 2, pathDir: 1, pathLoop: true,
            path:
            [{row: 5, col: 2}, {row: 6, col: 3}, {row: 7, col: 4}, {row: 8, col: 3}, {row: 7, col: 4}, {row: 6, col: 3}, {row: 5, col: 2}, {row: 4, col: 1}]
        },
        {
            delay: 2.5, type: 4, pathDir: 1, pathLoop: false,
            path:
            [{row: 4, col: 7}, {row: 3, col: 7}, {row: 2, col: 7}, {row: 1, col: 7}, {row: 0, col: 7},]
        }
    ],
    collision: 
    [[1,4,0,0,0,1,1,4,1,0,0,1]
    ,[1,1,1,1,0,0,0,0,1,0,0,0]
    ,[1,1,1,1,0,0,0,0,1,0,0,0]
    ,[1,1,1,1,0,0,0,0,0,0,0,0]
    ,[1,0,0,0,0,0,0,0,1,0,0,0]
    ,[0,0,0,0,0,0,1,1,1,1,1,1]
    ,[0,0,0,0,0,1,1,1,1,1,1,1]
    ,[1,1,0,0,0,3,1,1,1,1,1,1]
    ,[1,1,1,0,0,1,1,1,1,1,1,1]],
    introText:
    [
        ["Wow! They're everywhere!",
         "At least you're at the front door.",
         "Now grab those keys!"]
    ],
    keyQuestion: ['Last one! Time to break out of those constraints!'],
    questions:
    [
        {   key: '1 / 2', order: 2,
            q: [
                {qText: ['x / 5 < 0.5'], choices: ['2', '4', '5']},
                {qText: ['x / 6 > 0.6'], choices: ['5', '3', '2']},
                {qText: ['2 / x > 0.5'], choices: ['3', '4', '5']}
            ]
        },
        {   key: '<', order: 1,
            q: [
                {qText: ['0.4 > x / 3'], choices: ['1', '2', '3']},
                {qText: ['0.7 < x / 4'], choices: ['3', '2', '1']},
                {qText: ['0.6 > x / 2'], choices: ['1', '2', '3']}
            ]
        },
        {   key: '1 / 3', order: 0,
            q: [
                {qText: ['x / 6 > 1 / 3'], choices: ['3', '2', '1']},
                {qText: ['x / 3 < 2 / 4'], choices: ['1', '2', '3']},
                {qText: ['x / 2 < 3 / 4'], choices: ['1', '2', '3']}
            ]
        },
    ]
}

exports.Level = Level