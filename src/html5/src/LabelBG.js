// Import the cocos2d module
var cocos = require('cocos2d');

var PNode = require('PerspectiveNode').PerspectiveNode;

var LabelBG = PNode.extend({
    label  : null,      //The label that the class wraps
    bgColor: '#FFFFFF', //The color of the background that will be behind the label
    init: function(opts) {
        // You must always call the super class version of init
        LabelBG.superclass.init.call(this, opts);
        
        this.set('label', cocos.nodes.Label.create(opts));
        this.addChild({child: this.get('label')});
        
        if(opts.hasOwnProperty('bgColor')) {
            this.set('bgColor', opts['bgColor']);
        }

        this.set('contentSize', this.get('label').get('contentSize'));
    },
    // Draws the background for the label
    draw: function(context) {
        var size = this.get('contentSize');
        
        context.fillStyle = this.get('bgColor');
        context.fillRect(size.width * -0.6, size.height * -0.75, size.width * 1.2, size.height * 1.5);
    },
});

// Static helper function to build the creation options object
LabelBG.helper = function(String, FontColor, BgColor, FontSize, FontName) {
    return {
        string      : String,
        fontColor   : FontColor,
        bgColor     : BgColor,
        fontSize    : FontSize,
        fontName    : FontName
    };
}

exports.LabelBG = LabelBG