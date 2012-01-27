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

// Since children do not play nice with animations...
var ClawNode = cocos.nodes.Node.extend({
    theClaw     : null,     // THE CLAW!!!!
    theItem     : null,     // The current item of interest
    
    items       : null,     // Stores lists of all available items, sorted by bamd
    
    badItems    : null,     // List of band 2 items
    goodItems   : null,     // List of band 1 items
    greatItems  : null,     // List of band 0 items
    
    init: function() {
        ClawNode.superclass.init.call(this);
        
        this.theClaw = Claw.create();
        this.addChild(this.theClaw);
        
        // Load bad items
        this.badItems = [];
        dir = '/resources/Toys/Bad/Bad_';
        this.badItems.push(cocos.nodes.Sprite.create({file: dir + 'Boot.png'}));
        this.badItems.push(cocos.nodes.Sprite.create({file: dir + 'Can.png'}));
        this.badItems.push(cocos.nodes.Sprite.create({file: dir + 'Fish.png'}));
        this.badItems.push(cocos.nodes.Sprite.create({file: dir + 'Plastic.png'}));
        this.badItems.push(cocos.nodes.Sprite.create({file: dir + 'Tire.png'}));
        
        // Load good items
        this.goodItems = [];
        dir = '/resources/Toys/Good/Good_';
        this.goodItems.push(cocos.nodes.Sprite.create({file: dir + 'Candy.png'}));
        this.goodItems.push(cocos.nodes.Sprite.create({file: dir + 'Car.png'}));
        this.goodItems.push(cocos.nodes.Sprite.create({file: dir + 'Icecream.png'}));
        this.goodItems.push(cocos.nodes.Sprite.create({file: dir + 'Sunglasses.png'}));
        
        // Load great items
        this.greatItems = [];
        dir = '/resources/Toys/Great/Great_';
        this.greatItems.push(cocos.nodes.Sprite.create({file: dir + 'Alien.png'}));
        this.greatItems.push(cocos.nodes.Sprite.create({file: dir + 'Bear.png'}));
        this.greatItems.push(cocos.nodes.Sprite.create({file: dir + 'Money.png'}));
        this.greatItems.push(cocos.nodes.Sprite.create({file: dir + 'Suit.png'}));
        
        this.items = [this.greatItems, this.goodItems, this.badItems];
    },
    
    // Performs the full cycle of moving, grabbing, returning, dropping and resetting
    grabAt: function(x, grade) {
        var dx = x - this.get('position').x;
        
        this.theClaw.playAnimation('right');
        MOT.create(this.get('position').x, dx, 0.5).bindFunc(this, this.setX);
        
        var that = this;
        this.theItem = this.items[grade][Math.floor(Math.random()*this.items[grade].length)];
        this.theItem.set('position', new geo.Point(0, 375));
        this.theItem.set('scaleX', 0.5);
        this.theItem.set('scaleY', 0.5);
        this.theItem.set('zOrder', -1);
        this.addChild(this.theItem);
        
        setTimeout(function() { that.theClaw.playAnimation('settleR'); }, 500);
        setTimeout(function() { that.theClaw.playAnimation('open'); }, 900);
        setTimeout(function() { that.theClaw.playAnimation('grab'); }, 1050);
        setTimeout(function() { MOT.create(375, -150, 0.23).bindFunc(that, that.setItemY); }, 1320);
        setTimeout(function() { that.theClaw.playAnimation('left'); 
            MOT.create(that.get('position').x, -1 * dx, 0.5).bindFunc(that, that.setX); }, 1600);
        setTimeout(function() { that.theClaw.playAnimation('settleL'); }, 2100);
        setTimeout(function() { that.theClaw.playAnimation('open');
            MOT.create(225, 150, 0.25).bindFunc(that, that.setItemY);
            that.set('position', new geo.Point(100, 160)); }, 2500);
        setTimeout(function() { that.theClaw.playAnimation('close');
            that.removeChild({child: that.theItem}); }, 2700);
    },
    
    // Accessor for MOT
    setX: function(x) {
        var pt = this.get('position');
        pt.x = x;
        this.set('position', pt);
    },
    
    // Accessor for MOT
    setItemY: function(y) {
        var pt = this.theItem.get('position');
        pt.y = y;
        console.log(y)
        this.theItem.set('position', pt);
    }
});

var Claw = cocos.nodes.Sprite.extend({
    actions: {},
    
    init: function() {
        Claw.superclass.init.call(this, {file: '/resources/Claw.png'});
        
        this.set('anchorPoint', new geo.Point(0.5, 0));
        
        // Load animations
        var dir = '/resources/Claw_Animation/Claw_';
        this.loadAnimation('close',   dir + 'Close/Close00',              8, 347, 486, 0.125/8.0);
        this.loadAnimation('grab',    dir + 'Grab/Grab00',               43, 347, 486, 0.500/43.0);
        this.loadAnimation('left',    dir + 'Left/Left00',               22, 347, 486, 0.375/22.0);
        this.loadAnimation('open',    dir + 'Open/Open00',               11, 347, 486, 0.125/11.0);
        this.loadAnimation('right',   dir + 'Right/Right00',             21, 347, 486, 0.375/21.0);
        this.loadAnimation('settleL', dir + 'SettleLeft/SettleLeft00',   15, 347, 486, 0.250/15.0);
        this.loadAnimation('settleR', dir + 'SettleRight/SettleRight00', 16, 347, 486, 0.250/16.0);
    },
    
    // Load an animation
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
    
    // Plays the specified animation, if it exists
    playAnimation: function(Name) {
        if(this.actions[Name]) {
            this.runAction(this.actions[Name]);
        }
    }
});

exports.Claw = Claw;
exports.ClawNode = ClawNode;