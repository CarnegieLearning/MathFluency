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
var MAC = require('MathAttackControl').MathAttackControl;
var MOT = require('ModifyOverTime').ModifyOverTime;

GuiNode = cocos.nodes.Node.extend({
    init: function(opts) {
        GuiNode.superclass.init.call(this, opts);
        this._actionComplete = this._actionComplete.bind(this);
    },
    
    // Slides a label in from the right
    slideLabelIn: function (l, d) {
        this.addChild({child: l});
        var a = cocos.actions.MoveTo.create({position: new geo.Point(30, l.get('position').y), duration: d});
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
    amount      : null,     // Displays the points for the line
    medal       : null,     // 
    
    amountT     : 0,        // Numeric total for the result value
    amountLink  : 0,        // Binding value for counting up animation
    
    init: function (name, amt) {
        TotalLine.superclass.init.call(this);
        
        this.amountT = amt;
    
        // Labels for the line
        this.buildLabel('name', name, '#000000', '22', -500);
        this.buildLabel('amount', (amt == 0 ? '0' : amt), '#009900', '34', 190);
        this.amount.set('anchorPoint', new geo.Point(1, 0.5));
    },
    
    // Builds a basic label for the line
    buildLabel: function(l, s, c, z, x) {
        lbl = cocos.nodes.Label.create({string: s, fontName: MAC.font, fontColor: c, fontSize: z});
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
        else if(step == 1) {
            this.totalLabelUp(this.get('amount'), 'amountLink', this.get('amountT'), 0.5);
        }
        else if(step == 2) {
            events.trigger(this, 'animationCompleted');
        }
        
        this.set('step', step + 1);
    }
});

// Responsible for displaying the player's stats at the end of the game
//TODO: Allow for a variable number of totaling lines
EndOfGameDisplay = GuiNode.extend({
    elapsedLabel: null,     // Text label for the elapsed line
    elapsedTime : null,     // Displays the elapsed time
    elapsedLink : 0,        // Holds the raw value of elapsedTime
    lines       : null,     // Holds the sub-TotalLines
    
    totalLabel  : null,     // Label for displaying the total score
    totalLink   : 0,        // Numeric link for the total score
    total       : 0,        // The actual total score
    
    step        : 0,        // Current animation step
    
    timeAmt     : 0.0,      // Elapsed time to display
    abort       : false,    // Abort state of the game
    
    init: function (ta, a, roundScores) {
        EndOfGameDisplay.superclass.init.call(this);
        
        this.set('timeAmt', ta);
        this.set('abort', a);
        
        var lbl;
        this.lines = [];
        for(var i=0; i<roundScores.length; i+=1) {
            // Create the line for each round
            this.lines[i] = TotalLine.create('Round ' + (i+1), roundScores[i]);
            this.lines[i].set('position', new geo.Point(10, 80 + 35*i));
            this.addChild({child: this.lines[i]});
            
            // Sum up the total score
            this.total += roundScores[i];
        }

        lbl = cocos.nodes.Label.create({string: 'Level Completed', fontColor: '#000000', fontSize: '50'});
        lbl.set('position', new geo.Point(240, 20));
        lbl._updateLabelContentSize();
        this.addChild({child: lbl});
        
        // Display the word 'Total' for the total line
        lbl = cocos.nodes.Label.create({string: 'Total', fontColor: '#000000', fontSize:'22'});
        lbl.set('position', new geo.Point(300, 80));
        lbl.set('anchorPoint', new geo.Point(1, 0.5));
        this.set('totalTag', lbl);
        
        // Holds overall total
        lbl = cocos.nodes.Label.create({string: '0', fontColor: '#009900', fontSize: '50'});
        lbl.set('position', new geo.Point(310, 80));
        lbl.set('anchorPoint', new geo.Point(0, 0.5));
        this.set('totalLabel', lbl);
    },
    
    //TODO: Really should be a util function, or put in cocos.nodes.Node
    scaleTo: function(s, x, y) {
        var c = s.get('contentSize');
        s.set('scaleX', x / c.width);
        s.set('scaleY', y / c.height);
    },
    
    // Called every frame
    update: function(dt) {
        for(var i=0; i<this.lines.length; i+=1) {
            this.fix(this.lines[i].get('amount'), this.lines[i].get('amountLink'), 0);
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
        
        // Display all the rounds in a staggered procession
        if(step == 0) {
            var that = this;
            var hack = 0;
            for(var i=0; i<this.lines.length; i+=1) {
                setTimeout(function () {that.lines[hack].start(); hack += 1;}, (i+1)*100);
            }
            events.addListener(this.lines[this.lines.length-1], 'animationCompleted', this.next.bind(this));
        }
        else if(step == 1) {
            this.showLabel(this.totalTag, 0.2);
        }
        else if(step == 2) {
            this.totalLabelUp(this.totalLabel, 'totalLink', this.total, 1)
        }
        else if(step == 3) {
            var dir = '/resources/medal_'
            if(this.get('abort') || this.total < MAC.medalScores[3]) {
                this.medal = cocos.nodes.Sprite.create({file: dir + 'none.png'});
                this.medalLab1 = cocos.nodes.Label.create({string: 'Try for a higher', fontColor: '#C0C0C0', fontName: MAC.font, fontSize: '22'});
                this.medalLab2 = cocos.nodes.Label.create({string: 'score to get a medal', fontColor: '#C0C0C0', fontName: MAC.font, fontSize: '22'});
            }
            else if(this.total > MAC.medalScores[1]) {
                this.medal = cocos.nodes.Sprite.create({file: dir + 'gold.png'});
                this.medalLab1 = cocos.nodes.Label.create({string: 'You earned a', fontColor: '#FFD700', fontName: MAC.font, fontSize: '22'});
                this.medalLab2 = cocos.nodes.Label.create({string: 'Gold Medal', fontColor: '#FFD700', fontName: MAC.font, fontSize: '22'});
            }
            else if(this.total > MAC.medalScores[2]) {
                this.medal = cocos.nodes.Sprite.create({file: dir + 'silver.png'});
                this.medalLab1 = cocos.nodes.Label.create({string: 'You earned a', fontColor: '#C0C0C0', fontName: MAC.font, fontSize: '22'});
                this.medalLab2 = cocos.nodes.Label.create({string: 'Silver Medal', fontColor: '#C0C0C0', fontName: MAC.font, fontSize: '22'});
            }
            else {
                this.medal = cocos.nodes.Sprite.create({file: dir + 'bronze.png'});
                this.medalLab1 = cocos.nodes.Label.create({string: 'You earned a', fontColor: '#CD7F32', fontName: MAC.font, fontSize: '22'});
                this.medalLab2 = cocos.nodes.Label.create({string: 'Bronze Medal', fontColor: '#CD7F32', fontName: MAC.font, fontSize: '22'});
            }
            
            this.medal.set('position', new geo.Point(290, 160));
            this.addChild({child: this.medal});
            
            this.medalLab1.set('position', new geo.Point(360, 160));
            this.medalLab1.set('anchorPoint', new geo.Point(0, 1));
            this.addChild({child: this.medalLab1});
            
            this.medalLab2.set('position', new geo.Point(360, 160));
            this.medalLab2.set('anchorPoint', new geo.Point(0, 0));
            this.addChild({child: this.medalLab2});
            
            setTimeout(this.next.bind(this), 250);
        }
        else
            events.trigger(this, 'animationCompleted');
        
        this.set('step', step + 1);
    },
});

exports.EndOfGameDisplay = EndOfGameDisplay