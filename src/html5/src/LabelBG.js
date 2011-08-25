// Import the cocos2d module
var cocos = require('cocos2d');

var LabelBG = cocos.nodes.Node.extend({
    label: null,        //The label that the class wraps
    bgColor: null,      //The color of the background that will be behind the label
    init: function(opts, bgColor) {
        // You must always call the super class version of init
        LabelBG.superclass.init.call(this);
        this.set('label', cocos.nodes.Label.create(opts));
        this.addChild({child: this.get('label')});
        this.set('bgColor', bgColor);
        this.set('contentSize', this.get('label').get('contentSize'));
    },
    // Draws the background for the label
    draw: function(context) {
        var size = this.get('label').get('contentSize');
        
        context.fillStyle = this.get('bgColor');
        context.fillRect(size.width * -0.6, size.height * -0.75, size.width * 1.2, size.height * 1.5);
    }
});

exports.LabelBG = LabelBG