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
var PieChart = cocos.nodes.Node.extend({
    numSections :2,         // Total number of pie slices
    numFilled   :1,         // Number of filled pie slices
    bgColor     :'#FFFFFF', // Color of the background
    lineColor   :'#000000', // Color of the lines used to outlijne and mark each section
    fillColor   :'#A0A0A0', // Color of the filled in sections
    radius      :10,        // Size of the chart
    init: function(opts) {
        PieChart.superclass.init.call(this);
        
        //Set properties from the option object
        util.each('numSections numFilled bgColor lineColor fillColor radius'.w(), util.callback(this, function (name) {
            if (opts[name]) {
                this.set(name, opts[name]);
            }
        }));
        
        // Explictly set contentSize so it plays nice with formating based on it
        this.set('contentSize', new geom.Size(this.get('radius') * 2.4, this.get('radius') * 2.4));
    },
    
    // Draws the PieChart to the canvas
    draw: function(context) {
        var r = this.get('radius');
        
        // Draw background
        context.fillStyle = this.get('bgColor');
        context.fillRect(r * -1.2, r * -1.2, r * 2.4, r * 2.4);
    
        var step = Math.PI*2 / this.get('numSections');
        var offset = Math.PI * 3 / 2    //This is so we draw with 'up' as our 0
    
        // Draw the filled portion
        context.fillStyle = this.get('fillColor');
        context.beginPath();
        context.arc(0, 0, r, offset, offset + step * this.get('numFilled'));
        context.lineTo(0, 0);
        context.lineTo(0, -1 * r);
        context.closePath();
        context.fill();
    
        // Draw the outline
        context.strokeStyle = this.get('lineColor');
        context.beginPath();
        context.arc(0, 0, r, 0, Math.PI*2);
        context.closePath();
        context.stroke();
        
        // Draw the individual dividers
        for(var i=0; i<this.get('numSections'); i+= 1) {
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(Math.sin(i*step)*r, Math.cos(i*step)*r*-1)
            context.closePath();
            context.stroke();
        }
    },
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

exports.PieChart = PieChart