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
    numerator   : 1,            // The numerator of the fraction
    denominator : 2,            // The denominator of the fraction
    whole       : null,         // The mixed number component of the fraction
    bgColor     : '#fff',       // Color of the background rectangle
    fontColor   : '#000',       // Color of the numerator and denominator (TODO: Seperate for numerator/denominator?)
    fontSize    : '16',         // Size of the numerator and denominator text
    fontName    : 'Helvetica',  // Font of the numerator and denominator
    lineColor   : '#a22',       // Color of the fraction bar between the numerator and denominator
    init: function(opts) {
        FractionRenderer.superclass.init.call(this);
        
        // Set properties from the option object
        util.each('numerator denominator whole bgColor fontColor seperatorColor fontName fontColor fontSize'.w(), util.callback(this, function (name) {
            if (opts[name]) {
                this.set(name, opts[name]);
            }
        }));
        
        // Create the numerical labels for the numerator and denominator
        var opts = Object();
        opts["string"] = this.get("numerator");
        opts["fontName"] = this.get("fontName");
        opts["fontColor"] = this.get("fontColor");
        opts["fontSize"] = this.get("fontSize");
        
        var n = cocos.nodes.Label.create(opts);
        n.bindTo('opacity', this, 'opacity');
        this.addChild({child: n});
        
        opts["string"] = this.get("denominator");
        var d = cocos.nodes.Label.create(opts);
        d.bindTo('opacity', this, 'opacity');
        this.addChild({child: d});
        
        // Figuring out combined content size
        var v = n.get('contentSize').height / 2 + d.get('contentSize').height / 2 + 36;
        var h = Math.max(n.get('contentSize').width, d.get('contentSize').width) + 10;
        
        // Regular fraction defaults
        if(this.get('whole') == null) {
            n.set('position', new geom.Point(0, -15));
            d.set('position', new geom.Point(0, 15));
            
            this.set('contentSize', new geom.Size(h, v));
        }
        // Account for the inclusion of a mixed number
        else {
            opts["string"] = this.get("whole");
            opts["fontSize"] *= 2;
            var w = cocos.nodes.Label.create(opts);
            w.bindTo('opacity', this, 'opacity');
            this.addChild({child: w});
            
            n.set('anchor-point', new geom.Point(1, 0.5));
            n.set('position', new geom.Point(h / 2 - 2, -15));
            d.set('anchor-point', new geom.Point(1, 0.5));
            d.set('position', new geom.Point(h / 2 - 2, 15));
            
            w.set('anchor-point', new geom.Point(0, 0.5));
            w.set('position', new geom.Point(h / -2 + 2, 0));
            
            h += w.get('contentSize').width;
            
            this.set('contentSize', new geom.Size(h, v));
        }
    },
    
    // Draw the background and the horizontal fraction bar
    draw: function(context) {
        var size = this.get('contentSize');
    
        context.fillStyle = this.get('bgColor');
        context.beginPath();
        context.moveTo(size.width /  2, size.height /  2);
        context.lineTo(size.width /  2, size.height / -2);
        context.lineTo(size.width / -2, size.height / -2);
        context.lineTo(size.width / -2, size.height /  2);
        context.closePath();
        context.fill();
        
        context.strokeStyle = this.get('lineColor');
        context.beginPath();
        if(this.get('whole') == null) {
            context.moveTo(size.width / -4, 0);
            context.lineTo(size.width /  4, 0);
        }
        // Account for offset due to mixed number presence
        else {
            context.moveTo(2                 , 0);
            context.lineTo(size.width / 2 - 2, 0);
        }
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
    var w = XML.safeComboGet(node, 'Whole', 'VALUE');
    var bg = XML.safeComboGet(node, 'BackgroundColor', 'VALUE');
    var lc = XML.safeComboGet(node, 'LineColor', 'VALUE');
    var f = XML.parseFont(XML.getFirstByTag(node, 'FontSettings'));
    
    var opts = {}
    opts['numerator']   = n   == null ? 2       : n;
    opts['denominator'] = d   == null ? 1       : d;
    opts['whole']       = w   == null ? null    : w;
    opts['bgColor']     = bg  == null ? '#fff'  : bg;
    opts['lineColor']   = lc  == null ? '#000'  : lc;
    
    opts['fontName']    = f.font       == null ? 'Helvetica' : f.font;
    opts['fontColor']   = f.fontColor  == null ? '#000'      : f.fontColor;
    opts['fontSize']    = f.fontSize   == null ? '16'        : f.fontSize;
    
    return opts;
}

exports.FractionRenderer = FractionRenderer