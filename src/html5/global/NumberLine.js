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

// Visually represents the number line
var NumberLine = cocos.nodes.Node.extend({
	hashes		: [],		//
	endPointL	: null,		//
	endPointR	: null,		//
	init: function (l, r) {
		hashes[0] = 0;
		hashes[1] = 1;
		
		// Set up the end point content
		l.set('anchorPoint', new geo.Point(0.5, 0));
		l.set('position', new geo.Point(-300, -30));
		this.endPointL = l;
		this.addChild(l);
		
		r.set('anchorPoint', new geo.Point(0.5, 0));
		r.set('position', new geo.Point(300, -30));
		this.endPointR = r;
		this.addChild(r);
	},
	draw: function () {
		// Draw the number line
		context.strokeStyle = this.get('lineColor');
		context.lineWidth = 4;
        context.beginPath();
        context.moveTo(-320, 0);
        context.lineTo(320, 0);
        context.closePath();
        context.stroke();
		
		context.lineWidth = 2;
		
		for(var i=0; i<this.hashes.length; i+=1) {
			context.beginPath();
			context.moveTo(-300 + hashes[i] * 600,  5);
			context.lineTo(-300 + hashes[i] * 600, -5);
			context.closePath();
			context.stroke();
		}
	},
});

exports.NumberLine = NumberLine;