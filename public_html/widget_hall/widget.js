var widget;
(function(){

    var wrapper = $('#multibooker-widget-wrapper');
    var initData = wrapper.data();
    var interval;
    var zoomInterval;
    if(typeof initData['actions'] !== 'string'){
        initData['actions'] = initData['actions'].toString();
    }
    widget = {
        maps:{},
        map: undefined,
        active_action_id: undefined,
        active_action: undefined,
        init: function(){
            widget.getScripts(function(){
                widget.getActions(function(){
                    widget.populateWidget(function(){
                        widget.loader(true);
                        widget.setHandlers(function(){
                            widget.renderCanvas(widget.getActionById(),function(){

                                var active_id = widget.getActionById();
                                var alias = ('action_' + active_id['ACTION_ID']);
                                if(typeof active_id == 'object'){
                                    widget.active_action_id = active_id['ACTION_ID'];
                                }
                                widget.loader(false);

                                widget.populateMapFromLs(widget.getActionById()['ACTION_ID'], function(){
                                    widget.setBasketHandlers();

                                });
                            });
                        });
                    });
                });
            });
        },
        getScripts: function(callback){
            $.getScript(initData.host + 'assets/js/plugins/mustache.js', function(res){});



            $.getScript(initData.host + 'assets/js/no_select.js', function(res){
                $.getScript(initData.host + 'assets/js/libs/jquery/plugins/jquery.mousewheel.min.js', function(res){
                    $.getScript(initData.host + 'assets/js/map.js', function(res){

                    });
                });
            });
            $.getScript(initData.host + 'socket.io/socket.io.js', function(res){
                $.getScript(initData.host + 'assets/widget/core.js', function(res){

                    if (typeof Hammer !== "function") {
                        $.getScript((doc_root || params.host) + 'assets/js/libs/hammer.min.js', function (res) {
                        });
                    }

                    var cssLinks = '' +
                        '<link rel="stylesheet" type="text/css" href="'+initData.host+'assets/widget/style.css"/><link rel="stylesheet" type="text/css" href="'+initData.host+'assets/widget/font-awesome-4.2.0/css/font-awesome.min.css"/>' +
                        '<link rel="stylesheet" type="text/css" href="'+initData.host+'assets/css/map.css"/><link rel="stylesheet" type="text/css" href="'+initData.host+'assets/widget/font-awesome-4.2.0/css/font-awesome.min.css"/>';
                    $('body').append(cssLinks);
                    if(typeof callback == 'function'){
                        callback();
                    }
                });
            });
        },
        sortActions: function(obj){
            var resultArr = [];
            for(var i in initData['actions'].split(',')){
                var idxId = initData['actions'].split(',')[i];
                for(var k in obj.data){
                    var act = obj.data[k];
                    if(act[obj.data_columns.indexOf('ACTION_ID')] == idxId){
                        resultArr.push(act);
                    }
                }
            }
            obj.data = resultArr;
            return obj;
        },
        loader: function(state){
            var loader = wrapper.find('.mbw-loader');
            if(state == true){
                loader.show();
            }else{
                loader.hide();
            } 
        },
        renderScene: function(){
            var bunnerElem = wrapper.find('.mbw-scene-bunner');
            var map = widget.map;
            var sceneInfo = widget.getActionById(widget.active_action_id)['SCENE_INFO'];
            if(sceneInfo == ''){
                bunnerElem.hide(0);
                return;
            }
            sceneInfo = (sceneInfo == '')? {}: JSON.parse(widget.getActionById(widget.active_action_id)['SCENE_INFO']);
            var cY1 = - map.YCoeff / map.scaleCoeff;
            var cX1 = - map.XCoeff / map.scaleCoeff;

            var cY2 = (map.cHeight - map.YCoeff) / map.scaleCoeff;
            var cX2 = (map.cWidth - map.XCoeff) / map.scaleCoeff;

            var minSchY = map.minY;
            var minSchX = map.minX;

            var maxSchY = map.maxY;
            var maxSchX = map.maxX;

            var sceneAbsY = sceneInfo.y;
            var sceneAbsX = sceneInfo.x;

            var schCenterY = (maxSchY - minSchY) / 2;
            var schCenterX = (maxSchX - minSchX) / 2;

            var angle = map.get_angle({x: schCenterX, y: schCenterY},{x: sceneAbsX, y:sceneAbsY});

            var b = schCenterY - cY1;
            var a = b * Math.tan(angle);
            var bunnerX = schCenterX + a;

//            var bunnerCanvasX = bunnerX * map.scaleCoeff + map.XCoeff;
//            var bunnerCanvasY = (sceneAbsY + map.scaleCoeff + map.YCoeff > 0)? sceneAbsY + map.scaleCoeff + map.YCoeff : 0;


            var bunCanY =  sceneAbsY * map.scaleCoeff + map.YCoeff;
            if(bunCanY <= 0 || bunCanY >= map.cHeight){
                if(bunCanY <= 0){
                    bunCanY = 0;
                }else if(bunCanY >= map.cHeight - bunnerElem.outerHeight()){
                    bunCanY = map.cHeight - bunnerElem.outerHeight();
                }
            }
            var bunCanX =  sceneAbsX * map.scaleCoeff + map.XCoeff;
            if(bunCanX <= 0 || bunCanX >= map.cWidth){
                if(bunCanX <= 0){
                    bunCanX = 0;
                }else if(bunCanX >= map.cWidth - bunnerElem.outerWidth()){
                    bunCanX = map.cWidth - bunnerElem.outerWidth();
                }
            }


            bunnerElem.css({
                top: bunCanY + 'px',
                left: bunCanX + 'px'
            });

//            bunnerElem.css({
//                top: bunnerCanvasY + 'px',
//                left: bunnerCanvasX + 'px'
//            });

        },
        getActions: function(callback){
            var o = {
                command: 'get_actions',
                params: {
                    action_id: initData['actions'],
                    frame: initData.frame
                }
            };
            socketQuery(o, function(res){
                res = JSON.parse(res);
                widget.actions = jsonToObj(widget.sortActions(res['results'][0]));

                /**
                 * Возвращает информацию по мероприятию. Если id не указано, возвращает первое в списке мероприятие
                 * @param id мероприятия
                 * @returns {*}
                 */

                if(typeof callback == 'function'){
                    callback();
                }
            });
        },
        getData: function(callback){
            return;
            var o;
            var action_id = initData.actions.split(',')[0];
            if(initData['iszones']){
                o = {
                    command: 'get_action_sectors',
                    params:{
                        action_id: action_id,
                        frame: initData.frame
                    }
                };
            }else{
                var socketObject = {
                    type:"action_scheme",
                    param:"action_id",
                    id:action_id,
                    portion:30,
                    save:{
                        // command:"operation",
                        // object:"block_place_list",
                        // field_name:"action_scheme_id"
                    },
                    load:{
                        command:"get_action_scheme",
                        params:{
                            action_id:action_id
                        },
                        columns:"ACTION_SCHEME_ID,PRICE,STATUS,STATUS_TEXT,FUND_GROUP_NAME,PRICE_GROUP_NAME,BLOCK_COLOR,COLOR",
                        field_name:"action_scheme_id"
                    }
                };
                var layerO = {
                    command: "get_action_scheme_layer",
                    params: {
                        action_id:action_id
                    }
                };
                var objectO = {
                    command: "get_action_scheme_object",
                    where_field: "ACTION_SCHEME_LAYER_ID",
                    params: {
                        action_id:action_id,
                        order_by: "SORT_NO"
                    }
                };
            }

            /*socketQuery(o, function(res){
                res = JSON.parse(res);
                widget.data = res['results'][0];

                if(typeof callback == 'function'){
                    callback();
                }
            });*/

        },
        populateWidget: function(callback){
            var ddToggleHtml = '';
            var moveLang = '';
            var invisBtns = '';
            var hideDD = '';
            if(initData['actions'].split(',').length > 1){

            }else{
                moveLang = 'moveLang';
                hideDD = 'hidden';
            }

            if(initData['iszones'] == false){
                invisBtns = 'hidden';
            }else{
                wrapper.addClass('zonesView');
            }
            var tpl = '<div class="mbw-header"><div class="mbw-header-inner"><div class="mbw-title">{{title}}</div>' +
                        '<div class="mbw-lang-switcher '+moveLang+'">' +
                            '<div class="mbw-lang active" data-lang="rus">RUS</div>' +
                            '<div class="mbw-lang" data-lang="eng">ENG</div>' +
                        '</div>' +
                        '<div class="mbw-dd-toggler '+hideDD+'"><span class="mbw-switch-lang" data-keyword="allEvents">Все мероприятия</span> <i class="fa fa-angle-down"></i></div></div>' +
                        '<div class="mbw-dd '+hideDD+'">' +
                            '<ul>' +
                                '<li class="mbw-first-li">' +
                                    '<div class="mbw-left-title"><span class="mbw-switch-lang" data-keyword="action">Мероприятие</span></div>' +
                                    '<div class="mbw-right-title"><span class="mbw-switch-lang" data-keyword="freePlaceCount">Свободных мест</span></div>' +
                                '</li>' +
                                '{{#actions}}' +
                                '<li data-action-id="{{id}}">' +
                                    '<div class="mbw-left-title">{{title}}</div>' +
                                    '<div class="mbw-right-title">{{freePlaceCount}}</div>' +
                                '</li>' +
                                '{{/actions}}' +
                            '</ul>' +
                        '</div>' +
                      '</div>' +

                      '<div class="mbw-content">' +
                        '<div class="mbw-canvas-wrapper"></div>' +
                        '<div class="mbw-zoom-in"><i class="fa fa-plus"></i></div>' +
                        '<div class="mbw-zoom-out"><i class="fa fa-minus"></i></div>' +
                        '<div class="mbw-priceGroups-wrapper"><ul></ul></div>' +
                        '<div class="mbw-loader" style="background-image: url(\''+initData.host+'assets/widget/preloader.GIF\')"></div>' +
                        '<div class="mbw-prompt-wrapper"></div>' +
                        //'<div class="mbw-scene-bunner"><span class="mbw-switch-lang" data-keyword="scene">Сцена</span></div>' +
                      '</div>' +

                      '<div class="mbw-footer">' +
                        '<div class="mbw-back '+invisBtns+'">' +
                            '<span class="mbw-switch-lang" data-keyword="back-to-zones">Вернуться</span>' +
                        '</div>' +
                        '<div class="mbw-forward '+invisBtns+'">' +
                            '<span class="mbw-switch-lang" data-keyword="go-to-hall">Перейти к местам</span>' +
                        '</div>' +
                        '<div class="mbw-basket-wrapper">' +
                            '<div class="mbw-total-wrapper">' +
                                '<i class="mbw-basket-sign fa fa-shopping-cart"></i>'+
                                '<div class="mbw-total-inner">' +
                                    '<div class="mbw-service-fee-total">' +
                                        '<span class="mbw-switch-lang" data-keyword="service-fee">Сервисный сбор</span>: ' +
                                        '<span class="mbw-service-fee-insert">0</span> ' +
                                        '<span class="mbw-switch-lang" data-keyword="rub">руб.</span>' +
                                    '</div>' +
                                    '<div class="mbw-total-amount">' +
                                        '<span class="mbw-switch-lang" data-keyword="total-amount">Итого</span>: ' +
                                        '<span class="mbw-total-amount-insert">0</span> ' +
                                        '<span class="mbw-switch-lang" data-keyword="rub">руб.</span>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="mbw-clear-basket-wrapper">' +
                                '<span class="mbw-switch-lang" data-keyword="clear-basket">Очистить<br />корзину</span>' +
                            '</div>' +
                            '<div class="mbw-purchase-order">' +
                                '<span class="mbw-switch-lang" data-keyword="purchase-order">Оплатить</span>' +
                            '</div>' +
                            '<div class="mbw-basket-dd-wrapper">' +
                                '<div class="mbw-basket-dd-header">' +
                                    '<div class="mbw-basket-dd-title">' +
                                        '<span class="mbw-switch-lang" data-keyword="basket">Корзина</span>' +
                                    '</div>'+
                                    '<div class="mbw-basket-dd-close"><i class="fa fa-angle-down"></i></div>' +
                                '</div>' +

                                '<div class="mbw-basket-dd-content">' +
                                    '<ul><li class="mbw-empty-basket"><span class="mbw-switch-lang" data-keyword="emptyBasket">Корзина пуста</span></li></ul>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<form method="POST" action="https://secure.acquiropay.com/" class="mbw-form-pay"></form>' +
                      '</div>';

            var mO = {
                title: '',
                actions: []
            };

            mO.title = widget.actions[0]['ACTION_NAME'] +' - '+ widget.actions[0]['ACTION_DATE'] +', '+widget.actions[0]['HALL'];
            for(var i in widget.actions){
                var action = widget.actions[i];
                if(typeof action == 'function'){
                    continue;
                }
                mO.actions.push({
                    id: action['ACTION_ID'],
                    title: action['ACTION_NAME'],
                    freePlaceCount: action['FREE_PLACE_COUNT']
                });
            }


            wrapper.addClass(initData['widget_theme']);
            wrapper.html(Mustache.to_html(tpl, mO));
            widget.canvasContainer = wrapper.find('.mbw-canvas-wrapper');
            widget.basketUl = wrapper.find('.mbw-basket-dd-content ul');
            widget.totalFee = wrapper.find('.mbw-service-fee-insert');
            widget.totalAmount = wrapper.find('.mbw-total-amount-insert');
            widget.clearBasket = wrapper.find('.mbw-clear-basket-wrapper');
            widget.priceGroups = wrapper.find('.mbw-priceGroups-wrapper ul');


            if(typeof callback == 'function'){
                callback();
            }
        },                      //POPULATE WIDGET
        getActionById: function(id){
            if (!id) {
                return widget.actions[0];
            }
            for (var i in widget.actions) {
                if (isNaN(+i)) {
                    continue;
                }
                if (+widget.actions[i].ACTION_ID === +id) {
                    return widget.actions[i];
                }
            }
            return false;
        },
        renderCanvas: function(obj, callback){


            if (typeof callback !== "function") {
                callback = function(){};
            }

            if (typeof obj !== "object"){
                return callback();
            }

            var action_id = +obj.ACTION_ID;
            var frame = obj.FRAME;
            var alias = ('action_' + action_id);
            if (typeof widget.map==="object"){
                if (typeof widget.map.destroy === 'function'){
                    widget.map.destroy();
                    delete widget.map;
                }
            }
            widget.map = new Map1({
                container:widget.canvasContainer,
                mode:"iFrame",
                displayNavigator:'none',
                /*cWidth:width,*/
                /*cHeight:598,*/
                cHeight:800,
                doc_root:doc_root || host,
                selectionLimit:10,
                /*bgColor:"#423c30",*/
                bgColor:(obj.BG_COLOR && obj.BG_COLOR!=="")? obj.BG_COLOR : "#f7f7f7",
                zonesBgColor:"#423c30"
            });
            /*wrapper.find("*").each(function(){
                preventSelection($(this)[0]);
            });*/

            var socketObject = {
                type:"action_scheme",
                param:"action_id",
                id:action_id,
                portion:30,
                save:{},
                load:{
                    command:"get_action_scheme",
                    params:{
                        action_id:action_id,
                        frame:frame
                    },
                    /*columns:"ACTION_SCHEME_ID,PRICE,STATUS,STATUS_TEXT,FUND_GROUP_NAME,PRICE_GROUP_NAME,BLOCK_COLOR,COLOR",*/
                    field_name:"action_scheme_id"
                }
            };
            var squareO = {
                command: socketObject.load.command,
                params: socketObject.load.params
            };
            var layerO = {
                command: "get_action_scheme_layer",
                params: socketObject.load.params
            };
            var objectO = {
                command: "get_action_scheme_object",
                params:{},
                param_field:"ACTION_SCHEME_LAYER_ID"
            };


            if(initData['iszones']){
                widget.map.loadSectors({
                    socketObject:socketObject,
                    squareO:squareO,
                    layerO:layerO,
                    objectO:objectO,
                    action_id:action_id,
                    frame:frame,
                    theme:initData['widget_theme']
                },function(){

                    callback();
                });

                console.log('go go render zones');
            }else{
                console.log('go go render hall scheme');
                widget.map.loadSquares(squareO, function () {

                    widget.map.loadRenderItems({
                        layerO: layerO,
                        objectO: objectO
                    }, function () {
                        //map.render();
                    });
                    widget.map.setLayout(function () {
                        widget.map.setMinMax(function () {
                            widget.map.setScaleCoff(function () {
                                widget.map.render(function () {
                                    widget.updateMap();
                                    widget.map.reLoadLayout(function () {
                                        widget.populateLegend();
                                        if(typeof callback == 'function'){
                                            callback();
                                        }

                                    });
                                });
                                widget.map.setEvents();
                            });

                        });
                    });
                });

            }

            //map.openSocket(socketObject);
            /*widget.map.loadSquares(squareO, function () {

                widget.map.loadRenderItems({
                    layerO: layerO,
                    objectO: objectO
                }, function () {
                    //map.render();
                });
                widget.map.setLayout(function () {
                    widget.map.setMinMax(function () {
                        widget.map.setScaleCoff(function () {
                            widget.map.render(function () {
                                widget.map.reLoadLayout(function () {
                                    widget.populateLegend();
                                    if(typeof callback == 'function'){
                                        callback();
                                    }

                                });
                            });
                            widget.map.setEvents();
                        });

                    });
                });
            });*/
        },                   //RENDER CANVAS
        populateMapFromLs: function(actionId, callback){
            var active_id = widget.getActionById(actionId);
            var alias = ('action_' + active_id['ACTION_ID']);
            if(typeof active_id == 'object'){
                var mapInstance = widget.map;
                var storedTickets = localStorage.getItem('mbw-basket');
                if(storedTickets == null){
                    return;
                }
                storedTickets = JSON.parse(storedTickets);

                for(var i in storedTickets.actions){
                    var act = storedTickets.actions[i];
                    if(act.id == actionId){
                        var selArr = [];
                        for(var pl in act.places){
                            var square = widget.map.squares[act.places[pl].id];
                            if (!square){
                                continue;
                            }
                            if(square.status !== 0){
                                selArr.push(act.places[pl].id);
                            }
                        }
                        mapInstance.addToSelectionArray(selArr);
                    }
                }
            }

            if(typeof callback == 'function'){
                callback();
            }
        },
        switchLanguage: function(lang){
            var keywords = [
                {
                    key: 'go-to-hall',
                    rus: 'Перейти к местам',
                    eng: 'Show places'
                },
                {
                    key: 'action',
                    rus: 'Мероприятие',
                    eng: 'Event'
                },
                {
                    key: 'scene',
                    rus: 'Сцена',
                    eng: 'Scene'
                },
                {
                    key: 'emptyBasket',
                    rus: 'Корзина пуста',
                    eng: 'Cart is empty'
                },
                {
                    key: 'allEvents',
                    rus: 'Все мероприятия',
                    eng: 'All Events'
                },
                {
                    key: 'freePlaceCount',
                    rus: 'Свободных мест',
                    eng: 'Places free'
                },
                {
                    key: 'back-to-zones',
                    rus: 'Вернуться',
                    eng: 'Back'
                },
                {
                    key: 'service-fee',
                    rus: 'Сервисный сбор',
                    eng: 'Service fee'
                },
                {
                    key: 'rub',
                    rus: 'руб.',
                    eng: 'rub.'
                },
                {
                    key: 'total-amount',
                    rus: 'Итого',
                    eng: 'Total'
                },
                {
                    key: 'clear-basket',
                    rus: 'Очистить<br />корзину',
                    eng: 'Clear<br />basket'
                },
                {
                    key: 'purchase-order',
                    rus: 'Оплатить',
                    eng: 'Purchase'
                },
                {
                    key: 'basket',
                    rus: 'Корзина',
                    eng: 'Cart'
                }
            ];
            var blocks = wrapper.find('.mbw-switch-lang');
            for(var i=0; i<blocks.length; i++){
                var block = blocks.eq(i);

                for(var k in keywords){
                    var item = keywords[k];
                    if(item.key == block.data('keyword')){
                        block.html(item[lang]);
                    }
                }
            }
        },
        /**
         *
         * @param places [] Массив мест {}
         * @param callback
         */
        addToLS: function(places,callback){
            if (typeof places!=="object"){
                console.log('addToLS не передан places');
                return;
            }

            var inls = localStorage.getItem('mbw-basket');
            if (inls == null){
                inls = {
                    actions: []
                };
                localStorage.setItem('mbw-basket',JSON.stringify(inls));
            }else{
                inls = JSON.parse(inls);
            }

            //поверим есть ли в LS action_id
            var current_action = false;
            for (var j in inls.actions) {
                var action = inls.actions[j];
                if (action.id===widget.active_action_id){
                    current_action = action;
                    break;
                }
            }
            if (!current_action) {
                var lenght = inls.actions.push({
                    id: widget.active_action_id,
                    places: []
                });
                current_action = inls.actions[lenght-1];
            }

            for (var i in places) {
                var place = places[i];
                var alreadyAdded = false;
                for (var i2 in current_action.places) {
                    var placeInLS = current_action.places[i2];
                    if (placeInLS.id == place.id){
                        alreadyAdded = true;
                        break;
                    }
                }
                if (!alreadyAdded){
                    current_action.places.push(place);
                }
            }
            localStorage.setItem('mbw-basket', JSON.stringify(inls));

        },
        removeFromLS:function(action_id,place_id){
            if (!action_id || !place_id){
                console.log('removeFromLS не передан action_id || place_id');
                return;
            }
            var inls = localStorage.getItem('mbw-basket');
            if (inls == null){
                return;
            }
            inls = JSON.parse(inls);
            for (var i in inls.actions) {
                var act = inls.actions[i];
                if (act.id==action_id){
                    for (var i2 in act.places) {
                        var place = act.places[i2];
                        if (place.id==place_id){
                            act.places.splice(i2,1);
                            break;
                        }
                    }
                    break;
                }
            }
            localStorage.setItem('mbw-basket', JSON.stringify(inls));
        },
        clearLS:function(){
            var inls = {
                    actions: []
                };
                localStorage.setItem('mbw-basket',JSON.stringify(inls));
        },
        updateMap:function(){
            var inls = localStorage.getItem('mbw-basket');
            var mapInstance = widget.map;
            if (inls == null || typeof mapInstance.squares!=="object"){
                return;
            }
            inls = JSON.parse(inls);
            mapInstance.clearSelection(true);
            for (var i in inls.actions) {
                var action = inls.actions[i];
                if (action.id == widget.active_action_id){
                    var places = action.places;
                    var placesArray = [];
                    for (var i2 in places) {
                        placesArray.push(places[i2].id)
                    }

                    console.log(placesArray);

                    mapInstance.addToSelectionArray(placesArray,true);
                }
            }
            mapInstance.render();

        },
        syncSelectionWithLS: function(callback){
            return;
            var mapInstance = widget.map;
            var inls = localStorage.getItem('mbw-basket');


            var placesArr = [];
            for(var p in mapInstance.selection){
                placesArr.push(widget.map.squares[mapInstance.selection[p]]);
            }

            if(inls == null){
                var mbwBasket = {
                    actions: []
                };
                var actionObj = {
                    id: widget.active_action_id,
                    places: placesArr
                };

                mbwBasket.actions.push(actionObj);

                localStorage.setItem('mbw-basket', JSON.stringify(mbwBasket));
            }else{
                inls = JSON.parse(inls);
                var notFound = 0;
                for(var i in inls.actions){
                    var act = inls.actions[i];
                    if(act.id == widget.active_action_id){
                        //console.log(placesArr);

                        for(var pl in act.places){
                            var plc = act.places[pl];
                            
                        }

                        act.places = placesArr;
                    }else{
                        notFound++;
                    }
                }



                if(notFound == inls.actions.length){
                    var newAction = {
                        id: widget.active_action_id,
                        places: placesArr
                    };
                    inls.actions.push(newAction);
                }

                localStorage.setItem('mbw-basket', JSON.stringify(inls));
            }

            if(typeof callback == 'function'){
                callback();
            }

        },
        switchTitle: function(){
            var action = widget.getActionById(widget.active_action_id);
            var title = action['ACTION_NAME'] +' - '+ action['ACTION_DATE'] +', '+action['HALL'];
            wrapper.find('.mbw-title').html(title);
        },
        setHandlers: function(callback){
            widget.basketToggler = wrapper.find('.mbw-total-wrapper');
            widget.basketDD = wrapper.find('.mbw-basket-dd-wrapper');
            widget.closeDD = wrapper.find('.mbw-basket-dd-close');
            widget.actionsDDToggler = wrapper.find('.mbw-dd-toggler');
            widget.actionsDD = wrapper.find('.mbw-dd');
            widget.langSwitcher = wrapper.find('.mbw-lang-switcher .mbw-lang');
            widget.zoomIn = wrapper.find('.mbw-zoom-in');
            widget.zoomOut = wrapper.find('.mbw-zoom-out');
            widget.purchaseBtn = wrapper.find('.mbw-purchase-order');
            widget.backBtn = wrapper.find('.mbw-back');
            widget.forwardBtn = wrapper.find('.mbw-forward');

            var mbw_tap_zoomIn = new Hammer(widget.zoomIn[0], {});
            var mbw_tap_zoomOut = new Hammer(widget.zoomOut[0], {});

            widget.basketToggler.off('click').on('click', function(){
                if(widget.basketDD.hasClass('opened')){
                    widget.basketDD.animate({
                        bottom: -322+'px'
                    }, 200,function(){
                        widget.basketDD.removeClass('opened');
                    });
                }else{
                    widget.basketDD.animate({
                        bottom: 78+'px'
                    }, 200,function(){
                        widget.basketDD.addClass('opened');
                    });
                }
            });

            widget.closeDD.off('click').on('click', function(){
                widget.basketDD.animate({
                    bottom: -322+'px'
                }, 200,function(){
                    widget.basketDD.removeClass('opened');
                });
            });

            widget.actionsDDToggler.off('click').on('click', function(){
                if(widget.actionsDD.hasClass('opened')){
                    widget.actionsDD.animate({
                        top: -116+'px'
                    }, 200,function(){
                        widget.actionsDD.removeClass('opened');
                    });
                }else{
                    widget.actionsDD.animate({
                        top: 50+'px'
                    }, 200,function(){
                        widget.actionsDD.addClass('opened');
                    });
                }
            });

            widget.langSwitcher.off('click').on('click', function(){
                var other = undefined;
                if(!$(this).hasClass('active')){
                    if($(this).attr('data-lang') == 'rus'){
                        other = wrapper.find('.mbw-lang-switcher .mbw-lang[data-lang="eng"]');
                        widget.switchLanguage('rus');
                    }else{
                        other = wrapper.find('.mbw-lang-switcher .mbw-lang[data-lang="rus"]');
                        widget.switchLanguage('eng');
                    }
                    $(this).addClass('active');
                    other.removeClass('active');
                }

            });

            widget.actionsDD.find('li:not(".mbw-first-li")').off('click').on('click', function(){
                var actId = $(this).data('action-id');
                widget.glowPriceGroup('', false);
                widget.loader(true);
                widget.backBtn.hide(0);
                widget.forwardBtn.show(0);
                widget.actionsDD.animate({
                    top: -116+'px'
                }, 200,function(){
                    widget.actionsDD.removeClass('opened');
                });
                widget.renderCanvas(widget.getActionById(actId),function(){
                    widget.active_action_id = actId;
                    widget.setHandlers();
                    widget.switchTitle();
                    widget.loader(false);
                    widget.populateMapFromLs(actId, function(){
                        widget.setBasketHandlers();
                    });
                });
            });

            widget.canvasContainer.on('addToSelection', function(){
                var placesArr = [];
                for(var i in widget.map.selection){
                    if (!widget.map.squares[widget.map.selection[i]]){
                        continue;
                    }
                    placesArr.push(widget.map.squares[widget.map.selection[i]]);
                }
                widget.addToLS(placesArr);
                widget.populateBasket();
            });

            widget.canvasContainer.on('removeFromSelection', function(e, sel, removedIds){
                for(var i in removedIds){
                    widget.removeFromLS(widget.active_action_id, removedIds[i]);
                }
                widget.populateBasket();
            });

            widget.zoomIn.off('mousedown').on('mousedown', function(){
                var cX = +widget.map.cWidth / 2;
                var cY = +widget.map.cHeight / 2;
                zoomInterval = window.setInterval(function(){
                    widget.canvasContainer.trigger("scale_map", [cX, cY, 1]);
                },50);
            });

            widget.zoomOut.off('mousedown').on('mousedown', function(){
                var cX = +widget.map.cWidth / 2;
                var cY = +widget.map.cHeight / 2;
                zoomInterval = window.setInterval(function(){
                    widget.canvasContainer.trigger("scale_map", [cX, cY, -1]);
                },50);
            });

            mbw_tap_zoomIn.off('tap').on('tap', function(){
                var cX = +widget.map.cWidth / 2;
                var cY = +widget.map.cHeight / 2;
                widget.canvasContainer.trigger("scale_map", [cX, cY, 1]);
            });

            mbw_tap_zoomOut.off('tap').on('tap', function(){
                var cX = +widget.map.cWidth / 2;
                var cY = +widget.map.cHeight / 2;
                widget.canvasContainer.trigger("scale_map", [cX, cY, -1]);
            });

            widget.purchaseBtn.off('click').on('click', function(){
                var purchaseAvaliable = false;
                var storedTickets = localStorage.getItem('mbw-basket');
                if(storedTickets == null){
                    return;
                }
                storedTickets = JSON.parse(storedTickets);
                for(var i in storedTickets.actions){
                    var act = storedTickets.actions[i];
                    for(var k in act.places){
                        var plc = act.places[k];
                        purchaseAvaliable = true;
                    }
                }
                if(purchaseAvaliable){

                    console.log(storedTickets);

                    widget.purchase();
                }
            });

            widget.forwardBtn.off('click').on('click', function(){
                var sectorSelected = false;
                for(var i in widget.map.sectors){
                    var sec = widget.map.sectors[i];
                    if(sec.selected){
                        sectorSelected = true;
                    }
                }
                if(!sectorSelected){
                    var lang = (wrapper.find('.mbw-lang.active').data('lang') == 'rus')? 'rus':'eng';
                    var title = (lang == 'rus')? 'Внимание': 'Attention';
                    var text = (lang == 'rus')? 'Выберите сектор(ы) схемы зала': 'You have to select hall scheme area group(s) first';
                    widget.alerter(title, text, function(){

                    });
                }else{
                    widget.loader(true);
                    widget.map.sectorsSelect(function(){
                        widget.updateMap();
                        widget.populateLegend();
                        widget.loader(false);

                    });
                    wrapper.addClass('hallView');
                    wrapper.removeClass('zonesView');
                    widget.forwardBtn.hide(0);
                    widget.backBtn.show(0);
                }
            });

            widget.backBtn.off('click').on('click', function(){
                wrapper.find('.mbw-priceGroups-wrapper li').hide(0);

                wrapper.removeClass('hallView');
                wrapper.addClass('zonesView');

                widget.loader(true);
                widget.map.backToSectors(function(){
                    widget.loader(false);
                });
                widget.backBtn.hide(0);
                widget.forwardBtn.show(0);
            });

            wrapper.find('.mbw-zoom-in, .mbw-zoom-out, .mbw-priceGroups-wrapper, .mbw-scene-bunner, .mbw-basket-dd-wrapper, .mbw-dd').off('mouseenter').on('mouseenter', function(){
                widget.canvasContainer.trigger("leave_container");
            });

            $(document).on('mouseup', function(){
                clearInterval(zoomInterval);
            });

            widget.canvasContainer.on('mousemove', function(){
                widget.renderScene();
            });

            if(typeof callback == 'function'){
                callback();
            }
        },                          //SET HANDLERS
        removeItemFormLsByPair: function(actId, placeId){
            var storedTickets = localStorage.getItem('mbw-basket');
            if(storedTickets == null){
                return;
            }
            storedTickets = JSON.parse(storedTickets);

            for(var i in storedTickets.actions){
                var act = storedTickets.actions[i];
                if(act.id == actId){
                    for(var k in act.places){
                        var plc = act.places[k].id;
                        if(plc == placeId){
                            act.places.splice(k,1);
                        }
                    }
                }
            }

            localStorage.setItem('mbw-basket', JSON.stringify(storedTickets));
        },
        setBasketHandlers: function(callback){
            if(widget.removeBtns){
                widget.removeBtns.off('click').on('click', function(){
                    var id = $(this).data('id');
                    var actId = $(this).data('action_id');

                    widget.removeFromLS(actId, id);
                    widget.updateMap();
                    widget.populateBasket();

                });
            }

            widget.clearBasket.off('click').on('click', function(){
                widget.clearLS();
                widget.updateMap();
                widget.populateBasket();
            });


            if(typeof callback == 'function'){
                callback();
            }
        },
        populateBasket: function(){
            var storedTickets = localStorage.getItem('mbw-basket');
            if(storedTickets == null){
                widget.basketUl.html('<li class="mbw-empty-basket"><span class="mbw-switch-lang" data-keyword="emptyBasket">Корзина пуста</span></li>');
                widget.switchLanguage(wrapper.find('.mbw-lang.active').data('lang'));
                widget.calculateTotal();
                widget.setBasketHandlers();
                return;
            }
            storedTickets = JSON.parse(storedTickets);
            var bi_tpl ='{{#basketItems}}<li>' +
                            '<div class="mbw-basket-item-wrapper">' +
                            '<div class="mbw-basket-item-title">{{title}}</div>' +
                            '<div class="mbw-basket-item-info-wrapper">' +
                                '<div class="mbw-basket-item-zone">{{zone}}</div>' +
                                '<div class="mbw-basket-item-seat">{{line_title}}: {{line}}  {{place_title}}: {{place}}</div>' +
                            '</div>' +
                            '<div class="mbw-basket-item-price">{{price}} <span class="mbw-switch-lang" data-keyword="rub">руб.</span></div>' +
                            '</div>' +
                            '<div class="mbw-basket-item-remove" data-id="{{id}}" data-action_id="{{action_id}}">' +
                                '<i class="fa fa-trash-o"></i>' +
                            '</div>' +
                        '{{/basketItems}}</li>';

            var mO = {
                basketItems: []
            };


            for(var i in storedTickets.actions){
                var act = storedTickets.actions[i];
                for(var k in act.places){
                    var plcData = act.places[k];
                    if(widget.map.squares[act.places[k].id]){
                        if(widget.map.squares[act.places[k].id].status == 0){
                            continue;
                        }
                    }
                    mO.basketItems.push({
                        action_id:      act.id,
                        id:             plcData.id,
                        title:          widget.getActionById(act.id)['ACTION_NAME'],
                        zone:           plcData.areaGroup,
                        place_title:    plcData.place_title,
                        place:          plcData.place,
                        line_title:     plcData.line_title,
                        line:           plcData.line,
                        price:          widget.splitPrice(plcData.salePrice)
                    });
                }
            }
            if(mO.basketItems.length == 0){
                widget.basketUl.html('<li class="mbw-empty-basket"><span class="mbw-switch-lang" data-keyword="emptyBasket">Корзина пуста</span></li>');
                widget.switchLanguage(wrapper.find('.mbw-lang.active').data('lang'));
                widget.calculateTotal();
                widget.setBasketHandlers();
            }else{
                widget.basketUl.html(Mustache.to_html(bi_tpl, mO));
                widget.removeBtns = widget.basketUl.find('.mbw-basket-item-remove');
                widget.calculateTotal();
                widget.setBasketHandlers();
            }
        },
        calculateTotal: function(){
            var storedTickets = localStorage.getItem('mbw-basket');
            if(storedTickets == null){
                widget.totalFee.html(0);
                widget.totalAmount.html(0);
                return;
            }
            storedTickets = JSON.parse(storedTickets);
            var totalAmount = 0;
            var totalFee = 0;

            for(var i in storedTickets.actions){
                var act = storedTickets.actions[i];
                var actFee = +widget.getActionById(act.id)['SERVICE_FEE'];

                for(var k in act.places){
                    var plcData = act.places[k];

                    totalFee += +plcData.salePrice / 100 * actFee;
                    totalAmount += +plcData.salePrice;
                }
            }

            widget.totalFee.html(widget.splitPrice(totalFee));
            widget.totalAmount.html(widget.splitPrice(totalAmount + totalFee));
        },
        glowPriceGroup: function(id, state){
            var idx = 0;
            function disLight(){
                for(var i in widget.map.squares){
                    widget.map.squares[i].lighted_now = false;
                }
                widget.map.render();
            }
            if(!state){
                clearInterval(interval);
                disLight();
            }else{
                clearInterval(interval);
                disLight();
                var prcGrpPlaces = [];
                for(var i in widget.map.squares){
                    var sqr = widget.map.squares[i];
                    if(sqr.priceGroup == id){
                        prcGrpPlaces.push(sqr.id);
                    }
                }
                interval = window.setInterval(function(){
                    for(var k in prcGrpPlaces){
                        var sqr = prcGrpPlaces[k];
                        if(idx%2 == 0){
                            widget.map.squares[sqr].lighted_now = true;
                        }else{
                            widget.map.squares[sqr].lighted_now = false;
                        }
                    }
                    idx++;
                    widget.map.render();
                }, 350);
            }


        },
        splitPrice: function(str){
            str = str.toString();
            var endOfStr = '';
            if(str.indexOf('.') > -1){
                endOfStr = str.substr(str.indexOf('.'));
                str = str.substr(0, str.length - endOfStr.length);
            }
            var arrStr = str.split('');
            var res = [];
            var idx = 1;
            for(var i = arrStr.length-1; i >= 0; i--){
                res.unshift(arrStr[i]);
                if(idx%3 == 0 && idx>0){
                    res.unshift(' ');
                }
                idx++;
            }
            if(res[0] == ' '){
                res.shift();
            }
            return res.join('')+endOfStr;
        },
        populateLegend: function(){
            var squares = widget.map.squares;
            var mO = {
                priceGroups:[]
            };
            var obj = {};
            var total_free_count = 0;
            var tpl = '{{#priceGroups}}<li data-id="{{priceGroup}}"><div class="mbw-legend-item-color" style="background-color: {{color}}"></div><div class="mbw-legend-item-price">{{price}} <span class="mbw-switch-lang" data-keyword="rub">руб.</span></div></li>{{/priceGroups}}';

            for (var i1 in squares) {
                var square = squares[i1];
                if (square.status == 0 || +square.salePrice <= 0) continue;
                if (obj[square.priceGroup] === undefined) {
                    obj[square.priceGroup] = {
                        price: widget.splitPrice(square.salePrice),
                        count: 1,
                        color: square.color0,
                        priceGroup: square.priceGroup
                    };
                } else {
                    obj[square.priceGroup].count++;
                }
                total_free_count++;

            }
            for(var i in obj){
                mO.priceGroups.push(obj[i]);
            }

            widget.priceGroups.html(Mustache.to_html(tpl, mO));
            widget.priceGroupsItems = widget.priceGroups.find('li');

            widget.priceGroupsItems.off('click').on('click', function(){
                var pgId = $(this).data('id');
                if($(this).hasClass('active')){
                    widget.priceGroupsItems.removeClass('active');
                    widget.glowPriceGroup('', false);
                }else{
                    widget.priceGroupsItems.removeClass('active');
                    $(this).addClass('active');
                    widget.glowPriceGroup(pgId, true);
                }
            });
        },
        purchase: function(){
            var pdfPath = widget.actions[0]['RULES_PDF_PATH'];
            var lang = (wrapper.find('.mbw-lang.active').data('lang') == 'rus')? 'rus':'eng';
            var pTitle = (lang == 'rus')?'Внимание': 'Attention';
            var pHtml = (lang == 'rus')?'<label><input type="checkbox" class="mbw-i-agree" /> Я принимаю <a target="_blank" href="'+doc_root+pdfPath+'">условия пользовательского соглашения</a></label>': '<label><input type="checkbox" class="mbw-i-agree" /> I agree the <a target="_blank" href="'+doc_root+pdfPath+'">user agreement</a></label>';

            var pOkCallback = function(){

                var placesArr = [];
                var actionsArr = [];

                var storedTickets = localStorage.getItem('mbw-basket');
                if(storedTickets == null){
                    alert('Mister, prevent please empty basket purchasing!');
                    return;
                }
                storedTickets = JSON.parse(storedTickets);
                for(var i in storedTickets.actions){
                    var act = storedTickets.actions[i];
                    for(var k in act.places){
                        var plc = act.places[k];
                        placesArr.push(plc.id);
                        actionsArr.push(act.id.toString());
                    }
                }

                if(placesArr.length == 0 || actionsArr == 0){
                    alert('Mister, prevent please empty basket purchasing!');
                    return;
                }

                var purchaseObj = {
                    command: 'create_order',
                    params:{
                        action_scheme_id: placesArr.join(','),
                        action_id: actionsArr.join(','),
                        frame: initData['frame']
                    }
                };
                console.log(purchaseObj);
                socketQuery(purchaseObj, function(res){
                    res = JSON.parse(res);
                    if(res['results'][0]['code'] == 0){
                        console.log('SUCCESS', res['results'][0]);
                        localStorage.removeItem('mbw-basket');
                        widget.map.clearSelection();
                        widget.map.reLoad();
                        widget.populateBasket();
                        widget.toAcquiropay(res['results'][0]);
                    }else if(res['results'][0]['code'] == 20111){

                        var errPlaces = [];
                        var errActions = [];

                        for(var e in res['results'][0]['invalid_id'].split(',')){
                            var errPlc = res['results'][0]['invalid_id'].split(',')[e];
                            var errAct = res['results'][0]['invalid_action_id'].split(',')[e];
                            if(errPlaces.indexOf(errPlc) == -1){
                                errPlaces.push(errPlc);
                                errActions.push(errAct);
                            }
                        }

                        var errTitle = 'Ошибка';
                        var errHtml = '';
                        for(var h in errPlaces){
                            var eP = errPlaces[h];
                            var eA = errActions[h];
                            errHtml += eA +': '+eP+ '<br/>';
                        }
                        var errOk = function(){
                            for(var i in storedTickets.actions){
                                var act = storedTickets.actions[i];
                                var inArIdx = errActions.indexOf(act);
                                if(inArIdx > -1){
                                    for(var k in act.places){
                                        var plc = act.places[k];
                                        var inArPlcIdx = errPlaces.indexOf(plc);
                                        if(inArPlcIdx > -1){
                                            act.places.splice(k,1);
                                        }
                                    }
                                }
                            }

                            localStorage.setItem('mbw-basket', JSON.stringify(storedTickets));
                            widget.map.clearSelection();
                            widget.map.reLoad();
                            widget.populateBasket();
                        };
                        widget.alerter(errTitle, errHtml, errOk);
                    }else{
                        var lang = (wrapper.find('.mbw-lang.active').data('lang') == 'rus')? 'rus':'eng';
                        var title = (lang == 'rus')? 'Ошибка': 'Error';
                        var text = (lang == 'rus')? 'Что-то пошло не так...': 'Something goes wrong...';
                        widget.alerter(title, text, function(){
                            localStorage.removeItem('mbw-basket');
                            if(typeof widget.map.clearSelection == 'function'){
                                widget.map.clearSelection();
                            }
                            if(typeof widget.map.reLoad == 'function'){
                                widget.map.reLoad();
                            }
                            widget.populateBasket();
                        });
                        console.log('ERROR', res);
                    }
                });


            };
            var pCancelCallback = function(){};
            widget.prompt(pTitle, pHtml, pOkCallback, pCancelCallback);
        },
        alerter: function(title, html, ok){
            var lang = (wrapper.find('.mbw-lang.active').data('lang') == 'rus')? 'rus':'eng';
            var okText = (lang == 'rus')? 'Ок' : 'Confirm';
            var promptContainer = wrapper.find('.mbw-prompt-wrapper');
            var tpl =   '<div class="mbw-prompt-title">{{title}}</div>' +
                '<div class="mbw-prompt-content">{{{html}}}</div>' +
                '<div class="mbw-prompt-footer"><div class="mbw-prompt-btn mbw-prompt-ok">'+okText+'</div></div>';
            var mO = {
                title: title,
                html: html
            };
            promptContainer.html(Mustache.to_html(tpl, mO));
            promptContainer.find('.mbw-prompt-ok').off('click').on('click', function(){
                if(typeof ok == 'function'){
                    ok();
                }
                promptContainer.html('');
            });
        },
        prompt: function(title, html, ok, cancel){
            var lang = (wrapper.find('.mbw-lang.active').data('lang') == 'rus')? 'rus':'eng';
            var okText = (lang == 'rus')? 'Подтвердить' : 'Confirm' ;
            var cancelText = (lang == 'rus')? 'Отмена' : 'Cancel' ;
            var promptContainer = wrapper.find('.mbw-prompt-wrapper');
            var tpl =   '<div class="mbw-prompt-title">{{title}}</div>' +
                '<div class="mbw-prompt-content">{{{html}}}</div>' +
                '<div class="mbw-prompt-footer"><div class="mbw-prompt-btn mbw-prompt-cancel">'+cancelText+'</div><div class="mbw-prompt-btn mbw-prompt-ok disabled">'+okText+'</div></div>';
            var mO = {
                title: title,
                html: html
            };
            promptContainer.html(Mustache.to_html(tpl, mO));
            var isAgree = promptContainer.find('.mbw-i-agree');
            isAgree.off('change').on('change', function(){
                if(isAgree[0].checked){
                    promptContainer.find('.mbw-prompt-ok').removeClass('disabled');
                }else{
                    promptContainer.find('.mbw-prompt-ok').addClass('disabled');
                }
            });
            promptContainer.find('.mbw-prompt-ok').off('click').on('click', function(){
                if($(this).hasClass('disabled')){
                    return;
                }else{
                    if(isAgree[0].checked){
                        if(typeof ok == 'function'){
                            ok();
                            promptContainer.html('');
                        }
                    }
                }
            });

            promptContainer.find('.mbw-prompt-cancel').off('click').on('click', function(){
                if(typeof cancel == 'function'){
                    cancel();
                }
                promptContainer.html('');
            });

        },
        toAcquiropay: function(obj){
            var values = {};
            var merchant_id = obj['MERCHANT_ID'];
            var product_id = obj['PRODUCT_ID'];

            values['merchant_id'] = merchant_id;
            values['product_id'] = product_id;
            values['amount'] = obj['AMOUNT'];
            values['cf'] = obj['ORDER_ID'];
            values['cf2'] = obj['CF2'];
            values['cf3'] = obj['CF3'];
            values['params'] = params;

            values['cb_url'] = obj['CB_URL'];
            values['ok_url'] = doc_root+"iFrame/payment_ok.php?back="+document.location.href;
            values['ko_url '] = doc_root+"iFrame/payment_ko.html";
            values['token'] = obj['TOKEN'];

            var html = "";
            for(var key in values){

                html+= key+'<input type="text" name="'+key+'" value="'+values[key]+'" />';
            }

            wrapper.find(".mbw-form-pay").html(html);
            wrapper.find(".mbw-form-pay").submit();
            widget.map.clearSelection();
            widget.map.reLoad();
        }
    };

    widget.init();

}());


