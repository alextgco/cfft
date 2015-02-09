(function(){

    /*
    * fonts
    * icons
    * порядок вывода
    * выводить год
    * Зал
    * */

    var RP_ticketSales_init = function(callback){
        var toastr = undefined;
        var RP = {};
        var tempHost = document.location.href;

        RP.templates = {
            actions: $('#actions_tpl'),
            zones: $('#priceZones_tpl'),
            hall: $('#renderHallTpl')
        };
        RP.blocks = {
            wrapper: $('#RP-wrapper'),
            boxForActions: $('#box-for-actions'),
            boxForHall: $('#box-for-hall')
        };
        RP.Core = {};
//        RP.Core.sendQuery = function(options, callback) {
//            if ((options != null) && typeof options === "object" && (options.command != null)) {
//                if (options.sid == null) {
//                    options.sid = MB.User.sid;
//                }
//                if (location.hash === "#show_log") {
//                    options.hash = location.hash;
//                }
//            }
//            return socketQuery(options, function(result) {
//                var JSONstring, key, key2, key3, key4, key5, res, ress, userInfo, value, value2, value3, _ref, _ref1, _ref2;
//                res = JSON.parse(result);
//                ress = {};
//                if (res.results != null) {
//                    if (res.results[0].data != null) {
//                        _ref = res.results[0];
//                        for (key in _ref) {
//                            value = _ref[key];
//                            switch (key) {
//                                case "data":
//                                    ress.DATA = value;
//                                    break;
//                                case "data_columns":
//                                    ress.NAMES = value;
//                                    break;
//                                case "data_info":
//                                    ress.INFO = {
//                                        ROWS_COUNT: value.rows_count,
//                                        VIEW_NAME: value.view_name
//                                    };
//                                    break;
//                                case "extra_data":
//                                    _ref1 = res.results[0][key];
//                                    for (key2 in _ref1) {
//                                        value2 = _ref1[key2];
//                                        if (key2 === "object_profile") {
//                                            ress.OBJECT_PROFILE = {};
//                                            for (key3 in value2) {
//                                                value3 = value2[key3];
//                                                key4 = key3.toUpperCase();
//                                                if (key3 === "prepare_insert" || key3 === "rmb_menu") {
//                                                    ress.OBJECT_PROFILE[key4] = {
//                                                        DATA: value3.data,
//                                                        NAMES: value3.data_columns
//                                                    };
//                                                } else {
//                                                    ress.OBJECT_PROFILE[key4] = value3;
//                                                }
//                                            }
//                                        } else {
//                                            key5 = key2.toUpperCase();
//                                            ress[key5] = value2;
//                                        }
//                                    }
//                            }
//                        }
//                    } else {
//                        _ref2 = res.results[0];
//                        for (key in _ref2) {
//                            value = _ref2[key];
//                            key2 = key.toUpperCase();
//                            switch (key) {
//                                case "toastr":
//                                    ress.TOAST_TYPE = value.type;
//                                    ress.MESSAGE = value.message;
//                                    ress.TITLE = value.title;
//                                    break;
//                                case "code":
//                                    ress.RC = value;
//                                    break;
//                                default:
//                                    ress[key2] = value;
//                            }
//                        }
//                    }
//                }
//                console.log(ress);
//                if (ress.RC != null) {
//                    debugger;
//                    if (parseInt(ress.RC) === 0) {
//                        if (ress.TICKET_PACK_USER_INFO) {
//                            JSONstring = ress.TICKET_PACK_USER_INFO;
//                            userInfo = new userInfoClass({
//                                JSONstring: JSONstring
//                            }).userInfo_Refresh();
//                        }
//                        if (typeof callback === "function") {
//                            return callback(ress);
//                        }
//                    } else if (parseInt(ress.RC) === -2) {
//                        if (toastr !== undefined) {
//                            toastr[ress.TOAST_TYPE](ress.MESSAGE);
//                        } else {
//                            console.warn("Ваша сессия не актульна, зайдите на сайт пожалуйста заново, MB.Core.sendQuery");
//                        }
//                        return setTimeout((function() {
//                            $.removeCookie("sid");
//                            return document.location.href = "login.html";
//                        }), 3000);
//                    } else {
//                        if (typeof callback === "function") {
//                            return callback(ress);
//                        }
//                    }
//                } else {
//                    if (typeof callback === "function") {
//                        return callback(ress);
//                    }
//                }
//            });
//        };

        RP.data = undefined;
        RP.getActions = function(callback){
            var o = {
                command: 'get_action_active_web'
                //sid: MB.User.sid          // shit goes here!
            };
            MB.Core.sendQuery(o, function(res){
                RP.data = res;
                if(typeof callback == 'function'){
                    callback(res);
                }
            });
        };
        RP.getHallData = function(callback){

        };
        RP.renderActions = function(){
            var data = RP.data;
            var nextBtn = false;
            var names = {
                name: data.NAMES.indexOf('NAME'),
                day: data.NAMES.indexOf('ACTION_DATE_TIME'),
                mth: data.NAMES.indexOf('ACTION_DATE_TIME'),
                action_id: data.NAMES.indexOf('ACTION_ID'),
                hall: data.NAMES.indexOf('HALL'),
                img: data.NAMES.indexOf('ACTION_POSTER_IMAGE'),
                time: data.NAMES.indexOf('TIME')
            };
            var musObj = {
                actions: []
            };
            var dec67 = 6;

            for(var i=0; i< data.DATA.length; i++){

                var part;
                var item = data.DATA[i];
                var tmpObj;
                if(i == 0){
                    part = {};
                    musObj.actions.push(part);
                    musObj.actions[0].items = [];
                }
                if( i!=0 && i%dec67 == 0 && nextBtn == false){ //
                    tmpObj = {
                        isNext: 'nextBtnClass',
                        isBack: ''
                    };

                    if(i!=0){
                        i--;
                    }
                    nextBtn = true;
                    if(i!=0){
                        musObj.actions[musObj.actions.length-1].items.push(tmpObj);
                    }

                    part = {};
                    musObj.actions.push(part);
                    musObj.actions[musObj.actions.length-1].items = [];

                    tmpObj = {
                        isNext: '',
                        isBack: 'backBtnClass'
                    };
                    musObj.actions[musObj.actions.length-1].items.push(tmpObj);


                    continue;
                }else{
                    tmpObj = {
                        name: item[names.name],
                        day: RP.revertDateString(item[names.day]).day +'.'+ RP.revertDateString(item[names.mth]).mthNum,
                        mth: RP.revertDateString(item[names.mth]).mth,
                        action_id: item[names.action_id],
                        hall: item[names.hall],
                        img: (item[names.img] !== "")? '../upload/'+item[names.img]: '../upload/default.jpg',
                        time: item[names.time],
                        isNext: '',
                        isBack: ''
                    };

                    musObj.actions[musObj.actions.length-1].items.push(tmpObj);
                    nextBtn = false;
                }
                if(i == 7){
                    dec67 = 6;
                }
            }
            //musObj.actions[0].items.splice(0,1);
            var replaced = RP.replaceActions(musObj);
            //replaced = RP.replaceActions(replaced);
            RP.blocks.boxForHall.html('').hide(0);
            RP.blocks.boxForActions.html(Mustache.to_html(RP.templates.actions.html(), replaced));
            RP.blocks.boxForActions.show(0);
            RP.blocks.wrapper.find('.actions_wagon').eq(0).addClass('active');
            RP.setHandlers();
        };
        RP.renderHall = function(action_id){

            var zoomBtn = '<div id="zoom-wrapper">' +
                            '<div id="zoom-in">+</div>'+
                            '<div id="zoom-out">-</div>'+
                          '</div>';

            var moveBtn = '<div id="move-wrapper">' +
                            '<div id="move-top">top</div>'+
                            '<div id="move-right">right</div>'+
                            '<div id="move-bottom">bottom</div>'+
                            '<div id="move-left">left</div>'+
                          '</div>';
            var backBtn = '<div id="backToAfisha">Вернуться к афише</div>';

            function insertHtml(callback){
                RP.blocks.boxForActions.html('');
                RP.blocks.boxForHall.html(RP.templates.hall.html());
                RP.blocks.boxForHall.find('#box_for_multibooker_frame').data('action_id', action_id);
                RP.blocks.boxForHall.show(0);
                if(typeof callback == 'function'){
                    callback();
                }
            }
            insertHtml(function(){
                RP.blocks.boxForHall.append(zoomBtn);
                RP.blocks.boxForHall.append(moveBtn);
                RP.blocks.boxForHall.append(backBtn);
                $.getScript(tempHost+"assets/map/multibooker.frame_init.js", function(){
                    RP.setHallHandlers();
                });
            });
        };
        RP.setHallHandlers = function(){
            var backBtn = $('#backToAfisha');
            backBtn.on('click', function(){
                //RP.getActions(function(data){
                    RP.renderActions();
                //});
            });
        };
        RP.replaceActions = function(obj){
            var inc = 0;
            for(var i = 1; i< obj.actions.length; i++){
                var item = obj.actions[i];
                obj.actions[i-1].items.splice(obj.actions[i-1].items.length-1, 0, item.items[1]);
                item.items.splice(1,1);
                inc++;
            }
            return obj;
        };
        RP.setHandlers = function(){
            $('.nextBtnClass').on('click', function(){
                var wagon = $(this).parents('.actions_wagon');
                var nextWagon = wagon.next();
                wagon.removeClass('active');
                nextWagon.addClass('active');
            });

            $('.backBtnClass').on('click', function(){
                var wagon = $(this).parents('.actions_wagon');
                var prevWagon = wagon.prev();
                wagon.removeClass('active');
                prevWagon.addClass('active');
            });

            $('.actions_list li').on('click', function(){
                var action_id = $(this).data('action_id');
                if(action_id && action_id != ""){
                    RP.renderHall(action_id);
                }
            });
        };
        RP.revertDateString = function(str){
            function revert(dayMthStr){
                var months = ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'];
                var result = {};
                result.day = (dayMthStr.substr(0,2).substr(0,1) == "0")? dayMthStr.substr(1,1): dayMthStr.substr(0,2);
                result.mth = months[(+dayMthStr.substr(3,2))-1];

                return result;
            }
            str = (typeof str == 'string')? str : '';
            return {
                day: revert(str.substr(0, 5)).day,
                mth: revert(str.substr(0, 5)).mth,
                year: '`'+str.substr(8,2),
                mthNum: str.substr(3,2)
            };
        };

        if(typeof callback == 'function'){
            callback(RP);
        }
    };

    $(document).ready(function(){
        RP_ticketSales_init(function(RP){
            RP.getActions(function(data){
                RP.renderActions();
            });

        });
    });

}());
