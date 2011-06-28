/*
    Class: PlayerState
    
    Represents the current player's state.
*/
var PlayerState = exports.PlayerState = function PlayerState(id)
{
    this.id = id;
    this.nickname = id;
    this.loginDate = new Date();
}

var stateKeys = ['id', 'nickname', 'loginDate', 'stageID', 'questionSetID', 'questionSubsetID', 'questionID'];

PlayerState.prototype.updateWithJSON = function (json)
{
    for (var i in stateKeys)
    {
        var key = stateKeys[i];
        if (key in json) this[key] = json[key];
    }
};

PlayerState.prototype.toJSON = function ()
{
    var json = {};
    for (var i in stateKeys)
    {
        var key = stateKeys[i];
        json[key] = this[key];
    }
    return json;
};
