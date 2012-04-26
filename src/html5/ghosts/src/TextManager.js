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

var TextManager = cocos.nodes.Node.extend({
    active: null,   // List of currently active TextBoxes

    init: function() {
        TextManager.superclass.init.call(this);
        
        this.active = [];
    },
    
    displayTextBox: function(tb) {
        this.active.push(tb);
        this.addChild({child: tb});
    },
    
    processClick: function(x, y) {
        var i=0;
        while(i<this.active.length && !this.active[i].clickCheck(x, y)) {
            i+=1
        }
        
        if(i<this.active.length) {
            var followup = this.active[i].next;
            this.removeChild({child: this.active[i]});
            this.active.splice(i, 1);
            
            // Display followup if one exists
            if(followup) {
                this.displayTextBox(followup);
                events.trigger(this, 'dialogAdvance');
                return true;
            }
            // Otherwise alert that the dialog sequence has finished
            else {
                events.trigger(this, 'dialogComplete');
                return true;
            }
            
            return false;
        }
    }
});

exports.TextManager = TextManager;