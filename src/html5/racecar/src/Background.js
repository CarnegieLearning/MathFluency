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

var PNode = require('PerspectiveNode').PerspectiveNode;

var Background = cocos.nodes.Node.extend({
    init: function(lanes) {
        Background.superclass.init.call(this);
    },
    
    draw: function(context) {
        // Ground
        context.fillStyle = "#44AA22";
        context.fillRect(-10, -10, 820, 620);
        
        // Sky
        context.fillStyle = "#1122BB";
        context.fillRect(-10, -10, 820, PNode.horizonStart + 10);
        
        // Road
        context.fillStyle = "#808080";
        context.beginPath();
        context.moveTo(385,                PNode.horizonStart);
        context.lineTo(PNode.roadOffset,   610);
        context.lineTo(PNode.roadWidthPix, 610);
        context.lineTo(415,                PNode.horizonStart);
        context.closePath();
        context.fill();
        
        // Lanes
        var x = 400 - PNode.roadWidthPix / 9 * 1.5;
        context.fillStyle = "#FFFF00";
        context.lineWidth = 4
        context.beginPath();
        context.moveTo(395,   PNode.horizonStart);
        context.lineTo(x - 4, 610);
        context.lineTo(x + 4, 610);
        context.lineTo(395,   PNode.horizonStart);
        context.closePath();
        context.fill();
        
        x = 400 + PNode.roadWidthPix / 9 * 1.5;
        context.beginPath();
        context.moveTo(405,   PNode.horizonStart);
        context.lineTo(x - 4, 610);
        context.lineTo(x + 4, 610);
        context.lineTo(405,   PNode.horizonStart);
        context.closePath();
        context.fill();
    },
});

exports.Background = Background