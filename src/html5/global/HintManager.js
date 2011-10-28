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

var HintManager = BObject.extend({
	active: null,
	cooldown: 20,
	countdown: 20,
    hints: new Array(),
	
	init: function () {
        HintManager.superclass.init.call(this);
    },
	addHint: function (name, hint) {
		this.hints[name] = hint;
	},
	getHint: function (name) {
		return this.hints[name];
	},
	update: function (dt) {
		this.countdown -= dt;
		
		if(this.countdown) {
			this.countdown = this.cooldown;
			
			for (hint in this.hints) {
				if(!hint.triggered && !hint.disabled) {
					this.displayHint(hint);
					break;
				}
			}
		}
	},
	displayHint: function (hint) {
		this.active = hint
		hint.triggered = true;
		
	},
	disableHint: function (name) {
		this.hint[name].disabled = true;
	},
	pause: function () {
		this.pause = true;
	},
	unpause: function () {
		this.pause = false;
	}
});

var Hint = cocos.nodes.Node.extend({
	triggered: false,
	disabled: false,
	init: function(h) {
		Hint.superclass.init.call();
		
		this.addChild({child: h});
	},
});

exports.HintManager = HintManager