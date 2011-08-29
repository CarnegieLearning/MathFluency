var cocos = require('cocos2d');
var geom = require('geometry');
var util = require('util');

// TODO: Subclass this off a Value/Expression class or have it pulled in when needed by such a class
var FractionRenderer = cocos.nodes.Node.extend({
    numerator: null,        // The numerator of the fraction
    denominator: null,      // The denominator of the fraction
    bgColor: null,          // Color of the background rectangle
    textColor: null,        // Color of the numerator and denominator (TODO: Seperate colors for each?)
    seperatorColor: null,   // Color of the fraction bar between the numerator and denominator
    init: function(opts) {
        FractionRenderer.superclass.init.call(this);
        this.set('numerator', 1);
        this.set('denominator', 2);
        
        this.set('bgColor', "#FFFFFF");
        this.set('textColor', "#000000");
        this.set('seperatorColor', "#AA2222");
        
        // Set properties from the option object
        util.each('numerator denominator bgColor textColor seperatorColor'.w(), util.callback(this, function (name) {
            if (opts[name]) {
                this.set(name, opts[name]);
            }
        }));
        
        // Create the numerical labels for the numerator and denominator
        var opts = Object();
        opts["string"] = this.get("numerator");
        opts["fontColor"] = this.get("textColor");
        var label = cocos.nodes.Label.create(opts);
        label.set('position', new geom.Point(0, -15));
        this.addChild({child: label});
        
        opts["string"] = this.get("denominator");
        opts["fontColor"] = this.get("textColor");
        label = cocos.nodes.Label.create(opts);
        label.set('position', new geom.Point(0, 15));
        this.addChild({child: label});
        
        this.set('contentSize') = new geom.Size(40, 50);
    },
    
    // Draw the background and the horizontal fraction bar
    draw: function(context) {
        var size = this.get('contentSize');
    
        context.fillStyle = this.get('bgColor');
        context.beginPath();
        context.moveTo(size.width /  2, size.height /  2);
        context.lineTo(size.width /  2, size.height / -2);
        context.lineTo(size.width / -2, size.height / -2);
        context.lineTo(size.width / -2, size.height /  2);
        context.closePath();
        context.fill();
        
        context.strokeStyle = this.get('seperatorColor');
        context.beginPath();
        context.moveTo(size.height /  4, 0);
        context.lineTo(size.height / -4, 0);
        context.closePath();
        context.stroke();
    },
});

// Static helper function to build the creation options object
FractionRenderer.helper = function(n, d, b, t, s) {
    var opts = new Object();
    opts['numerator'] = n;
    opts['denominator'] = d;
    opts['bgColor'] = b;
    opts['textColor' ] = t;
    opts['seperatorColor'] = s;
    
    return opts;
}

exports.FractionRenderer = FractionRenderer