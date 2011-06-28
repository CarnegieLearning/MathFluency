var GameControllerClient = require('./GameControllerClient').GameControllerClient,
    PlayerState = require('../common/PlayerState').PlayerState;

var gc = new GameControllerClient('.');
var player = null;

$(document).ready(function ()
{
    unlock();
    $('#player-form').submit(function ()
    {
        lock('Loading player and stages...');
        var playerID = $('#playerID').val() || 'blank';
        gc.getPlayerState(playerID, null, function (playerState)
        {
            player = playerState;
            gc.getAvailableStagesForPlayer(playerState, function (stageIDs)
            {
                $('#stageID').empty().append(
                    $.map(stageIDs, function (id)
                    {
                        return '<option value="'+id+'">'+id+'</option>';
                    }).join());
                unlock();
            });
        });
        return false;
    });
    
    $('#question-form').submit(function ()
    {
        gc.getStage($('#stageID').val(), function (stage)
        {
            stage.getNextQuestionSet(new PlayerState($('#playerID').val()), function (questionSet)
            {
                gc.getGameEngineForQuestionSet(questionSet, function (engine)
                {
                    engine.run(questionSet, $('#game-container'), function (xml)
                    {
                        $('#output').val(xml);
                        lock('Sending data...');
                        gc.saveQuestionSetResults(player, questionSet, xml, function ()
                        {
                            unlock();
                        });
                    });
                });
            });
        });
        return false;
    });
});

function lock(message)
{
    $('#status-box').show('fast');
    $('#status-message').html(message);
    $('input').attr('disabled', 'disabled');
    $('select').attr('disabled', 'disabled');
}

function unlock()
{
    $('#status-box').hide('fast');
    $('input').removeAttr('disabled');
    $('select').removeAttr('disabled');
}
