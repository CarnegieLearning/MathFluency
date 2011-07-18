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
        },
        close: function ()
        {
            $(this).find('input').val('');
        }
    });
    
    $('#new-student-button').button().click(function ()
    {
        $('#new-student-dialog').dialog('open');
    });
    
    var tableBody = $('#student-table tbody');
    
    function addStudentToTable(json)
    {
        var row = $('<tr>');
        row.append(
            '<td>' + json.rosterID,
            '<td>' + json.lastName,
            '<td>' + json.firstName,
            '<td>' + json.loginID,
            '<td>' + json.password,
            '<td>' + json.condition
        );
        tableBody.append(row);
    }
});
