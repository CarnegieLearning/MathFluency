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
var events = require('events');

function ImageContent (opts) {
    ImageContent.superclass.constructor.call(this, opts);
    
    //Set properties from the option object
    var i = -1;
    while(++i < ImageContent.params.length) {
        if (opts[ImageContent.params[i]]) {
            this[ImageContent.params[i]] = opts[ImageContent.params[i]];
        }
    }
    
    this.uid = ImageContent.getUID();
    
    this.load();
}

ImageContent.inherit(cocos.nodes.Node, {
    uid     : null,
    scaleX  : null,
    scaleY  : null,
    src     : null,
    isLoaded: false,
    
    load: function() {
        var img = new Image()
        __jah__.resources[this.uid] = {url: this.src, path: this.uid};
        __jah__.resources[this.uid].data = img;
        ImageContent.toLoad++;
        
        img.onload = function () {
            ImageContent.toLoad--;
            __jah__.resources[this.uid].loaded = true;
            this.isLoaded = true;
            events.trigger(this, 'ImageLoaded');
            
            this.addChild({child: new cocos.nodes.Sprite({file: this.uid})});
        }.bind(this)
        
        img.onerror = function () {
            throw new Error('Failed to load resource: ' + this.uid + ' from ' + this.src);
        }.bind(this)
        
        img.src = this.src;
    }
});

ImageContent.params = ['scaleX','scaleY','src'];
ImageContent.idNum = 1;
ImageContent.toLoad = 0;

ImageContent.getUID = function() {
    return '/resources/__ImageContent_' + (++ImageContent.idNum);
}

module.exports = ImageContent