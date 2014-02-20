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

var SceneryManager = function(arr) {
    SceneryManager.superclass.constructor.call(this);
    
    this.objects = arr;
    this.end = 0;
};

SceneryManager.inherit(cocos.nodes.Node, {
    objects : null,     // Ordered list (by zCoord) of scenery
    start   : 0,        // 
    end     : -1,       // 
    
    update: function(dt) {
        for(var i=this.start; i<this.objects.length && i<=this.end; i+=1) {
            var ret = this.objects[i].update(dt);
            
            if(ret == -1) {
                this.start += 1;
                this.removeChild({child: this.objects[i]});
            }
            else if(ret == 1) {
                this.end += 1;
                this.addChild({child: this.objects[i]});
            }
        }
    }
});

module.exports = SceneryManager;