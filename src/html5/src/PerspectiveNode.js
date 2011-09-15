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

// Base class for rending objects in perspective view
var PerspectiveNode = cocos.nodes.Node.extend({
    visibility  : 1,        // Content scale multiplier, used BEFORE clamping
    minScale    : null,     // Minimum scale for this node due to perspective distance (null disables minimum)
    maxScale    : null,     // Maximum scale for this node due to perspective distance (null disables maximum)
    xCoordinate : 0,        // The node's X position in the world
    zCoordinate : 0,        // The node's Z position in the world
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
    init: function(opts) {
        PerspectiveNode.superclass.init.call(this, opts);
        
        this.set('position', new geom.Point(0, 0));
        this.set('anchorPoint', new geom.Point(0, 0));
        
        //Set properties from the option object
        util.each('visibility minScale maxScale xCoordinate zCoordinate silent lockX lockY alignV alignH dropoffDist zVelocity xVelocity content'.w(), util.callback(this, function (name) {
            if (opts[name]) {
                this.set(name, opts[name]);
            }
        }));
        
        if(this.get('content') != null) {
            this.get('content').set('anchorPoint', new geom.Point(0, 0));
            this.addChild({child: this.get('content')});
            this.set('contentSize', this.get('content').get('contentSize'));
        }
    },
    
    // Explicitly start update, even if not in scene
    kickstart: function () {
         cocos.Scheduler.get('sharedScheduler').scheduleUpdate({target: this, priority: 0, paused: false});
    },
    
    // Explicitly unschedules and unsubscribes this node
    cleanup: function () {
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this);
        events.clearInstanceListeners(this);
    },
    
    // Callen when place into the scene
    onEnter: function() {
        this.set('added', true);
        PerspectiveNode.superclass.onEnter.call(this);
    },
    
    // Called when removed from the scene, if delOnDrop, runs cleanup, otherwise explictly reschedules the node
    onExit: function () {
        this.set('added', false);
        PerspectiveNode.superclass.onExit.call(this);
        
        if(this.get('delOnDrop')) {
            this.cleanup();
        }
        else {
            cocos.Scheduler.get('sharedScheduler').scheduleUpdate({target: this, priority: 0, paused: false});
        }
    },
    
    // Applies visibility modifier and clamps to scale, then returns the augmented value
    scale: function (s) {
        s *= this.get('visibility');
    
        // Apply clamps to scale as needed
        if(this.get('minScale') != null) {
            s = Math.max(this.get('minScale'), s);
        }
        if(this.get('maxScale') != null) {
            s = Math.min(this.get('maxScale'), s);
        }
        
        // Set scale
        this.set('scaleX', s);
        this.set('scaleY', s);
        
        return s;
    },
    
    // Called every frame for distance checking and rendering
    update: function (dt) {
        // Update current position based on velocity
        this.set('zCoordinate', this.get('zCoordinate') + this.get('zVelocity') * dt);
        this.set('xCoordinate', this.get('xCoordinate') + this.get('xVelocity') * dt);
        
        var distance = this.get('zCoordinate') - PerspectiveNode.cameraZ;
    
        // Only worry about drawing once node is on our side of the horizon
        if(distance > PerspectiveNode.horizonDistance) {
            if(this.get('added') && !this.get('silent')) {
                events.trigger(this, 'removeMe', this);
            }
        }
        else if(distance <= PerspectiveNode.horizonDistance && distance > this.get('dropoffDist')) {
            // Make sure that the node gets added to the scene graph once it should be visible
            if(!this.get('added') && !this.get('silent')) {
                events.trigger(this, 'addMe', this);
            }
        
            // Perspective transform
            var scale = PerspectiveNode.horizonDistance * PerspectiveNode.horizonScale / distance;
            var screenX, screenY;
            var lockX = this.get('lockX'), lockY = this.get('lockY');
            
            // Apply scaling
            var displayScale = this.scale(scale);
            
            // Check to see if X axis is locked
            if(!lockX) {
                screenX = PerspectiveNode.roadOffset + PerspectiveNode.roadWidthPix / 2 * (1 + scale * 2.0 * (this.get('xCoordinate') / PerspectiveNode.roadWidth));
                screenX -= this.get('alignH') * this.get('contentSize').width * displayScale;
            }
            else {
                screenX = this.get('alignH') * this.get('contentSize').width * displayScale;
            }
            
            // Check to see if Y axis is locked
            if(!lockY) {
                var yScale = (1.0 / (1.0 - PerspectiveNode.horizonScale)) * (scale - PerspectiveNode.horizonScale);
                screenY = PerspectiveNode.horizonStart + PerspectiveNode.horizonHeight * (yScale);
                screenY -= this.get('alignV') * this.get('contentSize').height * displayScale;
            }
            else {
                screenY = -1 * this.get('alignV') * this.get('contentSize').height * displayScale;
            }

            // Set position
            this.set('position', new geom.Point(screenX, screenY));
        }
        // Once the node drops too far back, notify for removal
        else if (!this.get('silent')) {
            events.trigger(this, 'removeMe', this);
        }
    }
});

// Static constants
PerspectiveNode.horizonStart    = 150;      // From top of screen to start of horizon in pixels
PerspectiveNode.horizonHeight   = 450;      // From horizonStart to the bottom of the screen in pixels
PerspectiveNode.horizonDistance = 100;      // In meters from the camera
PerspectiveNode.horizonScale    = 0.05;     // Scale of objects on the horizon
PerspectiveNode.roadWidth       = 9.0;      // Width of road at bottom of the screen in meters
PerspectiveNode.roadWidthPix    = 800;      // Width of road at bottom of the screen in pixels
PerspectiveNode.roadOffset      = 000;      // Number of pixels from the left hand side that the road starts at

// Static variables
PerspectiveNode.cameraZ = 0;                // Current Z coordinate of the camera

exports.PerspectiveNode = PerspectiveNode