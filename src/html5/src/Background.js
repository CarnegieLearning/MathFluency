var cocos = require('cocos2d');

var PNode = require('PerspectiveNode').PerspectiveNode;

var Background = cocos.nodes.Node.extend({
    init: function(lanes) {
        Background.superclass.init.call(this);
    },
    
    draw: function(context) {
        // Ground
        context.fillStyle = "#44AA22";
        context.beginPath();
        context.moveTo(-10, PNode.horizonStart);
        context.lineTo(-10, 610);
        context.lineTo(810, 610);
        context.lineTo(810, PNode.horizonStart);
        context.closePath();
        context.fill();
        
        // Sky
        context.fillStyle = "#1122BB";
        context.beginPath();
        context.moveTo(-10,-10);
        context.lineTo(-10, PNode.horizonStart);
        context.lineTo(810, PNode.horizonStart);
        context.lineTo(810,-10);
        context.closePath();
        context.fill();
        
        // Road
        context.fillStyle = "#808080";
        context.beginPath();
        context.moveTo(385,                PNode.horizonStart);
        context.lineTo(PNode.roadOffset,   610);
        context.lineTo(PNode.roadWidthPix, 610);
        context.lineTo(415,                PNode.horizonStart);
        context.closePath();
        context.fill();
        
        // Lanes
        var x = 400 - PNode.roadWidthPix / 9 * 1.5;
        context.fillStyle = "#FFFF00";
        context.lineWidth = 4
        context.beginPath();
        context.moveTo(395,   PNode.horizonStart);
        context.lineTo(x - 4, 610);
        context.lineTo(x + 4, 610);
        context.lineTo(395,   PNode.horizonStart);
        context.fill();
        context.closePath();
        
        x = 400 + PNode.roadWidthPix / 9 * 1.5;
        context.beginPath();
        context.moveTo(405,   PNode.horizonStart);
        context.lineTo(x - 4, 610);
        context.lineTo(x + 4, 610);
        context.lineTo(405,   PNode.horizonStart);
        context.fill();
        context.closePath();
    },
});

exports.Background = Background