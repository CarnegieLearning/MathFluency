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
function Preloader () {
    Preloader.superclass.constructor.call(this);
    
    var dir = '/resources/Loader/';
    
    // Load animation
    var animCache = cocos.AnimationCache.sharedAnimationCache;
    var frameCache = cocos.SpriteFrameCache.sharedSpriteFrameCache;
    
    var anim = [];
    var r = geo.rectMake(0, 0, 310, 73);

    for(var i=1; i<=16; i++) {
        anim.push(new cocos.SpriteFrame({texture: new Texture2D({file: module.dirname + dir + 'LoadingScreen' + (i >= 10 ? i : '0' + i) + '.png'}), rect: r}));
    }
    
    var animNode = new cocos.nodes.Sprite();
    animNode.position = new geo.Point(440, 314);
    animNode.zOrder = 2;
    this.addChild(animNode);
    
    var Animation = new cocos.Animation({frames: anim, delay: 0.19});
    animNode.runAction(new cocos.actions.Animate({animation: Animation, restoreOriginalFrame: false}));
    
    this.scheduleUpdate();
}

Preloader.inherit(cocos.nodes.Node, {
    pct: 0.0,       // Percent loaded

    // Fake loading update
    update: function(dt) {
        this.pct += dt * 0.33;
        console.log('preloader ' + this.pct);
        if(this.pct > 1) {
            this.pct = 1;
            events.trigger(this, 'loaded');
        }
    },
    
    // Draw the screen
    draw: function(context) {
        // Cover the screen
        context.fillStyle = "#000000";
        context.fillRect(-10, -10, 920, 620);
    }
});

module.exports = Preloader