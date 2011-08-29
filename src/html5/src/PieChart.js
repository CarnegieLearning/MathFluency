var cocos = require('cocos2d');
var geom = require('geometry');
var util = require('util');

// Draws a pie chart
var PieChart = cocos.nodes.Node.extend({
    numSections:null,   // Total number of pie slices
    numFilled:null,     // Number of filled pie slices
    bgColor:null,       // Color of the background
    lineColor:null,     // Color of the lines used to outlijne and mark each section
    fillColor:null,     // Color of the filled in sections
    radius:null,        // Size of the chart
    init: function(opts) {
        PieChart.superclass.init.call(this);
        
        // Default values
        this.set('numSections', 2);
        this.set('numFilled', 1);
        this.set('bgColor', "#FFFFFF");
        this.set('lineColor', "#000000");
        this.set('fillColor', "#A0A0A0");
        this.set('radius', 10);
        
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
PieChart.helper = function(sections, filled, bgColor, lineColor, fillColor, radius) {
    opts = Object();
    opts['numSections'] = sections;
    opts['numFilled'] = filled;
    opts['bgColor'] = bgColor;
    opts['lineColor'] = lineColor;
    opts['fillColor'] = fillColor;
    opts['radius'] = radius;
    
    return opts
}

exports.PieChart = PieChart