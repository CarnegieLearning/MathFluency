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

// Static imports
var RC = require('RaceControl').RaceControl;
var MOT = require('ModifyOverTime').ModifyOverTime;

GuiNode = cocos.nodes.Node.extend({
    init: function(opts) {
        GuiNode.superclass.init.call(this, opts);
        this._actionComplete = this._actionComplete.bind(this);
    },
    
    // Slides a label in from the right
    slideLabelIn: function (l, d) {
        this.addChild({child: l});
        var a = cocos.actions.MoveTo.create({position: new geo.Point(15, l.get('position').y), duration: d});
        a.startWithTarget(l);
        l.runAction(a);
        
        events.addListener(a, 'actionComplete', this._actionComplete);
    },
    
    // Totals a label up over time
    totalLabelUp: function(link, value, duration) {
        var m = MOT.create(0.0, value, duration);
        m.bind(this, link);
        
        events.addListener(m, 'Completed', this._actionComplete);
    },
    
    // Causes a label to appear
    showLabel: function (l, d) {
        this.addChild({child: l});
        
        setTimeout(this._actionComplete, d * 1000);
    },
    
    // Triggers 'actionComplete'
    _actionComplete: function () {
        events.trigger(this, 'actionComplete');
    }
});

// Responsible for displaying the player's stats at the end of the game
EndOfGameDisplay = GuiNode.extend({
    elapsedMin      : null,     // Text label for the elapsed number of minutes
    elapsedSec      : null,     // Text label for the elapsed number of seconds
    penaltyCount    : null,     // Text label for number of errors
    penaltyCost     : null,     // Text label for penalty per error
    penaltyMin      : null,     // Text label for the minutes of penalty time
    penaltySec      : null,     // Text label for the seconds of penalty time
    totalMin        : null,     // Text label for total number of minutes
    totalSec        : null,     // Text label for total number of seconds
    
    eml             : 0,        // Link for elapsed minutes
    esl             : 0,        // Link for elapsed seconds
    pnl             : 0,        // Link for penalty count
    pcl             : 0,        // Link for penalty cost
    pml             : 0,        // Link for penalty minutes
    psl             : 0,        // Link for penalty seconds
    tml             : 0,        // Link for total minutes
    tsl             : 0,        // Link for total seconds
    
    step            : 0,        // Current animation step
    
    timeAmt         : 0.0,      // Elapsed time to display
    numPenalty      : 0,        // Number of penalties incurred
    abort           : false,    // Abort state of the game
    
    sliderX         : 325,      // X location of the slider on the medal line
    
    init: function (ta, np, a) {
        EndOfGameDisplay.superclass.init.call(this);
    
        this.set('timeAmt', ta);
        this.set('numPenalty', np);
        this.set('abort', a);
    
        var lbl;
        var opts = {};
        
        // Back Pane /////////////////////////////////////////////////////////////////////////////////////////////////
        
        var dir = '/resources/EndScreen/';
        this.backPane = cocos.nodes.Sprite.create({file: dir + 'signEndScreenBack.png'});
        this.backPane.set('anchorPoint', new geo.Point(0, 0));
        this.addChild(this.backPane);
        
        // Between Pane ///////////////////////////////////////////////////////////////////////////////////////////////
        
        this.medalBars = [];
        
        this.medalBars.push(cocos.nodes.Sprite.create({file: dir + 'EndScreenIndicatorBlack.png'}));
        this.medalBars.push(cocos.nodes.Sprite.create({file: dir + 'EndScreenIndicatorBronze.png'}));
        this.medalBars.push(cocos.nodes.Sprite.create({file: dir + 'EndScreenIndicatorSilver.png'}));
        this.medalBars.push(cocos.nodes.Sprite.create({file: dir + 'EndScreenIndicatorGold.png'}));
        
        var offset = 325;
        for(var i=0; i<4; i+=1) {
            this.medalBars[i].set('anchorPoint', new geo.Point(0, 0.5));
            this.medalBars[i].set('scaleX', this.proportions(4-i));
            this.medalBars[i].set('position', new geo.Point(offset, 80));
            this.addChild({child: this.medalBars[i]});
            offset += this.proportions(4-i) * 235;
        }
        
        this.slider = cocos.nodes.Sprite.create({file: dir + 'signEndScreenIndicator.png'});
        this.slider.set('position', new geo.Point(325, 62));
        this.addChild({child: this.slider});
        
        // Front Pane /////////////////////////////////////////////////////////////////////////////////////////////////
        
        this.frontPane = cocos.nodes.Sprite.create({file: dir + 'signEndScreenFront.png'});
        this.frontPane.set('anchorPoint', new geo.Point(0, 0));
        this.addChild(this.frontPane);
        
        // On Top /////////////////////////////////////////////////////////////////////////////////////////////////////
        
        this.buildLabel('elapsedMin',   448, 176, '0',   '14');
        this.buildLabel('elapsedSec',   535, 176, '0.0', '14');
        this.buildLabel('penaltyCount', 120, 236, '0',   '14');
        this.buildLabel('penaltyCost',  268, 236, '0',   '14');
        this.buildLabel('penaltyMin',   437, 236, '0',   '14');
        this.buildLabel('penaltySec',   524, 236, '0.0', '14');
        this.buildLabel('totalMin',     345, 292, '0',   '24');
        this.buildLabel('totalSec',     490, 292, '0.0', '24');
        
        this.fix(this.penaltyCost, RC.penaltyTime, 1);
        
        this.eml = 0;
        this.esl = 0;
        this.pnl = 0;
        this.pcl = 0;
        this.pml = 0;
        this.psl = 0;
        this.tml = 0;
        this.tsl = 0;
        
        this.scheduleUpdate();
    },
    
    // Helper function to build labels
    buildLabel: function(n, x, y, s, fs) {
        var temp = cocos.nodes.Label.create({string: s, fontName: 'Android Nation Italic', fontSize: fs});
        temp.set('anchorPoint', new geo.Point(1, 1));
        temp.set('position', new geo.Point(x, y));
        this.addChild({child: temp});
        this.set(n, temp);
    },
    
    // Called every frame
    update: function(dt) {
        if(this.esl > 59.94) {
            this.eml += 1;
            this.esl -= 60;
        }
        
        if(this.psl > 59.94) {
            this.pml += 1;
            this.psl -= 60;
        }
        
        if(this.tsl > 59.94) {
            this.tml += 1;
            this.tsl -= 60;
        }
        
        this.fix(this.elapsedSec, this.esl, 1);
        this.fix(this.penaltySec, this.psl, 1);
        this.fix(this.totalSec, this.tsl, 1);
        
        this.fix(this.elapsedMin, this.eml, 0);
        this.fix(this.penaltyCount, this.pnl, 0);
        this.fix(this.penaltyMin, this.pml, 0);
        this.fix(this.totalMin, this.tml, 0);
        
        this.slider.set('position', new geo.Point(this.sliderX, 62));
    },
    
    // Keeps the label's string value fixed to the specified precision
    fix: function(l, v, p) {
        f = parseFloat(v);
        l.set('string', f.toFixed(p));
        l._updateLabelContentSize();
    },
    
    // Start the animation sequence
    start: function() {
        events.addListener(this, 'actionComplete', this.next.bind(this));
        this.next();
    },
    
    // Begins the next step in the animation process
    next: function() {
        var step = this.get('step');
        
        if(step == 0) {
            this.totalLabelUp('esl', this.timeAmt, 0.5);
        }
        
        else if(step == 1) {
            this.totalLabelUp('psl', this.numPenalty * RC.penaltyTime, 0.5);
            this.totalLabelUp('pnl', this.numPenalty, 0.5);
        }
        
        else if(step == 3) {
            this.totalTime = this.timeAmt + this.numPenalty * RC.penaltyTime;
            this.totalLabelUp('tsl', this.totalTime, 1.0);
            
            var x;
            if(this.get('abort'))
                x = 0;
            else
                x = 235 * (1 - (this.totalTime - RC.times[0]) / (RC.times[4] - RC.times[0]));
                
            x = Math.max(0, x);
            
            
            console.log(x)
            console.log((this.totalTime - RC.times[0]) / (RC.times[4] - RC.times[0]))
            
            MOT.create(this.get('sliderX'), x, 1.0).bind(this, 'sliderX');
        }
        
        else if(step == 4 && this.totalTime < RC.times[3]) {
            var medal = '/resources/Medals/bronzeMedal.png';
            if(this.totalTime < RC.times[1]) {
                medal = '/resources/Medals/goldMedal.png'
            }
            else if(this.totalTime < RC.times[2]) {
                medal = '/resources/Medals/silverMedal.png'
            }
            
            var ms = cocos.nodes.Sprite.create({file: medal});
            ms.set('position', new geo.Point(670, 120));
            this.addChild({child: ms});
            
            //Signals "Retry" and "Next Level" buttons to appear
            //events.trigger(this, 'almostComplete');
            
            var that = this;
            setTimeout(function() {events.trigger(that, 'actionComplete');}, 1000);
        }
        
        else if(step == 5) {
            events.trigger(this, 'complete');
        }
        
        this.set('step', step + 1);
    },
    
    // Helper function that gives area percentage for medal time ranges
    proportions: function (i) {
        return (RC.times[i] - RC.times[i - 1]) / (RC.times[4] - RC.times[0]);
    }
});

exports.EndOfGameDisplay = EndOfGameDisplay