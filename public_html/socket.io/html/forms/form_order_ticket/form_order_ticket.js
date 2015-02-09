(function () {
    var instance = MB.O.forms["form_order_ticket"];
    instance.custom = function (callback) {
        log(instance)
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
                        object: "pay_ticket",
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
                    var o = {
                        command: "operation",
                        object: "print_ticket",
                        sid: MB.User.sid
                    };
                    o["ORDER_TICKET_ID"] = ticketid;
                    sendQueryForObj(o);
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
            "realizationticket":{
                html: "<button type='button' id='btn_realizationticket' class='btn purple-stripe custombutton realizationticket'><i class='fa fa-credit-card'></i> Выдать билет на реализацию</button>",
                callback:function(){
                    var o = {
                        command: "operation",
                        object: "realization_ticket",
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
                        object: "realization_ticket",
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
