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

var SpriteNumber = cocos.nodes.Node.extend({
    digits  : null,
    display : null,

    magnitude : 100,
    
    init: function(d) {
        SpriteNumber.superclass.init.call(this);
        
        this.digits = [];
        this.display = [];
        
        this.magnitude = Math.pow(10, d-1);
        
        var temp = null;
        var dir = '/resources/General_Wireframe/Numbers_Red/NumR_';
        for(var i=0; i<d; i+=1) {
            this.digits.push(0);

            this.display.push([]);
            for(var j=0; j<10; j+=1) {
                temp = cocos.nodes.Sprite.create({file: dir + j + '.png'});
                temp.set('position', new geo.Point(30 * i, 0));
                temp.set('anchorPoint', new geo.Point(0, 0));
                this.display[i].push(temp);
            }
            
            this.addChild({child: this.display[i][0]});
        }
    },
    
    setVal: function(num) {
        //HACK: to defend against negatives for now
        if(num < 0)
            return;
    
        var m = this.magnitude;
        
        for(var p=0; p < this.digits.length; p+=1) {
            var val = Math.floor(num / m);
            num = num % m;

            this.removeChild({child: this.display[p][this.digits[p]]});
            this.digits[p] = val;
            this.addChild({child: this.display[p][this.digits[p]]});
            
            m /= 10;
        }
    }
});

exports.SpriteNumber = SpriteNumber;