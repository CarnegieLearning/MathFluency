var GameControllerClient = require('./client/GameControllerClient').GameControllerClient;
var CLFlashGameEngine = require('./client/CLFlashGameEngine').CLFlashGameEngine;
var CLHTML5GameEngine = require('./client/CLHTML5GameEngine').CLHTML5GameEngine;

var gc = new GameControllerClient('api');
gc.registerEngineConstructor('CLFlashGameEngine', CLFlashGameEngine);
gc.registerEngineConstructor('CLHTML5GameEngine', CLHTML5GameEngine);

var instructionsURL;

$(document).ready(function ()
{
    $('#stage-list li button').button().click(function ()
    {
        var stageID = $(this).val();
        runStage(stageID);
    });
    
    $('#instructions-link').button().click(function ()
    {
        window.open(instructionsURL, 'Instructions', 'status=0,location=0,toolbar=0,scrollbars=yes,resizable=yes,width=600,height=500');
    });
    
    $('#instructor-dashboard-link').button();
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
        instructionsURL = 'instructions/' + questionSet.parent.id;
        
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
    $('#instructions-link').hide('fast');
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
