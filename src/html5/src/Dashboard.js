var cocos = require('cocos2d');
var geom = require('geometry');

// Displays the dashboard on the right hand side
// TODO: Add speedometer, race progress, medal tracker, penalty time
var Dashboard = cocos.nodes.Node.extend({
    elapsedTime: null,  // Time in race elapsed so far
    displayTime: null,  // Timer displayed to player
    penaltyTime: null,  // Displayed penalty time
    pTime:null,         // Stores numerical penalty time
    init: function() {
        Dashboard.superclass.init.call(this);
        
        // Create the visible timer
        var opts = Object();
        opts['string'] = '-3.0';
        var disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(50, 50));
        this.set('displayTime', disp)
        this.addChild({child: disp});
        this.set('elapsedTime', -3);
        
        opts['string'] = '0.0';
        disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(50, 100));
        this.addChild({child: disp});
        this.set('penaltyTime', disp);
        this.set('pTime', 0);
    },
    
    start: function () {
        this.scheduleUpdate();
    },
    
    modifyPenaltyTime: function(dt) {
        this.set('pTime', this.get('pTime') + dt);
        this.get('penaltyTime').set('string', this.get('pTime') + '.0');
    },
    
    // Updates the time
    update: function(dt) {
        var t = this.get('elapsedTime') + dt;
        this.set('elapsedTime', t);
        
        var d = this.get('displayTime');
        // Track to the nearest tenth of a second
        t = Math.round(t*10)
        // Hack to get X.0 to display properly
        if(t % 10 == 0) {
            t = t / 10.0 + ".0";
        }
        else {
            t /= 10;
        }
        d.set('string', t);
    },
    
    // Draws the dash
    draw: function(context) {
        context.fillStyle = "#8B7765";
        context.beginPath();
        context.moveTo(0,-10);
        context.lineTo(0,610);
        context.lineTo(150,610);
        context.lineTo(150,-10);
        context.closePath();
        context.fill();
    },
});

exports.Dashboard = Dashboard