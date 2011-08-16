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
    
    $('#instructions-link').button();
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
        $('#instructions-link').unbind('click').click(function ()
        {
            window.open('instructions/' + questionSet.parent.id, 'Instructions', 'status=0,location=0,toolbar=0,width=600,height=500');
        });
        engine.run(questionSet, $('#game-container'), function (xml)
        {
            statusMessage('Sending game data...');
            gc.saveQuestionSetResults(null, questionSet, xml, function (error)
            {
                if (error)
                {
                    alert('Error saving data: ' + error);
                }
                unlock();
            });
        });
    });
}

function lock(message)
{
    $(':input').attr('disabled', true);
    $('#instructions-link').attr('disabled', false).show('fast');
    statusMessage(message);
}

function unlock(message)
{
    $(':input').attr('disabled', false);
    $('#instructions-link').show('fast');
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
