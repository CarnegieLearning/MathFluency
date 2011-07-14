var GameControllerClient = require('./GameControllerClient').GameControllerClient,
    PlayerState = require('../common/PlayerState').PlayerState;

var gc = new GameControllerClient('.');
var player = null;
var stage = null;

$(document).ready(function ()
{
    unlock('');
    
    $('#playerID').keyup(function ()
    {
        unlock('');
    });
    
    $('#player-form').submit(function ()
    {
        if (player) logout();
        else login();
        return false;
    });
    
    $('#question-form').submit(function ()
    {
        runSequence();
        return false;
    });
    
    $('#stageID').change(function ()
    {
        loadStage();
    });
    
    $('#debugMode').change(function ()
    {
        var stuffToHide = $('#header').add('#output');
        if ($(this).attr('checked')) stuffToHide.show('fast');
        else stuffToHide.hide('fast');
    });
});

function logout()
{
    player = null;
    unlock('');
}

function login()
{
    lock('Loading player state...');
    var playerID = $('#playerID').val().trim();
    gc.authenticatePlayer(playerID, null, function (playerState)
    {
        if (!'playerID' in playerState)
        {
            unlock('Error logging in!');
            return;
        }
        
        player = playerState;
        statusMessage('Loading stages for player...');
        gc.getAvailableStagesForPlayer(playerState, function (stageIDs)
        {
            $('#stageID').empty().append($.map(stageIDs, makeSelectOption).join());
            loadStage();
        });
    });
}

function runSequence()
{
    var questionSetID = $('#questionSetID').val();
    lock('Starting question set ' + questionSetID + '...');
    stage.getQuestionSet(questionSetID, function (questionSet)
    {
        runQuestionSet(questionSet);
    });
}

function runQuestionSet(questionSet)
{
    player.stageID = questionSet.parent.id;
    player.questionSetID = questionSet.id;
    statusMessage('Loading game engine for question set ' + questionSet.id + '...');
    gc.getGameEngineForQuestionSet(questionSet, function (engine)
    {
        statusMessage('Running game engine for question set ' + questionSet.id + '...');
        engine.run(questionSet, $('#game-container'), function (xml)
        {
            $('#output').val($('#output').val() + '\n\n' + xml);
            statusMessage('Sending data...');
            gc.saveQuestionSetResults(player, questionSet, xml, function ()
            {
                statusMessage('Getting next question set...');
                questionSet.parent.getNextQuestionSet(player, function (nextQuestionSet)
                {
                    // If there's a next one, recurse.
                    if (nextQuestionSet)
                    {
                        alert('You just completed question set ' + questionSet.id + '. Press the button to start the next game.');
                        runQuestionSet(nextQuestionSet);
                    }
                    else
                    {
                        unlock('');
                        alert('All done!');
                    }
                });
            });
        });
    });
}

function loadStage()
{
    var stageID = $('#stageID').val();
    lock('Loading stage ' + stageID + '...');
    gc.getStage(stageID, function (loadedStage)
    {
        stage = loadedStage;
        stage.getAllQuestionSetIDs(function (questionSetIDs)
        {
            $('#questionSetID').empty().append($.map(questionSetIDs, makeSelectOption).join());
            unlock('');
        });
    });
}

function makeSelectOption(val)
{
    return '<option value="'+val+'">'+val+'</option>';
}

function lock(message)
{
    $(':input').attr('disabled', true);
    statusMessage(message);
}

function unlock(message)
{
    $(':input').attr('disabled', false);
    $('#playerID').attr('disabled', !!player);
    $('#loginButton')
        .val(player ? 'Sign out' : 'Sign in')
        .attr('disabled', $('#playerID').val().trim() ? false : true);
    $('#question-form :input').attr('disabled', !player);
    statusMessage(message);
}

function statusMessage(message)
{
    $('#status-message').html(message);
}
