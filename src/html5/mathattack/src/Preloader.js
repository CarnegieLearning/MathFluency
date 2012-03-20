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
var events = require('events');

// Preloading screen
var Preloader = cocos.nodes.Node.extend({
    pct: 0.0,       // Percent loaded
    
    init: function() {
        Preloader.superclass.init.call(this);
        
        this.scheduleUpdate();
    },
    
    // Fake loading update
    update: function(dt) {
        this.pct += dt;
        if(this.pct > 1) {
            this.pct = 1;
            events.trigger(this, 'loaded');
        }
    },
    
    // Draw the screen
    draw: function(context) {
        // Cover the screen
        context.fillStyle = "#FFFFFF";
        context.fillRect(-10, -10, 920, 620);
    }
});

exports.Preloader = Preloader