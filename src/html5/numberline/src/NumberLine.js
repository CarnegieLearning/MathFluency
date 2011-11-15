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

var cocos = require('cocos');
var geo = require('geometry');

// Visually represents the number line
var NumberLine = cocos.nodes.Node.extend({
	hashes		: [],		// Percentage based locations of hash marks
	contents	: [],		// Holds Content under hash marks
	init: function (hashes, values) {
		this.hashes = hashes;
        this.set('z-order', 0);
        
        for(var i=0; i<this.hashes.length; i+=1) {
            this.hashes[i].set('position', new geo.Point(this.hashes[i].location * 500, 0));
            this.addChild({child: this.hashes[i]});
        }
		
		// Set up the end point content
		var temp;
		for(var i=0; i<values.length; i+=1) {
			if(values[i] != null) {
				temp.set('anchorPoint', new geo.Point(0.5, 0));
				temp.set('position', new geo.Point(-300 + 600 * hashes[i], -30));
				this.addChild(temp);
				
				this.contents.push(temp);
			}
		}
	},
    
	draw: function () {
		// Draw the number line
		context.strokeStyle = this.get('lineColor');
		context.lineWidth = 6;
        context.beginPath();
        context.moveTo(-320, 0);
        context.lineTo(320, 0);
        context.closePath();
        context.stroke();
	},
});

exports.NumberLine = NumberLine;