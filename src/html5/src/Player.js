var cocos = require('cocos2d');
var geom = require('geometry');

var LabelBG = require('LabelBG').LabelBG;

// Represents the player in the game
var Player = cocos.nodes.Node.extend({
    selector: null,
    curLane: null,
    init: function() {
        Player.superclass.init.call(this);
       
        // Load the car sprite for the player
        var sprite = cocos.nodes.Sprite.create({file: '/resources/car1.png',});
        sprite.set('scaleX', 0.5);
        sprite.set('scaleY', 0.5);
        
        this.addChild({child: sprite});
        
        // Create the selector value for the car
        this.changeSelector("0.5");
        
        this.scheduleUpdate();
    },
    
    // Changes the currently displayed selector on the car
    changeSelector: function(newVal) {
        // Remove previous selector if there was one
        var prev = this.get('selector');
        if(prev != null) {
            this.removeChild(prev);
        }
    
        // Create the new selector
        var opts = Object()
        opts["string"] = newVal;
        opts["fontColor"] = '#000000';
        var selector = LabelBG.create(opts, '#FFFFFF');
        selector.set('position', new geom.Point(0, 80));
        this.addChild({child: selector});
        this.set('selector', selector);
    },
    
    // Keep the selector from rotating with the car
    // TODO: Be fancy and use transforms so the selector stays immediately below the car
    update: function() {
        var rot = this.get('rotation');
        this.get('selector').set('rotation', rot * -1);
    },
});

exports.Player = Player;