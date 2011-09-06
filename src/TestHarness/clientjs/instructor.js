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
    
    function fieldComparator(field)
    {
        return function (item1, item2)
        {
            return util.compare(item1[field], item2[field]);
        };
    }
    
    function connectGridToDataView(grid, dataView)
    {
        grid.onSort.subscribe(function (e, args)
        {
            var sortAsc = args.sortAsc,
                field = args.sortCol.field;
            dataView.sort(fieldComparator(field), sortAsc);
        });
        dataView.onRowCountChanged.subscribe(function (e, args)
        {
            grid.updateRowCount();
            grid.render();
        });
        dataView.onRowsChanged.subscribe(function (e, args)
        {
            grid.invalidateRows(args.rows);
            grid.render();
        });
    }
    
    function formatTimestamp(row, cell, value, columnDef, dataContext)
    {
        return util.dateFormat(value * 1000, 'm/d HH:MM');
    }
    function formatUTC(row, cell, value, columnDef, dataContext) {
        if(value === null) {
            return "No Games";
        }
        return util.dateFormat(value, 'UTC:m/d HH:MM');
    }
    function formatDuration(row, cell, value, columnDef, dataContext)
    {
        return Math.round(value / 1000) + ' s'
    }
    function formatDurationLong(row, cell, value, columnDef, dataContext)
    {
        if(value === null) {
            return "0 m";
        }
        
        var val = Math.round(value / 60000);
        var str = "";
        if(val > 59) {
            str += val / 60 + " h ";
            val = val % 60;
        }
    
        return  str + val + ' m'
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
    function formatMedalCount(row, cell, value, columnDef, dataContext) {
        if(value === null) {
            return "No Games";
        }

        var ret = '';
        ret += '<div class="medal gold">' + dataContext.GoldMedals + 'g</div> ';
        ret += '<div class="medal silver">' + dataContext.SilverMedals + 's</div> ';
        ret += '<div class="medal bronze">' + dataContext.BronzeMedals + 'b</div> ';
        return ret;
    }
    
    var selectedStudentLoginIDs = [];
    var studentDataView = new Slick.Data.DataView();
    var studentGrid = new Slick.Grid($('#student-table'), studentDataView,
        [
            {id:'instructorLoginID', field:'instructorLoginID', name:'Instructor', sortable:true},
            {id:'rosterID', field:'rosterID', name:'Roster ID', sortable:true},
            {id:'firstName', field:'firstName', name:'First Name', sortable:true},
            {id:'lastName', field:'lastName', name:'Last Name', sortable:true},
            {id:'loginID', field:'loginID', name:'Login ID', sortable:true},
            {id:'password', field:'password', name:'Password'},
            {id:'condition', field:'condition', name:'Condition', sortable:true},
            {id:'gameCount', field:'gameCount', name:'Games', sortable:true},
            {id:'TotalTime', field:'TotalTime', name:'Total Time', sortable:true, formatter:formatDurationLong},
            {id:'Medals', field:'GoldMedals', name:'Medals', sortable:true, formatter:formatMedalCount},
            {id:'FirstDate', field:'FirstDate', name:'First Date', sortable:true, formatter:formatUTC},
            {id:'LastDate', field:'LastDate', name:'Last Date', sortable:true, formatter:formatUTC}
        ],
        {
        });
    studentGrid.setSelectionModel(new Slick.RowSelectionModel());
    studentGrid.onSelectedRowsChanged.subscribe(function ()
    {
        selectedStudentLoginIDs = [];
        var rows = studentGrid.getSelectedRows();
        for (var i = 0; i < rows.length; i++)
        {
            selectedStudentLoginIDs.push(studentDataView.getItem(rows[i]).loginID);
        }
        gamesDataView.refresh();
    });
    connectGridToDataView(studentGrid, studentDataView);
    
    var gamesDataView = new Slick.Data.DataView();
    var gamesGrid = new Slick.Grid($('#games-table'), gamesDataView,
        [
            {id:'loginID', field:'loginID', name:'Login ID', sortable:true},
            {id:'condition', field:'condition', name:'Condition', sortable:true},
            {id:'stageID', field:'stageID', name:'Level', sortable:true},
            {id:'questionSetID', field:'questionSetID', name:'Set', sortable:true},
            {id:'score', field:'score', name:'Score', sortable:true, width: 65},
            {id:'medal', field:'medal', name:'Medal', sortable:true, formatter:formatMedal, width:55},
            {id:'elapsedMS', field:'elapsedMS', name:'Duration', sortable:true, formatter:formatDuration, width: 60},
            {id:'endTime', field:'endTime', name:'Date', sortable:true, formatter:formatTimestamp},
            {id:'endState', field:'endState', name:'End', sortable:true, formatter:formatEndState}
        ],
        {
            forceFitColumns: true,
            multiSelect: false
        });
    gamesDataView.setFilter(function (item)
    {
        return (selectedStudentLoginIDs.length == 0 ||
                ~selectedStudentLoginIDs.indexOf(item.loginID));
    });
    gamesDataView.sort(fieldComparator('endTime'), false);
    gamesGrid.setSortColumn('endTime', false);
    gamesGrid.setSelectionModel(new Slick.RowSelectionModel());
    gamesGrid.onSelectedRowsChanged.subscribe(function ()
    {
        var item = gamesDataView.getItem(gamesGrid.getSelectedRows()[0]);
        if (item)
        {
            $.get(here + '../output/' + item.dataFile)
            .success(function (data, status, jqXHR)
            {
                $('#game-output').val(jqXHR.responseText);
            })
            .error(makeXHRErrorHandler('Error fetching game output: '));
        }
        else
        {
            $('#game-output').val('');
        }
    });
    connectGridToDataView(gamesGrid, gamesDataView);
    
    // Fetch the table data.
    fetchStudents();
    fetchResults();
    
    function makeXHRErrorHandler(message)
    {
        return function (jqXHR)
        {
            alert(message + jqXHR.responseText);
        };
    }
    
    function fetchStudents(instructorID)
    {
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
            gamesDataView.reSort();
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
