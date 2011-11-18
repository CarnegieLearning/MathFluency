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

var Hashmarks = cocos.nodes.Node.extend({
    location: 0,        // Percentage based location on the numberline
    content : null,     // Content label for the hashmark
    init: function(loc, cnt) {
        Hashmarks.superclass.init.call(this);
        
        this.location = loc;
        this.set('zOrder', -1);
        
        // Add content if the hashmark is labeled
        if(cnt) {
            this.content = cnt;
            this.content.set('anchorPoint', new geo.Point(0 , 0));
            this.content.set('position', new geo.Point(0, 30));
            this.addChild({child: this.content});
        }
    },
    
    draw: function (ctx) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = '4';
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(0,  15);
        ctx.closePath();
        ctx.stroke();
    }
});

exports.Hashmarks = Hashmarks

Hashmarks.arrayCreate = function (locA, cntA) {
    var array = [];
    
    for(var i=0; i<locA.length; i+=1) {
        array.push(Hashmarks.create(locA[i], cntA[i]));
    }
    
    return array;
}