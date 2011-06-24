var GameControllerClient = require('/js/GameControllerClient').GameControllerClient,
    PlayerState = require('/js/common/PlayerState').PlayerState;

var gameController = new GameControllerClient();

$(document).ready(function ()
{
    gameController.getAvailableStagesForPlayer({}, function (stageIDs)
    {
        $.each(stageIDs, function (index, id)
        {
            var option = '<option value="'+id+'">'+id+'</option>';
            $('#stageID').append(option);
        })
    });
    
    $('#input-form').submit(function ()
    {
        gameController.getStage($('#stageID').val(), function (stage)
        {
            stage.getNextQuestionSet(new PlayerState($('#playerID').val()), function (questionSet)
            {
                gameController.getGameEngineForQuestionSet(questionSet, function (engine)
                {
                    engine.run(questionSet, $('#game-container'), function (xml)
                    {
                        $('#output').val(xml);
                    });
                });
            });
        });
        return false;
    });
});
