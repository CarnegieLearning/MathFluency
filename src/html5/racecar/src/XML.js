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

// Combines getFirstByTag with safeGetAttr for when you need one value from a certain tag
XML.safeComboGet = function(root, tag, attr) {
    var result = XML.getFirstByTag(root, tag);
    
    if(result != null) {
        return XML.safeGetAttr(result, attr);
    }
    
    return null;
}

// Safely gets the first instance of a tag starting from the specified node, otherwise returns null
XML.getFirstByTag = function(root, tag) {
    if(root) {
        if(root.getElementsByTagName) {
            var results = root.getElementsByTagName(tag);
            
            if(results.length > 0) {
                return results[0];
            }
        }
    }
    
    return null;
}

// Safely gets an attribute from a node if possible, otherwise returns null
XML.safeGetAttr = function(node, name) {
    if(node) {
        if(node.hasAttribute) {
            if(node.hasAttribute(name)) {
                if(node.getAttribute) {
                    return node.getAttribute(name);
                }
            }
        }
    }
    return null;
}

// TODO: Switch over to {} and identify medals by material (current implementation is FT1 specific)
XML.parseMedals = function (root) {
    var mRoot = root.getElementsByTagName('MEDALS')[0];
    var medal = mRoot.firstElementChild;
    
    var ret = []
    
    while(medal != null) {
        var id = XML.safeGetAttr(medal, 'Id');
        var val = XML.safeGetAttr(medal, 'MEDAL_THRESHOLD');
        
        if(id != null && val != null) {
            if(val > 1000) {
                val /= 1000;
            }
            
            ret[id] = val;
        }
        
        medal = medal.nextElementSibling;
    }
    
    return ret;
}

// Parse font information from a node
XML.parseFont = function (node) {
    var f = XML.safeComboGet(node, 'Font', 'VALUE');
    var fc = XML.safeComboGet(node, 'FontColor', 'VALUE');
    var fs = XML.safeComboGet(node, 'FontSize', 'VALUE');
    
    return {font:f, fontColor:fc, fontSize:fs};
}

exports.XML = XML