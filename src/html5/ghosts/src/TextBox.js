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

// Project imports
var MultiLabel = require('MultiLabel').MultiLabel;

var TextBox = cocos.nodes.Node.extend({
    bg      : null,     // Holds the background
    label   : null,     // Holds the text label
    button  : null,     // Holds the dialog button
    
    width   : 0,        // Width of the TextBox in pixels
    height  : 0,        // Height of the TextBox in pixels
    
    next    : null,     // Reference to the followup TextBox, if any
    
    init: function(lopts, str, w, h, bg, next) {
        TextBox.superclass.init.call(this);
    
        this.set('anchorPoint', new geo.Point(0, 0));
        
        if(bg) {
            // Create background for text
            this.bg = cocos.nodes.Sprite.create({file: bg});
            this.bg.set('anchorPoint', new geo.Point(0, 0));
            var cs = this.bg.get('contentSize');
            this.bg.set('scaleX', w / cs.width);
            this.bg.set('scaleY', h / cs.height);
            this.bg.set('zOrder', -1);
            this.addChild({child: this.bg});
        }
        
        // Create dialog button
        if(next) {
            this.button = cocos.nodes.Sprite.create({file: '/resources/next.png'});
            this.next = next;
        }
        else {
            this.button = cocos.nodes.Sprite.create({file: '/resources/end.png'});
        }
        this.button.set('position', new geo.Point(w - 10, h - 10));
        this.button.set('anchorPoint', new geo.Point(1, 1));
        this.addChild({child: this.button});
        
        this.width = w;
        this.height = h;
        
        // Create text
        this.text = MultiLabel.create(this.width - 20, 25, '20', 'Helvetica', str);
        this.text.set('position', new geo.Point(10, 10));
        this.addChild({child: this.text});
    },
    
    // Checks to see if the next button was clicked by the mouse
    clickCheck: function(x, y) {
        // Bring into local coordinate space
        var p = this.get('position');
        var lx = x - p.x;
        var ly = y - p.y;
        
        if(this.width - 40 < lx && lx < this.width - 10 && this.height - 30 < ly && ly < this.height - 10 ) {
            return true;
        }
        
        return false;
    },
});

exports.TextBox = TextBox;