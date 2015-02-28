var sendQuery = function (obj, cb) {
    if (typeof obj.params=="object"){
        obj.params = JSON.stringify(obj.params);
    }
    $.ajax({
        url: "/api",
        method: "POST",
        data: obj,
        complete: function (res) {
            console.log('complete', res);

        },
        statusCode: {
            200: function (result) {
                console.log('200', result);
                cb(result);
            },
            403: function (result) {
                console.log('200', result);
                cb(result);
            }
        }
    });
};
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


        $('input.select2, input.select2').each(function(idx, elem){
            var $elem = $(elem);
            if($elem.parents('.filterWrapper').length > 0){
                return;
            }
            var name = $elem.data('name');
            $elem.select2({
                query: function(query){
                    var data = {results: []};

                    var o = {
                        command: 'get',
                        object: $elem.data('table'),
                        params: {
                            where: {}
                        }
                    };
                    if(query.term.length > 0){
                        o.params.where[name] = '*'+query.term+'*';
                    }


                    sendQuery(o, function(res){
                        for(var i in res.data){
                            var item = res.data[i];
                            data.results.push({
                                id: item.id,
                                text: item[name]
                            });
                        }

                        console.log(res);

                        query.callback(data);
                    });
                },
                initSelection: function(element, callback){
                    var data = {id: element.val(), text: $(element).data('text')};
                    callback(data);
                }
            });

            if($elem.data('server_name') == "gender_id"){
                var userPhotoWrapper = $('.user-photo-wrapper');
                var userPhotoImg = userPhotoWrapper.find('img');

                $elem.off('change').on('change', function(){
                    var userPhotoInput = $('input.fc-field[data-server_name="photo"]');
                    var val = $(this).select2('data').id;

                    if(userPhotoInput.val() == ''){
                        if(val == 1){
                            userPhotoImg.attr('src', 'img/user_default_m.jpg');
                        }else if(val == 2){
                            userPhotoImg.attr('src', 'img/user_default_f.jpg');
                        }else{
                            userPhotoImg.attr('src', 'img/user_default_m.jpg');
                        }
                    }
                });
            }

        });

        var cf_text_editors = $('.cf_text_editor');
        for(var i=0; i<cf_text_editors.length; i++){
            var te = cf_text_editors.eq(i)[0];
            var val = $(te).attr('value');
            CKEDITOR.replace(te);
            CKEDITOR.instances[$(te).attr('id')].setData(val);
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

        //type == true (COLLAPSE)
        //type == false (EXPAND)
        function collapseBlock(wrapper, type, cb){
            var content = wrapper.find('.collapseContent');
            console.log(content);
            if(type){
                content.hide(0);
            }else{
                content.show(0);
            }
            if(typeof cb == 'function'){
                cb();
            }
        }


        $('.collapseBtn').off('click').on('click', function(){
            var parent = $(this).parents('.collapseable');
            var $self = $(this);
            if($(this).hasClass('collapsed')){
                collapseBlock(parent, false, function(){
                    $self.html('<div class="fa fa-minus"></div> Свернуть').removeClass('collapsed');
                });
            }else{
                collapseBlock(parent, true, function(){
                    $self.html('<div class="fa fa-plus"></div> Развернуть').addClass('collapsed');
                });
            }
        });

    }());


    CF.initMainSlider();
    CF.initUserObject();
    CF.initRegistration();
    CF.initEditProfile();
    CF.initOrderEventPart();
    CF.initMainWow();
    //CF.initLeaderBoard();
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
        var userBtn = $('.goToLogin');
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
                if(control.attr('type') == 'hidden'){
                    console.log(control.parents('.form-group').eq(0).find('div.select2.fc-field').eq(0));
                    CF.invalidField(control.parents('.form-group').eq(0).find('div.select2.fc-field').eq(0));
                }else{
                    CF.invalidField(control);
                }
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

                        if(!CF.validator.text(val2)){
                            formValid += notifyInvalid(control);
                        }else{
                            fields.push({
                                name: serverName,
                                val: val
                            });
                        }
                        break;
                    case 'date':
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

            console.log(fields);

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
            var _t = this;

            bootbox.dialog({
                title: 'Подать заявку',
                message: $(_t).find('.modal-order-content').html(),
                buttons:{
                    success: {
                        label: 'Отправить',
                        callback: function(){
                            var wrapper = $('.modal-body .order-event-part-result-row[data-part="'+event_part_id+'"]');
                            var resultsWrapper = wrapper.find('.results');
                            var resType = resultsWrapper.data('res_type');
                            var resTypeId = resultsWrapper.data("res_type_id");
                            var video = wrapper.find('[data-id="video"]').val();
                            var isAff = wrapper.find('[data-id="isAff"]')[0].checked;
                            var concatRes = '';

                            var o = {
                                command: 'addOrder',
                                object: 'results',
                                params: {
                                    action_part_id: event_part_id,
                                    video_url: video,
                                    result_type_id: resTypeId,
                                    result_type: resType,
                                    isAff: (isAff)? 1:0
                                }
                            };

                            switch(resType){
                                case 'TIME':
                                    var mm = resultsWrapper.find('[data-id="mm"]').val();
                                    var ss = resultsWrapper.find('[data-id="ss"]').val();
                                    concatRes = mm+':'+ss;
                                    o.params['result_min'] = mm;
                                    o.params['result_sec'] = ss;
                                    break;
                                case 'REPEAT':
                                    var rep = resultsWrapper.find('[data-id="repeat"]').val();
                                    concatRes = rep;
                                    o.params['result_repeat'] = rep;
                                    break;
                                case 'TIE_BREAK':
                                    var tb1 = resultsWrapper.find('[data-id="tb1"]').val();
                                    var tb2 = resultsWrapper.find('[data-id="tb2"]').val();
                                    var tb3 = resultsWrapper.find('[data-id="tb3"]').val();
                                    var tb4 = resultsWrapper.find('[data-id="tb4"]').val();
                                    concatRes = tb1+'('+tb2+'('+tb3+':'+tb4+'))';

                                    o.params['result_approach'] = tb1;
                                    o.params['result_repeat'] = tb2;
                                    o.params['result_min'] = tb3;
                                    o.params['result_sec'] = tb4;

                                    break;
                                case 'TIE_BREAK_SHORT':
                                    var tbs1 = resultsWrapper.find('[data-id="tbs1"]').val();
                                    var tbs2 = resultsWrapper.find('[data-id="tbs2"]').val();
                                    var tbs3 = resultsWrapper.find('[data-id="tbs3"]').val();
                                    concatRes = tbs1+'('+tbs2+':'+tbs3+')';

                                    o.params['result_repeat'] = tbs1;
                                    o.params['result_min'] = tbs2;
                                    o.params['result_sec'] = tbs3;

                                    break;
                                default:
                                    break;
                            }


                            console.log(o);
                            sendQuery(o, function(res){
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
    }
    CF.initOrderEventPart = initOrderEventPart;

    function initBackTimer(){
        if($('.nearrest-wow-event-wrapper').length == 0){
            return;
        }
        var toDate = $('.nearrest-wow-event-wrapper').data('to_date'); //2015-03-08 19:30
        var y = parseInt(toDate.substr(0,4));
        var m = parseInt(toDate.substr(5,2));
        var d = parseInt(toDate.substr(8,2));
        var h = parseInt(toDate.substr(11,2));
        var min = parseInt(toDate.substr(14,2));

        //console.log(y, m-1, d, h, min, new Date(y, m-1, d, h, min));

        if(new Date(y,m-1,d) < new Date()){
            $('.nearresr-wow-timer-init').html('<div class="white">Wod of week проходит прямо сейчас, спешите принять участие!</div><hr>');
            $('.t_tblc').remove();
        }else{
            $('.nearresr-wow-timer-init').countdown({until: new Date(y,m-1,d)});//h, min
        }



    }
    CF.initBackTimer = initBackTimer;

    function initMainWow(){
        function getDayMth(date){
            var y = date.substr(0,4);
            var m = date.substr(5,2);
            var d = date.substr(8,2);
            return d+'.'+m;
        }

        var o = {
            command: 'get',
            object: 'action',
            params: {
                where: {
                    action_types: {
                        sys_name: 'WOD_OF_WEEK'
                    },
                    action_statuses: {
                        sys_name: 'OPENED'
                    }
                },
                sort: 'date_start',
                limit: 1
            }
        };

        var wowWrapper = $('.nearrest-wow-event-wrapper');
        var header = $('.nearrest-wow-title');
        var start = wowWrapper.find('.date-start');
        var end = wowWrapper.find('.date-end');
        var short = wowWrapper.find('.nearrest-wow-exercises');

        sendQuery(o, function(res){
            var data = res.data;
            if(data.length > 0){
                data = data[0];
                console.log('DDDDD', data.date_start);

                start.html(getDayMth(data.date_start));
                end.html(getDayMth(data.date_end));
                wowWrapper.data('to_date', data.date_start);
                header.html(data.title);
                short.html(data.description2);
                CF.initBackTimer();
            }
            console.log(data);
        });
    };
    CF.initMainWow = initMainWow;

    function initLeaderBoard(){
        var fo = {
            command: 'get',
            object: 'user',
            params: {
                where: {
                    gender: 'famale'
                }
            }
        };

        var mo = {
            command: 'get',
            object: 'user',
            params: {
                where: {
                    gender: 'male'
                }
            }
        };

        sendQuery(fo, function(res){
            var data = res.data;
            console.log('famale', data);
        });

        sendQuery(mo, function(res){
            var data = res.data;
            console.log('male', data);
        });
    };
    //CF.initLeaderBoard = initLeaderBoard;
}());






