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

// Engine imports
var cocos = require('cocos2d');
var geo = require('geometry');
var events = require('events');

// Static imports
var NLC = require('NumberLineControl').NumberLineControl;

var HUD = cocos.nodes.Node.extend({
    elapsed     : 0,        // Amount of time elapsed
    paused      : true,     // Stores if the countdown timer is paused
    timeLeft    : null,     // Amount of time remaining in the stage (null if N/A)
    timeLabel   : null,     // Stores the Label responsible for showing time remaining
    
    score       : 0,        // The player's current score
    scoreLabel  : null,     // Stores the Label responsible for showing score
    
    qTime       : null,     // Time remaining for current question (null if N/A)
    qTimeMax    : null,     // Initial time for current question (null if N/A)
    qTimePause  : false,    // Pauses the individual question timer
    
    itemsCount  : 0,        // 
    
    textG       : null,     // Holds green numbers
    textR       : null,     // Holds red numbers
    
    // Constructor
    init: function () {
        // Always call the superclass constructor
        HUD.superclass.init.call(this);
        
        // Set up the time remaining label
        this.timeLabel = cocos.nodes.Label.create({string: ''})
        this.timeLabel.set('position', new geo.Point(550, 60));
        this.timeLabel.set('zOrder', 3);
        this.addChild({child: this.timeLabel});
        
        // Set up the score label
        this.scoreLabel = cocos.nodes.Label.create({string: '0'});
        this.scoreLabel.set('position', new geo.Point(750, 60));
        this.scoreLabel.set('zOrder', 3);
        this.addChild({child: this.scoreLabel});
        
        this.onQuestionTimerStart = this.onQuestionTimerStart.bind(this);
        this.onBeforeNextQuestion = this.onBeforeNextQuestion.bind(this);
        
        var dir = '/resources/General_Wireframe/Window/Window_MedalStatus/';
        // Medal meter frame
        this.medalWindow = cocos.nodes.Sprite.create({file: dir + 'Window_MedalStatus_Frame.png'});
        this.medalWindow.set('position', new geo.Point(HUD.MedalMeterX, 0));
        this.medalWindow.set('anchorPoint', new geo.Point(0, 0));
        this.medalWindow.set('scaleY', 0.9);
        this.medalWindow.set('zOrder', 1);
        this.addChild({child: this.medalWindow});
        
        // Medal meter needle
        this.medalArrow = cocos.nodes.Sprite.create({file: dir + 'Window_MedalStatus_Needle.png'});
        this.medalArrow.set('position', new geo.Point(HUD.MedalMeterX+15, 102));
        this.medalArrow.set('zOrder', 2);
        this.addChild({child: this.medalArrow});
        
        dir = '/resources/General_Wireframe/Window/';
        // Current target frame
        this.targetWindow = cocos.nodes.Sprite.create({file: dir + 'Window_Target.png'});
        this.targetWindow.set('position', new geo.Point(315, 5));
        this.targetWindow.set('anchorPoint', new geo.Point(0, 0));
        this.addChild({child: this.targetWindow});
        
        // Current score frame
        this.scoreWindow = cocos.nodes.Sprite.create({file: dir + 'Window_Score.png'});
        this.scoreWindow.set('position', new geo.Point(650, 5));
        this.scoreWindow.set('anchorPoint', new geo.Point(0, 0));
        this.addChild({child: this.scoreWindow});
        
        // Items gained frame
        this.itemsGWindow = cocos.nodes.Sprite.create({file: dir + 'Window_ItemsGained.png'});
        this.itemsGWindow.set('position', new geo.Point(5, 5));
        this.itemsGWindow.set('anchorPoint', new geo.Point(0, 0));
        this.itemsGWindow.set('scaleY', 0.9);
        this.addChild({child: this.itemsGWindow});
        
        // Items remaining frame
        this.itemsLWindow = cocos.nodes.Sprite.create({file: dir + 'Window_ItemsLeft.png'});
        this.itemsLWindow.set('position', new geo.Point(5, 5));
        this.itemsLWindow.set('anchorPoint', new geo.Point(0, 0));
        this.itemsLWindow.set('scaleY', 0.9);
        
        // Time remaining frame (digital format)
        this.timerWindow = cocos.nodes.Sprite.create({file: dir + 'Window_Time/Window_Time_Digital.png'});
        this.timerWindow.set('position', new geo.Point(480, 5));
        this.timerWindow.set('anchorPoint', new geo.Point(0, 0));
        this.timerWindow.set('scaleY', 0.9);
        this.addChild({child: this.timerWindow});
        
        // Load image based numbers
        var dir1 = '/resources/General_Wireframe/Numbers_Green/'
        var dir2 = '/resources/General_Wireframe/Numbers_Red/'
        this.textG = [];
        this.textR = [];
        for(var i=0; i<10; i+=1) {
            this.textG.push(cocos.nodes.Sprite.create({file: dir1 + 'NumG_' + i + '.png'}));
            this.textR.push(cocos.nodes.Sprite.create({file: dir2 + 'NumR_' + i + '.png'}));
        }
        this.textG.push(cocos.nodes.Sprite.create({file: dir1 + 'NumG_neg.png'}));
        this.textR.push(cocos.nodes.Sprite.create({file: dir2 + 'NumR_neg.png'}));
        
    },
    
    delayedInit: function() {
        var dir = '/resources/General_Wireframe/Window/Window_MedalStatus/Window_MedalStatus_';
        this.metalTextures = [
            cocos.nodes.Sprite.create({file: dir + 'Gold.png'}),
            cocos.nodes.Sprite.create({file: dir + 'Silver.png'}),
            cocos.nodes.Sprite.create({file: dir + 'Bronze.png'}),
            cocos.nodes.Sprite.create({file: dir + 'None.png'}),
        ]
        
        var y = 0;
        for(i=0; i<4; i+=1) {
            this.scaleTo(this.metalTextures[i], 90, NLC.proportions[i] * 93)
            this.metalTextures[i].set('position', new geo.Point(HUD.MedalMeterX+5, y+10));
            this.metalTextures[i].set('anchorPoint', new geo.Point(0, 0));
            this.metalTextures[i].set('zOrder', -1);
            this.addChild({child: this.metalTextures[i]});
            
            y += NLC.proportions[i] * 92;
        }
    },
    
    scaleTo: function(s, x, y) {
        var c = s.get('contentSize');
        s.set('scaleX', x / c.width);
        s.set('scaleY', y / c.height);
    },
    
    // Called every frame
    update: function(dt) {
        // Runs stage timer
        if(!this.paused) {
            if(this.timeLeft != null) {
                this.elapsed += dt;
                this.timeLeft -= dt;
                
                // Checks to see if stage timer has run out
                if(this.timeLeft < 0) {
                    this.timeLeft = 0;
                    this.timeLabel.set('string', this.timeLeft.toFixed(1));
                    this.paused = true;
                    events.trigger(this, 'stageTimeExpired');
                }
                
                this.timeLabel.set('string', this.timeLeft.toFixed(1));
            }
        
            // Runs question specific timer
            if(this.qTime != null && !this.qTimePause) {
                this.qTime -= dt;
            }
        }
    },
    
    // Starts HUD actions for questions with a time limit
    onQuestionTimerStart: function(val) {
        this.qTime = val;
        this.qTimeMax = val;
        this.qTimePause = false;
    },
    
    // Ends HUD actions after questions with a time limit
    onBeforeNextQuestion: function() {
        if(this.qTime != null) {
            this.qTime = null;
            this.qTimeMax = null;
        }
    },
    
    // Called when the game starts
    startGame: function() {
        this.paused = false;
        this.scheduleUpdate();
    },
    
    // Changes the score value by the specified amount and updates the displayed score accordingly
    modifyScore: function(val) {
        this.score += val;
        this.scoreLabel.set('string', this.score);
    
        //HACK: Kind of hacky way to stop question timer from continuing to count down
        this.qTimePause = true;
        
        // Update medal meter
        p = Math.max(Math.min((1 - this.score / NLC.medalScores[0]), 1), 0);
        this.medalArrow.set('position', new geo.Point(HUD.MedalMeterX+15, p*92 + 10));
    },
    
    // Setter function for timeLeft
    setTimeLeft: function(val) {
        this.timeLeft = val;
        if(this.timeLeft != null) {
            this.timeLabel.set('string', parseFloat(this.timeLeft).toFixed(1));
        }
    }
});

HUD.MedalMeterX = 185;

exports.HUD = HUD;