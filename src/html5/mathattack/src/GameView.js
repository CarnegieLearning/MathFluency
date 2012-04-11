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

// Cocos imports
var cocos = require('cocos2d');
var geo = require('geometry');
var events = require('events');

// Project Imports
var FloatText = require('FloatText').FloatText;

// Static imports
var MAC = require('MathAttackControl').MathAttackControl;
var MOT = require('ModifyOverTime').ModifyOverTime;
var XML = require('XML').XML;

var GameView = cocos.nodes.Node.extend({
    roundLabel      : null,     // Text label "Round"
    roundCount      : null,     // Current round number as a text label
    
    timeLabel       : null,     // Text label "Time"
    timeCount       : null,     // Current time remaining as a text label
    
    correctLabel    : null,     // Text label "Remaining"
    correctCount    : null,     // Total correct answers as a label
    correctVal      : 0,        // Total correct answers as an integer
    corrects        : null, 
    
    incorrectLabel  : null,     // Text label "Misses"
    incorrectCount  : null,     // Total incorrect answers as a label
    incorrectVal    : 0,        // Total incorrect answers as an integer
    
    scoreLabel      : null,     // Text label "Score"
    scoreCount      : null,     // Current score as a text label
    
    medalBar        : null,     // Holds the horizontal bar for the medal meter
    medalBars       : null,     // Array with all the metal color backrounds for the metal meter
    medalContainer  : null,     // Frame for the metal meter
    medalTrend      : 145,      // Y value for medal meter to trend towards
    
    init: function(max_c) {
        GameView.superclass.init.call(this);
        
        // Static bind
        this.removeFloatText = this.removeFloatText.bind(this);
        
        // Background of cut out question window
        var bg = cocos.nodes.Sprite.create({file: '/resources/whiteback.png'});
        bg.set('position', new geo.Point(450, 300));
        bg.set('zOrder', -1);
        this.addChild({child: bg});
        
        // Pane used to create a fade effect between questions
        this.fadePane = cocos.nodes.Sprite.create({file: '/resources/whiteback.png'});
        this.fadePane.set('position', new geo.Point(450, 300));
        this.fadePane.set('zOrder', 1);
        this.fadePane.set('opacity',0);
        this.addChild({child: this.fadePane});
        
        // Foreground window
        var fg = cocos.nodes.Sprite.create({file: '/resources/background.png'});
        fg.set('anchorPoint', new geo.Point(0, 0));
        fg.set('zOrder', 2);
        this.addChild({child: fg});
        
        // Text labels
        var tc = '#000000';
        this.buildLabel('roundLabel',       'Round',    tc, '22', 110, 545);
        this.buildLabel('roundCount',       '0',        tc, '34', 110, 575);
        this.buildLabel('timeLabel',        'Time',     tc, '22', 230, 545);
        this.buildLabel('timeCount',        '0',        tc, '34', 230, 575);
        this.buildLabel('correctLabel',     'Correct',  tc, '22', 430, 545);
        //this.buildLabel('correctCount',     '0',        tc, '34', 430, 575);
        this.buildLabel('incorrectLabel',   'Misses',   tc, '22', 640, 545);
        this.buildLabel('incorrectCount',   '0',        tc, '34', 640, 575);
        this.buildLabel('scoreLabel',       'Score',    tc, '22', 780, 545);
        this.buildLabel('scoreCount',       '0',        tc, '34', 780, 575);
        
        // Medal status bar
        var dir = '/resources/medal-status-';
        this.medalContainer = cocos.nodes.Sprite.create({file: dir + 'container.png'});
        this.medalContainer.set('position', new geo.Point(860, 250));
        this.medalContainer.set('anchorPoint', new geo.Point(0, 1));
        this.medalContainer.set('zOrder', 4);
        this.addChild({child: this.medalContainer});
        
        this.medalBar = cocos.nodes.Sprite.create({file: dir + 'bar.png'});
        this.medalBar.set('position', new geo.Point(15, 145));
        this.medalBar.set('zOrder', 5);
        
        this.medalContainer.addChild({child: this.medalBar});
        
        this.medalBars = [];
        this.medalBars.push(this.buildBar(dir + 'gold.png'));
        this.medalBars.push(this.buildBar(dir + 'silver.png'));
        this.medalBars.push(this.buildBar(dir + 'bronze.png'));
        this.medalBars.push(this.buildBar(dir + 'blank.png'));
        
        this.activeBar = 3;
        
        // Correct answers remaining indicators
        this.corrects = [];
        for(var i=0; i<max_c; i+=1) {
            this.corrects.push(cocos.nodes.Sprite.create({file: '/resources/status-correct-green.png'}));
            this.corrects[i].set('zOrder', 3);
        }
        
        this.scheduleUpdate();
    },
    
    // Helper function for initializing all of the labels
    buildLabel: function(name, str, fc, fs, x, y) {
        this[name] = cocos.nodes.Label.create({fontColor: fc, string: str, fontName: MAC.font, fontSize: fs});
        this[name].set('position', new geo.Point(x, y));
        this[name].set('zOrder', 3);
        this.addChild({child: this[name]});
    },
    
    // Helper function for building metal bars for the medal meter
    buildBar: function(name) {
        var bar = cocos.nodes.Sprite.create({file: name});
        bar.set('position', new geo.Point(5, 145));
        bar.set('anchorPoint', new geo.Point(0, 1));
        bar.set('zOrder', -1);
        
        return bar;
    },
    
    // Update the score field
    updateScore: function(val, amt) {
        this.scoreCount.set('string', val);
        this.scoreCount._updateLabelContentSize();
        
        this.updateMedalMeter(val);
        this.triggerFloatText(amt);
    },
    
    // Creats a FloatText object with the specified amount
    triggerFloatText: function(amt) {
        var color = '#009900'
        var prefix = '+';
        if(amt < 0) {
            color = '#CC0000'
            prefix = '';
        }
        
        var ft = FloatText.create({string: prefix + amt, fontColor: color, fontSize: '34', fontName: MAC.font})
        ft.set('position', new geo.Point(850, 585));
        ft.set('zOrder', 10);
        events.addListener(ft, 'onFinish', this.removeFloatText);
        
        this.addChild({child: ft});
    },
    
    // Removes a FloatText object
    // STATICALLY BOUND
    removeFloatText: function (ft) {
        this.removeChild({child: ft});
    },
    
    // Update the status of the medal meter
    updateMedalMeter: function(val) {
        // Determine percentage to fill and restrict value to [0, 1]
        var p = Math.max(Math.min(val / MAC.medalScores[0], 1), 0);
        
        // Position the horizontal bar
        this.medalTrend = 145 - p * 140;
        
        // Determine current medal
        var i=0;
        this.medalContainer.removeChild({child: this.medalBars[this.activeBar]});
        while(i<4 && val < MAC.medalScores[i]) {
            i += 1;
        }
        
        // Update the bar background
        this.activeBar = Math.max(i-1, 0);
        this.medalContainer.addChild({child: this.medalBars[this.activeBar]});
    },
    
    // Enables the specified miss icon
    addWrong: function() {
        this.incorrectVal += 1;
        this.incorrectCount.set('string', this.incorrectVal)
        this.incorrectCount._updateLabelContentSize();
    },
    
    // Enables the specified remaining icon
    addRight: function() {
        this.correctVal -= 1;//*
        this.removeChild({child: this.corrects[this.correctVal]});/*/
        this.correctCount.set('string', this.correctVal)
        this.correctCount._updateLabelContentSize();//*/
    },
    
    // Resets the icon based counters
    resetCounters: function() {
        for(var i=0; i<this.corrects.length; i+=1) {
            this.removeChild({child: this.corrects[i]});
        }
    },
    
    // Prepares the GameView for a new question
    nextQuestion: function(i) {
        this.resetCounters();
    
        this.roundCount.set('string', parseInt(this.roundCount.get('string')) + 1);
        
        this.correctVal = i;/*
        this.correctCount.set('string', this.correctVal)
        this.correctCount._updateLabelContentSize();/*/
        
        var offset = Math.floor(i/2)*22 - ((i % 2 == 0) ? 11 : 0);
        for(var j=0; j<i; j+=1) {
            this.corrects[j].set('position', new geo.Point(430 - offset + j*22, 575));
            this.addChild({child: this.corrects[j]});
        }//*/
    },
    
    // Fades the fadePane in and out
    fadeCycle: function() {
        MOT.create(0, 255, 0.5).bind(this.fadePane, 'opacity');
        
        var that = this;
        setTimeout(function(){ MOT.create(255, -255, 0.5).bind(that.fadePane, 'opacity'); }, 500);
    },
    
    update: function(dt) {
        // Move the medal bar smoothly over time
        var p = this.medalBar.get('position');
        if(this.medalTrend < p.y) {
            p.y -= 20 * dt;
            if(this.medalTrend > p.y) {
                p.y = this.medalTrend;
            }
        }
        else if(this.medalTrend > p.y) {
            p.y += 20 * dt;
            if(this.medalTrend < p.y) {
                p.y = this.medalTrend;
            }
        }
        this.medalBars[this.activeBar].set('scaleY', Math.max(1 - ((p.y - 5) / 140.0), 0.01));
        this.medalBar.set('position', p);
    }
});

exports.GameView = GameView;