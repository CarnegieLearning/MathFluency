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

// 
var ModifyOverTime = BObject.extend({
    duration: 0,    // 
    rate    : 0,    // 
    value   : null, // 
    init: function (x, amount, time) {
        ModifyOverTime.superclass.init.call();
        
        // 
        this.set('value', x);
        this.set('rate', amount / time);
        this.set('duration', time);
        
        cocos.Scheduler.get('sharedScheduler').scheduleUpdate({target: this, priority: 0, paused: false});
        
        ModifyOverTime.list.push(this);
    },

    // 
    update: function (dt) {
        var dur = this.get('duration');
        
        if(dur > 0) {
            var edt = Math.min(dt, dur);
            this.set('duration', dur - edt);
            
            var rate = this.get('rate');
            this.set('value', this.get('value') + rate * edt);
        }
        
        // 
        else {
            // 
            events.trigger(this, 'Completed', this);
        
            // 
            cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this);
            events.clearInstanceListeners(this);
            this.unbind(this.get('value'));
            
            // 
            var index = ModifyOverTime.list.indexOf(this);
            ModifyOverTime.list.splice(index, 1);
        }
    }
});

// 
ModifyOverTime.list = [];

exports.ModifyOverTime = ModifyOverTime;