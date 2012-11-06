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

// Project imports
var LabelStroke = require('/LabelStroke');

// Static imports
var RC = require('/RaceControl');
var MOT = require('/ModifyOverTime');

function GuiNode (opts) {
    GuiNode.superclass.constructor.call(this, opts);
    this._actionComplete = this._actionComplete.bind(this);
}
    
GuiNode.inherit(cocos.nodes.Node, {
    // Slides a label in from the right
    slideLabelIn: function (l, d) {
        this.addChild({child: l});
        var a = new cocos.actions.MoveTo({position: new geo.Point(15, l.position.y), duration: d});
        a.startWithTarget(l);
        l.runAction(a);
        
        events.addListener(a, 'actionComplete', this._actionComplete);
    },
    
    // Totals a label up over time
    totalLabelUp: function(link, value, duration) {
        var m = new MOT(0.0, value, duration);
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
function EndOfGameDisplay (ta, np, a) {
    EndOfGameDisplay.superclass.constructor.call(this);

    this.timeAmt = ta;
    this.numPenalty = np;
    this.abort = a;

    var lbl;
    var opts = {};
    
    // Back Pane /////////////////////////////////////////////////////////////////////////////////////////////////
    
    var dir = '/resources/EndScreen/';
    this.backPane = new cocos.nodes.Sprite({file: dir + 'signEndScreenBack.png'});
    this.backPane.anchorPoint = new geo.Point(0, 0);
    this.backPane.zOrder = -5;
    this.addChild(this.backPane);
    
    // Between Pane ///////////////////////////////////////////////////////////////////////////////////////////////
    
    this.medalBars = [];
    
    this.medalBars.push(new cocos.nodes.Sprite({file: dir + 'EndScreenIndicatorBlack.png'}));
    this.medalBars.push(new cocos.nodes.Sprite({file: dir + 'EndScreenIndicatorBronze.png'}));
    this.medalBars.push(new cocos.nodes.Sprite({file: dir + 'EndScreenIndicatorSilver.png'}));
    this.medalBars.push(new cocos.nodes.Sprite({file: dir + 'EndScreenIndicatorGold.png'}));
    
    var offset = 325;
    for(var i=0; i<4; i+=1) {
        this.medalBars[i].anchorPoint = new geo.Point(0, 0.5);
        this.medalBars[i].scaleX = this.proportions(4-i);
        this.medalBars[i].position = new geo.Point(offset, 270);
        this.medalBars[i].zOrder = -3;
        this.addChild({child: this.medalBars[i]});
        offset += this.proportions(4-i) * 235;
    }
    
    this.totalTimeBG = [];
    
    this.totalTimeBG.push(new cocos.nodes.Sprite({file: dir + 'sub-bg-0.png'}));
    this.totalTimeBG.push(new cocos.nodes.Sprite({file: dir + 'sub-bg-1.png'}));
    this.totalTimeBG.push(new cocos.nodes.Sprite({file: dir + 'sub-bg-2.png'}));
    this.totalTimeBG.push(new cocos.nodes.Sprite({file: dir + 'sub-bg-3.png'}));
    
    for(var i=0; i<4; i+=1) {
        this.totalTimeBG[i].position = new geo.Point(282, 31);
        this.totalTimeBG[i].anchorPoint = new geo.Point(0, 0);
        this.totalTimeBG[i].zOrder = -3;
    }
    
    this.addChild({child: this.totalTimeBG[0]});
    
    this.slider = new cocos.nodes.Sprite({file: dir + 'signEndScreenIndicator.png'});
    this.slider.position = new geo.Point(325, 288);
    this.addChild({child: this.slider});
    
    this.medals = []
    
    this.medals.push(new cocos.nodes.Sprite({file: '/resources/Medals/bronzeMedal.png'}));
    this.medals.push(new cocos.nodes.Sprite({file: '/resources/Medals/silverMedal.png'}));
    this.medals.push(new cocos.nodes.Sprite({file: '/resources/Medals/goldMedal.png'}));
    this.medals[0].position = new geo.Point(670, 230);
    this.medals[1].position = new geo.Point(670, 230);
    this.medals[2].position = new geo.Point(670, 230);
    
    // Front Pane /////////////////////////////////////////////////////////////////////////////////////////////////
    
    this.frontPane = new cocos.nodes.Sprite({file: dir + 'signEndScreenFront.png'});
    this.frontPane.anchorPoint = new geo.Point(0, 0);
    this.frontPane.zOrder = -1;
    this.addChild(this.frontPane);
    
    // On Top /////////////////////////////////////////////////////////////////////////////////////////////////////
    
    this.buildLabel('elapsedMin',   438, 174, '0',   '18', '#000000');
    this.buildLabel('elapsedSec',   535, 174, '0.0', '18', '#000000');
    this.buildLabel('penaltyCount', 120, 114, '0',   '18', '#000000');
    this.buildLabel('penaltyCost',  268, 114, '0',   '18', '#000000');
    this.buildLabel('penaltyMin',   427, 114, '0',   '18', '#000000');
    this.buildLabel('penaltySec',   524, 114, '0.0', '18', '#000000');
    this.bldLStroke('totalMin',     360, 58,  '0',   '26', '#FFFFFF');
    this.bldLStroke('totalSec',     510, 58,  '0.0', '26', '#FFFFFF');
    
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
}

EndOfGameDisplay.inherit(GuiNode, {
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
    state           : 0,
    
    timeAmt         : 0.0,      // Elapsed time to display
    numPenalty      : 0,        // Number of penalties incurred
    abort           : false,    // Abort state of the game
    
    sliderX         : 325,      // X location of the slider on the medal line

    // Helper function to build labels
    buildLabel: function(n, x, y, s, fs, fc) {
        var temp = new cocos.nodes.Label({string: s, fontName: RC.font, fontSize: fs, fontColor: fc});
        temp.anchorPoint = new geo.Point(1, 0);
        temp.position = new geo.Point(x, y);
        this.addChild({child: temp});
        this[n] = temp;
    },
    
    bldLStroke: function(n, x, y, s, fs, fc) {
        var temp = new LabelStroke({string: s, fontName: RC.font, fontSize: fs, fontColor: fc});
        temp.anchorPoint = new geo.Point(1, 0);
        temp.position = new geo.Point(x, y);
        this.addChild({child: temp});
        this[n] = temp;
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
        
        this.slider.position = new geo.Point(this.sliderX, 288);
        
        // Show medal based on current slider progress
        if(this.state == 0 && this.sliderX > this.medalBars[1].position.x) {
            // Log that the first threshold has was passed
            this.state = 1;
            
            // Remove no medal, display bronze
            this.removeChild({child: this.totalTimeBG[0]});
            this.addChild({child: this.totalTimeBG[1]});
            this.addChild({child: this.medals[0]});
            
            // Change total time to black stroke color for better visibility
            this.totalSec.fontColor = '#000000';
            this.totalMin.fontColor = '#000000';
        }
        else if(this.state == 1 && this.sliderX > this.medalBars[2].position.x) {
            // Log that second threshold was passed
            this.state = 2;
            
            // Remove bronze, display silver
            this.removeChild({child: this.totalTimeBG[1]});
            this.addChild({child: this.totalTimeBG[2]});
            this.removeChild({child: this.medals[0]});
            this.addChild({child: this.medals[1]});
        }
        else if(this.state == 2 && this.sliderX > this.medalBars[3].position.x) {
            // Log that the final threshold was passed
            this.state = 3;
            
            // Remove silver, display gold
            this.removeChild({child: this.totalTimeBG[2]});
            this.addChild({child: this.totalTimeBG[3]});
            this.removeChild({child: this.medals[1]});
            this.addChild({child: this.medals[2]});
        }
    },
    
    // Keeps the label's string value fixed to the specified precision
    fix: function(l, v, p) {
        f = parseFloat(v);
        l.string = f.toFixed(p);
        l._updateLabelContentSize();
    },
    
    // Start the animation sequence
    start: function() {
        events.addListener(this, 'actionComplete', this.next.bind(this));
        this.next();
    },
    
    // Begins the next step in the animation process
    next: function() {
        if(this.step == 0) {
            this.totalLabelUp('esl', this.timeAmt, 1.5);
        }
        
        else if(this.step == 1) {
            if(this.numPenalty > 0) {
                this.totalLabelUp('psl', this.numPenalty * RC.penaltyTime, 1.5);
                this.totalLabelUp('pnl', this.numPenalty, 1.5);
            }
            else {
                this.step += 2;
                this.next();
                return;
            }
        }
        // Next step = step+2 because each totalLabelUp() increments step on completion
        else if(this.step == 3) {
            this.totalTime = this.timeAmt + this.numPenalty * RC.penaltyTime;
            this.totalLabelUp('tsl', this.totalTime, 2.5);
            
            var x;
            if(this.abort)
                x = 0;
            else
                x = 235 * (1 - (this.totalTime - RC.times[0]) / (RC.times[4] - RC.times[0]));
                
            x = Math.max(0, x);
            
            var m = new MOT(this.sliderX, x, 2.5);
            m.bind(this, 'sliderX');
        }
        
        else if(this.step == 4) {
            //Signals "Retry" and "Next Level" buttons to appear
            //events.trigger(this, 'almostComplete');
            
            var that = this;
            setTimeout(function() {
                events.trigger(that, 'actionComplete');
            }, 4000);
        }
        
        else if(this.step == 4) {
            events.trigger(this, 'complete');
        }
        
        this.step += 1;
    },
    
    // Helper function that gives area percentage for medal time ranges
    proportions: function (i) {
        return (RC.times[i] - RC.times[i - 1]) / (RC.times[4] - RC.times[0]);
    }
});
//<div class="cocos2d-app"> <script src="racecar/init.js" type="text/javascript""></script>
module.exports = EndOfGameDisplay;