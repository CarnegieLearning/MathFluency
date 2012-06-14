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

var PNode = require('/PerspectiveNode');

function PerspectiveNodeAnim (opts) {
    PerspectiveNodeAnim.superclass.constructor.call(this, opts);
}

PerspectiveNodeAnim.inherit(PNode, {
    prepareAnimation: function (act) {
        this.act = act;
        
        events.addListener(this.act, 'actionComplete', this.runAnimation.bind(this));
    },
    
    runAnimation: function() {
        this.content.runAction(this.act);
    },
    
    onEnter: function() {
        this.runAnimation();
        
        PerspectiveNodeAnim.superclass.onEnter.call(this);
    },
});

module.exports = PerspectiveNodeAnim