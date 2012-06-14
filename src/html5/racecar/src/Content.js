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
}

Content._validateNode = function (xmlNode) {
    if(xmlNode.attributes.hasOwnProperty('TYPE')) {
        if(Content.registeredContent.hasOwnProperty(xmlNode.attributes.TYPE)) {
            return true;
        }
    }
    return false;
}

// Build Content subclass from parsed XML
Content.buildFrom = function(xmlNode) {
    if(Content._validateNode(xmlNode)) {
        var cs = XML.getChildByName(xmlNode, 'ContentSettings');
        if(cs) {
            return new Content.registeredContent[xmlNode.attributes.TYPE](cs.attributes);
        }
    }
    
    return null;
}

module.exports = Content;