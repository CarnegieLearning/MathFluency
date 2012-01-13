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
var MOT = require('ModifyOverTime').ModifyOverTime;
var NLC = require('NumberLineControl').NumberLineControl;

// Project imports
var Q = require('Question').Question;

GuiNode = cocos.nodes.Node.extend({
    init: function(opts) {
        GuiNode.superclass.init.call(this, opts);
        this._actionComplete = this._actionComplete.bind(this);
    },
    
    // Slides a label in from the right
    slideLabelIn: function (l, d) {
        this.addChild({child: l});
        var a = cocos.actions.MoveTo.create({position: new geom.Point(10, l.get('position').y), duration: d});
        a.startWithTarget(l);
        l.runAction(a);
        
        events.addListener(a, 'actionComplete', this._actionComplete);
    },
    
    // Totals a label up over time
    totalLabelUp: function(label, link, value, duration) {
        this.addChild({child: label});
        
        var m = MOT.create(0, value, duration);
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
    step        : 0,        // Current animation step
    
    name        : null,     // Label to display for the line
    instances   : null,     // Displays the numer of incorrect answers
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
        this.buildLabel('0', 'instances', 100);
        this.buildLabel('X', 'xLabel', 120);
        this.buildLabel(amt, 'amount', 145);
        this.buildLabel('=', 'eLabel', 200);
        this.buildLabel('0', 'result', 350);
        this.get('result').set('anchorPoint', new geom.Point(1, 0.5));
    },
    
    // Builds a basic label for the line
    buildLabel: function(s, l, x) {
        lbl = cocos.nodes.Label.create({string: s});
        lbl.set('position', new geom.Point(x, 0));
        lbl.set('anchorPoint', new geom.Point(0, 0.5));
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
//TODO: Allow for a variable number of totaling lines
EndOfGameDisplay = GuiNode.extend({
    elapsedLabel    : null,     // Text label for the elapsed line
    elapsedTime     : null,     // Displays the elapsed time
    elapsedLink     : 0,        // Holds the raw value of elapsedTime
    lines           : null,     // Holds the sub-TotalLines
    
    totalLabel      : null,     // Label for displaying the total score
    totalLink       : 0,        // Numeric link for the total score
    total           : 0,        // The actual total score
    totalLineX      : 250,      // Right side of total line
    
    step            : 0,        // Current animation step
    
    timeAmt         : 0.0,      // Elapsed time to display
    abort           : false,    // Abort state of the game
    
    sliderX         : 390,       // X location of the slider on the medal line
    
    init: function (ta, a, lineVals) {
        EndOfGameDisplay.superclass.init.call(this);
    
        this.set('timeAmt', ta);
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
        opts['string'] = '0.0';
        lbl = cocos.nodes.Label.create(opts);
        lbl.set('position', new geom.Point(350, 40));
        lbl.set('anchorPoint', new geom.Point(1, 0.5));
        this.set('elapsedTime', lbl);
        
        this.lines = [];
        this.lines[0] = TotalLine.create('Perfect', lineVals[0], Q.ptsCorrect);
        this.lines[1] = TotalLine.create('Almost' , lineVals[1], 5);
        this.lines[2] = TotalLine.create('Miss'   , lineVals[2], Q.ptsIncorrect);
        
        for(var i=0; i<3; i+=1) {
            this.lines[i].set('position', new geom.Point(10, 80 + 40*i));
            events.addListener(this.lines[i], 'animationCompleted', this.next.bind(this));
            this.addChild({child: this.lines[i]});
        }

        // Holds overall total
        opts['string'] = '0';
        lbl = cocos.nodes.Label.create(opts);
        lbl.set('position', new geom.Point(350, 200));
        lbl.set('anchorPoint', new geom.Point(1, 0.5));
        this.set('totalLabel', lbl);
    },
    
    // Called every frame
    update: function(dt) {
        this.fix(this.get('elapsedTime'), this.get('elapsedLink'), 1);
        
        for(var i in this.lines) {
            this.fix(this.lines[i].get('instances'), this.lines[i].get('instLink'), 0);
            this.fix(this.lines[i].get('result'), this.lines[i].get('resultLink'), 0);
        }
        
        this.fix(this.get('totalLabel'), this.get('totalLink'), 0);
    },
    
    // Keeps the label's string value fixed to three positions
    fix: function(l, v, p) {
        f = parseFloat(v);
        l.set('string', f.toFixed(p));
    },
    
    // Start the animation sequence
    start: function() {
        this.scheduleUpdate();
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
            this.lines[0].start();
        else if(step == 3)
            this.lines[1].start();
        else if(step == 4)
            this.lines[2].start();
        else if(step == 5) {
            var m = MOT.create(this.totalLineX, 125, 0.2);
            m.bind(this, 'totalLineX');
            
            events.addListener(m, 'Completed', this._actionComplete);
        }
        else if(step == 6) {
            this.total = this.lines[0].resultT + this.lines[1].resultT + this.lines[2].resultT;
            this.totalLabelUp(this.get('totalLabel'), 'totalLink', this.total, 1.0);
            
            var x;
            if(this.get('abort') || this.total < NLC.medalScores[4])
                x = 0;
            else
                x = -380 * Math.min(1, Math.max(0, this.total / (NLC.medalScores[0] - NLC.medalScores[4])));
            
            MOT.create(this.sliderX, x, 1.0).bind(this, 'sliderX');
        }
        else if(step == 7) {
            if(this.get('abort') || this.total < NLC.medalScores[3])
                this.medal = cocos.nodes.Sprite.create({file: '/resources/Medal_0.png'});
            else if(this.total > NLC.medalScores[1])
                this.medal = cocos.nodes.Sprite.create({file: '/resources/Medal_1.png'});
            else if(this.total > NLC.medalScores[2])
                this.medal = cocos.nodes.Sprite.create({file: '/resources/Medal_2.png'});
            else
                this.medal = cocos.nodes.Sprite.create({file: '/resources/Medal_3.png'});
            
            this.medal.set('position', new geom.Point(320, 370));
            this.medal.set('anchorPoint', new geom.Point(0.5, 0.5));
            this.medal.set('scaleX', 0.5);
            this.medal.set('scaleY', 0.5);
            this.addChild({child: this.medal});
        }
        
        this.set('step', step + 1);
    },
    
    // Handles all the low level drawing calls
    // TODO: Unmagic number these
    draw: function (ctx) {
        // Draws the background of the window
        ctx.fillStyle = "#8B7765";
        ctx.fillRect(0, 0, 400, 450);
        
        // Draw the medal meter line
        var offset = 10;
        var run;
        
        for(var i=0; i<4; i+=1) {
            run = NLC.proportions[i] * 380;
            ctx.fillStyle = NLC.colors[i];
            ctx.fillRect(offset, 260, run, 20);
            offset += run;
        }
        
        // Draw the indicator for the medal meter line
        var x = this.get('sliderX');
        ctx.fillStyle = "#CC2222";
        ctx.beginPath();
        ctx.moveTo(x    , 277);
        ctx.lineTo(x + 8, 250);
        ctx.lineTo(x - 8, 250);
        ctx.closePath();
        ctx.fill();
        
        // Draw the totaling line
        if(this.get('step') >= 6) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = '4';
            ctx.beginPath();
            ctx.moveTo(250, 180);
            ctx.lineTo(this.get('totalLineX'), 180);
            ctx.stroke();
        }
    }
});

exports.EndOfGameDisplay = EndOfGameDisplay