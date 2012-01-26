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
var util = require('util');
var Texture2D = require('cocos2d').Texture2D;

var MOT = require('ModifyOverTime').ModifyOverTime;

var Claw = cocos.nodes.Sprite.extend({
    actions: {},
    badItems: [],
    
    init: function() {
        Claw.superclass.init.call(this, {file: '/resources/Claw.png'});
        this.set('zOrder', -2)
        
        this.loadAnimation('close',   '/resources/Claw_Close/Close00',              8, 347, 486, 0.125/8.0);
        this.loadAnimation('grab',    '/resources/Claw_Grab/Grab00',               43, 347, 486, 0.500/43.0);
        this.loadAnimation('left',    '/resources/Claw_Left/Left00',               22, 347, 486, 0.375/22.0);
        this.loadAnimation('open',    '/resources/Claw_Open/Open00',               11, 347, 486, 0.125/11.0);
        this.loadAnimation('right',   '/resources/Claw_Right/Right00',             21, 347, 486, 0.375/21.0);
        this.loadAnimation('settleL', '/resources/Claw_SettleLeft/SettleLeft00',   15, 347, 486, 0.250/15.0);
        this.loadAnimation('settleR', '/resources/Claw_SettleRight/SettleRight00', 16, 347, 486, 0.250/16.0);
        
        this.badItems.push(cocos.nodes.Sprite.create({file:'/resources/Bad_Boot.png'}));
        this.badItems.push(cocos.nodes.Sprite.create({file:'/resources/Bad_Can.png'}));
        this.badItems.push(cocos.nodes.Sprite.create({file:'/resources/Bad_Fish.png'}));
        this.badItems.push(cocos.nodes.Sprite.create({file:'/resources/Bad_Plastic.png'}));
        this.badItems.push(cocos.nodes.Sprite.create({file:'/resources/Bad_Tire.png'}));
    },
    
    loadAnimation: function(Name, prefix, frames, w, h, d) {
        var animCache = cocos.AnimationCache.get('sharedAnimationCache');
        var frameCache = cocos.SpriteFrameCache.get('sharedSpriteFrameCache');
        
        var anim = [];
        var r = geo.rectMake(0, 0, w, h);
    
        for(var i=1; i<=frames; i++) {
            anim.push(cocos.SpriteFrame.create({texture: Texture2D.create({file: module.dirname + prefix + (i >= 10 ? i : '0' + i) + '.png'}), rect: r}));
        }
        
        var Animation = cocos.Animation.create({frames: anim, delay: d});
        animCache.addAnimation({animation: Animation, name: Name});
        this.actions[Name] = cocos.actions.Animate.create({animation: Animation, restoreOriginalFrame: false});
    },
    
    grabAt: function(x) {
        var dx = x - this.get('position').x;
        
        this.playAnimation('right');
        MOT.create(this.get('position').x, dx, 0.5).bindFunc(this, this.setX);
        
        var that = this;
        this.item = this.badItems[0];
        this.item.set('position', new geo.Point(0, -375));
        this.addChild(this.item);
        
        setTimeout(function() { that.playAnimation('settleR'); }, 500);
        setTimeout(function() { that.playAnimation('open'); }, 900);
        setTimeout(function() { that.playAnimation('grab'); }, 1050);
        setTimeout(function() { MOT.create(-375, 150, 0.23).bindFunc(that, that.setItemX); }, 1320);
        setTimeout(function() { that.playAnimation('left'); 
            MOT.create(that.get('position').x, -1 * dx, 0.5).bindFunc(that, that.setX); }, 1600);
        setTimeout(function() { that.playAnimation('settleL'); }, 2100);
        setTimeout(function() { that.playAnimation('open');
            MOT.create(-225, -150, 0.25).bindFunc(that, that.setItemX); }, 2500);
        setTimeout(function() { that.playAnimation('close');
            that.removeChild({child: that.item}); }, 2700);
    },
    
    setX: function(x) {
        var pt = this.get('position');
        pt.x = x;
        this.set('position', pt);
    },
    
    setItemY: function(x) {
        var pt = this.item.get('position');
        pt.y = y;
        this.set('position', pt);
    },
    
    playAnimation: function(Name) {
        if(this.actions[Name]) {
            this.runAction(this.actions[Name]);
        }
    }
});

exports.Claw = Claw;