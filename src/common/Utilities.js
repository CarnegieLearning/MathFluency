exports.extend = function extend(constructor, parent)
{
    constructor.prototype = new parent();
    constructor.superConstructor = parent;
}

exports.findInArray = function findInArray(array, item, key)
{
    for (var i = 0; i < array.length; i++)
    {
        if (array[i][key] == item) return array[i];
    }
    return undefined;
};
