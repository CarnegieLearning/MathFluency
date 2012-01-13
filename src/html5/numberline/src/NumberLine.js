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

// Cocos2d imports
var cocos = require('cocos2d');
var geo = require('geometry');

// Static Imports
var Content = require('Content').Content;
var XML = require('XML').XML;

// Project Imports
var Hashmarks = require('Hashmarks').Hashmarks;

// Visually represents the number line
var NumberLine = cocos.nodes.Node.extend({
	hashes		: null,		    // Percentage based locations of hash marks
	contents	: null,		    // Holds Content under hash marks
    length      : 600,          // Length, in pixels, of this numberline
    lineColor   : '#FFFFFF',    // Color of the number line
    
	init: function (node) {
        NumberLine.superclass.init.call(this);
        
        this.hashes = [];
        this.contents = [];
        
        this.set('zOrder', -2);
        
        var ha = XML.getChildrenByName(node, 'HASH');
        for(var i=0; i<ha.length; i+=1) {
            if(ha[i].children.length > 0) {
                this.hashes.push(Hashmarks.create(ha[i].attributes['location'], Content.buildFrom(ha[i].children[0])));
            }
            else {
                this.hashes.push(Hashmarks.create(ha[i].attributes['location'], null));
            }
            
            this.hashes[i].set('position', new geo.Point(this.length * this.hashes[i].location, 0));
            
            this.addChild({child: this.hashes[i]});
        }
	},
    
	draw: function (context) {
		// Draw the number line
		context.strokeStyle = this.lineColor;
		context.lineWidth = 6;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(this.length, 0);
        context.stroke();
	},
});

exports.NumberLine = NumberLine;