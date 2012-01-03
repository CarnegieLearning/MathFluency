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

// Cocos requirements
var cocos = require('cocos2d');
var geom = require('geometry');
var events = require('events');

// Project requirements
var LabelBG = require('LabelBG').LabelBG;
var PNode = require('PerspectiveNode').PerspectiveNode;

// Static requirements
var RC = require('RaceControl').RaceControl;
var MOT = require('ModifyOverTime').ModifyOverTime;

// Represents the player in the game
var Player = PNode.extend({
    selector        : null,     // Label that represents the value the player has control over
    
    wipeoutDuration : 0,        // Duration remaining on a wipeout
    wipeoutRotSpeed : 0,        // Rotational velocity in degrees per second for the current wipeout
    
    selectorX       : null,     // The X coordinate that the label should be at, ignoring rotational transforms
    selectorY       : null,     // The Y coordinate that the label should be at, ignoring rotational transforms
    
    chaseDist       : 6,        // The distance in meters the player is ahead of the camera by
    chaseMin        : 6,        // The closest the camera can get behind the car in meters
    chaseDelta      : 1,        // How many meters the player will pull away from the camera by moving at maximum speed
    
    minSpeed        : 0,        // Minimum player speed in m/s (Zero is okay, negatives are BAD)
    maxSpeed        : 200,      // Maximum player speed in m/s
    acceleration    : 13,       // Player acceleration in m/s^2
    deceleration    : 26,       // Player deceleration in m/s^2
    
    turbo           : false,    // True if turbo boost is currently active
    preTurbo        : 0,        // Holds what the zVelocity was before turbo boosting
    turboSpeed      : 200,      // Turbo boost speed in m/s
    turboMOT        : null,     // Hold the MOT currently affecting zVelocity

    init: function() {
        Player.superclass.init.call(this, {xCoordinate:0, zCoordinate: this.get('chaseDist')});
        
        // Static binds
        this.changeSelector = this.changeSelector.bind(this)
        this.turboCompleted = this.turboCompleted.bind(this)
        this.endIntermission = this.endIntermission.bind(this)
        this.startIntermission = this.startIntermission.bind(this)
        this.startAnimationCallback = this.startAnimationCallback.bind(this)
        
        // Load the car sprite for the player
        var sprite = cocos.nodes.Sprite.create({file: '/resources/snow_car.png',});
        sprite.set('scaleX', 0.5);
        sprite.set('scaleY', 0.5);
        this.addChild({child: sprite});
    },
    
    // Changes the currently displayed selector on the car
    // STATIC BIND
    changeSelector: function(newVal, location) {
        // Remove previous selector if there was one
        var prev = this.get('selector');
        if(prev != null) {
            this.removeChild(prev);
        }

        newVal = this.get('newSelector');
    
        // Create the new selector if one is provided
        if(newVal != null) {
            var selector = newVal
            this.get('parent').removeChild(selector);
            this.changeSelectorByForce(selector);
        }
        else {
            this.set('selector', null);
        }
        
        setTimeout(this.endIntermission, 100);
    },
    
    // Used to set the selector at the start of the game
    changeSelectorByForce: function(selector) {
        selector.set('position', new geom.Point(selector.get('contentSize').width / 2 * selector.get('scaleX'), 80));
        this.set('selectorX', selector.get('contentSize').width / 2 * selector.get('scaleX'));
        this.set('selectorY', 80);
        this.addChild({child: selector});
        this.set('selector', selector);
    },
    
    // Starts an intermission
    // STATIC BIND
    startIntermission: function(newVal, location) {
        this.endTurboBoost();
        
        var tm = this.get('turboMOT');
        if(tm != null) {
            tm.pause();
            this.set('turboMOT', tm);
        }
        
        // Stop the player on the checkpoint
        if(this.get('zCoordinate') > location) {
            this.set('zCoordinate', location);
        }
        
        this.set('intermission', true);
        this.set('preInter', this.get('zVelocity'));
        this.set('zVelocity', 0);
        this.set('newSelector', newVal);
        newVal.set('anchorPoint', new geom.Point(0.5, 0.5));
        var s = newVal.get('scale') * 3;
        var cs = newVal.get('contentSize');
        newVal.set('scale', 0.1);
        newVal.set('position', new geom.Point(400 + cs.width * 1.5, 100 + cs.height * 1.5));
        this.get('parent').addChild({child: newVal});
        
        if(this.get('selector') != null) {
            MOT.create(255, -255, 1.0).bindTo('value', this.get('selector'), 'opacity');
        }
        
        var a1 = cocos.actions.ScaleTo.create({scale: s, duration: 0.25});
        a1.startWithTarget(newVal);
        newVal.runAction(a1);
        
        setTimeout(this.startAnimationCallback, 1000);
    },
    
    // Finishes an intermission
    // STATIC BIND
    endIntermission: function() {
        this.set('intermission', false);
        
        var tm = this.get('turboMOT');
        if(tm != null) {
            tm.resume();
            this.set('turboMOT', tm);
        }
        
        this.set('zVelocity', this.get('preInter'));
        events.trigger(this, 'IntermissionComplete');
    },
    
    
    // Shows the new selector, schedules to hide if blink count is not exhausted
    // STATIC BIND
    startAnimationCallback: function() {
        var nv = this.get('newSelector');
        var ns = nv.get('scale') / 3;
        
        var a1 = cocos.actions.ScaleTo.create({scale: ns, duration: 1.0});
        a1.startWithTarget(nv);
        nv.runAction(a1);
        
        var pos = this.get('position');
        var a2 = cocos.actions.MoveTo.create({position: new geom.Point(pos.x, pos.y + this.get('selectorY')), duration: 1.0});
        a2.startWithTarget(nv);
        nv.runAction(a2);
        
        setTimeout(this.changeSelector.bind(this), 1000);
    },
    
    // Sets the wipeout status of the car, causing it to spin over time and slow down
    wipeout: function(spins) {
        this.set('wipeoutDuration', RC.maxTimeWindow / 2.0);
        this.set('wipeoutRotSpeed', spins * 360.0 / (RC.maxTimeWindow / 2.0));
        
        if(this.get('turbo')) {
            this.endTurboBoost();
        }
        else {
            this.incorrectSlowdown();
        }
    },
    
    // Slows the player down due to an incorrect answer
    incorrectSlowdown: function() {
        if(!this.speedChange((this.get('zVelocity') - this.get('minSpeed')) * RC.penaltySpeed, 0.1)) {
            setTimeout(this.incorrectSlowdown.bind(this), 100);
        }
    },
    
    // Accelerates the player
    accelerate: function (dt) {
        if(!this.get('intermission') && this.get('turboMOT') == null) {
            var s = this.get('zVelocity') + this.get('acceleration') * dt
            s = Math.min(this.get('maxSpeed'), s);
            this.set('zVelocity', s);
        }
    },
    
    // Decelerates the player
    decelerate: function (dt) {
        if(!this.get('intermission') && this.get('turboMOT') == null) {
            var s = this.get('zVelocity') - this.get('deceleration') * dt
            s = Math.max(this.get('minSpeed'), s);
            this.set('zVelocity', s);
        }
    },

    // Starts a turbo boost if not already boosting
    startTurboBoost: function() {
        if(!this.get('turbo') && !(this.get('wipeoutDuration') > 0) && !this.get('intermission') && this.get('turboMOT') == null) {
            this.set('turbo', true);
            this.set('preTurbo', this.get('zVelocity'))
            
            var tm = this.speedChange(this.get('turboSpeed') - this.get('zVelocity'), 0.1);
            this.set('turboMOT', tm);
            events.addListener(tm, 'Completed', this.turboCompleted);
            
            return true;
        }
        
        return false;
    },
    
    // STATIC BIND
    turboCompleted: function() {
        this.set('turboMOT', null);
    },
    
    // Ends a turbo boost if it is active (usually called when answering a question, but could be used to cut the boost early)
    endTurboBoost: function() {
        if(this.get('turbo')) {
            var tm = this.get('turboMOT');
            if(tm != null) {
                tm.kill();
                this.set('turboMOT', null);
            }
        
            this.set('turbo', false);
            var tm =this.speedChange(this.get('preTurbo') - this.get('zVelocity'), 0.1);
            this.set('turboMOT', tm);
            events.addListener(tm, 'Completed', this.turboCompleted);
        }
    },
    
    // Shortcut function for applying a speed change over time, returns the MOT
    speedChange: function (amt, dur) {
        var m = MOT.create(this.get('zVelocity'), amt, dur);
        m.bind(this, 'zVelocity');
        
        return m;
    },
    
    update: function(dt) {
        // Always maintain at least the minimum speed
        var v = this.get('zVelocity');
        if(v < this.get('minSpeed') && !this.get('intermission')) {
            this.set('zVelocity', this.get('minSpeed'));
        }
        else if(v < 0 || isNaN(v)) {
            this.set('zVelocity', 0);
        }
        
        // Stop on the finish line when crossed
        if(this.get('zCoordinate') > RC.finishLine) {
            this.set('zCoordinate', RC.finishLine);
            this.unbind('zVelocity');
            this.set('zVelocity', 0);
        }
    
        // Set the chase distance based on current speed
        this.set('chaseDist', this.get('chaseMin') + this.get('chaseDelta') * (this.get('zVelocity') / this.get('maxSpeed')));
        
        // Update the camera and include the current frame's velocity which has yet to be applied to the player (eliminates jitter)
        PNode.cameraZ = this.get('zCoordinate') - this.get('chaseDist') + (this.get('zVelocity') * dt);

        // Let PNode handle perspective rendering
        Player.superclass.update.call(this, dt);
        
        var pos = this.get('position');
        
        //Spin the car as a result of getting a wrong answer
        if(this.get('wipeoutDuration') > 0) {
            this.set('rotation', this.get('rotation') + this.get('wipeoutRotSpeed') * dt)
            this.set('wipeoutDuration', this.get('wipeoutDuration') - dt);
        }
        // Otherwise just rotate the player as they move to keep the visual angles realistic
        else {
            if(pos.x < 400.0) {
                this.set('rotation', (90 - 180.0/Math.PI * Math.atan((pos.y - 50) / (400.0 - pos.x))) / 1.5)
            }
            else {
                this.set('rotation', (90 - 180.0/Math.PI * Math.atan((pos.y - 50) / (pos.x - 400.0))) / -1.5)
            }
        }
    
        // Keep the selector from rotating with the car
        if(this.get('selector') != null) {
            // Do not rotate the label, keep its facing constant in respect to its own origin
            var rot = this.get('rotation');
            this.get('selector').set('rotation', rot * -1);
            
            //Cocos works in degrees, Math works in radians, so convert
            rot = rot * Math.PI / 180.0
            
            // Keep the label in a fixed position beneath the car, regardless of car rotation
            var x =      this.get('selectorX') * Math.cos(rot) + this.get('selectorY') * Math.sin(rot)
            var y = -1 * this.get('selectorX') * Math.sin(rot) + this.get('selectorY') * Math.cos(rot)
            
            this.get('selector').set('position', new geom.Point(x, y));
        }
    },
});

exports.Player = Player;