var registration = function (obj, cb) {
    $.ajax({
        url: "/registration",
        method: "POST",
        data: obj,
        complete: function () {

        },
        statusCode: {
            200: function (result) {
                $('#form-registration').remove();
                $('#after-registration').show(0);
                cb(result);
            },
            403: function (result) {
                var res = JSON.parse(result.responseText);
                var message = res.message;
                var response = {
                    toastr: {
                        type: 'error',
                        message: message
                    }
                };
                cb(response);
            }
        }
    });
};
/*
$(document).ready(function(){
    $(document.forms['form-registration']).on('submit',function(){
        var form = $(this);
        var obj = form.serialize();
        console.log(obj);
        registration(obj, form);
        return false;
    });
});
*/
