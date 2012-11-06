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

var PNode = require('/PerspectiveNode');
var RC = require('/RaceControl');

function Background (lanes) {
    Background.superclass.constructor.call(this);
    
    var dir = '/resources/Background/';
    
    // Sky background
    this.sky = new cocos.nodes.Sprite({file: dir + 'sky.png'});
    this.sky.anchorPoint = new geo.Point(0.5, 0);
    this.sky.position = new geo.Point(450, 0);
    this.addChild({child: this.sky});
    
    // City layer, will move up as race progresses, between sky and pavement
    this.city = new cocos.nodes.Sprite({file: dir + 'city.png'});
    this.city.anchorPoint = new geo.Point(0.5, 1);
    this.city.position = new geo.Point(450, 460);
    this.city.scaleX = 0.36;
    this.city.scaleY = 0.52;
    this.addChild({child: this.city});
    
    // Base pavement layer
    this.pave = new cocos.nodes.Sprite({file: dir + 'pavement.png'});
    this.pave.anchorPoint = new geo.Point(0.5, 0);
    this.pave.position = new geo.Point(450, -41);
    this.addChild({child: this.pave});
    
    // Street for cars
    this.street = new cocos.nodes.Sprite({file: dir + 'street.png'});
    this.street.anchorPoint = new geo.Point(0.5, 0);
    this.street.position = new geo.Point(450, -25);
    this.street.scaleX = 1.2;
    this.addChild({child: this.street});
    
    // Lane Delimiters
    //TODO: 2 (and 4?) lane version
    this.lines = new cocos.nodes.Sprite({file: dir + 'dividingLines3.png'});
    this.lines.anchorPoint = new geo.Point(0.5, 0);
    this.lines.position = new geo.Point(450, 000);
    this.lines.scaleX = 1.2;
    this.addChild({child: this.lines});
}

Background.inherit(cocos.nodes.Node, {
    sky     : null,     // Holds the sky background image
    city    : null,     // Holds the city image
    pave    : null,     // Holds the pavement image
    street  : null,     // Holds the street image
    lines   : null,     // Holds the lane delimiter image

    // Raises sky and city as race progresses
    progress: function(p) {
        this.sky.position.y = 130 * p;
        this.city.position.y = 460 + 130 * p;
        this.city.scaleX = 0.36 + 0.16 * p;
    }
});

module.exports = Background