var sendQuery = function (obj, cb) {
    $.ajax({
        url: "/admin/api",
        method: "POST",
        data: obj,
        complete: function (res) {
            console.log('complite', res);
        },
        statusCode: {
            200: function (result) {
                console.log('200', result);

            },
            403: function (result) {
                console.log('200', result);
            }
        }
    });
};

