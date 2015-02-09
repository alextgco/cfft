function log(s) {
    console.log(s);
};
var m;
var iAlert = {
    callback: function () {},
    alert: function (s, callback, condition) {
        if (typeof callback == "function") this.callback = callback;
        this.content.html(s);
        this.box.fadeIn(350);
        if (typeof condition == 'function') {
            condition(this.content);
        }
    },
    init: function () {
        this.box = $("#iFrameAlert");
        this.content = $("#iFrameAlertContent p");
        this.btn = $("#iFrameAlertConfirm");
        this.cancel = $('#iFrameAlertCancel');
        var self = this;
        this.btn.on('click', function () {
            if (!self.btn.hasClass('disabled')) {
                self.box.fadeOut(350);
                self.callback();
            }
        });
        this.cancel.on('click', function () {
            self.box.fadeOut(350);
        });
    }
};
String.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};
/**
 * Виджет для собирания заказа билетов в зале.
 * @param params
 * @param sending_obj
 * @constructor
 */
function get_action_price_info(squares) {
    for (var is in squares) {
        var sqr = squares[is];
        if (sqr.status == 0 || +sqr.price <= 0) continue;
        if (sqr.priceGroup == "") {
            sqr.priceGroup = sqr.color0 + " " + sqr.salePrice + 'руб.';
        }
    }
    var obj = [];
    var html = '';
    var container = $('#iFrameLegendList');
    for (var i1 in squares) {
        var square = squares[i1];
        if (square.status == 0 || +square.price <= 0) continue;
        if (obj[square.priceGroup] === undefined) {
            obj[square.priceGroup] = {
                price: +square.salePrice,// + (+square.salePrice/100*hidden_fee),
                count: 1,
                color: square.color0
            };
        } else {
            obj[square.priceGroup].count++;
        }

    }
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

        html += '<li>' +
            '<div class="legendColor" style="background-color: ' + o2[i].color + '"></div>' +
            '<div class="legendTitle">' + o2[i].price + ' руб</div>' +
            '<div class="legendPrice">' + o2[i].count + '</div>' +
            '</li>';
    }
    container.html(html);
}
function iFrame_init(sending_obj) {
    var bWrapper = undefined;
    function insertZoom(minScale) {
        var isPressed = false;
        var interval = undefined;

        function insertHtml(callback) {
            action_web.container.append('<div id="zoom-wrapper"><div class="zoomBtns_n" id="zoom-in">+</div><div class="zoomBtns_n" id="zoom-out">-</div></div>');
            if (typeof callback == 'function') {
                callback();
            }
        }

        var zooms = {
            zIn: function () {
                action_web.container.trigger("scale_map", [790, 230, 1]);
            },
            zOut: function () {
                action_web.container.trigger("scale_map", [790, 230, -1]);
            }
        };
        $(document).on('mouseup', function () {
            isPressed = false;
            if (interval) {
                clearInterval(interval);
                action_web.moving = false;
                action_web.render();
                action_web.reLoadLayout();
            }
        });
        insertHtml(function () {
            var termBlocks = {
                zoomBtns: $('#zoom-wrapper'),
                zoomIn: $('#zoom-in'),
                zoomOut: $('#zoom-out')
            };


            termBlocks.zoomBtns.on('mousedown', function (e) {
                e = e || window.event;
                var elem = $(e.target);
                var elemId = elem.attr('id');
                if (isPressed) {
                    return;
                }
                isPressed = true;
                if (interval) {
                    clearInterval(interval);
                }
                interval = window.setInterval(function () {
                    switch (elemId) {
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
            $('#zoom-wrapper div').on('mouseup', function () {
                isPressed = false;
                if (interval) {
                    clearInterval(interval);
                    action_web.moving = false;
                    action_web.render();
                    action_web.reLoadLayout();
                }
            });
        })
    }
    function initTerminal(minScale) {
        var isPressed = false;
        var interval = undefined;

        var zoomBtn = '<div id="zoom-wrapper">' +
            '<div id="zoom-in">+</div>' +
            '<div id="zoom-out">-</div>' +
            '</div>';

        var moveBtn = '<div id="move-wrapper">' +
            '<div id="move-top">top</div>' +
            '<div id="move-right">right</div>' +
            '<div id="move-bottom">bottom</div>' +
            '<div id="move-left">left</div>' +
            '</div>';
        var toAfishaBtn = '<div id="backToAfisha">Афиша</div>';

        $('#box_for_multibooker_frame').append(zoomBtn);
        $('#box_for_multibooker_frame').append(moveBtn);
        $('#box_for_multibooker_frame').append(toAfishaBtn);
        //$.getScript(tempHost+"assets/map/multibooker.frame_init.js");

        var moves = {
            left: function () {
                action_web.XCoeff += 20;
                action_web.render();
            },
            right: function () {
                action_web.XCoeff -= 20;
                action_web.render();
            },
            top: function () {
                action_web.YCoeff += 20;
                action_web.render();
            },
            bottom: function () {
                action_web.YCoeff -= 20;
                action_web.render();
            }
        };
        var zooms = {
            zIn: function () {
                action_web.container.trigger("scale_map", [790, 230, 1]);
            },
            zOut: function () {
                action_web.container.trigger("scale_map", [790, 230, -1]);
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
        $(document).on('mouseup', function () {
            isPressed = false;
            if (interval) {
                clearInterval(interval);
                action_web.moving = false;
                action_web.render();
                action_web.reLoadLayout();
            }
        });
        termBlocks.zoomBtns.on('mousedown', function (e) {
            e = e || window.event;
            var elem = $(e.target);
            var elemId = elem.attr('id');
            if (isPressed) {
                return;
            }
            isPressed = true;
            if (interval) {
                clearInterval(interval);
            }
            interval = window.setInterval(function () {
                switch (elemId) {
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
        termBlocks.moveBtns.on('mousedown', function (e) {
            e = e || window.event;
            var elem = $(e.target);
            var elemId = elem.attr('id');

            if (isPressed) {
                return;
            }
            isPressed = true;
            if (interval) {
                clearInterval(interval);
            }
            action_web.moving = true;
            interval = window.setInterval(function () {
                switch (elemId) {
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
    var width = parseInt(box[0].style.width) || 995;
    var height = parseInt(box[0].style.height) || 550;
    var href = document.location.href;
    var action_id = box.data('action_id');
    var frame = sending_obj.frame || box.data('frame');
    var hidden_fee = sending_obj.service_fee || 0;
    var saleSiteFee = sending_obj.agent_percent || 0;
    var isWithBasket = sending_obj.isWithBasket;
    iAlert.init();
    function error(s) {
        var msg = "Ошибка зала";
        if (s != undefined)
            msg = s;
        $("#box_for_multibooker_frame").html(msg);
    }
    if (action_id == 0) {
        box.html('<div style="position: relative; top:49%;height: 49%;"><h2>Мероприятие не указано</h2></div> ');
        return;
    }
    var minusWidth = 0;
    var minusHeight = 0;
    var iFrameLegend = $('#iFrameLegend');
    switch (sending_obj.iFrameLegend_position) {
        case "bottom":
            minusHeight = (sending_obj.nav_height != undefined) ? sending_obj.nav_height : 112;
            //minusHeight = 202;
            break;
        default:
            minusWidth = (sending_obj.nav_width != undefined) ? sending_obj.nav_width : 202;
            //minusWidth = 112;
            break;
    }
    var action_web = new Map1({
        container: sending_obj.container ,
        mode: "iFrame",
        cWidth: sending_obj.cWidth,
        cHeight: sending_obj.cHeight,
        navWideSide: (sending_obj.nav_height != undefined) ? sending_obj.nav_height : 202,
        navNarrowSide: (sending_obj.nav_width != undefined) ? sending_obj.nav_width : 112,
        minusWidth: minusWidth,
        minusHeight: minusHeight,
        doc_root: doc_root || host,
        selectionLimit: 10,
        bgColor: sending_obj.bgColor || "#f7f7f7"
    });
    minusHeight = (sending_obj.nav_height != undefined) ? sending_obj.nav_height : 110;
    minusWidth = (sending_obj.nav_width != undefined) ? sending_obj.nav_width : 200;
    var minusH = (action_web.navNarrowSide != 0) ? 4 : 0;
    var minusW = (action_web.navWideSide != 0) ? 2 : 0;
    switch (sending_obj.iFrameLegend_position) {
        case 'right':
            iFrameLegend.css({
                height: +minusHeight + minusH + "px",
                width: (action_web.cWidth - minusWidth - minusW) + "px",
                left: 700 + 'px'
            });
            break;
        case "bottom":
            iFrameLegend.css({
                height: +minusHeight + minusH + "px",
                width: (action_web.cWidth - minusWidth - minusW) + "px"
            });
            break;
        default:
            iFrameLegend.css({
                height: (action_web.cHeight - minusHeight - minusH) + 'px',
                width: +minusWidth + minusW + "px"
            });
            break;
    }
    var o = {
        command: "get_action_scheme",
        params: {
            action_id: action_id,
            frame: frame
        }
    };
    var layerO = {
        command: "get_action_scheme_layer",
        object: "",
        params: {
            action_id: action_id,
            VISIBLE_IFRAME: "TRUE",
            columns: "ACTION_SCHEME_LAYER_ID",
            order_by: "SORT_NO"
        }
    };
    var objectO = {
        command: "get_action_scheme_object",
        object: "",
        param_field: "ACTION_SCHEME_LAYER_ID",
        params: {
            /*action_id:action_id,*/
            order_by: "SORT_NO"
        }
    };
    var bindListeners = function () {
        action_web.countSelectionAmount = function () {
            var count = 0;
            for (var k in action_web.selection) {
                var square = action_web.squares[action_web.selection[k]] || action_web.squaresTrash[action_web.selection[k]];
                if (typeof square !== "object") {
                    continue;
                }
                count += +square.salePrice;
            }
            return count;
        };
        action_web.setSelectionInfo = function (event,data) {};
        action_web.sendSelection = function () {
            if (action_web.countSelection() == 0) return;
            var confirmText = '<span style="color: #921F1F; font-size: 12px;">' +
                /*'Нажимая кнопку "Ок" Вы перейдете на страницу оплаты и не сможете внести изменения в выбранные Вами для покупки билеты.' +*/
                sending_obj.warning +
                '</span>' +
                '<div class="agreementWrap">'+
                '<label for="agreement">'+
                '<input type="checkbox" id="agreement" name="agreement">'+
                '&nbsp;&nbsp;Я принимаю&nbsp;'+
                '<a class="iFrameLink" target="_blank" href="' + doc_root + sending_obj.rules_path + '">условия пользовательского соглашения</a></label></div>';

            if (!sending_obj.isWithBasket) {
                iAlert.alert(confirmText, function () {
                    socketQuery({command: "create_order", object: "", params: {id: action_web.selection.join(','), action_id: action_id, frame: frame}}, function (result) {
                        var data = JSON.parse(result);
                        if (data['results'][0].code && +data['results'][0].code !== 0) {
                            iAlert.alert(data['results'][0].toastr.message, function () {
                                action_web.clearSelection();
                                action_web.reLoad();
                            });
                            return;
                        }
                        action_web.toAcquiropay(data['results'][0]);
                    });

                }, function (container) {
                    var okBtn = $('#iFrameAlertConfirm');
                    var agreeCheck = container.find('input#agreement');
                    okBtn.addClass('disabled');
                    agreeCheck.on('change', function () {
                        var state = agreeCheck[0].checked;
                        if (state) {
                            okBtn.removeClass('disabled');
                        } else {
                            okBtn.addClass('disabled');
                        }
                    });
                });
            }
        };
        action_web.toAcquiropay = function (result) {
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
            values['ok_url'] = doc_root + "iFrame/payment_ok.php?back=" + document.location.href;
            values['ko_url '] = doc_root + "iFrame/payment_ko.html";

            //var t = merchant_id + product_id + values['amount'] + values['cf'] + secret_word;
            values['token'] = result['TOKEN'];

            var html = "";
            for (key in values) {

                html += key + '<input type="text" name="' + key + '" value="' + values[key] + '" />';
            }
            $("#FormPay").html(html);
            $("#FormPay").submit();
            action_web.clearSelection();
            action_web.reLoad();
        };
        action_web.container.on('selectionLimit', function (e, limit) {
            iAlert.alert("Вы не можете выбрать более " + limit + " мест", function () {
            });
        });
        action_web.container.on('addToSelection', function () {
            action_web.setSelectionInfo();
        });
        action_web.container.on('removeFromSelection', function (e,data) {
            sending_obj.canvasView.trigger("removeBasketItem",sending_obj.canvasView,data);
            action_web.setSelectionInfo();
        });
        action_web.container.on('clearSelection', function (e) {
            action_web.setSelectionInfo();
        });
        $("#toPay").on("click", function () {
            action_web.sendSelection();
        });
    };
    var initCallback = function () {
        get_action_price_info(action_web.squares);
        action_web.loadRenderItems({
            layerO: layerO,
            objectO: objectO
        }, function () {
            action_web.render();
        });
        action_web.setLayout(function () {
            action_web.setMinMax(function () {
                action_web.setScaleCoff(function () {
                    action_web.render(function () {
                        action_web.reLoadLayout(function () {});
                        if (sending_obj.isWithBasket) {
                            basket.selectReservedPlaces();
                            insertZoom(action_web.scaleCoeff);
                        }
                        if (sending_obj.isTerminal != undefined && sending_obj.isTerminal) {
                            initTerminal(action_web.scaleCoeff);
                        }
                    });
                    action_web.setEvents();
                });
            });
        });
        bindListeners();
    };
    action_web.initCallback = initCallback;
    action_web.bindListeners = bindListeners;
    action_web.load = function () {
        action_web.loadSquares(o, initCallback);
    };
    var wrap = $("#box_for_action_web");
    wrap.children("*").each(function () {
        preventSelection($(this)[0]);
    });
    return action_web;
}
