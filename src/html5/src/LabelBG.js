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

var XML = require('XML').XML;

var LabelBG = cocos.nodes.Node.extend({
    label  : null,      //The label that the class wraps
    bgColor: '#FFFFFF', //The color of the background that will be behind the label
    init: function(opts) {
        // You must always call the super class version of init
        LabelBG.superclass.init.call(this, opts);
        
        var label = cocos.nodes.Label.create(opts)
        label.bindTo('opacity', this, 'opacity');
        this.set('label', label);
        this.addChild({child: label});
        
        if(opts.hasOwnProperty('bgColor')) {
            this.set('bgColor', opts['bgColor']);
        }

        this.set('contentSize', this.get('label').get('contentSize'));
    },
    // Draws the background for the label
    draw: function(context) {
        var size = this.get('contentSize');
        
        context.fillStyle = this.get('bgColor');
        context.fillRect(size.width * -0.6, size.height * -0.75, size.width * 1.2, size.height * 1.5);
    },
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

// Static XML parser to build options from a <CONTENT_SETTINGS> node
LabelBG.helperXML = function (node) {
    var str = XML.safeComboGet(node, 'String', 'VALUE');
    var bg = XML.safeComboGet(node, 'BackgroundColor', 'VALUE');
    var f = XML.parseFont(XML.getFirstByTag(node, 'FontSettings'));
    
    var opts = {}
    opts['string']      = str          == null ? ''          : str;
    opts['bgColor']     = bg           == null ? '#fff'      : bg;
    opts['fontName' ]   = f.font       == null ? 'Helvetica' : f.font;
    opts['fontColor']   = f.fontColor  == null ? '#000'      : f.fontColor;
    opts['fontSize']    = f.fontSize   == null ? '16'        : f.fontSize;
    
    return opts;
}

exports.LabelBG = LabelBG