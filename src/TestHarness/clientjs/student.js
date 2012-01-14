var GameControllerClient = require('./client/GameControllerClient').GameControllerClient;
var CLFlashGameEngine = require('./client/CLFlashGameEngine').CLFlashGameEngine;
var CLHTML5GameEngine = require('./client/CLHTML5GameEngine').CLHTML5GameEngine;

var gc = new GameControllerClient('/api');
gc.registerEngineConstructor('CLFlashGameEngine', CLFlashGameEngine);
gc.registerEngineConstructor('CLHTML5GameEngine', CLHTML5GameEngine);

var instructionsURL;

$(document).ready(function ()
{
    $('#stage-list li button').button().click(function ()
    {
        var bvals = $(this).val().split('/',2);
        var seqID = bvals[0];
        var stageID = bvals[1];
        
        //HACK: Putting things on the window level is bad...
        window.runStage(seqID, stageID);
        window.currentStage = stageID;
        window.currentSequence = seqID;
    });
    
    $('#instructions-link').button().click(function ()
    {
        window.open(instructionsURL, 'Instructions', 'status=0,location=0,toolbar=0,scrollbars=yes,resizable=yes,width=600,height=500');
    });
    
    $('#instructor-dashboard-link').button();
});

window.quickpost = function quickpost()
{
    var xml = '<OUTPUT><GAME_REFERENCE_NUMBER ID="foo"/><SCORE_SUMMARY><Score CorrectAnswers="6" ElapsedTime="26862" PenaltyTime="176520" TotalScore="203382" Medal="Bronze"/></SCORE_SUMMARY><SCORE_DETAILS><SCORE QuestionIndex="1" AnswerValue="0" TimeTaken="1886" LaneChosen="1"/></SCORE_DETAILS><END_STATE STATE="FINISH"/></OUTPUT>';
  
    gc.getSequence( 'c1s2', function(seq)
    {
        gc.getStage( 'level03-stage0', function (stg)
        {
            stg.getNextQuestionSet(null, function (qs)
            {
                gc.saveQuestionSetResults(null, seq, qs, xml, function (error)
                {
                    if (error)
                    {
                        alert('Error saving data: ' + error);
                    }
                });
            });
        });
    });
}

//HACK: Putting things on the window level is bad...
window.runStage = function runStage( seqID, stageID )
{
    lock('Loading level ' + stageID + '...');
    gc.getStage( stageID, function (stage)
    {   
        var sequence = null;
        gc.getSequence( seqID, function(seq)
        {
            sequence = seq;
        });
        // Don't need to pass playerState since the server stores this in the session.
        stage.getNextQuestionSet(null, function (questionSet)
        {
            runQuestionSet(sequence, questionSet);
        });
    });
}

function runQuestionSet( sequence, questionSet )
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
            statusMessage('Sending game data…');
            gc.saveQuestionSetResults(null, sequence, questionSet, xml, function (error)
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
