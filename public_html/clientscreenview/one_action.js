
//var sid = "";



/*________________________________________________________________________________**/

function one_action_init(id){
    var one_action_map;
    var sid = MB.User.sid;
    var environment = MB.Content.find(id);
    var tickets_stack,action_price_info;



        var Modaltitle = '';
        if(environment.title){
            Modaltitle = environment.title;
        }else{
            Modaltitle = 'Мероприятие';
            console.warn('environment.title не приходит!');
        }

        $('#modal_'+id+'_wrapper .pageHeaderInner h3').html(Modaltitle);

        var w = $("#modal_"+id+"_wrapper").width();
        var h = $("#modal_"+id+"_wrapper").height()-185;
        var w70 = w -17 - w*3/10;

        one_action_map = new Map1({
            container: $("#modal_"+id+"_wrapper #box_for_one_action_map"),
            cWidth:w70,
            cHeight:h,
            mode:"casher"
        });
        var socketObject = {
            sid:sid,
            type:"action_scheme",
            param:"action_id",
            id:environment.action_id,
            portion:30,
            save:{
                // command:"operation",
                // object:"block_place_list",
                // field_name:"action_scheme_id"
            },
            load:{
                command:"get",
                object:"action_scheme",
                params:{
                    action_id:environment.action_id
                },
                columns:"ACTION_SCHEME_ID,PRICE,STATUS,STATUS_TEXT,FUND_GROUP_NAME,PRICE_GROUP_NAME,BLOCK_COLOR,COLOR",
                field_name:"action_scheme_id"
            }
        };

        var o = {
            command:"get",
            object:"action_scheme",
            sid:sid,
            params:{
                action_id:environment.action_id
            }
        };
        var o2 = {
            command:"get",
            object:"action_scheme_object",
            sid:sid,
            params:{
                where:"ACTION_ID = "+environment.action_id
            }
        };
        one_action_map.openSocket(socketObject);

        one_action_map.loadSquares(o,function(){

            //one_action_map.loadObjects(o2,function(){
                one_action_map.setLayout(function(){
                    one_action_map.setMinMax(function(){
                        one_action_map.setScaleCoff(function(){
                            one_action_map.render(function(){
                                one_action_map.reLoadLayout(function(){});
                            });

                            one_action_map.setEvents();
                        });

                    });
                });
            //});
            tickets_stack.load();
            action_price_info.load();
         /*   $("a.reload").click(function(){
                one_action_map.reLoad();
            });*/


            uiTabs();
            uiUl();
            environment.onFocus = function(){
                tickets_stack.load();
                action_price_info.load();
                one_action_map.render();
            };
            environment.onClose = function(){
                one_action_map.closeSocket();
            };

        });

        var wrap = $("#"+environment.world+"_"+environment.id+"_wrapper");
        wrap.children("*").each(function(){
            if (this.id!="")
                preventSelection(document.getElementById(this.id));
        });



    one_action_map.sendSelection = function(){
        console.log('sendSelection');
        var object = "block_place_list";
        if (one_action_map.mouseKey==3)
            object = "unblock_place_list";
        var obj = {
            event:"save_and_update",
            save_params:{
                object:object,
                params:{
                    action_id:environment.action_id
                },
                list:one_action_map.selection,
                portion:200
            },
            load_params:{
                list:one_action_map.selection,
                portion:20
            }

        };
        one_action_map.toSocket(obj);
        one_action_map.clearSelection();

    };
    one_action_map.sendSelectionCallback = function(){
        /*tickets_stack.load();
        action_price_info.load();*/
    };
    one_action_map.sendSelectionCallbackFull = function(){
        tickets_stack.load();
        action_price_info.load();
    };



    /***__________________________________________________________________________________________________***/


/*
     one_action_map = new Map({
         box:"box_for_one_action_map",
         box2:"box_for_one_action_zoom",
         name:"canvasOutput",
         cWidth:environment.getWidth(),
         cHeight:environment.getHeight()
     });
    one_action_map.load({
            object:"action_scheme",
            params:{
                action_id:environment.action_id
            },
            loadObjectsParam:{
                object:"action_scheme_object",
                params:{
                    where:"ACTION_ID = "+environment.action_id
                }
            },
            reLoadCallback:function(){
                tickets_stack.load();
                action_price_info.load();
            }
        },function(){
            tickets_stack.load();
            action_price_info.load();
            $("a.reload").click(function(){
                one_action_map.reLoad();
               *//* tickets_stack.load();
                action_price_info.load();*//*
            });


            uiTabs();
            uiUl();
        }
     );*/

    ///  Стек билетов
    tickets_stack = {
        box:"tickets_box",
        load:function(){
            if (environment.order_id==undefined){
                var self = this;
                MB.Core.sendQuery({
                    command:"get",
                    object:"user_blocked_places",
                    sid:MB.User.sid,
                    columns:"ACTION_SCHEME_ID,ACTION_NAME,AREA_GROUP,LINE,PLACE,PRICE",
                    params:{
                        order_by:"ACTION_NAME,LINE,PLACE"
                    }
                },function(data){
                    $("#"+self.box).html("");
                    var obj = MB.Core.jsonToObj(data);
                    for (var k in obj){
                        $("#"+self.box).append('<tr class="one_place" id="one_place'+obj[k].ACTION_SCHEME_ID+'">' +
                            '<td style="font-size: 0.8em;">' +
                            obj[k].ACTION_NAME+
                            '</td>' +
                            '<td style="font-size: 0.8em;">' +
                            obj[k].AREA_GROUP+
                            '</td>' +
                            '<td>' +
                            obj[k].LINE+
                            '</td>' +
                            '<td>' +
                            obj[k].PLACE+
                            '</td>' +
                            '<td>' +
                            obj[k].PRICE+
                            '</td>' +
                            '</tr>');


                        /*var items = {
                            cancel:{
                                name:"Снять блокировку места",
                                callback:function(key,options){
                                    var id = options.selector.replace(/[^0-9]/ig,'');
                                    bootbox.dialog({
                                        message: "После снятия блокировки, место станет доступно для продажи другими пользователями.",
                                        title: "Вы уверены что хотите снять блокировку места?",
                                        buttons: {
                                            yes_btn: {
                                                label: "Да, уверен",
                                                className: "yellow",
                                                callback: function() {
                                                    MB.Core.sendQuery({command:"operation",object:"unblock_place_list",sid:sid,params:{action_scheme_id:id}},function(data){
                                                        one_action_map.reLoad();
                                                       *//* tickets_stack.load();
                                                        action_price_info.load();*//*
                                                    });
                                                }
                                            },
                                            cancel:{
                                                label:"Отмена",
                                                className:"blue"
                                            }
                                        }
                                    });

                                }

                            }
                        };
                        if (obj[k].ACTION_ID==environment.action_id){
                            items.showOnScheme = {
                                name: "Показать на схеме",
                                callback:function(key,options){
                                    var id = options.selector.replace(/[^0-9]/ig,'');
                                    one_action_map.drawLightOne(id);
                                }
                            }
                        }
                        //log($("#one_place"+obj[k].ACTION_SCHEME_ID));
                        $.contextMenu("destroy","#one_place"+obj[k].ACTION_SCHEME_ID);
                        $.contextMenu({
                            selector:"#one_place"+obj[k].ACTION_SCHEME_ID,
                            items:items
                        });*/
                    }
                    $("#TOTAL_PLACE").html(data.INFO.ROWS_COUNT);
                    $("#TOTAL_TICKETS").html(data.TOTAL_TICKETS);
                    var TOTAL_AMOUNT = (data.TOTAL_AMOUNT!="")?data.TOTAL_AMOUNT:0;
                    $("#TOTAL_AMOUNT").html(TOTAL_AMOUNT+" руб.");



                });
            }


        },
        clear_blocked_place:function(){
            //clear_blocked_place
            MB.Core.sendQuery({command:"operation",object:"clear_blocked_place",sid:sid,params:{action_id:environment.action_id}},function(data){
                one_action_map.reLoad();
                tickets_stack.load();
                action_price_info.load();


            });
        },
        clear_blocked_placeAll:function(){
            //clear_blocked_place
            MB.Core.sendQuery({command:"operation",object:"clear_blocked_place",sid:sid},function(data){
                one_action_map.reLoad();
                tickets_stack.load();
                action_price_info.load();

            });
        },
        block_all_places:function(){
            var self = this;
            MB.Core.sendQuery({command:"operation",object:"block_all_places",sid:sid,params:{action_id:environment.action_id}},function(data){
                one_action_map.reLoad();
                tickets_stack.load();
                action_price_info.load();
            });
        }
    };

    /// Инфо о свободных местах
    action_price_info = {
        box:"action_price_info",
        load:function(){
            var self = this;
            MB.Core.sendQuery({command:"get",object:"action_price_info",sid:MB.User.sid,params:{action_id:environment.action_id}},function(data){
                var obj = MB.Core.jsonToObj(data);
                $("#"+self.box).html("");
                for (var k in obj){
                    $("#"+self.box).append('' +
                        '<li class="">' +
                        '<div class="colorCircle" style="background-color:'+obj[k].COLOR +'"></div>' +
                        '<div class="info">' +
                        '<a href="#">'+obj[k].PRICE+' руб.</a>'+
                        '<span>'+obj[k].FREE_PLACE_COUNT+' мест</span>' +
                        '</div>'+
                        '</li>'

                    );
                }
                $("#total_free_count").html(data.TOTAL_FREE_COUNT);

            });

        }
    };

    /// Очистить стек билетов
    $("#clear_tickets_stack").click(function(){
        bootbox.dialog({
            message: "Вы уверены что хотите отменить выбор мест?",
            title: "",
            buttons: {
                yes_btn: {
                    label: "Да, уверен",
                    className: "green",
                    callback: function() {
                        tickets_stack.clear_blocked_place();
                    }
                },
                yes_to_all: {
                    label: "Да, для всех залов",
                    className: "red",
                    callback: function() {
                        tickets_stack.clear_blocked_placeAll();
                    }
                },
                cancel:{
                    label:"Отмена",
                    className:"blue"
                }
            }
        });


    });

    $("#prepare_order").on("click", function(){
        var params = {};
        var object = "create_reserv_order";
        if (typeof selected_order_id != "undefined") {
            object = "add_tickets_to_order";
            params = {ORDER_ID:selected_order_id};
        }
        MB.Core.sendQuery({command:"operation",object:object,sid:sid,params:params}, function(data){
            if (+data.RC == 0) {
                MB.Core.switchModal({type:"form",name:"form_order",ids:[data.ID]});
                one_action_map.reLoad();
                tickets_stack.load();
                action_price_info.load();


            } else {
               /* bootbox.dialog({
                    message: data.MESSAGE,
                    title: "Ошибка",
                    buttons: {
                        error: {
                            label: "Ок",
                            className: "red"

                        }
                    }
                });*/

            }
        });
    });

    $("#print_tickets_stack").click(function(){
        MB.Core.sendQuery({command:"operation",object:"create_to_pay_order",sid:sid}, function(data){
            one_action_map.reLoad();
            tickets_stack.load();
            action_price_info.load();
            if(data.RC==0){
                var orderId = data.ID;
                MB.Core.sendQuery({command:"get",object:"order",sid:sid,params:{where:" ORDER_ID = "+data.ID}}, function(data){
                    var OrderPayment = new MB.OrderPaymentClass({orderId:orderId});
                    html= OrderPayment.renderOrderPaymentType(data);
                    var modalObj = {
                        selector: "#portlet-config",
                        title: "Печать билетов и расчет с клиентом. Заказ №<b>"+orderId+"</b>",
                        content: html,
                        modalType: 'modal-sm',
                        modalWidth: '91%',
                        buttons: {
                            ok1: {
                                label:"Распечатать",
                                color:"green",
                                dopAttr:"",
                                callback: function(){
                                    var o = {
                                        command: "operation",
                                        object: "print_order",
                                        sid: MB.User.sid
                                    };
                                    o["ORDER_ID"] = orderId;
                                    //MB.Core.sendQueryForObj(o,function(data){updaView.all(data);});
                                    OrderPayment.ButtonsState("off");
                                    MB.Core.sendQueryForObj(o,function(data){OrderPayment.ButtonsState("on");updaView.db(orderId);});
                                }
                            },
                            ok2: {
                                label:"Отменить заказ",
                                color:"red",
                                dopAttr:"",
                                callback: function(){
                                    var o = {
                                        command: "operation",
                                        object: "cancel_order",
                                        sid: MB.User.sid
                                    };
                                    o["ORDER_ID"] = orderId;
                                    OrderPayment.ButtonsState("off");
                                    MB.Core.sendQueryForObj(o,function(data){updaView.db(orderId);});
                                }
                            },
                            cancel: {
                                label:"Закрыть",
                                color:"default",
                                dopAttr:'data-dismiss="modal"',
                                callback: function(){

                                }
                            }
                        }
                    }

                    MB.Core.ModalMiniContent(modalObj);
                    console.log(OrderPayment);
                    var ButtonsState = OrderPayment.ButtonsState();

                    var updaView = OrderPayment.updateView();
                    updaView.all(data);
                    OrderPayment.handlerOrderAmount(data);
                    // updaView.all(data);
                    // handlerOrderAmount(data,updaView,ButtonsState);

                })
            }
            else {
                toastr[data.TOAST_TYPE](data.MESSAGE, data.TITLE);
            }
        });
        one_action_map.reLoad();
    })

    $("#map_refresh").click(function(){
        one_action_map.reLoad();
    });

    $("#block_all_places").click(function(){
        tickets_stack.block_all_places();
    });

    $("#to_action_list").click(function(){
        switch_content("actions_list",function(){
            testVisibilityminiModal("actions_list");
        });
    });

 /*   one_action_map.sendSelection = function(block){
        if (this.selection.length>0){

            var block_unblock_arr = [];
            var reserved = [];
            for (var k1 in this.selection){
                if (+this.squares[this.selection[k1]].status==1)
                    block_unblock_arr.push(this.selection[k1]);
                else if (+this.squares[this.selection[k1]].status==2)
                    reserved.push(this.selection[k1]);
            }

            var places = this.selection.join(",");
            var self = this;
            var subcmd = "block_place_list";
            if (!+block)
                subcmd = "unblock_place_list";
            MB.Core.sendQuery({command:"operation",object:subcmd,sid:sid,params:{action_scheme_id:places}},function(data){
                self.clearSelection();
                self.reLoad();
               *//* tickets_stack.load();
                action_price_info.load();*//*
                //self.reLoad();
            });
            for(var k2 in reserved){
                MB.Core.sendQuery({command:"operation",object:"cancel_ticket",sid:sid,params:{action_scheme_id:reserved[k2]}},function(data){})
            }
        }
    };*/

}




