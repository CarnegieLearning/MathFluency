var XML = BObject.extend({
    init: function() {
        XML.superclass.init.call(this);
    }
});

XML.safeComboGet = function(root, tag, attr) {
    var result = getFirstByTag(root, tag);
    
    if(result != null) {
        return XML.safeGetAttr(result, attr);
    }
    
    return null;
}

XML.getFirstByTag = function(node, tag) {
    var results = root.getElementsByTagName(tag);
    
    if(results.length > 0) {
        return results[0];
    }
    
    return null;
}

XML.safeGetAttr = function(node, name) {
    if(node.hasAttribute(name)) {
        return node.getAttribute(name);
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

exports.XML = XML