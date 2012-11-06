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

// Import the cocos2d module
var cocos = require('cocos2d');
var geo = require('geometry');

function LabelFW (opts) {
    // You must always call the super class version of init
    LabelFW.superclass.constructor.call(this, opts);
    
    opts['fontName']  = this.defaulter(opts, 'fontName',  'Helvetica');
    opts['fontColor'] = this.defaulter(opts, 'fontColor', '#FFF');
    opts['fontSize']  = this.defaulter(opts, 'fontSize',  '16');
    
    this.numDigits = this.defaulter(opts, 'numDigits',  4);
    this.offset = this.defaulter(opts, 'offset',  18);
    this.labels = [];
    
    for(var i=0; i<this.numDigits; i+=1) {
        this.labels.push(new cocos.nodes.Label(opts));
        this.labels[i].position = new geo.Point(i * this.offset, 0);
        this.labels[i].anchorPoint = new geo.Point(0.5, 0.5);
        this.addChild({child: this.labels[i]});
    }
}
    
    
LabelFW.inherit(cocos.nodes.Node, {
    label  : null,      //The label that the class wraps
    bgColor: '#FFFFFF', //The color of the background that will be behind the label
    
    strRep : '',        // String representation of content
    
    setStr: function(str) {
        var l = str.length;
        if(l > this.numDigits) {
            return
        }
        
        for(var i = 1; i < l + 1; i += 1) {
            //HACK: Ethnocentric '7' and '9' auto sizing/centering is wrong
            if(this.labels[this.numDigits - i].string != '7' && str[l-i] == '7' ||
               this.labels[this.numDigits - i].string != '9' && str[l-i] == '9') {
                this.labels[this.numDigits - i].position.x += 1
            }
            else if(this.labels[this.numDigits - i].string == '7' && str[l-i] != '7' ||
                    this.labels[this.numDigits - i].string == '9' && str[l-i] != '9') {
                this.labels[this.numDigits - i].position.x -= 1
            }
            //ENDHACK
            
            this.labels[this.numDigits - i].string = str[l-i];
        }
        for(var i = 0; i < this.numDigits; i += 1) {
            this.labels[i]._updateLabelContentSize();
        }
    },
    
    //TODO: Put into a utility script/class
    defaulter: function(obj, prop, def) {
        return obj.hasOwnProperty(prop) ? obj[prop] : def;
    },
    
    // With bindTo depreciated, a setter is needed to control multiple objects' opacity
    //TODO: Switch over to a function, update MOTs to use function
    set opacityLink (val) {
        this.opacity = val;
        this.label.opacity = val;
    },
    
    get opacityLink () {
        return this.opacity;
    }
});

module.exports = LabelFW