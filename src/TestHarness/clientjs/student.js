var GameControllerClient = require('./client/GameControllerClient').GameControllerClient,
    CLFlashGameEngine = require('./client/CLFlashGameEngine').CLFlashGameEngine;

var gc = new GameControllerClient('api');
gc.registerEngineConstructor('CLFlashGameEngine', CLFlashGameEngine);

$(document).ready(function ()
{
    $('#stage-list li button').button().click(function ()
    {
        var stageID = $(this).val();
        runStage(stageID);
    });
});

function runStage(stageID)
{
    lock('Loading level ' + stageID + '...');
    gc.getStage(stageID, function (stage)
    {
        // Don't need to pass playerState since the server stores this in the session.
        stage.getNextQuestionSet(null, function (questionSet)
        {
            runQuestionSet(questionSet);
        });
    });
}

function runQuestionSet(questionSet)
{
    if (!questionSet)
    {
        unlock();
        return;
    }
    
    statusMessage('Loading game engine for question set ' + questionSet.id + '...');
    gc.getGameEngineForQuestionSet(questionSet, function (engine)
    {
        statusMessage('Running game engine for question set ' + questionSet.id + '...');
        engine.run(questionSet, $('#game-container'), function (xml)
        {
            statusMessage('Sending game data...');
            gc.saveQuestionSetResults(null, questionSet, xml, function ()
            {
                statusMessage('Getting next question set...');
                questionSet.parent.getNextQuestionSet(null, function (nextQuestionSet)
                {
                    runQuestionSet(nextQuestionSet);
                });
            });
        });
    });
}

function lock(message)
{
    $(':input').attr('disabled', true);
    statusMessage(message);
}

function unlock(message)
{
    $(':input').attr('disabled', false);
    statusMessage(message);
}

function statusMessage(message)
{
    if (!message)
    {
        $('#status-message').hide('fast');
    }
    else
    {
        $('#status-message').html(message).show('fast');
    }
}
