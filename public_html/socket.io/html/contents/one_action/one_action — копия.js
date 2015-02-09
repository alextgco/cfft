
var tickets_stack;

var mp,ts,selector_outer;
//log(MBOOKER.Pages.pages.contents);
var sid = MBOOKER.UserData.sid;
var environment = MBOOKER.Fn.getEnv("one_action");

//var sid = "";


$(document).ready(function(){


    log(environment);
    one_action_init();



});

function one_action_init(){

    environment.action_id = 14;

    $("div").each(function(){
        /*    if (this.id!="")
         preventSelection(document.getElementById(this.id));*/
    });

    //preventSelection(document.getElementsByTagName("div"));



//$(document).ready(function(){

    //var map1 = new map();

    //log()
    map.init({
        box:"box_for_map",
        name:"one_action",
        cWidth:environment.getWidth(),
        cHeight:environment.getHeight()

    });
    //tickets_stack_box.init();
    map.load({
        object:"action_scheme",
        params:{
            action_id:environment.action_id
        },
        reLoadCallback:function(){
            /*map_price_info.map_price_info_load_info(action_id,function(){
             map_price_info.map_price_info_normalize_height();
             });*/
        }
    },function(data){

        var h2_html = data.ACTION +" "+ data.ACTION_DATE_TIME +" "+ '"'+data.HALL +'"';
        $("h2.action_title").html(h2_html);
        $("h2.action_title").click(function(){
            open_action(environment.action_id);
        });

        //testVisibilityminiModal('one_action');
        /*map_price_info.map_price_info_load_info(action_id,function(){
         map_price_info.map_price_info_normalize_height();
         });
         */
        mp = map;
        tickets_stack.loadStack();
        $(function(){
            /*$.contextMenu({
             selector: '.context-menu-one',
             *//*appendTo:map.box,*//*
             zIndex:110,
             *//* callback: function(key, options) {
             var m = "clicked: " + key;
             alert(m);
             },*//*
             items: {
             "edit": {name: "Edit", icon: "edit", callback:function(){alert("sdfsdfds");}},
             "cut": {name: "Cut", icon: "cut"},
             "copy": {name: "Copy", icon: "copy"},
             "paste": {name: "Paste", icon: "paste"},
             "delete": {name: "Delete", icon: "delete"},
             "sep1": "---------",
             "quit": {name: "Quit", icon: "quit"}
             }
             });*/

            /* $('.context-menu-one').on('click', function(e){
             console.log('clicked', this);
             })*/
        });

    });





    ///  Стек билетов
    tickets_stack1 = {
        box:"tickets_box",
        stack:[],
        clearStack:function(){
            this.stack = {};
            $("#"+this.box).html("<div style='margin: 4px 4px; height: 24px;'></div>");

        },
        addTicket:function(id){
            this.stack[id] = id;
            var square = map.squares[id];
            if($("#"+this.box+" div.one_ticket").length == 0)
                $("#"+this.box).html("");
            $("#"+this.box).append('<div class="one_ticket" id="one_ticket'+square.id+'" style="border-color:'+square.color1+'">'+square.areaGroup+'. Ряд '+square.line+' Место '+square.place+' <span class="cost">'+square.salePrice+'руб.</span></div>')
        },

        loadStack:function(){
            this.loadSelectedInfo();
            map.reLoad(function(){
                tickets_stack.clearStack();
                for (var key in map.squares){
                    if (map.squares[key].blocked!=0){
                        map.squares[key].color1 = map.squares[key].blocked;
                        tickets_stack.addTicket(key);
                    }
                }

            });

        },
        loadSelectedInfo:function(){
            //log("selected_order_id:"+selected_order_id);
            if (typeof selected_order_id!="undefined"){

                //log("order_yes");
                var id = selected_order_id;
                MBOOKER.Fn.sendQuery({command:"get",object:"selected_place_info",sid:sid,params:{action_id:environment.action_id,order_id:id}},function(data){
                    //var obj = xmlToObject(data,"RESULT")[0];
                    $("#spi_ORDER_ID").html('<div class="right_column_link left" onclick="open_order('+id+',\'RESERVED\');">'+id+'</div>' +
                        '<div class="vertical_spliter left">|</div>' +
                        '<div class="red_link right_column_link left no_decoration" id="spi_new_order" onclick="tickets_stack.close_order();">X</div>');
                    $("#spi_TOTAL_ORDER_AMOUNT").html(data.TOTAL_ORDER_AMOUNT+" руб.");
                    $("#spi_TOTAL_PAID_ORDER_AMOUNT").html(data.TOTAL_PAID_ORDER_AMOUNT+" руб.");
                    $("#spi_ORDER_TICKET_COUNT").html(data.ORDER_TICKET_COUNT);
                    $("#spi_BLOCKED_PLACE_COUNT").html(data.BLOCKED_PLACE_COUNT);
                    $("#spi_BLOCKED_SUBSCR_PLACE_COUNT").html(data.BLOCKED_SUBSCR_PLACE_COUNT);
                    $("#spi_BLOCKED_PLACE_COUNT_OTHERS").html(data.BLOCKED_PLACE_COUNT_OTHERS);
                    $("#spi_BLOCKED_SUBSCR_PLACE_COUNT_OTHERS").html(data.BLOCKED_SUBSCR_PLACE_COUNT_OTHERS);
                    $("#spi_BLOCKED_TOTAL_AMOUNT").html(data.BLOCKED_TOTAL_AMOUNT+" руб.");
                    $("#spi_TO_PAY").html(data.TO_PAY+" руб.");
                    $("#prepare_order span").html("Добавить в заказ");
                    /*$("#prepare_order").button();*/
                    map.reLoad();
                });
            }else{
                //log("order_no");
                MBOOKER.Fn.sendQuery({command:"get",object:"selected_place_info",sid:sid,params:{action_id:environment.action_id}},function(data){
                    //var obj = MBOOKER.Fn.jsonToObj(data);

                    $("#spi_ORDER_ID").html('Новый');
                    $("#spi_TOTAL_ORDER_AMOUNT").html(data.TOTAL_ORDER_AMOUNT+" руб.");
                    $("#spi_TOTAL_PAID_ORDER_AMOUNT").html(data.TOTAL_PAID_ORDER_AMOUNT+" руб.");
                    $("#spi_ORDER_TICKET_COUNT").html(data.ORDER_TICKET_COUNT);
                    $("#spi_BLOCKED_PLACE_COUNT").html(data.BLOCKED_PLACE_COUNT);
                    $("#spi_BLOCKED_SUBSCR_PLACE_COUNT").html(data.BLOCKED_SUBSCR_PLACE_COUNT);
                    $("#spi_BLOCKED_PLACE_COUNT_OTHERS").html(data.BLOCKED_PLACE_COUNT_OTHERS);
                    $("#spi_BLOCKED_SUBSCR_PLACE_COUNT_OTHERS").html(data.BLOCKED_SUBSCR_PLACE_COUNT_OTHERS);
                    $("#spi_BLOCKED_TOTAL_AMOUNT").html(data.BLOCKED_TOTAL_AMOUNT+" руб.");
                    $("#spi_TO_PAY").html(data.TO_PAY+" руб.");
                    $("#prepare_order span").html("Создать заказ");
                    /*$("#prepare_order").button();*/
                });
            }

        },
        open_order:function(id){
            if (typeof selected_order_id=="undefined") return;
            if(id!=undefined){
                selected_order_id = id;
                this.loadSelectedInfo();
            }

        },
        close_order:function(){
            if (typeof selected_order_id=="undefined") return;
            selected_order_id = undefined;
            this.loadSelectedInfo();
        },
        clear_blocked_place:function(){
            //clear_blocked_place
            MBOOKER.Fn.sendQuery({command:"operation",object:"clear_blocked_place",sid:sid,params:{action_id:environment.action_id}},function(data){
                map.reLoad(function(){
                    tickets_stack.loadStack();
                });

            });
        },
        clear_blocked_placeAll:function(){
            //clear_blocked_place
            MBOOKER.Fn.sendQuery({command:"operation",object:"clear_blocked_place",sid:sid},function(data){
                map.reLoad(function(){
                    tickets_stack.loadStack();
                });

            });
        },
        block_all_places:function(){
            var self = this;
            MBOOKER.Fn.sendQuery({command:"operation",object:"block_all_places",sid:sid,params:{action_id:environment.action_id}},function(data){
                map.reLoad();
                self.loadSelectedInfo();
            });
        }
    };





    tickets_stack = tickets_stack1;
    tickets_stack.clearStack();
    $(".one_ticket").live("click",function(){
        var id = this.id.substr(10);
        alert_yesno("Удалить?","Вы уверены, что хотите удалить билет из заказа?","Да, уверен","Отменить",function(){
            map.blockUnblockSquare(id);
        });

    });
    $(".one_ticket").live("mouseover",function(){
        $(this).css("backgroundColor","#C9C9C9");
        var id = this.id.substr(10);
        var square = mp.squares[id];

        map.showStatus({
            x:$(this).offset().left-310,
            y:$(this).offset().top+$(this).height(),
            status_area:(square.areaGroup)? square.areaGroup : '',
            status_row:(square.line)? square.line : '',
            status_col:(square.place)? square.place : '',
            status_cost:(square.salePrice)? square.salePrice : '',
            status_fund:(square.fundGroup)? square.fundGroup : '',
            status_status:"Выбрано.",
            status_zone:(square.priceGroup)? square.priceGroup : '',
            status_id:(square.id)? square.id : ''
        });
    });
    //#E6E6E6
    $(".one_ticket").live("mouseleave",function(){
        $(this).css("backgroundColor","#E6E6E6");
        /*var id = this.id.substr(10);
         var square = map.squares[id];*/
        map.hideStatus();

    });




    /// Очистить стек билетов
    $("#clear_tickets_stack").click(function(){
        alert_yesno("","Вы уверены что хотите очистить стек билетов?","Да, уверен","Отменить",function(){
            tickets_stack.clear_blocked_place();
        },null,"<span style='color: #f00;'>Да, для всех залов</span>",function(){
            tickets_stack.clear_blocked_placeAll();
        });

    });





    $("#prepare_order").on("click", function(){
        var params = {};
        var object = "reserv_order";
        if (typeof selected_order_id != "undefined") {
            object = "add_tickets_to_order";
            params = {ORDER_ID:selected_order_id};
        }
        MBOOKER.Fn.sendQuery({command:"operation",object:object,sid:sid,params:params}, function(response1){
            if (+response1.RC == "0") {
                map.reLoad();
                tickets_stack.loadStack();
               /* Orders.orderId = response1.ID;
                MBOOKER.Fn.sendQuery({command:"get",object:"order",sid:sid,params:{"WHERE": " ORDER_ID = " + Orders.orderId}}, function(response2){
                    var obj = MBOOKER.Fn.jsonToObj(response2)[0];
                    if (obj.ORDER_ID == Orders.orderId) {
                        Orders.oneOrderTableLoadedYet = false;
                        Orders.orderStatus = obj.STATUS;
                        modal_show("order_modal/index.html", {
                            position_delay:610,
                            zIndex:1200,
                            zIndexFade:1190
                        }, function () {
                            Orders.loadOrderForm(Orders.orderId);
                        });
                    }
                });*/
            } else {
                alert_yesno("<span style='color: #f00;'>Ошибка</span>",response1.MESSAGE,"Ок","",function(){},null);
            }
        });
    });





    $("#map_refresh").click(function(){
        map.reLoad();
    });
    $("#block_all_places").click(function(){
        tickets_stack.block_all_places();
    });

    $("#to_action_list").click(function(){
        switch_content("actions_list",function(){
            testVisibilityminiModal("actions_list");
        });
    });

}

function blockUnblockSquare(square){
    map.squares[square].color0 = "#000";
    var oldText = map.squares[square].textColor;
    map.squares[square].textColor = "#fff";
    map.render();
    MBOOKER.Fn.sendQuery({command:"operation",object:"block_by_cashier",sid:sid,params:{action_scheme_id:map.squares[square].id}},function(data){
        if (+data.RC==0){
            /*if(tickets_stack.stack[square]==undefined){
             tickets_stack.addTicket(square);
             }else{
             tickets_stack.removeTicket(square);
             }*/
            //map.reLoad();
            if (tickets_stack!=undefined)
                tickets_stack.loadStack();

        }else{
            /*if (tickets_stack.stack[square]!=undefined)*/
            alert_yesno("<span style='color:#f00;'>Ошибка.</span>",data.MESSAGE,"Ок","",function(){
                map.squares[square].textColor = oldText;
                map.squares[square].color0 = map.squares[square].color1;
                map.reLoad();
            },function(){
                map.squares[square].textColor = oldText;
                map.squares[square].color0 = map.squares[square].color1;
                map.reLoad();
            });

        }
    });
}

function sendSelection(block){

    if (map.selection.length>0){

        var block_unblock_arr = [];
        var reserved = [];
        for (var k1 in map.selection){
            if (+map.squares[map.selection[k1]].status==1)
                block_unblock_arr.push(map.selection[k1]);
            else if (+map.squares[map.selection[k1]].status==2)
                reserved.push(map.selection[k1]);
        }

        var places = map.selection.join(",");
        var self = map;
        var subcmd = "block_place_list";
        if (!+block)
            subcmd = "unblock_place_list";
        MBOOKER.Fn.sendQuery({command:"operation",object:subcmd,sid:sid,params:{action_scheme_id:places}},function(data){
            self.clearSelection();

            tickets_stack.loadStack();
            //self.reLoad();
        });
        for(var k2 in reserved){
            MBOOKER.Fn.sendQuery({command:"operation",object:"cancel_ticket",sid:sid,params:{action_scheme_id:reserved[k2]}},function(data){})
        }
    }
}

function one_action_content_resize(){
    /*if (mp!=undefined)  {
        mp.init();
    }*/
}





//map.ctx.fillRect(50,50,100,100);

//});



