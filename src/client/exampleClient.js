var GameControllerClient = require('./GameControllerClient').GameControllerClient,
    PlayerState = require('../common/PlayerState').PlayerState;

var gc = new GameControllerClient('.');
var player = null;

$(document).ready(function ()
{
    $('#question-form :input').attr('disabled', 'disabled');
    $('#loginButton').attr('disabled', $('#playerID').val().trim() ? false : true);
    
    $('#playerID').keyup(function ()
    {
        $('#loginButton').attr('disabled', $(this).val().trim() ? false : true);
    });
    
    $('#player-form').submit(function ()
    {
        if (player) logout();
        else login();
        return false;
    });
    
    $('#question-form').submit(function ()
    {
        var stageID = $('#stageID').val();
        $(':input').attr('disabled', true);
        statusMessage('Loading stage ' + stageID + '...');
        gc.getStage(stageID, function (stage)
        {
            stage.getNextQuestionSet(player, function (questionSet)
            {
                statusMessage('Loading game engine for question set ' + questionSet.id + '...');
                gc.getGameEngineForQuestionSet(questionSet, function (engine)
                {
                    statusMessage('Running game engine for question set ' + questionSet.id + '...');
                    engine.run(questionSet, $('#game-container'), function (xml)
                    {
                        $('#output').val(xml);
                        statusMessage('Sending data...');
                        gc.saveQuestionSetResults(player, questionSet, xml, function ()
                        {
                            statusMessage('');
                            $('#question-form :input').add('#loginButton').attr('disabled', false);
                        });
                    });
                });
            });
        });
        return false;
    });
});

function statusMessage(message)
{
    $('#status-message').html(message);
}

function logout()
{
    player = null;
    $('#player-form :input').attr('disabled', false);
    $('#question-form :input').attr('disabled', true);
    $('#loginButton').val('Sign in');
}

function login()
{
    statusMessage('Loading player state...');
    $('#player-form :input').attr('disabled', true);
    var playerID = $('#playerID').val().trim();
    gc.getPlayerState(playerID, null, function (playerState)
    {
        player = playerState;
        statusMessage('Loading stages for player...');
        gc.getAvailableStagesForPlayer(playerState, function (stageIDs)
        {
            $('#stageID').empty().append(
                $.map(stageIDs, function (id)
                {
                    return '<option value="'+id+'">'+id+'</option>';
                }).join());
            $('#question-form :input').attr('disabled', false);
            $('#loginButton').val('Sign out').attr('disabled', false);
            statusMessage('');
        });
    });
}
