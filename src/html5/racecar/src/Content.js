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

// Project Imports
var FractionRenderer = require('/FractionRenderer');
var LabelBG = require('/LabelBG');
var PieChart = require('/PieChart');
var ImageContent = require('/ImageContent');

// Static Imports
var XML = require('/XML');

// Represents a single question to be answered by the player
function Content () {
}

// Holds registered subclasses' creation functions
Content.registeredContent = {};

// Every defined subclass used should be registered, the cls should be the class
Content.registerContent = function(str, cls) {
    Content.registeredContent[str] = cls;
}

Content.initialize = function () {
    Content.registerContent(LabelBG.identifier, LabelBG);
    Content.registerContent('Fraction', FractionRenderer);
    Content.registerContent('PieChart', PieChart);
    Content.registerContent('Image', ImageContent);
}

// Helper function to convert all attributes into a object using attribute names to map values
var mapper = function(xml) {
    var map = {};
    var attributes = xml[0].attributes;
	
    for (a = 0; a < attributes.length; a++) {
        map[attributes[a].name] = attributes[a].value;
    }
	
	return map;
}

// Build Content subclass from parsed XML
Content.buildFrom = function(xmlNode) {
    //if(xmlNode.attributes.hasOwnProperty('TYPE')) {
    if($(xmlNode).attr('TYPE')) {
        var cs = $(xmlNode).children('ContentSettings');
        
		var opts = {}
        if(cs.length > 0) {
            return new Content.registeredContent[$(xmlNode).attr('TYPE')](mapper($(cs)));
        }
        else {
            return new Content.registeredContent[$(xmlNode).attr('TYPE')](mapper($(xmlNode)));
        }
    }
    
    return null;
}

module.exports = Content;