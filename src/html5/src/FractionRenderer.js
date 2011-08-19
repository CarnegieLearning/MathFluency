var cocos = require('cocos2d');
var geom = require('geometry');

var FractionRenderer = cocos.nodes.Node.extend({
    numerator: null,
    denominator: null,
    init: function(n, d) {
        FractionRenderer.superclass.init.call(this);
        this.set('numerator', n);
        this.set('denominator', d);
        
        var opts = Object()
        opts["string"] = n
        var label = cocos.nodes.Label.create(opts)
        label.set('position', new geom.Point(0, -15))
        this.addChild({child: label});
        
        opts["string"] = d
        label = cocos.nodes.Label.create(opts)
        label.set('position', new geom.Point(0, 15))
        this.addChild({child: label});
    },
    draw: function(context) {
        context.fillStyle = "#000000";
        context.beginPath();
        context.moveTo(20,25);
        context.lineTo(20,-25);
        context.lineTo(-20,-25);
        context.lineTo(-20,25);
        context.closePath();
        context.fill();
        
        context.strokeStyle = "#FF0000";
        context.beginPath();
        context.moveTo(10,0);
        context.lineTo(-10,0);
        context.closePath();
        context.stroke();
    },
});

exports.FractionRenderer = FractionRenderer