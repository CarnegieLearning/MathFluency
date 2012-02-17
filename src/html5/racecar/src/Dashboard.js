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

var PNode = require('PerspectiveNode').PerspectiveNode;
var RC = require('RaceControl').RaceControl;
var MOT = require('ModifyOverTime').ModifyOverTime;

// Displays the dashboard on the right hand side
// TODO: Add speedometer, race progress, medal tracker, penalty time
var Dashboard = cocos.nodes.Node.extend({
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
    speedMode    : 2,       // 0: m/s 1: kph 2: mph
    
    // Minimap facilitation
    playerZ      : 0,       // The player's current location
    goldZ        : 0,		// Z position of the gold medal car
    silverZ      : 0,		// Z position of the silver medal car 
    bronzeZ      : 0,		// Z position of the bronze medal car
	checkpoints	 : [],		// Z positions of the checkpoints
    
    init: function(ckpt) {
        Dashboard.superclass.init.call(this);
        
        this.set('zOrder', 100);
        this.cycle = 0;
        this.checkpoints = ckpt;
        
        var dir = '/resources/Dashboard/';
        
        // Medal meter fillings
        this.mms = [];
        this.mms.push(cocos.nodes.Sprite.create({file: dir + 'dashBoardMedalBlack.png'}));
        this.mms.push(cocos.nodes.Sprite.create({file: dir + 'dashBoardMedalBronze.png'}));
        this.mms.push(cocos.nodes.Sprite.create({file: dir + 'dashBoardMedalSilver.png'}));
        this.mms.push(cocos.nodes.Sprite.create({file: dir + 'dashBoardMedalGold.png'}));
        
        var offset = -31;
        for(var i=0; i<4; i+=1) {
            this.mms[i].set('anchorPoint', new geo.Point(0.5, 1));
            this.mms[i].set('scaleY', this.proportions(4-i) * 0.85);
            this.mms[i].set('position', new geo.Point(176, offset));
            this.addChild({child: this.mms[i]});
            offset -= this.proportions(4-i) * 85;
        }
        
        var pt = this.mms[0].get('position');
        pt.y += 20;
        this.mms[0].get('position', pt);
        this.mms[0].set('scaleY', this.mms[0].get('scaleY') + 0.2);
        this.mms[3].set('scaleY', this.mms[3].get('scaleY') + 0.1);
        
        // Backing of the dashboard
        this.dashBack = cocos.nodes.Sprite.create({file: dir + 'dashBoardBack.png'});
        this.dashBack.set('anchorPoint', new geo.Point(0, 1));
        this.dashBack.set('position', new geo.Point(-16, 24));
        this.addChild({child: this.dashBack});
        
        // Non-dynamic components of the dashboard display
        this.dashDial = cocos.nodes.Sprite.create({file: dir + 'dashBoardDials.png'});
        this.dashDial.set('anchorPoint', new geo.Point(0, 1));
        this.dashDial.set('position', new geo.Point(42, -10));
        this.addChild({child: this.dashDial});
        
        // Medal needle
        this.medalNeedle = cocos.nodes.Sprite.create({file: dir + 'dashBoardMedalIndicator.png'});
        this.medalNeedle.set('position', new geo.Point(172, -27));
        this.medalNeedle.set('rotation', 90);
        this.addChild({child: this.medalNeedle});
        
        // Speedometer needle
        this.speedNeedle = cocos.nodes.Sprite.create({file: dir + 'dashBoardNeedle.png'});
        this.speedNeedle.set('anchorPoint', new geo.Point(0.5, 0.9));
        this.speedNeedle.set('position', new geo.Point(264, -40));
        this.speedNeedle.set('rotation', -110);
        this.addChild({child: this.speedNeedle});
        
        // Top layer of the dashboard
        this.dashFront = cocos.nodes.Sprite.create({file: dir + 'dashBoardFront.png'});
        this.dashFront.set('anchorPoint', new geo.Point(0, 1));
        this.dashFront.set('position', new geo.Point(-32, 47));
        this.addChild({child: this.dashFront});
        
        // Hash marks
        var hash;
        
        for(var i=0; i<this.checkpoints.length; i+=1) {
            hash = cocos.nodes.Sprite.create({file: dir + 'dashBoardHash.png'});
            hash.set('position', new geo.Point(48, -90 - this.checkpoints[i] / RC.finishLine * 115));
            this.addChild({child: hash});
        }
        
        // Minimap dots
        this.miniBronze = cocos.nodes.Sprite.create({file: dir + 'dashBoardMedalDotBronze.png'});
        this.miniBronze.set('position', new geo.Point(53, -90));
        this.addChild({child: this.miniBronze});
        
        this.miniSilver = cocos.nodes.Sprite.create({file: dir + 'dashBoardMedalDotSilver.png'});
        this.miniSilver.set('position', new geo.Point(43, -90));
        this.addChild({child: this.miniSilver});
        
        this.miniGold = cocos.nodes.Sprite.create({file: dir + 'dashBoardMedalDotGold.png'});
        this.miniGold.set('position', new geo.Point(50, -90));
        this.addChild({child: this.miniGold});
        
        this.miniPlayer = cocos.nodes.Sprite.create({file: dir + 'dashBoardMedalDotPlayer.png'});
        this.miniPlayer.set('position', new geo.Point(46, -90));
        this.addChild({child: this.miniPlayer});
        
        var opts = {};
        opts['string'] = '0.0';
        opts['fontName'] = 'Android Nation Italic';
        opts['fontSize'] = '14'
        this.elapsedLabel = cocos.nodes.Label.create(opts);
        this.elapsedLabel.set('anchorPoint', new geo.Point(1, 1));
        this.elapsedLabel.set('position', new geo.Point(120, -50));
        this.addChild({child: this.elapsedLabel});
        
        opts['string'] = '0';
        opts['fontSize'] = '20';
        this.penaltyCount = cocos.nodes.Label.create(opts);
        this.penaltyCount.set('anchorPoint', new geo.Point(1, 0.5));
        this.penaltyCount.set('position', new geo.Point(130, -140));
        this.addChild({child: this.penaltyCount});
        
        opts['string'] = '0 MPH';
        opts['fontSize'] = '14';
        this.displaySpeed = cocos.nodes.Label.create(opts);
        this.displaySpeed.set('anchorPoint', new geo.Point(1, 1));
        this.displaySpeed.set('position', new geo.Point(310, -7));
        this.addChild({child: this.displaySpeed});
    },
    
    updateDot: function (dot, val) {
        var pt = dot.get('position');
        pt.y = Math.max(-90 - ((val / RC.finishLine) * 115), -205);
        dot.set('position', pt);
    },
    
    // Starts tracking time and updating the dashboard timer.
    start: function () {
        this.set('elapsedTime', 0)
        this.scheduleUpdate();
    },
    
    // Helper function for grabbing the elapsed + penalty time
    getTotalTime: function () {
        var tt = this.get('pTime') + this.elapsedTime;
        if(tt.toFixed) {
            tt = tt.toFixed(this.timerAcc);
        }
        return tt;
    },
    
    // Changes the current amount of penalty time accured
    modifyPenaltyCount: function() {
        this.pCount += 1;
        this.penaltyCount.set('string', this.pCount);
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
            var t = this.get('elapsedTime') + dt;
            this.set('elapsedTime', t);
            this.cycle += dt;
            
            if(t > 0) {
                this.elapsedLabel.set('string', t.toFixed(this.timerAcc) + ' ');
                
                // Only update size/position on major digit changes
                if(this.cycle > 9.94) {
                    this.elapsedLabel._updateLabelContentSize();
                    this.cycle -= 10;
                }
            }
        }
        
        var s = this.getSpeed();
        var p = s / this.maxSpeed;
        
        this.speedNeedle.set('rotation', p * 220 - 110);
        
        this.set('lastS', s);
        
        // Update numerical speedometer
        this.displaySpeed.set('string', this.getConvertedSpeed());
        this.displaySpeed._updateLabelContentSize();
        
        this.updateDot(this.miniPlayer, this.get('playerZ'));
        this.updateDot(this.miniGold, this.get('goldZ'));
        this.updateDot(this.miniSilver, this.get('silverZ'));
        this.updateDot(this.miniBronze, this.get('bronzeZ'));
        
        if(this.get('elapsedTime') > 0) {
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
            s += ' kph';
        }
        else if(this.speedMode == Dashboard.SPEED_MI_PH) {
            s = s * 36 / 16;
            if(s.toFixed) {
                s = s.toFixed(0);
            }
            s += ' mph';
        }
        else {
            console.log('Invalid speedMode = ' + mode);
            return null;
        }
        
        return s;
    },
    
    // Places the medal meter needle
    
    placeMedalNeedle: function(p) {
        this.medalNeedle.set('rotation', 87 + p * 41);
        
        if(p < 0.25) {
            p *= 4;
            
            this.medalNeedle.set('position', new geo.Point(172, -27 - p * 24));
        }
        else if(p < 0.50) {
            p -= 0.25;
            p *= 4;
            
            this.medalNeedle.set('position', new geo.Point(171 + p * 6, -51 - p * 22));
        }
        else if(p < 0.75) {
            p -= 0.50;
            p *= 4;
            
            this.medalNeedle.set('position', new geo.Point(177 + p * 12, -73 - p * 19));
        }
        else {
            p -= 0.75;
            p *= 4; 
            
            this.medalNeedle.set('position', new geo.Point(189 + p * 13, -92 - p * 17));
        }
    },
    
    // Getter for speed, accounts for the fact that 'speed' is 0 when paused
    getSpeed: function() {
        if(!this.pause) {
            return this.get('speed');
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
Dashboard.SPEED_M_PS = 0;
Dashboard.SPEED_KM_PH = 1;
Dashboard.SPEED_MI_PH = 2;

exports.Dashboard = Dashboard