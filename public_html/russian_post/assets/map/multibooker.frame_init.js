var box,agent_percent,host,frame,iFrameLegend_position,rules_path;

$(document).ready(function(){
    jQuery.support.cors = true;
    var name,socket_host,my_warning;
    //var warning = $("#box_for_multibooker_frame").data('warning') || "";
    var sending_obj = {};
    box = $("#box_for_multibooker_frame");
    host = box.data('host');
    var frame = box.data('frame');
    var action_id = box.data('action_id');
    sending_obj.isWithBasket = false;
    //var agent_additional_cost = 0;
    sending_obj.box = box;
    sending_obj.host = host;
    sending_obj.frame = frame;
    sending_obj.test = 'TEST';

    (function(){

        $.getScript(host+"assets/js/no_select.js");
        $.getScript(host+"assets/js/plugins/mustache.js");
        $.getScript(host+"socket.io/socket.io.js",function(){
            $.getScript(host+"assets/js/libs/jquery/plugins/jquery.mousewheel.min.js");

            $.getScript(host+"iFrame/core.js",function(){
                var o = {
                    command:"get_sale_site_settings",
                    params:{
                        FRAME:frame
                    }
                };

                var hiddenFeeObj = {
                    command:'get_action_data',
                    params: {
                        sec: 'hJTfcBpKXVhMqsVrLMGLFqxsFlDTZyYt',
                        action_id: box.data('action_id')
                    }
                };
                socketQuery(hiddenFeeObj, function(res){
                    res = JSON.parse(res);
                    sending_obj.service_fee = res.results[0].data[0][res.results[0].data_columns.indexOf('SERVICE_FEE')];
                    console.log('Sending obj', res, sending_obj.service_fee);
                });

                socketQuery(o,function(result){
                    console.log('HHH', result);
                    var data = JSON.parse(result);
                    if (data['results'][0].code && +data['results'][0].code!==0){
                        box.html('<div style="position: relative; top:49%;height: 49%;"><h2>Сервис временно не доступен</h2></div> ');
                        return;
                    }
                    var obj = jsonToObj(data['results'][0]);
                    obj = obj[0];
                    var name = box.data('name') || obj.NAME;
                    //var socket_host = box.data('socket_host') || obj.SOCKET_HOST;
                    //my_warning = box.data('warning') || obj.WARNING_CONTENT || my_warning;
                    sending_obj.warning = obj.WARNING_CONTENT || '';
                    sending_obj.agent_percent = obj.AGENT_PRICE_MARGIN_PERCENT || 0;

                    var iFrameLegend_position = 'left';//obj.INFOBOX_POSITION || obj.SOCKET_HOST || "left";
                    sending_obj.iFrameLegend_position = iFrameLegend_position.toLocaleLowerCase();
                    sending_obj.rules_path = obj.RULES_PDF_PATH || "rules.pdf";
                    sending_obj.bgColor = obj.BG_COLOR || box.data('bgColor') || "#f7f7f7";
                    sending_obj.nav_height = (obj.NAVIGATOR_HEIGHT!='')?obj.NAVIGATOR_HEIGHT:undefined;
                    sending_obj.nav_width = (obj.NAVIGATOR_WIDTH!='')?obj.NAVIGATOR_WIDTH:undefined;
                    var confirmBtnText = (sending_obj.isWithBasket)? 'В корзину':'Оплатить';

                    box.html('<div id="action_web">' +
                        '            <div class="otParent iFrameParent" id="otParent">' +
                        '            <div class="otContent iFrameContent">' +
                        '                <p class="greyLabel">Выбрано билетов:&nbsp;<span class="blackLabel" id="ticketsSelected">12</span></p>' +
                        '                <p class="greyLabel">На сумму:&nbsp;<span class="blackLabel" id="ticketsTotal">9800</span>&nbsp;руб.</p>' +
                        '                <p class="greyLabel">Сервисный сбор:&nbsp;<span class="blackLabel" id="serviceFee">0</span>&nbsp;руб.</p>' +
                        '                <p class="greyLabel">Итого:&nbsp;<span class="blackLabel" id="totalPrice">0</span>&nbsp;руб.</p>' +
                        '              </div>' +
                        '            <div class="otButtons iFrameButtons" id="toPay">' +
                        '            <div class="btn btn-default newStyle">'+confirmBtnText+'</div>' +
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
                        '            <div id="iFrameLegend" class="iFrameParent '+sending_obj.iFrameLegend_position+'">' +
                        '                <div id="iFrameLegendContent" class="iFrameContent">' +
                        '                    <div class="iFrameHeadline">Легенда мест:</div>' +
                        '                    <ul id="iFrameLegendList">' +
                        '                    </ul>' +
                        '                </div>' +
                        '            </div>' +
                        '                        <div id="box_for_action_web"></div>' +
                        '        </div>' +
                        '<div style="display:none;">' +
                        '            <form method="POST" action="https://secure.acquiropay.com/" id="FormPay"></form>' +
                        '        </div>');


                    sending_obj.isTerminal = true;

                    if (document.all && !document.addEventListener){
                        /// IE 8-
                        $.getScript(host+"assets/js/mapIE.js",function(){
                            $.getScript(host+"iFrame/iFrameIE.js",function(){
                                iFrame_init(sending_obj);
                            });
                        });
                    }else{
                        $.getScript(host+"assets/js/map.js",function(){

                            $.getScript(host+"iFrame/iFrame.js",function(){
                                iFrame_init(sending_obj);
                            });
                        });
                    }
                });
            });
            $.getScript(host+"assets/js/selector.js");
        });
        $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: host+'iFrame/iFrame.css'
        }).appendTo('head');
        $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: host+'assets/css/map.css'
        }).appendTo('head');
    })();

});



