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
    
    communicator: null,     // Holds the image of the communicator
    hud         : null,     // Contains the image of the HUD
    buttons     : null,     // List of unpressed button sprites for communicator
    buttonsP    : null,     // List of pressed button sprites for communicator
    
    tm          : null,     // Holds the instance of the TextManager
    
    playerMove  : true,     // When true, allows the player to move their character
    started     : false,    // True if the game is on level 1
    finished    : false,    // True if the game has run out of levels

    elapsedTime : 0,        // Elapsed time for the overall game in seconds
    
    oneOffs     : null,
    
    init: function(xml) {
        Game.superclass.init.call(this);
        
        // Create the list of availible levels
        this.levels = [
            //Level.create(Level.Level1),
            Level.create(Level.Level2),
            Level.create(Level.Level3),
            Level.create(Level.Level4),
            Level.create(Level.Level5)];
        
        // Displays the communicator pane
        this.communicator = cocos.nodes.Sprite.create({file: '/resources/comm.jpg'});
        this.communicator.set('anchorPoint', new geo.Point(0, 0));
        this.communicator.set('position', new geo.Point(650, 50));
        this.communicator.set('zOrder', 1);
        this.addChild({child: this.communicator});
        
        // Buttons for the communication device
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
        this.hud.set('anchorPoint', new geo.Point(0, 0));
        this.addChild({child: this.hud});
        
        // Holds the instance of the TextManager for popup dialog
        this.tm = TextManager.create();
        events.addListener(this.tm, 'dialogComplete', this.onDialogComplete.bind(this));
        this.tm.set('zOrder', 3);
        this.addChild({child: this.tm});
        
        // Defining single fire event text boxes
        this.oneOffs = {};
        var t1, t2;
        
        // Getting a key
        t2 = TextBox.create({}, "I'd suggest you get the other 2 keys first, but it's up to you!", 250, 200, '/resources/green.png', null);
        t2.set('position', new geo.Point(650, 50));
        
        t1 = TextBox.create({}, 'Congratulations on your first key! Another detail: the exit door is marked in red.', 250, 200, '/resources/green.png', t2);
        t1.set('position', new geo.Point(650, 50));
        
        this.oneOffs['keyAquired'] = t1;
        
        // Approaching the level door
        t1 = TextBox.create({}, 'Um... this looks more complicated than the others. Do you hear something ticking?', 250, 200, '/resources/green.png', null);
        t1.set('position', new geo.Point(650, 50));
        
        this.oneOffs['doorApproach'] = t1;
        
        // Hit by enemy
        t2 = TextBox.create({}, "Thankfully it didn't hurt you, but it looks like all your keys are scrambled. You'll have to go collect those keys from the treasure boxes again.", 250, 200, '/resources/green.png', null);
        t2.set('position', new geo.Point(650, 50));
        
        t1 = TextBox.create({}, 'Oh, no! It looks like you ran into one of my... I mean, a ghost!', 250, 200, '/resources/green.png', t2);
        t1.set('position', new geo.Point(650, 50));
        
        this.oneOffs['hitByEnemy'] = t1;
    },
    
    // Unloads the current level (if any) and then loads the specified level
    loadLevel: function(i) {
        // Special first level case, nothing exsisting to remove
        if(this.currentLevel != -1) {
            this.removeChild({child: this.levels[this.currentLevel]});
        }
        
        // Only load a level that exists
        if(-1 < i && i < this.levels.length) {
            this.currentLevel = i;
            this.addChild({child: this.levels[i]});
            
            events.addListener(this.levels[i], 'levelCompleted', this.nextLevel.bind(this));
            events.addListener(this.levels[i], 'dialogPop', this.onDialogPop.bind(this));
            events.addListener(this.levels[i], 'oneOff', this.onOneOff.bind(this));
            this.levels[i].boot();
            
            return true;
        }
        
        // There was no valid level to load
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
        if(this.playerMove && this.currentLevel > -1) {
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
        
        this.introSprite = cocos.nodes.Sprite.create({file: '/resources/intro.jpg'});
        this.introSprite.set('anchorPoint', new geo.Point(0, 0));
        this.introSprite.set('zOrder', 2);
        this.addChild({child: this.introSprite});
    },
    
    // Track overall game running time
    update: function(dt) {
        this.elapsedTime += dt;
    },
    
    // Returns a string with the collected data in XML format
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
    
    // Depresses a button on the communication device
    buttonDown: function(i) {
        if(-1 < i && i < 3) {
            this.removeChild({child: this.buttons[i]})
            this.addChild({child: this.buttonsP[i]})
        }
    },
    
    // Releases a button on the communication device
    buttonUp: function(i) {
        if(-1 < i && i < 3) {
            this.removeChild({child: this.buttonsP[i]})
            this.addChild({child: this.buttons[i]})
        }
    },
    
////////  Mouse Event Handlers  /////////////////////////////////////////////////////////////////////////////
    
    // Processes MouseDown events
    processMouseDown: function(x, y) {
        if(this.tm.processClick(x, y)) {
            return;
        }
        else if(this.levels[this.currentLevel]) {
            this.buttonDown(this.levels[this.currentLevel].processMouseDown(x, y));
        }
    },
    
    // Processes MouseUp events
    processMouseUp: function(x, y) {
        if(this.levels[this.currentLevel]) {
            this.buttonUp(this.levels[this.currentLevel].processMouseUp(x, y, this.playerMove));
        }
    },
    
    // Processes MouseDrag events
    processMouseDrag: function(x, y) {
        if(this.levels[this.currentLevel]) {
            this.levels[this.currentLevel].processMouseDrag(x, y);
        }
    },
    
////////  Text Manager Event Handlers  /////////////////////////////////////////////////////////////////////
    
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
            GC.MM.getSound('question').setVolume(0);
            GC.MM.loopSound('question');
            
            this.removeChild({child: this.introSprite});
            
            events.trigger(this, 'endIntro');
        }
    },
    
    // Handles when levels want to pop up dialog
    onDialogPop: function(tb) {
        this.playerMove = false;
        this.levels[this.currentLevel].stop();
        
        this.tm.displayTextBox(tb);
    },
    
    onOneOff: function(evt) {
        if(this.oneOffs.hasOwnProperty(evt) && this.oneOffs[evt] != null) {
            this.onDialogPop(this.oneOffs[evt]);
            this.oneOffs[evt] = null;
        }
    }
});

// Text for the introduction sequence
Game.introText = [
    "You've been visiting your Great Aunt in her huge, creaky mansion all weekend.",
    "While you sit and have tea with her, she tells you stories of her youth (again). However, right before you start wondering about what your friends are doing at the moment, something she says catches your ear.",
    "With a glint in her eye, she tells you she set up a challenge for you this weekend. Hidden throughout the mansion are boxes, locked by logic, containing the key out. The doors of the house only open if you use the correct keys.",
    "You realize what she just told you: she's locked you in! \n She asks if you're up for the challenge.",
    "Is that even a question?",
    "Good Luck!"
]

exports.Game = Game;