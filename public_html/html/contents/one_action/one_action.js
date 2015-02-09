//var sid = "";


/*________________________________________________________________________________**/

function one_action_init(id) {
    var one_action_map;
    var sid = MB.User.sid;
    var environment = MB.Content.find(id);
    var tickets_stack, action_price_info;
    var interval;


    var Modaltitle = '';
    if (environment.title) {
        Modaltitle = environment.title;
    } else {
        Modaltitle = 'Мероприятие';
        console.warn('environment.title не приходит!');
    }

    $('#modal_' + id + '_wrapper .pageHeaderInner h3').html(Modaltitle);

    var w = $("#modal_" + id + "_wrapper").width();
    var h = $("#modal_" + id + "_wrapper").height() - 185;
    var w70 = w - 17 - w * 3 / 10;

    one_action_map = new Map1({
        container: $("#modal_" + id + "_wrapper #box_for_one_action_map"),
        cWidth: w70,
        cHeight: h,
        mode: "casher"
    });
    MB.User.map = one_action_map;
    var socketObject;
    if (environment.isSubscription) {
        socketObject = {
            sid: sid,
            type: "subscription_action_scheme",
            param: "action_id",
            id: environment.action_id,
            portion: 30,
            save: {
                command: "operation",
                object: "block_place_list",
                field_name: "action_scheme_id"
            },
            load: {
                command: "get",
                object: "subscription_action_scheme",
                params: {
                    action_id: environment.action_id
                },
                columns: "ACTION_SCHEME_ID,PRICE,STATUS,STATUS_TEXT,FUND_GROUP_NAME,PRICE_GROUP_NAME,BLOCK_COLOR,COLOR",
                field_name: "action_scheme_id"
            }
        };
    } else {
        socketObject = {
            sid: sid,
            type: "action_scheme",
            param: "action_id",
            id: environment.action_id,
            portion: 30,
            save: {
                command: "operation",
                object: "block_place_list",
                params: {
                    action_id: environment.action_id
                },
                field_name: "action_scheme_id"
            },
            load: {
                command: "get",
                object: "action_scheme",
                params: {
                    action_id: environment.action_id
                },
                columns: "ACTION_SCHEME_ID,PRICE,STATUS,STATUS_TEXT,FUND_GROUP_NAME,PRICE_GROUP_NAME,BLOCK_COLOR,COLOR",
                field_name: "action_scheme_id"
            }
        };
    }


    var squareO;
    if (environment.isSubscription) {
        squareO = {
            command: "get",
            object: "subscription_action_scheme",
            sid: sid,
            params: {
                action_id: environment.action_id
            }
        };
    } else {
        squareO = {
            command: "get",
            object: "action_scheme",
            sid: sid,
            params: {
                action_id: environment.action_id
            }
        };
    }


    var layerO = {
        command: "get",
        object: "action_scheme_layer",
        sid: sid,
        params: {
            action_id:environment.action_id,
            /*where: "ACTION_ID = " + environment.action_id + " and VISIBLE_CASHER='TRUE'",*/
            where: " VISIBLE_CASHER='TRUE'",
            /*columns: "ACTION_SCHEME_LAYER_ID",*/
            order_by: "SORT_NO"
        }
    };
    var objectO = {
        command: "get",
        object: "action_scheme_object",
        sid: sid,
        where_field: "ACTION_SCHEME_LAYER_ID",
        params: {
            action_id:environment.action_id,
            /*columns:"ACTION_SCHEME_OBJECT_ID,OBJECT_TYPE,OBJECT_TYPE,ROTATION,FONT_FAMILY,FONT_SIZE,FONT_STYLE,FONT_WIEGH,COLOR,X,Y,BACKGROUND_URL_SCALE,BACKGROUND_URL_ORIGINAL,BACKGROUND_COLOR",*/
            order_by: "SORT_NO"
        }
    };
    one_action_map.openSocket(socketObject);

    one_action_map.loadSquares(squareO, function () {
        one_action_map.loadRenderItems({
            layerO: layerO,
            objectO: objectO
        }, function () {
            one_action_map.render();
        });

        //one_action_map.loadObjects(o2,function(){
        one_action_map.setLayout(function () {
            one_action_map.setMinMax(function () {
                one_action_map.setScaleCoff(function () {
                    one_action_map.render(function () {
                        one_action_map.reLoadLayout(function () {
                        });
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
        environment.onFocus = function () {
            console.log('content focused');
            tickets_stack.load();


            action_price_info.load();
            if (one_action_map.changed) {
                one_action_map.reLoadList(one_action_map.blockedArray);
                //one_action_map.reLoad();
            }
            //one_action_map.render();
        };
        environment.onClose = function () {
            one_action_map.closeSocket();
            if (one_action_map.changed) {
                one_action_map.reLoadList(one_action_map.blockedArray);
                //one_action_map.reLoad();
            }
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


    });

    var wrap = $("#" + environment.world + "_" + environment.id + "_wrapper");
    wrap.children("*").each(function () {
        if (this.id != "")
            preventSelection(document.getElementById(this.id));
    });


    var node = true;
    if (node) {
        one_action_map.sendSelection = function () {
            one_action_map.oldSelection = one_action_map.selection;
            var object = "block_place_list";
            if (one_action_map.mouseKey == 3)
                object = "unblock_place_list";
            var obj = {
                event: "save_and_update",
                save_params: {
                    object: object,
                    params: {
                        action_id: environment.action_id
                    },
                    list: one_action_map.selection,
                    portion: 200
                },
                load_params: {
                    list: one_action_map.selection,
                    portion: 20
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
            tickets_stack.load();
            action_price_info.load();
        };

    } else {
        one_action_map.sendSelection = function (block) {
            if (one_action_map.selection.length > 0) {
                var subcmd = "block_place_list";
                if (one_action_map.mouseKey == 3)
                    subcmd = "unblock_place_list";

                MB.Core.sendQuery({
                    command: "operation",
                    object: subcmd,
                    sid: sid,
                    params: {action_scheme_id: one_action_map.selection}
                }, function (data) {
                    one_action_map.clearSelection();
                    //one_action_map.reLoad();
                    //tickets_stack.load();
                    //one_action_map.render();
                });

            }
        };
    }

    /***__________________________________________________________________________________________________***/



        ///  Стек билетов
    tickets_stack = {
        box: "tickets_box",
        load: function () {
            if (environment.order_id == undefined) {
                var self = this;
                MB.Core.sendQuery({
                    command: "get",
                    object: "user_blocked_places",
                    sid: MB.User.sid,
                    columns: "ACTION_SCHEME_ID,ACTION_NAME,AREA_GROUP,LINE,PLACE,PRICE",
                    params: {
                        order_by: "ACTION_NAME,LINE,PLACE"
                    }
                }, function (data) {
                    $("#" + self.box).html("");
                    var obj = MB.Core.jsonToObj(data);
                    for (var k in obj) {
                        $("#" + self.box).append('<tr class="one_place" id="one_place' + obj[k].ACTION_SCHEME_ID + '">' +
                        '<td style="font-size: 0.8em;">' +
                        obj[k].ACTION_NAME +
                        '</td>' +
                        '<td style="font-size: 0.8em;">' +
                        obj[k].AREA_GROUP +
                        '</td>' +
                        '<td>' +
                        obj[k].LINE +
                        '</td>' +
                        '<td>' +
                        obj[k].PLACE +
                        '</td>' +
                        '<td>' +
                        obj[k].PRICE +
                        '</td>' +
                        '</tr>');


                    }
                    $("#TOTAL_PLACE").html(data.TOTAL_TICKETS);
                    /*$("#TOTAL_TICKETS").html(data.TOTAL_TICKETS);*/
                    var TOTAL_AMOUNT = (data.TOTAL_AMOUNT != "") ? data.TOTAL_AMOUNT : 0;
                    $("#TOTAL_AMOUNT").html(TOTAL_AMOUNT + " руб.");


                });
            }


        },
        clear_blocked_place: function () {
            //clear_blocked_place
            MB.Core.sendQuery({
                command: "operation",
                object: "clear_blocked_place",
                sid: sid,
                params: {action_id: environment.action_id}
            }, function (data) {
                one_action_map.reLoad(function () {
                    action_price_info.load();
                });

                tickets_stack.load();

            });
        },
        clear_blocked_placeAll: function () {
            //clear_blocked_place
            MB.Core.sendQuery({command: "operation", object: "clear_blocked_place", sid: sid}, function (data) {
                one_action_map.reLoad(function () {
                    action_price_info.load();
                });
                tickets_stack.load();


            });
        },
        block_all_places: function () {
            var self = this;
            MB.Core.sendQuery({
                command: "operation",
                object: "block_all_places",
                sid: sid,
                params: {action_id: environment.action_id}
            }, function (data) {
                one_action_map.reLoad(function () {
                    action_price_info.load();
                });
                tickets_stack.load();

            });
        }
    };

    /// Инфо о свободных местах
    action_price_info = {
        box: "action_price_info",
        load: function () {
            var squares = one_action_map.squares;
            var obj = {};
            var total_free_count = 0;
            var html = '';
            var container = $("#" + this.box);
            for (var i1 in squares) {
                var square = squares[i1];
                if (square.status == 0 || +square.price <= 0 || +square.blocked !== 0) continue;
                if (obj[square.priceGroup] === undefined) {
                    obj[square.priceGroup] = {
                        price: square.salePrice,
                        count: 1,
                        color: square.color0,
                        priceGroup: square.priceGroup
                    };
                } else {
                    obj[square.priceGroup].count++;
                }
                total_free_count++;

            }
            $("#total_free_count").html(total_free_count);

            var o2 = [];
            for (var k in obj) {
                o2.push(obj[k]);
            }


            o2.sort(function (a, b) {
                if (+a.price < +b.price) return -1;
                else if (+a.price > +b.price) return 1;
                return 0;
            });


            for (var i in o2) {
                html += '<li data-squares="' + o2[i].priceGroup + '" class="">' +
                '<div class="colorCircle" style="background-color:' + o2[i].color + '"></div>' +
                '<div class="info">' +
                '<a href="#">' + o2[i].price + ' руб.</a>' +
                '<span>' + o2[i].count + ' мест</span>' +
                '</div>' +
                '</li>';
            }


            var squaresInPrice;
            container.html(html);
            container.find('li').on('click', function () {
                clearInterval(interval);
                var tmpPriceGrp = $(this).data('squares');

                if (one_action_map.shiftState == 17) {

                } else {
                    squaresInPrice = [];
                    for (var lig in one_action_map.squares) {
                        if (!one_action_map.squares[lig].lighted_now) one_action_map.squares[lig].lighted_now = false;
                        one_action_map.squares[lig].lighted_now = false;
                    }
                }


                for (var sq in one_action_map.squares) {
                    var sqItem = one_action_map.squares[sq];
                    if (sqItem.priceGroup == tmpPriceGrp) {
                        if (sqItem.status != 0) {
                            squaresInPrice.push(sqItem.id);

                        }
                    }
                }


                var inter = 0;
                interval = window.setInterval(function () {

                    for (var ligInt in squaresInPrice) {
                        var ligItem = squaresInPrice[ligInt];
                        if (!one_action_map.squares[ligItem].lighted_now) one_action_map.squares[ligItem].lighted_now = false;

                        if (inter % 2 == 0) {
                            one_action_map.squares[ligItem].lighted_now = true;
                        } else {
                            one_action_map.squares[ligItem].lighted_now = false;
                        }
                    }
                    inter++;
                    one_action_map.render();
                }, 400);

                toClientscreen({
                    type: 'hightlight',
                    priceGrpId: tmpPriceGrp
                });
            });

        }
    };

    /// Очистить стек билетов
    $("#clear_tickets_stack").click(function () {
        bootbox.dialog({
            message: "Вы уверены что хотите отменить выбор мест?",
            title: "",
            buttons: {
                yes_btn: {
                    label: "Да, уверен",
                    className: "green",
                    callback: function () {
                        tickets_stack.clear_blocked_place();
                    }
                },
                yes_to_all: {
                    label: "Да, для всех залов",
                    className: "red",
                    callback: function () {
                        tickets_stack.clear_blocked_placeAll();
                    }
                },
                cancel: {
                    label: "Отмена",
                    className: "blue"
                }
            }
        });


    });

    $("#prepare_order").on("click", function () {
        var params = {
            action_id:environment.action_id
        };
        var object = "create_reserv_order";
        if (typeof selected_order_id != "undefined") {
            object = "add_tickets_to_order";
            params = {ORDER_ID: selected_order_id};
        }
//        console.log((function(){var d = new Date(); return 'START' + d + d.getMilliseconds()}()));
        one_action_map.getBlocked();
        MB.Core.sendQuery({command: "operation", object: object, sid: sid, params: params}, function (data) {
//            console.log((function(){var d = new Date(); return 'END' + d + d.getMilliseconds()}()));
            if (+data.RC == 0) {
                one_action_map.changed = true;
                MB.Core.switchModal({type: "form", isNewModal: true, name: "form_order", ids: [data['ORDER_ID']]});
            } else {
            }
        });
    });

    $('#reloadMap').on('click', function () {
        one_action_map.reLoad(function () {
            action_price_info.load();
        });
        tickets_stack.load();
    });

    $("#print_tickets_stack").click(function () {
        MB.Core.sendQuery({command: "operation", object: "create_to_pay_order", sid: sid}, function (data) {
            //
            one_action_map.changed = true;
            tickets_stack.load();
            action_price_info.load();
            if (data.RC == 0) {
                var orderId = data.ID;
                MB.Core.sendQuery({
                    command: "get",
                    object: "order",
                    sid: sid,
                    params: {where: " ORDER_ID = " + data.ID}
                }, function (data) {
                    //one_action_map.reLoad();
                    one_action_map.changed = true;
                    var OrderPayment = new MB.OrderPaymentClass({orderId: orderId});
                    var html = OrderPayment.renderOrderPaymentType(data);

                    //console.log(data);

                    var modalObj = {
                        selector: "#portlet-config",
                        title: "Печать билетов и расчет с клиентом. Заказ №<b>" + orderId + "</b>",
                        content: html,
                        modalType: 'modal-sm',
                        modalWidth: '91%',
                        buttons: {
                            ok1: {
                                label: "Распечатать",
                                color: "green",
                                dopAttr: "",
                                callback: function () {
                                    OrderPayment.ButtonsState("off");
                                    send('print_order', {guid: MB.Core.getUserGuid(), order_id: orderId}, function () {
                                        OrderPayment.ButtonsState("on");
                                        updaView.db(orderId);

                                    });
                                    //one_action_map.reLoad();
                                    /*var o = {
                                     command: "operation",
                                     object: "print_order",
                                     sid: MB.User.sid
                                     };
                                     o["ORDER_ID"] = orderId;
                                     //MB.Core.sendQueryForObj(o,function(data){updaView.all(data);});
                                     OrderPayment.ButtonsState("off");
                                     MB.Core.sendQueryForObj(o,function(data){OrderPayment.ButtonsState("on");updaView.db(orderId);});*/
                                }
                            },
                            ok2: {
                                label: "Отменить заказ",
                                color: "red",
                                dopAttr: "",
                                callback: function () {
                                    var o = {
                                        command: "operation",
                                        object: "cancel_order",
                                        sid: MB.User.sid
                                    };
                                    o["ORDER_ID"] = orderId;
                                    OrderPayment.ButtonsState("off");
                                    MB.Core.sendQueryForObj(o, function (data) {
                                        updaView.db(orderId);
                                    });
                                    one_action_map.reLoad();
                                }
                            },
                            cancel: {
                                label: "Закрыть",
                                color: "default",
                                dopAttr: 'data-dismiss="modal"',
                                callback: function () {
                                    one_action_map.reLoad();

                                }
                            }
                        }
                    }

                    MB.Core.ModalMiniContent(modalObj);
                    //console.log(OrderPayment);
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
        //one_action_map.reLoad();
    });

    $("#map_refresh").click(function () {
        one_action_map.reLoad();
    });

    $("#block_all_places").click(function () {
        tickets_stack.block_all_places();
    });

    $('#openClientMapView').on('click', function () {
        function initAfisha() {
            toClientscreen({
                type: 'hall',
                actionId: environment.action_id,
                bgColor: '#131313'
            });
            if (MB.Core.cSreenWindow) {
                MB.Core.cSreenWindow.window.onbeforeunload = function () {
                    MB.Core.cSreenWindow = undefined
                }
            }
        }

        if (MB.Core.cSreenWindow == undefined) {
            MB.Core.cSreenWindow = window.open(MB.Core.doc_root + "clientscreenview");
            MB.Core.cSreenWindow.window.onload = function () {
                window.setTimeout(function () {
                    initAfisha();
                }, 300);
            }
        } else {
            initAfisha();
        }
        return;

        if (MB.User.clientMapViewWindow == null) {
            MB.User.clientMapViewWindow = window.open(location.origin + '/multibooker/clientmapview', 'clientmapview');
            MB.User.clientMapViewWindow.focus();
            MB.User.clientMapViewWindow.onload = function () {
                $clientMapViewWindowDocument = $(MB.User.clientMapViewWindow.document);
                MB.User.clientMapViewWindow.clientmapview = new MB.User.clientMapViewWindow.Map1({
                    container: $clientMapViewWindowDocument.find('.canvasContainer'),
                    mode: 'clientScreen',
                    cWidth: 1000,
                    cHeight: 1000
                });
                var o = {
                    command: "get",
                    object: 'action_scheme',
                    params: {
                        action_id: MB.O.contents[MB.Modal.activemodal].action_id
                    }
                };
                console.log(777777778)
                MB.User.clientMapViewWindow.console.log(777777778)
                MB.User.clientMapViewWindow.clientmapview.loadSquares(o, function () {
                    MB.User.clientMapViewWindow.console.log(777777778)
                    MB.User.clientMapViewWindow.clientmapview.setLayout(function () {
                        MB.User.clientMapViewWindow.clientmapview.setMinMax(function () {
                            MB.User.clientMapViewWindow.clientmapview.setScaleCoff(function () {
                                MB.User.clientMapViewWindow.clientmapview.render(function () {
                                    // MB.User.clientMapViewWindow.clientmapview.reLoadLayout(function(){});
                                });
                            });
                        });
                    });
                });
                console.log(MB.User.clientMapViewWindow.clientmapview);
            }
        } else {
            $clientMapViewWindowDocument = $(MB.User.clientMapViewWindow.document);
            $clientMapViewWindowDocument.find('.canvasContainer').html('');
            MB.User.clientMapViewWindow.clientmapview = new MB.User.clientMapViewWindow.Map1({
                container: $clientMapViewWindowDocument.find('.canvasContainer'),
                mode: 'clientScreen',
                cWidth: 1000,
                cHeight: 1000
            });
            var o = {
                command: "get",
                object: 'action_scheme',
                params: {
                    action_id: MB.O.contents[MB.Modal.activemodal].action_id
                }
            };
            console.log(777777778)
            MB.User.clientMapViewWindow.console.log(777777778)
            MB.User.clientMapViewWindow.clientmapview.loadSquares(o, function () {
                MB.User.clientMapViewWindow.console.log(777777778)
                MB.User.clientMapViewWindow.clientmapview.setLayout(function () {
                    MB.User.clientMapViewWindow.clientmapview.setMinMax(function () {
                        MB.User.clientMapViewWindow.clientmapview.setScaleCoff(function () {
                            MB.User.clientMapViewWindow.clientmapview.render(function () {
                                // MB.User.clientMapViewWindow.clientmapview.reLoadLayout(function(){});
                            });
                        });
                    });
                });
            });
            console.log(MB.User.clientMapViewWindow.clientmapview);
        }
    });

    $("#to_action_list").click(function () {
        switch_content("actions_list", function () {
            testVisibilityminiModal("actions_list");
        });
    });

    $('#clearLightNow').on('click', function () {
        clearInterval(interval);
        for (var lig in one_action_map.squares) {
            if (one_action_map.squares[lig].lighted_now != undefined) {
                one_action_map.squares[lig].lighted_now = false;
            }

        }
        one_action_map.render();
        $('#action_price_info li.selected').removeClass('selected');
        toClientscreen({
            type: 'stopHightlight'
        });
    });


    $('#adminReserv').on('click', function () {

        one_action_map.getBlocked();
        MB.Core.sendQuery({command: "operation", object: "create_admin_place_reserv", sid: sid}, function (data) {
            one_action_map.reLoadList(one_action_map.blockedArray);
        });

    });
    $('#adminReserv_cancel').on('click', function () {
        one_action_map.getBlocked();
        MB.Core.sendQuery({command: "operation", object: "remove_admin_place_reserv", sid: sid}, function (data) {
            one_action_map.reLoadList(one_action_map.blockedArray);
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
     */
    /* tickets_stack.load();
     action_price_info.load();*/
    /*
     //self.reLoad();
     });
     for(var k2 in reserved){
     MB.Core.sendQuery({command:"operation",object:"cancel_ticket",sid:sid,params:{action_scheme_id:reserved[k2]}},function(data){})
     }
     }
     };*/

}




