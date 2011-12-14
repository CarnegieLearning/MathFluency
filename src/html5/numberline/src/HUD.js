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
    
    // Constructor
    init: function () {
        // Always call the superclass constructor
        HUD.superclass.init.call(this);
        
        // Set up the time remaining label
        this.timeLabel = cocos.nodes.Label.create({string: ''})
        this.timeLabel.set('position', new geo.Point(850, 50));
        this.addChild({child: this.timeLabel});
        
        // Set up the score label
        this.scoreLabel = cocos.nodes.Label.create({string: '0'});
        this.scoreLabel.set('position', new geo.Point(50, 50));
        this.addChild({child: this.scoreLabel});
        
        this.onQuestionTimerStart = this.onQuestionTimerStart.bind(this);
        this.onBeforeNextQuestion = this.onBeforeNextQuestion.bind(this);
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
            if(this.qTime != null) {
                this.qTime -= dt;
            }
        }
    },
    
    // Starts HUD actions for questions with a time limit
    onQuestionTimerStart: function(val) {
        this.qTime = val;
        this.qTimeMax = val;
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
    },
    
    // Setter function for timeLeft
    setTimeLeft: function(val) {
        this.timeLeft = val;
        if(this.timeLeft != null) {
            this.timeLabel.set('string', parseFloat(this.timeLeft).toFixed(1));
        }
    },
    
    // TODO: Put this in a utility file
    drawLine: function (ctx, startx, starty, endx, endy) {
        ctx.beginPath();
        ctx.moveTo(startx, starty);
        ctx.lineTo(endx, endy);
        ctx.closePath();
        ctx.stroke();
    },
    
    // Low level drawing calls
    draw: function(ctx) {
        ctx.fillStyle = '#C09000';
        ctx.fillRect(0, 0, 900, 100);
        
        // Displays question specific timer (if applicable)
        if(this.qTimeMax != null) {
            p = (1 - this.qTime / this.qTimeMax) * 100;
            p = Math.min(p, 100);
            ctx.fillStyle = '#AA3333';
            ctx.fillRect(600, p, 100, 100 - p);
        }
        
        // Draw medal meter
        if(NLC.proportions) {
            var y = 0;
            ctx.fillStyle = NLC.goldColor;
            ctx.fillRect(200, y,  100, NLC.proportions[0] * 98);
            y += NLC.proportions[0] * 98;
            
            ctx.fillStyle = NLC.silverColor;
            ctx.fillRect(200, y, 100, NLC.proportions[1] * 98);
            y += NLC.proportions[1] * 98;
            
            ctx.fillStyle = NLC.bronzeColor;
            ctx.fillRect(200, y, 100, NLC.proportions[2] * 98);
            y += NLC.proportions[2] * 98;
            
            ctx.fillStyle = NLC.noMedalColor;
            ctx.fillRect(200, y, 100, NLC.proportions[3] * 98);
        }
        
        // Draw medal marker
        ctx.strokeStyle = '#DD2222';
        ctx.lineWidth = 1;
        p = Math.max(Math.min((1 - this.score / NLC.medalScores[0]), 1), 0);
        this.drawLine(ctx, 200, p * 96, 300, p * 96);
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        this.drawLine(ctx, 200, 0, 200, 100);
        this.drawLine(ctx, 300, 0, 300, 100);
        this.drawLine(ctx, 600, 0, 600, 100);
        this.drawLine(ctx, 700, 0, 700, 100);
        
        this.drawLine(ctx, 0, 100, 900, 100);
    }
});

exports.HUD = HUD;