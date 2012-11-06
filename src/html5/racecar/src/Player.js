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
var Texture2D = require('cocos2d').Texture2D;

// Project requirements
var LabelBG = require('/LabelBG');
var PNode = require('/PerspectiveNode');

// Static requirements
var RC = require('/RaceControl');
var MOT = require('/ModifyOverTime');
var L = require('/Logger');

// Represents the player in the game
function Player() {
    Player.superclass.constructor.call(this, {xCoordinate:0, zCoordinate: this.chaseDist});
    
    // Static binds
    this.changeSelector = this.changeSelector.bind(this);
    this.turboCompleted = this.turboCompleted.bind(this);
    this.endIntermission = this.endIntermission.bind(this);
    this.startIntermission = this.startIntermission.bind(this);
    this.startAnimationCallback = this.startAnimationCallback.bind(this);
    this.fishtailCallback = this.fishtailCallback.bind(this);
    
    this.selectorBG = new cocos.nodes.Sprite({file: '/resources/carNumberB.png'});
    this.selectorBG.zOrder = -1;
    this.selectorBG.scaleX = 0.3;
    this.selectorBG.scaleY = 0.3;
    
    // Load the car sprite for the player
    this.sprites = [
        new cocos.nodes.Sprite({file: '/resources/Cars/Car-left.png'}),
        new cocos.nodes.Sprite({file: '/resources/Cars/carPlayer01.png'}),
        new cocos.nodes.Sprite({file: '/resources/Cars/Car-right.png'})
    ];
    this.addChild({child: this.sprites[1]});
    
    // Load fishtail animation
    var anim = [];
    
    var texture = new Texture2D({file: module.dirname + '/resources/Fishtail/fishTailSheet.png'});
    for(var i=2; i<=17; i++) {
        anim.push(new cocos.SpriteFrame({texture: texture, rect: geom.rectMake((i-2)*200, 0, 200, 115)}));
    }
    
    this.animNode = new cocos.nodes.Sprite();
    this.animNode.position = new geom.Point(-32, 0);
    
    var anim = new cocos.Animation({frames: anim, delay: 0.05});
    this.fishtail = new cocos.actions.Animate({animation: anim, restoreOriginalFrame: false});
}    

Player.inherit(PNode, {
    selector        : null,     // Label that represents the value the player has control over
    
    wipeoutDuration : 0,        // Duration remaining on a wipeout
    wipeoutRotSpeed : 0,        // Rotational velocity in degrees per second for the current wipeout
    
    selectorX       : null,     // The X coordinate that the label should be at, ignoring rotational transforms
    selectorY       : null,     // The Y coordinate that the label should be at, ignoring rotational transforms
    
    chaseDist       : 13,       // The distance in meters the player is ahead of the camera by
    chaseMin        : 13,       // The closest the camera can get behind the car in meters
    chaseDelta      : 1,        // How many meters the player will pull away from the camera by moving at maximum speed
    
    minSpeed        : 0,        // Minimum player speed in m/s (Zero is okay, negatives are BAD)
    maxSpeed        : 200,      // Maximum player speed in m/s
    acceleration    : 13,       // Player acceleration in m/s^2
    deceleration    : 26,       // Player deceleration in m/s^2
    
    turbo           : false,    // True if turbo boost is currently active
    preTurbo        : 0,        // Holds what the zVelocity was before turbo boosting
    turboSpeed      : 200,      // Turbo boost speed in m/s
    turboMOT        : null,     // Hold the MOT currently affecting zVelocity
    
    fishtail        : null,     // Holds the fishtail animation
    animating       : false,    // True when animating the fishtail animation
    
    sprites         : null,     // Array of car sprites
    lcr             : 1,        // Which sprite to use
    
    // Plays the fishtail animation
    fishtailAnimation: function() {
        this.animating = true;
        
        this.removeChild({child: this.sprites[this.lcr]});
        this.addChild({child: this.animNode});
        
        if(this.lcr == 0 || this.lcr == 1 && Math.floor(Math.random() * 2)) {
            this.animNode.scaleX = -1;
        }
        else {
            this.animNode.scaleX = 1;
        }
        
        this.animNode.runAction(this.fishtail);
        
        setTimeout(this.fishtailCallback, 850);
    },
    
    // Cleans up the fishtail animation
    // STATIC BIND
    fishtailCallback: function() {
        this.removeChild({child: this.animNode});
        this.addChild({child: this.sprites[this.lcr]});
        
        this.animating = false;
    },
    
    // Change the car sprite relative to the current lane
    // Returns true if the player is allowed to change lanes, false otherwise
    changeLane: function(lane) {
        // Only allow lane changes when not animating fishtail
        if(this.animating) {
            return false;
        }
        
        // Swap the player car sprites
        this.removeChild({child: this.sprites[this.lcr]});
        this.lcr = lane;
        this.addChild({child: this.sprites[this.lcr]});
        
        return true;
    },
    
    // Changes the currently displayed selector on the car
    // STATIC BIND
    changeSelector: function(newVal, location) {
        // Remove previous selector if there was one
        if(this.selector != null) {
            this.selector.removeChild(this.selectorBG);
            this.removeChild(this.selector);
        }
        
        // Create the new selector if one is provided
        if(this.newSelector != null) {
            this.parent.removeChild(this.newSelector);
            this.changeSelectorByForce(this.newSelector);
        }
        else {
            this.selector = null;
        }
        
        setTimeout(this.endIntermission, 100);
    },
    
    // Used to set the selector at the start of the game
    changeSelectorByForce: function(selector) {
        var x = selector.contentSize.width / 2 * selector.scaleX;
        
        selector.position = new geom.Point(x, -80);
        selector.bgShow = false;
        this.selectorX = x;
        this.selectorY = -80;
        this.addChild({child: selector});
        this.selector = selector;
        selector.addChild({child: this.selectorBG});
    },
    
    // Starts an intermission
    // STATIC BIND
    startIntermission: function(newVal, location) {
        L.log('CHECKPOINT_START', {});
        this.endTurboBoost();
        
        var tm = this.turboMOT;
        if(tm != null) {
            tm.pause();
            this.turboMOT = tm;
        }
        
        // Stop the player on the checkpoint
        if(this.zCoordinate > location) {
            this.zCoordinate = location;
        }
        
        var s = newVal.scale * 1.5;
        var cs = newVal.contentSize;
        newVal.scale = 0.1;
        newVal.position = new geom.Point(450, 500);
        this.parent.addChild({child: newVal});
        
        if(this.selector != null) {
            var m = new MOT(255, -255, 1.0);
            m.bind(this.selector, 'opacityLink');
        }
        
        var a1 = new cocos.actions.ScaleTo({scale: s, duration: 0.25});
        a1.startWithTarget(newVal);
        newVal.runAction(a1);
        
        this.intermission = true;
        this.preInter = this.zVelocity;
        this.zVelocity = 0;
        this.newSelector = newVal;
        
        setTimeout(this.startAnimationCallback, 1000);
    },
    
    // Finishes an intermission
    // STATIC BIND
    endIntermission: function() {
        this.intermission = false;
        
        var tm = this.turboMOT;
        if(tm != null) {
            tm.resume();
            this.turboMOT = tm;
        }
        
        this.zVelocity = this.preInter;
        events.trigger(this, 'IntermissionComplete');
        
        L.log('CHECKPOINT_END', {});
    },
    
    // Shows the new selector, schedules to hide if blink count is not exhausted
    // STATIC BIND
    startAnimationCallback: function() {
        var nv = this.newSelector;
        
        var a1 = new cocos.actions.ScaleTo({scale: nv.scale / 1.5, duration: 1.0});
        a1.startWithTarget(nv);
        nv.runAction(a1);
        
        var a2 = new cocos.actions.MoveTo({position: new geom.Point(this.position.x, this.position.y + this.selectorY), duration: 1.0});
        a2.startWithTarget(nv);
        nv.runAction(a2);
        
        setTimeout(this.changeSelector, 1000);
    },
    
    // Sets the wipeout status of the car, causing it to spin over time and slow down
    wipeout: function(spins) {
        this.fishtailAnimation();
        if(this.turbo) {
            this.endTurboBoost();
        }
        else {
            this.incorrectSlowdown();
        }
    },
    
    // Slows the player down due to an incorrect answer
    incorrectSlowdown: function() {
        if(!this.speedChange((this.zVelocity - this.minSpeed) * RC.penaltySpeed, 0.1)) {
            setTimeout(this.incorrectSlowdown.bind(this), 100);
        }
    },
    
    // Accelerates the player
    accelerate: function (dt) {
        if(!this.intermission && this.turboMOT == null) {
            var s = this.zVelocity + this.acceleration * dt
            s = Math.min(this.maxSpeed, s);
            this.zVelocity = s;
        }
    },
    
    // Decelerates the player
    decelerate: function (dt) {
        if(!this.intermission && this.turboMOT == null) {
            var s = this.zVelocity - this.deceleration * dt
            s = Math.max(this.minSpeed, s);
            this.zVelocity = s;
        }
    },

    // Starts a turbo boost if not already boosting
    startTurboBoost: function() {
        if(!this.turbo && !(this.wipeoutDuration > 0) && !this.intermission && this.turboMOT == null) {
            this.turbo = true;
            this.preTurbo = this.zVelocity;
            
            var tm = this.speedChange(this.turboSpeed - this.zVelocity, 0.1);
            this.turboMOT = tm;
            events.addListener(tm, 'Completed', this.turboCompleted);
            
            return true;
        }
        
        return false;
    },
    
    // STATIC BIND
    turboCompleted: function() {
        this.turboMOT = null;
    },
    
    // Ends a turbo boost if it is active (usually called when answering a question, but could be used to cut the boost early)
    endTurboBoost: function() {
        if(this.turbo) {
            var tm = this.turboMOT;
            if(tm != null) {
                tm.kill();
                this.turboMOT = null;
            }
            
            this.turbo = false;
            var tm = this.speedChange(this.preTurbo - this.zVelocity, 0.1);
            this.turboMOT = tm;
            events.addListener(tm, 'Completed', this.turboCompleted);
        }
    },
    
    // Shortcut function for applying a speed change over time, returns the MOT
    speedChange: function (amt, dur) {
        var m = new MOT(this.zVelocity, amt, dur);
        m.bind(this, 'zVelocity');
        
        return m;
    },
    
    update: function(dt) {
        // Always maintain at least the minimum speed
        var v = this.zVelocity;
        if(v < this.minSpeed && !this.intermission) {
            this.zVelocity = this.minSpeed;
        }
        else if(v < 0 || isNaN(v)) {
            this.zVelocity = 0;
        }
        
        // Stop on the finish line when crossed
        if(this.zCoordinate > RC.finishLine) {
            this.zCoordinate = RC.finishLine;
            //HACK: This velocity change is not supposed to be propagated
            this._v = 0;
        }
        
        // Set the chase distance based on current speed
        this.chaseDist = this.chaseMin + this.chaseDelta * (this.zVelocity / this.maxSpeed);
        
        // Update the camera and include the current frame's velocity which has yet to be applied to the player (eliminates jitter)
        PNode.cameraZ = this.zCoordinate - this.chaseDist + (this.zVelocity * dt);
        
        //HACK: Somewhere else is breaking these values
        this.selector.position.x = this.selectorX;
        this.selector.position.y = this.selectorY;
        
        // Let PNode handle perspective rendering
        Player.superclass.update.call(this, dt);
        
        L.alwaysLog['Speed'] = Math.round((this.zVelocity * 100)) / 100.0;
        L.alwaysLog['Z'] = Math.round((this.zCoordinate * 100)) / 100.0;
    },
    
    //HACK: for depreciated bindTo
    set zCoordinate (val) {
        this._z = val;
        
        if(this.dash) {
            this.dash.playerZ = val;
        }
    },
    
    get zCoordinate () {
        return this._z;
    },
    
    //HACK: for depreciated bindTo
    set zVelocity (val) {
        this._v = val;
        
        if(this.dash) {
            this.dash.speed = val;
        }
    },
    
    get zVelocity () {
        return this._v;
    }
});

module.exports = Player;