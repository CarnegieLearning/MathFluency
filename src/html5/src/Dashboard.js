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
    elapsedTime : -3,   // Time in race elapsed so far
    displayTime : null, // Timer displayed to player
    gaugeRadius : 40,   // Radius of the gauges
    penaltyTime : null, // Displayed penalty time
    pTime       : 0.0,  // Stores numerical penalty time
    speed       : 10,   // Speed for speedometer
    maxSpeed    : 200,  // Maximum possible speed to display/calculate
    timerAcc    : 3,    // Number of digits to the right of the decimal place for timer accuracy
    init: function(maxSpeed) {
        Dashboard.superclass.init.call(this);
        
        this.set('maxSpeed', maxSpeed);
        this.set('zOrder', 100);
        
        // Create the visible timer
        var opts = Object();
        opts['string'] = '-3.0';
        var disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(40, 50));
        this.set('displayTime', disp)
        this.addChild({child: disp});
        
        // Create visible penalty timer
        opts['string'] = '0.0';
        disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(40, 100));
        this.addChild({child: disp});
        this.set('penaltyTime', disp);
    },
    
    // Starts tracking time and updating the dashboard timer
    start: function () {
        this.scheduleUpdate();
    },
    
    // Changes the current amount of penalty time accured
    modifyPenaltyTime: function(dt) {
        MOT.create(this.get('pTime'), dt, 1.0).bindTo('value', this, 'pTime');
    },
    
    // Updates the time
    update: function(dt) {
        var acc = this.get('timerAcc');
        // Update elapsed timer
        var t = this.get('elapsedTime') + dt;
        this.set('elapsedTime', t);
        
        var d = this.get('displayTime');
        d.set('string', t.toFixed(acc));
        
        // Update penalty timer
        this.get('penaltyTime').set('string', this.get('pTime').toFixed(acc));
    },
    
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
        context.lineWidth = "4";
        context.fillStyle = "#8B7765";
        context.beginPath();
        context.moveTo(0,-10);
        context.lineTo(0,610);
        context.lineTo(110,610);
        context.lineTo(110,-10);
        context.closePath();
        context.fill();
        
        // Speedometer
        var r = this.get('gaugeRadius');
        
        context.strokeStyle = "#000000";
        context.beginPath();
        context.arc(50, 200, r, 0, Math.PI, true);
        context.lineTo(10, 200);
        context.closePath();
        context.stroke();
        
        context.fillStyle = '#11CC33';
        this.fillArc(context, 50, 200, r, 0,               Math.PI / 3, false);
        context.fillStyle = '#BBBB22';
        this.fillArc(context, 50, 200, r, Math.PI / 3,     Math.PI / 3, false);
        context.fillStyle = '#CC2222';
        this.fillArc(context, 50, 200, r, Math.PI / 3 * 2, Math.PI / 3, false);
        
        var s = this.get('speed');
        var maxs = this.get('maxSpeed');
        
        context.beginPath();
        context.moveTo(50, 200);
        context.lineTo(Math.sin(s*Math.PI/maxs - Math.PI/2)*r + 50, Math.cos(s*Math.PI/maxs - Math.PI/2)*-r + 200)
        context.closePath();
        context.stroke();
        
        // Medalmeter
        
        context.strokeStyle = "#000000";
        context.beginPath();
        context.arc(50, 300, r, 0, Math.PI, true);
        context.lineTo(10, 300);
        context.closePath();
        context.stroke();
        
        context.fillStyle = '#236B8E';
        this.fillArc(context, 50, 300, r, 0,               Math.PI / 4, false);
        context.fillStyle = '#A67D3D';
        this.fillArc(context, 50, 300, r, Math.PI / 4,     Math.PI / 4, false);
        context.fillStyle = '#C0C0C0';
        this.fillArc(context, 50, 300, r, Math.PI / 2,     Math.PI / 4, false);
        context.fillStyle = '#CC9900';
        this.fillArc(context, 50, 300, r, Math.PI / 4 * 3, Math.PI / 4, false);
        
        if(this.get('elapsedTime') > 0) {
            var p = this.pHelper(s);
            
            context.beginPath();
            context.moveTo(50, 300);
            context.lineTo(Math.sin(Math.PI*p - Math.PI/2)*r + 50, Math.cos(Math.PI*p - Math.PI/2)*-r + 300)
            context.closePath();
            context.stroke();
            
            var m = this.pHelper(maxs);
            
            context.fillStyle = 'rgba(0,0,0,0.4)';
            this.fillArc(context, 50, 300, r, Math.PI, -1 * Math.PI * (1 - m), true);
        }
    },
    
    pHelper: function (s) {
        // TODO: Add chaseDist back into this, otherwise calculation will be off by part of a meter
        var dc = PNode.cameraZ + 6;
        var tc = this.get('elapsedTime') + this.get('pTime');
        
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

exports.Dashboard = Dashboard