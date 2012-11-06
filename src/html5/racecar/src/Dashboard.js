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

var cocos = require('cocos2d');
var geo = require('geometry');

var PNode = require('/PerspectiveNode');
var RC = require('/RaceControl');
var MOT = require('/ModifyOverTime');

var LFW = require('/LabelFW');

// Displays the dashboard on the right hand side
// TODO: Add speedometer, race progress, medal tracker, penalty time
function Dashboard (ckpt) {
    Dashboard.superclass.constructor.call(this);
    
    this.zOrder = 100;
    this.checkpoints = ckpt;
    
    // Directory with Dashboard resources
    var dir = '/resources/Dashboard/';
    
    // Medal meter fillings
    this.mms = [];
    this.mms.push(new cocos.nodes.Sprite({file: dir + 'dashBoardMedalBlack.png'}));
    this.mms.push(new cocos.nodes.Sprite({file: dir + 'dashBoardMedalBronze.png'}));
    this.mms.push(new cocos.nodes.Sprite({file: dir + 'dashBoardMedalSilver.png'}));
    this.mms.push(new cocos.nodes.Sprite({file: dir + 'dashBoardMedalGold.png'}));
    
    var offset = 31;
    for(var i=0; i<4; i+=1) {
        this.mms[i].anchorPoint = new geo.Point(0.5, 0);
        this.mms[i].scaleY = this.proportions(4-i) * 0.85;
        this.mms[i].position = new geo.Point(176, offset);
        this.addChild({child: this.mms[i]});
        offset += this.proportions(4-i) * 85;
    }
    
    // A little extra size for the top and bottom to mke sure they are flush with the meter's edges
    var pt = this.mms[0].position;
    pt.y -= 20;
    this.mms[0].position = pt;
    this.mms[0].scaleY = this.mms[0].scaleY + 0.2;
    this.mms[3].scaleY = this.mms[3].scaleY + 0.1;
    
    // Backing of the dashboard
    this.dashBack = new cocos.nodes.Sprite({file: dir + 'dashBoardBack.png'});
    this.dashBack.anchorPoint = new geo.Point(0, 0);
    this.dashBack.position = new geo.Point(-16, -24);
    this.addChild({child: this.dashBack});
    
    // Non-dynamic components of the dashboard display
    this.dashDial = new cocos.nodes.Sprite({file: dir + 'dashBoardDials.png'});
    this.dashDial.anchorPoint = new geo.Point(0, 0);
    this.dashDial.position = new geo.Point(42, 10);
    this.addChild({child: this.dashDial});
    
    // Medal needle
    this.medalNeedle = new cocos.nodes.Sprite({file: dir + 'dashBoardMedalIndicator.png'});
    this.medalNeedle.position = new geo.Point(172, 27);
    this.medalNeedle.rotation = 90;
    this.addChild({child: this.medalNeedle});
    
    // Speedometer needle
    this.speedNeedle = new cocos.nodes.Sprite({file: dir + 'dashBoardNeedle.png'});
    this.speedNeedle.anchorPoint = new geo.Point(0.5, 0.1);
    this.speedNeedle.position = new geo.Point(264, 40);
    this.speedNeedle.rotation = -110;
    this.addChild({child: this.speedNeedle});
    
    // Top layer of the dashboard
    this.dashFront = new cocos.nodes.Sprite({file: dir + 'dashBoardFront.png'});
    this.dashFront.anchorPoint = new geo.Point(0, 0);
    this.dashFront.position = new geo.Point(-32, -47);
    this.addChild({child: this.dashFront});
    
    // Hash marks
    var hash;
    for(var i=0; i<this.checkpoints.length; i+=1) {
        hash = new cocos.nodes.Sprite({file: dir + 'dashBoardHash.png'});
        hash.position = new geo.Point(48, 90 + this.checkpoints[i] / RC.finishLine * 115);
        this.addChild({child: hash});
    }
    
    // Minimap dots
    this.miniDots = []
    
    this.miniDots.push(new cocos.nodes.Sprite({file: dir + 'dashBoardMedalDotGold.png'}));
    this.miniDots[0].position = new geo.Point(50, 90);
    this.addChild({child: this.miniDots[0]});
    
    this.miniDots.push(new cocos.nodes.Sprite({file: dir + 'dashBoardMedalDotSilver.png'}));
    this.miniDots[1].position = new geo.Point(43, 90);
    this.addChild({child: this.miniDots[1]});
    
    this.miniDots.push(new cocos.nodes.Sprite({file: dir + 'dashBoardMedalDotBronze.png'}));
    this.miniDots[2].position = new geo.Point(53, 90);
    this.addChild({child: this.miniDots[2]});
    
    this.miniPlayer = new cocos.nodes.Sprite({file: dir + 'dashBoardMedalDotPlayer.png'});
    this.miniPlayer.position = new geo.Point(46, 90);
    this.addChild({child: this.miniPlayer});
    
    // Label for error count
    var opts = {};
    opts['fontName'] = RC.font;
    opts['string'] = '0';
    opts['fontSize'] = '22';
    this.penaltyCount = new cocos.nodes.Label(opts);
    this.penaltyCount.anchorPoint = new geo.Point(0.5, 0.5);
    this.penaltyCount.position = new geo.Point(120, 140);
    this.addChild({child: this.penaltyCount});
    
    // Label for current speed
    opts['string'] = '0 MPH';
    opts['fontSize'] = '16';
    this.displaySpeed = new cocos.nodes.Label(opts);
    this.displaySpeed.anchorPoint = new geo.Point(1, 0);
    this.displaySpeed.position = new geo.Point(310, 7);
    this.addChild({child: this.displaySpeed});
    
    
    opts['string'] = '.';
    var decimal = new cocos.nodes.Label(opts);
    decimal.position = new geo.Point(42, 0)
    
    // Label for elapsed time
    opts['fontSize'] = '16'
    opts['numDigits'] = 4;
    opts['offset'] = 16;
    delete opts['string'];
    this.elapsedLabel = new LFW(opts);
    this.elapsedLabel.labels[3].position.x += 2
    this.elapsedLabel.setStr('0000');
    this.elapsedLabel.anchorPoint = new geo.Point(0, 0);
    this.elapsedLabel.position = new geo.Point(67, 45);
    this.addChild({child: this.elapsedLabel});
    
    this.elapsedLabel.addChild({child: decimal});
    
    var that = this;
    setTimeout(function() {
        that._updateLabelContentSize();
    }, 500);
    
    this.onlyOnce = false;
}

Dashboard.inherit(cocos.nodes.Node, {
    elapsedTime  : 0,       // Time in race elapsed so far
    elapsedLabel : null,    // Timer displayed to player
    gaugeRadius  : 40,      // Radius of the gauges
    penaltyCount : null,    // Displayed penalty time
    pCount       : 0,       // Stores number of penalties incurred
    speed        : 0,       // Speed for speedometer
    currentSpeed : null,    // Numerically displayed speed
    lastS        : 0,       // Previous frame's speed (for when current frame's speed is 0 due to pausing)
    maxSpeed     : 200,     // Maximum possible speed to display/calculate
    timerAcc     : 1,       // Number of digits to the right of the decimal place for timer accuracy
    pause        : false,   // Stores if the elapsed timer should be paused.
    speedMode    : 2,       // Defines what units to use when displaying speed
    
    // Minimap facilitation
    playerZ      : 0,       // The player's current location (updated by Player)
    goldZ        : 0,		// Z position of the gold medal car (updated by PNode)
    silverZ      : 0,		// Z position of the silver medal car (updated by PNode)
    bronzeZ      : 0,		// Z position of the bronze medal car (updated by PNode)
	checkpoints	 : [],		// Z positions of the checkpoints

    // Adjust the labels to match their content sizes and alignments
    _updateLabelContentSize: function() {
        //this.elapsedLabel._updateLabelContentSize();
        this.penaltyCount._updateLabelContentSize();
        this.displaySpeed._updateLabelContentSize();
    },
    
    // Updates a minimap dot's position
    updateDot: function (dot, val) {
        dot.position.y = Math.min(90 + ((val / RC.finishLine) * 115), 205);
    },
    
    // Starts tracking time and updating the dashboard timer.
    start: function () {
        this.elapsedTime = 0;
        this._updateLabelContentSize();
        this.scheduleUpdate();
    },
    
    // Helper function for grabbing the elapsed + penalty time
    getTotalTime: function () {
        var tt = this.pTime + this.elapsedTime;
        if(tt.toFixed) {
            tt = tt.toFixed(this.timerAcc);
        }
        return tt;
    },
    
    // Changes the current amount of penalty time accured
    modifyPenaltyCount: function() {
        this.pCount += 1;
        this.penaltyCount.string = this.pCount;
        this.penaltyCount._updateLabelContentSize();
    },
    
    // Sets the pause state
    pauseTimer: function () {
        this.pause = true;
    },
    
    // Unsets the pause state
    unpauseTimer: function () {
        this.pause = false;
    },
    
    // Updates the time
    update: function(dt) {
        if(!this.pause) {
            // Update elapsed timer
            this.elapsedTime = (this.elapsedTime + dt);
            var t = this.elapsedTime * 10;
            
            // Only update positive elapsed time
            //TODO: Remove if?  elapsedTime no longer tracks negative time
            if(t > 0) {
                this.elapsedLabel.setStr(t.toFixed(this.timerAcc-1) + '');
            }
        }
        
        // Determine current speed as a percentage of max speed
        var s = this.getSpeed();
        var p = s / this.maxSpeed;
        
        this.speedNeedle.rotation = p * 220 - 110;
        
        // Save this frame's speed for 1 frame
        this.lastS = s;
        
        // Update numerical speedometer
        this.displaySpeed.string = this.getConvertedSpeed();
        this.displaySpeed._updateLabelContentSize();
        
        // Update minimap
        this.updateDot(this.miniPlayer, this.playerZ);
        this.updateDot(this.miniDots[0], this.goldZ);
        this.updateDot(this.miniDots[1], this.silverZ);
        this.updateDot(this.miniDots[2], this.bronzeZ);
        
        // Place the medal meter needle
        //TODO: Remove if?  elapsedTime no longer tracks negative time
        if(this.elapsedTime > 0) {
            this.placeMedalNeedle(this.pHelper(s));
        }
    },
    
    // Get speed converted to specified units
    getConvertedSpeed: function() {
        var s = this.getSpeed();
        
        if(this.speedMode == Dashboard.SPEED_M_PS) {
            if(s.toFixed) {
                s = s.toFixed(0);
            }
            s += ' m/s';
        }
        else if(this.speedMode == Dashboard.SPEED_KM_PH) {
            s = s * 36 / 10;
            if(s.toFixed) {
                s = s.toFixed(0);
            }
            s += ' KPH';
        }
        else if(this.speedMode == Dashboard.SPEED_MI_PH) {
            s = s * 36 / 16;
            if(s.toFixed) {
                s = s.toFixed(0);
            }
            s += ' MPH';
        }
        else {
            console.log('ERROR: Invalid speedMode (  ' + mode + ' )');
            return null;
        }
        
        return s;
    },
    
    // Places the medal meter needle
    placeMedalNeedle: function(p) {
        this.medalNeedle.rotation = 87 + p * 41;
        
        // Placement depends on which quartile the needle needs to be in
        if(p < 0.25) {
            p *= 4;
            
            this.medalNeedle.position = new geo.Point(172, 27 + p * 24);
        }
        else if(p < 0.50) {
            p -= 0.25;
            p *= 4;
            
            this.medalNeedle.position = new geo.Point(171 + p * 6, 51 + p * 22);
        }
        else if(p < 0.75) {
            p -= 0.50;
            p *= 4;
            
            this.medalNeedle.position = new geo.Point(177 + p * 12, 73 + p * 19);
        }
        else {
            p -= 0.75;
            p *= 4; 
            
            this.medalNeedle.position = new geo.Point(189 + p * 13, 92 + p * 17);
        }
    },
    
    // Getter for speed, accounts for the fact that 'speed' is 0 when paused
    getSpeed: function() {
        if(!this.pause) {
            return this.speed;
        }
        return this.lastS;
    },
    
    // Helper function for calculating needle position
    // TODO: Possibly rewrite to account for proportial areas instead of statically sized areas
    pHelper: function (s) {
        // TODO: Add chaseDist back into this, otherwise calculation will be off by part of a meter
        var dc = PNode.cameraZ + 12;
        var tc = this.elapsedTime + this.pCount * RC.penaltyTime;
        
        var te = (Math.max(RC.finishLine - dc, 0) / s) + tc;
        
        var p;
        p = 1 - (te - RC.times[0]) / (RC.times[4] - RC.times[0]);
        p = Math.min(Math.max(p, 0), 1);
        
        return p;
    },
    
    // Helper function that gives area percentage for medal time ranges
    proportions: function (i) {
        return (RC.times[i] - RC.times[i - 1]) / (RC.times[4] - RC.times[0]);
    }
});

// Speed setting constants
Dashboard.SPEED_M_PS = 0;       // Meters per second
Dashboard.SPEED_KM_PH = 1;      // Kilometers per hour
Dashboard.SPEED_MI_PH = 2;      // Miles per hour

module.exports = Dashboard