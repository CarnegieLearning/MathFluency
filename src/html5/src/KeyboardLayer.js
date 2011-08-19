// Import the cocos2d module
var cocos = require('cocos2d');
    
// Handles reading keyboard input, allows us to ignore "Key Repeat" settings as the key is either down, or up
var KeyboardLayer = cocos.nodes.Layer.extend({
    keys: null,
    init: function() {
        // You must always call the super class version of init
        KeyboardLayer.superclass.init.call(this);
        
        this.set('isKeyboardEnabled', true);
        
        var keys = new Array(256);
        for(key in keys) {
            key = false;
        }
        
        this.set('keys', keys);
    },
    
    //Sets key to true when pressed
    keyDown: function(evt) {
        keys = this.get('keys');
        keys[evt.keyCode] = true;
    },
    //Sets key to false when no longer pressed
    keyUp: function(evt) {
        keys = this.get('keys');
        keys[evt.keyCode] = false;
    },
    //Check to see if a valid key is pressed
    checkKey: function(keyCode) {
        keys = this.get('keys');
        if(keyCode > -1 && keyCode < 256) {
            return keys[keyCode];
        }
        
        return false;
    }
});

exports.KeyboardLayer = KeyboardLayer