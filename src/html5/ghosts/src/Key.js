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

// A special Tile that contains a chest
var Key = cocos.nodes.Label.extend({
    order   : -1,   // The index this key should be in for the KeyQuestion
    
    x       : 0,    // Last locked x coordinate
    y       : 0,    // Last locked y coordinate
    
    currentParent   : null, // Current parent of this Key
    oldParent       : null, // Previous parent of this key
    
    init: function(opts) {
        Key.superclass.init.call(this, opts);
        
        this.order = opts.order;
        
        this.set('zOrder', 100);
        
        this.bg = cocos.nodes.Sprite.create({file: '/resources/key3.png'});
        this.bg.set('zOrder', -1);
        this.addChild({child: this.bg});
    },
    
    // Places the Key at the specified coordinates and locks in the current parent
    place: function(opts) {
        this.x = opts.x;
        this.y = opts.y;
        
        this.set('position', new geo.Point(opts.x, opts.y));
        this.oldParent = this.currentParent;
    },
    
    // Resets the Key to the previously specified coordinates and parent from the last 'place' call
    reset: function(x, y) {
        this.set('position', new geo.Point(this.x, this.y));
        
        this.currentParent.removeChild({child: this});
        this.currentParent = this.oldParent;
        this.currentParent.addChild({child: this});
    },
    
    // Reparents the Key to a different parent, will 'reset' to previous parent if not locked in with a 'place' call
    reparent: function(to) {
        this.oldParent = this.currentParent;
        if(this.oldParent) {
            this.oldParent.removeChild({child: this});
        }
        
        this.currentParent = to;
        to.addChild({child: this});
    }
});

exports.Key = Key;