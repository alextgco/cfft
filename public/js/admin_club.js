$(document).ready(function(){

    var confirm_reg = $('#confirm_registration');
    var form_wrapper = $('#form-registration');


    confirm_reg.off('click').on('click', function(){
        var toSendArr = {};
        var fields = [];
        for(var i=0; i< form_wrapper.find('.fc-field:not(".select2")').length; i++){
            var control = form_wrapper.find('.fc-field').eq(i);
            var serverName = control.data('server_name');
            var editor = control.data('editor');
            var val = undefined;
            var val2 = undefined;
            CF.validField(control);
            switch (editor){
                case 'text':
                    val = control.val();

                        fields.push({
                            name: serverName,
                            val: val
                        });

                    break;
                case 'number':
                    val = control.val();

                        fields.push({
                            name: serverName,
                            val: val
                        });

                    break;
                case 'select':
                    val = control.select2('data').id;
                    val2 = control.select2('data').text;


                        fields.push({
                            name: serverName,
                            val: val
                        });

                    break;
                case 'date':
                    val = control.val();

                        fields.push({
                            name: serverName,
                            val: val
                        });

                    break;
                case 'phone':
                    val = control.val();

                        fields.push({
                            name: serverName,
                            val: val
                        });

                    break;
                case 'email':
                    val = control.val();

                        fields.push({
                            name: serverName,
                            val: val
                        });

                    break;
                case 'checkbox':
                    val = control[0].checked;
                    fields.push({
                        name: serverName,
                        val: val
                    });
                    break;
                default :
                    break;
            }
        }

        console.log(fields);

    });

    //function notifyInvalid(control){
    //    var label = control.data('title');
    //    var isRequired = control.data('required');
    //    if(isRequired){
    //        if(control.attr('type') == 'hidden'){
    //            console.log(control.parents('.form-group').eq(0).find('div.select2.fc-field').eq(0));
    //            CF.invalidField(control.parents('.form-group').eq(0).find('div.select2.fc-field').eq(0));
    //        }else{
    //            CF.invalidField(control);
    //        }
    //        toastr['error']('Некорректно заполнено поле '+ label);
    //        return 1;
    //    }else{
    //        return 0;
    //    }
    //
    //}
    //
    //confirm_reg.off('click').on('click', function(){
    //    var formValid = 0;
    //    var fields = [];
    //    for(var i=0; i<form_wrapper.find('.fc-field').length; i++){
    //        var control = form_wrapper.find('.fc-field').eq(i);
    //        var serverName = control.data('server_name');
    //        var editor = control.data('editor');
    //        var val = undefined;
    //        var val2 = undefined;
    //
    //        CF.validField(control);
    //        switch (editor){
    //            case 'text':
    //                val = control.val();
    //                if(!CF.validator.text(val)){
    //                    formValid += notifyInvalid(control);
    //
    //                }else{
    //                    fields.push({
    //                        name: serverName,
    //                        val: val
    //                    });
    //                }
    //                break;
    //            case 'number':
    //                val = control.val();
    //                if(!CF.validator.float(val)){
    //                    formValid += notifyInvalid(control);
    //                }else{
    //                    fields.push({
    //                        name: serverName,
    //                        val: val
    //                    });
    //                }
    //                break;
    //            case 'select':
    //                val = control.select2('data').id;
    //                val2 = control.select2('data').text;
    //
    //                if(!CF.validator.text(val2)){
    //                    formValid += notifyInvalid(control);
    //                }else{
    //                    fields.push({
    //                        name: serverName,
    //                        val: val
    //                    });
    //                }
    //                break;
    //            case 'date':
    //                val = control.val();
    //                if(!CF.validator.text(val)){
    //                    formValid += notifyInvalid(control);
    //                }else{
    //                    fields.push({
    //                        name: serverName,
    //                        val: val
    //                    });
    //                }
    //                break;
    //            case 'phone':
    //                val = control.val();
    //                if(!CF.validator.notEmpty(val)){
    //                    formValid += notifyInvalid(control);
    //                }else{
    //                    fields.push({
    //                        name: serverName,
    //                        val: val
    //                    });
    //                }
    //                break;
    //            case 'email':
    //                val = control.val();
    //                if(!CF.validator.email(val)){
    //                    formValid += notifyInvalid(control);
    //                }else{
    //                    fields.push({
    //                        name: serverName,
    //                        val: val
    //                    });
    //                }
    //                break;
    //            case 'checkbox':
    //                val = control[0].checked;
    //                fields.push({
    //                    name: serverName,
    //                    val: val
    //                });
    //                break;
    //            default :
    //                break;
    //        }
    //    }
    //
    //    console.log(fields);
    //
    //    if(formValid == 0){
    //
    //        console.log(fields);
    //        var pass = '';
    //        var c_pass = '';
    //        for(var p in fields){
    //            var f = fields[p];
    //            if(f.name == 'password'){
    //                pass = f.val;
    //            }
    //            if(f.name == 'confirm_password'){
    //                c_pass = f.val;
    //            }
    //        }
    //
    //        if(pass != c_pass){
    //            var pasElem = form_wrapper.find('.fc-field[data-server_name="password"]');
    //            var c_pasElem = form_wrapper.find('.fc-field[data-server_name="confirm_password"]');
    //            CF.invalidField(pasElem);
    //            CF.invalidField(c_pasElem);
    //            pasElem.val('');
    //            c_pasElem.val('');
    //            toastr['error']('Пароли не совпадают');
    //            return;
    //        }
    //
    //        var params = {};
    //        for(var i in fields){
    //            var fld = fields[i];
    //            params[fld.name] = fld.val;
    //        }
    //
    //        CF.sendQuery({
    //            command: 'operation',
    //            object: 'register_user',
    //            params: params
    //        }, function(res){
    //            console.log(res);
    //            if(res.toastr){
    //                toastr[res.toastr.type](res.toastr.message);
    //            }
    //        });
    //    }
    //});

});
