var cocos = require('cocos2d');
var geom = require('geometry');

var LabelBG = require('LabelBG').LabelBG;

// Represents the player in the game
var Player = cocos.nodes.Node.extend({
    selector: null,         // Label that represents the value the player has control over
    wipeoutDuration: null,  // Duration remaining on a wipeout
    selectorX: null,        // The X coordinate that the label should be at, ignoring rotational transforms
    selectorY: null,        // The Y coordinate that the label should be at, ignoring rotational transforms
    init: function() {
        Player.superclass.init.call(this);
       
        // Load the car sprite for the player
        var sprite = cocos.nodes.Sprite.create({file: '/resources/car1.png',});
        sprite.set('scaleX', 0.5);
        sprite.set('scaleY', 0.5);
        
        this.addChild({child: sprite});
        
        // Create the selector value for the car
        this.changeSelector("0.5");
        this.set('wipeoutDuration', 0);
        
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
        selector.set('position', new geom.Point(selector.get('contentSize').width / 2, 80));
        this.set('selectorX', selector.get('contentSize').width / 2);
        this.set('selectorY', 80);
        this.addChild({child: selector});
        this.set('selector', selector);
    },
    
    // Sets the wipeout status of the car, causing it to spin
    // Use multiples of 0.5 seconds, otherwise the car will stop spinning at a off angle and then snap to driving forward
    wipeout: function(duration) {
        this.set('wipeoutDuration', duration);
    },
    
    // Keep the selector from rotating with the car
    update: function(dt) {
        var pos = this.get('position');
        
        //Spin the car as a result of getting a wrong answer
        if(this.get('wipeoutDuration') > 0) {
            this.set('rotation', this.get('rotation') + 720 * dt)
            this.set('wipeoutDuration', this.get('wipeoutDuration') - dt);
        }
        // Otherwise just rotate the player as they move to keep the visual angles realistic
        else {
            if(400.0 - pos.x > 0) {
                this.set('rotation', (90 - 180.0/Math.PI * Math.atan((pos.y - 50) / (400.0 - pos.x))) / 1.5)
            }
            else {
                this.set('rotation', (90 - 180.0/Math.PI * Math.atan((pos.y - 50) / (pos.x - 400.0))) / -1.5)
            }
        }
    
        // Do not rotate the label, keep its facing constant
        var rot = this.get('rotation');
        this.get('selector').set('rotation', rot * -1);
        
        rot = rot * Math.PI / 180.0
        
        // Keep the label in a fixed position beneath the car, regardless of car rotation
        var x = this.get('selectorX') * Math.cos(rot) + this.get('selectorY') * Math.sin(rot)
        var y = -1 * this.get('selectorX') * Math.sin(rot) + this.get('selectorY') * Math.cos(rot)
        
        this.get('selector').set('position', new geom.Point(x, y));
    },
});

exports.Player = Player;