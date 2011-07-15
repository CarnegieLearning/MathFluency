
var here = window.location.pathname;
if (here.charAt(here.length-1) != '/')
{
    here = here + '/';
}

$(document).ready(function ()
{
    
    $('.tabs').tabs();
    
    $('form[name="student"]').submit(loginHandler('student'));
    $('form[name="instructor"]').submit(loginHandler('instructor'));
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
                alert('Error signing in: ' + statusText);
            })
            .complete(function ()
            {
                //unlock();
            });
        return false;
    };
}
