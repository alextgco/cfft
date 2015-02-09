function log(s){
    console.log(s);
}


var m;

var iAlert = {
    callback:function(){},
    alert:function(s,callback, condition){
        if (typeof callback == "function") this.callback = callback;
        this.content.html(s);
        this.box.fadeIn(350);
        if (typeof condition == 'function'){
            condition(this.content);
        }


    },
    init:function(){
        this.box = $("#iFrameAlert");
        this.content = $("#iFrameAlertContent p");
        this.btn = $("#iFrameAlertConfirm");
        this.cancel = $('#iFrameAlertCancel');
        var self = this;
        this.btn.on('click',function(){
            if(!self.btn.hasClass('disabled')){
                self.box.fadeOut(350);
                self.callback();
            }
        });
        this.cancel.on('click', function(){
            self.box.fadeOut(350);
        });
    }
};







function iFrame_init(sending_obj){

    console.log('SS', sending_obj);

    var width = box.width() || 995;
    var height = box.height() || 550;
    var href = document.location.href;
    var action_id = box.data('action_id');
    var frame = sending_obj.frame || box.data('frame');

    iAlert.init();
    //var frame = "dlwIiI8B4Q8kafizW74wWfHcXF48xBYWZgbIQmMjP65JelQ89g";

    function error(s){
        var msg = "Ошибка зала";
        if (s!=undefined)
            msg = s;
        $("#box_for_multibooker_frame").html(msg);
    }

    function get_action_price_info(squares){

        var obj = [];
        var html = '';
        var container = $('#iFrameLegendList');
        for (var i1 in squares){
            var square = squares[i1];
            if (square.status==0 || +square.price<=0) continue;
            if (obj[square.priceGroup]===undefined){
                obj[square.priceGroup] = {
                    price:square.salePrice,
                    count:1,
                    color:square.color0
                };
            }else{
                obj[square.priceGroup].count++;
            }

        }
        var o2 = [];
        for (var k in obj){
            o2.push(obj[k]);
        }
        o2.sort(function(a,b){
            if (+a.price< +b.price) return -1;
            else if (+a.price>+b.price) return 1;
            return 0;
        });

        for(var i in o2){

            html += '<li>'+
                '<div class="legendColor" style="background-color: '+o2[i].color+'"></div>'+
                '<div class="legendTitle">'+o2[i].price+' руб</div>'+
                '<div class="legendPrice">'+o2[i].count+'</div>'+
                '</li>';
        }

        container.html(html);

        //$('#iFrameLegend').height((action_web.cHeight - action_web.navNarrowSide-2)+'px');
    }

    /* if (href.indexOf("?")>0){
     var params = href.replace(/.+\?/ig,'');
     width = (params.match(/width=/)!=null) ? String(params.match(/width=[0-9]+/)).replace(/width=/,'') : 995;
     height = (params.match(/height=/)!=null) ? String(params.match(/height=[0-9]+/)).replace(/height=/,'') : 550;
     //action_id = (params.match(/action_id=/)!=null) ? String(params.match(/action_id=[0-9]+/)).replace(/action_id=/,'') : 0;

     $("body").css({width:width+"px",height:height+"px"});
     */
    if (action_id==0) {
        box.html('<div style="position: relative; top:49%;height: 49%;"><h2>Мероприятие не указано</h2></div> ');
        return;
    }

    var minusWidth = 0;
    var minusHeight = 0;
    var iFrameLegend = $('#iFrameLegend');
    switch (sending_obj.iFrameLegend_position){
        case "bottom":
            minusHeight = (sending_obj.nav_height!=undefined)? sending_obj.nav_height : 112;
            break;
        default:
            minusWidth = (sending_obj.nav_width!=undefined)? sending_obj.nav_width : 202;
            break;
    }

    var action_web = new Map1({
        container: $("#box_for_action_web"),
        mode:"iFrame",
        cWidth:width,
        cHeight:height,
        navWideSide:(sending_obj.nav_height!=undefined)? sending_obj.nav_height : 202,
        navNarrowSide:(sending_obj.nav_width!=undefined)? sending_obj.nav_width : 112,
        minusWidth:minusWidth,
        minusHeight:minusHeight,
        doc_root:host,
        selectionLimit:10,
        bgColor:sending_obj.bgColor || "#f7f7f7"
    });
    minusHeight = (sending_obj.nav_height!=undefined)? sending_obj.nav_height : 110;
    minusWidth = (sending_obj.nav_width!=undefined)? sending_obj.nav_width : 200;
    var minusH = (action_web.navNarrowSide!=0)?4:0;
    var minusW = (action_web.navWideSide!=0)?2:0;
    switch (sending_obj.iFrameLegend_position){
        case "bottom":
            iFrameLegend.css({
                height:+minusHeight+minusH+"px",
                width:(action_web.cWidth -minusWidth-minusW)+"px"
            });
            break;
        default:
            iFrameLegend.css({
                height:(action_web.cHeight -minusHeight-minusH)+'px',
                width:+minusWidth+minusW+"px"
            });
            break;
    }


    /* var socketObject = {
     type:"get_action_scheme",
     param:"action_id",
     id:action_id,
     portion:30,
     save:{
     command:"operation",
     object:"change_hall_scheme_item_fund_group_by_list",
     field_name:"fund_zone_item_id"
     },
     load:{
     command:"get_action_scheme",
     object:"",
     params:{
     action_id:action_id
     },
     columns:"STATUS,STATUS_TEXT",
     field_name:"action_scheme_id"
     }
     };*/

    var o = {
        command:"get_action_scheme",
        params:{
            action_id:action_id
        }
    };
    var layerO = {
        command:"get_action_scheme_layer",
        object:"",
        params:{
            action_id:action_id,
            VISIBLE_IFRAME:"TRUE",
            columns:"ACTION_SCHEME_LAYER_ID",
            order_by:"SORT_NO"
        }
    };
    var objectO = {
        command:"get_action_scheme_object",
        object:"",
        param_field:"ACTION_SCHEME_LAYER_ID",
        params:{
            /*action_id:action_id,*/
            order_by:"SORT_NO"
        }
    };

    //action_web.openSocket(socketObject);
    action_web.loadSquares(o,function(){
        get_action_price_info(action_web.squares);
        action_web.setMinMax(function(){
            action_web.setScaleCoff(function(){
                action_web.render();
                action_web.setEvents();
            });
        });
      /*  *//*action_web.loadObjects(o2,function(){*//*
        action_web.setLayout(function(){
            action_web.setMinMax(function(){
                action_web.setScaleCoff(function(){



                });

            });
        });*/
        /* });*/

        action_web.countSelectionAmount = function(){
            var count = 0;
            for (var k in action_web.selection){
                count += +action_web.squares[action_web.selection[k]].salePrice;
            }
            return count;
        };
        action_web.setSelectionInfo = function(){
            var count = action_web.countSelection();
            var amount = action_web.countSelectionAmount();
            var serviceFee = parseInt(amount)/100*sending_obj.agent_percent || 0;
            var totalPrice = amount+serviceFee;

            if (count>0){
                $("#ticketsSelected").html(count);
                $("#ticketsTotal").html(amount);
                $("#serviceFee").html(serviceFee);
                $("#totalPrice").html(totalPrice);
                if ($("#otParent:visible").length==0)
                    $("#otParent").fadeIn(100);
            }else{
                if ($("#otParent:visible").length>0)
                    $("#otParent").fadeOut(100);
            }
        };
        action_web.sendSelection = function(){
            if (action_web.countSelection()==0) return;
            //var xml = makeQuery({command:"create_order",object:"",params:{id:action_web.selection.join(','),action_id:action_id,frame:frame,navigator:navigator.userAgent}});

            var confirmText = '<span style="color: #921F1F; font-size: 12px;">' +
                sending_obj.warning+
                '</span>' +
                '<div class="agreementWrap"><label for="agreement"><input type="checkbox" id="agreement" name="agreement">&nbsp;&nbsp;Я принимаю&nbsp;<a class="iFrameLink" target="_blank" href="'+doc_root+sending_obj.rules_path+'">условия пользовательского соглашения</a></label></div>';

            iAlert.alert(confirmText, function(){
                socketQuery({command:"create_order",object:"",params:{id:action_web.selection.join(','),action_id:action_id,frame:frame,navigator:navigator.userAgent}},function(result){
                    //var data = JSON.parse(result);
                    eval("var data = "+result);
                    if (data['results'][0].code && +data['results'][0].code!==0){
                        iAlert.alert(data['results'][0].toastr.message,function(){
                            action_web.clearSelection();
                            action_web.reLoad();

                        });
                        return;
                    }
                    //console.log(data['results'][0]);
                    action_web.toAcquiropay(data['results'][0]);
                });
            }, function(container){
                var okBtn = $('#iFrameAlertConfirm');
                var agreeCheck = container.find('input#agreement');
                okBtn.addClass('disabled');

                agreeCheck.on('change', function(){
                    var state = agreeCheck[0].checked;
                    if(state){
                        okBtn.removeClass('disabled');
                    }else{
                        okBtn.addClass('disabled');
                    }
                });
            });
        };
        action_web.toAcquiropay = function(result){
            var values = {};

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
            values['ok_url'] = doc_root+"iFrame/payment_ok.php?back="+document.location.href;
            values['ko_url'] = doc_root+"iFrame/payment_ko.html?back="+document.location.href;



            //var t = merchant_id + product_id + values['amount'] + values['cf'] + secret_word;
            values['token'] = result['TOKEN'];

            var html = "";
            for(key in values){

                html+= key+'<input type="text" name="'+key+'" value="'+values[key]+'" />';
            }

            //$(".POST").html(html);
            $("#FormPay").html(html);
            $("#FormPay").submit();
            action_web.clearSelection();
            action_web.reLoad();
        };
        action_web.container.on('selectionLimit',function(e,limit){
            iAlert.alert("Вы не можете выбрать более "+limit+" мест",function(){
            });
        });
        action_web.container.on('addToSelection',function(e){
            action_web.setSelectionInfo();
        });
        action_web.container.on('removeFromSelection',function(e){
            action_web.setSelectionInfo();
        });
        action_web.container.on('clearSelection',function(e){
            action_web.setSelectionInfo();
        });
        $("#toPay").on("click",function(){
            action_web.sendSelection();
        });

    });

    var wrap =  $("#box_for_action_web");
    wrap.children("*").each(function(){
        preventSelection($(this)[0]);
        /*if (this.id!="")
         preventSelection(document.getElementById(this.id));*/
    });




    /*action_web = new MapWeb({
     box:"box_for_action_web",
     box2:"box_for_action_web_zoom",
     name:"action_web",
     cWidth:width,
     cHeight:height
     });
     action_web.load({
     command:"get_action_scheme",
     params:{
     action_id:action_id
     },
     loadObjectsParam:{
     object:"action_scheme_object",
     params:{
     where:"ACTION_ID = "+action_id
     }
     },
     reLoadCallback:function(){

     }
     },function(){
     $("a.reload").click(function(){
     action_web.reLoad();

     });
     }
     );
     m = action_web;
     $("#purchase_submit_btn").on("click",function(){
     action_web.sendSelection();
     });
     $("#hint_parent").on("click",function(){
     $(this).fadeOut(350);
     });
     */



    /*   }else{
     error("Мероприятие не указано.");
     return;
     }
     */
    //var width =
    //$("#box_for_map").
};

$(document).ready(function(){
    iFrame_init();
});
