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
var geom = require('geometry');

var PNode = require('PerspectiveNode').PerspectiveNode;
var RC = require('RaceControl').RaceControl;
var MOT = require('ModifyOverTime').ModifyOverTime;

// Displays the dashboard on the right hand side
// TODO: Add speedometer, race progress, medal tracker, penalty time
var Dashboard = cocos.nodes.Node.extend({
    elapsedTime  : 0,       // Time in race elapsed so far
    displayTime  : null,    // Timer displayed to player
    
    gaugeRadius  : 40,      // Radius of the gauges
    
    penaltyTime  : null,    // Displayed penalty time
    pTime        : 0.0,     // Stores numerical penalty time
    
    speed        : 0,       // Speed for speedometer
    currentSpeed : null,    // Numerically displayed speed
    lastS        : 0,       // Previous frame's speed
    maxSpeed     : 200,     // Maximum possible speed to display/calculate (in m/s)
    speedGaugeY  : 230,     // Y location of the speedometer
    
    timerAcc     : 3,       // Number of digits to the right of the decimal place for timer accuracy
    pause        : false,   // Stores if the elapsed timer should be paused.
    speedMode    : 2,       // 0: m/s 1: kph 2: mph
    
    displayMedal : null,    // Holds the text representation for the current medal the player in on track to get
    medalGaugeY  : 360,     // Y location of the medal meter
    
    playerZ      : 0,       // The player's current location
    goldZ        : 0,		// Z position of the gold medal car
    silverZ      : 0,		// Z position of the silver medal car 
    bronzeZ      : 0,		// Z position of the bronze medal car
	checkpoints	 : [],		// Z positions of the checkpoints
    minimapTopY  : 450,     // Y location of the top of the minimap
    minimapBotY  : 520,     // Y location of the bottom of the minimap
    minimapDist  : 70,      // Distance between the top and bottom of the minimap
    
    init: function() {
        Dashboard.superclass.init.call(this);
        
        this.set('zOrder', 100);
        
        this.bg = cocos.nodes.Sprite.create({file: '/resources/snow_sidebar.png',});
        this.bg.set('anchorPoint', new geom.Point(0, 0));
        this.bg.set('zOrder', -1);
        this.addChild({child: this.bg});
        
        this._scaleTo(this.bg, 100, 600);
        
        // Create the visible timer
        this.buildLabel('Elapsed Time', 65);
        this.set('displayTime', this.buildLabel('0.000', 80));
        
        // Create visible penalty timer
        this.buildLabel('Penalty Time', 110);
        this.set('penaltyTime', this.buildLabel('0.000', 125));
        
        // Create numerical speedometer
        this.buildLabel('Speed', this.speedGaugeY + 20);
        this.set('displaySpeed', this.buildLabel('0', this.speedGaugeY + 35));
        
        // Create textual medal meter
        this.buildLabel('Medal', this.medalGaugeY + 20);
        this.set('displayMedal', this.buildLabel(' - ', this.medalGaugeY + 35));
    },
    
    // Helper function for building labels
    buildLabel: function (s, y) {
        var label = cocos.nodes.Label.create({string: s});
        label.set('position', new geom.Point(5, y));
        label.set('anchorPoint', new geom.Point(0, 0.5));
        this.addChild({child: label});
        
        return label;
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
    modifyPenaltyTime: function(dt) {
        MOT.create(this.get('pTime'), dt, 1.0).bindTo('value', this, 'pTime');
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
            
            if(t > 0) {
                this.displayTime.set('string', t.toFixed(this.timerAcc));
            }
        }
        
        // Update penalty timer
        this.penaltyTime.set('string', parseFloat(this.get('pTime')).toFixed(this.timerAcc));
        
        // Update numerical speedometer
        this.displaySpeed.set('string', this.getConvertedSpeed());
    },
    
    // Updates the text under the medal meter to the indicated medal
    updateMedalText: function(p) {
        var txt;
        
        if(p > 0.75) {
            txt = 'Gold';
        }
        else if(p > 0.5) {
            txt = 'Silver';
        }
        else if(p > 0.25) {
            txt = 'Bronze';
        }
        else {
            txt = ' - ';
        }
        
        this.displayMedal.set('string', txt);
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
    
    // Getter for speed, accounts for the fact that 'speed' is 0 when paused
    getSpeed: function() {
        if(!this.pause) {
            return this.get('speed');
        }
        return this.lastS;
    },
    
    // Helper function for creating an arc of a circle filled with color
    fillArc: function (c, x, y, r, s, e, b) {
        c.beginPath();
        s += Math.PI;
        c.arc(x, y, r, s, s + e, b);
        c.lineTo(x, y);
        c.closePath();
        c.fill();
    },
    
    // Draws the dash
    draw: function(context) {
        // Speedometer
        var r = this.gaugeRadius;
        
        // Interior fills
        context.fillStyle = '#202020';
        this.fillArc(context, 50, this.speedGaugeY, r, 0               , Math.PI * 5 / 6, false);
        context.fillStyle = '#FF8C00';
        this.fillArc(context, 50, this.speedGaugeY, r, Math.PI / 12 * 9, Math.PI / 12   , false);
        context.fillStyle = '#DD1111';
        this.fillArc(context, 50, this.speedGaugeY, r, Math.PI / 6 * 5 , Math.PI / 6    , false);
        
        // Hash marks
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = "2";
        var maxStep = 6
        for(var step = 1; step < maxStep; step += 1) {
            context.beginPath();
            context.moveTo(Math.sin(step*Math.PI/maxStep - Math.PI/2)*r + 50, Math.cos(step*Math.PI/maxStep - Math.PI/2)*-r + this.speedGaugeY);
            context.lineTo(Math.sin(step*Math.PI/maxStep - Math.PI/2)*(r-10) + 50, Math.cos(step*Math.PI/maxStep - Math.PI/2)*-(r-10) + this.speedGaugeY)
            context.closePath();
            context.stroke();
        }
        
        // Gauge frame
        context.strokeStyle = "#000000";
        context.lineWidth = "4";
        context.beginPath();
        context.arc(50, this.speedGaugeY, r, 0, Math.PI, true);
        context.lineTo(10, this.speedGaugeY);
        context.closePath();
        context.stroke();
        
        var s = this.getSpeed();
        var maxs = this.maxSpeed;
        
        // Needle outline
        context.beginPath();
        context.moveTo(50, this.speedGaugeY);
        context.lineTo(Math.sin(s*Math.PI/maxs - Math.PI/2)*r + 50, Math.cos(s*Math.PI/maxs - Math.PI/2)*-r + this.speedGaugeY);
        context.closePath();
        context.stroke();
        
        // Needle
        context.strokeStyle = "#11CC22";
        context.lineWidth = "2";
        context.beginPath();
        context.moveTo(50, this.speedGaugeY);
        context.lineTo(Math.sin(s*Math.PI/maxs - Math.PI/2)*r + 50, Math.cos(s*Math.PI/maxs - Math.PI/2)*-r + this.speedGaugeY);
        context.closePath();
        context.stroke();
        
        this.set('lastS', s);
        
        // Medalmeter
        
        // Interior fills
        context.fillStyle = RC.noMedal;
        this.fillArc(context, 50, this.medalGaugeY, r, 0,               Math.PI / 4, false);
        context.fillStyle = RC.bronze;
        this.fillArc(context, 50, this.medalGaugeY, r, Math.PI / 4,     Math.PI / 4, false);
        context.fillStyle = RC.silver;
        this.fillArc(context, 50, this.medalGaugeY, r, Math.PI / 2,     Math.PI / 4, false);
        context.fillStyle = RC.gold;
        this.fillArc(context, 50, this.medalGaugeY, r, Math.PI / 4 * 3, Math.PI / 4, false);
        
        // Gauge frame
        context.strokeStyle = "#000000";
        context.lineWidth = "4";
        context.beginPath();
        context.arc(50, this.medalGaugeY, r, 0, Math.PI, true);
        context.lineTo(10, this.medalGaugeY);
        context.closePath();
        context.stroke();
        
        
        // Negative time is bad for calculating the medal meter
        if(this.get('elapsedTime') > 0) {
            var p = this.pHelper(s);
            
            this.updateMedalText(p);
            
            // Needle outline
            context.strokeStyle = "000000";
            context.lineWidth = "4";
            context.beginPath();
            context.moveTo(50, this.medalGaugeY);
            context.lineTo(Math.sin(Math.PI*p - Math.PI/2)*r + 50, Math.cos(Math.PI*p - Math.PI/2)*-r + this.medalGaugeY)
            context.closePath();
            context.stroke();
            
            // Needle
            context.strokeStyle = "#11CC22";
            context.lineWidth = "2";
            context.beginPath();
            context.moveTo(50, this.medalGaugeY);
            context.lineTo(Math.sin(Math.PI*p - Math.PI/2)*r + 50, Math.cos(Math.PI*p - Math.PI/2)*-r + this.medalGaugeY)
            context.closePath();
            context.stroke();
            
            var m = this.pHelper(maxs);
            
            // Impossible grayed out area
            context.fillStyle = 'rgba(0,0,0,0.4)';
            this.fillArc(context, 50, this.medalGaugeY, r, Math.PI, -1 * Math.PI * (1 - m), true);
        }
        
		// Draw minimap
        context.strokeStyle = "#FFFFFF";
        context.lineWidth = "2";
        context.beginPath();
        context.moveTo(50, this.minimapTopY);
        context.lineTo(50, this.minimapBotY)
        context.closePath();
        context.stroke();
        
        context.beginPath();
        context.moveTo(45, this.minimapTopY);
        context.lineTo(55, this.minimapTopY)
        context.closePath();
        context.stroke();
        
        context.beginPath();
        context.moveTo(45, this.minimapBotY);
        context.lineTo(55, this.minimapBotY);
        context.closePath();
        context.stroke();
		
		// Checkpoint hashmarks
		var cp = this.get('checkpoints')
		for(var i=0; i<cp.length; i++) {
			context.beginPath();
			context.moveTo(45, this.minimapBotY - this.minimapDist * cp[i] / RC.finishLine);
			context.lineTo(55, this.minimapBotY - this.minimapDist * cp[i] / RC.finishLine)
			context.closePath();
			context.stroke();
		}
        
        var colors = [RC.bronze, RC.silver, RC.gold]
        var pos = [this.get('bronzeZ'), this.get('silverZ'), this.get('goldZ')]
        
        for(var i = 0; i < 3; i++) {
            var p = pos[i] / RC.finishLine;
            if(p > 1) {
                p = 1;
            }
        
            context.fillStyle = "#000000";
            context.beginPath();
            context.arc(53, this.minimapBotY - this.minimapDist * p, 5, 0, Math.PI * 2);
            context.closePath();
            context.fill();
            
            context.fillStyle = colors[i];
            context.beginPath();
            context.arc(53, this.minimapBotY - this.minimapDist * p, 4, 0, Math.PI * 2);
            context.closePath();
            context.fill();
        }
        
        context.fillStyle = "#000000";
        context.beginPath();
        context.arc(47, this.minimapBotY - this.minimapDist * (this.get('playerZ') / RC.finishLine), 5, 0, Math.PI * 2);
        context.closePath();
        context.fill();
        
        context.fillStyle = "#22DD22";
        context.beginPath();
        context.arc(47, this.minimapBotY - this.minimapDist * (this.get('playerZ') / RC.finishLine), 4, 0, Math.PI * 2);
        context.closePath();
        context.fill();
    },
    
    _scaleTo: function(s, x, y) {
        var c = s.get('contentSize');
        
        s.set('scaleX', x / c.width);
        s.set('scaleY', y / c.height);
    },
    
    // Helper function for calculating needle position
    // TODO: Possibly rewrite to account for proportial areas instead of statically sized areas
    pHelper: function (s) {
        // TODO: Add chaseDist back into this, otherwise calculation will be off by part of a meter
        var dc = PNode.cameraZ + 6;
        var tc = this.elapsedTime + this.get('pTime');
        
        var dr = Math.max(RC.finishLine - dc, 0);
        var tr = dr / s;
        var te = tr + tc;
        
        var p;
        
        for(var i=1; i<5; i+=1) {
        
            if(te < RC.times[i] || i==4) {
                p = 1 - (te - RC.times[i-1]) / (RC.times[i] - RC.times[i-1]);
                p = Math.min(Math.max(p, 0), 1);
                
                return p / 4 + (1 - 0.25 * i);
            }
        }
    },
});

// Speed setting constants
Dashboard.SPEED_M_PS = 0;
Dashboard.SPEED_KM_PH = 1;
Dashboard.SPEED_MI_PH = 2;

exports.Dashboard = Dashboard