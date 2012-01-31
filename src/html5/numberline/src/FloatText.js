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

var MOT = require('ModifyOverTime').ModifyOverTime;

var FloatText = cocos.nodes.Node.extend({
    init: function() {
        FloatText.superclass.init.call(this);
        
        var dir = '/resources/Text_WhiteBackground/';
        
        this.text = [];
        this.text.push([]);
        this.text[0].push(this.load(dir + 'Awesome.png'));
        this.text[0].push(this.load(dir + 'Excellent.png'));
        this.text[0].push(this.load(dir + 'Perfect.png'));
        this.text[0].push(this.load(dir + 'Yougotit.png'));
        
        this.text.push([]);
        this.text[1].push(this.load(dir + 'Almost.png'));
        this.text[1].push(this.load(dir + 'Notbad.png'));
        this.text[1].push(this.load(dir + 'Oohsoclose.png'));
        
        this.text.push([]);
        this.text[2].push(this.load(dir + 'Tryagain.png'));
        this.text[2].push(this.load(dir + 'Whoops.png'));
    },
    
    load: function(path) {
        var l = cocos.nodes.Sprite.create({file: path});
        l.set('anchorPoint', new geo.Point(0.5, 0.5));
        return l;
    },
    
    display: function(g) {
        // Select appropriate text at random and prepare it
        this.theText = this.text[g][Math.floor(Math.random()*this.text[g].length)];
        this.theText.set('opacity', 0);
        
        this.addChild({child: this.theText});
        MOT.create(0, 255, 0.4).bind(this.theText, 'opacity');
        
        var that = this;
        setTimeout(function() {MOT.create(255, -255, 0.3).bind(that.theText, 'opacity'); }, 1200);
    }
});

exports.FloatText = FloatText;