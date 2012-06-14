/*
Copyright 2011, Carnegie Learning

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

// Import the cocos2d module
var cocos = require('cocos2d');
    
// Handles reading keyboard input, allows us to ignore "Key Repeat" settings as the key is either down, or up
function KeyboardLayer() {
    // You must always call the super class version of init
    KeyboardLayer.superclass.constructor.call(this);
    
    // Enables detecting keypresses
    this.isKeyboardEnabled = true;
    
    // Build the array to hold keyboard state
    this.keys = Array(256);
    for(key in this.keys) {
        key = 0;
    }
}

KeyboardLayer.inherit(cocos.nodes.Layer, {
    anyKey      : false,// true if any key has been pressed since the last time it was checked
    keys        : null, // Holds the array of key statuses
    bindings    : {},   // Holds the application specific bindings

    // Sets key to true when pressed
    keyDown: function(evt) {
        this.anyKey = true;
        this.keys[evt.keyCode] = KeyboardLayer.PRESS;
    },
    
    // Sets key to false when no longer pressed
    keyUp: function(evt) {
        this.keys[evt.keyCode] = KeyboardLayer.RELEASE;
    },
    
    // Check to see if a valid key is pressed
    // Returns false is the key was invalid or not pressed
    // Returns 1 if this is the first time we are detecting the press, 2 if we have detected this press previously
    checkKey: function(keyCode) {
        if(keyCode > -1 && keyCode < 256) {
            var ret = this.keys[keyCode];
            
            // Lets us know if we have polled this key before and the user has not let it back up
            if(ret == KeyboardLayer.PRESS) {
                this.keys[keyCode] = KeyboardLayer.HOLD;
            }
            else if(ret == KeyboardLayer.RELEASE) {
                this.keys[keyCode] = KeyboardLayer.UP;
            }
            
            return ret;
        }
        
        return false;
    },
    
    // Checks to see if any key has been pressed since it was last checked
    checkAnyKey: function() {
        if(this.anyKey) {
            this.anyKey = false;
            return true;
        }
        return false;
    },
    
    // Adds a key to a binding, or create the binding if none exists
    addToBinding: function(bind, to) {
        if(!bind in this.bindings) {
            this.bindings[bind] = [to];
        }
        else {
            this.bindings[bind].push(to);
        }
        
        return true;
    },
    
    // Removes a key from a binding, returns false if bind or rm was not found
    removeFromBinding: function(bind, rm) {
        if(bind in this.bindings) {
            var i=0
            while(i<b[bind].length && this.bindings[bind][i] != rm) {
                i+=1;
            }
            
            if(i<b[bind].length && this.bindings[bind][i] == rm) {
                this.bindings[bind].splice(i, 1);
                return true;
            }
        }
        return false;
    },
    
    // Explicitly set a binding to a list of keys
    setBinding: function(bind, list) {
        this.bindings[bind] = list;
        return true;
    },
    
    // Clears all keys from a binding, returns false in bind was not in bindings
    clearBinding: function(bind, to) {
        if(bind in this.bindings) {
            delete this.bindings[bind];
            return true;
        }
        return false;
    },
    
    // Checks to see if any key in the binding is pressed and returns the highest state of any such button pressed
    checkBinding: function(bind) {
        var ret = KeyboardLayer.UP;
        
        if(bind in this.bindings) {
            for(var i = 0; i < this.bindings[bind].length; i += 1) {
                var temp = this.checkKey(this.bindings[bind][i]);
                if(temp > ret) {
                    ret = temp;
                }
            }
            
            return ret;
        }
    },
});

// Static constants
KeyboardLayer.RELEASE   = 1;   // Key was released this frame
KeyboardLayer.UP        = 0;    // Key is up and was not recently released
KeyboardLayer.PRESS     = 2;    // Key has just been pressed (KeyDown)
KeyboardLayer.HOLD      = 3;    // Key is down and not been released

module.exports = KeyboardLayer