// Import the cocos2d module
var cocos = require('cocos2d');
    
// Handles reading keyboard input, allows us to ignore "Key Repeat" settings as the key is either down, or up
var KeyboardLayer = cocos.nodes.Layer.extend({
    keys        : null, // Holds the array of key statuses
    bindings    : {},   // Holds the application specific bindings
    init: function() {
        // You must always call the super class version of init
        KeyboardLayer.superclass.init.call(this);
        
        // Enables detecting keypresses
        this.set('isKeyboardEnabled', true);
        
        // Build the array to hold keyboard state
        var keys = new Array(256);
        for(key in keys) {
            key = 0;
        }
        
        this.set('keys', keys);
    },
    
    // Sets key to true when pressed
    keyDown: function(evt) {
        keys = this.get('keys');
        keys[evt.keyCode] = KeyboardLayer.PRESS;
    },
    
    // Sets key to false when no longer pressed
    keyUp: function(evt) {
        keys = this.get('keys');
        keys[evt.keyCode] = KeyboardLayer.UP;
    },
    
    // Check to see if a valid key is pressed
    // Returns false is the key was invalid or not pressed
    // Returns 1 if this is the first time we are detecting the press, 2 if we have detected this press previously
    checkKey: function(keyCode) {
        keys = this.get('keys');
        if(keyCode > -1 && keyCode < 256) {
            var ret = keys[keyCode];
            
            // Lets us know if we have polled this key before and the user has not let it back up
            if(ret == KeyboardLayer.PRESS) {
                keys[keyCode] = KeyboardLayer.HOLD;
            }
            
            return ret;
        }
        
        return false;
    },
    
    // Adds a key to a binding, or create the binding if none exists
    addToBinding: function(bind, to) {
        var b = this.get('bindings');
        
        if(!bind in b) {
            b[bind] = [to];
        }
        else {
            b[bind].push(to);
        }
        
        this.set('bindings', b);
        return true;
    },
    
    // Removes a key from a binding, returns false if bind or rm was not found
    removeFromBinding: function(bind, rm) {
        var b = this.get('bindings');
        
        if(bind in b) {
            var i=0
            while(i<b[bind].length && b[bind][i] != rm) {
                i+=1;
            }
            
            if(i<b[bind].length && b[bind][i] == rm) [
                b[bind].splice(i, 1);
                this.set('bindings', b);
                return true;
            }
        }
        return false;
    },
    
    // Explicitly set a binding to a list of keys
    setBinding: function(bind, list) {
        var b = this.get('bindings');
        b[bind] = list;
        this.set('bindings', b);
        return true;
    },
    
    // Clears all keys from a binding, returns false in bind was not in bindings
    clearBinding: function(bind, to) {
        var b = this.get('bindings');
        
        if(bind in b) {
            delete b[bind];
            this.set('bindings', b);
            return true;
        }
        return false;
    },
    
    // Checks to see if any key in the binding is pressed and returns the highest state of any such button pressed
    checkBinding: function(bind) {
        var ret = KeyboardLayer.UP;
        var b = this.get('bindings')
        
        if(bind in b) {
            for(var i = 0; i < b[bind].length; i += 1) {
                var temp = this.checkKey(b[bind][i]);
                if(temp > ret) {
                    ret = temp;
                }
            }
            
            return ret;
        }
    }
});

KeyboardLayer.UP        = 0;    // Key is up and was not recently released
KeyboardLayer.PRESS     = 1;    // Key has just been pressed (KeyDown)
KeyboardLayer.HOLD      = 2;    // Key is down and not been released

exports.KeyboardLayer = KeyboardLayer