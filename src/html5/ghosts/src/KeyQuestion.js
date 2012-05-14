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
var geo = require('geometry');
var events = require('events');

// Static imports
var GC = require('GhostsControl').GhostsControl

// A special Tile that contains a chest
var KeyQuestion = cocos.nodes.Node.extend({
    slots   : null,     // Array of available slots
    
    active  : -1,       // The slot that is currently being dragged
    
    bg      : null,     // Background image of the asked question
    qText   : null,     // Array of strings containing the question
    
    mTolG   : 0,        // Mouse tolerance in pixels for grabbing keys
    mTolR   : 10,       // Mouse tolerance in pixels for dropping keys

    init: function(text) {
        KeyQuestion.superclass.init.call(this);
        
        this.slots = [null, null, null];
        
        // Create background for question
        this.bg = cocos.nodes.Sprite.create({file: '/resources/keybg.png'});
        this.bg.set('anchorPoint', new geo.Point(0, 0));
        var cs = this.bg.get('contentSize');
        this.bg.set('scaleX', 600 / cs.width);
        this.bg.set('scaleY', 450 / cs.height);
        this.bg.set('zOrder', -1);
        this.addChild({child: this.bg});
        
        this.qText = text;
        
        // Create text
        var label;
        var lopts = {}
        for(var i=0; i<this.qText.length; i+=1) {
            lopts['string'] = this.qText[i];
            label = cocos.nodes.Label.create(lopts);
            label.set('position', new geo.Point(0, i*20));
            label.set('anchorPoint', new geo.Point(0, 0));
            this.addChild({child: label});
        }
    },
    
    // Returns true if all slots are filled with keys
    slotsFilled: function() {
        for(var i=0; i<this.slots.length; i+=1) {
            if(this.slots[i] == null) {
                return false;
            }
        }
        
        return true;
    },
    
    // Handles placing/removing Keys into/out of the KeyQuestion
    place: function(key, from, to) {
        GC.AM.playSound('button', true);
        
        // Slot empty
        if(this.slots[to] == null) {
            // Comming from communication device
            if(from == -1) {
                this.slots[to] = key;
                key.reparent(this);
                key.place(this.placeHelper(to));
                
                return null;
            }
            // Internal swap
            else {
                this.slots[to] = key;
                this.slots[from] = null;
                key.reparent(this);
                key.place(this.placeHelper(to));
            }
        }
        // Slot occupied
        else {
            // Swap in from communication device
            if(from == -1) {
                var ret = this.slots[to];
                
                this.slots[to] = key;
                key.reparent(this);
                key.place(this.placeHelper(to));
                
                return ret;
            }
            // Internal swap
            else {
                var swap = this.slots[to]
                
                this.slots[to] = this.slots[from];
                this.slots[from] = swap;
                
                key.reparent(this);
                this.slots[to].place(this.placeHelper(to));
                this.slots[from].place(this.placeHelper(from));
            }
        }
    },
    
    // Returns the position of the specific slot
    placeHelper: function(i) {
        if(-1 < i && i < 3) {
            return {x: 100 + i * 200, y: 375};
        }
        
        return {x: 0, y: 0};
    },
    
    // Returns true if the keys are placed properly
    confirm: function() {
        for(var i=0; i<3; i+=1) {
            if(this.slots[i].order != i) {
                GC.AM.playSound('wrong');
                return false
            }
        }
        
        GC.AM.playSound('correct');
        return true;
    },
    
////////  Mouse Event Handlers  /////////////////////////////////////////////////////////////////////////////
    
    // Process the Mouse Down event
    processMouseDown: function(x, y) {
        if(400 - this.mTolG < y && y < 450 + this.mTolG) {
            if(75 - this.mTolG < x && x < 125 + this.mTolG && this.slots[0] != null) {
                this.active = 0;
                return this.slots[0];
            }
            else if(275 - this.mTolG < x && x < 325 + this.mTolG && this.slots[1] != null) {
                this.active = 1;
                return this.slots[1];
            }
            else if(475 - this.mTolG < x && x < 525 + this.mTolG && this.slots[2] != null) {
                this.active = 2;
                return this.slots[2];
            }
        }
        else if(475 < x && x < 600 && 470 < y && y < 500 && this.slotsFilled()) {
            if(this.confirm()) {
                events.trigger(this, 'correct');
            }
            else {
                events.trigger(this, 'wrong');
            }
        }
        
        return null;
    },
    
    // Process Mouse Up event
    processMouseUp: function(x, y) {
        if(400 - this.mTolR < y && y < 450 + this.mTolR) {
            if(75 - this.mTolR < x && x < 125 + this.mTolR) {
                return 0;
            }
            else if(275 - this.mTolR < x && x < 325 + this.mTolR) {
                return 1;
            }
            else if(475 - this.mTolR < x && x < 525 + this.mTolR) {
                return 2;
            }
        }
        
        return -1;
    }
});

exports.KeyQuestion = KeyQuestion;