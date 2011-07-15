exports.CLFlashGameEngine = function CLFlashGameEngine(json)
{
    this.baseURL = json.baseURL;
    this.swfPath = json.swfPath;
    var self = this;
    this.run = function (questionSet, div, callback)
    {
        var props = questionSet.allGameProperties();
        registerDoneCallback(callback);
        $(div).empty().flash({
            src: self.baseURL + '/' + self.swfPath,
            width: props.width || 974,
            height: props.height || 570,
            flashvars: {
                game_id: questionSet.parent.id + '::' + questionSet.id,
                input_xml: self.baseURL + '/' + props.input_xml,
                asset_name: props.asset_name,
                asset_url: self.baseURL + '/' + props.asset_url,
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
