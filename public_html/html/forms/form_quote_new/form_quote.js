(function () {

    var formID = MB.Forms.justLoadedId;
    var formInstance = MB.Forms.getForm('form_quote', formID);
    var modalInstance = MB.Core.modalWindows.windows.getWindow(formID);
    var formWrapper = $('#mw-'+formInstance.id);
    var tableID = formWrapper.find('.classicTableWrap').attr('data-id');
    var tableInstance = MB.Tables.getTable(tableID);

    var tableWrapper = $('.classicTableWrap-'+tableInstance.id);

    //parentObject: contentInstance,

    var agentrealizationaccess              = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("AGENT_REALIZATION_ACCESS")],
        countReservedTickets                = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_RESERVED_TICKETS")],
        countToPaytickets                   = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_TO_PAY_TICKETS")],
        countPaidTickets                    = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_PAID_TICKETS")],
        countOnRealizationTickets           = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_ON_REALIZATION_TICKETS")],
        countClosedTickets                  = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_CLOSED_TICKETS")],
        countClosedRealizationTicket        = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_CLOSED_REALIZATION_TICK")],
        countOnRealizationNotPrinted        = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_ON_REALIZ_NOTPRINTED")],
        order_status                        = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("STATUS")],
        order_status_ru                     = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("STATUS_RU")],
        countClosedRealizationNotPrinted    = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_CLOSED_REALIZ_NOTPRINTED")],
        notPrintedTicketsCount              = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("NOT_PRINTED_TICKETS_COUNT")],
        agentId                             = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("AGENT_ID")];


    var statusBlock = formWrapper.find('.order-status');
    var statusColors = [
        {
            status: 'TO_PAY',
            color: 'yellow'
        },
        {
            status: 'RETURNED_REALIZATION',
            color: 'red'
        },
        {
            status: 'RETURNED',
            color: 'red'
        },
        {
            status: 'RESERVED',
            color: 'yellow'
        },
        {
            status: 'PAYMENT_NOT_RETURN',
            color: 'red'
        },
        {
            status: 'PAID',
            color: 'green'
        },
        {
            status: 'ON_REALIZATION',
            color: 'blue'
        },
        {
            status: 'IN_PRINT',
            color: 'grey'
        },
        {
            status: 'DEFECTIVE',
            color: 'grey'
        },
        {
            status: 'CLOSED_REALIZATION',
            color: 'green'
        },
        {
            status: 'CLOSED',
            color: 'green'
        },
        {
            status: 'CANCELED',
            color: 'grey'
        }
    ];
    function setColorByStatus(){
        var statusS = order_status;
        for(var s in statusColors){
            var item = statusColors[s];
            if(statusS == item.status){
                statusBlock.addClass(item.color);
            }
        }
        statusBlock.html(order_status_ru);
    }
    setColorByStatus();

    var formTrain = formWrapper.find('.fn-train-overflow').fn_train();

    var confirmReserve = formWrapper.find('.confirmReserve');
    var reserveToDate = formWrapper.find('input.reserveToDate');
    reserveToDate.datetimepicker({
        format: "dd.mm.yyyy hh:ii",
        autoclose: true,
        todayHighlight: true,
        startDate: new Date,
        minuteStep: 10,
        keyboardNavigation: true,
        todayBtn: true,
        firstDay: 1,
        weekStart: 1,
        language: "ru"
    }).on('changeDate', function(e){
        var val = $(this).val();
        if(val == ''){
            confirmReserve.addClass('disabled');
        }else{
            confirmReserve.removeClass('disabled');
        }
    });
    reserveToDate.on('input', function(){
        var val = $(this).val();
        if(val == ''){
            confirmReserve.addClass('disabled');
        }else{
            confirmReserve.removeClass('disabled');
        }
    });
    confirmReserve.on('click', function(){
        if(!$(this).hasClass('disabled')){
            var o = {
                command: 'operation',
                object: 'set_reserved_date_to_ticket',
                params: {
                    order_id: formInstance.activeId,
                    reserv_date: reserveToDate.val()
                }
            };
            socketQuery(o, function(res){
                res = JSON.parse(res);
                var toastObj = res.results[0]['toastr'];
                toastr[toastObj['type']](toastObj['message']);
                tableInstance.reload();
            });
        }
    });

    var agentSelectId = formWrapper.find('.fn-control[data-column="AGENT_NAME"]').find('.select3-wrapper').attr('id');
    var agentSelect = MB.Core.select3.list.getSelect(agentSelectId);

    $(agentSelect).on('changeVal', function(e,was,now){
        buttons.init();
    });

    var buttons = {
        items: [
            {
                className: 'to_realization',
                disabled: function(){
                    var agentValue = agentSelect.value.id;
                    var agent = (agentId.length > 0)? agentId : (agentValue == "empty" || agentValue == "")? "" : agentValue;
                    return +countReservedTickets == 0 || agent == "";
                },
                callback: function(){
                    formInstance.save(function(){
                        formInstance.makeOperation('on_realization_from_reserved_order', function(){
                        });
                    });
                }
            },
            {
                className: 'back_realization',
                disabled: function(){
                    return +countOnRealizationTickets == 0;
                },
                callback: function(){
                    formInstance.makeOperation('return_realization_from_on_realization_order', function(){
                    });
                }
            },
            {
                className: 'close_realization',
                disabled: function(){
                    return +countOnRealizationTickets == 0;
                },
                callback: function(){
                    formInstance.makeOperation('close_realization_order', function(){
                    });
                }
            },
            {
                className: 'cancel_realization',
                disabled: function(){
                    return +countReservedTickets == 0;
                },
                callback: function(){
                    formInstance.makeOperation('cancel_order', function(){
                    });
                }
            },

            //on_realization_from_closed_realization_order

            {
                className: 'to_XML_for_concert_ru',
                disabled: function () {
                    return false;
                },

                callback: function () {
                    var o = {
                        output_format: "xml",
                        command: "get",
                        object: "export_quota_bazis",
                        sid: MB.User.sid,
                        params: {
                            order_id: formInstance.activeId
                        }
                    };
                    getFile({o: o, fileName: 'order_'+formInstance.activeId});
                }
            },
            {
                className: 'to_reports',
                disabled: function(){
                    return false;
                },
                callback: function(){
                    var elem = formWrapper.find('.'+this.className);
                    if(elem.hasClass('back')){
                        formTrain.slideRight(function(){
                            elem.removeClass('back').html('<i class="fa fa-ticket"></i>&nbsp;&nbsp;К билетам');
                        });
                    }else{
                        formTrain.slideLeft(function(){
                            elem.addClass('back').html('<i class="fa fa-arrow-left"></i>&nbsp;&nbsp;Назад');
                            //reports.init();
                        });
                    }
                }
            },
            {
                className: 'printBtn',
                disabled: function(){
                    return +notPrintedTicketsCount == 0;
                },
                callback: function(){
                    send('print_order',{
                        guid: MB.Core.getUserGuid(),
                        order_id: formInstance.activeId
                    },function(res){
                        console.log('print_order',res);
                        tableInstance.reload();
                        formInstance.reload();
                    });
                }
            }
        ],
        init: function(){
            for(var i in buttons.items){
                var btn = buttons.items[i];
                var elem = formWrapper.find('.'+btn.className);
                var disabledClass = (btn.disabled())? 'disabled': '';
                elem.removeClass('disabled').addClass(disabledClass);
                elem.off('click').on('click', function(){
                    if($(this).hasClass('disabled')){return;}
                    for(var k in buttons.items){
                        var cbBtn = buttons.items[k];
                        if($(this).attr('class').indexOf(cbBtn.className) != -1){
                            cbBtn.callback();
                        }
                    }
                });
            }
        }
    };
    buttons.init();

    console.log(modalInstance);

    $(modalInstance).off('resize').on('resize', function(){
        console.log(formInstance);
    });

    var reports = {
        loaded: false,
        init: function(){
            if(reports.loaded){

            }else{
                reports.getData(function(){
                    reports.populate(function(){
                        reports.setHandlers(function(){

                        });
                    });
                });
            }
        },
        getData: function(cb){
//            var o = {
//                command: 'get',
//                object: 'order_delivery_note',
//                params: {
//                    where: 'ORDER_ID='+formInstance.activeId
//                }
//            };
//
//            socketQuery(o, function(res){
//                res = JSON.parse(res)['results'][0];
//                reports.data = jsonToObj(res);
//                reports.mData = {
//                    list: [],
//                    lines: []
//                };
//                var iterator = 0;
//                for(var i in reports.data){
//                    reports.data[i]['tickets'] = [];
//                    reports.mData.list.push(reports.data[i]);
////
////                    var lineO = {
////                        command: 'get',
////                        object: 'order_delivery_note_line',
////                        params:{
////                            where: 'ORDER_DELIVERY_NOTE_ID='+reports.data[i]['ORDER_DELIVERY_NOTE_ID']
////                        }
////                    };
////
////                    socketQuery(lineO, function(innerRes){
////                        innerRes = jsonToObj(JSON.parse(innerRes)['results'][0]);
////                        for(var k in innerRes){
////                            reports.mData.lines.push(innerRes[k]);
////                        }
////                        iterator++;
////
////                        if(iterator == res.data.length -1){
////                            for(var j in reports.mData.lines){
////                                var line = reports.mData.lines[j];
////                                var noteId = line['ORDER_DELIVERY_NOTE_ID'];
////
////                                for(var d in reports.mData.list){
////                                    var id = reports.mData.list[d]['ORDER_DELIVERY_NOTE_ID'];
////                                    if(noteId == id){
////                                        reports.mData.list[d]['tickets'].push(line);
////                                    }
////                                }
////                            }
////                            reports.loaded = true;
////                            if(typeof cb == 'function'){
////                                cb();
////                            }
////                        }
////
////                    });
//                }
//
//            });

        },
        populate: function(cb){
            var container = formWrapper.find('.quota_reports_list');

            for(var v in reports.mData.list){
                var tickets = reports.mData.list[v]['tickets'];
                if(tickets.length == 0){
                    reports.mData.list[v]['disabled'] = 'disabled';
                }
            }

            var tpl = '{{#list}}' +
                            '<li class="del_note-item" data-id="{{ORDER_DELIVERY_NOTE_ID}}">' +
                                '<div class="del_note-item-info">' +
                                '{{DELIVERY_NOTE_TYPE_RU}} - ( {{DELIVERY_NOTE_DATE}} )' +
                                '<div class="del_note-show-inner-list {{disabled}}">Билеты&nbsp;&nbsp;<i class="fa fa-angle-down"></i></div>' +
                                '<div class="del_note-print-note"><i class="fa fa-print"></i>&nbsp;&nbsp;Печать</div></div>' +
                                ' <ul class="del_note-inner-list">' +
                                    '{{#tickets}}' +
                                        '<li data-id="{{ORDER_DELIVERY_NOTE_LINE_ID}}">{{LINE_WITH_TITLE}}  {{PLACE_WITH_TITLE}} ({{AREA_GROUP}})</li>' +
                                    '{{/tickets}}' +
                                '</ul>' +
                            '</li>' +
                        '{{/list}}';
            container.html(Mustache.to_html(tpl, reports.mData));

            console.log(reports.mData);

            if(typeof cb == 'function'){
                cb();
            }
        },
        setHandlers: function(cb){
            var container = formWrapper.find('.quota_reports_list');
            var items = container.find('.del_note-item');
            items.find('.del_note-show-inner-list').off('click').on('click', function(){
                if($(this).hasClass('disabled')){return;}
                var li = $(this).parents('.del_note-item').eq(0);
                var id = li.data('id');
                var lineO = {
                    command: 'get',
                    object: 'order_delivery_note_line',
                    params:{
                        where: 'ORDER_DELIVERY_NOTE_ID='+id
                    }
                };

                socketQuery(lineO, function(innerRes){
                    innerRes = jsonToObj(JSON.parse(innerRes)['results'][0]);
                    console.log(innerRes);
                });



                var ticketsList = li.find('.del_note-inner-list');
                if(li.hasClass('opened')){
                    ticketsList.hide();
                    li.removeClass('opened');
                }else{
                    ticketsList.show();
                    li.addClass('opened');
                }

            });


            if(typeof cb == 'function'){
                cb();
            }
        }
    };



    //$('<script type="text/html" src="/html/print_templates/' + $_GET['name'] + '.js"><//script>');

// ОТЧЕТЫ

//    var reportBtn = formWrapper.find('.reportBtn');
//    var reportDD = formWrapper.find('.reportBtn-dd');
//    reportBtn.on('click', function(){
//        if($(this).hasClass('disabled')){
//            return;
//        }
//        if($(this).hasClass('opened')){
//            reportDD.hide(100, function(){
//                reportBtn.removeClass('opened');
//            });
//        }else{
//            reportDD.show(100, function(){
//                reportBtn.addClass('opened');
//            });
//        }
//    });
//
//    var delivery_note2 = formWrapper.find('.delivery_note2_btn');
//    delivery_note2.off('click').on('click', function(){
//        var width = MB.Core.getClientWidth();
//        var height = MB.Core.getClientHeight()+50;
//        var get = "?sid="+MB.User.sid+"&ORDER_ID="+formInstance.activeId;
//        get+= "&subcommand=delivery_note_order";
//        var report_page = window.open( "html/report/print_report.html"+get,'new','width='+width+',height='+height+',toolbar=1');
//    });
//
//    var return_delivery_note = formWrapper.find('.return_delivery_note_btn');
//    return_delivery_note.off('click').on('click', function(){
//        var width = MB.Core.getClientWidth();
//        var height = MB.Core.getClientHeight()+50;
//        var get = "?sid="+MB.User.sid+"&ORDER_ID="+formInstance.activeId;
//        get+= "&subcommand=return_delivery_note";
//        var report_page = window.open("html/report/print_report.html"+get,'new','width='+width+',height='+height+',toolbar=1');
//    });

    return;

    var printBtn = formWrapper.find('.printBtn');
    printBtn.off('click').on('click', function(){
        if($(this).hasClass('disabled')){return;}
        send('print_order',{
            guid: MB.Core.getUserGuid(),
            order_id: formInstance.activeId
        },function(res){
            console.log('print_order',res);
            tableInstance.reload();
            formInstance.reload();
            //disableButtons();
        });
    });

    function disableButtons(){

//        agentrealizationaccess              = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("AGENT_REALIZATION_ACCESS")],
//        countReservedTickets                = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_RESERVED_TICKETS")],
//        countToPaytickets                   = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_TO_PAY_TICKETS")],
//        countPaidTickets                    = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_PAID_TICKETS")],
//        countOnRealizationTickets           = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_ON_REALIZATION_TICKETS")],
//        countClosedTickets                  = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_CLOSED_TICKETS")],
//        countClosedRealizationTicket        = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_CLOSED_REALIZATION_TICK")],
//        countOnRealizationNotPrinted        = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_ON_REALIZ_NOTPRINTED")],
//        order_status                        = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("STATUS")],
//        order_status_ru                     = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("STATUS_RU")],
//        countClosedRealizationNotPrinted    = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("COUNT_CLOSED_REALIZ_NOTPRINTED")];
//
//        reportBtn.addClass('disabled');
//        reportDD.hide(0);
//        printBtn.addClass('disabled');
//        formWrapper.find('#to_pay_order').addClass('disabled');
//        formWrapper.find('#cancel_order').addClass('disabled');
//        formWrapper.find('#return_order').addClass('disabled');
//        statusBlock.attr('class', 'order-status');
//        confirmDiscount.addClass('disabled');
//        //cardTypesWrapper.find('li').removeClass('disabled');
//
//        if(+countReservedTickets > 0){
//            formWrapper.find('#to_pay_order').removeClass('disabled');
//        }
//        if(+countReservedTickets > 0 || +countToPaytickets > 0){
//            formWrapper.find('#cancel_order').removeClass('disabled');
//        }
//        if(+countClosedTickets > 0 || +countOnRealizationTickets > 0  || +countClosedRealizationTicket > 0){
//            formWrapper.find('#return_order').removeClass('disabled');
//        }
//        if(formInstance.data.DATA[0][formInstance.data.NAMES.indexOf('STATUS')] !== 'CANCELED' && formInstance.data.DATA[0][formInstance.data.NAMES.indexOf('STATUS')] !== 'PAYMENT_NOT_RETURN'){
//            reportBtn.removeClass('disabled');
//        }
//        if(+countToPaytickets > 0){
//            printBtn.removeClass('disabled');
//            demoPrintBtn.removeClass('disabled');
//        }
//        statusBlock.attr('data-color', order_status).html(order_status_ru);
//        if(+countToPaytickets > 0 || +countReservedTickets > 0){
//            var intReg = new RegExp(/^\-?[0-9]+$/);
//            if(intReg.test(setDiscount.val())){
//                confirmDiscount.removeClass('disabled');
//            }
//        }
////        if(order_status == 'TO_PAY'){
////            cardTypesWrapper.find('li').addClass('disabled');
////        }
//        setColorByStatus();
    }
    disableButtons();


    formWrapper.find('#to_pay_order').off('click').on('click', function(){
        if($(this).hasClass('disabled')){return}
        formInstance.makeOperation('to_pay_order', function(){
            //disableButtons();
        });
    });

    formWrapper.find('#cancel_order').off('click').on('click', function(){
        if($(this).hasClass('disabled')){return}
        formInstance.makeOperation('cancel_order', function(){
            //disableButtons();
        });
    });

    formWrapper.find('#return_order').off('click').on('click', function(){
        if($(this).hasClass('disabled')){return}
        formInstance.makeOperation('return_order', function(){
            //disableButtons();
        });
    });

//    formWrapper.find('.quote1').off('click').on('click', function(){
//        if($(this).hasClass('disabled')){return}
//        formInstance.makeOperation('on_realization_order', function(){
//            //disableButtons();
//        });
//    });
//    formWrapper.find('.quote2').off('click').on('click', function(){
//        if($(this).hasClass('disabled')){return}
//        formInstance.makeOperation('on_realization_print_order', function(){
//            //disableButtons();
//        });
//    });
//    formWrapper.find('.quote3').off('click').on('click', function(){
//        if($(this).hasClass('disabled')){return}
//        formInstance.makeOperation('close_realization_order', function(){
//            //disableButtons();
//        });
//    });


    //-----------------------------------------------------------



}());
