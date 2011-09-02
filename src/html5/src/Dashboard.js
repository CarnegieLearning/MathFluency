var cocos = require('cocos2d');
var geom = require('geometry');

var PNode = require('PerspectiveNode').PerspectiveNode;
var RC = require('RaceControl').RaceControl;

// Displays the dashboard on the right hand side
// TODO: Add speedometer, race progress, medal tracker, penalty time
var Dashboard = cocos.nodes.Node.extend({
    elapsedTime : -3,   // Time in race elapsed so far
    displayTime : null, // Timer displayed to player
    gaugeRadius : 40,   // Radius of the gauges
    penaltyTime : null, // Displayed penalty time
    pTime       : 0.0,  // Stores numerical penalty time
    pTimeTo     : 0.0,  // Value that pTime moves towards
    speed       : 20,   // Speed for speedometer
    init: function() {
        Dashboard.superclass.init.call(this);
        
        // Create the visible timer
        var opts = Object();
        opts['string'] = '-3.0';
        var disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(50, 50));
        this.set('displayTime', disp)
        this.addChild({child: disp});
        
        // Create visible penalty timer
        opts['string'] = '0.0';
        disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(50, 100));
        this.addChild({child: disp});
        this.set('penaltyTime', disp);
    },
    
    // Starts tracking time and updating the dashboard timer
    start: function () {
        this.scheduleUpdate();
    },
    
    // Changes the current amount of penalty time accured
    modifyPenaltyTime: function(dt) {
        this.set('pTimeTo', this.get('pTimeTo') + dt);
    },
    
    // Converts numerical seconds to string, accurate to tenths of a second
    timerToString: function(t) {
        t = Math.round(t*10)
        if(t % 10 == 0) {
            t = t / 10.0 + ".0";
        }
        else {
            t /= 10;
        }
        
        return t;
    },
    
    // Updates the time
    update: function(dt) {
        // Update elapsed timer
        var t = this.get('elapsedTime') + dt;
        this.set('elapsedTime', t);
        
        var d = this.get('displayTime');
        d.set('string', this.timerToString(t));
        
        // Update penalty timer
        var pt = this.get('pTime');
        var ptt = this.get('pTimeTo');
        
        if(ptt > pt) {
            pt += 10 * dt;
            pt = Math.min(pt, ptt);
            this.set('pTime', pt);
            this.get('penaltyTime').set('string', this.timerToString(pt));
        }
        else if(ptt < pt) {
            pt += 10 * dt;
            pt = Math.max(pt, ptt);
            this.set('pTime', pt);
            this.get('penaltyTime').set('string', this.timerToString(pt));
        }
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
        
        context.beginPath();
        context.moveTo(50, 200);
        context.lineTo(Math.sin(s*Math.PI/110 - Math.PI/2)*r + 50, Math.cos(s*Math.PI/110 - Math.PI/2)*-r + 200)
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
            
            var m = this.pHelper(100);
            
            context.fillStyle = 'rgba(0,0,0,0.4)';
            this.fillArc(context, 50, 300, r, Math.PI, -1 * Math.PI * (1 - m), true);
        }
    },
    
    pHelper: function (s) {
        var dc = PNode.cameraZ + PNode.carDist;
        var tc = this.get('elapsedTime') + this.get('pTime');
        
        var dr = RC.finishLine - dc;
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