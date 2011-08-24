"use strict";

require('./common/Utilities');

$(document).ready(function ()
{
    var here = window.location.pathname;
    if (here.charAt(here.length-1) != '/')
    {
        here = here + '/';
    }
    
    $('#export-button').button().click(function ()
    {
        window.location.href = here + 'export';
    });
    
    $('#csv-upload-dialog').dialog({
        autoOpen: false,
        width: 400,
        height: 400,
        modal: true,
        buttons: {
            'Cancel': function ()
            {
                $(this).dialog('close');
            },
            'Upload': function ()
            {
                $(this).find('form').submit();
            }
        }
    });
    
    $('#csv-upload-button').button().click(function ()
    {
        $('#csv-upload-dialog').dialog('open');
    });
    
    $('#new-student-dialog').dialog({
        autoOpen: false,
        width: 350,
        height: 400,
        modal: true,
        buttons: {
            'Cancel': function ()
            {
                $(this).dialog('close');
            },
            'Add student': function ()
            {
                submitNewStudent();
            }
        },
        close: function ()
        {
            $(this).find('input').val('');
        },
        open: function ()
        {
            $(this).find('input[name="rosterID"]').focus();
        }
    });
    
    $('#new-student-dialog').keyup(function (e)
    {
        if (e.keyCode == 13)
        {
            submitNewStudent();
            return false;
        }
    });
    
    $('#new-student-button').button().click(function ()
    {
        $('#new-student-dialog').dialog('open');
    });
    
    function submitNewStudent()
    {
        $.post(here + 'student', $('#new-student-dialog form').serialize())
            .success(function (data)
            {
                addStudentToTable(0, data.student);
                $('#new-student-dialog').dialog('close');
            })
            .error(function (jqXHR, statusText, errorThrown)
            {
                alert('Error saving student: ' + jqXHR.responseText);
            })
            .complete(function ()
            {
                //unlock();
            });
    }
    
    $.getJSON(here + 'student')
        .success(function (data)
        {
            $.each(data.students, addStudentToTable);
        })
        .error(function (jqXHR)
        {
            alert('Error fetching students: ' + jqXHR.responseText);
        });
    
    $.getJSON(here + 'student/result')
        .success(function (data)
        {
            $.each(data.results, addResultsToTable);
        })
        .error(function (jqXHR)
        {
            alert('Error fetching game results: ' + jqXHR.responseText);
        });
    
    $('#student-table, #games-table')
    .attr({
        cellpadding: 0,
        cellspacing: 0,
        border: 0
    })
    .css({fontSize: '12px'});
    
    $('#student-table')
    .dataTable({
        "bJQueryUI": true,
        "sScrollY": "15em",
        "bPaginate": false
    })
    .delegate('tr', 'click', function ()
    {
        $(this).toggleClass('row_selected').siblings('tr').removeClass('row_selected');
        var data = $('#student-table').dataTable().fnGetData(this);
        var login = data[4];
        $('#games-table').dataTable().fnFilter($(this).hasClass('row_selected') ? login : '');
    })
    .dataTable().fnSetColumnVis(0, window.FLUENCY.isAdmin); // Show instructor column only when admin.
    
    $('#games-table')
    .delegate('tr', 'click', function ()
    {
        $(this).addClass('row_selected').siblings('tr').removeClass('row_selected');
        var data = $('#games-table').dataTable().fnGetData(this);
        var dataFile = data[10];
        $.get(here + '../output/' + dataFile)
            .success(function (data, status, jqXHR)
            {
                $('#game-output').val(jqXHR.responseText);
            })
            .error(function (jqXHR)
            {
                alert('Error fetching game output: ' + jqXHR.responseText);
            });
    })
    .dataTable({
        bJQueryUI: true,
        sScrollY: "15em",
        bPaginate: false,
        aoColumnDefs: [
            {
                aTargets: ['roster', 'data-file'],
                bVisible: false
            },
            {
                aTargets: ['end-date'],
                fnRender: function (obj)
                {
                    return (new Date(obj.aData[obj.iDataColumn] * 1000)).format('yy-mm-dd HH:MM');
                },
                bUseRendered: false
            },
            {
                aTargets: ['duration'],
                fnRender: function (obj)
                {
                    return Math.round(obj.aData[obj.iDataColumn] / 1000) + ' s';
                },
                bUseRendered: false
            }
        ]
    });
    
    function addStudentToTable(index, json)
    {
        var cols = [
            json.instructorLoginID,
            json.rosterID,
            json.firstName,
            json.lastName,
            json.loginID,
            json.password,
            json.condition,
            json.gameCount
        ];
        $('#student-table').dataTable().fnAddData(cols);
    }
    
    function addResultsToTable(index, json)
    {
        var cols = [
            json.rosterID,
            json.loginID,
            json.condition,
            json.stageID,
            json.questionSetID,
            json.score,
            json.medal,
            json.elapsedMS,
            json.endTime,
            json.endState,
            json.dataFile
        ];
        $('#games-table').dataTable().fnAddData(cols);
    }
});
