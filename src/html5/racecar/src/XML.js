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

// Static class, so nothing much here
var XML = BObject.extend({
    init: function() {
        XML.superclass.init.call(this);
    }
});

// Simple, general XML parser
XML.parser = function(root, ret) {
	var r = {}

    r.name = root.tagName;
    
	// Process attributes
    r.attributes = {}
	for (var i = 0; i < root.attributes.length; i++) {
		var n = root.attributes[i].nodeName;
        
        r.attributes[n] = root.attributes[i].nodeValue;
	}
	
    r.children = [];
    
    // Process children
	for (var i = root.firstElementChild; i != null; i = i.nextElementSibling) {
		r.children.push(XML.parser(i));
	}
	
    // Process tagged value (ex: <TAG>This info here<INNER></INNER>but not here</TAG>
    r.value = null;
    if(root.childNodes) {
        if(root.childNodes.length > 0) {
            r.value = root.childNodes[0].nodeValue;
        }
    }
	
	return r;
}

// Gets the first child of the current node with the specified name
XML.getChildByName = function(root, name) {
    for(var i = 0; i < root.children.length; i++) {
        if(root.children[i].name == name) {
            return root.children[i];
        }
    }
    
    return null;
}

// As getChildByName, but at any depth from the current node
XML.getDeepChildByName = function(root, name) {
    for(var i = 0; i < root.children.length; i++) {
        if(root.children[i].name == name) {
            return root.children[i];
        }
        else {
            var ret = XML.getDeepChildByName(root.children[i], name);
            if(ret != null) {
                return ret;
            }
        }
    }
    
    return null;
}

// Gets an array of all children with the specified name
XML.getChildrenByName = function(root, name) {
    var ret = []
    
    for(var i = 0; i < root.children.length; i++) {
        if(root.children[i].name == name) {
            ret.push(root.children[i]);
        }
    }
    
    return ret;
}

exports.XML = XML