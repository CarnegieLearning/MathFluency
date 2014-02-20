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

var SplashScreen = function(arr) {
    SplashScreen.superclass.constructor.call(this);
    
    this.screens = [];
    var s;
    for(var i=0; i<arr.length; i+=1) {
        s = new cocos.nodes.Sprite({file: arr[i]});
        s.position = new geo.Point(450, 300);
        s.opacity = 0;
        this.screens.push(s);
    }
    
    this.black = new cocos.nodes.Sprite({file: '/resources/black.png'});
    this.black.position = new geo.Point(450, 300);
    this.black.zOrder = -1;
    this.addChild({child: this.black});
}

SplashScreen.inherit(cocos.nodes.Node, {
    screens : null, // An array holding the screens to be displayed in sequental order
    black   : null, // The black, blank background image
    fadeIn  : 1,    // Seconds to fade in a screen
    holdOn  : 2,    // Seconds to hold after fading in
    fadeOut : 1,    // Seconds to fade out a screen
    timer   : 0,    // Tracks elapsed time of the current state
    current : 0,    // Currently displayed screen number
    state   : -1,   // Current state of SplashScreen (0: fade in, 1: hold, 2: fade out, 3: fade to game)
    skipper : 1,    // Time multiplier for skipping, resets on each new splash screen
    
    // Starts the sequence of displaying splash screens
    start: function() {
        if(this.isActive()) {
            console.log('WARNING: Cannot start SplashScreen when already active');
            return;
        }
    
        this.addChild({child: this.screens[0]});
        this.state = 0;
        var that = this;
        setTimeout(function () {
            that.scheduleUpdate();
        }, 250);
    },
    
    isActive: function() {
        return this.state != -1;
    },
    
    // Fast forwards by a portion of one screen
    skip: function() {
        this.skipper = 3;
        
        if(this.state == 0) {
            this.state = 2;
        }
        else if(this.state == 1) {
            this.timer = 0;
            this.state = 2;
        }
        else if(this.state == 2) {
            this.timer = this.fadeOut;
        }
    },
    
    // Cycle through the queued splash screens then fade to the game
    update: function(dt) {
        this.timer += dt * this.skipper;
        
        // Fade in the current screen
        if(this.state == 0) {
            if(this.timer < this.fadeIn) {
                this.skipper = 1;
                this.screens[this.current].opacity = this.timer / this.fadeIn * 255;
            }
            else {
                this.state = 1;
                this.timer = 0;
                
                this.screens[this.current].opacity = 255;
            }
        }
        // Then hold it visible
        if(this.state == 1) {
            if(this.timer > this.holdOn) {
                this.state = 2;
                this.timer = 0;
            }
        }
        // Fade out, if any screens return back to state 0
        if(this.state == 2) {
            if(this.timer < this.fadeOut) {
                this.screens[this.current].opacity = 255 - ((this.timer / this.fadeOut) * 255);
            }
            else {
                this.timer = 0;
                
                this.removeChild({child: this.screens[this.current]});
                this.current += 1;
                if(this.current < this.screens.length) {
                    this.state = 0;
                    this.addChild({child: this.screens[this.current]});
                }
                else {
                    this.state = 3;
                }
            }
        }
        // After all screens, fade out to the game
        if(this.state == 3) {
            if(this.timer > this.fadeOut) {
                events.trigger(this, 'splashScreensCompleted');
                cocos.Scheduler.sharedScheduler.unscheduleUpdateForTarget(this);
                this.state = -1;
            }
            else {
                this.black.opacity = 255 - (this.timer / this.fadeOut) * 255;
            }
        }
    }
});

module.exports = SplashScreen;