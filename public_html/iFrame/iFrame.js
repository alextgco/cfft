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
    var bWrapper = undefined;

    function guid(){
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r, v;
            r = Math.random() * 16 | 0;
            v = (c === "x" ? r : r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    }

    var Basket = function(params){
        this.items = (localStorage.getItem('basket'))? JSON.parse(localStorage.getItem('basket')) || [] : [];
        this.names = params.names || [];
        $('#basketWrapper').remove();
        $('#basketExpand').remove();
        $('body').prepend('<div id="basketWrapper"></div><div id="basketExpand" class="expanded"></div>');
        this.bWrapper = $('#basketWrapper');
        this.bExpColl = $('#basketExpand');
        this.inMove = false;
    };
    var BasketItem = function(params){
        this.ids = params.ids || undefined;
        this.action_id = params.action_id || undefined;
        this.frame = params.frame || undefined;
        this.id = guid();
    };

    Basket.prototype.syncWithLs = function(type){
        if(type == 'toLs'){
            localStorage.setItem('basket', JSON.stringify(this.items));
        }else{
            if(localStorage.getItem('basket') !== null && localStorage.getItem('basket') !== ""){
                if(this.items.length == 0 && JSON.parse(localStorage.getItem('basket')).length >0){
                    this.items = JSON.parse(localStorage.getItem('basket'));
                }
                if(localStorage.getItem('basket') !== JSON.stringify(this.items)){
                    localStorage.setItem('basket', JSON.stringify(this.items));
                }
            }else{
                localStorage.setItem('basket', JSON.stringify(this.items));
            }
        }

    };
    Basket.prototype.deselectPlace = function(id){
        var _t = this;
        if($.inArray(id, action_web.selection) != -1){
            action_web.container.trigger("squares_select",[0,0,true,id]);
            //action_web.removeFromSelection(id);
        }

    };
    Basket.prototype.selectReservedPlaces = function(){
        var _t = this;
        var arr = [];
        for(var i in this.items){
            if(this.items[i][this.names.indexOf('ACTION_ID')] == sending_obj.box.data('action_id')){
                arr.push(this.items[i][this.names.indexOf('ACTION_SCHEME_ID')]);
            }
        }
        action_web.clearSelection();
        action_web.addToSelection(arr);
    };
    Basket.prototype.addItem = function(item){
        var _t = this;
        var toAdd = undefined;
        _t.getDataByPlaces(item.ids, function(res){
            res = JSON.parse(res);
            toAdd = res;
            function isPresence(item){
                var result = false;
                var id = item[_t.names.indexOf("ACTION_SCHEME_ID")];
                for(var i in _t.items){
                    if(_t.items[i][_t.names.indexOf("ACTION_SCHEME_ID")] == id){
                        result = true;
                    }
                }
                return result;
            }
            for(var i in toAdd.results[0].data){
                var item = toAdd.results[0].data[i];
                if(!isPresence(item)){
                    _t.items.push(item);
                }
            }
            //_t.names = toAdd.results[0].data_columns;
            _t.syncWithLs('toLs');
            _t.render();
        });
    };
    Basket.prototype.getDataByPlaces = function(ids, callback){
        var o = {
            command: 'get_action_scheme_for_basket',
            params: {
                action_scheme_id_list: ids,
                frame:frame
            }
        };
        socketQuery(o, function(res){
            //console.log(res);
            if(typeof callback == 'function'){
                callback(res);
            }
        });
    };
    Basket.prototype.render = function(){
        var _t = this;

        var tpl = '<div class="basketTitle">Корзина</div><ul id="basketList">{{#orders}}<li data-id="{{id}}"><div class="title">{{name}} {{short_date}}</div><div class="zone">{{zone}}</div><div class="rowPlace">ряд: {{line}} место: {{place}}</div><div class="price">{{price}} руб.</div> <div class="removeItem"></div></li>{{/orders}}</ul><div id="saleSiteFee">Сервисный сбор: {{saleSiteFee}} руб.</div><div id="totalAmount">Итого: {{totalAmount}} руб.</div><div id="goToPay">Оплатить</div><div id="clearBasket">Очистить</div>';
        function calculateTotal(){
            var result = 0;
            for(var c in _t.items){
                result += parseInt(_t.items[c][_t.names.indexOf('PRICE')]);
            }
            return result;
        }

        var mustacheObj = {
            orders: [],
            totalAmount: calculateTotal()+_t.getSaleSiteFee(),
            saleSiteFee: _t.getSaleSiteFee()
        };
        for(var i in this.items){
            var oItem = this.items[i];
            var tmpObj = {
                id: oItem[_t.names.indexOf('ACTION_SCHEME_ID')],
                name: oItem[_t.names.indexOf('ACTION_NAME')],
                short_date: oItem[_t.names.indexOf('ACTION_DATE_TIME')].substr(0,5),
                price: oItem[_t.names.indexOf('PRICE')],
                line: oItem[_t.names.indexOf('LINE')],
                zone: oItem[_t.names.indexOf('AREA_GROUP_NAME')],
                place: oItem[_t.names.indexOf('PLACE')]
            };
            mustacheObj.orders.push(tmpObj);
        }
        this.bWrapper.html(Mustache.to_html(tpl, mustacheObj));
        _t.setHandlers();
    };
    Basket.prototype.setHandlers = function(){
        var _t = this;
        var basketContainer = $('#basketList');
        var removeBtn = basketContainer.find('.removeItem');
        var clearBasket = $('#clearBasket');
        var goToPay = $('#goToPay');
        removeBtn.off('click').on('click', function(){
            var item = $(this).parents('li');
            var id = item.data('id');
            _t.removeItem(id);
        });
        this.bExpColl.on('click', function(){
            if(_t.inMove){
                return;
            }
            if(_t.bExpColl.hasClass('expanded')){
                _t.collapse();
                _t.bExpColl.removeClass('expanded');
            }else{
                _t.expand();
                _t.bExpColl.addClass('expanded');
            }

        });
        clearBasket.on('click', function(){
            _t.items = [];
            _t.syncWithLs('toLs');
            action_web.clearSelection();
            action_web.reLoad();
            _t.render();
            _t.bExpColl.click();
        });
        goToPay.on('click', function(){
            _t.goToPay();
        });
    };
    Basket.prototype.removeItem = function(id){
        var _t = this;
        for(var i in this.items){
            var item = this.items[i];
            if(item[_t.names.indexOf('ACTION_SCHEME_ID')] == id){
                this.items.splice(i,1);
            }
        }
        this.syncWithLs('toLs');
        this.deselectPlace(id);
        this.render();
    };
    Basket.prototype.collapse = function(){
        var _t = this;
        _t.inMove = true;
        _t.bWrapper.animate({
            height: 39+'px'
        }, 300, function(){
            _t.bWrapper.animate({
                width: 114+'px'
            }, 200, function(){
                _t.inMove = false;
            });
        });
    };
    Basket.prototype.expand = function(){
        var _t = this;
        _t.inMove = true;
        _t.bWrapper.animate({
            width: 400+'px'
        }, 300, function(){
            _t.bWrapper.animate({
                height: ((_t.bWrapper.find('li').length*59)+44+41 > 485)? 485+'px': (_t.bWrapper.find('li').length*59)+44+41+'px'
            }, 200, function(){
                _t.bWrapper.css('height', 'auto');
                _t.inMove = false;
            });
        });
    };
    Basket.prototype.syncWithHall = function(){
        var _t = this;
        var selection = action_web.selection;

        var arrFromServer;
        if(selection.length > 0){
            _t.getDataByPlaces(selection, function(res){
                res = JSON.parse(res);
                arrFromServer = res;
                populateModel();
            });
        }else{
            populateEmpty();
        }

        function populateEmpty(){
            var notToRemove = [];
            for(var i=0; i < _t.items.length; i++){
                var item = _t.items[i];
                var itemActionId = item[_t.names.indexOf("ACTION_ID")];
                if(itemActionId.toString() != action_id.toString()){
                    notToRemove.push(item);
                }
            }
            _t.items = notToRemove;
            _t.syncWithLs('toLs');
            _t.render();
        }

        function populateModel(){
            var notToRemove = [];
            for(var i=0; i < _t.items.length; i++){
                var item = _t.items[i];
                var itemActionId = item[_t.names.indexOf("ACTION_ID")];
                if(itemActionId.toString() != action_id.toString()){
                    notToRemove.push(item);
                }
            }
            _t.items = notToRemove;
            for(var k in arrFromServer.results[0].data){
                _t.items.push(arrFromServer.results[0].data[k]);
            }
            _t.syncWithLs('toLs');
            _t.render();
        }
        function clearModel(){
            _t.items = [];
            _t.syncWithLs('toLs');
            _t.render();
        }
    };
    Basket.prototype.goToPay = function(){
        var _t = this;
        var ids = [];
        var actionsList = [];
        for(var i in _t.items){
            var item = _t.items[i];
            ids.push(item[_t.names.indexOf('ACTION_SCHEME_ID')]);
        }
        for(var k = 0; k < _t.items.length; k++){
            var kItem = _t.items[k];
            if(k == 0){
                actionsList.push(kItem[_t.names.indexOf('ACTION_ID')]);
            }else{
                if($.inArray(kItem[_t.names.indexOf('ACTION_ID')], actionsList) == -1){
                    actionsList.push(kItem[_t.names.indexOf('ACTION_ID')]);
                }
            }
        }

        var confirmText = '<span style="color: #921F1F; font-size: 12px;">' + sending_obj.warning+ '</span>' +
                        '<div class="agreementWrap">' +
                        '<label for="agreement">' +
                        '<input type="checkbox" id="agreement" name="agreement">' +
                        '&nbsp;&nbsp;Я принимаю&nbsp;' +
                        '<a class="iFrameLink" target="_blank" href="'+doc_root+sending_obj.rules_path+'">' +
                        'условия пользовательского соглашения</a></label>' +
                        '</div>';

        iAlert.alert(confirmText, function(){
            socketQuery({command:"create_order",object:"",params:{id:ids.join(','),action_id:actionsList.join(','),frame:frame}},function(result){
                var data = JSON.parse(result);
                if (data['results'][0].code && +data['results'][0].code!==0){
                    iAlert.alert(data['results'][0].toastr.message,function(){
                        action_web.clearSelection();
                        action_web.reLoad();
                    });
                    return;
                }
                $('#clearBasket').click();
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
    Basket.prototype.getSaleSiteFee = function(){
        var _t = this;
        var total = 0;
        for(var i in _t.items){
            total += parseInt(_t.items[i][_t.names.indexOf('PRICE')]);
        }

        return total/100 *  +sending_obj.agent_percent;
    };

    if(sending_obj.isWithBasket){
        var basket = new Basket({names: ["ACTION_ID", "ACTION_NAME", "ACTION_SCHEME_ID", "PLACE", "LINE", "AREA_GROUP_NAME", "PRICE", "ACTION_DATE_TIME"]});
        basket.syncWithLs('fromLs');
        basket.render();
    }


//    Terminal mode handlers
    function insertZoom(minScale){
        //console.log(sending_obj);
        if(sending_obj.isTerminal){
            alert(123);
            return;
        }
        var isPressed = false;
        var interval = undefined;

        function insertHtml(callback){
            action_web.container.append('<div id="zoom-wrapper"><div class="zoomBtns_n" id="zoom-in">+</div><div class="zoomBtns_n" id="zoom-out">-</div></div>');
            if(typeof callback == 'function'){
                callback();
            }
        }

        var zooms = {
            zIn: function(){
                action_web.container.trigger("scale_map",[790,230,1]);
            },
            zOut: function(){
                action_web.container.trigger("scale_map",[790,230,-1]);
            }
        };

        $(document).on('mouseup', function(){
            isPressed = false;
            if(interval){
                clearInterval(interval);
                action_web.moving = false;
                action_web.render();
                action_web.reLoadLayout();
            }
        });

        insertHtml(function(){
            var termBlocks = {
                zoomBtns: $('#zoom-wrapper'),
                zoomIn: $('#zoom-in'),
                zoomOut: $('#zoom-out')
            };


            termBlocks.zoomBtns.on('mousedown', function(e){
                e = e || window.event;
                var elem = $(e.target);
                var elemId = elem.attr('id');
                if(isPressed){
                    return;
                }
                isPressed = true;
                if(interval){
                    clearInterval(interval);
                }
                interval = window.setInterval(function(){
                    switch(elemId){
                        case 'zoom-in':
                            zooms.zIn();
                            break;
                        case 'zoom-out':
                            zooms.zOut();
                            break;
                        default:
                            break;
                    }
                }, 50);

            });
            $('#zoom-wrapper div').on('mouseup', function(){
                isPressed = false;
                if(interval){
                    clearInterval(interval);
                    action_web.moving = false;
                    action_web.render();

                    action_web.reLoadLayout();
                }
            });
        })
    }

    function initTerminal(minScale){
        var isPressed = false;
        var interval = undefined;

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
        var toAfishaBtn = '<div id="backToAfisha">Афиша</div>';

            $('#box_for_multibooker_frame').append(zoomBtn);
            $('#box_for_multibooker_frame').append(moveBtn);
            $('#box_for_multibooker_frame').append(toAfishaBtn);
            //$.getScript(tempHost+"assets/map/multibooker.frame_init.js");

        var moves = {
            left: function(){
                action_web.XCoeff += 20;
                action_web.render();
            },
            right: function(){
                action_web.XCoeff -= 20;
                action_web.render();
            },
            top: function(){
                action_web.YCoeff += 20;
                action_web.render();
            },
            bottom: function(){
                action_web.YCoeff -= 20;
                action_web.render();
            }
        };
        var zooms = {
            zIn: function(){
                action_web.container.trigger("scale_map",[790,230,1]);
            },
            zOut: function(){
                action_web.container.trigger("scale_map",[790,230,-1]);
            }
        };

        var termBlocks = {
            zoomBtns: $('#zoom-wrapper'),
            moveBtns: $('#move-wrapper div'),
            zoomIn: $('#zoom-in'),
            zoomOut: $('#zoom-out'),
            moveTop: $('#move-top'),
            moveRight: $('#move-right'),
            moveBottom: $('#move-bottom'),
            moveLeft: $('#move-left')
        };
        $(document).on('mouseup', function(){
            isPressed = false;
            if(interval){
                clearInterval(interval);
                action_web.moving=false;
                action_web.render();
                action_web.reLoadLayout();
            }
        });

        termBlocks.zoomBtns.on('mousedown', function(e){
            e = e || window.event;
            var elem = $(e.target);
            var elemId = elem.attr('id');
            if(isPressed){
                return;
            }
            isPressed = true;
            if(interval){
                clearInterval(interval);
            }
            interval = window.setInterval(function(){
                switch(elemId){
                    case 'zoom-in':
                        zooms.zIn();
                        break;
                    case 'zoom-out':
                        zooms.zOut();
                        break;
                    default:
                    break;
                }
            }, 50);

        });

        termBlocks.moveBtns.on('mousedown', function(e){
            e = e || window.event;
            var elem = $(e.target);
            var elemId = elem.attr('id');

            if(isPressed){
                return;
            }
            isPressed = true;
            if(interval){
                clearInterval(interval);
            }
            action_web.moving = true;
            interval = window.setInterval(function(){
                switch(elemId){
                    case 'move-top':
                        moves.top();
                        break;
                    case 'move-right':
                        moves.right();
                        break;
                    case 'move-bottom':
                        moves.bottom();
                        break;
                    case 'move-left':
                        moves.left();
                        break;
                    default:
                        break;
                }
            }, 50);

        });

    }



    var width = box.width() || 995;
    var height = box.height() || 550;
    var href = document.location.href;
    var action_id = box.data('action_id');
    var action_basis_id = box.data('action_basis_id');
    var frame = sending_obj.frame || box.data('frame');
    var hidden_fee = sending_obj.service_fee || 0;
    var saleSiteFee = sending_obj.agent_percent || 0;
    var isWithBasket = sending_obj.isWithBasket;


    iAlert.init();
    //var frame = "dlwIiI8B4Q8kafizW74wWfHcXF48xBYWZgbIQmMjP65JelQ89g";

    function error(s){
        var msg = "Ошибка зала";
        if (s!=undefined)
            msg = s;
        $("#box_for_multibooker_frame").html(msg);
    }

    function get_action_price_info(squares){
        for(var is in squares){
            var sqr = squares[is];
            if (sqr.status==0 || +sqr.price<=0) continue;
            if(sqr.priceGroup == ""){
                sqr.priceGroup = sqr.color0 +" "+ sqr.salePrice + 'руб.';
            }
        }
        var obj = [];
        var html = '';
        var container = $('#iFrameLegendList');
        for (var i1 in squares){
            var square = squares[i1];
            if (square.status==0 || +square.price<=0) continue;
            if (obj[square.priceGroup]===undefined){
                obj[square.priceGroup] = {
                    price:+square.salePrice,// + (+square.salePrice/100*hidden_fee),
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




    }

   /* if (href.indexOf("?")>0){
        var params = href.replace(/.+\?/ig,'');
        width = (params.match(/width=/)!=null) ? String(params.match(/width=[0-9]+/)).replace(/width=/,'') : 995;
        height = (params.match(/height=/)!=null) ? String(params.match(/height=[0-9]+/)).replace(/height=/,'') : 550;
        //action_id = (params.match(/action_id=/)!=null) ? String(params.match(/action_id=[0-9]+/)).replace(/action_id=/,'') : 0;

        $("body").css({width:width+"px",height:height+"px"});
*/
        if (!action_id && !action_basis_id) {
            box.html('<div style="position: relative; top:49%;height: 49%;"><h2>Мероприятие не указано</h2></div> ');
            return;
        }

    /***            **/

    var minusWidth = 0;
    var minusHeight = 0;
    var iFrameLegend = $('#iFrameLegend');
    switch (sending_obj.iFrameLegend_position){
        case "bottom":
            minusHeight = (sending_obj.nav_height!=undefined)? sending_obj.nav_height : 112;
            //minusHeight = 202;
            break;
        default:
            minusWidth = (sending_obj.nav_width!=undefined)? sending_obj.nav_width : 202;
            //minusWidth = 112;
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
        doc_root:doc_root || host,
        selectionLimit:10,
        bgColor:sending_obj.bgColor || "#f7f7f7"
    });
    minusHeight = (sending_obj.nav_height!=undefined)? sending_obj.nav_height : 110;
    minusWidth = (sending_obj.nav_width!=undefined)? sending_obj.nav_width : 200;
    var minusH = (action_web.navNarrowSide!=0)?4:0;
    var minusW = (action_web.navWideSide!=0)?2:0;
    switch (sending_obj.iFrameLegend_position){
        case 'right':
            iFrameLegend.css({
                height:+minusHeight+minusH+"px",
                width:(action_web.cWidth -minusWidth-minusW)+"px",
                left: 700+'px'
            });
            break;
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


        var o = {
            command:"get_action_scheme",
            params:{
                action_id:action_id,
                frame:frame
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
        if (action_basis_id){
            delete o.params.action_id;
            o.params.action_basis_id = action_basis_id;
            delete layerO.params.action_id;
            layerO.params.action_basis_id = action_basis_id;
            delete objectO.params.action_id;
            objectO.params.action_basis_id = action_basis_id;
        }
        //action_web.openSocket(socketObject);

        action_web.loadSquares(o,function(){
            get_action_price_info(action_web.squares);
            action_web.loadRenderItems({
                layerO:layerO,
                objectO:objectO
            },function(){
                action_web.render();
            });
            /*action_web.loadObjects(o2,function(){*/
                action_web.setLayout(function(){
                    action_web.setMinMax(function(){
                        action_web.setScaleCoff(function(){
                            action_web.render(function(){
                                action_web.reLoadLayout(function(){});

                                if(sending_obj.isWithBasket){
                                    basket.selectReservedPlaces();
                                    insertZoom(action_web.scaleCoeff);
                                }
                                if(sending_obj.isTerminal != undefined && sending_obj.isTerminal){
                                    //console.log('Terminal', action_web);
                                    initTerminal(action_web.scaleCoeff);
                                }
                            });

                            action_web.setEvents();
                        });

                    });
                });
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
                var serviceFee = parseInt(amount)/100*sending_obj.agent_percent  || 0;
                var totalPrice = amount+serviceFee;

                if(sending_obj.isWithBasket){
                    basket.syncWithHall();
                    return;
                    for(var i in basket.items){
                        if(basket.items[i][basket.names.indexOf('ACTION_ID')] == action_id){
                            basket.items.splice(i,1);
                            basket.syncWithLs();
                            basket.render();
                        }
                    }
                    if (count>0){
                        var bItem = new BasketItem({
                            ids: action_web.selection.join(','),
                            action_id:action_id,
                            frame:frame
                        });
                        basket.addItem(bItem);
                        basket.syncWithLs();
                    }else{

                    }
                }else{
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
                }
            };
            action_web.sendSelection = function(){
                if (action_web.countSelection()==0) return;
                //var xml = makeQuery({command:"create_order",object:"",params:{id:action_web.selection.join(','),action_id:action_id,frame:frame,navigator:navigator.userAgent}});

                var confirmText = '<span style="color: #921F1F; font-size: 12px;">' +
                    /*'Нажимая кнопку "Ок" Вы перейдете на страницу оплаты и не сможете внести изменения в выбранные Вами для покупки билеты.' +*/
                    sending_obj.warning+
                    '</span>' +
                    '<div class="agreementWrap"><label for="agreement"><input type="checkbox" id="agreement" name="agreement">&nbsp;&nbsp;Я принимаю&nbsp;<a class="iFrameLink" target="_blank" href="'+doc_root+sending_obj.rules_path+'">условия пользовательского соглашения</a></label></div>';

                if(!sending_obj.isWithBasket){
                    iAlert.alert(confirmText, function(){
                        socketQuery({command:"create_order",object:"",params:{id:action_web.selection.join(','),action_id:action_id,frame:frame}},function(result){
                            var data = JSON.parse(result);
                            if (data['results'][0].code && +data['results'][0].code!==0){
                                iAlert.alert(data['results'][0].toastr.message,function(){
                                    action_web.clearSelection();
                                    action_web.reLoad();
                                });
                                return;
                            }
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
                }
            };

            action_web.toAcquiropay = function(result){
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
                values['ok_url'] = doc_root+"iFrame/payment_ok.php?back="+document.location.href;
                values['ko_url '] = doc_root+"iFrame/payment_ko.html";



                //var t = merchant_id + product_id + values['amount'] + values['cf'] + secret_word;
                values['token'] = result['TOKEN'];

                var html = "";
                for(key in values){

                    html+= key+'<input type="text" name="'+key+'" value="'+values[key]+'" />';
                }
                //console.log('VALUES', values);
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

}

$(document).ready(function(){

});
