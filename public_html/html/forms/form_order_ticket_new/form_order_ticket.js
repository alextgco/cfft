(function () {

    var modal = $('.mw-wrap').last();
    var formID = modal.attr('id').substr(3);
    var formInstance = MB.Forms.getForm('form_order_ticket', formID);
    var formWrapper = $('#mw-'+formInstance.id);

    formWrapper.find('.mw-save-form').hide(0);

    var barcode = formWrapper.find('.form-ro-barcode');
    barcode.html(DrawCode39Barcode(barcode.attr('data-barcode'),0));

    var ticketStatus = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf('STATUS')];
    var ticketPrintStatus = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf('PRINT_STATUS')];

    formInstance.lowerButtons = [
        {
            name: 'option3',
            title: 'Отменить билет',
            icon: 'fa-times',
            color: 'red',
            className: '',
            disabled: function(){
                return ticketStatus !== 'TO_PAY' && ticketStatus !== 'RESERVED';
            },
            callback: function(){
                formInstance.makeOperation('cancel_ticket');
            }
        },
        {
            name: 'option4',
            title: 'Вернуть билет',
            icon: 'fa-reply',
            color: 'blue',
            className: '',
            disabled: function(){
                return ticketStatus !== 'CLOSED' && ticketStatus !== 'ON_REALIZATION' && ticketStatus !== 'CLOSED_REALIZATION';
            },
            callback: function(){
                formInstance.makeOperation('return_ticket');
            }
        },
        {
            name: 'option5',
            title: 'Напечатать билет',
            icon: 'fa-print',
            color: 'green',
            className: '',
            disabled: function(){
                return ticketStatus !== 'TO_PAY' && ticketPrintStatus !== 'NOT_PRINTED';
            },
            callback: function(){
                send('print_ticket',{
                    guid: MB.Core.getUserGuid(),
                    ticket_id: formInstance.activeId
                },function(res){
                    console.log('print_ticket',res);
                    formInstance.reload();
                });
            }
        },
        {
            name: 'option2',
            title: 'Печать накладной',
            icon: 'fa-print',
            color: 'blue',
            className: '',
            disabled: function(){
                return false;
            },
            callback: function(){
                console.log(formInstance);
                var get = "?sid="+MB.User.sid+"&ACTIVE_ID="+formInstance.activeId+"&name="+formInstance.name;
                get+= "&subcommand=delivery_note_order";
                var iframe = $('<iframe style="width:0; height:0; overflow: hidden;" class="printIframe" src="html/forms/print_form.html'+get+'"></iframe>');
                iframe.appendTo('body');
            }
        },
        {
            name: 'option6',
            title: 'Забраковать бланк',
            icon: 'fa-trash-o',
            color: 'red',
            className: '',
            disabled: function(){
                if(ticketPrintStatus !== 'PRINTED'){
                    return true;
                }else{
                    if(ticketStatus !== 'CLOSED' && ticketStatus !== 'CLOSED_REALIZATION'){
                        return true;
                    }
                }
                return false;
            },
            callback: function(){
                formInstance.makeOperation('defect_blank');
            }
        },
        {
            name: 'option7',
            title: 'Забраковать билет',
            icon: 'fa-ticket',
            color: 'red',
            className: '',
            disabled: function(){
                return ticketStatus !== 'CLOSED' && ticketStatus !== 'PAID';
            },
            callback: function(){
                formInstance.makeOperation('defect_blank');
            }
        }
    ];


    return;
    var instance = MB.O.forms["form_order_ticket"];
    instance.custom = function (callback) {
        log(instance)
        var action_id            = instance.data.data[0][instance.data.names.indexOf("ACTION_ID")];
        var ticketstatus            = instance.data.data[0][instance.data.names.indexOf("STATUS")];
        var agentrealizationaccess  = instance.data.data[0][instance.data.names.indexOf("AGENT_REALIZATION_ACCESS")].bool();
        var ticketid                = instance.activeId;
        log(agentrealizationaccess);
        var buttons = {
            "payticket":{
                html: "<button type='button' id='btn_payticket' class='btn blue-stripe custombutton payticket'><i class='fa fa-credit-card'></i> К оплате</button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: "to_pay_ticket",
                        sid: MB.User.sid
                    };
                    o["ORDER_TICKET_ID"] = ticketid;
                    sendQueryForObj(o);
                },
                disabled: function (key, options) {
                    if (ticketstatus === "RESERVED") {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            "cancelticket":{
                html: "<button type='button' id='btn_cancelticket' class='btn red-stripe custombutton cancelticket'><i class='fa fa-credit-card'></i> Отменить билет</button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: "cancel_ticket",
                        sid: MB.User.sid
                    };
                    o["ORDER_TICKET_ID"] = ticketid;
                    sendQueryForObj(o);
                },
                disabled: function (key, options) {
                    if (ticketstatus === "RESERVED" || ticketstatus === "TO_PAY") {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            "returnticket":{
                html: "<button type='button' id='btn_returnticket' class='btn red-stripe custombutton returnticket'><i class='fa fa-credit-card'></i> Вернуть билет</button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: "return_ticket",
                        sid: MB.User.sid
                    };
                    o["ORDER_TICKET_ID"] = ticketid;
                    sendQueryForObj(o);
                },
                disabled: function (key, options) {
                    if (ticketstatus === "CLOSED" || ticketstatus === "CLOSED_REALIZATION" || ticketstatus === "REALIZATION") {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            "printticket":{
                html: "<button type='button' id='btn_printticket' class='btn green-stripe custombutton printticket'><i class='fa fa-credit-card'></i> Напечатать билет</button>",
                callback:function(){

                    send('print_ticket',{guid:MB.Core.getUserGuid(),ticket_id:ticketid},function(result){
                        instance.reload('data');

                    });

                    /*var o = {
                        command: "operation",
                        object: "print_ticket",
                        sid: MB.User.sid
                    };
                    o["ORDER_TICKET_ID"] = ticketid;
                    sendQueryForObj(o);*/
                },
                disabled: function (key, options) {
                    if (ticketstatus === "IN_PRINT" || ticketstatus === "TO_PAY" || ticketstatus === "PAID") {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            "defectblanck":{
                html: "<button type='button' id='btn_defectblanck' class='btn red-stripe custombutton defectblanck'><i class='fa fa-credit-card'></i> Забраковать бланк</button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: "defect_blank",
                        sid: MB.User.sid
                    };
                    o["ORDER_TICKET_ID"] = ticketid;
                    sendQueryForObj(o);
                },
                disabled: function (key, options) {
                    if (ticketstatus === "CLOSED" || ticketstatus === "CLOSED_REALIZATION" || ticketstatus === "REALIZATION") {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            "defectticket":{
                html: "<button type='button' id='btn_defectticket' class='btn red-stripe custombutton defectticket'><i class='fa fa-credit-card'></i> Забраковать билет</button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: "defect_ticket",
                        sid: MB.User.sid
                    };
                    o["ORDER_TICKET_ID"] = ticketid;
                    sendQueryForObj(o);
                },
                disabled: function (key, options) {
                    if (ticketstatus === "CLOSED" || ticketstatus === "CLOSED_REALIZATION" || ticketstatus === "REALIZATION") {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            "realizationticket":{
                html: "<button type='button' id='btn_realizationticket' class='btn purple-stripe custombutton realizationticket'><i class='fa fa-credit-card'></i> Выдать билет на реализацию</button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: "on_realization_ticket",
                        sid: MB.User.sid
                    };
                    o["ORDER_TICKET_ID"] = ticketid;
                    sendQueryForObj(o);
                },
                disabled: function (key, options) {
                    if (agentrealizationaccess || ticketstatus === "TO_PAY") {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            "closerealizationticket":{
                html: "<button type='button' id='btn_closerealizationticket' class='btn purple-stripe custombutton closerealizationticket'><i class='fa fa-credit-card'></i> Закрыть реализацию билета</button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: "on_realization_print_ticket",
                        sid: MB.User.sid
                    };
                    o["ORDER_TICKET_ID"] = ticketid;
                    sendQueryForObj(o);
                },
                disabled: function (key, options) {
                    if (agentrealizationaccess || ticketstatus === "REALIZATION") {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            "cancel_enter":{
                html: "<button type='button' id='btn_cancel_enter' class='btn purple-stripe custombutton cancel_enter'><i class='fa fa-credit-card'></i> Отменить проход</button>",
                callback:function(){
                    var b1 = bootbox.dialog({
                        message: "Вы уверены что хотите отменить проход в зал?",
                        title: "Отмена прохода",
                        buttons: {
                            yes_btn: {
                                label: "Да, уверен",
                                className: "yellow",
                                callback: function() {
                                    //clear_enter_in_hall_status  (order_ticket_id, action_id, barcode)
                                    var o = {
                                        command: "operation",
                                        object: "clear_enter_in_hall_status",
                                        sid: MB.User.sid
                                    };
                                    o["ORDER_TICKET_ID"] = ticketid;
                                    sendQueryForObj(o);
                                }
                            },
                            cancel:{
                                label:"Отмена",
                                className:"blue"
                            }
                        }
                    });


                },
                disabled: function (key, options) {
                    return false;
                }
            },
            "cancel_enter_all":{
                html: "<button type='button' id='btn_cancel_enter_all' class='btn purple-stripe custombutton cancel_enter_all'><i class='fa fa-credit-card'></i> Отменить проход ДЛЯ ВСЕГО МЕРОПРИЯТИЯ</button>",
                callback:function(){
                    bootbox.dialog({
                        message: "Вы уверены что хотите отменить проход в зал ДЛЯ ВСЕГО МЕРОПРИЯТИЯ?",
                        title: "Отмена прохода ДЛЯ ВСЕГО МЕРОПРИЯТИЯ",
                        buttons: {
                            yes_btn: {
                                label: "ДА, Я УВЕРЕН.",
                                className: "RED",
                                callback: function() {
                                    //clear_enter_in_hall_status  (order_ticket_id, action_id, barcode)
                                    var o = {
                                        command: "operation",
                                        object: "clear_all_enter_in_hall_status",
                                        sid: MB.User.sid
                                    };
                                    o["ACTION_ID"] = action_id;
                                    sendQueryForObj(o);
                                }
                            },
                            cancel:{
                                label:"Отмена",
                                className:"green"
                            }
                        }
                    });


                },
                disabled: function (key, options) {
                    return false;
                }
            }
        };

        //
        // Action Buttons
        //
        instance.$container.find(".control-buttons").html("");
        var html = '';
        for(var key in buttons){
            instance.$container.find(".control-buttons").append(buttons[key].html);
            log(buttons[key].disabled())
            if(buttons[key].disabled()){
                instance.$container.find(".control-buttons").find("."+key).attr("disabled",true);
            }
        }
        instance.$container.find(".control-buttons").on("click",function(e){
            var buttonName = e.target.id.replace("btn_","");
            var buttonObj = buttons[buttonName];
            buttonObj.callback();
        })


        function sendQueryForObj(o){
            MB.Core.sendQuery(o, function (res) {
                if (parseInt(res.RC) === 0) {
                    toastr.success(res.MESSAGE, "Успешная операция");
                    instance.reload("data");
                }
                else {
                    toastr.error(res.MESSAGE, "");
                }
            });
        }



        function createObj(obj){
            var ticketid        = obj.ticketid;
            var key             = obj.key;
            var object          = obj.object;
            if(obj.btnStyle!=undefined){
                var btnStyle    = obj.btnStyle;
            }
            else {
                var btnStyle    = "btn-default";
            }
            if(obj.btnIcon!=undefined){
                var btnIcon    = obj.btnIcon;
            }
            else {
                var btnIcon    = "<i class='fa fa-credit-card'></i>";
            }
            var btnText        = " Закрыть реализацию билета";



            var property = {
                html: "<button type='button' id='btn_closerealizationticket' class='btn "+btnStyle+" custombutton "+key+"'>"+btnIcon+" "+btnText+"</button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: object,
                        sid: MB.User.sid
                    };
                    o["ORDER_TICKET_ID"] = ticketid;
                    sendQueryForObj(o);
                },
                disabled: function (key, options) {
                    if (agentrealizationaccess || ticketstatus === "REALIZATION") {
                        return false;
                    } else {
                        return true;
                    }
                }
            }
            return property;
        }

        /*
        var html = '';
        html += "<button type='button' class='btn btn-default custombutton payticket'><i class='fa fa-cogs'></i> К оплате</button>";
        html += "<button type='button' class='btn btn-default custombutton cancelticket'><i class='fa fa-cogs'></i> Отменить билет</button>";
        html += "<button type='button' class='btn btn-default custombutton returnticket'><i class='fa fa-cogs'></i> Вернуть билет</button>";
        html += "<button type='button' class='btn btn-default custombutton printticket'><i class='fa fa-cogs'></i> Напечатать билет</button>";
        html += "<button type='button' class='btn btn-default custombutton defectblanck'><i class='fa fa-cogs'></i> Забраковать бланк</button>";
        html += "<button type='button' class='btn btn-default custombutton defectticket'><i class='fa fa-cogs'></i> Забраковать билет</button>";
        html += "<button type='button' class='btn btn-default custombutton defectticket'><i class='fa fa-cogs'></i> Выдадть билет на реализацию билет</button>";
        html += "<button type='button' class='btn btn-default custombutton defectticket'><i class='fa fa-cogs'></i> Закрыть реализацию билета</button>";
        instance.$container.find(".control-buttons").append(html);
        */


        callback();
    };
})();
