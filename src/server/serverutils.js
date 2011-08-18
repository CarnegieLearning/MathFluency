"use strict";

var path = require('path');

exports.resolveRelativePath = function resolveRelativePath(p, basePath)
{
    if (p[0] == '/') return p;
    
    return path.join(basePath, p);
};
