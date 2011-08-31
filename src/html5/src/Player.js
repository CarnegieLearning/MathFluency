var cocos = require('cocos2d');
var geom = require('geometry');

var LabelBG = require('LabelBG').LabelBG;
var PNode = require('PerspectiveNode').PerspectiveNode;

// Represents the player in the game
var Player = PNode.extend({
    selector        : null, // Label that represents the value the player has control over
    wipeoutDuration : 0,    // Duration remaining on a wipeout
    wipeoutRotSpeed : 0,    // Rotational velocity in degrees per second for the current wipeout
    selectorX       : null, // The X coordinate that the label should be at, ignoring rotational transforms
    selectorY       : null, // The Y coordinate that the label should be at, ignoring rotational transforms
    init: function() {
        Player.superclass.init.call(this, {xCoordinate:0, zCoordinate: PNode.carDist});
       
        // Load the car sprite for the player
        var sprite = cocos.nodes.Sprite.create({file: '/resources/car1.png',});
        sprite.set('scaleX', 0.5);
        sprite.set('scaleY', 0.5);
        this.addChild({child: sprite});
        
        this.scheduleUpdate();
    },
    
    // Changes the currently displayed selector on the car
    changeSelector: function(newVal) {
        // Remove previous selector if there was one
        var prev = this.get('selector');
        if(prev != null) {
            this.removeChild(prev);
        }
    
        // Create the new selector if one is provided
        if(newVal != null) {
            var opts = Object()
            opts["string"] = newVal;
            opts["fontColor"] = '#000000';
            var selector = LabelBG.create(opts, '#FFFFFF');
            selector.set('position', new geom.Point(selector.get('contentSize').width / 2, 80));
            this.set('selectorX', selector.get('contentSize').width / 2);
            this.set('selectorY', 80);
            this.addChild({child: selector});
            this.set('selector', selector);
        }
        else {
            this.set('selector', null);
        }
    },
    
    // Sets the wipeout status of the car, causing it to spin over time
    wipeout: function(duration, spins) {
        this.set('wipeoutDuration', duration);
        this.set('wipeoutRotSpeed', spins * 360.0 / duration);
    },
    
    // Keep the selector from rotating with the car
    update: function(dt) {
        this.set('zCoordinate', PNode.cameraZ + PNode.carDist);
        
        Player.superclass.update.call(this, dt);
        
        var pos = this.get('position');
        
        //Spin the car as a result of getting a wrong answer
        if(this.get('wipeoutDuration') > 0) {
            this.set('rotation', this.get('rotation') + this.get('wipeoutRotSpeed') * dt)
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
    
        if(this.get('selector') != null) {
            // Do not rotate the label, keep its facing constant
            var rot = this.get('rotation');
            this.get('selector').set('rotation', rot * -1);
            
            //Cocos works in degrees, Math works in radians, so convert
            rot = rot * Math.PI / 180.0
            
            // Keep the label in a fixed position beneath the car, regardless of car rotation
            var x =      this.get('selectorX') * Math.cos(rot) + this.get('selectorY') * Math.sin(rot)
            var y = -1 * this.get('selectorX') * Math.sin(rot) + this.get('selectorY') * Math.cos(rot)
            
            this.get('selector').set('position', new geom.Point(x, y));
        }
    },
});

exports.Player = Player;