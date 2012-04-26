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

// Preloading screen
var Preloader = cocos.nodes.Node.extend({
    pct: 0.0,       // Percent loaded
    txt: null,      // Holds the loading text
    
    init: function() {
        Preloader.superclass.init.call(this);
    
        this.scheduleUpdate();
        
        txt = cocos.nodes.Label.create({string: 'Loading'});
        txt.set('position', new geo.Point(450, 350));
        txt.set('anchorPoint', new geo.Point(0.5, 0.5));
        
        this.addChild({child: txt});
    },
    
    // Fake loading update
    update: function(dt) {
        this.pct += dt * 0.5;
        if(this.pct > 1) {
            this.pct = 1;
            events.trigger(this, 'loaded');
        }
    },
    
    // Draw the screen (no images as they may of not loaded at this point)
    draw: function(context) {
        // Cover the screen
        context.fillStyle = "#000000";
        context.fillRect(-10, -10, 820, 620);
        
        // Outline of the progress box
        context.fillStyle = "#FFFFFF";
        context.fillRect(340, 400, 220, 40);
        
        // Progress bar
        context.fillStyle = "#AA2222";
        context.fillRect(350, 405, 200 * this.pct, 30);
    }
});

exports.Preloader = Preloader