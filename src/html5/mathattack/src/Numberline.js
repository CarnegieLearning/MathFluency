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
var geo = require('geometry');

var Numberline = cocos.nodes.Node.extend({
    content  : null,    // 

    correct  : null,    // 
    incorrect: null,    //  
    
    init: function(xml) {
        Numberline.superclass.init.call(this);
    
        // Displays the blank numberline
        this.line = cocos.nodes.Sprite.create({file: '/resources/empty_line.png'});
        this.line.set('anchorPoint', new geo.Point(0, 0));
        this.line.set('zOrder', 1);
        this.addChild({child: this.line});
        
        this.content = [];
        
        // Displayed content values for each slot on the numberline
        for(var i=0; i<21; i+=1) {
            this.content.push(cocos.nodes.Label.create({string: (i-10 == 0 ? '0' : i-10), fontColor: "#FFF"}));
            this.content[i].set('position', new geo.Point(32.125 + i*35.5, 32));
            this.content[i].set('zOrder', 1);
        }
        
        // Holds background (in)correct colors for the numberline
        this.correct = [];
        this.incorrect = [];
        
        // Special cased left side arrow head
        this.correct.push(cocos.nodes.Sprite.create({file: '/resources/right.png'}));
        this.correct[0].set('position', new geo.Point(49 - 35.5, 32));
        this.correct[0].set('anchorPoint', new geo.Point(0, 0.5));
        this.incorrect.push(cocos.nodes.Sprite.create({file: '/resources/wrong.png'}));
        this.incorrect[0].set('position', new geo.Point(49 - 35.5, 32));
        this.incorrect[0].set('anchorPoint', new geo.Point(0, 0.5));
        
        // Generate background colors along the numberline
        for(var i=1; i<20; i+=1) {
            this.correct.push(cocos.nodes.Sprite.create({file: '/resources/right.png'}));
            this.correct[i].set('position', new geo.Point(49 + (i-1)*35.5, 32));
            this.correct[i].set('anchorPoint', new geo.Point(0, 0.5));
            this.incorrect.push(cocos.nodes.Sprite.create({file: '/resources/wrong.png'}));
            this.incorrect[i].set('position', new geo.Point(49 + (i-1)*35.5, 32));
            this.incorrect[i].set('anchorPoint', new geo.Point(0, 0.5));
        }
        
        // Special cased right side arrow head
        this.correct.push(cocos.nodes.Sprite.create({file: '/resources/right.png'}));
        this.correct[20].set('position', new geo.Point(49 + 19 * 35.5, 32));
        this.correct[20].set('anchorPoint', new geo.Point(0, 0.5));
        this.incorrect.push(cocos.nodes.Sprite.create({file: '/resources/wrong.png'}));
        this.incorrect[20].set('position', new geo.Point(49 + 19 * 35.5, 32));
        this.incorrect[20].set('anchorPoint', new geo.Point(0, 0.5));
    },
    
    // Activate the specified correct icon
    correctSlot: function (i) {
        this.addChild({child: this.correct[i]});
        this.addChild({child: this.content[i]});
    },
    
    // Activate the specified incorrect icon
    incorrectSlot: function (i) {
        this.addChild({child: this.incorrect[i]});
        this.addChild({child: this.content[i]});
    },
    
    // Reset a specific slot on the numberline
    clearSlot: function (i) {
        this.removeChild({child: this.correct[i]});
        this.removeChild({child: this.incorrect[i]});
        this.removeChild({child: this.content[i]});
    },
    
    // Reset the entire numberline
    clearAllSlots: function (i) {
        for(var i=0; i<this.correct.length; i+=1) {
            this.clearSlot(i);
        }
    }
});

exports.Numberline = Numberline;