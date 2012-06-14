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

// Automatically handles changing a value over time
function ModifyOverTime (x, amount, time) {
    ModifyOverTime.superclass.constructor.call();
    
    // Initialize
    this.value = x;
    this.rate = amount / time;
    this.duration = time;
    
    // Force calling updates since this will not be added to the scene
    cocos.Scheduler.sharedScheduler.scheduleUpdate({target: this, priority: 0, paused: false});
    
    // Keep track of this instance so we can remove it automatically later
    ModifyOverTime.list.push(this);
}

ModifyOverTime.inherit(Object, {
    duration: 0,    // Remaining duration of the change
    rate    : 0,    // Rate at which the value changes per second
    value   : null, // The value that is being changed
    
    obj     : null, // Object with value to be modified
    str     : null, // If not null, the variable name on the object to be changed
    func    : null, // If not null, the funciton name on the object to call with the changed value
    
    // Binds the direct set case
    bind: function (obj, str) {
        if(this.func == null) {
            this.obj = obj;
            this.str = str;
            return true;
        }
        
        console.log('WARNING: MOT already bound to function ( ' + this.func + ' )');
        return false;
    },
    
    // Binds the set by function case
    bindFunc: function (obj, func) {
        if(this.str == null) {
            this.obj = obj;
            this.func = func;
            return true;
        }
        
        console.log('WARNING: MOT already bound to variable ( ' + this.str + ' )');
        return false;
    },

    // Changes value over time
    update: function (dt) {
        var dur = this.duration;
        
        // Keep changing as long as there is duration remaining
        if(dur > 0) {
            // Check the case that the tick is longer than our remaining time
            var edt = Math.min(dt, dur);
            this.duration = dur - edt;
            
            // Update value
            this.value = this.value + this.rate * edt;
            
            // Direct set case
            if(this.str) {
                this.obj[this.str] += this.rate * edt;
            }
            
            // Set by function case
            if(this.func) {
                this.func.apply(this.obj, [this.value]);
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
        cocos.Scheduler.sharedScheduler.unscheduleUpdateForTarget(this);
        events.clearInstanceListeners(this);
        
        this.obj = null;
        this.str = null;
        this.func = null;
        
        // and remove
        var index = ModifyOverTime.list.indexOf(this);
        ModifyOverTime.list.splice(index, 1);
    },
    
    // Pauses the MOT
    pause: function () {
        cocos.Scheduler.sharedScheduler.pauseTarget(this);
    },
    
    // Resumes the MOT
    resume: function () {
        cocos.Scheduler.sharedScheduler.resumeTarget(this);
    }
});

// Static variables
ModifyOverTime.list = [];

module.exports = ModifyOverTime;