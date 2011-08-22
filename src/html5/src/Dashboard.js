var cocos = require('cocos2d');
var geom = require('geometry');

var Dashboard = cocos.nodes.Node.extend({
    elapsedTime: null,
    displayTime: null,
    init: function() {
        Dashboard.superclass.init.call(this);
        
        var opts = Object();
        opts["string"] = '0.0';
        var disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(50, 50));
        this.set('displayTime', disp)
        this.addChild({child: disp});
        
        this.scheduleUpdate();
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