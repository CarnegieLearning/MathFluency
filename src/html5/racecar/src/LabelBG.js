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

function LabelBG (opts) {
    // You must always call the super class version of init
    LabelBG.superclass.constructor.call(this, opts);
    
    this.strRep = opts['string'];
    opts['string']    = this.defaulter(opts, 'string',    '');
    opts['fontName']  = this.defaulter(opts, 'fontName',  'Helvetica');
    opts['fontColor'] = this.defaulter(opts, 'fontColor', '#000');
    opts['fontSize']  = this.defaulter(opts, 'fontSize',  '16');
    
    this.bgShow = true;
    if(opts.hasOwnProperty('bgShow')) {
        if(!opts['bgShow'] || opts['bgShow'] == "false") {
            this.bgShow = false;
        }
    }
    
    var label = new cocos.nodes.Label(opts)
    this.label = label;
    this.addChild({child: label});
    
    this.bgColor = this.defaulter(opts, 'bgColor', '#FFFFFF');

    this.contentSize = this.label.contentSize;
}
    
    
LabelBG.inherit(cocos.nodes.Node, {
    label  : null,      //The label that the class wraps
    bgColor: '#FFFFFF', //The color of the background that will be behind the label
    
    strRep : '',        // String representation of content
    
    // Draws the background for the label
    draw: function(context) {
        if(this.bgShow) {
            var size = this.contentSize;
            
            context.fillStyle = this.bgColor;
            context.fillRect(size.width * -0.6, size.height * -0.75, size.width * 1.2, size.height * 1.5);
        }
    },
    
    //TODO: Put into a utility script/class
    defaulter: function(obj, prop, def) {
        return obj.hasOwnProperty(prop) ? obj[prop] : def;
    },
    
    // With bindTo depreciated, a setter is needed to control multiple objects' opacity
    set opacityLink (val) {
        this.opacity = val;
        this.label.opacity = val;
    },
    
    get opacityLink () {
        return this.opacity;
    }
});

// Static helper function to build the creation options object
LabelBG.helper = function(String, FontColor, BgColor, FontSize, FontName) {
    return {
        string      : String,
        fontColor   : FontColor,
        bgColor     : BgColor,
        fontSize    : FontSize,
        fontName    : FontName
    };
}

LabelBG.identifier = 'String';

module.exports = LabelBG