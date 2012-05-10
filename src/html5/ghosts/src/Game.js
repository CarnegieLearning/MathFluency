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
var TextBox = require('TextBox').TextBox;
var TextManager = require('TextManager').TextManager;
var GC = require('GhostsControl').GhostsControl;

var Game = cocos.nodes.Node.extend({
    levels      : null,     // Contains a list of levels in the game
    
    currentLevel: -1,       // The index of the current level
    
    playerMove  : true,     // When true, allows the player to move their character
    started     : false,    // True if the game is on level 1
    finished    : false,    // True if the game has run out of levels

    elapsedTime : 0,        // Elapsed time for the overall game in seconds
    
    init: function(xml) {
        Game.superclass.init.call(this);
        
        // Create the list of availible levels
        this.levels = [
            Level.create(Level.Level1),
            Level.create(Level.Level2),
            Level.create(Level.Level3),
            Level.create(Level.Level4),
            Level.create(Level.Level5)];
        
        this.communicator = cocos.nodes.Sprite.create({file: '/resources/comm.jpg'});
        this.communicator.set('anchorPoint', new geo.Point(0, 0));
        this.communicator.set('position', new geo.Point(650, 50));
        this.communicator.set('zOrder', 1);
        this.addChild({child: this.communicator});
        
        this.buttons = [];
        this.buttonsP = [];
        for(var i=0; i<3; i+=1) {
            this.buttons.push(cocos.nodes.Sprite.create({file: '/resources/button_norm.png'})),
            this.buttons[i].set('position', new geo.Point(700 + 75*i, 300));
            this.buttons[i].set('zOrder', 1);
            this.addChild({child: this.buttons[i]});
            
            this.buttonsP.push(cocos.nodes.Sprite.create({file: '/resources/button_down.png'})),
            this.buttonsP[i].set('position', new geo.Point(700 + 75*i, 300));
            this.buttonsP[i].set('zOrder', 1);
        }
        
        this.hud = cocos.nodes.Sprite.create({file: '/resources/HUD.png'});
        this.hud.set('anchorPoint', new geo.Point(0, 0))
        this.addChild({child: this.hud});
        
        this.tm = TextManager.create();
        events.addListener(this.tm, 'dialogComplete', this.onDialogComplete.bind(this));
        this.tm.set('zOrder', 3);
        this.addChild({child: this.tm});
    },
    
    // Unloads the current level (if any) and then loads the specified level
    loadLevel: function(i) {
        if(this.currentLevel != -1) {
            this.removeChild({child: this.levels[this.currentLevel]});
        }
        
        if(-1 < i && i < this.levels.length) {
            this.currentLevel = i;
            this.addChild({child: this.levels[i]});
            
            events.addListener(this.levels[i], 'levelCompleted', this.nextLevel.bind(this));
            events.addListener(this.levels[i], 'dialogPop', this.onDialogPop.bind(this));
            this.levels[i].boot();
            
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
            console.log('gg');
            this.finished = true;
            cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this);
            events.trigger(this, 'endOfGame');
        }
    },
    
    // Have the current level move the player by the specified delta
    movePlayer: function(deltaR, deltaC) {
        if(this.playerMove) {
            this.levels[this.currentLevel].movePlayer(deltaR, deltaC)
        }
    },
    
    // Starts the game
    start: function() {
        var list = [];
        for(var i=Game.introText.length-1; i>=0; i-=1) {
            list.push(TextBox.create({}, Game.introText[i], 400, 200, '/resources/green.png', ((i<Game.introText.length-1) ? list[list.length-1] : null)));
            list[list.length-1].set('position', new geo.Point(250, 200));
        }
        
        this.tm.displayTextBox(list[list.length-1]);
        GC.MM.playSound('intro');
    },
    
    update: function(dt) {
        this.elapsedTime += dt;
    },
    
    toXML: function() {
        var t = '    ';
        var string = '';
        
        string += t+'<Game ElapsedTime="' + Math.round(this.elapsedTime*100)/100 + '">\n';
        for(var i=0; i<this.levels.length; i+=1) {
        string += this.levels[i].toXML();
        }
        string += '</Game>\n';
        
        return string;
    },
    
    // Processes MouseDown events
    processMouseDown: function(x, y) {
        if(this.tm.processClick(x, y)) {
            return;
        }
        else if(this.levels[this.currentLevel]) {
            this.levels[this.currentLevel].processMouseDown(x, y);
        }
    },
    
    // Processes MouseUp events
    processMouseUp: function(x, y) {
        if(this.levels[this.currentLevel]) {
            this.levels[this.currentLevel].processMouseUp(x, y);
        }
    },
    
    // Processes MouseDrag events
    processMouseDrag: function(x, y) {
        if(this.levels[this.currentLevel]) {
            this.levels[this.currentLevel].processMouseDrag(x, y);
        }
    },
    
    onButtonDown: function() {
    },
    
    onButtonUp: function() {
    },
    
    // Handles dialog completion event
    onDialogComplete: function() {
        if(this.started) {
            this.playerMove = true;
            this.levels[this.currentLevel].start();
        }
        else {
            this.started = true;
            this.scheduleUpdate();
            this.nextLevel();
            
            GC.MM.stopSound('intro');
            GC.MM.loopSound('bg');
        }
    },
    
    // Handles when levels want to pop up dialog
    onDialogPop: function(tb) {
        this.playerMove = false;
        this.levels[this.currentLevel].stop();
        
        this.tm.displayTextBox(tb);
    }
});

// Text for the introduction sequence
Game.introText = [
    [
        "You've been visiting your Great Aunt",
        "in her huge, creaky mansion all weekend."
    ],
    [
        "While you sit and have tea with her,",
        "she tells you stories of her youth (again).",
        "However, right before you start wondering",
        "about what your friends are doing at the moment,",
        "something she says catches your ear."
    ],
    [
        "With a glint in her eye, she tells you",
        "she set up a challenge for you this weekend.",
        "Hidden throughout the mansion are boxes,",
        "locked by logic, containing the key out.",
        "The doors of the house only open if you",
        "use the correct keys."
    ],
    [
        "You realize what she just told you:",
        "she's locked you in!",
        "",
        "She asks if you're up for the challenge."
    ],
    [
        "Is that even a question?"
    ],
    [
        "Good Luck!"
    ]
]

exports.Game = Game;