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

// Draws a pie chart
PieChart = function(opts) {
    PieChart.superclass.constructor.call(this);
    
    //Set properties from the option object
    var i = -1;
    while(++i < PieChart.params.length) {
        if (opts[PieChart.params[i]]) {
            this[PieChart.params[i]] = opts[PieChart.params[i]];
        }
    }
    
    this.bgShow = true;
    if(opts.hasOwnProperty('bgShow')) {
        if(!opts['bgShow'] || opts['bgShow'] == "false") {
            this.bgShow = false;
        }
    }
    
    this.strRep = this.numFilled + ' / ' + this.numSections;
    
    // Explictly set contentSize so it plays nice with formating based on it
    this.contentSize = new geom.Size(this.radius * 2.4, this.radius * 2.4);
}

PieChart.inherit(cocos.nodes.Node, {
    numSections : 2,         // Total number of pie slices
    numFilled   : 1,         // Number of filled pie slices
    bgColor     : '#FFFFFF', // Color of the background
    lineColor   : '#000000', // Color of the lines used to outlijne and mark each section
    fillColor   : '#00A0A0', // Color of the filled in sections
    radius      : 10,        // Size of the chart

    strRep      : '',        // String representation of content
    
    // Draws the PieChart to the canvas
    draw: function(context) {
        var r = this.radius;
        
        // Draw background
        if(this.bgShow) {
            context.fillStyle = this.bgColor;
            context.fillRect(r * -1.2, r * -1.2, r * 2.4, r * 2.4);
        }
    
        var step = Math.PI*2 / this.numSections;
        var offset = Math.PI * 3 / 2    //This is so we draw with 'up' as our 0
    
        // Draw the filled portion
        context.fillStyle = this.fillColor;
        context.beginPath();
        context.arc(0, 0, r, offset, offset + step * this.numFilled);
        context.lineTo(0, 0);
        context.lineTo(0, -1 * r);
        context.closePath();
        context.fill();
    
        // Draw the outline
        context.strokeStyle = this.lineColor;
        context.beginPath();
        context.arc(0, 0, r, 0, Math.PI*2);
        context.closePath();
        context.stroke();
        
        // Draw the individual dividers
        for(var i=0; i<this.numSections; i+= 1) {
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(Math.sin(i*step)*r, Math.cos(i*step)*r*-1)
            context.closePath();
            context.stroke();
        }
    },
    
    // Implemented in PieChart as other types of Content need these to function
    //TODO: Migrate a base version of these functions up to Content?
    set opacityLink (val) {
        this.opacity = val;
    },
    
    get opacityLink () {
        return this.opacity;
    }
});

// Static helper function to build the creation options object
PieChart.helper = function(Sections, Filled, BgColor, LineColor, FillColor, Radius) {
    return {
        numSections : Sections,
        numFilled   : Filled,
        bgColor     : BgColor,
        lineColor   : LineColor,
        fillColor   : FillColor,
        radius      : Radius
    };
}

PieChart.params = ['numSections','numFilled','bgColor','lineColor','fillColor','radius'];

module.exports = PieChart