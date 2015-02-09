var Basket = function (params, sending_obj) {

    this.names = params.names || [];
    $('#basketWrapper').remove();
    $('#basketExpand').remove();
    sending_obj.container.append('<div id="basketWrapper"></div>');
    this.bWrapper = sending_obj.container.find('#basketWrapper');
    this.inMove = false;
    this.sending_obj = sending_obj;
};
var BasketItem = function (params) {
    this.ids = params.ids || undefined;
    this.action_id = params.action_id || undefined;
    this.frame = params.frame || undefined;
    this.id = guid();
};
function guid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r, v;
        r = Math.random() * 16 | 0;
        v = (c === "x" ? r : r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
}
Basket.prototype.syncWithLs = function (type) {
    if (type == 'toLs') {
        localStorage.setItem('basket', JSON.stringify(this.items));
    } else {
        if (localStorage.getItem('basket') !== null && localStorage.getItem('basket') !== "") {
            if (this.items.length == 0 && JSON.parse(localStorage.getItem('basket')).length > 0) {
                this.items = JSON.parse(localStorage.getItem('basket'));
            }
            if (localStorage.getItem('basket') !== JSON.stringify(this.items)) {
                localStorage.setItem('basket', JSON.stringify(this.items));
            }
        } else {
            localStorage.setItem('basket', JSON.stringify(this.items));
        }
    }

};
Basket.prototype.deselectPlace = function (id) {
    var _t = this;
    if ($.inArray(id, _t.action_web.selection) != -1) {
        _t.action_web.removeFromSelection(id);
    }
};
Basket.prototype.selectReservedPlaces = function () {
    var _t = this;
    var arr = [];
    for (var i in this.items) {
        if (this.items[i][this.names.indexOf('ACTION_ID')] == this.sending_obj.box.data('action_id')) {
            arr.push(this.items[i][this.names.indexOf('ACTION_SCHEME_ID')]);
        }
    }
    _t.action_web.clearSelection();
    _t.action_web.addToSelection(arr);
};
Basket.prototype.addItem = function (item) {
    var _t = this;
    var toAdd = undefined;
    _t.getDataByPlaces(item.ids, function (res) {
        res = JSON.parse(res);
        toAdd = res;
        function isPresence(item) {
            var result = false;
            var id = item[_t.names.indexOf("ACTION_SCHEME_ID")];
            for (var i in _t.items) {
                if (_t.items[i][_t.names.indexOf("ACTION_SCHEME_ID")] == id) {
                    result = true;
                }
            }
            return result;
        }
        for (var i in toAdd.results[0].data) {
            var item = toAdd.results[0].data[i];
            if (!isPresence(item)) {
                _t.items.push(item);
            }
        }
        _t.syncWithLs('toLs');
        _t.render();
    });
};
Basket.prototype.getDataByPlaces = function (ids, callback) {
    var o = {
        command: 'get_place_data_for_basket',
        params: {
            action_scheme_id_list: ids,
            frame: this.sending_obj.frame
        }
    };
    socketQuery(o, function (res) {
        if (typeof callback == 'function') {
            callback(res);
        }
    });
};
Basket.prototype.render = function () {
    this.sending_obj.basketView.render();
    /*var _t = this;
    var tpl = '<div class="basketTitle">Корзина</div><ul id="basketList">{{#orders}}<li data-id="{{id}}"><div class="title">{{name}} {{short_date}}</div><div class="zone">{{zone}}</div><div class="rowPlace">ряд: {{line}} место: {{place}}</div><div class="price">{{price}} руб.</div> <div class="removeItem"></div></li>{{/orders}}</ul><div id="saleSiteFee">Сервисный сбор: {{saleSiteFee}} руб.</div><div id="totalAmount">Итого: {{totalAmount}} руб.</div><div id="goToPay">Оплатить</div><div id="clearBasket">Очистить</div>';

    function calculateTotal() {
        var result = 0;
        for (var c in _t.items) {
            result += parseInt(_t.items[c][_t.names.indexOf('PRICE')]);
        }
        return result;
    }

    var mustacheObj = {
        orders: [],
        totalAmount: calculateTotal() + _t.getSaleSiteFee(),
        saleSiteFee: _t.getSaleSiteFee()
    };
    for (var i in this.items) {
        var oItem = this.items[i];
        var tmpObj = {
            id: oItem[_t.names.indexOf('ACTION_SCHEME_ID')],
            name: oItem[_t.names.indexOf('ACTION_NAME')],
            short_date: oItem[_t.names.indexOf('ACTION_DATE_TIME')].substr(0, 5),
            price: oItem[_t.names.indexOf('PRICE')],
            line: oItem[_t.names.indexOf('LINE')],
            zone: oItem[_t.names.indexOf('AREA_GROUP_NAME')],
            place: oItem[_t.names.indexOf('PLACE')]
        };
        mustacheObj.orders.push(tmpObj);
    }
    this.bWrapper.html(Mustache.to_html(tpl, mustacheObj));
    this.bWrapper.trigger("endAnimation");
    _t.setHandlers();*/
};
Basket.prototype.ordersArray = function (includeArray) {
    var orders = [];
    var items = [];
    if (!includeArray) includeArray = [];
    for (var i in this.items) {
        if (includeArray.length==0 ||
            includeArray.indexOf(this.items[i][this.names.indexOf('ACTION_SCHEME_ID')])!=-1)
        {
            var oItem = this.items[i];
            var tmpObj = {
                id: oItem[this.names.indexOf('ACTION_SCHEME_ID')],
                name: oItem[this.names.indexOf('ACTION_NAME')],
                short_date: oItem[this.names.indexOf('ACTION_DATE_TIME')].substr(0, 5),
                price: oItem[this.names.indexOf('PRICE')],
                line: oItem[this.names.indexOf('LINE')],
                zone: oItem[this.names.indexOf('AREA_GROUP_NAME')],
                place: oItem[this.names.indexOf('PLACE')]
            };
            orders.push(tmpObj);
            items.push(this.items[i]);
        }
    }
    if (includeArray.length>0) {
        this.items = items;
    }
    return orders;
};
Basket.prototype.setHandlers = function () {
    var _t = this;

    var basketContainer = $('#basketList');
    var removeBtn = basketContainer.find('.removeItem');
    var clearBasket = $('#clearBasket');
    var goToPay = $('#goToPay');

    removeBtn.off('click').on('click', function () {
        var item = $(this).parents('li');
        var id = item.data('id');
        _t.removeItem(id);
    });

    /*this.bExpColl.on('click', function () {
        if (_t.inMove) {
            return;
        }
        if (_t.bExpColl.hasClass('expanded')) {
            _t.collapse();
            _t.bExpColl.removeClass('expanded');
        } else {
            _t.expand();
            _t.bExpColl.addClass('expanded');
        }

    });*/
    clearBasket.on('click', function () {
        _t.items = [];
        _t.syncWithLs('toLs');
        _t.action_web.clearSelection();
        _t.action_web.reLoad();
        _t.render();
    });
    goToPay.on('click', function () {
        _t.goToPay();
    });
};
Basket.prototype.removeItem = function (id) {
    var _t = this;
    for (var i in this.items) {
        var item = this.items[i];
        if (item[_t.names.indexOf('ACTION_SCHEME_ID')] == id) {
            this.items.splice(i, 1);
        }
    }
    this.syncWithLs('toLs');
    this.deselectPlace(id);
    this.render();
};
Basket.prototype.syncWithHall = function () {
    var _t = this;
    var selection = _t.action_web.selection;
    var arrFromServer;
    if (selection.length > 0) {
        _t.getDataByPlaces(selection, function (res) {
            res = JSON.parse(res);
            arrFromServer = res;
            populateModel();
        });
    } else {
        populateEmpty();
    }

    function populateEmpty() {
        var notToRemove = [];
        for (var i = 0; i < _t.items.length; i++) {
            var item = _t.items[i];
            var itemActionId = item[_t.names.indexOf("ACTION_ID")];
            if (itemActionId.toString() != action_id.toString()) {
                notToRemove.push(item);
            }
        }
        _t.items = notToRemove;
        _t.syncWithLs('toLs');
        _t.render();
    }

    function populateModel() {
        var notToRemove = [];
        for (var i = 0; i < _t.items.length; i++) {
            var item = _t.items[i];
            var itemActionId = item[_t.names.indexOf("ACTION_ID")];
            if (itemActionId.toString() != action_id.toString()) {
                notToRemove.push(item);
            }
        }
        _t.items = notToRemove;
        for (var k in arrFromServer.results[0].data) {
            _t.items.push(arrFromServer.results[0].data[k]);
        }
        _t.syncWithLs('toLs');
        _t.render();
    }

    function clearModel() {
        _t.items = [];
        _t.syncWithLs('toLs');
        _t.render();
    }
};
Basket.prototype.goToPay = function () {
    var _t = this;
    var ids = [];
    var actionsList = [];
    for (var i in _t.items) {
        var item = _t.items[i];
        ids.push(item[_t.names.indexOf('ACTION_SCHEME_ID')]);
    }
    for (var k = 0; k < _t.items.length; k++) {
        var kItem = _t.items[k];
        if (k == 0) {
            actionsList.push(kItem[_t.names.indexOf('ACTION_ID')]);
        } else {
            if ($.inArray(kItem[_t.names.indexOf('ACTION_ID')], actionsList) == -1) {
                actionsList.push(kItem[_t.names.indexOf('ACTION_ID')]);
            }
        }
    }

    var confirmText = '<span style="color: #921F1F; font-size: 12px;">' + this.sending_obj.warning + '</span>' +
        '<div class="agreementWrap">' +
        '<label for="agreement">' +
        '<input type="checkbox" id="agreement" name="agreement">' +
        '&nbsp;&nbsp;Я принимаю&nbsp;' +
        '<a class="iFrameLink" target="_blank" href="' + doc_root + this.sending_obj.rules_path + '">' +
        'условия пользовательского соглашения</a></label>' +
        '</div>';

    iAlert.alert(confirmText, function () {
        var o = {command: "create_order", object: "", params: {id: ids.join(','), action_id: actionsList.join(','), frame: _t.sending_obj.frame}};
        socketQuery(o, function (result) {
            var data = JSON.parse(result);
            if (data['results'][0].code && +data['results'][0].code !== 0) {
                iAlert.alert(data['results'][0].toastr.message, function () {
                    _t.action_web.clearSelection();
                    _t.action_web.reLoad();
                });
                return;
            }
            $('#clearBasket').click();
            _t.action_web.toAcquiropay(data['results'][0]);
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
};
Basket.prototype.getSaleSiteFee = function () {
    var _t = this;
    var total = 0;
    for (var i in _t.items) {
        total += parseInt(_t.items[i][_t.names.indexOf('PRICE')]);
    }
    return total / 100 * +this.sending_obj.agent_percent;
};
Basket.prototype.collapse = function () {
    var _t = this;
    _t.inMove = true;
    _t.bWrapper.animate({
        height: 39 + 'px'
    }, 300, function () {
        _t.bWrapper.animate({
            width: 114 + 'px'
        }, 200, function () {
            _t.inMove = false;
            _t.bWrapper.trigger("endAnimation");
        });
    });
};
Basket.prototype.expand = function () {
    var _t = this;
    _t.inMove = true;
    _t.bWrapper.animate({
        width: 400 + 'px'
    }, 300, function () {
        _t.bWrapper.animate({
            height: ((_t.bWrapper.find('li').length * 59) + 44 + 41 > 485) ? 485 + 'px' : (_t.bWrapper.find('li').length * 59) + 44 + 41 + 'px'
        }, 200, function () {
            _t.bWrapper.css('height', 'auto');
            _t.inMove = false;
            _t.bWrapper.trigger("endAnimation");
        });
    });
};