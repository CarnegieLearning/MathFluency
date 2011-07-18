
var here = window.location.pathname;
if (here.charAt(here.length-1) != '/')
{
    here = here + '/';
}

$(document).ready(function ()
{
    $('.tabs').tabs({
        select: function (event, ui)
        {
            var loginField = $(ui.panel).find('input[name="loginID"]');
            setTimeout(function () {loginField.focus();}, 0);
        }
    });
    
    $('form[name="student"]').submit(loginHandler('student'))
        .find('input[name="loginID"]').focus();
    $('form[name="instructor"]').submit(loginHandler('instructor'));
    $('input[type="submit"]').button();
});

function loginHandler(type)
{
    return function ()
    {
        $.post(here + type, $(this).serialize())
            .success(function ()
            {
                window.location.href = '/';
            })
            .error(function (jqXHR, statusText, errorThrown)
            {
                alert('Error signing in: ' + jqXHR.responseText);
            })
            .complete(function ()
            {
                //unlock();
            });
        return false;
    };
}
