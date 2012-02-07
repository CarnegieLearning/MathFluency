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
var util = require('util');

var XML = require('XML').XML;

// TODO: Subclass this off a Value/Expression class or have it pulled in when needed by such a class
var FractionRenderer = cocos.nodes.Node.extend({
    numerator   : 1,           // The numerator of the fraction
    denominator : 2,            // The denominator of the fraction
    bgColor     : '#fff',       // Color of the background rectangle
    fontColor   : '#000',       // Color of the numerator and denominator (TODO: Seperate for numerator/denominator?)
    fontSize    : '16',         // Size of the numerator and denominator text
    fontName    : 'Helvetica',  // Font of the numerator and denominator
    lineColor   : '#a22',       // Color of the fraction bar between the numerator and denominator
    init: function(opts) {
        FractionRenderer.superclass.init.call(this);
        
        // Set properties from the option object
        util.each('numerator denominator bgColor fontColor seperatorColor fontName fontColor fontSize'.w(), util.callback(this, function (name) {
            if (opts[name]) {
                this.set(name, opts[name]);
            }
        }));
        
        this.bgShow = true;
        if(opts.hasOwnProperty('bgShow')) {
            if(!opts['bgShow'] || opts['bgShow'] == "false") {
                this.bgShow = false;
            }
        }
        
        this.lineWidth = this.get("fontSize") / 8;
        
        var h = 4;
        var w = 4;
        
        // Create the numerical labels for the numerator and denominator
        var opts = Object();
        opts["string"] = this.get("numerator");
        opts["fontName"] = this.get("fontName");
        opts["fontColor"] = this.get("fontColor");
        opts["fontSize"] = this.get("fontSize");
        
        var label = cocos.nodes.Label.create(opts);
        label.set('anchorPoint', new geom.Point(0.5, 1));
        label.bindTo('opacity', this, 'opacity');
        this.addChild({child: label});
        
        h += label.get('contentSize').height;
        w += label.get('contentSize').width;
        
        opts["string"] = this.get("denominator");
        label = cocos.nodes.Label.create(opts);
        label.set('anchorPoint', new geom.Point(0.5, 0));
        label.bindTo('opacity', this, 'opacity');
        this.addChild({child: label});
        
        h += label.get('contentSize').height;
        w += label.get('contentSize').width;
        
        this.set('contentSize', new geom.Size(h, w));
    },
    
    // Draw the background and the horizontal fraction bar
    draw: function(context) {
        var size = this.get('contentSize');
        
        if(this.bgShow) {
            context.fillStyle = this.get('bgColor');
            context.beginPath();
            context.moveTo(size.width /  2, size.height /  2);
            context.lineTo(size.width /  2, size.height / -2);
            context.lineTo(size.width / -2, size.height / -2);
            context.lineTo(size.width / -2, size.height /  2);
            context.closePath();
            context.fill();
        }
            
        context.strokeStyle = this.get('lineColor');
        context.lineWidth = this.lineWidth;
        context.beginPath();
        context.moveTo(size.height /  4, 0);
        context.lineTo(size.height / -4, 0);
        context.closePath();
        context.stroke();
    },
});

// Static helper function to build the creation options object
FractionRenderer.helper = function(n, d, b, t, s) {
    var opts = new Object();
    opts['numerator'] = n;
    opts['denominator'] = d;
    opts['bgColor'] = b;
    opts['fontColor' ] = t;
    opts['lineColor'] = s;
    
    return opts;
}

// Static XML parser to build options from a <CONTENT_SETTINGS> node
FractionRenderer.helperXML = function(node) {
    var n = XML.safeComboGet(node, 'Numerator', 'VALUE');
    var d = XML.safeComboGet(node, 'Denominator', 'VALUE');
    var bg = XML.safeComboGet(node, 'BackgroundColor', 'VALUE');
    var lc = XML.safeComboGet(node, 'LineColor', 'VALUE');
    var f = XML.parseFont(XML.getFirstByTag(node, 'FontSettings'));
    
    var opts = {}
    opts['numerator']   = n   == null ? 2       : n;
    opts['denominator'] = d   == null ? 1       : d;
    opts['bgColor']     = bg  == null ? '#fff'  : bg;
    opts['lineColor']   = lc  == null ? '#000'  : lc;
    
    opts['fontName']    = f.font       == null ? 'Helvetica' : f.font;
    opts['fontColor']   = f.fontColor  == null ? '#000'      : f.fontColor;
    opts['fontSize']    = f.fontSize   == null ? '16'        : f.fontSize;
    
    return opts;
}

exports.FractionRenderer = FractionRenderer