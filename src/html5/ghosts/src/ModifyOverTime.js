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

// Automatically handles changing a value over time (just bindTo "value" to the value you want to change)
var ModifyOverTime = BObject.extend({
    duration: 0,    // Remaining duration of the change
    rate    : 0,    // Rate at which the value changes per second
    value   : null, // The value that is being changed
    
    init: function (x, amount, time) {
        ModifyOverTime.superclass.init.call();
        
        // Initialize
        this.set('value', x);
        this.set('rate', amount / time);
        this.set('duration', time);
        
        // Force calling updates since this will not be added to the scene
        cocos.Scheduler.get('sharedScheduler').scheduleUpdate({target: this, priority: 0, paused: false});
        
        // Keep track of this instance so we can remove it automatically later
        ModifyOverTime.list.push(this);
    },
    
    // Shortcut for bindTo
    bind: function (obj, str) {
        this.bindTo('value', obj, str);
    },
    
    bindFunc: function (obj, func) {
        this.obj = obj;
        this.func = func;
    },

    // Changes value over time
    update: function (dt) {
        var dur = this.get('duration');
        
        // Keep changing as long as there is duration remaining
        if(dur > 0) {
            // Check the case that the tick is longer than our remaining time
            var edt = Math.min(dt, dur);
            this.set('duration', dur - edt);
            
            var rate = this.get('rate');
            this.set('value', this.get('value') + rate * edt);
            
            if(this.func) {
                this.func.apply(this.obj, [this.get('value')]);
            }
        }
        
        // Otherwise change is complete
        else {
            // Let anyone who wants to know that this change has finished
            events.trigger(this, 'Completed', this);
            
            // Then kill it
            this.kill();
        }
    },
    
    // Calling this directly will stop the MOT from modifying and remove it just like if its duration expired, but will not notify anything that it has ended
    kill: function () {
        // Clean up
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this);
        events.clearInstanceListeners(this);
        this.unbind(this.get('value'));
        
        // and remove
        var index = ModifyOverTime.list.indexOf(this);
        ModifyOverTime.list.splice(index, 1);
    },
    
    pause: function () {
        cocos.Scheduler.get('sharedScheduler').pauseTarget(this);
    },
    
    resume: function () {
        cocos.Scheduler.get('sharedScheduler').resumeTarget(this);
    },
});

// Static variables
ModifyOverTime.list = [];

exports.ModifyOverTime = ModifyOverTime;