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

var Player = cocos.nodes.Node.extend({
    row     : -1,   // Current row position
    col     : -1,   // Current col position
    
    startR  : 0,    // Starting row position for the level
    startC  : 0,    // Starting col position for the level
    
    init: function() {
        Player.superclass.init.call(this);
    
        this.sprite = cocos.nodes.Sprite.create({file: '/resources/hero.png'});
        this.addChild({child: this.sprite});
    },
    
    // Moves the player to the specified coordinates
    teleport: function(r, c) {
        this.row = r;
        this.col = c;
        
        this.set('position', new geo.Point(c * 50 + 25, r * 50 + 25));
    },
    
    // Resets the player to the start of the level
    reset: function() {
        this.teleport(this.startR, this.startC);
    }
});

exports.Player = Player;