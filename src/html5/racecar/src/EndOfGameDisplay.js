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
    totalLabelUp: function(label, link, value, duration) {
        this.addChild({child: label});
        
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

TotalLine = GuiNode.extend({
    step : 0,           // Current animation step
    
    name        : null,     // Label to display for the line
    instances   : null,     // Displays the number of incorrect answers
    xLabel      : null,     // Displays the multiplication symbol
    amount      : null,     // Displays the time penalty for each incorrect answer
    eLabel      : null,     // Displays the equals sign
    result      : null,     // Displays the total time lost to penalties
    medal       : null,     //
    
    instT       : 0,        // Numeric total number of instances
    instLink    : 0,        // Binding value for counting up animation
    resultT     : 0,        // Numeric total for the result value
    resultLink  : 0,        // Binding value for counting up animation
    
    init: function (name, inst, amt) {
        TotalLine.superclass.init.call(this);
    
        this.instT = inst;
        this.resultT = amt * inst;
    
        // Labels for the line
        this.buildLabel(name, 'name', -500);
        this.buildLabel('0', 'instances', 115);
        this.buildLabel('errors X', 'xLabel', 135);
        this.buildLabel(amt, 'amount', 205);
        this.buildLabel('sec =', 'eLabel', 225);
        this.buildLabel('0.000', 'result', 390);
        this.get('result').set('anchorPoint', new geo.Point(1, 0.5));
    },
    
    // Builds a basic label for the line
    buildLabel: function(s, l, x) {
        lbl = cocos.nodes.Label.create({string: s});
        lbl.set('position', new geo.Point(x, 0));
        lbl.set('anchorPoint', new geo.Point(0, 0.5));
        this.set(l, lbl);
    },
    
    // Start the animation sequence
    start: function() {
        events.addListener(this, 'actionComplete', this.next.bind(this));
        this.next();
    },
    
    // Performs the next step in the animation
    next: function() {
        var step = this.get('step');
        
        if(step == 0)
            this.slideLabelIn(this.get('name'), 0.75);
        else if(step == 1)
            this.showLabel(this.get('instances'), 0.05);
        else if(step == 2)
            this.showLabel(this.get('xLabel'), 0.05);
        else if(step == 3)
            this.showLabel(this.get('amount'), 0.05);
        else if(step == 4)
            this.showLabel(this.get('eLabel'), 0.05);
        else if(step == 5)
            this.showLabel(this.get('result'), 0.05);
        else if(step == 6) {
            this.totalLabelUp(this.get('instances'), 'instLink', this.get('instT'), 0.5);
            this.totalLabelUp(this.get('result'), 'resultLink', this.get('resultT'), 0.5);
        }
        else if(step == 8) {
            events.trigger(this, 'animationCompleted');
        }
        
        this.set('step', step + 1);
    }
});

// Responsible for displaying the player's stats at the end of the game
EndOfGameDisplay = GuiNode.extend({
    elapsedLabel    : null,     // Text label for the elapsed line
    elapsedTime     : null,     // Displays the elapsed time
    elapsedLink     : 0,        // Holds the raw value of elapsedTime
    totalLabel      : null,     // Text label for the total line
    total           : null,     // Displays the total time including penalties
    totalLink       : 0,        // Holds the raw value of total
    
    step            : 0,        // Current animation step
    playRate        : 1,        // Play duration of the animations (1 = 100% time, 0.1 = 10% time or 10x speed)
    
    timeAmt         : 0.0,      // Elapsed time to display
    numPenalty      : 0,        // Number of penalties incurred
    abort           : false,    // Abort state of the game
    
    sliderX         : 10,       // X location of the slider on the medal line
    
    init: function (ta, np, a) {
        EndOfGameDisplay.superclass.init.call(this);
    
        this.set('timeAmt', ta);
        this.set('numPenalty', np);
        this.set('abort', a);
    
        var lbl;
        var opts = {};
        
        // Text label for time elapsed
        opts['string'] = 'Elapsed Time';
        lbl = cocos.nodes.Label.create(opts);
        lbl.set('position', new geo.Point(-500, 40));
        lbl.set('anchorPoint', new geo.Point(0, 0.5));
        this.set('elapsedLabel', lbl);
        
        // Displays time elapsed
        opts['string'] = '0.000';
        lbl = cocos.nodes.Label.create(opts);
        lbl.set('position', new geo.Point(390, 40));
        lbl.set('anchorPoint', new geo.Point(1, 0.5));
        this.set('elapsedTime', lbl);
        
        // Missed questions line
        this.line = TotalLine.create('Penalty Time', np, RC.penaltyTime);
        this.line.set('position', new geo.Point(0, 80));
        events.addListener(this.line, 'animationCompleted', this.next.bind(this));
        this.addChild({child: this.line});
        
        // Text label for the total line
        opts['string'] = 'Total Score';
        lbl = cocos.nodes.Label.create(opts);
        lbl.set('position', new geo.Point(-500, 120));
        lbl.set('anchorPoint', new geo.Point(0, 0.5));
        this.set('totalLabel', lbl);
        
        // Displays the overall time, including penalties
        opts['string'] = '0.000';
        lbl = cocos.nodes.Label.create(opts);
        lbl.set('position', new geo.Point(390, 120));
        lbl.set('anchorPoint', new geo.Point(1, 0.5));
        this.set('total', lbl);
        
        this.scheduleUpdate();
    },
    
    // Called every frame
    update: function(dt) {
        this.composeTime(this.get('elapsedTime'), parseFloat(this.get('elapsedLink')));
        this.composeTime(this.line.get('result'), parseFloat(this.line.get('resultLink')));
        this.composeTime(this.get('total'),       parseFloat(this.get('totalLink')));
        
        this.line.instances.set('string', parseFloat(this.line.instLink).toFixed(0));
    },
    
    // Start the animation sequence
    start: function() {
        events.addListener(this, 'actionComplete', this.next.bind(this));
        this.next();
    },
    
    // Begins the next step in the animation process
    next: function() {
        var step = this.get('step');
        
        if(step == 0)
            this.slideLabelIn(this.get('elapsedLabel'), 0.75);
        else if(step == 1)
            this.totalLabelUp(this.get('elapsedTime'), 'elapsedLink', this.get('timeAmt'), 0.5);
        else if(step == 2)
            this.line.start();
        else if(step == 3)
            this.slideLabelIn(this.get('totalLabel'), 0.75);
        else if(step == 4) {
            var tt = this.get('timeAmt') + this.get('numPenalty') * RC.penaltyTime;
            this.totalLabelUp(this.get('total'), 'totalLink', tt, 1.0);
            
            // Determine distance to move slider
            var x;
            if(this.get('abort'))
                x = 0;
            else if(tt > RC.times[3])
                x = 90 - 90 * Math.min(1, tt / RC.times[4]);
            else
                x = 380 - 290 * (tt - RC.times[0]) / (RC.times[3] - RC.times[0]);
            
            MOT.create(this.get('sliderX'), x, 1.0).bind(this, 'sliderX');
        }
        else if(step == 5) {
            // "Stamp" the medal on the score sheet here
            var that = this;
            events.trigger(this, 'almostComplete');
            setTimeout(function() {events.trigger(that, 'actionComplete');}, 1000);
        }
        else if(step == 6) {
            // Motivational message / tip / advice popup
            events.trigger(this, 'complete');
        }
            
        this.set('step', step + 1);
    },
    
    composeTime: function (l, s) {
        var val = "";
        
        if(s >= 60) {
            var m = Math.floor(s / 60);
            s = s % 60;
            
            val += m + ' min';
            
            val += ' ';
        }
        
        val += s.toFixed(1) + ' sec';
        
        l.set('string', val);
        l._updateLabelContentSize();
        
        //var p = l.get('position');
        //p.x = 390 - l.get('contentSize').width;
        //l.set('position', p);
    },
    
    skipAnimation: function () {
        this.playRate = 0.1;
    },
    
    // Helper function that gives area percentage for medal time ranges
    proportions: function (i) {
        return (RC.times[i] - RC.times[i - 1]) / (RC.times[3] - RC.times[0]);
    },
    
    // Handles all the low level drawing calls
    // TODO: Unmagic number these
    draw: function (ctx) {
        // Draws the background of the window
        ctx.fillStyle = "#8B7765";
        ctx.fillRect(0, 0, 400, 450);
        
        // Draw the medal meter line
        var offset = 100;
        
        ctx.fillStyle = RC.noMedal;
        ctx.fillRect(10, 160, 90, 20);
        
        run = this.proportions(3) * 290;
        ctx.fillStyle = RC.bronze;
        ctx.fillRect(offset, 160, run, 20);
        offset += run;
        
        run = this.proportions(2) * 290;
        ctx.fillStyle = RC.silver;
        ctx.fillRect(offset, 160, run, 20);
        offset += run;
        
        var run = this.proportions(1) * 290;
        ctx.fillStyle = RC.gold;
        ctx.fillRect(offset, 160, run, 20);
        offset += run;
        
        // Draw the indicator for the medal meter line
        var x = this.get('sliderX');
        ctx.fillStyle = "#CC2222";
        ctx.beginPath();
        ctx.moveTo(x    , 177);
        ctx.lineTo(x + 8, 150);
        ctx.lineTo(x - 8, 150);
        ctx.closePath();
        ctx.fill();
        
        if(this.get('step') >= 5) {
            // Draw the medal
            var t = this.get('timeAmt') + this.get('numPenalty') * RC.penaltyTime;
            if(this.get('abort') || t > RC.times[3])
                ctx.fillStyle = RC.noMedal;
            else if(t < RC.times[1])
                ctx.fillStyle = RC.gold;
            else if(t < RC.times[2])
                ctx.fillStyle = RC.silver;
            else
                ctx.fillStyle = RC.bronze;
            ctx.beginPath();
            ctx.arc(300, 300, 80, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }
});

exports.EndOfGameDisplay = EndOfGameDisplay