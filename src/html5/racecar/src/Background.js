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
var geom = require('geometry');

var PNode = require('PerspectiveNode').PerspectiveNode;

var Background = cocos.nodes.Node.extend({
    init: function(lanes) {
        Background.superclass.init.call(this);
        
        this.bg = cocos.nodes.Sprite.create({file: '/resources/snow_bg.png',});
        this.bg.set('anchorPoint', new geom.Point(0, 0));
        this.addChild({child: this.bg});
        
        this.road = cocos.nodes.Sprite.create({file: '/resources/snow_road.png',});
        this.road.set('anchorPoint', new geom.Point(0, 1));
        this.road.set('position', new geom.Point(-20, 600));
        this.road.set('opacity', 160);
        this.addChild({child: this.road});
        
        this._scaleTo(this.bg, 840, 600);
        this._scaleTo(this.road, 800, 540);
    },
    
    _scaleTo: function(s, x, y) {
        var c = s.get('contentSize');
        
        s.set('scaleX', x / c.width);
        s.set('scaleY', y / c.height);
    },    
});

exports.Background = Background