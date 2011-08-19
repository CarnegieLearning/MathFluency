var cocos = require('cocos2d');
var geom = require('geometry');

var Dashboard = require('Dashboard').Dashboard

var Background = cocos.nodes.Node.extend({
    dash: null,
    init: function(lanes) {
        Background.superclass.init.call(this);
        
        var dash = Dashboard.create();
        dash.set('position', new geom.Point(750, 0));
        this.set('dash', dash);
        this.addChild({child: dash});
    },
    
    draw: function(context) {
        //Ground
        context.fillStyle = "#44AA22";
        context.beginPath();
        context.moveTo(-10,50);
        context.lineTo(-10,610);
        context.lineTo(810,610);
        context.lineTo(810,50);
        context.closePath();
        context.fill();
        
        //Sky
        context.fillStyle = "#1122BB";
        context.beginPath();
        context.moveTo(-10,-10);
        context.lineTo(-10,50);
        context.lineTo(810,50);
        context.lineTo(810,-10);
        context.closePath();
        context.fill();
        
        //Road
        context.fillStyle = "#808080";
        context.beginPath();
        context.moveTo(375,50);
        context.lineTo(100,610);
        context.lineTo(700,610);
        context.lineTo(425,50);
        context.closePath();
        context.fill();
        
        //Lanes
        context.strokeStyle = "#FFFF00";
        context.lineWidth = 4
        context.beginPath();
        context.moveTo(390,50);
        context.lineTo(300,610);
        context.stroke();
        context.closePath();
        
        context.beginPath();
        context.moveTo(410,50);
        context.lineTo(500,610);
        context.stroke();
        context.closePath();
    },
});

exports.Background = Background