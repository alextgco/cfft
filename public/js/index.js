$(document).ready(function(){

    (function(){
        $('#logo').off('click').on('click', function(){
            if($(this).hasClass('adminHome')){
                document.location.href = './admin';
            }else{
                document.location.href = './';
            }
        });

        //$('.cf_datepicker').datepicker({
        //    format: "yyyy-mm-dd",
        //    todayBtn: "linked",
        //    language: "ru",
        //    autoclose: true
        //});

        $('.fc_datepicker').datepicker({
            format: "yyyy-mm-dd",
            todayBtn: "linked",
            language: "ru",
            autoclose: true
        });



        $('.maskedPhone').mask('(999) 999-99-99');
        $('.maskTime').mask('99:99');

        $('select').select2();

        var directories = {
            payment_type_id: 'action_payment_types',
            result_type_id: 'result_types',
            status_id: 'statuses_of_action_parts'
        };

        $('input.select2.fc-event-field, input.select2.fc-event-part-field').each(function(idx, elem){
            var $elem = $(elem);
            var name = $elem.data('name');
            $elem.select2({
                query: function(query){
                    var data = {results: []};
                    sendQuery({
                        command: 'get',
                        object: directories[name],
                        params: {}
                    }, function(res){
                        for(var i in res.data){
                            var item = res.data[i];
                            data.results.push({
                                id: item.id,
                                text: item.name
                            });
                        }
                        query.callback(data);
                    });
                },
                initSelection: function(element, callback){
                    var data = {id: element.val(), text: $(element).data('text')};
                    callback(data);
                }
            });
        });

        var cf_text_editors = $('.cf_text_editor');
        for(var i=0; i<cf_text_editors.length; i++){
            var te = cf_text_editors.eq(i)[0];
            CKEDITOR.replace(te);
        }

        var cf_text_editors_simple = $('.cf_text_editor_simple');
        for(var i=0; i<cf_text_editors_simple.length; i++){
            var te = cf_text_editors_simple.eq(i)[0];
            CKEDITOR.replace(te);
        }

        $('.open-calendar').off('click').on('click', function(){
            var calendarWrapper = $('.calendar-wrapper');
            if($(this).hasClass('opened')){
                $(this).removeClass('opened');
                calendarWrapper.hide(0);
            }else{
                $(this).addClass('opened');
                calendarWrapper.show(0);
            }
        });



        $('.calendar-wrapper').fullCalendar({
            lang: 'ru',
            aspectRatio: 1,
            contentHeight: 'auto'
        });

    }());


    CF.initMainSlider();
    CF.initUserObject();
    CF.initRegistration();
    CF.initEditProfile();
    CF.initOrderEventPart();
});

(function(){
    function initMainSlider(){
        var sl_parent = $('.main-slider-view');
        var sl_ul = $('.main-slider');
        var sl_lis = $('.main-slider li');
        var goR = sl_parent.find('.main-slider-slide-right');
        var goL = sl_parent.find('.main-slider-slide-left');
        var dotsWrapper = sl_parent.find('.main-slider-dots-wrapper');

        function enableButtons(){
            var currShift = parseInt(sl_ul.data('shift')) || 0;
            goL.removeClass('disabled');
            goR.removeClass('disabled');
            if(Math.abs(currShift) == 0){
                goL.addClass('disabled');
            }else if(Math.abs(currShift) == (sl_lis.length-1) * 100){
                goR.addClass('disabled');
            }
        }

        var slideLeft = function(cb){
            var currLeft = parseInt(sl_ul.data('shift')) || 0;
            if(Math.abs(currLeft) == (sl_lis.length-1)*100){
                return false;
            }
            var value = currLeft - 100;

            sl_ul.animate({
                marginLeft: value + '%'
            }, 400, function(){
                sl_ul.data('shift', value);
                enableButtons();
                if(typeof cb == 'function'){
                    cb();
                }
            });

        };

        var slideRight = function(cb){
            var currLeft = parseInt(sl_ul.data('shift'));
            if(currLeft == 0){
                return;
            }
            var value = currLeft + 100;
            sl_ul.animate({
                marginLeft: value + '%'
            }, 400, function(){
                sl_ul.data('shift', value);
                enableButtons();
                if(typeof cb == 'function'){
                    cb();
                }
            });
        };

        goL.on('click', function(){
            if($(this).hasClass('disabled')){return;}
            slideRight(function(){

            });
        });
        goR.on('click', function(){
            if($(this).hasClass('disabled')){return;}
            slideLeft(function(){

            });
        });

        sl_ul.width(sl_lis.length * 100 +'%');
        sl_lis.width(100 / sl_lis.length +'%');
        enableButtons();
    }
    CF.initMainSlider = initMainSlider;

    //user

    function initUserObject(){
        var userBtn = $('#userObject');
        userBtn.off('click').on('click', function(){

            CF.getTemplate('login_modal', function(res){
                if(res == 'ERROR'){
                    console.warn('Cant find template');
                }else{
                    var loginTpl = res;
                    bootbox.dialog({
                        title: 'Авторизация',
                        message: loginTpl,
                        buttons: {
                            success: {
                                className: '',
                                label: 'Войти',
                                callback: function(){
                                    var login = $('#login');
                                    var password = $('#password');
                                    CF.validField(login);
                                    CF.validField(password);
                                    if(!CF.validator.notEmpty(login.val()) || !CF.validator.notEmpty(password.val())){
                                        if(!CF.validator.notEmpty(login.val())){
                                            toastr['error']('Заполните поле Логин');
                                            CF.invalidField(login);
                                        }
                                        if(!CF.validator.notEmpty(password.val())){
                                            toastr['error']('Заполните поле Пароль');
                                            CF.invalidField(password);
                                        }
                                        return false;
                                    }else{
                                        CF.sendQuery({
                                            command: 'operation',
                                            object: 'login',
                                            params: {
                                                login: login.val(),
                                                password: password.val()
                                            }
                                        }, function(res){
                                            toastr[res.toastr.type](res.toastr.message);
                                        });
                                    }
                                }
                            },
                            error:{
                                className: '',
                                label: 'Отмена',
                                callback: function(){

                                }
                            }
                        }
                    });
                }
            });
        });
        var logoutBtn = $('#userLogout');
        logoutBtn.off('click').on('click', function(){
            logout();
        });
    }
    CF.initUserObject = initUserObject;

    //registration

    function initRegistration(){
        var confirm_reg = $('#confirm_registration');
        var form_wrapper = $('#form-registration');

        function notifyInvalid(control){
            var label = control.data('title');
            var isRequired = control.data('required');
            if(isRequired){
                CF.invalidField(control);
                toastr['error']('Некорректно заполнено поле '+ label);
                return 1;
            }else{
                return 0;
            }

        }

        confirm_reg.off('click').on('click', function(){
            var formValid = 0;
            var fields = [];
            for(var i=0; i<form_wrapper.find('.fc-field').length; i++){
                var control = form_wrapper.find('.fc-field').eq(i);
                var serverName = control.data('server_name');
                var editor = control.data('editor');
                var val = undefined;
                var val2 = undefined;

                CF.validField(control);

                switch (editor){
                    case 'text':
                        val = control.val();
                        if(!CF.validator.text(val)){
                            formValid += notifyInvalid(control);

                        }else{
                            fields.push({
                                name: serverName,
                                val: val
                            });
                        }
                        break;
                    case 'number':
                        val = control.val();
                        if(!CF.validator.float(val)){
                            formValid += notifyInvalid(control);
                        }else{
                            fields.push({
                                name: serverName,
                                val: val
                            });
                        }
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
                        if(!CF.validator.date(val)){
                            formValid += notifyInvalid(control);
                        }else{
                            fields.push({
                                name: serverName,
                                val: val
                            });
                        }
                        break;
                    case 'phone':
                        val = control.val();
                        if(!CF.validator.notEmpty(val)){
                            formValid += notifyInvalid(control);
                        }else{
                            fields.push({
                                name: serverName,
                                val: val
                            });
                        }
                        break;
                    case 'email':
                        val = control.val();
                        if(!CF.validator.email(val)){
                            formValid += notifyInvalid(control);
                        }else{
                            fields.push({
                                name: serverName,
                                val: val
                            });
                        }
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

            if(formValid == 0){

                console.log(fields);
                var pass = '';
                var c_pass = '';
                for(var p in fields){
                    var f = fields[p];
                    if(f.name == 'password'){
                        pass = f.val;
                    }
                    if(f.name == 'confirm_password'){
                        c_pass = f.val;
                    }
                }

                if(pass != c_pass){
                    var pasElem = form_wrapper.find('.fc-field[data-server_name="password"]');
                    var c_pasElem = form_wrapper.find('.fc-field[data-server_name="confirm_password"]');
                    CF.invalidField(pasElem);
                    CF.invalidField(c_pasElem);
                    pasElem.val('');
                    c_pasElem.val('');
                    toastr['error']('Пароли не совпадают');
                    return;
                }

                var params = {};
                for(var i in fields){
                    var fld = fields[i];
                    params[fld.name] = fld.val;
                }

                CF.sendQuery({
                    command: 'operation',
                    object: 'register_user',
                    params: params
                }, function(res){
                    console.log(res);
                    if(res.toastr){
                        toastr[res.toastr.type](res.toastr.message);
                    }
                });
            }
        });
    }
    CF.initRegistration = initRegistration;

    //edit profile
    function initEditProfile(){
        var editProfile = $('.edit_profile_field');

        editProfile.off('click').on('click', function(){
            var parent = $(this).parents('.fc-parent');
            var tpl = '<form class="form-horizontal"><div class="row">'+
                        '<div class="col-md-12">'+
                            '<div class="form-group col-md-12">'+
                                '<label>{{field_name}}:</label>'+
                                '{{{field_control}}}'+
                            '</div>'+
                        '</div>'+
                    '</form>';

            var obj = {
                field_name: parent.data('title'),
                field_control: CF.getControl(parent.data('editor'), parent.data('value'))
            };

            bootbox.dialog({
                title: 'Редактировать',
                message: Mustache.to_html(tpl, obj),
                buttons: {
                    success:{
                        label: 'Сохранить',
                        callback: function(){

                        }
                    },
                    error:{
                        label: 'Отмена',
                        callback: function(){

                        }
                    }
                }
            })

        });
    }
    CF.initEditProfile = initEditProfile;

    //order avent part
    function initOrderEventPart(){
        var orderBtn = $('.order-event-part');


        orderBtn.off('click').on('click', function(){
            var event = $(this).data('event');
            var event_part = $(this).data('event_part');
            var event_part_id = $(this).data('event_part_id');

            var event_html = '<p class="form-control-static">'+event+'</p>';
            var event_part_html = '<p class="form-control-static">'+event_part+'</p>';

            var obj = {
                event: event_html,
                event_part: event_part_html,
                results: CF.getResultsByEventPart(event_part_id)
            };

            CF.getTemplate('order_event_part', function(res){
                bootbox.dialog({
                    title: 'Подать заявку',
                    message: ' '+Mustache.to_html(res, obj),
                    buttons:{
                        success: {
                            label: 'Отправить',
                            callback: function(){
                                CF.sendQuery({
                                    command: 'operation',
                                    object: 'order_event_part',
                                    params: {
                                        flds: 'flds'
                                    }
                                }, function(res){
                                    toastr[res.toastr.type](res.toastr.message);
                                });
                            }
                        },
                        error: {
                            label: 'Отмена',
                            callback: function(){

                            }
                        }
                    }
                });
            });



        });
    }
    CF.initOrderEventPart = initOrderEventPart;
}());






