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
var geom = require('geometry');
var events = require('events');

// Static imports
var RC = require('RaceControl').RaceControl;
var MOT = require('ModifyOverTime').ModifyOverTime;

// Responsible for displaying the player's stats at the end of the game
EndOfGameDisplay = cocos.nodes.Node.extend({
    elapsedLabel    : null,     // Text label for the elapsed line
    elapsedTime     : null,     // Displays the elapsed time
    elapsedLink     : 0,        // Holds the raw value of elapsedTime
    incorrectLabel  : null,     // Text label for the incorrect line
    incorrects      : null,     // Displays the numer of incorrect answers
    incorrectsLink  : 0,        // Holds the raw value of incorrects
    xLabel          : null,     // Displays the multiplication symbol
    penalty         : null,     // Displays the time penalty for each incorrect answer
    eLabel          : null,     // Displays the equals sign
    totalPenalty    : null,     // Displays the total time lost to penalties
    totalPenLink    : 0,        // Holds the raw value of totalPenalty
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
        lbl.set('position', new geom.Point(-500, 40));
        lbl.set('anchorPoint', new geom.Point(0, 0.5));
        this.set('elapsedLabel', lbl);
        
        // Displays time elapsed
        opts['string'] = '0.000';
        lbl = cocos.nodes.Label.create(opts);
        lbl.set('position', new geom.Point(350, 40));
        lbl.set('anchorPoint', new geom.Point(1, 0.5));
        this.set('elapsedTime', lbl);
        
////////////////////////////////////////////////////////////////////////////////////////////////////
        
        // Text label for the missed questions line
        opts['string'] = 'Incorrects';
        lbl = cocos.nodes.Label.create(opts);
        lbl.set('position', new geom.Point(-500, 80));
        lbl.set('anchorPoint', new geom.Point(0, 0.5));
        this.set('incorrectLabel', lbl);
        
        // Displays number of questions missed
        opts['string'] = '0';
        lbl = cocos.nodes.Label.create(opts);
        lbl.set('position', new geom.Point(100, 80));
        lbl.set('anchorPoint', new geom.Point(0, 0.5));
        this.set('incorrects', lbl);
        
        // Displays multiplication symbol
        opts['string'] = 'X';
        lbl = cocos.nodes.Label.create(opts);
        lbl.set('position', new geom.Point(120, 80));
        lbl.set('anchorPoint', new geom.Point(0, 0.5));
        this.set('xLabel', lbl);
        
        // Displays the penalty for each missed question
        opts['string'] = parseFloat(RC.penaltyTime).toFixed(3);
        lbl = cocos.nodes.Label.create(opts);
        lbl.set('position', new geom.Point(145, 80));
        lbl.set('anchorPoint', new geom.Point(0, 0.5));
        this.set('penalty', lbl);
        
        // Displays an equal sign
        opts['string'] = '=';
        lbl = cocos.nodes.Label.create(opts);
        lbl.set('position', new geom.Point(200, 80));
        lbl.set('anchorPoint', new geom.Point(0, 0.5));
        this.set('eLabel', lbl);
        
        // Subtotal for penalty time
        opts['string'] = '0.000';
        lbl = cocos.nodes.Label.create(opts);
        lbl.set('position', new geom.Point(350, 80));
        lbl.set('anchorPoint', new geom.Point(1, 0.5));
        this.set('totalPenalty', lbl);
        
////////////////////////////////////////////////////////////////////////////////////////////////////
        
        // Text label for the total line
        opts['string'] = 'Total Time';
        lbl = cocos.nodes.Label.create(opts);
        lbl.set('position', new geom.Point(-500, 120));
        lbl.set('anchorPoint', new geom.Point(0, 0.5));
        this.set('totalLabel', lbl);
        
        // Displays the overall time, including penalties
        opts['string'] = '0.000';
        lbl = cocos.nodes.Label.create(opts);
        lbl.set('position', new geom.Point(350, 120));
        lbl.set('anchorPoint', new geom.Point(1, 0.5));
        this.set('total', lbl);
        
        this.scheduleUpdate();
    },
    
    // Called every frame
    update: function(dt) {
        this.fix(this.get('elapsedTime'), this.get('elapsedLink'), 3);
        this.fix(this.get('incorrects'), this.get('incorrectsLink'), 0);
        this.fix(this.get('totalPenalty'), this.get('totalPenLink'), 3);
        this.fix(this.get('total'), this.get('totalLink'), 3);
    },
    
    // Keeps the label's string value fixed to three positions
    fix: function(l, v, p) {
        f = parseFloat(v);
        l.set('string', f.toFixed(p));
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
            this.slideLabelIn(this.get('incorrectLabel'), 0.75);
        else if(step == 3)
            this.totalLabelUp(this.get('incorrects'), 'incorrectsLink', this.get('numPenalty'), 0.5);
        else if(step == 4)
            this.showLabel(this.get('xLabel'), 0.1);
        else if(step == 5)
            this.showLabel(this.get('penalty'), 0.1);
        else if(step == 6)
            this.showLabel(this.get('eLabel'), 0.1);
        else if(step == 7)
            this.totalLabelUp(this.get('totalPenalty'), 'totalPenLink', this.get('numPenalty') * RC.penaltyTime, 0.5);
        else if(step == 8)
            this.slideLabelIn(this.get('totalLabel'), 0.75);
        else if(step == 9) {
            var tt = this.get('timeAmt') + this.get('numPenalty') * RC.penaltyTime;
            this.totalLabelUp(this.get('total'), 'totalLink', tt, 1.0);
            
            var x;
            if(this.get('abort'))
                x = 380;
            else if(tt > RC.times[3])
                x = 290 + 90 * Math.min(1, tt / RC.times[4]);
            else
                x = 290 * (tt - RC.times[0]) / (RC.times[3] - RC.times[0]);
            
            MOT.create(this.get('sliderX'), x, 1.0).bind(this, 'sliderX');
        }
        else if(step == 10) {
            // "Stamp" the medal on the score sheet here
            var that = this;
            events.trigger(this, 'almostComplete');
            setTimeout(function() {events.trigger(that, 'actionComplete');}, 1000);
        }
        else if(step == 11) {
            // Motivational message / tip / advice popup
            events.trigger(this, 'complete');
        }
            
        this.set('step', step + 1);
    },
    
    skipAnimation: function () {
        this.playRate = 0.1;
    },
    
    // Slides a label in from the right
    slideLabelIn: function (l, d) {
        this.addChild({child: l});
        var a = cocos.actions.MoveTo.create({position: new geom.Point(10, l.get('position').y), duration: d * this.playRate});
        a.startWithTarget(l);
        l.runAction(a);
        
        var that = this;
        setTimeout(function() {events.trigger(that, 'actionComplete');}, d * 1000 * this.playRate);
    },
    
    // Totals a label up over time
    totalLabelUp: function(label, link, value, duration) {
        this.addChild({child: label});
        MOT.create(0, value, duration * this.playRate).bind(this, link);
        
        var that = this;
        setTimeout(function() {events.trigger(that, 'actionComplete');}, duration * 1000 * this.playRate);
    },
    
    // Causes a label to appear
    showLabel: function (l, d) {
        this.addChild({child: l});
        
        var that = this;
        setTimeout(function() {events.trigger(that, 'actionComplete');}, d * 1000 * this.playRate);
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
        var offset = 10;
        
        var run = this.proportions(1) * 290;
        ctx.fillStyle = RC.gold;
        ctx.fillRect(offset, 160, run, 20);
        offset += run;
        
        run = this.proportions(2) * 290;
        ctx.fillStyle = RC.silver;
        ctx.fillRect(offset, 160, run, 20);
        offset += run;
        
        run = this.proportions(3) * 290;
        ctx.fillStyle = RC.bronze;
        ctx.fillRect(offset, 160, run, 20);
        offset += run;
        
        ctx.fillStyle = RC.noMedal;
        ctx.fillRect(offset, 160, 390 - offset, 20);
        
        // Draw the indicator for the medal meter line
        var x = this.get('sliderX');
        ctx.fillStyle = "#CC2222";
        ctx.beginPath();
        ctx.moveTo(x    , 177);
        ctx.lineTo(x + 8, 150);
        ctx.lineTo(x - 8, 150);
        ctx.closePath();
        ctx.fill();
        
        if(this.get('step') >= 10) {
            // Draw the medal
            var t = this.get('timeAmt') + this.get('numPenalty') * RC.penaltyTime;
            if(this.get('abort'))
                ctx.fillStyle = RC.noMedal;
            else if(t < RC.times[1])
                ctx.fillStyle = RC.gold;
            else if(t < RC.times[2])
                ctx.fillStyle = RC.silver;
            else if(t < RC.times[3])
                ctx.fillStyle = RC.bronze;
            else
                ctx.fillStyle = RC.noMedal;
                
            ctx.beginPath();
            ctx.arc(300, 300, 80, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }
});

exports.EndOfGameDisplay = EndOfGameDisplay