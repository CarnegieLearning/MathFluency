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

var PNode = require('PerspectiveNode').PerspectiveNode;
var RC = require('RaceControl').RaceControl;

var Background = cocos.nodes.Node.extend({
    sky     : null,     // Holds the sky background image
    city    : null,     // Holds the city image
    pave    : null,     // Holds the pavement image
    street  : null,     // Holds the street image
    lines   : null,     // Holds the lane delimiter image

    init: function(lanes) {
        Background.superclass.init.call(this);
        
        var dir = '/resources/Background/';
        
        // Sky background
        this.sky = cocos.nodes.Sprite.create({file: dir + 'sky.png'});
        this.sky.set('anchorPoint', new geo.Point(0.5, 0));
        this.sky.set('position', new geo.Point(450, 0));
        this.addChild({child: this.sky});
        
        // City layer, will move up as race progresses, between sky and pavement
        this.city = cocos.nodes.Sprite.create({file: dir + 'city.png'});
        this.city.set('anchorPoint', new geo.Point(0.5, 0));
        this.city.set('position', new geo.Point(450, 140));
        this.city.set('scaleX', 0.52);
        this.city.set('scaleY', 0.52);
        this.addChild({child: this.city});
        
        // Base pavement layer
        this.pave = cocos.nodes.Sprite.create({file: dir + 'pavement.png'});
        this.pave.set('anchorPoint', new geo.Point(0.5, 1));
        this.pave.set('position', new geo.Point(450, 641));
        this.addChild({child: this.pave});
        
        // Street for cars
        this.street = cocos.nodes.Sprite.create({file: dir + 'street.png'});
        this.street.set('anchorPoint', new geo.Point(0.5, 1));
        this.street.set('position', new geo.Point(450, 625));
        this.addChild({child: this.street});
        
        // Lane Delimiters
        //TODO: 2(/4?) lane version
        this.lines = cocos.nodes.Sprite.create({file: dir + 'dividingLines3.png'});
        this.lines.set('anchorPoint', new geo.Point(0.5, 1));
        this.lines.set('position', new geo.Point(450, 600));
        this.addChild({child: this.lines});
    },
    
    // Raises sky and city as race progresses
    progress: function(p) {
        var pt = this.sky.get('position');
        pt.y = -130 * p;
        this.sky.set('position', pt);
        
        var pt = this.city.get('position');
        pt.y = 140 - 130 * p;
        this.city.set('position', pt);
    }
});

exports.Background = Background