"use strict";

require('./common/Utilities');

$(document).ready(function ()
{
    var here = window.location.pathname;
    if (here.charAt(here.length-1) != '/')
    {
        here = here + '/';
    }
    
    $('a.button').button();
    
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
    
    var studentGrid = new Slick.Grid($('#student-table'), [],
        [
            {id:'instructorLoginID', field:'instructorLoginID', name:'Instructor'},
            {id:'rosterID', field:'rosterID', name:'Roster ID'},
            {id:'firstName', field:'firstName', name:'First Name'},
            {id:'lastName', field:'lastName', name:'Last Name'},
            {id:'loginID', field:'loginID', name:'Login ID'},
            {id:'password', field:'password', name:'Password'},
            {id:'condition', field:'condition', name:'Condition'},
            {id:'gameCount', field:'gameCount', name:'Games Played'}
        ],
        {});
    /*
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
    });*/
    
    if (FLUENCY.isAdmin)
    {
        //fetchInstructors();
        fetchStudents();
    }
    else
    {
        fetchStudents(FLUENCY.loginID);
    }
    
    function makeXHRErrorHandler(message)
    {
        return function (jqXHR)
        {
            alert(message + jqXHR.responseText);
        };
    }
    
    function fetchInstructors()
    {
        $.getJSON(here + 'instructors')
        .success(function (data)
        {
            $.each(data.instructors, addInstructorToTable);
        })
        .error(makeXHRErrorHandler('Error fetching instructors: '));
    }
    
    function fetchStudents(instructorID)
    {
        //$.getJSON(here + instructorID + '/student')
        $.getJSON(here + 'student')
        .success(function (data)
        {
            console.log('setting data to:');
            console.log(data.students);
            studentGrid.setData(data.students);
            studentGrid.updateRowCount();
            studentGrid.render();
        })
        .error(makeXHRErrorHandler('Error fetching students: '));
    }
    
    function fetchResults(studentID)
    {
        //$.getJSON(here + instructorID + '/student/' + studentID + '/result')
        $.getJSON(here + '/student/result')
        .success(function (data)
        {
            $.each(data.results, addResultsToTable);
        })
        .error(makeXHRErrorHandler('Error fetching game results: '));
    }
    
    function addInstructorToTable(index, json)
    {
        var cols = [
            
        ];
        $('#instructor-table').dataTable().fnAddData(cols);
    }
    
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
