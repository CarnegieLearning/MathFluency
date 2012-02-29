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
    correct: null,
    incorrect: null,
    
    init: function() {
        Numberline.superclass.init.call(this);
    
        this.line = cocos.nodes.Sprite.create({file: '/resources/empty_line.png'});
        this.line.set('anchorPoint', new geo.Point(0.5, 0));
        this.addChild({child: this.line});
        
        this.correct = [];
        this.incorrect = [];
        for(var i=0; i<19; i+=1) {
            this.correct.push(cocos.nodes.Sprite.create({file: '/resources/right.png'}));
            this.correct[i].set('position', new geo.Point(49 + i*35.6, 15));
            this.correct[i].set('anchorPoint', new geo.Point(0, 0.5));
            this.incorrect.push(cocos.nodes.Sprite.create({file: '/resources/wrong.png'}));
            this.incorrect[i].set('position', new geo.Point(49 + i*35.6, 15));
            this.incorrect[i].set('anchorPoint', new geo.Point(0, 0.5));
        }
    },
    
    correctSlot: function (i) {
        this.addChild({child: this.correct[i]});
    },
    
    incorrectSlot: function (i) {
        this.addChild({child: this.incorrect[i]});
    },
    
    clearSlot: function (i) {
        this.removeChild({child: this.correct[i]});
        this.removeChild({child: this.incorrect[i]});
    },
    
    clearAllSlots: function (i) {
        for(var i=0; i<this.correct.length; i+=1) {
            this.clearSlot(i);
        }
    }
});

exports.Numberline = Numberline;