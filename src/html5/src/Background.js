var cocos = require('cocos2d');

var Background = cocos.nodes.Node.extend({
    init: function(lanes) {
        Background.superclass.init.call(this);
    },
    
    draw: function(context) {
        // Ground
        context.fillStyle = "#44AA22";
        context.beginPath();
        context.moveTo(-10,50);
        context.lineTo(-10,610);
        context.lineTo(810,610);
        context.lineTo(810,50);
        context.closePath();
        context.fill();
        
        // Sky
        context.fillStyle = "#1122BB";
        context.beginPath();
        context.moveTo(-10,-10);
        context.lineTo(-10,50);
        context.lineTo(810,50);
        context.lineTo(810,-10);
        context.closePath();
        context.fill();
        
        // Road
        context.fillStyle = "#808080";
        context.beginPath();
        context.moveTo(385,50);
        context.lineTo(100,610);
        context.lineTo(700,610);
        context.lineTo(415,50);
        context.closePath();
        context.fill();
        
        // Lanes
        context.fillStyle = "#FFFF00";
        context.lineWidth = 4
        context.beginPath();
        context.moveTo(395,50);
        context.lineTo(296,610);
        context.lineTo(304,610);
        context.lineTo(395,50);
        context.fill();
        context.closePath();
        
        context.beginPath();
        context.moveTo(405,50);
        context.lineTo(496,610);
        context.lineTo(504,610);
        context.lineTo(405,50);
        context.fill();
        context.closePath();
    },
});

exports.Background = Background