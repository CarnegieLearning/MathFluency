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

var cocos = require('cocos2d');
var events = require('events');
var geom = require('geometry');

var PNode = require('PerspectiveNode').PerspectiveNode;

// Represents a single question to be answered by the player
// TODO: Build with an options object to allow easier initialization when customizing away from default values
var Intermission = PNode.extend({
    fired   : false,            // True if the intermission has already fired
    selector: null,             // Selector to change to during the intermission
    init: function(selector, z) {
        Intermission.superclass.init.call(this, {xCoordinate:0, zCoordinate: z});
        
        // Initialize all variables
        this.set('selector', selector);
        
        // Schedule the per frame update
        this.scheduleUpdate();
    },
    
    // Manages question timing and movement
    update: function(dt) {
        var te = this.get('timeElapsed') + dt;
        this.set('timeElapsed', te);
        
        if(PNode.cameraZ >= this.get('zCoordinate') && !this.get('fired')) {
            this.set('fired', true);
            events.trigger(this, 'changeSelector', this.get('selector'));
        }
        
        Intermission.superclass.update.call(this, dt);
    },
});

// TODO: Write static helper for building an options object to initialize a question

exports.Intermission = Intermission