$(document).ready(function(){
    var fields = $('.fc-field');
    var confirm = $('.save_profile');
    function acquireData(){
        var data = [];
        for(var i=0; i<fields.length; i++){
            var fld = fields.eq(i);
            if(fld.attr('type') != 'hidden'){
                if(fld.hasClass('select2')){
                    data.push({
                        name: fld.parents('td').eq(0).children('input[type="hidden"]').eq(0).data('server_name'),
                        val: fld.select2('data').id
                    });
                }else{
                    data.push({
                        name: fld.data('server_name'),
                        val: fld.val()
                    });
                }
            }
        }
        return data;
    }


    confirm.off('click').on('click', function(){
        var data = acquireData();
        console.log(data);
    });


});
