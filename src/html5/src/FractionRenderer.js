var cocos = require('cocos2d');
var geom = require('geometry');

//TODO: Subclass this off a Value/Expression class or have it pulled in when needed by such a class
var FractionRenderer = cocos.nodes.Node.extend({
    numerator: null,
    denominator: null,
    init: function(n, d) {
        FractionRenderer.superclass.init.call(this);
        this.set('numerator', n);
        this.set('denominator', d);
        
        //Create the numerical labels for the numerator and denominator
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
    
    //Draw the background and the horizontal fraction bar
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