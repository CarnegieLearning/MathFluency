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

// Project imports
var Key = require('Key').Key;
var Tile = require('Tile').Tile;
var Question = require('Question').Question;

// A special Tile that contains a chest
var Chest = Tile.extend({
    locked  : true,     // True if chest is currently locked/unopened
    passable: false,    // True if chest is on the ground, allows player to pass through the Chest once unlocked
    
    key     : null,     // Hold the key the player receives for answering the chest's question successfully
    
    questions   : null, // Array of questions available for this chest
    curQuestion : -1,   // Array index of the next question to be asked

    chestNum: -1,       // Identifies the chest
    
    init: function(val, questions, n) {
        Chest.superclass.init.call(this);
        
        this.questions = []
        for(var i=0; i<questions.q.length; i+=1) {
            this.questions.push(Question.create(questions.q[i]));
        }
        this.curQuestion = Math.floor(Math.random() * this.questions.length);
        
        this.key = Key.create({string: questions.key, fontColor: '#000000', order: questions.order});
        
        this.sprite_close = cocos.nodes.Sprite.create({file: '/resources/treasureChest.png'});
        this.sprite_open = cocos.nodes.Sprite.create({file: '/resources/treasureChestOpen.png'});
        this.addChild({child: this.sprite_close});
        
        this.chestNum = n;
        
        if(val == 4) {
            this.passable = true;
        }
        
        this.collision = true;
    },
    
    // Handles the player attempting to move onto the chest
    movePlayerIn: function() {
        if(this.locked) {
            return 2;
        }
        else if(this.passable) {
            this.playerBit = true;
            
            if(this.enemyCount > 0 && !this.safetyZone) {
                return -1;
            }
            
            return 1;
        }
        
        return 0;
    },
    
    // Handles colliding with the chest
    bumpChest: function() {
        if(this.locked) {
            return this.questions[this.curQuestion];
        }
        return false;
    },
    
    // Queues the next question in line for the chest
    nextQuestion: function() {
        this.curQuestion += 1;
        if(this.curQuestion >= this.questions.length) {
            this.curQuestion = 0;
        }
    },
    
    // Opens the chest
    openChest: function() {
        if(this.locked) {
            this.removeChild({child: this.sprite_close});
            this.addChild({child: this.sprite_open});
            this.locked = false;
        }
        return false;
    },
    
    // Closes the chest
    closeChest: function() {
        if(!this.locked) {
            this.removeChild({child: this.sprite_open});
            this.addChild({child: this.sprite_close});
            this.locked = true;

            this.nextQuestion();
            
            return true;
        }
        return false;
    },
});

exports.Chest = Chest;