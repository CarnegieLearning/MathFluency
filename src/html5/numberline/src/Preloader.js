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
var Texture2D = require('cocos2d').Texture2D;

// Preloading screen
var Preloader = cocos.nodes.Node.extend({
    pct: 0.0, // Percent loaded
    
    init: function() {
        Preloader.superclass.init.call(this);
    
        this.scheduleUpdate();
        
        var dir = '/resources/Loading_Splashscreen/';
        var load = cocos.nodes.Sprite.create({file: dir + 'Loading_Frame0001.png'});
        load.set('position', new geo.Point(450, 250));
        this.addChild({child: load});
        
        // Load animation
        var animCache = cocos.AnimationCache.get('sharedAnimationCache');
        var frameCache = cocos.SpriteFrameCache.get('sharedSpriteFrameCache');
        
        var anim = [];
        var r = geo.rectMake(0, 0, 575, 150);
    
        for(var i=1; i<=25; i++) {
            anim.push(cocos.SpriteFrame.create({texture: Texture2D.create({file: module.dirname + dir + 'Load_Bar00' + (i >= 10 ? i : '0' + i) + '.png'}), rect: r}));
        }
        
        var animNode = cocos.nodes.Sprite.create();
        animNode.set('position', new geo.Point(450, 320));
        animNode.set('zOrder', 2);
        this.addChild(animNode);
        
        var Animation = cocos.Animation.create({frames: anim, delay: 0.12});
        animNode.runAction(cocos.actions.Animate.create({animation: Animation, restoreOriginalFrame: false}));
        
    },
    
    // Fake loading update
    update: function(dt) {
        this.pct += dt * 0.33;
        if(this.pct > 1) {
            this.pct = 1;
            events.trigger(this, 'loaded');
        }
    },
    
    // Draw the screen (no images as they may of not loaded at this point)
    draw: function(context) {
        // Cover the screen
        context.fillStyle = "#000000";
        context.fillRect(-10, -10, 920, 620);
    }
});

exports.Preloader = Preloader