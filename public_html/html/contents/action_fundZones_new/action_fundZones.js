(function () {

    var modal = $('.mw-wrap').last();
    var contentID = MB.Contents.justAddedId;
    var contentInstance = MB.Contents.getItem(contentID);
    var contentWrapper = $('#mw-' + contentInstance.id);
    var modalInstance = MB.Core.modalWindows.windows.getWindow(contentID);

    modalInstance.stick = 'top';
    modalInstance.stickModal();


    // Variables
    var one_action_map;
    var sid = MB.User.sid;
    var hs_res = contentInstance.params['action_scheme_res'];
    console.log(hs_res);
    var fz_id = hs_res.data[0][hs_res.data_columns.indexOf('ACTION_ID')];
    var fz_title = hs_res.data[0][hs_res.data_columns.indexOf('STATUS_TEXT')];
    var showUnused = true;
    contentInstance.fund_zone_id = fz_id;
    contentInstance.fund_zone_title = fz_title;
    var environment = contentInstance;
    environment.selected_group = 0;
    environment.action_id = fz_id;

    // Map
    var mapWrapper = contentWrapper.find('.one-action-canvas-container');

    one_action_map = new Map1({
        container: mapWrapper,
        cWidth: $(window).width() - 440,
        cHeight: $(window).height() - 93,
        mode: "admin"
    });

    MB.User.map = one_action_map;

    var socketObject = {
        sid:sid,
        type:"action_scheme_fund_group",
        param:"action_id",
        id:environment.action_id,
        portion:30,
        save:{
            command:"operation",
            object:"change_action_scheme_fund_group_by_list",
            /*object:"change_action_scheme_fund_group",*/
            field_name:"ACTION_SCHEME_ID"
        },
        load:{
            command:"get",
            object:"action_scheme_fund_group",
            params:{
                action_id:environment.action_id
            },
            columns:"ACTION_SCHEME_ID,PRICE,STATUS,STATUS_TEXT,FUND_GROUP_NAME,PRICE_GROUP_NAME,BLOCK_COLOR,COLOR",
            field_name:"ACTION_SCHEME_ID"
        }
    };

    var o = {
        command:"get",
        object:"action_scheme_fund_group",
        sid:sid,
        params:{
            action_id:environment.action_id
        }
    };
    var layerO = {
        command:"get",
        object:"action_scheme_layer",
        sid:sid,
        params:{
            action_id:environment.action_id,
            where:"ACTION_ID = "+environment.action_id+" and VISIBLE_ADMIN='TRUE'",
            columns:"ACTION_SCHEME_LAYER_ID",
            order_by:"SORT_NO"
        }
    };
    var objectO = {
        command:"get",
        object:"action_scheme_object",
        sid:sid,
        where_field:"ACTION_SCHEME_LAYER_ID",
        params:{
            action_id:environment.action_id,
            /*columns:"ACTION_SCHEME_OBJECT_ID,OBJECT_TYPE,OBJECT_TYPE,ROTATION,FONT_FAMILY,FONT_SIZE,FONT_STYLE,FONT_WIEGH,COLOR,X,Y,BACKGROUND_URL_SCALE,BACKGROUND_URL_ORIGINAL,BACKGROUND_COLOR",*/
            order_by:"SORT_NO"
        }
    };

    one_action_map.openSocket(socketObject);

    one_action_map.loadSquares(o,function(){
        one_action_map.loadRenderItems({
            layerO:layerO,
            objectO:objectO
        },function(){
            one_action_map.render();
        });

        one_action_map.setLayout(function(){
            one_action_map.setMinMax(function(){
                one_action_map.setScaleCoff(function(){
                    one_action_map.render(function(){
                        one_action_map.reLoadLayout(function(){

                        });
                    });
                    one_action_map.setEvents();
                });

            });
        });
//        loadFundGroups();
//        environment.onFocus = function(){
////            loadFundGroups();
//            one_action_map.reLoad();
//            one_action_map.render();
//        };
//        environment.onClose = function(){
//            log("fundZones_map onClose");
//            one_action_map.closeSocket();
//        };
    });

    contentWrapper.children().each(function () {
        if (this.id != "")
            preventSelection(document.getElementById(this.id));
    });

    one_action_map.sendSelection = function(){
        var fund_group_id = environment.selected_group;
console.log(environment.selected_group);
        if (+fund_group_id<=0 && one_action_map.mouseKey==1){
            toastr['warning']('Пожалуйста, выберите фонд');
            one_action_map.clearSelection(true);
            one_action_map.render();
            return;
        }


        if (one_action_map.mouseKey==3) fund_group_id = "";

        var obj = {
            event:"save_and_update",

            save_params:{
                params:{
                    fund_group_id:fund_group_id
                },
                list: one_action_map.selection,
                portion:200
            },
            load_params:{
                list: one_action_map.selection,
                portion:200
            }

        };

        one_action_map.toSocket(obj);
        one_action_map.clearSelection();

    };

    one_action_map.sendSelectionCallback = function () {
        /*tickets_stack.load();
         action_price_info.load();*/
    };

    one_action_map.sendSelectionCallbackFull = function () {
        fundZones.load(function(){
            fundZones.render();
        });
    };

    one_action_map.container.on("click", function () {
        if (one_action_map.contextmenu1 != undefined) one_action_map.contextmenu1.delete();
    });
    one_action_map.container.on('myContextMenu', function (e, x, y) {
        var square_id = one_action_map.mouseOnElement(x, y);
        if (!square_id || one_action_map.squares[square_id].order_id == -1) {
            if (one_action_map.contextmenu1 != undefined) one_action_map.contextmenu1.delete();
            return;
        }
        console.log(one_action_map.squares[square_id].order_id);
        var square = one_action_map.squares[square_id];
        one_action_map.contextmenu1 = MB.Core.contextMenu.init(undefined, {
            /*position:{
             x:1,
             y:1
             },*/
            items: [
                {
                    title: 'Перейти к заказу',
                    iconClass: 'fa-bars',
                    disabled: false,
                    callback: function (params) {
                        one_action_map.changed = true;
                        one_action_map.blockedArray = [];
                        for (var i in one_action_map.squares) {
                            if (+one_action_map.squares[i].order_id === +square.order_id) {
                                one_action_map.blockedArray.push(i);
                            }
                        }
                        var form_name = "form_order";
                        if (square.textStatus.indexOf('Доверено распостранение') >= 0) {
                            form_name = "form_order_realization";
                        }
                        MB.Core.switchModal({
                            type: "form",
                            name: form_name,
                            isNewModal: true,
                            ids: [square.order_id],
                            params: {label: "Заказ №: " + square.order_id}
                        });
                    }
                },
                {
                    title: 'Перейти к билету',
                    iconClass: 'fa-barcode',
                    disabled: false,
                    callback: function (params) {
                        one_action_map.changed = true;
                        one_action_map.blockedArray = [square.id];
                        var form_name = "form_order_ticket";
                        if (square.textStatus.indexOf('Доверено распостранение') >= 0) {
                            form_name = "form_order_ticket_realization";
                        }
                        MB.Core.switchModal({
                            type: "form",
                            name: form_name,
                            isNewModal: true,
                            ids: [square.ticket_id],
                            params: {label: "Билет №: " + square.ticket_id}
                        });
                    }
                }
            ]
        });

    });

    // /Map

    function setHeights(isFirst) {
        var tElem = contentWrapper.find('.fundZones-funds-list');
        var excludeHs = 0;
        var sideBarH = (isFirst) ? $(window).height() - 93 : modalInstance.wrapper.outerHeight() - 55;

        for (var i = 0; i < contentWrapper.find('.excludeHeight').length; i++) {
            var ex = contentWrapper.find('.excludeHeight').eq(i);
            excludeHs += ex.outerHeight();
        }

        var full = sideBarH - excludeHs;
        tElem.height(full - 3 +'px');
    }

    $(modalInstance).off('resize').on('resize', function () {
        setHeights(false);
        console.log('resize');
        one_action_map.resize();
    });

    $(modalInstance).off('focus').on('focus', function () {
        one_action_map.reLoadList(one_action_map.blockedArray);
//        tickets_stack.load();
//        action_price_info.load();
//		if (one_action_map.changed) {
//			one_action_map.reLoadList(one_action_map.blockedArray);
//		}
        //contentInstance.reload();
    });

    $(modalInstance).off('close').on('close', function () {
        one_action_map.closeSocket();
        if (one_action_map.changed) {
            one_action_map.reLoadList(one_action_map.blockedArray);
            //one_action_map.reLoad();
        }
    });

    $(window).resize(function () {
        setHeights(false);
//        one_action_map.resize();
    });


    var fundZones = {
        data: {
            funds: []
        },
        load: function(cb){

            var total_total =       contentWrapper.find('.fz-total-total');
            var total_selected =    contentWrapper.find('.fz-total-selected');
            var total_unused =      contentWrapper.find('.fz-total-unused');
            var total_excluded =    contentWrapper.find('.fz-total-excluded');

            var hs_res = contentInstance.params['action_scheme_res'];
            var fz_id = hs_res.data[0][hs_res.data_columns.indexOf('FUND_ZONE_ID')];

            var o = {
                command:"get",
                object:"fund_group_for_action_scheme",
                params:{
                    show_all: showUnused,
                    action_id: environment.action_id
                }
            };
            socketQuery(o, function(res){

                var primalRes = JSON.parse(res)['results'][0];
                console.log(primalRes, showUnused)
                res = jsonToObj(JSON.parse(res)['results'][0]);
                fundZones.data = {funds: []};

                total_total.html(primalRes['extra_data']['TOTAL_PLACE_COUNT']);
                total_selected.html(primalRes['extra_data']['TOTAL_SELECTED_PLACE_COUNT']);
                total_unused.html(primalRes['extra_data']['TOTAL_NOT_SELECTED_PLACE_COUNT']);
                total_excluded.html(primalRes['extra_data']['TOTAL_EXCLUDED_PLACE_COUNT']);


                for(var i in res){
                    res[i].selected = (res[i]['FUND_GROUP_ID'] == environment.selected_group)? 'selected' : '';
                    fundZones.data.funds.push(res[i]);
                }
                if(typeof cb == 'function'){
                    cb();
                }

            });
        },
        render: function(){


            var title = contentWrapper.find('.fz-title');
            var ul = contentWrapper.find('.fundZones-funds-list');
            var tpl = '{{#funds}}<li data-id="{{FUND_GROUP_ID}}" data-fz-id="{{FUND_ZONE_ID}}" class="{{selected}}">'+
                '<div class="fundZones-funds-item-color" style="background-color: {{COLOR}}"></div>'+
                '<div class="fundZones-funds-item-title">{{NAME_WITH_STATUS}}</div>'+
                '<div class="fundZones-funds-item-count">{{PLACE_COUNT}} мест</div>'+
                '</li>{{/funds}}';
            console.log(fundZones.data);
            ul.html(Mustache.to_html(tpl, fundZones.data));
            title.html(environment.fund_zone_title);




            fundZones.setHandlers();

        },
        setHandlers: function(){
            var title = contentWrapper.find('.fz-title');
            var ul = contentWrapper.find('.fundZones-funds-list');

            ul.find('li').off('click').on('click', function(){

                var id = $(this).data('id');
                var fz_id = $(this).data('fz-id');

                if(MB.keys['16'] === true){
                    if($(this).hasClass('selected')){

                    }else{
                        ul.find('li').removeClass('selected');
                        $(this).addClass('selected');
                    }
                }else{
                    if($(this).hasClass('selected')){

                    }else{
                        ul.find('li').removeClass('selected');
                        $(this).addClass('selected');
                        environment.selected_group = id;
                    }
                }
            });
        }
    };

    fundZones.load(function(){
        fundZones.render();
    });




    //Очистить
    contentWrapper.find(".clear_tickets_stack").off('click').on('click', function () {
        bootbox.dialog({
            message: "Вы уверены что хотите очистить места?",
            title: "",
            buttons: {
                yes_btn: {
                    label: "Да, уверен",
                    className: "green",
                    callback: function () {
                        socketQuery({command:"operation",object:"fill_action_scheme_by_fund_group",params:{
                            action_id: environment.action_id,
                            fund_group_id: '',
                            all:1
                        }},function(r){
                            console.log(r);
                            one_action_map.reLoad(function () {
                                fundZones.load(function(){
                                    fundZones.render();
                                });
                            });
                        });
                    }
                },
                cancel: {
                    label: "Отмена",
                    className: "blue"
                }
            }
        });
    });
    //Обновить
    contentWrapper.find('.reloadMap').off('click').on('click', function () {
        one_action_map.reLoad(function () {
            fundZones.load(function(){
                fundZones.render();
            });
        });
//		tickets_stack.load();
    });
    //Выбрать все
    contentWrapper.find(".block_all_places").off('click').on('click', function () {
        var selected = contentWrapper.find('.fundZones-funds-list li.selected');
        if (selected.length) {
            bootbox.dialog({
                message: "Раскрасить все этим поясом?",
                title: "",
                buttons: {
                    all_place: {
                        label: "Да, все места",
                        className: "green",
                        callback: function() {
                            socketQuery({command:"operation",object:"fill_action_scheme_by_fund_group",params:{
                                action_id: environment.action_id,
                                fund_group_id: selected.attr('data-id'),
                                all:1
                            }},function(r){
                                console.log(r);
                                one_action_map.reLoad(function () {
                                    fundZones.load(function(){
                                        fundZones.render();
                                    });
                                });
                            });
                        }
                    },
                    free_only: {
                        label: "Только свободные",
                        className: "yellow",
                        callback: function() {
                            socketQuery({command:"operation",object:"fill_action_scheme_by_fund_group",params:{
                                action_id:environment.action_id,
                                fund_group_id:selected.attr('data-id'),
                                all:0
                            }},function(r){
                                console.log(r);
                                one_action_map.reLoad(function () {
                                    fundZones.load(function(){
                                        fundZones.render();
                                    });
                                });
                            });
                        }
                    },
                    cancel: {
                        label: "Отмена",
                        className: "blue",
                        callback: function() {}
                    }
                }
            });
        } else {
            bootbox.dialog({
                message: "Выберите хотя бы один пояс",
                title: "",
                buttons: {
                    cancel: {
                        label: "ОК",
                        className: "blue",
                        callback: function () {

                        }
                    }
                }
            });
        }
    });
    //Скрыть / показать неиспользуемые фонды
    contentWrapper.find('.toggleUnusedFunds').off('click').on('click', function(){
        if($(this).hasClass('active')){
            showUnused = false;
            $(this).removeClass('active').html('<i class="fa fa-eye-slash"></i>&nbsp;&nbsp;Показать неиспользуемые фонды');
        }else{
            showUnused = true;
            $(this).addClass('active').html('<i class="fa fa-eye"></i>&nbsp;&nbsp;Cкрыть неиспользуемые фонды');
        }
        fundZones.load(function(){
            fundZones.render();
        });
    });
    //К расценкам
    contentWrapper.find('.go-to-funds').off('click').on('click', function(){
        MB.Core.switchPage({
            type: "table",
            name: "table_fund_group",
            isNewTable: true
        });
        modalInstance.collapse();
    });

    contentWrapper.find('.go-to-price-zones').off('click').on('click', function(){
        MB.Core.switchModal({
            type:"content",
            filename:"priceZones",
            isNew: true,
            params:{
                hall_scheme_id: environment.activeId,
                label: 'Схема распоясовки',
                title: environment.title,
//                newerGuid: newerGuid,
//                parentGuid:id
            }
        });
    });

}());
