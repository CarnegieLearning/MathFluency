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
    maxSpeed     : 200,     // Maximum possible speed to display/calculate
    timerAcc     : 3,       // Number of digits to the right of the decimal place for timer accuracy
    pause        : false,   // Stores if the elapsed timer should be paused.
    speedMode    : 2,       // 0: m/s 1: kph 2: mph
    displayMedal : null,    // Holds the text representation for the current medal the player in on track to get
    
    init: function() {
        Dashboard.superclass.init.call(this);
        
        this.set('zOrder', 100);
        
        var opts = Object();
        
        var png = cocos.nodes.Sprite.create({file: "/resources/dash.png"});
        png.set('anchorPoint', new geom.Point(0, 0));
        png.set('zOrder', -5);
        this.addChild({child: png});
        
        /*
        // Create the visible timer
        opts['string'] = 'Elapsed Time';
        var disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(5, 35));
        disp.set('anchorPoint', new geom.Point(0, 0.5));
        this.addChild({child: disp});
        */
        opts['string'] = '0.000';
        disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(5, 50));
        disp.set('anchorPoint', new geom.Point(0, 0.5));
        this.set('displayTime', disp)
        this.addChild({child: disp});
        
        /*
        // Create visible penalty timer
        opts['string'] = 'Penalty Time';
        disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(5, 85));
        disp.set('anchorPoint', new geom.Point(0, 0.5));
        this.addChild({child: disp});
        */
        opts['string'] = '0.000';
        disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(5, 100));
        disp.set('anchorPoint', new geom.Point(0, 0.5));
        this.addChild({child: disp});
        this.set('penaltyTime', disp);
        /*
        // Create numerical speedometer
        opts['string'] = 'Speed';
        disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(5, 215));
        disp.set('anchorPoint', new geom.Point(0, 0.5));
        this.addChild({child: disp});
        */
        opts['string'] = '0';
        disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(5, 230));
        disp.set('anchorPoint', new geom.Point(0, 0.5));
        this.addChild({child: disp});
        this.set('displaySpeed', disp);
        /*
        // Create textual medal meter
        opts['string'] = 'Medal';
        disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(5, 315));
        disp.set('anchorPoint', new geom.Point(0, 0.5));
        this.addChild({child: disp});
        */
        opts['string'] = ' - ';
        disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(5, 330));
        disp.set('anchorPoint', new geom.Point(0, 0.5));
        this.addChild({child: disp});
        this.set('displayMedal', disp);
        
        // Real time tracking
        this.realTime = 0
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
            
            this.displayTime.set('string', t.toFixed(this.timerAcc));
            
            // Keeps track of the real time elapsed (due to dt reduction in engine for low FPS)
            var d = cocos.Director.get('sharedDirector');
            if(d.realDt) {
                this.realTime += cocos.Director.get('sharedDirector').realDt;
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
    draw: function(context) {/*
        context.fillStyle = "#8B7765";
        context.beginPath();
        context.moveTo(0,-10);
        context.lineTo(0,610);
        context.lineTo(110,610);
        context.lineTo(110,-10);
        context.closePath();
        context.fill();*/
        
        // Speedometer
        var r = this.gaugeRadius;
        /*
        // Interior fills
        context.fillStyle = '#202020';
        this.fillArc(context, 50, 200, r, 0               , Math.PI * 5 / 6, false);
        context.fillStyle = '#FF8C00';
        this.fillArc(context, 50, 200, r, Math.PI / 12 * 9, Math.PI / 12   , false);
        context.fillStyle = '#DD1111';
        this.fillArc(context, 50, 200, r, Math.PI / 6 * 5 , Math.PI / 6    , false);
        
        // Hash marks
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = "2";
        var maxStep = 6
        for(var step = 1; step < maxStep; step += 1) {
            context.beginPath();
            context.moveTo(Math.sin(step*Math.PI/maxStep - Math.PI/2)*r + 50, Math.cos(step*Math.PI/maxStep - Math.PI/2)*-r + 200);
            context.lineTo(Math.sin(step*Math.PI/maxStep - Math.PI/2)*(r-10) + 50, Math.cos(step*Math.PI/maxStep - Math.PI/2)*-(r-10) + 200)
            context.closePath();
            context.stroke();
        }
        
        // Gauge frame
        context.strokeStyle = "#000000";
        context.lineWidth = "4";
        context.beginPath();
        context.arc(50, 200, r, 0, Math.PI, true);
        context.lineTo(10, 200);
        context.closePath();
        context.stroke();
        */
        var s = this.getSpeed();
        var maxs = this.maxSpeed;
        
        // Needle outline
        context.strokeStyle = "#000000";
        context.lineWidth = "4";
        context.beginPath();
        context.moveTo(50, 200);
        context.lineTo(Math.sin(s*Math.PI/maxs - Math.PI/2)*r + 50, Math.cos(s*Math.PI/maxs - Math.PI/2)*-r + 200);
        context.closePath();
        context.stroke();
        
        // Needle
        context.strokeStyle = "#11CC22";
        context.lineWidth = "2";
        context.beginPath();
        context.moveTo(50, 200);
        context.lineTo(Math.sin(s*Math.PI/maxs - Math.PI/2)*r + 50, Math.cos(s*Math.PI/maxs - Math.PI/2)*-r + 200);
        context.closePath();
        context.stroke();
        
        this.set('lastS', s);
        
        // Medalmeter
        /*
        // Interior fills
        context.fillStyle = '#202020';
        this.fillArc(context, 50, 300, r, 0,               Math.PI / 4, false);
        context.fillStyle = '#A67D3D';
        this.fillArc(context, 50, 300, r, Math.PI / 4,     Math.PI / 4, false);
        context.fillStyle = '#C0C0C0';
        this.fillArc(context, 50, 300, r, Math.PI / 2,     Math.PI / 4, false);
        context.fillStyle = '#CC9900';
        this.fillArc(context, 50, 300, r, Math.PI / 4 * 3, Math.PI / 4, false);
        
        // Gauge frame
        context.strokeStyle = "#000000";
        context.lineWidth = "4";
        context.beginPath();
        context.arc(50, 300, r, 0, Math.PI, true);
        context.lineTo(10, 300);
        context.closePath();
        context.stroke();
        
        */
        // Negative time is bad for calculating the medal meter
        if(this.get('elapsedTime') > 0) {
            var p = this.pHelper(s);
            
            this.updateMedalText(p);
            
            // Needle outline
            context.strokeStyle = "000000";
            context.lineWidth = "4";
            context.beginPath();
            context.moveTo(50, 300);
            context.lineTo(Math.sin(Math.PI*p - Math.PI/2)*r + 50, Math.cos(Math.PI*p - Math.PI/2)*-r + 300)
            context.closePath();
            context.stroke();
            
            // Needle
            context.strokeStyle = "#11CC22";
            context.lineWidth = "2";
            context.beginPath();
            context.moveTo(50, 300);
            context.lineTo(Math.sin(Math.PI*p - Math.PI/2)*r + 50, Math.cos(Math.PI*p - Math.PI/2)*-r + 300)
            context.closePath();
            context.stroke();
            
            var m = this.pHelper(maxs);
            
            // Impossible grayed out area
            context.fillStyle = 'rgba(0,0,0,0.4)';
            this.fillArc(context, 50, 300, r, Math.PI, -1 * Math.PI * (1 - m), true);
        }
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

Dashboard.SPEED_M_PS = 0;
Dashboard.SPEED_KM_PH = 1;
Dashboard.SPEED_MI_PH = 2;

exports.Dashboard = Dashboard