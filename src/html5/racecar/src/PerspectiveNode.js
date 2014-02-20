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
var geom = require('geometry');
var events = require('events');
var util = require('util');

var RC = require('/RaceControl');

// Base class for rending objects in perspective view
function PerspectiveNode (opts) {
    PerspectiveNode.superclass.constructor.call(this, opts);

    this.zCoordinate = 0;
    
    this.position = new geom.Point(0, 0);
    this.anchorPoint = new geom.Point(0, 0);
    
    //Set properties from the option object
    var i = -1;
    while(++i < PerspectiveNode.params.length) {
        if (opts[PerspectiveNode.params[i]]) {
            this[PerspectiveNode.params[i]] = opts[PerspectiveNode.params[i]];
        }
    }
    
    if(this.content != null) {
        this.content.anchorPoint = new geom.Point(0, 0);
        this.addChild({child: this.content});
        this.contentSize = this.content.contentSize;
    }
    
    this.idle = this.idle.bind(this);
}

PerspectiveNode.inherit(cocos.nodes.Node, {
    visibility  : 1,        // Content scale multiplier, used BEFORE clamping
    minScale    : null,     // Minimum scale for this node due to perspective distance (null disables minimum)
    maxScale    : null,     // Maximum scale for this node due to perspective distance (null disables maximum)
    xCoordinate : 0,        // The node's X position in the world
    silent      : false,    // If set to true, will not fire events
    added       : false,    // True once added to the scene
    lockX       : false,    // Set to true to lock X value
    lockY       : false,    // Set to true to lock Y value
    alignV      : 0,        // Vertical alignment of the node (0 top - 0.5 center - 1 bottom)
    alignH      : 0,        // Horizontal alignment of the node (0 right - 0.5 center - 1 left)
    dropoffDist : -10,      // Distance behind the camera that node requests removal from scene
    zVelocity   : 0,        // Meters per second speed along the Z axis
    xVelocity   : 0,        // Meters per second speed along the X axis
    content     : null,     // Content to be displayed in the node
    delOnDrop   : true,     // If true, runs cleanup when the node is removed from the scene
    
    disabled    : false,

    // Explicitly unschedules and unsubscribes this node
    cleanup: function () {
		clearTimeout(this.idleing);
        cocos.Scheduler.sharedScheduler.unscheduleUpdateForTarget(this);
        events.clearInstanceListeners(this);
    },
    
    // Callen when place into the scene
    onEnter: function() {
        this.added = true;
        PerspectiveNode.superclass.onEnter.call(this);
    },
    
    // Called when removed from the scene, if delOnDrop, runs cleanup, otherwise explictly reschedules the node
    onExit: function () {
        this.added = false;
        PerspectiveNode.superclass.onExit.call(this);
        
        //TODO: 1) No longer track delOnDrop, 2) All cleared objects revert to idleing
        if(this.delOnDrop) {
            this.cleanup();
        }
        else {
            cocos.Scheduler.sharedScheduler.scheduleUpdate({target: this, priority: 0, paused: false});
        }
    },
    
    // Applies visibility modifier and clamps to scale, then returns the augmented value
    scale: function (s) {
        s *= this.visibility;
        
        // Apply clamps to scale as needed
        if(this.minScale != null) {
            s = Math.max(this.minScale, s);
        }
        if(this.maxScale != null) {
            s = Math.min(this.maxScale, s);
        }
        
        // Set scale
        this.scaleX = s;
        this.scaleY = s;
        
        return s;
    },
    
    // Helper function for determining node width
    getContentWidth: function() {
        if(this.content) {
            return this.contentSize.width * this.content.scaleX;
        }
        return this.contentSize.width;
    },
    
    // Helper function for determining node height
    getContentHeight: function() {
        if(this.content) {
            return this.contentSize.height * this.content.scaleY;
        }
        return this.contentSize.height;
    },
    
    // Called once per second until node is 'just over the horizon' at which point, it starts running update() every frame instead
    // NOTE: This may not handle nodes in moion correctly
    idle: function () {
        var distance = this.zCoordinate - PerspectiveNode.cameraZ;
        
        if(distance < PerspectiveNode.horizonDistance + RC.maxDistWindow) {
            cocos.Scheduler.sharedScheduler.scheduleUpdate({target: this, priority: 0, paused: false});
        }
        else {
            this.idleing = setTimeout(this.idle, 1000);
        }
    },
    
    // Called every frame for distance checking and rendering
    update: function (dt) {
        // Update current position based on velocity
        this.zCoordinate = this.zCoordinate + this.zVelocity * dt;
        this.xCoordinate = this.xCoordinate + this.xVelocity * dt;
        
        var distance = this.zCoordinate - PerspectiveNode.cameraZ;
        
        // Only worry about drawing once node is on our side of the horizon
        if(distance > PerspectiveNode.horizonDistance) {
            if(this.added && !this.silent) {
                events.trigger(this, 'removeMe', this);
                return -1;
            }
        }
        else if(distance <= PerspectiveNode.horizonDistance && distance > this.dropoffDist) {
            // Make sure that the node gets added to the scene graph once it should be visible
            if(!this.added && !this.silent && !this.disabled) {
                events.trigger(this, 'addMe', this);
                return 1;
            }
            
            this.updatePosition();
        }
        // Once the node drops too far back, notify for removal
        else if (!this.silent) {
            events.trigger(this, 'removeMe', this);
            return -1;
        }
        
        return 0;
    },
    
    updatePosition: function() {
        // Perspective transform
        var distance = this.zCoordinate - PerspectiveNode.cameraZ;
        var scale = PerspectiveNode.horizonDistance * PerspectiveNode.horizonScale / distance;
        var screenX, screenY;
        
        // Apply scaling
        var displayScale = this.scale(scale);
        
        // Check to see if X axis is locked
        if(!this.lockX) {
            screenX = PerspectiveNode.roadOffset + PerspectiveNode.roadWidthPix / 2 * (1 + scale * 2.0 * (this.xCoordinate / PerspectiveNode.roadWidth));
            screenX -= this.alignH * this.getContentWidth() * displayScale;
        }
        else {
            screenX = this.alignH * this.getContentWidth() * displayScale;
        }
        
        // Check to see if Y axis is locked
        if(!this.lockY) {
            var yScale = (1.0 / (1.0 - PerspectiveNode.horizonScale)) * (scale - PerspectiveNode.horizonScale);
            screenY = PerspectiveNode.horizonHeight - PerspectiveNode.horizonHeight * (yScale);
            screenY += this.alignV * this.getContentHeight() * displayScale;
        }
        else {
            screenY = -1 * this.alignV * this.getContentHeight() * displayScale;
        }
        
        // Set position
        this.position = new geom.Point(screenX|0, screenY|0);
    },
    
    //HACK: for depreciated bindTo
    set zCoordinate (val) {
        this.z = val;
        
        if(this.dash && this.dashStr) {
            this.dash[this.dashStr] = val;
        }
    },
    
    get zCoordinate () {
        return this.z;
    }
});

// Static constants
PerspectiveNode.horizonHeight   = 409;      // From horizonStart to the bottom of the screen in pixels
PerspectiveNode.horizonDistance = 100;      // In meters from the camera
PerspectiveNode.horizonScale    = 0.074;    // Scale of objects on the horizon (553:41)
PerspectiveNode.roadWidth       = 9.0;      // Width of road at bottom of the screen in meters
PerspectiveNode.roadWidthPix    = 553*1.2;  // Width of road at bottom of the screen in pixels
PerspectiveNode.roadOffset      = 175-55.3; // Number of pixels from the left hand side that the road starts at

// Array of legal values in constructor opts argument
PerspectiveNode.params = ['visibility','minScale','maxScale','xCoordinate','zCoordinate','silent','lockX','lockY','alignV','alignH','dropoffDist','zVelocity','xVelocity','content','delOnDrop'];

// Static variables
PerspectiveNode.cameraZ = 0;                // Current Z coordinate of the camera

module.exports = PerspectiveNode