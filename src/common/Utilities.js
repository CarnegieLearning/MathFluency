exports.extend = function extend(constructor, parent)
{
    constructor.prototype = new parent();
    constructor.superConstructor = parent;
}
