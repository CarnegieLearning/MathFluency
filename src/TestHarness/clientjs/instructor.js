$(document).ready(function ()
{
    var here = window.location.pathname;
    if (here.charAt(here.length-1) != '/')
    {
        here = here + '/';
    }
    
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
                addStudentToTable(data.student);
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
    
    $.getJSON(here + 'students')
        .success(function (data)
        {
            for (var i in data.students)
            {
                addStudentToTable(data.students[i]);
            }
        })
        .error(function (jqXHR)
        {
            alert('Error fetching students: ' + jqXHR.responseText);
        });
    
    $('#student-table')
    .attr({
        cellpadding: 0,
        cellspacing: 0,
        border: 0
    })
    .dataTable({
        "bJQueryUI": true
    });
    
    function addStudentToTable(json)
    {
        var cols = [
            json.rosterID,
            json.firstName,
            json.lastName,
            json.loginID,
            json.password,
            json.condition
        ];
        if (window.FLUENCY.isAdmin)
        {
            cols.unshift(json.instructorLoginID);
        }
        $('#student-table').dataTable().fnAddData(cols);
    }
});
