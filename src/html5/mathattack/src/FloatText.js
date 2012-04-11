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

// Cocos imports
var cocos = require('cocos2d');
var geo = require('geometry');
var events = require('events');

var FloatText = cocos.nodes.Label.extend({
    step    : 0,    // Current animation step
    rise    : 12.5, // Pixels per second to rise over the duration of the animation
    fadeIn  : 0.5,  // Time to fade in (seconds, non-zero, positive)
    delay   : 0.5,  // Time to remain at full opacity (seconds)
    fadeOut : 0.5,  // Time to fade out (seconds, non-zero, positive)
    
    init: function(opts) {
        FloatText.superclass.init.call(this, opts);
        
        this.set('opacity', 0);
        
        this.scheduleUpdate();
    },
    
    update: function(dt) {
        // Move text up over duration
        var p = this.get('position');
        p.y -= this.rise * dt;
        this.set('position', p);
    
        // Fade in
        if(this.step == 0) {
            var temp = this.get('opacity') + 255 * (dt / this.fadeIn);
            this.set('opacity', temp > 255 ? 255 : temp);
            
            if(temp > 255) {
                this.step += 1
            }
        }
        // Hold
        else if(this.step == 1) {
            this.delay -= dt;
            if(this.delay < 0) {
                this.delay = 0;
                this.step += 1;
            }
        }
        // Fade out
        else if(this.step == 2) {
            var temp = this.get('opacity') - 255 * (dt / this.fadeOut);
            this.set('opacity', temp < 0 ? 0 : temp);
            if(temp < 0) {
                this.set('opacity', 0);
                this.step += 1;
                
                this.finish();
            }
        }
    },
    
    finish: function() {
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this);
        events.trigger(this, 'onFinish', this);
    },
});
exports.FloatText = FloatText;