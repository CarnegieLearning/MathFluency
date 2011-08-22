var cocos = require('cocos2d');
var geom = require('geometry');

var FractionRenderer = require('FractionRenderer').FractionRenderer

//Represents the player in the game
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
        var selector = FractionRenderer.create('1', '2');
        selector.set('position', new geom.Point(0, 80));
        this.addChild({child: selector});
        this.set('selector', selector);
        
        this.scheduleUpdate();
    },
    
    //Keep the selector from rotating with the car
    //TODO: Be fancy and use transforms so the selector stays immediately below the car
    update: function() {
        var rot = this.get('rotation');
        this.get('selector').set('rotation', rot * -1);
    },
});

exports.Player = Player;