(function () {
    var instance = MB.O.forms["form_order"];
    instance.custom = function (callback) {
/*
        var agentrealizationaccess      = instance.data.data[0][instance.data.names.indexOf("AGENT_REALIZATION_ACCESS")],
            countOnRealizationTickets     = instance.data.data[0][instance.data.names.indexOf("COUNT_REALIZATION_TICKETS")],
            counttorealizationtickets   = instance.data.data[0][instance.data.names.indexOf("COUNT_TO_REALIZATION_TICKETS")],
            countToPaytickets           = instance.data.data[0][instance.data.names.indexOf("COUNT_TO_PAY_TICKETS")],
            countReservedTickets        = instance.data.data[0][instance.data.names.indexOf("COUNT_RESERVED_TICKETS")],
            countClosedTickets          = instance.data.data[0][instance.data.names.indexOf("COUNT_CLOSED_TICKETS")];
            countPaidTickets            = instance.data.data[0][instance.data.names.indexOf("COUNT_PAID_TICKETS")];
        */
        var agentrealizationaccess              = instance.data.data[0][instance.data.names.indexOf("AGENT_REALIZATION_ACCESS")],
            countReservedTickets                = instance.data.data[0][instance.data.names.indexOf("COUNT_RESERVED_TICKETS")],
            countToPaytickets                   = instance.data.data[0][instance.data.names.indexOf("COUNT_TO_PAY_TICKETS")],
            countPaidTickets                    = instance.data.data[0][instance.data.names.indexOf("COUNT_PAID_TICKETS")];
            countOnRealizationTickets           = instance.data.data[0][instance.data.names.indexOf("COUNT_ON_REALIZATION_TICKETS")],
            countClosedTickets                  = instance.data.data[0][instance.data.names.indexOf("COUNT_CLOSED_TICKETS")],
            countClosedRealizationTicket        = instance.data.data[0][instance.data.names.indexOf("COUNT_CLOSED_REALIZATION_TICK")],
            countOnRealizationNotPrinted        = instance.data.data[0][instance.data.names.indexOf("COUNT_ON_REALIZ_NOTPRINTED")];
            countClosedRealizationNotPrinted    = instance.data.data[0][instance.data.names.indexOf("COUNT_CLOSED_REALIZ_NOTPRINTED")];

        var orderstatus = instance.data.data[0][instance.data.names.indexOf("STATUS")];

        var crmusername = instance.data.data[0][instance.data.names.indexOf("CRM_USER_NAME")],
            crmuserphone = instance.data.data[0][instance.data.names.indexOf("CRM_USER_PHONE")],
            crmuseremail = instance.data.data[0][instance.data.names.indexOf("CRM_USER_EMAIL")],
            customerid = instance.data.data[0][instance.data.names.indexOf("CUSTOMER_ID")];
        
        instance.lockagentarea = function () {            
            instance.$container.find(".agenttab").parent().addClass("disabled");
            instance.$container.find(".agenttab").on("click", function (e) {
                return false;
            });
        };

        instance.lockpersonarea = function () {
            instance.$container.find(".privatepersontab").parent().removeClass("active");
            instance.$container.find("#privatepersontab").removeClass("active");
            instance.$container.find(".privatepersontab").parent().addClass("disabled");
            instance.$container.find(".privatepersontab").on("click", function (e) {
                return false;
            });
            instance.$container.find(".agenttab").parent().addClass("active");
            instance.$container.find("#agenttab").addClass("active");
        };      

        instance.lockallareas = function () {
            // instance.$container.find(".tab-content .tab-pane.active").removeClass("active");
            // instance.$container.find(".tab-content nav li.active").removeClass("active");
            instance.$container.find(".privatepersontab").parent().addClass("disabled");
            instance.$container.find(".privatepersontab").on("click", function (e) {
                return false;
            }); 
            instance.$container.find(".agenttab").parent().addClass("disabled");
            instance.$container.find(".agenttab").on("click", function (e) {
                return false;
            });           
        }; 

        
        
        if (orderstatus === "RESERVED") {
            if (crmusername || crmuserphone || crmuseremail) {
                instance.lockagentarea();
            } else if (customerid) {
                instance.lockpersonarea();
            } else {
                // instance.lockallareas();
            }
        } else {
            instance.lockallareas();
        }
        
        instance.$container.find(".custombutton").remove();

        $("[data-column=CRM_USER_PHONE]").find("input").mask("7 999 999 99 99");
        
        $("[data-returnscolumn=CUSTOMER_ID]").change(function(){
            $("#clientGroupInp").find("input").each(function(){
                $(this).val("");
                $(this).addClass("edited");
            })
            $("#clientGroupInp").find(".select2-chosen").html("");
        })
        $("#clientGroupInp").find("input").change(function(){
            $("#agentGroupInp").find(".select2-chosen").html("");
            $("[data-returnscolumn=CUSTOMER_ID]").val("");
            $("[data-returnscolumn=CUSTOMER_ID]").addClass("edited");

            $("#clientGroupInp").find("input").each(function(){
                $(this).val("");
                $(this).addClass("edited");
            })
        })

        /*
        $("[data-column=CUSTOMER_NAME]").find("input").find(.change(function(){
            log("GOAL")
            $("#privatepersontab").find("input").each(function(){
                log($(this))
                $(this).val("");
            })
        })

        */
        /*
    	var html = "";
        if (countPaidTickets > 0 || countToPaytickets > 0) {
            html += "<button type='button' class='btn btn-default custombutton printorder'><i class='fa fa-cogs'></i> Распечатать заказ</button>";
        }
        if (countReservedTickets > 0) {
            html += "<button type='button' class='btn btn-default custombutton topayorder'><i class='fa fa-cogs'></i> Перевести заказ к оплате</button>";
        } 
        if (countReservedTickets > 0 || countToPaytickets > 0) {
            html += "<button type='button' class='btn btn-default custombutton cancelorder'><i class='fa fa-cogs'></i> Отменить заказ</button>";
        }
        if (countClosedTickets > 0) {
            html += "<button type='button' class='btn btn-default custombutton returnorder'><i class='fa fa-cogs'></i> Вернуть заказ</button>";
        }
        if (agentrealizationaccess.bool() && counttorealizationtickets > 0) {
            html += "<button type='button' class='btn btn-default custombutton realizationorder'><i class='fa fa-cogs'></i> Выдать заказ на реализацию</button>";
        }
        if (agentrealizationaccess.bool() && countOnRealizationTickets > 0) {
            html += "<button type='button' class='btn btn-default custombutton closerealizationorder'><i class='fa fa-cogs'></i> Закрыть реализацию</button>";
        }    	
        
        instance.$container.find(".control-buttons").append(html);

        */
        var buttons = {
            "payorder":{
                html: "<button type='button' id='btn_payorder' class='btn blue-stripe custombutton payorder'><i class='fa fa-credit-card'></i> Заказ к оплате </button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: "to_pay_order",
                        sid: MB.User.sid
                    };
                    o["ORDER_ID"] = instance.activeId;
                    sendQueryForObj(o);
                },
                disabled: function (key, options) {
                    if (countReservedTickets > 0) {
                        return false;
                    } else {
                        return true;
                        
                    }
                }
            },
            "cancelorder":{
                html: "<button type='button' id='btn_cancelorder' class='btn red-stripe custombutton cancelorder'><i class='fa fa-credit-card'></i> Отменить заказ </button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: "cancel_order",
                        sid: MB.User.sid
                    };
                    o["ORDER_ID"] = instance.activeId;
                    sendQueryForObj(o);
                },
                disabled: function (key, options) {
                    if (countReservedTickets > 0 || countToPaytickets > 0) {
                        return false;
                    } else {
                        return true;
                        
                    }
                }
            },
            "returnorder":{
                html: "<button type='button' id='btn_returnorder' class='btn red-stripe custombutton returnorder'><i class='fa fa-credit-card'></i> Вернуть заказ </button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: "return_order",
                        sid: MB.User.sid
                    };
                    o["ORDER_ID"] = instance.activeId;
                    sendQueryForObj(o);
                },
                disabled: function (key, options) {
                    if (countClosedTickets > 0 || countOnRealizationTickets > 0  || countClosedRealizationTicket > 0) {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            "printorder":{
                html: "<button type='button' id='btn_printorder' class='btn green-stripe custombutton printorder'><i class='fa fa-credit-card'></i> Распечатать заказ </button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: "print_order",
                        sid: MB.User.sid
                    };
                    o["ORDER_ID"] = instance.activeId;
                    sendQueryForObj(o);
                },
                disabled: function (key, options) {
                    if (countPaidTickets > 0 || countToPaytickets > 0 || countOnRealizationNotPrinted > 0 || countClosedRealizationNotPrinted > 0) {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            "realizationorder":{
                html: "<button type='button' id='btn_realizationorder' class='btn purple-stripe custombutton realizationorder'><i class='fa fa-credit-card'></i> Выдать по квоте </button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: "on_realization_order",
                        sid: MB.User.sid
                    };
                    o["ORDER_ID"] = instance.activeId;
                    sendQueryForObj(o);
                },
                disabled: function (key, options) {
                    if (agentrealizationaccess.bool() && countToPaytickets > 0) {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            "realizationorderprint":{
                html: "<button type='button' id='btn_realizationorderprint' class='btn purple-stripe custombutton realizationorderprint'><i class='fa fa-credit-card'></i> Выдать по квоте и распечатать </button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: "on_realization_print_order",
                        sid: MB.User.sid
                    };
                    o["ORDER_ID"] = instance.activeId;
                    sendQueryForObj(o);
                },
                disabled: function (key, options) {
                    if (agentrealizationaccess.bool()  && orderstatus === "TO_PAY") {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            "closerealizationorder":{
                html: "<button type='button' id='btn_closerealizationorder' class='btn purple-stripe custombutton closerealizationorder'><i class='fa fa-credit-card'></i> Закрыть квоту </button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: "close_realization_order",
                        sid: MB.User.sid
                    };
                    o["ORDER_ID"] = instance.activeId;
                    sendQueryForObj(o);
                },
                disabled: function (key, options) {
                    if (agentrealizationaccess.bool() && countOnRealizationTickets > 0) {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            "deliverynoteorder":{
                html: "<button type='button' id='btn_deliverynoteorder' class='btn purple-stripe custombutton deliverynoteorder'><i class='fa fa-credit-card'></i> Накладная на выдачу</button>", 
                callback:function(){
                        var width = MBOOKER.Fn.getClientWidth();
                        var height = MBOOKER.Fn.getClientHeight()+50;
                        var get = "?sid="+MB.User.sid+"&ORDER_ID="+instance.activeId;
                        get+= "&subcommand=delivery_note";
                        //var report_page = window.open('html/contents/report/report_print.html'+get,'new','width='+width+',height='+height+',toolbar=1');
                        var report_page = window.open( "html/report/report_delivery_note/print_delivery_note.html"+get,'new','width='+width+',height='+height+',toolbar=1');
               },
               disabled: function(){
                return false
               }
            }
            // $("#modal_form_order_wrapper").find(".actions").append('<div class="btn default save_button deliveriNote">Накладная</div>');
            // $(".deliveriNote").click(function(){
            //     var width = MBOOKER.Fn.getClientWidth();
            //     var height = MBOOKER.Fn.getClientHeight()+50;
            //     var get = "?sid="+MB.User.sid+"&ORDER_ID="+instance.activeId;
            //     get+= "&subcommand=delivery_note";
            //     //var report_page = window.open('html/contents/report/report_print.html'+get,'new','width='+width+',height='+height+',toolbar=1');
            //     var report_page = window.open( "html/report/report_delivery_note/print_delivery_note.html"+get,'new','width='+width+',height='+height+',toolbar=1');
            // })
        }

        var html = '';
        for(var key in buttons){
            instance.$container.find(".order-buttons").append(buttons[key].html);
            if(buttons[key].disabled()){
                instance.$container.find(".order-buttons").find("."+key).attr("disabled",true);
            }
        }
        instance.$container.find(".order-buttons").on("click",function(e){
            var buttonName = e.target.id.replace("btn_","");
            var buttonObj = buttons[buttonName];
            buttonObj.callback();
        }) 


        function sendQueryForObj(o){
            MB.Core.sendQuery(o, function (res) {
                if (parseInt(res.RC) === 0) {
                    toastr.success(res.MESSAGE, "Ок");
                    instance.reload("data");
                }
                else {
                    toastr.error(res.MESSAGE, "");
                }
            });
        }
/*
        var $controls = instance.$container.find(".control-buttons");

        $controls.find(".printorder").on("click", function (e) {
            var o = {
                command: "operation",
                object: "print_order",
                sid: MB.User.sid
            };
            o["ORDER_ID"] = instance.activeId;
            MB.Core.sendQuery(o, function (res) {
                if (parseInt(res.RC) === 0) {
                    toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                    instance.reload("data");
                }
            });
        });
        $controls.find(".topayorder").on("click", function (e) {
            var o = {
                command: "operation",
                object: "pay_order",
                sid: MB.User.sid
            };
            o["ORDER_ID"] = instance.activeId;
            MB.Core.sendQuery(o, function (res) {
                if (parseInt(res.RC) === 0) {
                    toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                    instance.reload("data");
                }
            });
        });
        $controls.find(".cancelorder").on("click", function (e) {
            var o = {
                command: "operation",
                object: "cancel_order",
                sid: MB.User.sid
            };
            o["ORDER_ID"] = instance.activeId;
            MB.Core.sendQuery(o, function (res) {
                if (parseInt(res.RC) === 0) {
                    toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                    instance.reload("data");
                }
            });
        });
        $controls.find(".returnorder").on("click", function (e) {
            var o = {
                command: "operation",
                object: "return_order",
                sid: MB.User.sid
            };
            o["ORDER_ID"] = instance.activeId;
            MB.Core.sendQuery(o, function (res) {
                if (parseInt(res.RC) === 0) {
                    toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                    instance.reload("data");
                }
            });
        });
        $controls.find(".realizationorder").on("click", function (e) {
            var o = {
                command: "operation",
                object: "realization_order",
                sid: MB.User.sid
            };
            o["ORDER_ID"] = instance.activeId;
            MB.Core.sendQuery(o, function (res) {
                if (parseInt(res.RC) === 0) {
                    toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                    instance.reload("data");
                }
            });
        });
        $controls.find(".closerealizationorder").on("click", function (e) {
            var o = {
                command: "operation",
                object: "close_realization_order",
                sid: MB.User.sid
            };
            o["ORDER_ID"] = instance.activeId;
            MB.Core.sendQuery(o, function (res) {
                if (parseInt(res.RC) === 0) {
                    toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                    instance.reload("data");
                }
            });
        });

*/

        $(".form_order-content-wrapper").html("");
        var table = new MB.Table({
            world: "form_order", 
            name: "tbl_order_ticket", 
            params: {
                parentkeyvalue: instance.activeId, 
                parentobject: instance.name, 
                parentobjecttype: "form"
            }
        });
        table.create(function () {});

        $(".form_order_payment-content-wrapper").html("");
        var table = new MB.Table({
            world: "form_order_payment", 
            name: "tbl_order_payment", 
            params: {
                parentkeyvalue: instance.activeId, 
                parentobject: instance.name, 
                parentobjecttype: "form"
            }
        });
        table.create(function () {});
        

        instance.$container.find("a[href='#orderhistory']").off().on("click", function (e) {
            $(".form_order_2-content-wrapper").html("");
            log(instance)
            var table = new MB.Table({
                world: "form_order_2", 
                name: "tbl_order_history_log", 
                params: {
                    parentkeyvalue: instance.activeId, 
                    parentobject: instance.name, 
                    parentobjecttype: "form"
                }
            });
            table.create(function () {});



            // var orderhistorytable = new MB.Form({
            //     name: "tbl_order_history_log",
            //     world: "form_order_2",
            //     params: {

            //     }
            // });
            // orderhistorytable.create();
        });


// $("#goToPayButton").on("click", function(){
//         alert_yesno("Перейти к оплате заказа.","<center>" + "Вы уверены что хотите перейти к оплате заказа №" + Orders.orderId + " ?" + "</center>","Да, уверен", "Отменить",function(){
//             send_query({command:"operation",subcommand:"pay_order",sid:sid,params:{ORDER_ID:Orders.orderId}},function(data){
//                 log(data);
//                 if ($(data).find("result").find("rc").text() === "0") {
//                     // alert_yesno("","<center>" + $(data).find("result").find("message").text() + "</center>","Ок","",function(){},0);
//                     Orders.loadOrderForm(Orders.orderId);
//                     $("#order").trigger("reloadGrid");
//                 } else {
//                     log("ne 0");
//                     alert_yesno("<span style='color:#f00;'>Ошибка.</span>","<center>" + $(data).find("result").find("message").text() + "</center>","Ок","",function(){},0);
//                     $("#order").trigger("reloadGrid");
//                     $("#one_order").trigger("reloadGrid");
//                 }
//             });
//         },0);
//     });
//     $("#goToCancelButton").on("click", function(){
//         alert_yesno("Отмена заказа.","<center>" + "Вы уверены, что хотите отменить заказ №" + Orders.orderId + "?" + "</center>","Да, уверен", "Отменить",function(){
//             send_query({command:"operation",subcommand:"cancel_order",sid:sid,params:{ORDER_ID:Orders.orderId}},function(data){
//                 if ($(data).find("result").find("rc").text() === "0") {
//                     alert_yesno("","<center>" + $(data).find("result").find("message").text() + "</center>","Ок","",function(){},0);
//                     Orders.loadOrderForm(Orders.orderId);
//                     $("#order").trigger("reloadGrid");
//                 } else {
//                     alert_yesno("<span style='color:#f00;'>Ошибка.</span>","<center>" + $(data).find("result").find("message").text() + "</center>","Ок","",function(){},0);
//                     $("#order").trigger("reloadGrid");
//                     $("#one_order").trigger("reloadGrid");
//                 }
//             });
//         },0);
//     });
//     $("#goToRealizationButton").on("click", function(){
//         alert_yesno("Выдать заказа на реализацию","<center>" + "Вы уверены что хотите выдать на реализацию заказ №" + Orders.orderId + " ?" + "</center>","Да, уверен", "Отменить",function(){
//             send_query({command:"operation",subcommand:"realization_order",sid:sid,params:{ORDER_ID:Orders.orderId}},function(data){
//                 if ($(data).find("result").find("rc").text() === "0") {
//                     alert_yesno("","<center>" + $(data).find("result").find("message").text() + "</center>","Ок","",function(){},0);
//                     Orders.loadOrderForm(Orders.orderId);
//                     $("#order").trigger("reloadGrid");
//                 } else {
//                     alert_yesno("<span style='color:#f00;'>Ошибка.</span>","<center>" + $(data).find("result").find("message").text() + "</center>","Ок","",function(){},0);
//                     $("#order").trigger("reloadGrid");
//                     $("#one_order").trigger("reloadGrid");
//                 }
//             });
//         },0);
//     });
//     $("#goToReturnButton").on("click", function(){
//         alert_yesno("Возврат заказа.","<center>" + "Вы уверены, что хотите вернуть заказ №" + Orders.orderId + " ?" + "</center>","Да, уверен", "Отменить",function(){
//             send_query({command:"operation",subcommand:"return_order",sid:sid,params:{ORDER_ID:Orders.orderId}},function(data){
//                 if ($(data).find("result").find("rc").text() === "0") {
//                     alert_yesno("","<center>" + $(data).find("result").find("message").text() + "</center>","Ок","",function(){},0);
//                     $("#order").trigger("reloadGrid");
//                     Orders.loadOrderForm(Orders.orderId);
//                     $("#order").trigger("reloadGrid");
//                 } else {
//                     alert_yesno("<span style='color:#f00;'>Ошибка.</span>","<center>" + $(data).find("result").find("message").text() + "</center>","Ок","",function(){},0);
//                     $("#order").trigger("reloadGrid");
//                     $("#one_order").trigger("reloadGrid");
//                 }
//             });
//         },0);
//     });
//     $("#goToPrintButton").on("click", function(){
//         alert_yesno("Напечатать заказ.","<center>" + "Вы уверены что хотите напечатать заказ №" + Orders.orderId + " ?" + "</center>","Да, уверен", "Отменить",function(){
//             send_query({command:"operation",subcommand:"print_order",sid:sid,params:{ORDER_ID:Orders.orderId}},function(data){
//                 if ($(data).find("result").find("rc").text() === "0") {
//                     // alert_yesno("","<center>" + $(data).find("result").find("message").text() + "</center>","Ок","",function(){},0);
//                     Orders.loadOrderForm(Orders.orderId);
//                     $("#order").trigger("reloadGrid");
//                 } else {
//                     alert_yesno("<span style='color:#f00;'>Ошибка.</span>","<center>" + $(data).find("result").find("message").text() + "</center>","Ок","",function(){},0);
//                     $("#order").trigger("reloadGrid");
//                     $("#one_order").trigger("reloadGrid");
//                 }
//             });
//         },0);
//     });
//     $("#goToCloseRealizationButton").on("click", function(){
//         alert_yesno("Закрыть реализацию заказа.","<center>" + "Вы уверены что хотите закрыть реализацию заказа №" + Orders.orderId + " ?" + "</center>","Да, уверен", "Отменить",function(){
//             send_query({command:"operation",subcommand:"close_realization_order",sid:sid,params:{ORDER_ID:Orders.orderId}},function(data){
//                 if ($(data).find("result").find("rc").text() === "0") {
//                     alert_yesno("","<center>" + $(data).find("result").find("message").text() + "</center>","Ок","",function(){},0);                   
//                     // $("#one_order").trigger("reloadGrid");
//                     Orders.loadOrderForm(Orders.orderId);
//                     $("#order").trigger("reloadGrid");
//                 } else {
//                     alert_yesno("<span style='color:#f00;'>Ошибка.</span>","<center>" + $(data).find("result").find("message").text() + "</center>","Ок","",function(){},0);
//                     $("#order").trigger("reloadGrid");
//                     $("#one_order").trigger("reloadGrid");
//                 }
//             });
//         },0);
//     });























        
        callback();
    };
})();