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

// TODO: Subclass this off a Value/Expression class or have it pulled in when needed by such a class
function FractionRenderer (opts) {
    FractionRenderer.superclass.constructor.call(this);
    
    //Set properties from the option object
    var i = -1;
    while(++i < FractionRenderer.params.length) {
        if (opts[FractionRenderer.params[i]]) {
            this[FractionRenderer.params[i]] = opts[FractionRenderer.params[i]];
        }
    }
    
    this.bgShow = true;
    if(opts.hasOwnProperty('bgShow')) {
        if(!opts['bgShow'] || opts['bgShow'] == "false") {
            this.bgShow = false;
        }
    }
    
    // Create the numerical labels for the numerator and denominator
    var opts = Object();
    opts['string'] = this.numerator;
    opts['fontName'] = this.fontName;
    opts['fontColor'] = this.fontColor;
    opts['fontSize'] = this.fontSize;
    
    this.n = new cocos.nodes.Label(opts);
    this.addChild({child: this.n});
    
    opts['string'] = this.denominator;
    this.d = new cocos.nodes.Label(opts);
    this.addChild({child: this.d});
    
    // Figuring out combined content size
    var v = this.n.contentSize.height / 2 + this.d.contentSize.height / 2 + 36;
    var h = Math.max(this.n.contentSize.width, this.d.contentSize.width) + 10;
    
    // Regular fraction defaults
    if(this.whole == null) {
        //TODO: Position based on font size instead of magic number
        this.n.position = new geom.Point(0, 12);
        this.d.position = new geom.Point(0, -12);
        
        this.contentSize = new geom.Size(h, v);
        
        this.strRep = this.numerator + ' / ' + this.denominator;
    }
    // Account for the inclusion of a mixed number
    else {
        opts["string"] = this.whole;
        opts["fontSize"] *= 2;
        
        this.w = new cocos.nodes.Label(opts);
        this.addChild({child: this.w});
        
        this.n.anchorPoint = new geom.Point(1, 0.5);
        this.n.position = new geom.Point(h / 2 + 2, 15);
        
        this.d.anchorPoint = new geom.Point(1, 0.5);
        this.d.position = new geom.Point(h / 2 + 2, -15);
        
        this.w.anchorPoint = new geom.Point(0, 0.5);
        this.w.position = new geom.Point(h / -2 - 2, 0);
        
        h += this.w.contentSize.width;
        
        this.contentSize = new geom.Size(h, v);
        
        this.strRep = this.whole + ' ' + this.numerator + ' / ' + this.denominator;
    }
}

FractionRenderer.inherit(cocos.nodes.Node, {
    numerator   : 1,            // The numerator of the fraction
    denominator : 2,            // The denominator of the fraction
    whole       : null,         // The mixed number component of the fraction
    bgColor     : '#fff',       // Color of the background rectangle
    fontColor   : '#000',       // Color of the numerator and denominator (TODO: Seperate for numerator/denominator?)
    fontSize    : '16',         // Size of the numerator and denominator text
    fontName    : 'Helvetica',  // Font of the numerator and denominator
    lineColor   : '#a22',       // Color of the fraction bar between the numerator and denominator
    
    strRep      : '',           // String representation of content

    // Draw the background and the horizontal fraction bar
    draw: function(context) {
        var size = this.contentSize;
    
        if(this.bgShow) {
            context.fillStyle = this.bgColor;
            context.beginPath();
            context.moveTo(size.width /  2, size.height /  2);
            context.lineTo(size.width /  2, size.height / -2);
            context.lineTo(size.width / -2, size.height / -2);
            context.lineTo(size.width / -2, size.height /  2);
            context.closePath();
            context.fill();
        }
        
        context.strokeStyle = this.lineColor;
        context.beginPath();
        if(this.whole == null) {
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
    
    // With bindTo depreciated, a setter is needed to control multiple objects' opacity
    set opacityLink (val) {
        this.opacity = val;
        this.n.opacity = val;
        this.d.opacity = val;
        
        if(this.w) {
            this.w.opacity = val;
        }
    },
    
    get opacityLink () {
        return this.opacity;
    }
});

FractionRenderer.params = ['numerator','denominator','whole','bgColor','fontColor','seperatorColor','fontName','fontColor','fontSize']

module.exports = FractionRenderer