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

// Creates a area filled with text that spans more than one line
var MultiLabel = cocos.nodes.Node.extend({
    once    : false,        // Only trigger the text alignment and format once
    
    width   : 100,          // Width of area to be filled with text
    vSpace  : 30,           // Y amount to move for each new line
    
    fontSize: '16',         // Size of the font
    fontName: 'Helvetica',  // Name of the font

    string  : 'Default',    // Text to be displayed
    
    init: function(w, vs, fs, fn, str) {
        MultiLabel.superclass.init.call(this);
        
        //TODO: Allow defaulting
        this.width = w + 1;
        this.vSpace = vs;
        this.fontSize = fs;
        this.fontName = fn;
        this.string = str;
    },
    
    // Only used to get the HTML5 context
    draw: function(ctx) {
        // Only trigger once
        if(!this.once) {
            this.once = true;
            
            // Configure font in context
            ctx.save();
            ctx.font = this.fontSize + 'px ' + this.fontName;
            
            var s = this.string.split(' ');
            var lines = [];
            
            // Start the first line
            if(s.length > 1) {
                lines[0] = s.shift();
            }
            
            // Interate on and format the text
            var i=0;
            while(s.length > 0) {
                var t = s.shift();
                if(ctx.measureText(lines[i] + ' ' + t).width < this.width || t == '\n') {
                    lines[i] += ' ' + t;
                }
                else {
                    i += 1
                    lines[i] = t;
                }
            }
            
            // Restore the previous settings for the context font
            ctx.restore();
            
            // Create actual text labels
            var label;
            var lopts = {fontSize: this.fontSize};
            for(var i=0; i<lines.length; i+=1) {
                lopts['string'] = lines[i];
                label = cocos.nodes.Label.create(lopts);
                label.set('position', new geo.Point(0, i*this.vSpace));
                label.set('anchorPoint', new geo.Point(0, 0));
                this.addChild({child: label});
            }
        }
    }
});

exports.MultiLabel = MultiLabel;