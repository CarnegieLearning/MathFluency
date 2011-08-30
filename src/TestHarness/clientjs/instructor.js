"use strict";

var constants = require('./common/Constants'),
    util = require('./common/Utilities');

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
    
    
    // Table data
    
    function connectGridToDataView(grid, dataView)
    {
        grid.onSort = function (sortCol, sortAsc)
        {
            var field = sortCol.field;
            var sortFun = function (item1, item2)
            {
                var a = item1[field],
                    b = item2[field];
                return util.compare(a, b);
            };
            dataView.sort(sortFun, sortAsc);
        };
        dataView.onRowCountChanged.subscribe(function ()
        {
            grid.updateRowCount();
            grid.render();
        });
        dataView.onRowsChanged.subscribe(function (rows)
        {
            grid.removeRows(rows);
            grid.render();
        });
    }
    
    function formatTimestamp(row, cell, value, columnDef, dataContext)
    {
        return util.dateFormat(value * 1000, 'm/d HH:MM');
    }
    function formatDuration(row, cell, value, columnDef, dataContext)
    {
        return Math.round(value / 1000) + ' s'
    }
    function formatMedal(row, cell, value, columnDef, dataContext)
    {
        var medal = constants.medal.codeToString(value);
        return '<div class="medal ' + medal + '">' + medal + '</div>';
    }
    function formatEndState(row, cell, value, columnDef, dataContext)
    {
        var endState = constants.endState.codeToString(value);
        return '<div class="end-state ' + endState + '">' + endState + '</div>';
    }
    
    var studentDataView = new Slick.Data.DataView();
    var studentGrid = new Slick.Grid($('#student-table'), studentDataView.rows,
        [
            {id:'instructorLoginID', field:'instructorLoginID', name:'Instructor', sortable:true},
            {id:'rosterID', field:'rosterID', name:'Roster ID', sortable:true},
            {id:'firstName', field:'firstName', name:'First Name', sortable:true},
            {id:'lastName', field:'lastName', name:'Last Name', sortable:true},
            {id:'loginID', field:'loginID', name:'Login ID', sortable:true},
            {id:'password', field:'password', name:'Password'},
            {id:'condition', field:'condition', name:'Condition', sortable:true},
            {id:'gameCount', field:'gameCount', name:'Games', sortable:true}
        ],
        {
            forceFitColumns: true
        });
    connectGridToDataView(studentGrid, studentDataView);
    
    var gamesDataView = new Slick.Data.DataView();
    var gamesGrid = new Slick.Grid($('#games-table'), gamesDataView.rows,
        [
            {id:'loginID', field:'loginID', name:'Login ID', sortable:true},
            {id:'condition', field:'condition', name:'Condition', sortable:true},
            {id:'stageID', field:'stageID', name:'Level', sortable:true},
            {id:'questionSetID', field:'questionSetID', name:'Set', sortable:true},
            {id:'score', field:'score', name:'Score', sortable:true},
            {id:'medal', field:'medal', name:'Medal', sortable:true, formatter:formatMedal},
            {id:'elapsedMS', field:'elapsedMS', name:'Duration', sortable:true, formatter:formatDuration},
            {id:'endTime', field:'endTime', name:'Date', sortable:true, formatter:formatTimestamp},
            {id:'endState', field:'endState', name:'End', sortable:true, formatter:formatEndState}
        ],
        {
            forceFitColumns: true
        });
    connectGridToDataView(gamesGrid, gamesDataView);
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
    }
    fetchStudents();
    fetchResults();
    
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
            studentDataView.beginUpdate();
            studentDataView.setItems(data.students);
            studentDataView.endUpdate();
        })
        .error(makeXHRErrorHandler('Error fetching students: '));
    }
    
    function fetchResults()
    {
        $.getJSON(here + 'student/result')
        .success(function (data)
        {
            gamesDataView.beginUpdate();
            gamesDataView.setItems(data.results);
            gamesDataView.endUpdate();
        })
        .error(makeXHRErrorHandler('Error fetching game results: '));
    }
    
    function submitNewStudent()
    {
        $.post(here + 'student', $('#new-student-dialog form').serialize())
            .success(function (data)
            {
                studentDataView.addItem(data.student);
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
});
