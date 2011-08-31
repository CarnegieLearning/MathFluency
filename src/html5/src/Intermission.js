var cocos = require('cocos2d');
var events = require('events');
var geom = require('geometry');

var PNode = require('PerspectiveNode').PerspectiveNode;

// Represents a single question to be answered by the player
// TODO: Build with an options object to allow easier initialization when customizing away from default values
var Intermission = PNode.extend({
    fired   : false,            // True if the intermission has already fired
    selector: null,             // Selector to change to during the intermission
    init: function(selector, z) {
        Intermission.superclass.init.call(this, {xCoordinate:0, zCoordinate: z});
        
        // Initialize all variables
        this.set('selector', selector);
        
        // Schedule the per frame update
        this.scheduleUpdate();
    },
    
    // Manages question timing and movement
    update: function(dt) {
        var te = this.get('timeElapsed') + dt;
        this.set('timeElapsed', te);
        
        if(PNode.cameraZ >= this.get('zCoordinate') && !this.get('fired')) {
            this.set('fired', true);
            events.trigger(this, 'changeSelector', this.get('selector'));
        }
        
        Intermission.superclass.update.call(this, dt);
    },
});

// TODO: Write static helper for building an options object to initialize a question

exports.Intermission = Intermission