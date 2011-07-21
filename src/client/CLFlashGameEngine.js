exports.CLFlashGameEngine = function CLFlashGameEngine(json)
{
    this.dataPath = json.dataPath;
    this.swfPath = json.swfPath;
    var self = this;
    this.run = function (questionSet, div, callback)
    {
        var props = questionSet.allGameProperties();
        registerDoneCallback(callback);
        $(div).empty().flash({
            src: self.swfPath + '/Shell.swf',
            width: props.width || 974,
            height: props.height || 570,
            flashvars: {
                game_id: questionSet.parent.id + '::' + questionSet.id,
                input_xml: self.dataPath + '/' + props.input,
                asset_name: 'ExternalAsset',
                asset_url: self.swfPath,
                callback: 'CLFLashGameEngineDoneCallback'
            }
        },
        {version: 9});
    };
}

var currentDoneCallback;

function registerDoneCallback(callback)
{
    currentDoneCallback = callback;
}

window.CLFLashGameEngineDoneCallback = function CLFLashGameEngineDoneCallback(xml)
{
    currentDoneCallback(xml);
};
