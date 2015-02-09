var globalIsIe8, box, agent_percent, host, frame, iFrameLegend_position, rules_path,action_web123;
jQuery(document).ready(function () {
    jQuery.support.cors = true;
    if (document.all && !document.addEventListener) {
        return;
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) {
                    return i;
                }
            }
            return -1;
        }
    }
//        if(document.all && !document.addEventListener){
//            document.getElementById('box-for-multibooker-widget').innerHTML = "<div id='oldIe-wrapper' style='padding-top: 30px;'>У вас устаревший internet explorer, установите нормальнй браузер, ссылки: <a href='https://www.google.ru/intl/ru/chrome/browser/'>Google chrome</a>, <a href='https://www.mozilla.org/ru/firefox/new/'>Mozilla Firefox</a>, <a href='http://www.opera.com/ru/computer/windows'>Opera</a></div>";
//            return false;
//        }
    var boxContainer = $('#box-for-multibooker-widget');
    var aWrapper = $('#box_for_multibooker_afisha');
    var fWrapper = $('#box_for_multibooker_frame');
    box = fWrapper;
    var params = {
        actions: (boxContainer.data('actions').toString().indexOf(',') > -1) ? boxContainer.data('actions').split(',') : boxContainer.data('actions'),
        isBasket: (boxContainer.data('isbasket') != "") ? boxContainer.data('isbasket') : false,
        ticketPass: (boxContainer.data('ticketpass') != "") ? boxContainer.data('ticketpass') : false,
        isTerminal: (boxContainer.data('isterminal') != "") ? !!boxContainer.data('isterminal') : false,
        frame: boxContainer.data('frame'),
        host: boxContainer.data('host')
    };
    var templates = {
        ticketPassTpl: '{{#zones}}<div class="row wp-zone-item" data-id="{{id}}"><div class="col-md-12"><label>{{zoneName}} - {{price}} - {{max}}</label><input type="number" min="0" max="{{max}}" class="form-control orderCount"/></div></div>{{/zones}}',
        afisha: '<ul>{{#actions}}<li data-action_id="{{action_id}}">{{name}}, {{day}} {{mth}} {{time}}; {{hall}}<div style="display: none;" class="freePlaceCount">Свободных мест: {{freePlaceCount}}</div></li>{{/actions}}</ul>', //{{image}}
        terminalAfisha: '<div id="action_container">{{#actions}}<div class="actions_wagon"><ul class="actions_list">{{#items}}<li data-action_id="{{action_id}}" class="{{isNext}} {{isBack}}"><div class="img"><img src="{{img}}" /></div><div class="title">{{name}}</div><div class="hall">{{hall}}</div><div class="time">{{time}}</div><div class="day">{{day}}</div><div class="nextText">Смотреть далее...</div><div class="backText">Назад</div></li>{{/items}}</ul></div>{{/actions}}</div>'
    };

    (function () {

        function parseDateTime(str) {
            return {
                day: function () {
                    return str.substr(0, 2);
                },
                mth: function () {
                    var mths = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
                    var mthIndex = (str.substr(3, 1) == '0') ? str.substr(4, 1) : str.substr(3, 2);
                    return mths[+mthIndex - 1];
                },
                time: function () {
                    return str.substr(11);
                }
            };
        }
        function validateInpVal(val, max) {
            var reg = new RegExp('\^[0-9]+\$');
            return (reg.test(val)) ? (+val <= +max) : false;
        }
        function replaceDayMth(str) {
            var day = str.substr(0, 2),
                mth = str.substr(3, 2),
                year = str.substr(6, 4);
            return mth + '/' + day + '/' + year;
        }
        function afterScriptsLoaded() {
            var MW = {};
            MW.actions = undefined;
            MW.ticketPassAction = undefined;
            MW.fromDate = undefined;
            MW.toDate = undefined;

            MW.getActions = function (callback) {
                var whereStr = function () {
                    var str = '';
                    for (var i = 0; i < params.actions.length; i++) {
                        if (i == params.actions.length - 1) {
                            str += 'ACTION_ID = ' + params.actions[i];
                        } else {
                            str += 'ACTION_ID = ' + params.actions[i] + ' || ';
                        }
                    }
                    return str;
                };
                var o = {
                    command: 'get_action_active_web',
                    action_id: boxContainer.data('actions')
                };
                socketQuery(o, function (res) {
                    res = JSON.parse(res);
                    MW.actions = res;
                    if (typeof callback == 'function') {
                        callback(res);
                    }
                });
            };
            MW.filterActionsByDates = function () {
                var actionsToShow = [];
                if (!MW.fromDate || !MW.toDate) {
                    aWrapper.find('li').show(0);
                    return;
                } else {
                    for (var i in MW.actions.results[0].data) {
                        var act = MW.actions.results[0].data[i];
                        var act_date = new Date(act[MW.actions.results[0].data_columns.indexOf('ACTION_DATE')]);
                        if (act_date >= MW.fromDate && act_date <= MW.toDate) {
                            actionsToShow.push(act[MW.actions.results[0].data_columns.indexOf('ACTION_ID')]);
                        }
                    }
                }
                aWrapper.find('li').hide(0);
                for (var l = 0; l < aWrapper.find('li').length; l++) {
                    var li = aWrapper.find('li').eq(l);
                    if ($.inArray(li.data('action_id').toString(), actionsToShow) > -1) {
                        li.show(0);
                    }
                }
            };
            MW.renderActions = function (callback) {
                var names = {
                    action_id: MW.actions.results[0].data_columns.indexOf("ACTION_ID"),
                    name: MW.actions.results[0].data_columns.indexOf("NAME"),
                    date_time: MW.actions.results[0].data_columns.indexOf("ACTION_DATE_TIME"),
                    hall: MW.actions.results[0].data_columns.indexOf("HALL"),
                    image: MW.actions.results[0].data_columns.indexOf("ACTION_POSTER_IMAGE"),
                    free_place_count: MW.actions.results[0].data_columns.indexOf("FREE_PLACE_COUNT")
                };

                function getFreePlaceCount(action_id) {

                }

                var mObj = {
                    actions: []
                };
                MW.actions.results[0].data.reverse();
                for (var i in MW.actions.results[0].data) {
                    var item = MW.actions.results[0].data[i];
                    var tmpbj = {
                        action_id: item[names.action_id],
                        name: item[names.name],
                        hall: item[names.hall],
                        image: item[names.image],
                        day: parseDateTime(item[names.date_time]).day(),
                        mth: parseDateTime(item[names.date_time]).mth(),
                        time: parseDateTime(item[names.date_time]).time(),
                        freePlaceCount: item[names.free_place_count]
                    };
                    mObj.actions.push(tmpbj);
                }

                var tplType = undefined;

                if (params.ticketPass) {
                    if (params.isTerminal == true) {
                        tplType = templates.terminalAfisha;
                    } else {
                        tplType = templates.afisha;
                    }
                    var firstDate = MW.actions.results[0].data[0][names.date_time].substr(0, 10);
                    var fifthDate = undefined;
                    if (MW.actions.results.length >= 6) {
                        fifthDate = MW.actions.results[0].data[5][names.date_time].substr(0, 10);
                    } else {
                        fifthDate = MW.actions.results[0].data[MW.actions.results.length - 1][names.date_time].substr(0, 10);
                    }

                    var dateRangeHtml = '<div class="input-daterange input-group" id="ticketPassDateRange"><input value="' + firstDate + '" type="text" class="input-sm form-control" name="start" /><span class="input-group-addon">по</span><input value="' + fifthDate + '" type="text" class="input-sm form-control" name="end" /></div>';
                    aWrapper.html(dateRangeHtml + Mustache.to_html(tplType, mObj));
                    $('#ticketPassDateRange').datepicker({
                        format: "dd/mm/yyyy",
                        todayBtn: "linked",
                        language: "ru",
                        autoclose: true,
                        todayHighlight: true
                    });
                    if (MW.actions.results[0].data.length <= 5) {
                        $('#ticketPassDateRange').hide(0);
                    }
                    MW.filterActionsByDates();
                    aWrapper.find('li').hide(0);
                    for (var l = 0; l < 6; l++) {
                        var li = aWrapper.find('li').eq(l);
                        li.show(0);
                    }
                } else {
                    if (params.isTerminal == true) {
                        tplType = templates.terminalAfisha;
                    } else {
                        tplType = templates.afisha;
                    }
                    aWrapper.html(Mustache.to_html(tplType, mObj));
                }
                if (typeof callback == 'function') {
                    callback();
                }
            };
            MW.renderActionsTerminal = function (callback) {
                var names = {
                    name: MW.actions.results[0].data_columns.indexOf('NAME'),
                    day: MW.actions.results[0].data_columns.indexOf('ACTION_DATE_TIME'),
                    mth: MW.actions.results[0].data_columns.indexOf('ACTION_DATE_TIME'),
                    action_id: MW.actions.results[0].data_columns.indexOf('ACTION_ID'),
                    hall: MW.actions.results[0].data_columns.indexOf('HALL'),
                    img: MW.actions.results[0].data_columns.indexOf('ACTION_POSTER_IMAGE'),
                    time: MW.actions.results[0].data_columns.indexOf('TIME')
                };
                var musObj = {
                    actions: []
                };
                var flatArray = [];
                var increment = 0;

                fWrapper.html('');
                aWrapper.html('').show(0);
                for (var i = 0; i < MW.actions.results[0].data.length; i++) {
                    var item = MW.actions.results[0].data[i];
                    var tmpObj;
                    if (increment <= 7) {
                        if (increment == 7) {
                            tmpObj = {
                                isNext: 'nextBtnClass',
                                isBack: ''
                            };
                            i--;
                        } else {
                            tmpObj = {
                                name: item[names.name],
                                day: parseDateTime(item[names.day]).day(),
                                mth: parseDateTime(item[names.day]).mth(),
                                action_id: item[names.action_id],
                                hall: item[names.hall],
                                img: (item[names.img] !== "") ? params.host + 'upload/' + item[names.img] : params.host + 'upload/default.jpg',
                                time: item[names.time],
                                isNext: '',
                                isBack: ''
                            };
                        }
                    } else {
                        if (increment % 8 == 0) {
                            tmpObj = {
                                isNext: '',
                                isBack: 'backBtnClass'
                            };
                            i--;
                        } else if ((increment + 1) % 8 == 0) {
                            tmpObj = {
                                isNext: 'nextBtnClass',
                                isBack: ''
                            };
                            i--;
                        } else {
                            tmpObj = {
                                name: item[names.name],
                                day: parseDateTime(item[names.day]).day(),
                                mth: parseDateTime(item[names.day]).mth(),
                                action_id: item[names.action_id],
                                hall: item[names.hall],
                                img: (item[names.img] !== "") ? params.host + 'upload/' + item[names.img] : params.host + 'upload/default.jpg',
                                time: item[names.time],
                                isNext: '',
                                isBack: ''
                            };
                        }
                    }
                    flatArray.push(tmpObj);
                    increment++;


                    // splice musObj.actions by eight-items blocks to render;


                    continue;

//                        var part;
//                        var item = MW.actions.results[0].data[i];
//                        var tmpObj;
//                        if(i == 0){
//                            part = {};
//                            musObj.actions.push(part);
//                            musObj.actions[0].items = [];
//                        }
//                        if( i!=0 && i%dec67 == 0 && nextBtn == false){ //
//                            tmpObj = {
//                                isNext: 'nextBtnClass',
//                                isBack: ''
//                            };
//
//                            if(i!=0){
//                                i--;
//                            }
//                            nextBtn = true;
//                            if(i!=0){
//                                musObj.actions[musObj.actions.length-1].items.push(tmpObj);
//                            }
//
//                            part = {};
//                            musObj.actions.push(part);
//                            musObj.actions[musObj.actions.length-1].items = [];
//
//                            tmpObj = {
//                                isNext: '',
//                                isBack: 'backBtnClass'
//                            };
//                            musObj.actions[musObj.actions.length-1].items.push(tmpObj);
//                            continue;
//                        }else{
//                            tmpObj = {
//                                name: item[names.name],
//                                day: parseDateTime(item[names.day]).day(),
//                                mth: parseDateTime(item[names.day]).mth(),
//                                action_id: item[names.action_id],
//                                hall: item[names.hall],
//                                img: (item[names.img] !== "")? params.host+'upload/'+item[names.img]: params.host+'upload/default.jpg',
//                                time: item[names.time],
//                                isNext: '',
//                                isBack: ''
//                            };
//
//                            musObj.actions[musObj.actions.length-1].items.push(tmpObj);
//                            nextBtn = false;
//                        }
//                        if(i >= 7){
//                            dec67 = 6;
//                        }
                }

                function getEight(start) {
                    var res = [];
                    for (var s = start; s < flatArray.length; s++) {
                        res.push(flatArray[s]);
                        if (s - start == 7 || s == flatArray.length - 1) {
                            return res;
                        }
                    }
                }

                for (var f in flatArray) {
                    if (f == 0 || f % 8 == 0) {
                        var part = {
                            items: getEight(f)
                        };
                        musObj.actions.push(part);
                    }
                }

                aWrapper.html(Mustache.to_html(templates.terminalAfisha, musObj));
                MW.setHandlers();
                if (typeof callback == 'function') {
                    callback();
                }
            };
            MW.getAreaGroupsByAction = function (id, callback) {
                socketQuery({
                    command: "get_action_area_group",
                    params: {
                        action_id: id,
                        frame: params.frame
                    }
                }, function (res) {
                    callback(id, res);
                });
            };
            MW.renderHall = function (id, callback) {
                var sending_obj = {};
                fWrapper.data('action_id', id);
                sending_obj.isWithBasket = params.isBasket;
                sending_obj.box = fWrapper;
                sending_obj.host = params.host;
                sending_obj.frame = params.frame;
                sending_obj.test = 'TEST';


                var o = {
                    command: "get_sale_frame_settings",
                    params: {
                        FRAME: params.frame
                    }
                };

                socketQuery(o, function (result) {
                    var data = JSON.parse(result);
                    if (data['results'][0].code && +data['results'][0].code !== 0) {
                        fWrapper.html('<div style="position: relative; top:49%;height: 49%;"><h2>Сервис временно не доступен</h2></div> ');
                        return;
                    }
                    var obj = jsonToObj(data['results'][0]);
                    obj = obj[0];
                    var name = boxContainer.data('name') || obj.NAME;
                    sending_obj.warning = obj.WARNING_CONTENT || '';
                    sending_obj.agent_percent = obj.AGENT_PRICE_MARGIN_PERCENT || 0;
                    var iFrameLegend_position = obj.INFOBOX_POSITION || obj.SOCKET_HOST || "left";
                    sending_obj.iFrameLegend_position = iFrameLegend_position.toLocaleLowerCase();
                    sending_obj.rules_path = obj.RULES_PDF_PATH || "rules.pdf";
                    sending_obj.bgColor = obj.BG_COLOR || boxContainer.data('bgColor') || "#f7f7f7";
                    sending_obj.nav_height = (obj.NAVIGATOR_HEIGHT != '') ? obj.NAVIGATOR_HEIGHT : undefined;
                    sending_obj.nav_width = (obj.NAVIGATOR_WIDTH != '') ? obj.NAVIGATOR_WIDTH : undefined;
                    var confirmBtnText = (sending_obj.isWithBasket) ? 'В корзину' : 'Оплатить';

                    fWrapper.html('<div id="action_web">' +
                        '            <div class="otParent iFrameParent" id="otParent">' +
                        '            <div class="otContent iFrameContent">' +
                        '                <p class="greyLabel">Выбрано билетов:&nbsp;<span class="blackLabel" id="ticketsSelected">12</span></p>' +
                        '                <p class="greyLabel">На сумму:&nbsp;<span class="blackLabel" id="ticketsTotal">9800</span>&nbsp;руб.</p>' +
                        '                <p class="greyLabel">Сервисный сбор:&nbsp;<span class="blackLabel" id="serviceFee">0</span>&nbsp;руб.</p>' +
                        '                <p class="greyLabel">Итого:&nbsp;<span class="blackLabel" id="totalPrice">0</span>&nbsp;руб.</p>' +
                        '              </div>' +
                        '            <div class="otButtons iFrameButtons" id="toPay">' +
                        '            <div class="btn btn-default newStyle">' + confirmBtnText + '</div>' +
                        '            </div>' +
                        '        </div>' +
                        '          ' +
                        '            <div id="iFrameAlert" class="iFrameParent">' +
                        '                <div id="iFrameAlertContent" class="iFrameContent">' +
                        '                   <p></p>' +
                        '                </div>' +
                        '                <div class="iFrameButtons">' +
                        '                    <div class="btn btn-default newStyle" id="iFrameAlertConfirm">Ок</div>' +
                        '                    <div class="btn btn-default newStyle" id="iFrameAlertCancel">Отмена</div>' +
                        '                </div>' +
                        '            </div>' +
                        '            <div id="iFrameLegend" class="iFrameParent ' + sending_obj.iFrameLegend_position + '">' +
                        '                <div id="iFrameLegendContent" class="iFrameContent">' +
                        '                    <div class="iFrameHeadline">Легенда мест:</div>' +
                        '                    <ul id="iFrameLegendList">' +
                        '                    </ul>' +
                        '                </div>' +
                        '            </div>' +
                        '                        <div id="box_for_action_web"></div>' +
                        '        </div>' +
                        '       <div style="display:none;">' +
                        '            <form method="POST" action="https://secure.acquiropay.com/" id="FormPay"></form>' +
                        '        </div>');


                    if (document.all && !document.addEventListener) {
                        /// IE 8-
                        $.getScript(params.host + "assets/js/mapIE.js", function () {
                            $.getScript(params.host + "iFrame/iFrameIE.js", function () {
                                action_web = iFrame_init(sending_obj);
                            });
                        });
                    } else {
                        $.getScript(params.host + "assets/js/map.js", function () {
                            $.getScript(params.host + "iFrame/iFrame.js", function () {
                                action_web123 = iFrame_init(sending_obj);
                                setTimeout(function () {
                                    // TODO переделать этот костыль. Размер блока не определен на момент запуска скрипта, поэтому ждем.)
                                    //action_web = iFrame_init(sending_obj);
                                    window.sss = sending_obj;
                                }, 2000);
                            });
                        });
                    }
                });

                if (typeof callback == 'function') {
                    callback();
                }
            };
            MW.renderHallTerminal = function (id, callback) {
                var sending_obj = {};
                fWrapper.data('action_id', id);
                sending_obj.isWithBasket = params.isBasket;
                sending_obj.box = fWrapper;
                sending_obj.host = params.host;
                sending_obj.frame = params.frame;
                sending_obj.test = 'TEST';

                aWrapper.hide(0);

                var o = {
                    command: "get_sale_frame_settings",
                    params: {
                        FRAME: params.frame
                    }
                };

                socketQuery(o, function (result) {
                    var data = JSON.parse(result);
                    if (data['results'][0].code && +data['results'][0].code !== 0) {
                        fWrapper.html('<div style="position: relative; top:49%;height: 49%;"><h2>Сервис временно не доступен</h2></div> ');
                        return;
                    }
                    var obj = jsonToObj(data['results'][0]);
                    obj = obj[0];
                    var name = boxContainer.data('name') || obj.NAME;
                    sending_obj.isTerminal = true;
                    sending_obj.warning = obj.WARNING_CONTENT || '';
                    sending_obj.agent_percent = obj.AGENT_PRICE_MARGIN_PERCENT || 0;
                    var iFrameLegend_position = obj.INFOBOX_POSITION || obj.SOCKET_HOST || "left";
                    sending_obj.iFrameLegend_position = (params.isTerminal) ? 'left' : iFrameLegend_position.toLocaleLowerCase();
                    sending_obj.rules_path = obj.RULES_PDF_PATH || "rules.pdf";
                    sending_obj.bgColor = obj.BG_COLOR || boxContainer.data('bgColor') || "#f7f7f7";
                    sending_obj.nav_height = (obj.NAVIGATOR_HEIGHT != '') ? obj.NAVIGATOR_HEIGHT : undefined;
                    sending_obj.nav_width = (obj.NAVIGATOR_WIDTH != '') ? obj.NAVIGATOR_WIDTH : undefined;
                    var confirmBtnText = (sending_obj.isWithBasket) ? 'В корзину' : 'Оплатить';

                    fWrapper.html('<div id="action_web">' +
                        '            <div class="otParent iFrameParent" id="otParent">' +
                        '            <div class="otContent iFrameContent">' +
                        '                <p class="greyLabel">Выбрано билетов:&nbsp;<span class="blackLabel" id="ticketsSelected">12</span></p>' +
                        '                <p class="greyLabel">На сумму:&nbsp;<span class="blackLabel" id="ticketsTotal">9800</span>&nbsp;руб.</p>' +
                        '                <p class="greyLabel">Сервисный сбор:&nbsp;<span class="blackLabel" id="serviceFee">0</span>&nbsp;руб.</p>' +
                        '                <p class="greyLabel">Итого:&nbsp;<span class="blackLabel" id="totalPrice">0</span>&nbsp;руб.</p>' +
                        '              </div>' +
                        '            <div class="otButtons iFrameButtons" id="toPay">' +
                        '            <div class="btn btn-default newStyle">' + confirmBtnText + '</div>' +
                        '            </div>' +
                        '        </div>' +
                        '          ' +
                        '            <div id="iFrameAlert" class="iFrameParent">' +
                        '                <div id="iFrameAlertContent" class="iFrameContent">' +
                        '                   <p></p>' +
                        '                </div>' +
                        '                <div class="iFrameButtons">' +
                        '                    <div class="btn btn-default newStyle" id="iFrameAlertConfirm">Ок</div>' +
                        '                    <div class="btn btn-default newStyle" id="iFrameAlertCancel">Отмена</div>' +
                        '                </div>' +
                        '            </div>' +
                        '            <div id="iFrameLegend" class="iFrameParent ' + sending_obj.iFrameLegend_position + '">' +
                        '                <div id="iFrameLegendContent" class="iFrameContent">' +
                        '                    <div class="iFrameHeadline">Легенда мест:</div>' +
                        '                    <ul id="iFrameLegendList">' +
                        '                    </ul>' +
                        '                </div>' +
                        '            </div>' +
                        '                        <div id="box_for_action_web"></div>' +
                        '        </div>' +
                        '       <div style="display:none;">' +
                        '            <form method="POST" action="https://secure.acquiropay.com/" id="FormPay"></form>' +
                        '        </div>');

                    if (document.all && !document.addEventListener) {
                        $.getScript(params.host + "assets/js/map.js", function () {
                            $.getScript(params.host + "iFrame/iFrame.js", function () {
                                action_web = iFrame_init(sending_obj);
                            });
                        });
                        return;
                        /// IE 8-
                        $.getScript(params.host + "assets/js/mapIE.js", function () {
                            $.getScript(params.host + "iFrame/iFrameIE.js", function () {
                                //console.log('1SS', sending_obj);


                                action_web = iFrame_init(sending_obj);
                            });
                        });
                    } else {
                        $.getScript(params.host + "assets/js/map.js", function () {
                            $.getScript(params.host + "iFrame/iFrame.js", function () {
                                action_web = iFrame_init(sending_obj);
                            });
                        });
                    }


                });

                if (typeof callback == 'function') {
                    callback();
                }
            };
            MW.renderTicketPass = function (id, callback) {
                var mo = {zones: []};
                var tpl = '{{#zones}}<div class="zoneRow" data-action_date="{{action_date}}" data-action_name="{{action_name}}" data-action_id="{{action_id}}" data-zone_id="{{id}}" data-name="{{name}}" data-price="{{price}}"><div class="name">{{name}}</div><div class="info">Осталось&nbsp;<span class="hightlight">{{max}}</span>&nbsp;билетов&nbsp;по&nbsp;<span class="hightlight">{{price}}</span>&nbsp;руб.</div>Укажите количество билетов: <input type="number" min="0" max="{{max}}" class="count" value="{{value}}" /></div>{{/zones}}<div class="disabled" id="confirmTicketPassOrder">Купить</div>';
                var o = {
                    command: "get_action_scheme_ticket_zone",
                    params: {
                        action_id: id
                    }
                };
                socketQuery(o, function (res) {
                    //console.log('im action', JSON.parse(res));
                    function getStoredValueByIds(act_id, zone_id) {
                        var ls = (JSON.parse(localStorage.getItem('ticketPass')) !== null) ? JSON.parse(localStorage.getItem('ticketPass')) : undefined;
                        if (ls == undefined) {
                            return 0;
                        } else {
                            for (var i in ls.actions) {
                                var act = ls.actions[i];
                                if (act.id = act_id) {
                                    for (var k in act.zones) {
                                        var zone = act.zones[k];
                                        if (zone.id == zone_id) {
                                            return zone.count;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    res = JSON.parse(res);
                    MW.ticketPassAction = res;
                    var data = res.results[0].data;
                    var names = res.results[0].data_columns;
                    for (var i in data) {
                        if (+data[i][names.indexOf('FREE_TICKET_COUNT')] == 0) {
                            continue;
                        }
                        var to = {
                            action_id: data[i][names.indexOf('ACTION_ID')],
                            action_name: res.results[0].extra_data['ACTION'],
                            action_date: res.results[0].extra_data['ACTION_DATE_TIME'],
                            id: data[i][names.indexOf('ACTION_SCHEME_TICKET_ZONE_ID')],
                            name: data[i][names.indexOf('NAME')],
                            max: data[i][names.indexOf('FREE_TICKET_COUNT')],
                            price: data[i][names.indexOf('TICKET_PRICE')],
                            value: getStoredValueByIds(data[i][names.indexOf('ACTION_ID')], data[i][names.indexOf('ACTION_SCHEME_TICKET_ZONE_ID')])
                        };
                        mo.zones.push(to);
                    }
                    fWrapper.html(Mustache.to_html(tpl, mo));

                    var rulesHtml = '<div id="rulesWrapper"><label><input type="checkbox" id="agreeRules"/>  Я Принимаю <a target="_blank" href="http://mirbileta.ru/rules/rules.pdf">условия пользовательского соглашения</a></label></div>';
                    $('#rulesWrapper').remove();
                    $('#box-for-multibooker-widget').append(rulesHtml);
                    $('#agreeRules').off('change').on('change', function () {
                        if (this.checked) {
                            $('#confirmTicketPassOrder').removeClass('disabled');
                        } else {
                            $('#confirmTicketPassOrder').addClass('disabled');
                        }
                    });

                    for (var k = 0; k < $(".zoneRow .count").length; k++) {
                        var inp = $(".zoneRow .count").eq(k);
                        inp.off('input').on('input', function () {
                            var obj = {
                                fromNumber: $(this).val(),
                                input: $(this)
                            };
                            if (validateInpVal($(this).val(), inp.attr('max'))) {
                                MW.storeTicketPassValue(obj);
                                MW.renderTicketPassOrder();
                            } else {
                                inp.val('').css('borderColor', 'red');
                                window.setTimeout(function () {
                                    inp.css('borderColor', '#cccccc');
                                }, 3000);
                            }
                        });
//                            inp.ionRangeSlider({
//                                min: 0,
//                                max: mo.zones[k].max,
//                                type: 'single',
//                                step: 1,
//                                postfix: " шт.",
//                                prettify: false,
//                                hasGrid: true,
//                                onFinish: function(obj){
//                                    console.log(obj);
//                                    MW.storeTicketPassValue(obj);
//                                    MW.renderTicketPassOrder();
//                                }
//                            });
                    }
                    MW.renderTicketPassOrder();
                    if (typeof callback == 'function') {
                        callback();
                    }
                });
            };
            MW.storeTicketPassValue = function (obj, rowObj) {
                var store = MW.getTickePassOrder();

                function getActionFromStorage(id) {
                    for (var i in store.actions) {
                        if (store.actions[i].id == id) {
                            return store.actions[i];
                        }
                    }
                }

                var action_id = obj.input.parent('.zoneRow').data('action_id');
                var action_date = obj.input.parent('.zoneRow').data('action_date');
                var action_name = obj.input.parent('.zoneRow').data('action_name');
                var zone_id = obj.input.parent('.zoneRow').data('zone_id');
                var name = obj.input.parent('.zoneRow').data('name');
                var price = obj.input.parent('.zoneRow').data('price');

                if (store.actions.length > 0) {
                    var isSameAction = false;
                    var isSameZone = false;
                    for (var i in store.actions) {
                        var act = store.actions[i];
                        if (act.id != action_id) {
                            continue;
                        } else {
                            isSameAction = true;
                            for (var k in act.zones) {
                                var zon = act.zones[k];
                                if (zon.id != zone_id) {
                                    continue;
                                } else {
                                    if (obj.fromNumber == 0) {
                                        act.zones.splice(k, 1);
                                        isSameZone = true;
                                    } else {
                                        zon.count = obj.fromNumber;
                                        isSameZone = true;
                                    }
                                }
                            }
                        }
                    }

                    if (!isSameAction) {
                        store.actions.push({
                            id: action_id,
                            name: action_name,
                            date: action_date,
                            zones: []
                        });
                    }

                    if (!isSameZone) {
                        getActionFromStorage(action_id).zones.push({
                            count: obj.fromNumber,
                            id: zone_id,
                            name: name,
                            price: price
                        });
                    }
                    localStorage.setItem('ticketPass', JSON.stringify(store));

                } else {
                    var ao = {
                        id: action_id,
                        name: action_name,
                        date: action_date,
                        zones: []
                    };
                    var zo = {
                        id: zone_id,
                        name: name,
                        price: price,
                        count: obj.fromNumber
                    };
                    ao.zones.push(zo);
                    store.actions.push(ao);
                    localStorage.setItem('ticketPass', JSON.stringify(store));
                }
                //console.log('asdsa', JSON.parse(localStorage.getItem('ticketPass')));
            };
            MW.getTickePassOrder = function () {
                var stored = undefined;
                if (!localStorage.getItem('ticketPass')) {
                    var structure = {
                        actions: []
                    };
                    localStorage.setItem('ticketPass', JSON.stringify(structure));
                }
                stored = JSON.parse(localStorage.getItem('ticketPass'));
                return stored;
            };
            MW.renderTicketPassOrder = function () {
                var data = MW.getTickePassOrder();
                var orderTpl = '<table id="orderOutput"><thead><th>Мероприятие</th><th>Зона</th><th>кол-во</th><th>Сервисный сбор</th><th>Цена</th><th>Сумма</th><th>&nbsp;</th></tr></thead>{{#rows}}<tr><td>{{action_name}} - {{action_date}}</td><td>{{zone}}</td><td>{{count}}</td><td>{{fee}}</td><td>{{price}}</td><td>{{totalRow}}</td><td><div data-zone_id="{{zone_id}}" data-action_id="{{action_id}}" class="removeItem">-</div></td></tr>{{/rows}}{{total}}</table>';
                var mo = {
                    rows: []
                };

                if (data.actions.length == 0) {
                    fWrapper.find('#orderOutput').remove();
                    return;
                }

                for (var i in data.actions) {
                    var act = data.actions[i];
                    for (var k in act.zones) {
                        var zo = {};
                        var zone = act.zones[k];
                        zo.action_name = act.name;
                        zo.action_date = act.date;
                        zo.zone = zone.name;
                        zo.zone_id = zone.id;
                        zo.action_id = act.id;
                        zo.count = zone.count;
                        zo.price = zone.price;
                        zo.fee = zone.price / 100 * 10; // hardcode
                        zo.totalRow = zone.count * (zone.price + (zone.price / 100 * 10));
                        mo.rows.push(zo);
                    }
                }
                fWrapper.find('#orderOutput').remove();
                fWrapper.append(Mustache.to_html(orderTpl, mo));

                $('.removeItem').off('click').on('click', function () {
                    var store = MW.getTickePassOrder();
                    var zone_id = $(this).data('zone_id');
                    var action_id = $(this).data('action_id');
                    for (var i in store.actions) {
                        var act = store.actions[i];
                        if (act.zones.length == 0) {
                            continue;
                        } else {
                            for (var k in act.zones) {
                                var zone = act.zones[k];
                                if (zone.id == zone_id) {
                                    zone.count = 0;
                                }
                            }
                        }
                        localStorage.setItem('ticketPass', JSON.stringify(store));
                        MW.renderTicketPassOrder();
                        MW.renderTicketPass();

                        $('#box_for_multibooker_afisha li[data-action_id="' + action_id + '"]').click();

                        // need to update rangeSlider!!!
                    }

                });
            };
            MW.toAcquiropay = function (result) {

//                    console.log(result);
//                    return;
                var values = {};
                //console.log('REULST BEF', result);
                var merchant_id = result['MERCHANT_ID'];
                var product_id = result['PRODUCT_ID'];
                values['merchant_id'] = merchant_id;
                values['product_id'] = product_id;
                values['amount'] = result['AMOUNT'];
                values['cf'] = result['ID'];
                values['cf2'] = result['CF2'];
                values['cf3'] = result['CF3'];
                values['params'] = params;

                values['cb_url'] = result['CB_URL']; //"http://81.200.5.254:888/cgi-bin/acqp_callback";
                values['ok_url'] = params.host + "iFrame/payment_ok.php?back=" + document.location.href;
                values['ko_url '] = params.host + "iFrame/payment_ko.html";


                //var t = merchant_id + product_id + values['amount'] + values['cf'] + secret_word;
                values['token'] = result['TOKEN'];

                var html = "";
                for (key in values) {

                    html += key + '<input type="text" name="' + key + '" value="' + values[key] + '" />';
                }
                //console.log('VALUES', values);
                //$(".POST").html(html);
                $('body').append('<form method="POST" action="https://secure.acquiropay.com/" id="FormPay" style="display: none;"></form>');
                $("#FormPay").html(html);
                $("#FormPay").submit();
            };
            MW.setHandlers = function () {
                var actions = aWrapper.find('li');
                actions.off('click').on('click', function () {
                    actions.removeClass('active');
                    $(this).addClass('active');
                    var action_Id = $(this).data('action_id');

                    if (params.ticketPass) {
                        MW.renderTicketPass(action_Id, function () {
                            $('#confirmTicketPassOrder').off('click').on('click', function () {
                                if ($(this).hasClass('disabled')) {
                                    return;
                                }
                                var orderObj = {
                                    command: "create_order_without_places",
                                    object: "",
                                    frame: params.frame
                                };
                                var inc = 1;
                                for (var i in MW.getTickePassOrder().actions) {
                                    var act = MW.getTickePassOrder().actions[i];
                                    if (act.zones.length == 0) {
                                        continue;
                                    } else {
                                        for (var k in act.zones) {
                                            var zone = act.zones[k];
                                            orderObj['action_scheme_ticket_zone_id_' + inc] = zone.id;
                                            orderObj['ticket_count_' + inc] = zone.count;
                                            inc++;
                                        }
                                    }
                                }
                                socketQuery(orderObj, function (result) {
                                    //console.log(result);
                                    var data = JSON.parse(result);
                                    if (data['results'][0].code && +data['results'][0].code !== 0) {

                                        alert(data['results'][0].toastr.message);
//
//                                            iAlert.alert(data['results'][0].toastr.message,function(){
//
//                                            });
                                        return;
                                    }
                                    MW.toAcquiropay(data['results'][0]);
                                });

                            });
                        });
                    } else if (params.isTerminal) {

                        MW.renderHallTerminal(action_Id, function () {

                        });
                    } else {
                        MW.renderHall(action_Id, function () {

                        });
                    }
                });
                if (!params.isTerminal) {
                    actions.eq(0).click();
                } else {
                    var tbs = {//terminal blocks
                        train: $('#action_container'),
                        vagons: $('.actions_wagon'),
                        nextBtn: $('.nextBtnClass'),
                        backBtn: $('.backBtnClass')
                    };

                    tbs.vagons.eq(0).addClass('activeVagon');
                    tbs.nextBtn.off('click').on('click', function () {
                        $('.actions_wagon.activeVagon').removeClass('activeVagon').next().addClass('activeVagon');
                    });
                    tbs.backBtn.off('click').on('click', function () {
                        $('.actions_wagon.activeVagon').removeClass('activeVagon').prev().addClass('activeVagon');
                    });
                    $(document).off('click', '#backToAfisha').on('click', '#backToAfisha', function () {
                        MW.renderActionsTerminal();
                    });
                }

                if ($('.input-daterange').length > 0) {
                    $('.input-daterange').datepicker().off('changeDate').on('changeDate', function (e) {
                        var inp = $(e.target);
                        var otherDate = '';
                        if (inp.attr('name').indexOf('start') > -1) {
                            otherDate = replaceDayMth(inp.parents('.input-daterange').find('input[name="end"]').val());
                            MW.fromDate = (new Date(e.date) == 'Invalid Date') ? undefined : new Date(e.date);
                            MW.toDate = (new Date(otherDate) == 'Invalid Date') ? unedfined : new Date(otherDate);
                        } else if (inp.attr('name').indexOf('end') > -1) {
                            otherDate = replaceDayMth(inp.parents('.input-daterange').find('input[name="start"]').val());
                            MW.fromDate = (new Date(otherDate) == 'Invalid Date') ? unedfined : new Date(otherDate);
                            MW.toDate = (new Date(e.date) == 'Invalid Date') ? unedfined : new Date(e.date);
                        }
                        MW.filterActionsByDates();
                    });
                }


            };


            MW.getAreaGroupsByAction(params.actions, function (id, res) {
                if ($("#areas_popup").length > 0) return;

                var result = (JSON.parse(res));
                console.log(result);
                if (result.type == "error") {
                    console.error("Error", result.message);
                    return;
                }
                var dataContainer = (JSON.parse(res)).results[0];

                console.log(dataContainer);

                var nameIndex = dataContainer.data_columns.indexOf("NAME");
                var actionIndex = dataContainer.data_columns.indexOf("ACTION_ID");
                var areaGroupIndex = dataContainer.data_columns.indexOf("AREA_GROUP_ID");
                if (dataContainer.data.length==0) return;
                var popupElement = $("<div id=\"areas_popup\"></div>");
                var selectElement = $("<select></select>");
                $.each(dataContainer.data, function (idx, areaData) {
                    var option = $("<option>" + areaData[nameIndex] + "</option>");
                    selectElement.append(option);
                });
                popupElement.css({
                    position: "absolute",
                    border: "1px solid red",
                    backgroundColor: "white",
                    zIndex: "20000",
                    left: "45%",
                    top: "45%",
                    width: "10%",
                    height: "10%"
                });
                popupElement.append(selectElement);
                $("body").append(popupElement);
                
                selectElement.on("change", function (idx, element) {
                    var o = {
                        command: "get_action_scheme",
                        params: {
                            action_id: id,
                            area_group_id:dataContainer.data[this.selectedIndex][areaGroupIndex],
                            frame: params.frame
                        }
                    };

                    //var action_web = window.GLOBAL_action_web;
                    action_web123.loadObj.params.area_group_id =  dataContainer.data[this.selectedIndex][areaGroupIndex];
                    action_web123.reLoad();
                    return;
                    action_web123.loadSquares(o, function () {
                        action_web123.setLayout(function () {
                            action_web123.setMinMax(function () {
                                action_web123.setScaleCoff(function () {
                                    action_web123.render(function () {
                                        action_web123.reLoadLayout(function () {

                                        });
                                    });
                                    action_web123.setEvents();
                                });
                            });
                        });
                    });
                });
            });
            MW.getActions(function (data) {
                MW.actions = data;
                if (params.isTerminal) {
                    MW.renderActionsTerminal(function () {
                        MW.setHandlers();
                    });
                } else if (params.ticketPass) {
                    MW.renderActions(function () {
                        MW.setHandlers();
                    });
                } else {
                    MW.renderActions(function () {
                        MW.setHandlers();
                    });
                }

            });
        }

        if (params.ticketPass) {
            $.getScript(params.host + "multibooker.widget/ion.rangeSlider-master/js/ion.rangeSlider.min.js");
            $.getScript(params.host + "multibooker.widget/eternicode-bootstrap-datepicker/js/bootstrap-datepicker.js", function () {
                $.getScript(params.host + "multibooker.widget/eternicode-bootstrap-datepicker/js/locales/bootstrap-datepicker.ru.js");
            });
        }

        $.getScript(params.host + "assets/js/no_select.js");
        $.getScript(params.host + "assets/js/plugins/mustache.js");
        $.getScript(params.host + "socket.io/socket.io.js", function () {
            $.getScript(params.host + "assets/js/libs/jquery/plugins/jquery.mousewheel.min.js");
            $.getScript(params.host + "iFrame/core.js", function () {
                afterScriptsLoaded();
            });
        });
        $.getScript(params.host + "assets/js/selector.js");
    })();

    $('<link/>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: params.host + 'iFrame/iFrame.css'
    }).appendTo('head');
    $('<link/>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: params.host + 'assets/css/map.css'
    }).appendTo('head');
    if (params.isTerminal) {
        $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: params.host + 'multibooker.widget/terminalStyle.css'
        }).appendTo('head');
    }
    if (params.ticketPass) {
        $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: params.host + 'multibooker.widget/ion.rangeSlider-master/css/ion.rangeSlider.css'
        }).appendTo('head');

        $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: params.host + 'multibooker.widget/eternicode-bootstrap-datepicker/css/datepicker.css'
        }).appendTo('head');

        $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: params.host + 'multibooker.widget/ion.rangeSlider-master/css/ion.rangeSlider.skinFlat.css'
        }).appendTo('head');

        $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: params.host + 'multibooker.widget/ticketPass.css'
        }).appendTo('head');
    }
});