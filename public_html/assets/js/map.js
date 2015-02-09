/**
 * Функция конструктор создает объект для работы со схемой зала
 *
 * @param params
 * container должен быть jq селектор
 * cWidth, cHeight число > 0. Задают размер canvas
 * navWideSide, navNarrowSide число > 0
 * @constructor
 */
//var m1;
var Map1 = function (params) {
    this.init = function () {
        if (typeof Hammer !== "function") {
            $.getScript((params.doc_root || params.host) + 'assets/js/libs/hammer.min.js', function (res) {
            });
        }
        if (typeof isPointInPoly !== "function") {
            $.getScript((params.doc_root || params.host) + 'assets/js/libs/is-point-in-poly.js', function (res) {
            });
        }
    }();

    //m1 = this;
    var map = this;
    /*this.box = ($("#"+params.box).length==1) ? $("#box_for_map") : $("#box_for_map");*/
    /* this.container = params.container || (function(){
     $("body").append("<div id='box_for_map'></div>");
     return $("#box_for_map");
     })();*/

    //IE8 indexOf()
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) {
                    return i;
                }
            }
            return -1;
        }
    }
    this.container = params.container || (function () {
        $("body").append("<div id='box_for_canvas'></div>");
        return $("#box_for_canvas");
    })();

    this.t1 = new Date().getTime();


    this.host = params.host || "";
    this.doc_root = params.doc_root || "";

    this.sqTamplete = new Image();
    this.sqTamplete.src = this.doc_root + 'assets/img/chair40.png';
    this.sqTamplete15 = new Image();
    this.sqTamplete15.src = this.doc_root + 'assets/img/lower16.png';
    this.place_image_urls = [];
    this.container.css("position", "relative");
    this.ctx = '';
    this.ctx2 = '';
    this.screenCanvas = document.createElement('canvas');

    this.buffer = document.createElement('canvas');
    this.buffer.width = 100;
    this.buffer.height = 100;
    this.buffer.ctx = this.buffer.getContext('2d');
    this.shiftState = 0;
    this.mouseKey = 0;
    this.mousemovingFirst = true;
    this.oldMouseX = 0;
    this.oldMouseY = 0;
    this.startScaleCoeff = 0.3;
    this.scaleCoeff = 0.3;
    this.scaleCoeff2 = 0.025;
    this.firstLoad = true;
    this.loadObj = {};
    this.rightColWidth = 410;
    this.setSize = function (p) {
        if (typeof p =='object'){
            for (var i in p) {
                params[i] = p[i];
            }
        }
        //this.containerWidth = params.cWidth || this.container.width();
        this.containerWidth = params.cWidth || this.container.outerWidth();
        this.containerHeight = params.cHeight || this.container.outerHeight();
        //this.containercHeight = params.cHeight || this.container.height();
        this.cWidth = params.cWidth - (params.minusWidth || 0) || this.container.outerWidth() - (params.minusWidth || 0);
        this.cHeight = params.cHeight - (params.minusHeight || 0) || this.container.outerHeight() - (params.minusHeight || 0);
        this.navWideSide = (params.navWideSide != undefined) ? +params.navWideSide : 200;
        this.navNarrowSide = (params.navNarrowSide != undefined) ? +params.navNarrowSide : 110;
        this.displayNavigator = params.displayNavigator || 'block';
    };
    this.setSize.call(this);
    this.bgColor = params.bgColor || "#f7f7f7";
    this.minX = Infinity;
    this.maxX = -Infinity;
    this.maxY = -Infinity;
    this.minY = Infinity;
    this.minW = Infinity;
    this.XCoeff = 100;
    this.YCoeff = 0;
    this.startXCoeff = 100;
    this.startYCoeff = 0;
    this.XCoeff2 = 0;
    this.YCoeff2 = 0;
    this.toPointX = this.navWideSide / 2 || 0;
    this.toPointY = this.navNarrowSide / 2 || 0;
    this.squareWH = 40;
    this.layoutSquares = {};
    this.layoutVCount = 50;
    this.layoutHCount = 50;
    this.squares = {};
    this.sectors = [];
    this.subSectors = [];
    this.squaresTrash = {};
    this.renderList = {
        items: [],
        findItem: function (id) {
            var items = this.items;
            for (var k in items) {
                //if (items[k].object.object_id == id) return items[k];
                if (items[k].object_id == id) return items[k];
            }
            return false;
        },
        removeItem: function (id) {
            var self = this;
            var items = this.items;
            for (var k in items) {
                //if (items[k].object.object_id == id) delete items[k];
                if (items[k].object_id == id) delete items[k];
            }
            function clearEmpty() {
                for (var i = 0; i < self.items.length; i++) {
                    if (self.items[i] === undefined) {
                        self.items.splice(i, 1);
                        clearEmpty();
                    }
                }
            }

            clearEmpty();
        }
    };
    this.RenderItem = function (params) {
        this.object_type = params.object_type;
        this.object = params.object;
    };
    this.labels = {};
    this.hoveredSquare = 0;
    this.moving = false;
    this.shadow = false;
    this.moveCounter = 0;
    this.lighting = false;
    this.selection = [];
    this.selecting = -1;
    this.selectionLimit = params.selectionLimit || -1;
    this.loadParams = undefined;
    this.timersForLight = [];
    this.mouseWheelCounter = 1;
    this.mouseWheelFlag = false;
    this.timerForMouseWheel = null;
    this.hintState = false;
    this.loading = true;
    this.disconnect = false;
    this.mode = params.mode || "admin";
    this.visibleModel = {
        admin: 'VISIBLE_ADMIN',
        casher: "VISIBLE_CASHER",
        editor: "VISIBLE_EDITOR",
        iFrame: "VISIBLE_IFRAME",
        client_screen: "VISIBLE_CLIENT_SCREEN"
    };
    this.editorMode = params.editorMode || "squares";
    this.downX = 0;
    this.downY = 0;
    this.downX_obj = 0;
    this.downY_obj = 0;
    this.changed = false;
    this.load_alias = '';
    this.excludeSelectors = params.excludeSelectors || "";
    this.mapInfo = {
        selection:0,
        inRow:0
    };

    var s = this.mode + '_';
    for (var i2 in this.loadObj.params) {
        s += '_' + i2 + this.loadObj.params[i2];
    }

    map.container.css({width: map.containerWidth + "px", height: map.containercHeight + "px"}).html('' +
        '<div class="loader_box" style="width: ' + map.containerWidth + 'px; height:' + map.containerHeight + 'px; display:none;"><div class="loader"></div></div> ' +
        '<canvas height="' + map.cHeight + '" width="' + map.cWidth + '" id="canvas1" style="background-color:' + this.bgColor + ';">Обновите браузер</canvas>' +
        '' +
        '<div id="topHint">' +
        '<span id="status_area"></span>' +
        '<span id="status_row"></span>' +
        '<span id="status_col"></span>' +
        '<span id="status_cost"></span>' +
        '<span id="status_fund"></span>' +
        '<span id="status_price"></span>' +
        '<span id="status_status"></span>' +
        '<span id="status_id"></span>' +
        '</div>' +
        '<div class="box_for_zoom" style="width: ' + map.navWideSide + 'px; height:' + map.navNarrowSide + 'px; display:' + map.displayNavigator + ';">' +
        '<canvas height="' + map.navNarrowSide + '" width="' + map.navWideSide + '" id="canvas2">Обновите браузер</canvas>' +
        '</div>'
    );
    map.container.attr("tabindex", "1").focus();
    map.loader_box = map.container.children(".loader_box");
    map.loader = map.loader_box.children(".loader");
    map.loader.css({left: map.containerWidth / 2 - 50 + "px", top: map.containercHeight / 2 - 50 + "px"});
    map.hint = map.container.children("#topHint");
    map.zoom_container = map.container.children(".box_for_zoom");
    if (map.navWideSide == 0 || map.navNarrowSide == 0){
        map.zoom_container.css("display", "none");
    }

    if (document.all && !document.addEventListener) {
        G_vmlCanvasManager.initElement(map.container.children("#canvas1")[0]);
        G_vmlCanvasManager.initElement(map.zoom_container.children("#canvas2")[0]);
    }
    map.ctx = map.container.children("#canvas1")[0].getContext('2d');
    map.ctx2 = map.zoom_container.children("#canvas2")[0].getContext('2d');
    this.pictures.init(this);

    map.ctx.font = "italic 20pt 'Open Sans'";
    map.ctx.fillStyle = "#000";
    if (typeof Selector === "function")
        map.selector = new Selector({
            parentBox: map.container,
            zIndex: 102
        });

    if ($("#mapInfo").length==0){
        $("body").append('<div id="mapInfo"></div>');
    }
    // })();s

    if (typeof MB === 'object') {
        MB.Core.spinner.start(this.container);
    }
};


/**
 * Объект содержит изображения для мест на схеме и методы работы с ними
 * @type {{items: {}, get: Function}}
 */

Map1.prototype.pictures = {

    init: function (instance) {
        if ($("#tmpCanvas").length == 0) {
            var canvas = document.createElement('canvas');
            canvas.id = "tmpCanvas";
            canvas.width = 100;
            canvas.height = 100;
            canvas.position = "absolute";
            this.tmpCanvas = canvas;
            //$("#tmpCanvas").css({position: "absolute",zIndex: "2000000"});
            //instance.container.append('<canvas id="tmpCanvas" width="100" height="100" style="display:block; position: absolute; z-index: 2000000; background-color: #c1c1c1; overflow: auto;"></canvas>');
            //$('body').append('<canvas id="tmpCanvas" width="100" height="100" style="display:none; position: absolute; z-index: 2000000; background-color: #c1c1c1;"></canvas>');
        }
        //this.tmpCanvas = $("#tmpCanvas")[0];
        this.instance = instance;
    },
    toPreload: function (obj) {
        if (typeof obj !== "object") {
            return false;
        }

        var alias = obj.alias || obj.options.alias;

        if (!alias) {

            //var scale = this.instance.roundPlus(this.instance.scaleCoeff, 2);
            //alias = obj.mode + obj.color1 + obj.color2 + scale;
            alias = this.getAlias(obj);
            obj.alias = alias;
        }
        if (this.items[alias]) {
            return false;
        }
        if (!this.preload.getItem(alias)) {
            console.log();
            this.preload.stack.push(obj);
            this.items[alias] = true;
        }
        if (this.preload.stack.length && !this.preload.timer) {
            this.preload.start(this.instance);
        }
        console.log();
    },
    preload: {
        self: this,
        stack: [],
        getItem: function (alias) {
            for (var i in this.stack) {
                if (this.stack[i].alias === alias) {
                    return this.stack[i];
                }
            }
            return false;
        },
        start: function (instance) {
            var preload = this;

            if (typeof preload.timer === "number" || !preload.stack.length) {
                /*var t2 = new Date().getTime();
                console.log('preLoad end: ', t2 - instance.t1);
                console.log('Занято');*/
                return;
            }
            this.timer = setTimeout(function () {
                //console.log('preload_WORK');
                var o = preload.stack.shift();
                var alias = o.alias || o.options.alias;

                o.options.personalContext = true;
                o.options.cacheMode = o.cacheMode;
                switch (o.cacheMode){
                    case "square":
                    case "label_place":
                    case "label_line":
                    case "label_place_only":
                        /*if (o.cacheMode == 'label'){
                            debugger;
                        }*/
                        instance.renderSquareImage(o.square, o.options);
                        break;
                }
                /*cacheMode: "square",
                    square:square,
                    options:{
                    mode:mode,
                        scale: scale,
                        alias: alias1
                }*/

                //instance.pictures.get(o);
                clearTimeout(preload.timer);
                delete preload.timer;
                //console.log('preload_ clearTimeout');
                preload.start(instance);
                /*if (preload.stack.length){

                 }*/

                //var alias =
            }, 0);
        }
    },
    items: {},
    length: function(){
        var c = 0;
        for (var i in this.items) {
            c++;
        }
        return c;
    }

    /**
     *
     * @param square
     * @param options
     * @returns {boolean}
     */
};
/**
 * разбивает канвас на прямоугольники. Используется для оптимизации поиска элемента на канвасе.
 * Подготавливается модель, для хранения информации о положении мест на схеме. См. reLoadLayout
 * @param callback
 * @returns {*}
 */
Map1.prototype.setLayout = function (callback) {
    if (typeof callback !== "function") callback = function () {
    };
    this.layoutSquares = {};
    var w = this.cWidth / this.layoutHCount;
    var h = this.cHeight / this.layoutVCount;
    var count = 0;
    for (var i = 0; i < this.layoutVCount; i++) {
        for (var k = 0; k < this.layoutHCount; k++) {
            this.layoutSquares[count] = {x: w * k, y: h * i, w: w, h: h, shapes: []};
            //this.ctx.strokeRect(this.layoutSquares[count].x, this.layoutSquares[count].y, this.layoutSquares[count].w, this.layoutSquares[count].h);
            count++;
        }
    }
    return callback();
};
/**
 * Записывает в объект сформированный в функции setLayout, положение мест на схеме (в какие прямоугольники поподают места). Вызывается при каждом изменении схемы (смещение/маасштабирование)
 * @param callback
 * @returns {*}
 */
Map1.prototype.reLoadLayout = function (callback) {
    if (typeof callback !== "function") callback = function () {
    };
    var wh = this.squareWH;
    var cw = this.cWidth;
    var ch = this.cHeight;
    var coef = wh / 10;
    var self = this;

    function reLoadLayoutChild(key) {
        var x = Math.round((self.squares[key].x) * self.scaleCoeff + self.XCoeff);
        var y = Math.round((self.squares[key].y) * self.scaleCoeff + self.YCoeff);
        if (x <= cw && x >= 0 && y <= ch && y >= 0) {
            var layout1 = self.mouseOnLayout(x - coef, y - coef);
            if (layout1 !== false) {
                self.layoutSquares[layout1].shapes.push(self.squares[key].id);
            }
            var layout2 = self.mouseOnLayout(x + wh * self.scaleCoeff + coef, y - coef);
            if (layout2 !== false) {
                self.layoutSquares[layout2].shapes.push(self.squares[key].id);
            }
            var layout4 = self.mouseOnLayout(x + wh * self.scaleCoeff + coef, y + wh * self.scaleCoeff + coef);
            if (layout4 !== false) {
                self.layoutSquares[layout4].shapes.push(self.squares[key].id);
            }
            var layout3 = self.mouseOnLayout(x - coef, y + wh * self.scaleCoeff + coef);
            if (layout3 !== false) {
                self.layoutSquares[layout3].shapes.push(self.squares[key].id);
            }
            var dyLayout = (layout3 - layout1) / self.layoutHCount - 1;

            for (var kX = layout1; kX <= layout2; kX++) {
                for (var kY = 1; kY <= dyLayout; kY++) {
                    var index = kX + kY * self.layoutHCount;
                    self.layoutSquares[index].shapes.push(self.squares[key].id);
                }
            }

        }
    }

    for (var key in this.squares) {
        reLoadLayoutChild(key);
    }
    return callback();
};
/**
 * Функция диструктор. Отключает сокет. Переносит места в Trash. Очищает объект мест. Возможно что то не учтено.
 * @param callback
 */
Map1.prototype.destroy = function (callback) {
    if (typeof this.closeSocket === "function") {
        this.closeSocket();
    }
    //this.squaresInTrash();
    this.squares = [];
    this.reLoadLayout();
    this.container.off();
    if (typeof callback == "function") {
        callback();
    }
};
/**
 * Осуществляет подключение к сокету в соответсвующую режиму комнаты. И навешивает listeners необходимые для взаимодействия работы схемы с сервером (другими клиентами системы)
 * @param params Описывает режим, в котором находится схема.
 * Пример:
 * socketObject = {
            sid: sid,
            type: "action_scheme",      /// парваметры, к какой комнате подключаться
            param: "action_id",         /// парваметры, к какой комнате подключаться
            id: environment.action_id,  /// парваметры, к какой комнате подключаться
            portion: 30, /// разбивка на порции
            save: { /// параметры обработки клика на место(а) на сервере
                command: "operation",
                object: "block_place_list",
                field_name: "action_scheme_id"
            },
            load: { /// Параметры загрузки информации о месте
                command: "get",
                object: "action_scheme",
                params: {
                    action_id: environment.action_id
                },
                columns: "ACTION_SCHEME_ID,PRICE,STATUS,STATUS_TEXT,FUND_GROUP_NAME,PRICE_GROUP_NAME,BLOCK_COLOR,COLOR",
                field_name: "action_scheme_id"  /// Ключевое поле
            }
        };
 * @param callback
 * @returns {*}
 */
Map1.prototype.openSocket = function (params, callback) {
    if (typeof callback !== "function") callback = function () {
    };
    var self = this;
    var room = params.type + "_" + params.param + "_" + params.id;
    socket.emit('mapConnection', params);
    //socket.removeAllListeners(room+"_callback").on(room+"_callback",function(data,return_type){

    socket.removeAllListeners(room + "_callback").on(room + "_callback", function (data, return_type) {
        switch (return_type) {
            case "places":
                console.log(room + "_callback   " + 'places');
                console.log(data);
                if (data[0] === undefined) {
                    self.clearSelection(true);
                    log("В " + room + "_callback пришел пустой объект");
                    return;
                }
                self.updateSquares(data);
                if (typeof self.sendSelectionCallback === "function") self.sendSelectionCallback();
                break;
            case "ids":
                if (typeof data !== 'object') return;
                var obj = {
                    event: "load",
                    load_params: {
                        list: data,
                        portion: 40
                    }
                };
                self.toSocket(obj);
                break;
        }
    });
    //socket.removeAllListeners(room+"_callbackFull").on(room+"_callbackFull",function(data){
    socket.removeAllListeners(room + "_callbackFull").on(room + "_callbackFull", function (data) {
        console.log(room + "_callbackFull     ");
        if (typeof self.sendSelectionCallbackFull === "function") self.sendSelectionCallbackFull();
    });


    //socket.removeAllListeners(room+"_get_callback_layers").on(room+"_get_callback_layers",function(obj){
    socket.removeAllListeners(room + "_get_callback_layers").on(room + "_get_callback_layers", function (obj) {

        //this.loadObjects()
        //self.container.trigger('getObject_callback',[obj]);
    });


    this.toSocket = function (obj) {
        var guid = '';
        if (typeof MB === 'object') {
            guid = MB.Core.getUserGuid();
        }
        socket.emit(room, obj, guid);
    };
    //socket.removeAllListeners("disconnect").on("disconnect",function(){
    socket.removeAllListeners("disconnect").on("disconnect", function () {
        console.log("socket was disconnected");
        if (self.disconnect) return;
        self.clearSelection(true);
        window.setTimeout(function () {
            self.openSocket(params);
        }, 500);
    });

    //Map1.prototype.closeSocket = function(){
    self.closeSocket = function () {
        //self.disconnect = true;
        socket.emit(room, "leave");
    };

    return callback(room);

};

/**
 * Загружает изображение
 * @param object имя файла/путь(по умолчанию upload)/id
 * @param callback
 */
Map1.prototype.loadImage = function (object, callback) {
    if (typeof object !== 'object') return;
    var name = object.name;
    /* switch (this.mode){
     case "iFrame":
     var path = object.path || "../";
     break;
     default:
     var path = object.path || "";
     break;
     }*/
    var path = object.path || "";

    var image = new Image();
    image.onload = function () {
        if (typeof callback == "function")
            callback(image, object.id);
    };
    image.onerror = function () {
        if (typeof callback == "function")
            callback(false, object.id);
    };
    image.src = this.doc_root + path + name;
    //console.log(this.doc_root+path+name);
};

/**
 * Копирует объекты мест, в резервое храгилище. Требуется для корзины
 */
Map1.prototype.squaresInTrash = function () {

    for (var i in this.squares) {
        var inTrash = false;
        for (var j in this.squaresTrash) {
            if (this.squaresTrash[j].id === this.squares[i].id) {
                inTrash = true;
                break;
            }
        }
        if (!inTrash) {
            this.squaresTrash[this.squares[j].id] = this.squares[j];
        }
    }
};

/**
 * С этой функции начинается вся загрузка зала. В ней запрашиваются с сервера места по переданным параметрам
 * @param params
 * Пример:
 * params = {
            command:"get",
            object:"action_scheme",
            sid:sid,
            params:{
                action_id:<id мероприятия>
            }
        };
 * @param callback
 */
Map1.prototype.loadSquares = function (params, callback) {
    if (typeof callback !== "function") callback = function () {
    };
    this.loading = true;
    this.loadObj = cloneObj(params);
    var s = this.mode + '_';
    for (var i2 in this.loadObj.params) {
        s += '_' + i2 + this.loadObj.params[i2];
    }
    this.load_alias = s;
    this.squares = [];
    var self = this;
    socketQuery(params, function (data) {
        data = JSON.parse(data);
        var DATA = jsonToObj(data['results'][0]);
        self.squares = [];
        for (var k in DATA) {
            var index = DATA[k].FUND_ZONE_ITEM_ID || DATA[k].PRICE_ZONE_ITEM_ID || DATA[k].HALL_SCHEME_ITEM_ID || DATA[k].ACTION_SCHEME_ID || DATA[k].ID;
            self.squares[index] = {};
            self.squares[index].id = index;
            self.squares[index].areaGroup = DATA[k].AREA_GROUP_NAME || '';
            self.squares[index].x = +DATA[k].X || 0;
            self.squares[index].y = +DATA[k].Y || 0;
            self.squares[index].w = (DATA[k].W != "" && DATA[k].W != undefined) ? +DATA[k].W : 40;
            self.squares[index].h = (DATA[k].H != "" && DATA[k].H != undefined) ? +DATA[k].H : 40;
            self.squares[index].line = String(DATA[k].LINE) || '';
            self.squares[index].line_title = (String(DATA[k].LINE_TITLE) !== undefined) ? String(DATA[k].LINE_TITLE) : "Ряд";
            self.squares[index].place = String(DATA[k].PLACE) || '';
            self.squares[index].place_title = (String(DATA[k].PLACE_TITLE) !== undefined) ? String(DATA[k].PLACE_TITLE) : "Место";
            self.squares[index].salePrice = (DATA[k].PRICE != undefined) ? DATA[k].PRICE : "";
            self.squares[index].status = (DATA[k].STATUS != undefined && DATA[k].STATUS != "") ? +DATA[k].STATUS : 1;
            self.squares[index].order_id = (DATA[k].ORDER_ID != undefined && DATA[k].ORDER_ID != "") ? DATA[k].ORDER_ID : -1;
            self.squares[index].order_type = DATA[k].ORDER_TYPE;
            self.squares[index].ticket_id = (DATA[k].ORDER_TICKET_ID != undefined && DATA[k].ORDER_TICKET_ID != "") ? DATA[k].ORDER_TICKET_ID : -1;
            self.squares[index].textStatus = (DATA[k].STATUS_TEXT != undefined && DATA[k].STATUS_TEXT != "") ? DATA[k].STATUS_TEXT.replace(/\&lt\;br\&gt\;/g, '<br>') : "";
            self.squares[index].fundGroup = DATA[k].FUND_GROUP_NAME || '';
            /*self.squares[index].fundGroupId = DATA[k].FUND_GROUP_ID;*/
            self.squares[index].priceGroup = DATA[k].PRICE_GROUP_NAME || '';
            self.squares[index].blocked = DATA[k].BLOCK_COLOR || "#c1c1c1";
            self.squares[index].layer_id = DATA[k].HALL_SCHEME_LAYER_ID || "";
            self.squares[index].object_id = DATA[k].HALL_SCHEME_OBJECT_ID || DATA[k].ACTION_SCHEME_OBJECT_ID || "";
            self.squares[index].color0 = (DATA[k].COLOR != undefined && DATA[k].COLOR != "") ? DATA[k].COLOR : "#c1c1c1";
            self.squares[index].comment = DATA[k].PLACE_COMMENT || "";
            self.squares[index].place_group_id = DATA[k].PLACE_GROUP_ID;
            self.squares[index].colorShadow = "#c6c2c2";
            self.squares[index].colorSelected = "#FF0000";
            self.squares[index].place_image_url = DATA[k].PLACE_IMG_URL || 'topView';
            var url = self.squares[index].place_image_url;
            if (url != "" && (self.place_image_urls.indexOf(url+'16.png')==-1 || self.place_image_urls.indexOf(url+'40.png')==-1 ||self.place_image_urls.indexOf(url+'120.png')==-1)) {
                self.place_image_urls.push(url+'16.png');
                self.place_image_urls.push(url+'40.png');
                self.place_image_urls.push(url+'120.png');
                for (var i in self.place_image_urls) {
                    self.loadImage({
                        path: 'assets/img/',
                        name: self.place_image_urls[i],
                        id: self.place_image_urls[i]
                    }, function (image, index) {
                        if (!image) {
                            console.log('ERROR loadind ');
                            //self.squares[index].place_image_url = '';
                        } else {
                            self.pictures.items[index] = image;
                        }
                        delete self.place_image_urls[self.place_image_urls.indexOf(index)];
                        self.place_image_urls.length--;
                        if (self.place_image_urls.length == 0){
                            self.render();
                        }
                    });
                }

            }
            if (self.mode === 'iFrame') {
                self.squares[index].colorSelected = "#000";
            }
            var color = +self.squares[index].color0.replace("#", "0x");
            if (color > +"0x8b5742")
                self.squares[index].textColor = "#000";
            else
                self.squares[index].textColor = "#fff";


            //self.createSquareImage(self.squares[index]);
        }

        self.loading = false;
        if (typeof MB === 'object') {
            MB.Core.spinner.stop(self.container);
        }
        self.container.trigger("squaresLoaded", [self.squares]);

        //self.loader_box.fadeOut(650);


        return callback();
    });

    Map1.prototype.preLoad = function (callback) {
        this.t1 = new Date().getTime();
        var scale = this.roundPlus(this.scaleCoeff, 1);
        for (var i = 0; i < 11; i++) {
            var alias = this.pictures.getAlias({
                mapMode: this.mode,
                load_alias: this.load_alias,
                mode: "canvas",
                scale: scale
            });
            this.pictures.toPreload({mode: "canvas", alias: alias, scale: scale});
            scale += 0.1;
        }

    };

    /**
     * Выполняет обновлений данных с сервера, с отрисовкой.
     * @param callback
     */
    Map1.prototype.reLoad = function (callback) {
        self.changed = false;
        self.loading = true;
        if (typeof MB === 'object') {
            MB.Core.spinner.start(self.container);
        }
        if (self.mode == "sector"){
            for (var i in self.selector) {
                self.selector[i].selected = false;
            }
            self.loading = false;
            if (typeof MB === 'object') {
                MB.Core.spinner.stop(self.container);
            }
            return;
        }
        //self.loader_box.fadeIn(250);
        self.loadSquares(self.loadObj, function () {
            self.setLayout(function () {
                self.reLoadLayout(function () {
                    self.render(function () {
                    });
                    self.loading = false;
                    if (typeof MB === 'object') {
                        MB.Core.spinner.stop(self.container);
                    }
                    if (typeof callback === "function")
                        callback();
                });
            });
        });
    };

    /**
     * Перезагружает информацию о перечисленных в параметрах местах
     * @param list массив мест
     * @param callback
     */
    Map1.prototype.reLoadList = function (list, callback) {
        if (!self.reLoadListCount) self.reLoadListCount = 0;
        self.reLoadListCount++;
        console.log(self.reLoadListCount);
        if (typeof list != 'object') {
            return;
        }
        var obj = {
            event: "load",
            load_params: {
                list: [list],
                portion: 20
            }
        };
        this.toSocket(obj);

    };

};
/**
 * Значение nCheck = 0, если точка b лежит на прямой, проходящей через точки a и c.
 nCheck > 0, если точка b находится справа от прямой.
 nCheck < 0, если точка b находится слева от прямой (на рисунке точка B').
 * @param a
 * @param b
 * @param c
 * @returns {number}
 */
Map1.prototype.checkPoint = function(a,b,c) {
    return (b.x-a.x)*(b.y-c.y)-(b.y-a.y)*(b.x-c.x);
};
Map1.prototype.degToRad = function(deg) { return deg / 180 * Math.PI; };
Map1.prototype.radToDeg = function(rad) { return rad / Math.PI * 180; };
/**
 * задача: имееются координаты точки отсчёта (не обязательно (0,0) ), и имеется точка.
 необходимо вычислить угол наклона относительно начала точки отсчёта.
 по часовой стрелке: вверху 0, справа 90, снизу 180, слева 270
 * @param center
 * @param point
 * @returns {number}
 */
Map1.prototype.get_angle = function (center, point) {
    var x = point.x - center.x;
    var y = point.y - center.y;
    if (x == 0) return (y > 0) ? 180 : 0;
    var a = Math.atan(y / x) * 180 / Math.PI;
    a = (x > 0) ? a + 90 : a + 270;
    return a;
};
Map1.prototype.sectorMinMax = function () {
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    for (var i in this.sectors) {
        var sub_groups = this.sectors[i].sub_groups;
        for (var j in sub_groups) {
            var points2 = sub_groups[j];
            for (var p in points2) {
                minX = (minX > points2[p].x) ? points2[p].x : minX;
                minY = (minY > points2[p].y) ? points2[p].y : minY;
                maxX = (maxX < points2[p].x) ? points2[p].x : maxX;
                maxY = (maxY < points2[p].y) ? points2[p].y : maxY;
            }
        }
    }

    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
};
Map1.prototype.fillPoint = function(point,fillStyle) {
    //return;
    this.ctx.beginPath();
    this.ctx.arc(point.x * this.scaleCoeff + this.XCoeff,point.y * this.scaleCoeff + this.YCoeff, 2, 0, 360);
    this.ctx.closePath();
    this.ctx.fillStyle = fillStyle || "#FFF";
    this.ctx.fill();
};

Map1.prototype.hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};
Map1.prototype.loadSectors = function (params, callback) {
    if (typeof callback !== "function") callback = function () {
    };
    this.t1 = new Date().getTime();
    var self = this;
    this.minusScale = 0;
        //self.loadSectorsParams = params;
    self.socketObject = params.socketObject;
    self.squareO = params.squareO;
    self.layerO = params.layerO;
    self.objectO = params.objectO;
    self.oldMode = self.mode;
    self.mode = "sector";
    self.theme = params.theme || "light";
    switch (self.theme){
        case "none":
            self.zonesBgColor = params.zonesBgColor || "#fff";
            self.zoneFillColorRGB = [47,164,231];
            break;
        case "light":
            self.zonesBgColor = params.zonesBgColor || "#fff";
            self.zoneFillColorRGB = [47,164,231];
            break;
        case "dark":
            self.zonesBgColor = params.zonesBgColor || "#fff";
            self.zoneFillColorRGB = [47,164,231];
            break;
    }

    self.setBgColor(self.zonesBgColor, 1000);

    var action_id = params.action_id;
    var frame = params.frame;
    if (!action_id || !frame){
        console.log('Не переданы необходимые параметры');
        return;
    }
    var o = {command: "get_action_sectors", params: {action_id: action_id, frame: frame}};
    var field_name = 'AREA_GROUP_STROKE';
    socketQuery(o, function (data) {
        data = JSON.parse(data);
        var DATA = jsonToObj(data['results'][0]);
        self.sectors = [];
        for (var i in DATA) {
            var o = {
                action_id: DATA[i].ACTION_ID,
                action_group_id: DATA[i].AREA_GROUP_ID,
                name: DATA[i].NAME,
                free_places: DATA[i].FREE_PLACES,
                status: !!DATA[i].FREE_PLACES,
                min_price: !!DATA[i].MIN_PRICE,
                max_price: !!DATA[i].MAX_PRICE,
                opaciti:0,
                /*light:0,*/
                color:self.zoneFillColorRGB,
                sub_groups: []
            };
            var subGroupsSTR = DATA[i][field_name].split('|');
            for (var j in subGroupsSTR) {
                var XYSTR = subGroupsSTR[j].split(';');
                var subGroup = [];
                for (var m in XYSTR) {
                    var coors = {};
                    var XY = XYSTR[m].split(',');
                    var w = 40;
                    var h = 40;
                    coors.x = +XY[0];
                    coors.y = +XY[1];
                    subGroup.push(coors);
                }
                o.sub_groups.push(subGroup);

            }
            self.sectors.push(o);
        }
        self.sectorMinMax();
        self.setScaleCoff(function () {
            //self.setLayout();
            self.setEvents();
            self.drawSectorsTimer();
            console.log(self);

        });
        callback();
    });
};
Map1.prototype.backToSectors = function(callback){
    this.mode = "sector";
    this.sectorMinMax();
    this.minusScale = 0;
    this.setScaleCoff();
    for (var i in this.sectors) {
        delete this.sectors[i].selected;
        delete this.sectors[i].lighted;
    }
    this.container.trigger("move_hint", [0, 0]);
    this.setBgColor(this.zonesBgColor);
    this.drawSectorsTimer();
    if (typeof callback=="function"){
        callback();
    }
};
Map1.prototype.sectorsSelect = function (callback) {
    if (typeof callback!=="function"){
        callback = function(){};
    }
    this.container.css({cursor:"default"});
    var sector_ids = [];
    for (var i in this.sectors) {
        if (this.sectors[i].selected){
            sector_ids.push(this.sectors[i].action_group_id);
        }
    }
    delete this.minusScale;
    var self = this;
    var ids = sector_ids.join(',');
    self.socketObject.load.params.area_group_id = ids;
    if (typeof self.squareO.params!=="object"){
        self.squareO.params = {};
    }
    self.squareO.params.area_group_id = ids;
    self.mode = self.oldMode;
    self.minX = Infinity;
    self.maxX = -Infinity;
    self.minY = Infinity;
    self.maxY = -Infinity;
    /*self.layerO.params.VISIBLE = 'IFRAME';*/
    self.objectO.params.VISIBLE = 'IFRAME';
    self.loadSquares(self.squareO, function () {
        self.loadRenderItems({
            layerO: self.layerO,
            objectO: self.objectO
        }, function () {
            self.render();
        });
        self.setLayout(function () {
            self.setMinMax(function () {
                self.setScaleCoff(function () {
                    self.setBgColor(self.bgColor);
                    self.render(function () {
                        self.reLoadLayout(function () {
                            if (typeof callback == 'function') {
                                callback();
                            }

                        });
                    });
                });
            });
        });
    });
};

/**
 * Функция загружает данные обводок и надписей
 * @param params - объект,  - запрос данных command, object, sid, params
 *
 */
Map1.prototype.fillRenderList = function (objects, callback) {
    var self = this;
    var counter1 = 0;
    var counter2 = 0;
    /*objects = objects.sort(function(a,b){
     if (a.type == 1 && b.type == 2){
     return -1;
     }else if(a.type == 2 && b.type == 1){
     return 1;
     }
     return 0;
     });*/
    objects = objects.sort(function (a, b) {
        if (a.type === "BACKGROUND" && b.type !== "BACKGROUND") {
            return -1;
        } else if (a.type !== "BACKGROUND" && b.type === "BACKGROUND") {
            return 1;
        }
        return 0;
    });
    objects = objects.sort(function (a, b) {
        if (a.type === 1 && b.type !== 1) {
            return -1;
        } else if (a.type !== 1 && b.type === 1) {
            return 1;
        }
        return 0;
    });
    for (var k in objects) {
        counter1++;
        var OBJECT = objects[k];
        switch (OBJECT.type) {
            case 1:  //  BACKGROUND
            case "BACKGROUND":  //  BACKGROUND
                self.loadImage({
                    path: "",
                    name: OBJECT.image,
                    id: counter1 - 1
                }, function (image, index) {
                    if (!image){
                        console.log('ERROR loadind ',objects[index].value);
                        delete objects[index];
                    }else{
                        objects[index].value = image;
                        objects[index].loaded = true;
                    }
                    counter2++;
                });
                break;
            case 2:  //  IMAGE
            case "IMAGE":  //  IMAGE
                self.loadImage({
                    path: "",
                    name: OBJECT.image,
                    id: counter1 - 1
                }, function (image, index) {
                    if (!image){
                        console.log('ERROR loadind ',objects[index].value);
                        delete objects[index];
                    }else{
                        objects[index].value = image;
                        objects[index].loaded = true;
                    }
                    counter2++;
                });
                break;
            case 4:  //  LABEL
            case "LABEL":  //  LABEL
                counter2++;
                break;
            default:
                counter2++;
                break;
        }
        var item = OBJECT;
        /*var item = new self.RenderItem({
            object_type: OBJECT.type,
            object: OBJECT
        });*/
        self.renderList.items.push(item);

    }
    var t1 = setInterval(function () {

        if (counter1 == counter2) {

            if (typeof callback == "function"){
                callback();
            }


            clearInterval(t1);
        }
    }, 100)

};

/**
 * Загружает вспомогательные объекты отображаемые на схеме (обводки, изображения)
 * @param params
 * @param callback
 */
Map1.prototype.loadRenderItems = function (params, callback) {
    var self = this;
    var where_field = params.objectO.where_field;
    var param_field = params.objectO.param_field;
    //var object_where = params.objectO.where;
    if (where_field)
        delete params.objectO.where_field;
    if (param_field)
        delete params.objectO.param_field;


    socketQuery(params.layerO, function (results) {

        var objectList = self.renderList.items || [];
        var layersCount = 0;
        var currentLayer = 0;



        var data = JSON.parse(results);
        var LAYERS = jsonToObj(data['results'][0]);
        for (var i in LAYERS) {
            layersCount++;
        }

        var OBJECT_TYPE = {
            PLACE_GROUP: {
                type: 0,
                object_title: "Места"
            },
            BACKGROUND: {
                type: 1,
                object_title: "Фон"

            },
            IMAGE: {
                type: 2,
                object_title: "Изображение"
            },
            STROKE: {
                type: 3,
                object_title: "Обводка"
            },
            LABEL: {
                type: 4,
                object_title: "Надпись"
            }
        };

        for (var l in LAYERS) {
            if (where_field)
                params.objectO.params.where = where_field + " = " + LAYERS[l][where_field] + " and OBJECT_TYPE <> 'PLACE_GROUP'";
            if (param_field)
                params.objectO.params[param_field] = LAYERS[l][param_field];

            if (self.mode != 'editor' && params.objectO.params.where) {
                params.objectO.params.where = (typeof params.objectO.params.where !== undefined) ? params.objectO.params.where + " and VISIBLE_" + self.mode.toUpperCase() + " = 'TRUE'" : 'VISIBLE_' + self.mode.toUpperCase() + " = 'TRUE'";
            }
            socketQuery(params.objectO, function (results) {
                var data = JSON.parse(results);
                var OBJECTS = jsonToObj(data['results'][0]);
                /*  log("OBJECTS");
                 log(OBJECTS);*/
                var objs = [];
                for (var k in OBJECTS) {
                    var obj = OBJECTS[k];
                    if (OBJECT_TYPE[obj.OBJECT_TYPE].type == 0) continue;
                    var objectId = obj.HALL_SCHEME_OBJECT_ID || obj.ACTION_SCHEME_OBJECT_ID || undefined;
                    if (self.renderList.findItem(objectId)){
                        console.log('Object is already in renderList');
                        return;

                    }
                    var readyO ={
                        object_id: objectId,
                        type: OBJECT_TYPE[obj.OBJECT_TYPE].type,
                        value: obj.VALUE || obj.value || "",
                        color: obj.COLOR || "#000",
                        object_title: obj.NAME || OBJECT_TYPE[obj.OBJECT_TYPE].object_title,
                        image: obj.BACKGROUND_URL_SCALE || obj.BACKGROUND_URL_ORIGINAL || undefined,
                        scaleCoeff: +obj.SCALE || 1,
                        rotation: +obj.ROTATION || 0,
                        visibility: {
                         visible_editor: (obj.VISIBLE_EDITOR == "TRUE"),
                         visible_admin: (obj.VISIBLE_ADMIN == "TRUE"),
                         visible_casher: (obj.VISIBLE_CASHER == "TRUE"),
                         visible_iframe: (obj.VISIBLE_IFRAME == "TRUE"),
                         visible_client_screen: (obj.VISIBLE_CLIENT_SCREEN == "TRUE")
                         },
                        x: obj.X,
                        y: obj.Y,
                        fontFamily: obj.FONT_FAMILY,
                        fontSize: obj.FONT_SIZE,
                        fontStyle: obj.FONT_STYLE,
                        fontWeight: obj.FONT_WIEGHT
                    };
                    readyO.visibility['visible_'+self.mode.toLowerCase()] = true;
                    objectList.push(readyO);

                }
                currentLayer++;
                if (currentLayer === layersCount) {
                    self.fillRenderList(objectList, function () {
                        if (typeof callback == "function")
                            callback();
                    });
                }


            })
        }

    });


};
/**
 * Обнавляет переданное место. (только изменившиеся поля). Обычно координаты не меняются и эта вункция используется для обновления статуса доступности места...
 * @param square
 * @param indexName
 */
Map1.prototype.updateSquare = function (square, indexName) {
    if (typeof square !== 'object') return;
    var index = square[indexName];
    if (this.squares[index] == undefined) {
        this.squares[index] = {};
        this.squares[index].id = index;
    }
    this.squares[index].areaGroup = (square.AREA_GROUP_NAME != undefined && square.AREA_GROUP_NAME != "") ? square.AREA_GROUP_NAME : (this.squares[index].areaGroup != undefined) ? this.squares[index].areaGroup : "";
    this.squares[index].x = (square.X != undefined && square.X != "") ? +square.X : (this.squares[index].x != undefined) ? this.squares[index].x : 10;
    this.squares[index].y = (square.Y != undefined && square.Y != "") ? +square.Y : (this.squares[index].y != undefined) ? this.squares[index].y : 10;
    this.squares[index].w = (square.W != undefined && square.W != "") ? +square.W : (this.squares[index].w != undefined) ? this.squares[index].w : 40;
    this.squares[index].h = (square.H != undefined && square.H != "") ? +square.H : (this.squares[index].h != undefined) ? this.squares[index].h : 40;
    this.squares[index].line = (square.LINE != undefined && square.LINE != "") ? String(square.LINE) : (this.squares[index].line != undefined) ? String(this.squares[index].line) : "";
    this.squares[index].line_title = (square.LINE_TITLE !== undefined) ? String(square.LINE_TITLE) : (this.squares[index].line_title !== undefined) ? this.squares[index].line_title : "Ряд";
    this.squares[index].place_title = (square.PLACE_TITLE !== undefined) ? String(square.PLACE_TITLE) : (this.squares[index].place_title !== undefined) ? this.squares[index].place_title : "Место";
    this.squares[index].place = (square.PLACE != undefined && square.PLACE != "") ? String(square.PLACE) : (this.squares[index].place != undefined) ? String(this.squares[index].place) : "";
    this.squares[index].salePrice = (square.PRICE != undefined) ? square.PRICE : (this.squares[index].salePrice != undefined) ? this.squares[index].salePrice : "";
    this.squares[index].status = (square.STATUS != undefined && square.STATUS != "") ? +square.STATUS : (this.squares[index].status != undefined) ? this.squares[index].status : "";
    this.squares[index].order_id = (square.ORDER_ID != undefined && square.ORDER_ID != "") ? square.ORDER_ID : (this.squares[index].order_id != undefined) ? this.squares[index].order_id : -1;
    this.squares[index].order_type = square.ORDER_TYPE;
    this.squares[index].ticket_id = (square.ORDER_TICKET_ID != undefined && square.ORDER_TICKET_ID != "") ? square.ORDER_TICKET_ID : (this.squares[index].ticket_id != undefined) ? this.squares[index].ticket_id : -1;
    this.squares[index].textStatus = (square.STATUS_TEXT != undefined && square.STATUS_TEXT != "") ? square.STATUS_TEXT.replace(/\&lt\;br\&gt\;/g, '<br>') : (this.squares[index].textStatus != undefined) ? this.squares[index].textStatus : "";
    this.squares[index].fundGroup = (square.FUND_GROUP_NAME !== undefined) ? square.FUND_GROUP_NAME : (this.squares[index].fundGroup != undefined) ? this.squares[index].fundGroup : "";
    this.squares[index].priceGroup = (square.PRICE_GROUP_NAME !== undefined) ? square.PRICE_GROUP_NAME : (this.squares[index].priceGroup != undefined) ? this.squares[index].priceGroup : "";
    this.squares[index].blocked = (square.BLOCK_COLOR !== undefined) ? square.BLOCK_COLOR : this.squares[index].blocked;
    this.squares[index].color0 = (square.COLOR != undefined && square.COLOR != "") ? square.COLOR : this.squares[index].color0;
    this.squares[index].layer_id = square.HALL_SCHEME_LAYER_ID || this.squares[index].layer_id;
    this.squares[index].object_id = square.HALL_SCHEME_OBJECT_ID || this.squares[index].object_id;
    this.squares[index].comment = square.PLACE_COMMENT || this.squares[index].comment;
    this.squares[index].colorShadow = "#c6c2c2";
    this.squares[index].colorSelected = "#FF0000";

    var color = +this.squares[index].color0.replace("#", "0x");
    if (color > +"0x8b5742")
        this.squares[index].textColor = "#000";
    else
        this.squares[index].textColor = "#fff";

    delete this.squares[index].lighted;


    this.drawOneSquare(index);
};
/**
 * Функция обертка над updateSquare см. выше
 * @param data
 * @param callback
 * @returns {*}
 */
Map1.prototype.updateSquares = function (data, callback) {
    if (typeof data !== 'object') return;
    if (typeof callback !== "function") callback = function () {
    };
    function getIndexFieldName() {
        var arr = ["FUND_ZONE_ITEM_ID", "PRICE_ZONE_ITEM_ID", "HALL_SCHEME_ITEM_ID", "ACTION_SCHEME_ID", "ID"];
        for (var k in arr) {
            if (data[0][arr[k]] !== undefined) return arr[k];
        }
        return false;
    }

    var indexName = getIndexFieldName();
    if (!indexName) return;

    for (var k in data) {
        this.updateSquare(data[k], indexName);
    }
    //this.render();
    return callback();
};

/**
 * Возвращает количество мест
 * @returns {number}
 */
Map1.prototype.squaresCount = function () {
    var counter = 0;
    for (var k in this.squares) {
        counter++;
    }
    return counter;
};

/**
 * Удаляет переданные места
 * @param ids
 * @param callback
 */
Map1.prototype.removeSquares = function (ids, callback) {
    if (typeof ids !== 'object') {
        ids = [ids];
    }
    for (var i in ids) {
        delete this.squares[+ids[i]];
    }
    if (typeof callback == "function")
        callback();
    else
        this.render();
    this.container.trigger('removeSquares');
};


/**
 * Функция находит минимальные и максимальные значения X,Y для элементов отрисовываемых на схеме
 * Служит для позиционирования схемы по центру и масштабирования на всю область отрисовки
 * this.squares = []
 * this.labels = []
 * @param callback
 * @return {*}
 */
Map1.prototype.setMinMax = function (callback) {
    if (typeof callback !== "function") callback = function () {
    };

    var tmX, tmY, tmW;
    var squares = this.squares;
    if (typeof squares[squares.length - 1] === 'object') {
        this.squareWH = squares[squares.length - 1].w || 40;
    }
    if (typeof squares === 'object') {
        for (var k in squares) {
            tmX = +squares[k].x;
            tmY = +squares[k].y;
            tmW = +squares[k].w;
            if (this.maxX < tmX) this.maxX = tmX;
            if (this.maxY < tmY) this.maxY = tmY;
            if (this.minX > tmX) this.minX = tmX;
            if (this.minY > tmY) this.minY = tmY;

            if (this.minW > tmW) this.minW = tmW;
        }
    }
    var labels = this.labels;
    if (typeof labels === 'object') {

        for (var i in labels) {
            tmX = +labels[i].x;
            tmY = +labels[i].y;
            if (this.maxX < tmX) this.maxX = tmX;
            if (this.maxY < tmY) this.maxY = tmY;
            if (this.minX > tmX) this.minX = tmX;
            if (this.minY > tmY) this.minY = tmY;
        }
    }
    return callback();

};
/**
 * Округляет до нужного кол-ва знаков после запятой
 * @param x число
 * @param d 10,100,1000
 * @returns {*}
 */
Map1.prototype.round = function (x, d) {
    //if (isNaN(x) || isNaN(d)) return false;
    return Math.round(x * d) / d;
};
Map1.prototype.roundPlus = function (x, n) { //x - число, n - количество знаков
    if (isNaN(x) || isNaN(n)) return false;
    var m = Math.pow(10, n);
    return Math.round(x * m) / m;
};

/**
 * Устанавливает оптимальный для схемы параметр scaleCoeff, служит для масштабирования.
 * @param callback
 * @returns {*}
 */
Map1.prototype.setScaleCoff = function (callback) {
    if (typeof callback !== "function") callback = function () {
    };

    var bw = this.cWidth;
    var bh = this.cHeight;

    this.XCoeff = 0;
    this.YCoeff = 0;

    var w = Math.abs(this.maxX - this.minX) + this.squareWH;//+bw*2/10;
    var h = Math.abs(this.maxY - this.minY) + this.squareWH;//+bh*2/10;


    var minusScale;
    if (w / bw > h / bh) {
       /* if (bw < w) {
            this.scaleCoeff = bw / w;
        } else {
            this.scaleCoeff = w / bw;
        }*/


        this.scaleCoeff = bw / w;


        minusScale = 4 * this.squareWH / w;

    } else {
       /* if (bh < h) {
            this.scaleCoeff = bh / h;
        } else {
            this.scaleCoeff = h / bh;
        }
*/

        this.scaleCoeff = bh / h;

        minusScale = 4 * this.squareWH / h;
    }
    //minusScale = 0.05;
    minusScale =  this.minusScale || 0.04;

    this.scaleCoeff -= minusScale;
    this.scaleCoeff = this.roundPlus(this.scaleCoeff, 3);
    this.startScaleCoeff = this.scaleCoeff;
    /*var dx = Math.abs(this.maxX+this.squareWH - this.minX);
     var dy = Math.abs(this.maxY+this.squareWH - this.minY);*/
    var dx = Math.abs(this.maxX - this.minX) + this.squareWH;
    var dy = Math.abs(this.maxY - this.minY) + this.squareWH;
    //var dy = Math.abs(this.maxY - this.minY) + this.squareWH - 150;
    /*var dy = Math.abs(this.maxY - this.minY) + this.squareWH - 450;*/

    this.XCoeff = -this.minX * this.scaleCoeff + (bw - dx * this.scaleCoeff) / 2;
    this.YCoeff = -this.minY * this.scaleCoeff + (bh - dy * this.scaleCoeff) / 2;
    //this.YCoeff = (bh-dy*this.scaleCoeff)/2;


    if (this.scaleCoeff <= 0) {
        this.scaleCoeff = 0.3;
        this.startScaleCoeff = 0.3;
        this.XCoeff = 0;
        this.YCoeff = 0;
    }

    this.startXCoeff = this.XCoeff;
    this.startYCoeff = this.YCoeff;
    // Вычисляем ориентацию навигатора

    var bw2 = this.navWideSide;
    var bh2 = this.navNarrowSide;

    /* if (dx<dy){
     bw2 = this.navNarrowSide;
     bh2 = this.navWideSide;
     }*/
    this.zoom_container.width(bw2);
    this.zoom_container.height(bh2);


    var coef1 = bw2 / dx;
    var coef2 = bh2 / dy;

    if (coef1 >= coef2) {
        this.scaleCoeff2 = coef2;
        this.XCoeff2 = (bw2 - dx * this.scaleCoeff2) / 2;

    } else {
        this.scaleCoeff2 = coef1;
        this.YCoeff2 = (bh2 - dy * this.scaleCoeff2) / 2;
    }
    return callback();
};
Map1.prototype.splitSelection = function (ids, inPoints) {
    this.xSelection = [];
    this.ySelection = [];
    var self = this;
    var sel = [];
    var selection = ids || this.selection;
    for (var s0 in  selection) {
        sel.push(selection[s0]);
    }
    var get_sel_length = function () {
        var count = 0;
        for (var k in sel) {
            count++;
        }
        return count;

    };
    var get_sel_first = function () {
        var min = sel.length;
        for (var k in sel) {
            if (+k < min) min = k;
        }
        return min;
    };

    var xCount = 0;

    var points = inPoints || self.squares;
    this.minXSelection = points[sel[get_sel_first()]].x;
    this.minYSelection = points[sel[get_sel_first()]].y;
    while (get_sel_length() != 0) {
        this.xSelection[xCount] = [];
        var get_first = get_sel_first();
        var firstY = points[sel[get_first]].y;
        this.xSelection[xCount].push(sel[get_first]);


        delete sel[get_first];
        for (var k in sel) {
            /// вычисление границ выделения
            if (points[sel[k]].x < this.minXSelection) this.minXSelection = points[sel[k]].x;
            if (points[sel[k]].x > this.maxXSelection) this.maxXSelection = points[sel[k]].x;
            if (points[sel[k]].y < this.minYSelection) this.minYSelection = points[sel[k]].y;
            if (points[sel[k]].y > this.maxYSelection) this.maxYSelection = points[sel[k]].y;
            /// конец вычисление границ выделения
            if (k == 0) continue;

            if (points[sel[k]].y > firstY - self.squareWH / 2 && points[sel[k]].y < firstY + self.squareWH / 2) {
                //this.xSelection[xCount].push(sel[k]);
                this.xSelection[xCount].push(sel[k]);
                delete sel[k];
            }
        }
        //console.log(this.xSelectionRoute);
        this.xSelection[xCount] = this.xSelection[xCount].sort(function (a, b) {
            return points[a].x - points[b].x;
        });
        xCount++;
    }


    for (var s0 in selection) {
        sel.push(selection[s0]);
    }

    var yCount = 0;
    while (get_sel_length() != 0) {
        this.ySelection[yCount] = [];
        get_first = get_sel_first();
        var firstX = points[sel[get_first]].x;
        this.ySelection[yCount].push(sel[get_first]);
        delete sel[get_first];
        for (var k in sel) {
            if (k == 0) continue;
            if (points[sel[k]].x > firstX - self.squareWH / 2 && points[sel[k]].x < firstX + self.squareWH / 2) {
                this.ySelection[yCount].push(sel[k]);
                delete sel[k];
            }
        }
        this.ySelection[yCount] = this.ySelection[yCount].sort(function (a, b) {
            return points[a].y - points[b].y;
        });
        yCount++;
    }
    this.xSelection.sort(function (a, b) {
        if (points[a[0]].y < points[b[0]].y) return -1;
        else if (points[a[0]].y > points[b[0]].y) return 1;
        return 0;
    });


    //log("minX= "+this.minXSelection+"; minY= "+this.minYSelection+"; maxX= "+this.maxXSelection+"; maxY= "+this.maxYSelection);


};

/**
 * Добавляет выбранные места в стек выделенных (selection)
 * @param ids
 * @param noDraw не перерисовывать. Используется если запрос отправляется сразу на сервер. Вроде)
 * @param callback
 */
Map1.prototype.addToSelectionNOT_READY = function (ids, noDraw, callback) {
    if (typeof ids !== 'object') {
        ids = [ids];
    }
    if (this.selectionLimit != -1 && this.countSelection() >= this.selectionLimit) {
        this.container.trigger("selectionLimit", [this.selectionLimit]);
        return;
    }
    for (var i in ids) {
        var id = +ids[i];
        if (typeof this.squares[id]!=="object"){
            continue;
        }
        if ((+this.squares[id].status == 0 && this.mode !== "editor")) {
            continue;
        }
        this.squares[id].selected = true;

        this.squares[id].lighted = true;

    }
    this.selection = [];
    for (var i2 in this.squares) {
        var square = this.squares[i2];
        if (square.selected){
            this.selection.push(square.id);
            if (!noDraw)
                this.drawOneSquare(square.id);
        }

    }
    this.container.trigger('addToSelection', [this.selection]);


    if (typeof callback == "function") {
        callback();
    }
};
Map1.prototype.addToSelection = function (ids, noDraw, callback) {
    if (typeof ids !== 'object') {
        ids = [ids];
    }
    if (this.selectionLimit != -1 && this.countSelection() >= this.selectionLimit) {
        this.container.trigger("selectionLimit", [this.selectionLimit]);
        return;
    }
    for (var i in ids) {
        var id = +ids[i];
        if (typeof this.squares[id]!=="object"){
            continue;
        }
        if ($.inArray(id, this.selection) != -1 || (+this.squares[id].status == 0 && this.mode !== "editor")) {
            continue;
        }
        this.selection.push(id);
        this.squares[id].lighted = true;
        if (!noDraw)
            this.drawOneSquare(id);
    }
    this.container.trigger('addToSelection', [this.selection]);
    this.mapInfo.selection = this.countSelection();
    this.showInfo(this.mapInfo);
    if (typeof callback == "function") {
        callback();
    }
};
/**
 * Массовое добавление в стек выбранных
 * @param arr
 * @param clearSelection
 * @param callback
 */
Map1.prototype.addToSelectionArray = function (arr, clearSelection, callback) {
    var self = this;
    if (typeof arr !== 'object') return;
    if (clearSelection) {
        this.clearSelection(true);
        //self.render();
    }
    this.addToSelection(arr, true, function () {
        if (typeof callback == "function")
            callback();
        else
            self.render();
    });
};

/**
 * Удаляет места из стека выбранных
 * @param ids
 * @param noDraw
 * @param callback
 */
Map1.prototype.removeFromSelection = function (ids, noDraw, callback) {

    if (typeof ids !== 'object') {
        ids = [ids];
    }
    var deletedIds = [];
    for (var i in ids) {
        var id = +ids[i];
        var index = $.inArray(id, this.selection);
        deletedIds.push(id);
        delete this.selection[index];
        if (this.squares[id] !== undefined) {
            delete this.squares[id].lighted;
        }
        if (!noDraw)
            this.drawOneSquare(id);
    }

    var self = this;

    function clearEmpty() {
        for (var i = 0; i < self.selection.length; i++) {
            if (self.selection[i] === undefined) {
                self.selection.splice(i, 1);
                clearEmpty();
            }
        }
    }

    clearEmpty();
    if (typeof callback == "function")
        callback();
    //this.render();
    this.container.trigger('removeFromSelection', [this.selection,ids]);
    this.container.trigger('addToSelection', [this.selection]);
    this.mapInfo.selection = 0;
    this.showInfo(this.mapInfo);
};


/**
 * Очищает стек выбранных билетов
 * @param unlight
 */
Map1.prototype.clearSelection = function (unlight) {
    if (unlight !== undefined)
        for (var k in this.selection){

            if (typeof this.squares[this.selection[k]]==="object") {
                delete this.squares[this.selection[k]].lighted;
            }
        }

    this.selection = [];
    this.container.trigger('clearSelection', [this.selection]);
};
/**
 * Количество выбранных мест
 * @returns {number}
 */
Map1.prototype.countSelection = function () {
    var count = 0;
    for (var k in this.selection) {
        count++;
    }
    return count;
};
/**
 * Возвращает заблокированные пользователем места
 * @returns {Array}
 */
Map1.prototype.getBlocked = function () {
    this.blockedArray = [];
    for (var k in this.squares) {
        if (+this.squares[k].blocked !== 0) {
            this.blockedArray.push(k);
        }
    }
    return this.blockedArray;
};


/**
 * Осуществляет позиционирование схемы в переданную точку (центр)
 * Используется при клике на минимап
 * @param x
 * @param y
 */
Map1.prototype.zoomToPoint = function (x, y) {
    if (x == undefined) {
        x = this.toPointX;
        y = this.toPointY;
    }
    this.toPointX = x;
    this.toPointY = y;
    var dX = (x - this.XCoeff2) * this.scaleCoeff / (this.scaleCoeff2) - this.cWidth / 2;
    var dY = (y - this.YCoeff2) * this.scaleCoeff / (this.scaleCoeff2) - this.cHeight / 2;
    this.XCoeff = -dX;
    this.YCoeff = -dY;
};


/***    Рендер (View)       ***/

Map1.prototype.drawSectorsTimer = function(){
    if (this.mode!=="sector"){
        return;
    }
    var self = this;
    //console.log('drawSectorsTimer');
    self.drawSectors();
    //return;
    setTimeout(function(){
        self.drawSectorsTimer.call(self);
    },1000 / 60);

};
// Если ничего нет - возвращаем обычный таймер
Map1.prototype.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
        };
})();

Map1.prototype.setBgColor = function (bgColor, duration) {
    if (!bgColor) {
        return;
    }
    duration = duration || 50;
    this.container.find('canvas').css({backgroundColor: bgColor});
    /*    this.container.find('canvas').animate({backgroundColor:bgColor},duration);*/
};

/**
 * Рисует прямоугольник с закругленными краями (заполненный цветом)
 * @param x
 * @param y
 * @param w
 * @param h
 * @param tl   /// Размер скругления по углам topLeft/topRight/...
 * @param tr
 * @param br
 * @param bl
 * @param color
 * @param ctx Контекст на котором рисовать, по умолчанию основной канвас
 */
Map1.prototype.canvasRadiusFill = function (x, y, w, h, tl, tr, br, bl, color, ctx) {
    var my_ctx = ctx || this.ctx;
    var r = x + w,
        b = y + h;
    my_ctx.beginPath();
    my_ctx.moveTo(x + tl, y);
    my_ctx.lineTo(r - (tr), y);
    my_ctx.quadraticCurveTo(r, y, r, y + tr);
    my_ctx.lineTo(r, b - br);
    my_ctx.quadraticCurveTo(r, b, r - br, b);
    my_ctx.lineTo(x + bl, b);
    my_ctx.quadraticCurveTo(x, b, x, b - bl);
    my_ctx.lineTo(x, y + tl);
    my_ctx.quadraticCurveTo(x, y, x + tl, y);
    if (my_ctx.fillStyle != color) my_ctx.fillStyle = color;
    my_ctx.fill();
};
Map1.prototype.renderSquareImage = function (square, options) {
    if (typeof square !== "object") {
        return false;
    }
    if (typeof options !== "object") {
        options = {};
    }
    var map = this;
    var mode = options.mode || map.mode;
    var ctx = options.ctx || map.ctx;
    var cache = options.cache; // (options.cache !== false);
    /* --- Если это персональный контекст, то координаты будут относительно нуля, иначе реальные кординаты расположения на canvas---*/
    var personalContext = (options.personalContext !== undefined) ? ((options.personalContext === false) ? false : options.personalContext) : cache;

    /*var scale = options.scale || map.scaleCoeff*2;*/
    var status = square.status || 0;
    var lighted = square.lighted || false;
    var blocked = square.blocked || false;
    var color1 = (square.lighted) ? square.colorSelected : square.color0;
    if (square.lighted_now){
        //color1 = "rgba(255,255,255,0.8";
        color1 = "FF0000";
    }
    var color2 = (square.lighted_now) ? color1 : '#FFFFFF';
    //var textColor = "#FFF";
    var textColor = "#000000";
    //var scale = options.scale || map.round(map.scaleCoeff, 10);
    var scale = options.scale || map.round(map.scaleCoeff, 100);
    //var scale = options.scale || map.round(map.scaleCoeff, 1);
    //console.log(scale);
    var alias = options.alias || "sq_#000000";

    var x, y, w, h, w1, h1, roundR;
    var size, fX, fY;
    h = options.h || map.round(square.h * map.scaleCoeff, 100);//|| map.roundPlus(100 * scale, 0);
    w = options.w || map.round(square.w * map.scaleCoeff, 100);//|| map.roundPlus(100 * scale, 0);
    h1 = options.h || map.round(square.h * scale, 100);//|| map.roundPlus(100 * scale, 0);
    w1 = options.w || map.round(square.w * scale, 100);//|| map.roundPlus(100 * scale, 0);
    x = options.x || map.round(square.x * map.scaleCoeff + map.XCoeff, 100);// + w / 2;
    y = options.y || map.round(square.y * map.scaleCoeff + map.YCoeff, 100);// + h / 2;

    w = h;
    var sqImage;
    var sz = '40.png';

    if (!options.lower16) {
        if (w1 <= 20) {
            sz = '16.png';
        }else if(w1>50){
            sz = '120.png';
        }
        sqImage = (this.pictures.items[square.place_image_url + sz]) ? this.pictures.items[square.place_image_url + sz] : this.sqTamplete;
    }else{
        sqImage = this.sqTamplete15;
    }
    var alias1 = 'sq_'+status+lighted+blocked+color1+color2+w1+sqImage.src;
    if (typeof this.pictures.items[alias1]!=="object"){
        this.pictures.items[alias1] = document.createElement('canvas');
        var newCanvas = this.pictures.items[alias1];
        newCanvas.width = w1;
        newCanvas.height = w1;
        ctx = newCanvas.getContext('2d');
        ctx.drawImage(sqImage,0,0,w1,w1);
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = color1;
        ctx.fillRect(0,0,w1,w1);
        if (!options.lower16) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.drawImage(sqImage, 0, 0, w1, w1);
        }
        //return;
    }
    //debugger;




    map.ctx.drawImage(this.pictures.items[alias1],x,y,w,h);

    if (map.moving || options.lower16){
        return;
    }

    var place = square.place;
    var pCount = place.length;
    var alias2 = 'label_place_only'+place+textColor+w1;

    if (typeof this.pictures.items[alias2]!=="object"){
        this.pictures.items[alias2] = document.createElement('canvas');
        var newCanvas = this.pictures.items[alias2];
        newCanvas.width = w1;
        newCanvas.height = w1;
        var ctx = newCanvas.getContext('2d');
        switch (pCount) {
            case 1:
            default:
                size = Math.round(h1 * 0.50);
                fX = w1 - w1 * 0.64;
                fY = h1 - h1 * 0.48;
                break;
            case 2:
                size = Math.round(h1 * 0.50);
                fX = w1 - w1 * 0.78;
                fY = h1 - h1 * 0.48;
                break;
            case 3:
                size = Math.round(h1 * 0.50);
                fX = w1 - w1 * 0.9;
                fY = h1 - h1 * 0.48;
                break;
        }
        //var font = size + 'px Open Sans, sans-serif';
        var font = size + 'px PT_Sans-Web-Regular, sans-serif';
        //var font = size + 'px "sans-serif"';

        if (ctx.font != font) {
            ctx.font = font;
        }
        if (ctx.fillStyle != textColor) {
            ctx.fillStyle = textColor;
        }
        ctx.fillText(place, fX, fY);
    }
    map.ctx.drawImage(this.pictures.items[alias2],x,y,w,h);
};
Map1.prototype.renderSquareImageOLD = function (square, options) {
    if (typeof square !== "object") {
        return false;
    }
    if (typeof options !== "object") {
        options = {};
    }
    var map = this;
    var mode = options.mode || map.mode;
    var ctx = options.ctx || map.ctx;
    var cache = options.cache; // (options.cache !== false);
    /* --- Если это персональный контекст, то координаты будут относительно нуля, иначе реальные кординаты расположения на canvas---*/
    var personalContext = (options.personalContext !== undefined) ? ((options.personalContext === false) ? false : options.personalContext) : cache;

    /*var scale = options.scale || map.scaleCoeff*2;*/
    var status = square.status || 0;
    var lighted = square.lighted || false;
    var blocked = square.blocked || false;
    var color1 = (square.lighted) ? square.colorSelected : square.color0;
    var color2 = (square.lighted_now) ? color1 : '#FFFFFF';
    var textColor = "#FFF";



    //var scale = options.scale || map.round(map.scaleCoeff, 10);
    var scale = options.scale || map.round(map.scaleCoeff, 1);
    //console.log(scale);
    var alias = options.alias || "sq_#000";

    var x, y, w, h, roundR;
    var size, fX, fY;
    h = options.h || map.round(square.h * map.scaleCoeff, 100);//|| map.roundPlus(100 * scale, 0);
    w = options.w || map.round(square.w * map.scaleCoeff, 100);//|| map.roundPlus(100 * scale, 0);
    x = options.x || map.round(square.x * map.scaleCoeff + map.XCoeff, 100) + w / 2;
    y = options.y || map.round(square.y * map.scaleCoeff + map.YCoeff, 100) + h / 2;
    roundR = w / 2;//|| map.roundPlus(100 * scale, 0);





    if (personalContext) { /// Заготовка
        x = options.x || w / 2;
        y = options.y || h / 2;
        /*if (mode=="casher" || mode=="iFrame" || mode=="client_screen"){

        }else{
            x = 0;
            y = 0;
        }*/

        roundR = w / 2;//|| map.rou ndPlus(100 * scale, 0);
        this.pictures.items[alias] = document.createElement('canvas');
        var newCanvas = this.pictures.items[alias];
        newCanvas.width = w;
        newCanvas.height = h;
        ctx = newCanvas.getContext('2d');
    } else {
/*
        h = options.h || map.round(square.h * map.scaleCoeff, 100);//|| map.roundPlus(100 * scale, 0);
        w = options.w || map.round(square.w * map.scaleCoeff, 100);//|| map.roundPlus(100 * scale, 0);
        x = options.x || map.round(square.x * map.scaleCoeff + map.XCoeff, 100) + w / 2;
        y = options.y || map.round(square.y * map.scaleCoeff + map.YCoeff, 100) + h / 2;*/
        roundR = w / 2;//|| map.roundPlus(100 * scale, 0);
        var dW,dH;
        if (w>h){
            dW = 1;
            dH = h/w;
        }else{
            dW = w/h;
            dH = 1;
        }
        //ctx.save();
        //translate context
        //ctx.translate(this.cWidth*dW, this.cHeight*dH);
        // scale context horizontally
        //ctx.scale(dW, dH);
        // save state
      /*  ctx.save();
        // translate context
        debugger;
        //ctx.translate(this.cWidth*dW, this.cHeight*dH);
        ctx.translate(1000,1000);*/
        // scale context horizontally
        //ctx.scale(2, 1);

    }

    switch (mode) {
        case "casher":
        case "admin":
        case "client_screen":
            if (lighted) {
                color1 = "#000";
                color2 = "#F00";
                textColor = "#FFF";
            }
            var alias1 = 'sq_'+status+lighted+blocked+color1+color2+scale;
            if (typeof this.pictures.items[alias1]=="object" && !personalContext/* && this.moving*/){
                ctx.drawImage(this.pictures.items[alias1], x - w / 2, y -h / 2, w, h);
                //return;
            }else if (options.cacheMode=="square" || !options.cacheMode){
                if (ctx.fillStyle != color1) ctx.fillStyle = color1;


                ctx.beginPath();
                ctx.arc(x, y, roundR, 0, 360, false);
                ctx.fill();
                ctx.closePath();
                if (status !== 0) {
                    if (ctx.fillStyle != color2) ctx.fillStyle = color2;
                    ctx.beginPath();
                    //ctx.arc(x + w / 15, y + h / 15, roundR - w / 8, 0, 360, false);
                    ctx.arc(x + w / 100, y + h / 100, roundR - w / 8, 0, 360, false);
                    ctx.fill();
                    ctx.closePath();
                }
                ctx.restore();
                if (!personalContext){
                    // to Preload
                    this.pictures.toPreload({
                        cacheMode: "square",
                        square:square,
                        options:{
                            mode:mode,
                            scale: scale,
                            alias: alias1
                        }
                    });
                }
            }
            break;
            if (status !== 0){
                if (!lighted) {
                    textColor = "#000";
                }
            }
            var place = square.place;
            var pCount = place.length;

            switch (pCount) {
                case 1:
                default:
                    size = Math.round(w * 0.75);
                    fX = x - w * 0.25;
                    fY = y + h * 0.28;
                    break;
                case 2:
                    size = Math.round(w * 0.65);
                    fX = x - w * 0.38;
                    fY = y + h * 0.24;
                    break;
                case 3:
                    size = Math.round(w * 0.4);
                    fX = x - w * 0.35;
                    fY = y + h * 0.3;
                    break;
            }
            var alias2 = 'label_place_only'+place+textColor+scale;

            if (typeof this.pictures.items[alias2]=="object" && !personalContext){
                ctx.drawImage(this.pictures.items[alias2],  x - w / 2, y -h / 2, w, h);
            }else if (options.cacheMode=="label_place_only" || !options.cacheMode){

                var font = size + 'px "Open Sans"';
                if (ctx.font != font) {
                    ctx.font = font;
                }
                if (ctx.fillStyle != textColor) {
                    ctx.fillStyle = textColor;
                }
                ctx.fillText(place, fX, fY);
                if (!personalContext){
                    // to Preload
                    this.pictures.toPreload({
                        cacheMode: "label_place_only",
                        square:square,
                        options:{
                            mode:mode,
                            scale: scale,
                            alias: alias2
                        }
                    });
                }
            }
            break;
        case "iFrame":
            if (lighted) {
                color1 = "#000";
                color2 = "#F00";
                textColor = "#FFF";
            }
            if (square.lighted_now) {
                color1 = "#F00";
            }
            var alias_iFrame_sq = 'sq_iFrame'+status+lighted+blocked+color1+color2+scale;
            if (typeof this.pictures.items[alias_iFrame_sq]=="object" && !personalContext/* && this.moving*/ && false){
                ctx.drawImage(this.pictures.items[alias_iFrame_sq], x - w / 2, y -h / 2, w, h);
                //return;
            }else if (options.cacheMode=="square" || !options.cacheMode){
                if (ctx.fillStyle != color1) ctx.fillStyle = color1;
                roundR = h / 2;
                ctx.beginPath();
                ctx.arc(x, y, roundR, 0, 360, false);
                //ctx.fillRect(x,y,w,h);
                ctx.fill();
                ctx.closePath();
                //ctx.restore();
                /*if (status !== 0 && false) {
                    if (ctx.fillStyle != color2) ctx.fillStyle = color2;
                    ctx.beginPath();
                    //ctx.arc(x + w / 15, y + h / 15, roundR - w / 8, 0, 360, false);
                    ctx.arc(x + w / 100, y + h / 100, roundR - w / 8, 0, 360, false);
                    ctx.fill();
                    ctx.closePath();
                }*/
                if (!personalContext){
                    // to Preload
                    this.pictures.toPreload({
                        cacheMode: "square",
                        square:square,
                        options:{
                            mode:mode,
                            scale: scale,
                            alias: alias_iFrame_sq
                        }
                    });
                }
            }

            if (status !== 0){
                if (!lighted) {
                    textColor = square.textColor || "#000";
                }
            }
            var place = square.place;
            var pCount = place.length;

            switch (pCount) {
                case 1:
                default:
                    size = this.round(h * 0.6,100);
                    fX = x - h * 0.18;
                    fY = y + h * 0.2;
                    break;
                case 2:
                    size = this.round(h * 0.6,100);
                    fX = x - h * 0.31;
                    fY = y + h * 0.2;
                    break;
                case 3:
                    size = this.round(h * 0.6,100);
                    fX = x - h * 0.40;
                    fY = y + h * 0.2;
                    break;
            }
            var alias_iFrame_po = 'label_place_only'+place+textColor+scale;

            if (typeof this.pictures.items[alias_iFrame_po]=="object" && !personalContext && false){
                ctx.drawImage(this.pictures.items[alias_iFrame_po],  x - w / 2, y -h / 2, w, h);
            }else if (options.cacheMode=="label_place_only" || !options.cacheMode){

                var font = size + 'px "Open Sans"';
                if (ctx.font != font) {
                    ctx.font = font;
                }
                if (ctx.fillStyle != textColor) {
                    ctx.fillStyle = textColor;
                }
                    ctx.fillText(place, fX, fY);
                if (!personalContext){
                    // to Preload
                    this.pictures.toPreload({
                        cacheMode: "label_place_only",
                        square:square,
                        options:{
                            mode:mode,
                            scale: scale,
                            alias: alias_iFrame_po
                        }
                    });
                }
            }
            break;

        default :
            if (lighted) {
                color1 = "#000";
                color2 = "#F00";
                textColor = "#FFF";
            }
            var alias3 = 'sq_default'+status+lighted+blocked+color1+color2+scale;
            if (typeof this.pictures.items[alias3]=="object" && !personalContext/* && this.moving*/){
                ctx.drawImage(this.pictures.items[alias3], x - w / 2, y - h / 2, w, h);
                //return;
            }else if (options.cacheMode=="square" || !options.cacheMode){
                if (ctx.fillStyle != color1) ctx.fillStyle = color1;
                ctx.fillRect(x-w/2,y-h/2,w,h);
                if (!personalContext){
                    // to Preload
                    this.pictures.toPreload({
                        cacheMode: "square",
                        square:square,
                        options:{
                            mode:mode,
                            scale: scale,
                            alias: alias3
                        }
                    });
                }
            }
            if (this.moving){return;}
            if (status !== 0){
                if (!lighted) {
                    textColor = "#000";
                }
            }
            var place = square.place;
            var line = square.line;
            var pCount = place.length;

            switch (pCount) {
                case 1:
                default:
                    size = Math.round(w * 0.5);
                    fX = x - w * 0.25;
                    fY = y + h * 0.28;
                    break;
                case 2:
                    size = Math.round(w * 0.5);
                    fX = x - w * 0.38;
                    fY = y + h * 0.24;
                    break;
                case 3:
                    size = Math.round(w * 0.5);
                    fX = x - w * 0.35;
                    fY = y + h * 0.3;
                    break;
            }

            var alias4 = 'label_place'+place+textColor+scale;

            if (typeof this.pictures.items[alias4]=="object" && !personalContext){
                ctx.drawImage(this.pictures.items[alias4],  x - w / 2, y -h / 2, w, h);
            }else if (options.cacheMode=="label_place" || !options.cacheMode){

                var font =size + 'px "Open Sans"';
                if (ctx.font != font) {
                    ctx.font = font;
                }
                if (ctx.fillStyle != textColor) {
                    ctx.fillStyle = textColor;
                }
                ctx.fillText(place, x - w/2+w/100,y+size-h/10);
                if (!personalContext){
                    // to Preload
                    this.pictures.toPreload({
                        cacheMode: "label_place",
                        square:square,
                        options:{
                            mode:mode,
                            scale: scale,
                            alias: alias4
                        }
                    });
                }
            }

            var alias5 = 'label_line'+line+textColor+scale;

            if (typeof this.pictures.items[alias5]=="object" && !personalContext){
                ctx.drawImage(this.pictures.items[alias5],  x - w / 2, y -h / 2, w, h);
            }else if (options.cacheMode=="label_line" || !options.cacheMode){

                var font =size + 'px "Open Sans"';
                if (ctx.font != font) {
                    ctx.font = font;
                }
                if (ctx.fillStyle != textColor) {
                    ctx.fillStyle = textColor;
                }
                ctx.fillText(line, x - w/2+w/100, y-h/10);
                if (!personalContext){
                    // to Preload
                    this.pictures.toPreload({
                        cacheMode: "label_line",
                        square:square,
                        options:{
                            mode:mode,
                            scale: scale,
                            alias: alias5
                        }
                    });
                }
            }
            break;
    }
    if (!personalContext){
        ctx.restore();
    }
};
Map1.prototype.drawOneSquare = function (key, options) {
    if (typeof callback !== "function") callback = function () {
    };
    this.renderSquareImage(this.squares[key], options);
};
Map1.prototype.animate = function (opts, callback) {
    var start = new Date; // сохранить время начала
    var timer = setInterval(function () {
        if (opts.elem.stop) {
            clearInterval(timer);
            callback(opts.elem);
            return;
        }

        // вычислить сколько времени прошло
        var progress = (new Date - start) / opts.duration;
        if (progress > 1) progress = 1;
        // отрисовать анимацию
        opts.step(progress);
        if (progress == 1) {
            clearInterval(timer);
            callback(opts.elem);
        } // конец :)
    }, opts.delay || 10); // по умолчанию кадр каждые 10мс

};

Map1.prototype.highlight = function (params, func, callback) {
    if (typeof params !== "object") {
        params = {};
    }
    if (typeof callback !== "function") {
        callback = function () {
        };
    }
    var self = this;
    var from = params.from || [255, 0, 0, 1];
    var to = params.to || [255, 255, 255, 1];
    if (from.length == 3) {
        from[3] = 1;
    }
    if (to.length == 3) {
        to[3] = 0;
    }
    if (typeof from !== "object") {
        if (from.indexOf("#") !== -1) {
            //var r =
        } else if (from.indexOf("rgb(") !== -1) {

        }
    }
    var delay = params.delay || 10;
    var duration = (params.duration !== undefined) ? params.duration : 300;
    var sleep = params.sleep;
    var delta = params.delta || 1;
    var stop = params.stop;
    var elem = params.elem || {};
    /*from = [0,0,0,1];
    to = [0,0,0,0.2];
    duration = 2500;*/

    var animate = function () {
        self.animate({
            delay: delay,
            duration: duration,
            /*delta: linear,*/
            delta: delta,
            elem: elem,
            step: function (delta) {
                if (typeof func == "function") {
                    var rgba = 'rgba(' +
                        Math.max(Math.min(parseInt((delta * (+to[0] - +from[0])) + +from[0], 10), 255), 0) + ',' +
                        Math.max(Math.min(parseInt((delta * (+to[1] - +from[1])) + +from[1], 10), 255), 0) + ',' +
                        Math.max(Math.min(parseInt((delta * (+to[2] - +from[2])) + +from[2], 10), 255), 0) + ',' +
                        Math.max(Math.min(self.round((delta * (+to[3] - +from[3])) + +from[3], 10,100), 255), 0) + ')';
                    //console.log(rgba);
                    func(elem, rgba);
                }


            }
        }, callback)
    };
    var timer;
    if (sleep && !timer) {
        timer = setTimeout(function () {
            animate();
        }, sleep)
    } else {
        animate();
    }


};

Map1.prototype.drawOneSectorOLD = function (sector, params) {
    if (typeof sector !== "object") {
        return;
    }
    if (typeof params !== "object") {
        params = {};
    }
    var ctx = params.ctx || this.ctx;
    var drawNow = params.drawNow || false;
    if (params.fillStyle) {
        if (ctx.fillStyle !== params.fillStyle) ctx.fillStyle = params.fillStyle;
    }
    if (params.strokeStyle) {
        if (ctx.strokeStyle !== params.strokeStyle) ctx.strokeStyle = params.strokeStyle;
    }
    if (params.lineWidth) {
        if (ctx.lineWidth !== params.lineWidth) ctx.lineWidth = params.lineWidth;
    }
    if (params.lineJoin) {
        if (ctx.lineJoin !== params.lineJoin) ctx.lineJoin = params.lineJoin;
    }
    if (params.shadowOffsetX) {
        if (ctx.shadowOffsetX !== params.shadowOffsetX) ctx.shadowOffsetX = params.shadowOffsetX;
    }
    if (params.shadowOffsetY) {
        if (ctx.shadowOffsetY !== params.shadowOffsetY) ctx.shadowOffsetY = params.shadowOffsetY;
    }
    if (params.shadowBlur) {
        if (ctx.shadowBlur !== params.shadowBlur) ctx.shadowBlur = params.shadowBlur;
    }
    if (params.shadowColor) {
        if (ctx.shadowColor !== params.shadowColor) ctx.shadowColor = params.shadowColor;
    }
    if (drawNow) {
        ctx.beginPath();
    }

    for (var i in sector) {
        var one_group = sector[i];
        var skip = 0;
        for (var i2 in one_group) {
            if (one_group.length==4){
                //debugger;
            }


            //debugger;
            if (skip>0){
                skip--;
                ctx.moveTo(one_group[i2].x * this.scaleCoeff + this.XCoeff, one_group[i2].y * this.scaleCoeff + this.YCoeff);
                continue;
            }
            var prevPoint =one_group[+i2-1];
            var currPoint =one_group[+i2];
            var nextPoint =one_group[+i2+1];

            if (+i2 === 0 ) {
                skip = 1;
                //ctx.moveTo(one_group[0].x * this.scaleCoeff + this.XCoeff, one_group[0].y * this.scaleCoeff + this.YCoeff);
                continue;
            }
            /*ctx.lineTo(currPoint.x * this.scaleCoeff + this.XCoeff, currPoint.y * this.scaleCoeff + this.YCoeff);
            if (i2 == one_group.length-1){
                ctx.lineTo(one_group[0].x * this.scaleCoeff + this.XCoeff, one_group[0].y * this.scaleCoeff + this.YCoeff);
                ctx.lineTo(one_group[1].x * this.scaleCoeff + this.XCoeff, one_group[1].y * this.scaleCoeff + this.YCoeff);
            }

            continue;*/


            if (!nextPoint){
                nextPoint = one_group[0];

                var nextNextPoint = one_group[1];
                if (!nextNextPoint){
                    break;
                }
                if (!currPoint.need_round){
                    ctx.lineTo(currPoint.x * this.scaleCoeff + this.XCoeff, currPoint.y * this.scaleCoeff + this.YCoeff);
                    ctx.lineTo(nextPoint.x * this.scaleCoeff + this.XCoeff, nextPoint.y * this.scaleCoeff + this.YCoeff);
                    ctx.lineTo(nextNextPoint.x * this.scaleCoeff + this.XCoeff, nextNextPoint.y * this.scaleCoeff + this.YCoeff);
                    break;

                    //ctx.closePath();
                }else{
                    var x1 = nextPoint.x *  this.scaleCoeff + this.XCoeff;
                    var x2 = nextNextPoint.x *  this.scaleCoeff + this.XCoeff;
                    var y1 = nextPoint.y *  this.scaleCoeff + this.YCoeff;
                    var y2 = nextNextPoint.y *  this.scaleCoeff + this.YCoeff;
                    ctx.quadraticCurveTo(x1, y1, x2, y2);
                }

            }
            if (!nextPoint.need_round) {
                if (!currPoint.need_round){
                    ctx.lineTo(currPoint.x * this.scaleCoeff + this.XCoeff, currPoint.y * this.scaleCoeff + this.YCoeff);
                }else{
                    var x1 = currPoint.x *  this.scaleCoeff + this.XCoeff;
                    var x2 = nextPoint.x *  this.scaleCoeff + this.XCoeff;
                    var y1 = currPoint.y *  this.scaleCoeff + this.YCoeff;
                    var y2 = nextPoint.y *  this.scaleCoeff + this.YCoeff;
                    ctx.quadraticCurveTo(x1, y1, x2, y2);
                }
            } else {
                continue;
            }
        }

        //ctx.closePath();
        /*if (one_group.length) {
            ctx.lineTo(one_group[0].x * this.scaleCoeff + this.XCoeff, one_group[0].y * this.scaleCoeff + this.YCoeff);
            if (typeof one_group[1] === "object") {
                ctx.lineTo(one_group[1].x * this.scaleCoeff + this.XCoeff, one_group[1].y * this.scaleCoeff + this.YCoeff);
            }
        }*/

    }

    /*for (var i in sector) {
        var one_group = sector[i];
        for (var i2 in one_group) {
            if (+i2 === 0) {
                ctx.moveTo(one_group[0].x * this.scaleCoeff + this.XCoeff, one_group[0].y * this.scaleCoeff + this.YCoeff);
                continue;
            }
            ctx.lineTo(one_group[i2].x * this.scaleCoeff + this.XCoeff, one_group[i2].y * this.scaleCoeff + this.YCoeff);
        }
        if (one_group.length) {
            ctx.lineTo(one_group[0].x * this.scaleCoeff + this.XCoeff, one_group[0].y * this.scaleCoeff + this.YCoeff);
            if (typeof one_group[1] === "object") {
                ctx.lineTo(one_group[1].x * this.scaleCoeff + this.XCoeff, one_group[1].y * this.scaleCoeff + this.YCoeff);
            }
        }

    }*/
    if (drawNow) {
        ctx.fill();
       /* ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.shadowBlur = 0;
        ctx.stroke();*/
    }
    return one_group;
};
Map1.prototype.drawOneSector = function (sector, params) {
    if (typeof sector !== "object") {
        return;
    }
    if (typeof params !== "object") {
        params = {};
    }
    var ctx = params.ctx || this.ctx;
    var drawNow = params.drawNow || false;

    if (params.fillStyle) {
        if (ctx.fillStyle !== params.fillStyle) ctx.fillStyle = params.fillStyle;

    }
    if (params.strokeStyle) {
        if (ctx.strokeStyle !== params.strokeStyle) ctx.strokeStyle = params.strokeStyle;
    }
    if (params.lineWidth) {
        if (ctx.lineWidth !== params.lineWidth) ctx.lineWidth = params.lineWidth;
    }
    if (params.lineJoin) {
        if (ctx.lineJoin !== params.lineJoin) ctx.lineJoin = params.lineJoin;
    }
    if (params.shadowOffsetX) {
        if (ctx.shadowOffsetX !== params.shadowOffsetX) ctx.shadowOffsetX = params.shadowOffsetX;
    }
    if (params.shadowOffsetY) {
        if (ctx.shadowOffsetY !== params.shadowOffsetY) ctx.shadowOffsetY = params.shadowOffsetY;
    }
    if (params.shadowBlur) {
        if (ctx.shadowBlur !== params.shadowBlur) ctx.shadowBlur = params.shadowBlur;
    }
    if (params.shadowColor) {
        if (ctx.shadowColor !== params.shadowColor) ctx.shadowColor = params.shadowColor;
    }
    if (drawNow) {
        ctx.beginPath();
    }
    for (var i in sector) {
        var one_group = sector[i];
        for (var i2 in one_group) {
            if (+i2 === 0) {
                ctx.moveTo(one_group[0].x * this.scaleCoeff + this.XCoeff, one_group[0].y * this.scaleCoeff + this.YCoeff);
                continue;
            }
            ctx.lineTo(one_group[i2].x * this.scaleCoeff + this.XCoeff, one_group[i2].y * this.scaleCoeff + this.YCoeff);
        }

        if (one_group.length) {
            ctx.lineTo(one_group[0].x * this.scaleCoeff + this.XCoeff, one_group[0].y * this.scaleCoeff + this.YCoeff);
            if (typeof one_group[1] === "object") {
                ctx.lineTo(one_group[1].x * this.scaleCoeff + this.XCoeff, one_group[1].y * this.scaleCoeff + this.YCoeff);
            }
        }
    }
    if (drawNow) {
        ctx.fill();
       /* ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        ctx.stroke();*/
    }
    return one_group;
};
Map1.prototype.drawOneSectorOLD = function (sector, params) {
    if (typeof sector !== "object") {
        return;
    }
    if (typeof params !== "object") {
        params = {};
    }
    var ctx = params.ctx || this.ctx;
    var drawNow = params.drawNow || false;
    if (params.fillStyle) {
        if (ctx.fillStyle !== params.fillStyle) ctx.fillStyle = params.fillStyle;
    }
    if (params.strokeStyle) {
        if (ctx.strokeStyle !== params.strokeStyle) ctx.strokeStyle = params.strokeStyle;
    }
    if (params.lineWidth) {
        if (ctx.lineWidth !== params.lineWidth) ctx.lineWidth = params.lineWidth;
    }
    if (params.lineJoin) {
        if (ctx.lineJoin !== params.lineJoin) ctx.lineJoin = params.lineJoin;
    }
    if (params.shadowOffsetX) {
        if (ctx.shadowOffsetX !== params.shadowOffsetX) ctx.shadowOffsetX = params.shadowOffsetX;
    }
    if (params.shadowOffsetY) {
        if (ctx.shadowOffsetY !== params.shadowOffsetY) ctx.shadowOffsetY = params.shadowOffsetY;
    }
    if (params.shadowBlur) {
        if (ctx.shadowBlur !== params.shadowBlur) ctx.shadowBlur = params.shadowBlur;
    }
    if (params.shadowColor) {
        if (ctx.shadowColor !== params.shadowColor) ctx.shadowColor = params.shadowColor;
    }
    if (drawNow) {
        ctx.beginPath();
    }
    for (var i in sector) {
        var one_group = sector[i];
        for (var i2 in one_group) {
            if (+i2 === 0) {
                ctx.moveTo(one_group[0].x * this.scaleCoeff + this.XCoeff, one_group[0].y * this.scaleCoeff + this.YCoeff);
                continue;
            }
            ctx.lineTo(one_group[i2].x * this.scaleCoeff + this.XCoeff, one_group[i2].y * this.scaleCoeff + this.YCoeff);
        }

        if (one_group.length) {
            ctx.lineTo(one_group[0].x * this.scaleCoeff + this.XCoeff, one_group[0].y * this.scaleCoeff + this.YCoeff);
            if (typeof one_group[1] === "object") {
                ctx.lineTo(one_group[1].x * this.scaleCoeff + this.XCoeff, one_group[1].y * this.scaleCoeff + this.YCoeff);
            }
        }
    }
    if (drawNow) {
        ctx.fill();
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        ctx.stroke();
    }
    return one_group;
};
Map1.prototype.drawSectors = function () {

    /*if (typeof params !== "object") {
        params = {};
    }*/
    var self = this;
    var cw = self.cWidth;
    var ch = self.cHeight;

    var sectors = self.sectors;
    if (!sectors.length) {
        return;
    }
    self.ctx.clearRect(0, 0, cw, ch);
    this.drawObjects();
    for (var i in sectors) {
        if (sectors[i].light>0 && sectors[i].opaciti<2){
            sectors[i].opaciti += 0.1;
        }else if (sectors[i].light<0 && sectors[i].opaciti>0){
            sectors[i].opaciti -= 0.15;
        }else if (sectors[i].light==0){
            sectors[i].opaciti = 1;
        }
        var params2 = {
            drawNow : true,
            fillStyle : 'rgba('+sectors[i].color.join(',') +','+sectors[i].opaciti+')'
        };


        var sub_groups = sectors[i].sub_groups;
        if (!sub_groups.length /*|| sectors[i].free_places==0*/) {
            continue;
        }
        var one_group = self.drawOneSector(sub_groups,params2);
    }
    //webkitRequestAnimationFrame(self.drawSectors,self);
    //this.requestAnimFrame(self.drawSectors,self);


  /*
    var fillStyle = params.fillStyle || this.zonesFill;
    var strokeStyle = params.strokeStyle || this.zonesStroke;
    *//*var strokeStyle = params.strokeStyle || "#0c700e";*//*
    var lineWidth = params.lineWidth || 1;
    var lineJoin = params.lineJoin || 'round';
    var shadowOffsetX = params.shadowOffsetX || 1;
    var shadowOffsetY = params.shadowOffsetY || 1;
    var shadowBlur = params.shadowBlur || 0;
    //var shadowColor = params.shadowColor || 'black';
    var shadowColor = params.shadowColor || this.zonesShadow;
    var disabledColor = params.zonesDisabled || this.zonesDisabled;
    var ctx = params.ctx || this.ctx;
    if (ctx.fillStyle !== params.fillStyle) ctx.fillStyle = fillStyle;
    if (ctx.strokeStyle !== params.strokeStyle) ctx.strokeStyle = strokeStyle;
    if (ctx.lineWidth !== params.lineWidth) ctx.lineWidth = lineWidth;
    if (ctx.lineJoin !== params.lineJoin) ctx.lineJoin = lineJoin;
    if (ctx.shadowOffsetX !== params.shadowOffsetX) ctx.shadowOffsetX = shadowOffsetX;
    if (ctx.shadowOffsetY !== params.shadowOffsetY) ctx.shadowOffsetY = shadowOffsetY;
    if (ctx.shadowBlur !== params.shadowBlur) ctx.shadowBlur = shadowBlur;
    if (ctx.shadowColor !== params.shadowColor) ctx.shadowColor = shadowColor;*/


   /* ctx.stroke();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.fill();

    for (var i2 in sectors) {
        var params2 = {};
        if (sectors[i2].free_places == 0){
            params2.fillStyle = disabledColor;
            params2.strokeStyle = disabledColor;
            params2.shadowColor = this.zonesDisabledShadow;
            params2.shadowOffsetX = 3;
            params2.shadowOffsetY = 3;
            params2.drawNow = true;
        }

        var sub_groups = sectors[i2].sub_groups;
        if (!sub_groups.length || sectors[i2].free_places>0) {
            continue;
        }
        //debugger;
        var one_group = this.drawOneSector(sub_groups,params2);
    }*/

};
Map1.prototype.drawSectorsOLD = function (params) {
    if (typeof params !== "object") {
        params = {};
    }
    var cw = this.cWidth;
    var ch = this.cHeight;
    this.ctx.clearRect(0, 0, cw, ch);
    var sectors = this.sectors;
    if (!sectors.length) {
        return;
    }
    /*
    *  self.zonesBgColor
     self.zonesFill
     self.zonesStroke
     self.zonesHover
     self.zonesSelected
     zonesShadow

     break;*/
    var fillStyle = params.fillStyle || this.zonesFill;
    var strokeStyle = params.strokeStyle || this.zonesStroke;
    /*var strokeStyle = params.strokeStyle || "#0c700e";*/
    var lineWidth = params.lineWidth || 1;
    var lineJoin = params.lineJoin || 'round';
    var shadowOffsetX = params.shadowOffsetX || 1;
    var shadowOffsetY = params.shadowOffsetY || 1;
    var shadowBlur = params.shadowBlur || 0;
    //var shadowColor = params.shadowColor || 'black';
    var shadowColor = params.shadowColor || this.zonesShadow;
    var disabledColor = params.zonesDisabled || this.zonesDisabled;
    var ctx = params.ctx || this.ctx;
    if (ctx.fillStyle !== params.fillStyle) ctx.fillStyle = fillStyle;
    if (ctx.strokeStyle !== params.strokeStyle) ctx.strokeStyle = strokeStyle;
    if (ctx.lineWidth !== params.lineWidth) ctx.lineWidth = lineWidth;
    if (ctx.lineJoin !== params.lineJoin) ctx.lineJoin = lineJoin;
    if (ctx.shadowOffsetX !== params.shadowOffsetX) ctx.shadowOffsetX = shadowOffsetX;
    if (ctx.shadowOffsetY !== params.shadowOffsetY) ctx.shadowOffsetY = shadowOffsetY;
    if (ctx.shadowBlur !== params.shadowBlur) ctx.shadowBlur = shadowBlur;
    if (ctx.shadowColor !== params.shadowColor) ctx.shadowColor = shadowColor;

    for (var i in sectors) {
        var params2 = {};
       /* if (+sectors[i].free_places==0){
           fillStyle = "#48433a";
           strokeStyle = "#48433a";
        }else{
           fillStyle = "#9c8554";
           strokeStyle = "#9c8554";
        }*/

        var sub_groups = sectors[i].sub_groups;
        if (!sub_groups.length || sectors[i].free_places==0) {
            continue;
        }
        var one_group = this.drawOneSector(sub_groups,params2);
    }
    ctx.stroke();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.fill();

    for (var i2 in sectors) {
        var params2 = {};
        if (sectors[i2].free_places == 0){
            params2.fillStyle = disabledColor;
            params2.strokeStyle = disabledColor;
            params2.shadowColor = this.zonesDisabledShadow;
            params2.shadowOffsetX = 3;
            params2.shadowOffsetY = 3;
            params2.drawNow = true;
        }

        var sub_groups = sectors[i2].sub_groups;
        if (!sub_groups.length || sectors[i2].free_places>0) {
            continue;
        }
        //debugger;
        var one_group = this.drawOneSector(sub_groups,params2);
    }

};
/**
 * Функция обертка для drawOneSquare
 * @param callback
 * @param alternativeCtx  Можно рисовать на другом canvas
 * @returns {*}
 */
Map1.prototype.drawSquares = function (callback) {
    if (typeof callback !== "function") callback = function () {
    };
    /*var t1 = new Date().getTime();*/
    var options = {};
    if (this.minW * this.scaleCoeff < 10){
        options.lower16 = true;
    }

    for (var key in this.squares) {
        this.drawOneSquare(key, options);
    }
   /* var t2 = new Date().getTime();
    console.log('Изображения отрисовались за: ', t2 - t1);*/
    return callback();
};
/**
 * Отрисовывает минимап (навигацию)
 */
Map1.prototype.drawZoom = function () {
    if (this.moving) return;
    for (var key in this.squares) {
        var x = (this.squares[key].x - this.minX) * this.scaleCoeff2 + this.XCoeff2;
        var y = (this.squares[key].y - this.minY) * this.scaleCoeff2 + this.YCoeff2;
        var w = this.squares[key].w;
        var h = this.squares[key].h;
        this.ctx2.fillStyle = this.squares[key].color0;
        this.ctx2.fillRect(x, y, w * this.scaleCoeff2, h * this.scaleCoeff2);
    }
};
/**
 * Отрисовывает объект на основе строки (формат SVG)
 * Пример: "M10 10L10 20L20 20...."
 * @param object
 * @param callback
 */
Map1.prototype.drawSVG = function (object, callback, cx, cy) {
    cx = cx || 0;
    cy = cy || 0;
    var context = this.ctx;
    var context2 = this.ctx2;
    var string = object.value;
    context.beginPath();
    context2.beginPath();
    var self = this;
    (function execCommand() {
        if (!string.match(/[A-Z]/)) {
            context.strokeStyle = object.colorSelected;
            context.fillStyle = object.color2;
            context.fill();
            context.stroke();
            if (!self.moving) {
                context2.strokeStyle = object.color1;
                context2.fillStyle = object.color2;
                context2.fill();
                context2.stroke();
            }
            if (typeof callback == "function")
                callback();

            return;
        }
        var letter = string.match(/[A-Z]/)[0];
        string = string.replace(/\s*[A-Z]/, "");
        //log(letter[0]);
        var coor = string.match(/[^A-Z]+/)[0];
        string = string.replace(/[^A-Z]+/, "");
        var coors = coor.split(" ");
        var coors2 = coor.split(" ");

        for (var k in coors) {
            if (k % 2 == 0) {
                coors[k] = (+coors[k] + cx) * self.scaleCoeff + self.XCoeff;
            } else {
                coors[k] = (+coors[k] + cy) * self.scaleCoeff + self.YCoeff;
            }
        }
        for (var k2 in coors2) {
            //coors[k] = +coors[k]*this.scaleCoeff;
            if (k2 % 2 == 0) {
                coors2[k2] = +coors2[k2] * self.scaleCoeff2 + self.XCoeff2;
            } else {
                coors2[k2] = +coors2[k2] * self.scaleCoeff2 + self.YCoeff2;
            }
        }
        switch (letter) {
            case "M":
                context.moveTo(coors[0], coors[1]);
                context2.moveTo(coors2[0], coors2[1]);
                break;
            case "L":
                context.lineTo(coors[0], coors[1]);
                context2.lineTo(coors2[0], coors2[1]);
                break;
            case "Q":
                context.quadraticCurveTo(coors[0], coors[1], coors[2], coors[3]);
                context2.quadraticCurveTo(coors2[0], coors2[1], coors2[2], coors2[3]);
                break;
            case "C":
                context.bezierCurveTo(coors[0], coors[1], coors[2], coors[3], coors[4], coors[5]);
                context2.bezierCurveTo(coors2[0], coors2[1], coors2[2], coors2[3], coors2[4], coors2[5]);
                break;
            default :
                break;
        }
        execCommand();
    })();

};


Map1.prototype.drawObjects = function (callback) {
    var oldValues = {};
    oldValues.font = "normal 10pt 'Open Sans'";
    oldValues.fillStyle = "#000000";
    oldValues.strokeStyle = "#000000";
    if (document.all && !document.addEventListener) {
        if (typeof callback == 'function') {
            callback();
        }
        return;
    }
    var items = this.renderList.items;
    var mode = this.mode.toLowerCase();
    for (var k in items) {
        //var obj = items[k].object;
        var obj = items[k];
        switch (obj.type) {
            case 1: // BACKGROUND
            case "BACKGROUND": // BACKGROUND
                if (obj.loaded && obj.visibility['visible_' + mode]) {
                    var x = +obj.x * this.scaleCoeff + this.XCoeff;
                    var y = +obj.y * this.scaleCoeff + this.YCoeff;
                    if (!obj.rotation) {
                        this.ctx.drawImage(obj.value, x, y, obj.value.width * this.scaleCoeff * obj.scaleCoeff, obj.value.height * this.scaleCoeff * obj.scaleCoeff);
                    } else {
                        this.ctx.save();
                        //this.ctx.translate(x+obj.value.width*this.scaleCoeff*obj.scaleCoeff/2,y+obj.value.height*this.scaleCoeff*obj.scaleCoeff/2);
                        this.ctx.translate(x + obj.value.width * this.scaleCoeff * obj.scaleCoeff / 2, y + obj.value.height * this.scaleCoeff * obj.scaleCoeff / 2);
                        this.ctx.rotate(obj.rotation);
                        this.ctx.drawImage(obj.value, -obj.value.width * this.scaleCoeff * obj.scaleCoeff / 2, -obj.value.height * this.scaleCoeff * obj.scaleCoeff / 2, obj.value.width * this.scaleCoeff * obj.scaleCoeff, obj.value.height * this.scaleCoeff * obj.scaleCoeff);
                        this.ctx.restore();
                    }
                }
                break;
            case 2: // IMAGE
            case "IMAGE": // IMAGE
                if (obj.loaded && obj.visibility['visible_' + mode]) {
                    var x = +obj.x * this.scaleCoeff + this.XCoeff;
                    var y = +obj.y * this.scaleCoeff + this.YCoeff;
                    if (!obj.rotation) {
                        this.ctx.drawImage(obj.value, x, y, obj.value.width * this.scaleCoeff * obj.scaleCoeff, obj.value.height * this.scaleCoeff * obj.scaleCoeff);
                    } else {
                        this.ctx.save();
                        //this.ctx.translate(x+obj.value.width*this.scaleCoeff*obj.scaleCoeff/2,y+obj.value.height*this.scaleCoeff*obj.scaleCoeff/2);
                        this.ctx.translate(x + obj.value.width * this.scaleCoeff * obj.scaleCoeff / 2, y + obj.value.height * this.scaleCoeff * obj.scaleCoeff / 2);
                        this.ctx.rotate(obj.rotation);
                        this.ctx.drawImage(obj.value, -obj.value.width * this.scaleCoeff * obj.scaleCoeff / 2, -obj.value.height * this.scaleCoeff * obj.scaleCoeff / 2, obj.value.width * this.scaleCoeff * obj.scaleCoeff, obj.value.height * this.scaleCoeff * obj.scaleCoeff);
                        this.ctx.restore();
                    }
                }
                break;
            case 4: // LABELS
            case "LABELS": // LABELS
                if (obj.visibility['visible_' + mode]) {
                    if (this.ctx.font != obj.fontStyle + " " + Math.round(obj.fontSize * this.scaleCoeff) + "px '" + obj.fontFamily + "'")
                        this.ctx.font = obj.fontStyle + " " + Math.round(obj.fontSize * this.scaleCoeff) + "px '" + obj.fontFamily + "'";
                    if (this.ctx.fillStyle != obj.color)
                        this.ctx.fillStyle = obj.color;
                    /*  if (this.ctx.fillStyle!=textColor)
                     this.ctx.fillStyle = textColor;
                     */
                    var x = +obj.x * this.scaleCoeff + this.XCoeff;
                    var y = +obj.y * this.scaleCoeff + this.YCoeff;

                    if (!obj.rotation) {
                        this.ctx.fillText(obj.value, x, y);
                    } else {
                        this.ctx.save();
                        this.ctx.translate(x, y);
                        this.ctx.rotate(obj.rotation);
                        this.ctx.fillText(obj.value, 0, 0);
                        this.ctx.restore();
                    }
                }
                break;
        }
    }
    if (typeof callback == "function")
        callback();


};

Map1.prototype.count = 0;
Map1.prototype.render = function (callback, mode) {
    if (typeof callback !== "function") callback = function () {
    };
    if (this.mode == "sector"){
        return;
    }

    //this.t1 = new Date().getTime();
    //var t1 = new Date().getTime();
    var mX = this.x * this.scaleCoeff;
    var mY = this.y * this.scaleCoeff;

    var cw = this.cWidth;
    var ch = this.cHeight;
    this.ctx.clearRect(0, 0, cw, ch);
    if (!this.moving){
        this.ctx2.clearRect(0, 0, cw, ch);
    }
    var self = this;
    this.drawZoom();

    this.drawObjects(function () {
        self.drawSquares(function () {
            //self.pictures.toPreload({mode: "canvas", alias: alias, scale: scale});

            return callback();
        });
    });
    if (self.mode === "editor") {
        if (typeof self.specialObjects === 'object') {
            self.drawSpecialObjects();
        }
    }
};

Map1.prototype.showInfo = function(obj){
    if (typeof obj!="object"){
        obj = this.mapInfo;
    }
    var s = '';
    for (var i in obj) {
        s += i+': '+obj[i]+'<br>';
    }
    $("#mapInfo").html(s);
};
Map1.prototype.showStatus = function (status) {
    this.hintState = true;
    var line_title = status.status_line_title || 'Ряд';
    var place_title = status.status_place_title || 'Место';

    if (typeof status != 'object') return;
    if (status.status_area != undefined && status.status_area != "")
        this.hint.children("#status_area").text(status.status_area);
    else
        this.hint.children("#status_area").text("");
    if (status.status_row != undefined && status.status_row != "")
        this.hint.children("#status_row").text(line_title + ": " + status.status_row);
    else
        this.hint.children("#status_row").text("");
    if (status.status_col != undefined && status.status_col != "")
        this.hint.children("#status_col").text(place_title + ": " + status.status_col);
    else
        this.hint.children("#status_col").text("");
    if (status.status_cost != undefined && status.status_cost != "")
        this.hint.children("#status_cost").text("Цена: " + status.status_cost);
    else
        this.hint.children("#status_cost").text("");
    if (status.status_fund != undefined && status.status_fund != "")
        this.hint.children("#status_fund").text("Фонд: " + status.status_fund);
    else
        this.hint.children("#status_fund").text("");
    if (status.status_price != undefined && status.status_price != "")
        this.hint.children("#status_price").text("Пояс: " + status.status_price);
    else
        this.hint.children("#status_price").text("");
    if (status.status_status != undefined && status.status_status != "")
        this.hint.children("#status_status").html(status.status_status);
    else
        this.hint.children("#status_status").text("");
    if (status.status_id != undefined && status.status_id != "")
        this.hint.children("#status_id").text(status.status_id);
    else
        this.hint.children("#status_id").text("");

    if (this.hint.css('display') == 'none' || +this.hint.css("opacity") < 1)
        this.hint.stop(true, true).fadeIn(450);

};
Map1.prototype.hideControl = function (duration) {
    var self = this;
    window.clearTimeout(this.hintTimer);
    this.hintTimer = window.setTimeout(function () {
        window.clearTimeout(self.hintTimer);
        if (!self.hintState) {
            if (self.hint.length > 0 && self.hint.css("display") != "none") {
                self.hint.stop(true, true).fadeOut(duration);
            }
            self.hintState = false;
        }
    }, duration);
};
Map1.prototype.hideStatus = function () {
    if (arguments[0] != undefined && !isNaN(+arguments[0])) {
        this.hideControl(arguments[0]);
    } else {
        if (!this.hintState) return;
        this.hideControl(450);
    }
    this.hintState = false;
};
Map1.prototype.moveStatus = function (x, y) {
    this.hint.css({top: y + "px", left: x + "px"});
};


/***    КОНЕЦ Рендер (View)        ***/

/**** Controller   *****/

Map1.prototype.fixEvent = function (e) {

    // получить объект событие для IE
    e = e || window.event;
    var t = e.target || e.srcElement;
    //var l = $(t).parents(".modal-content-wrapper").length;
    var modal = $(t).parents(".modal-content-wrapper");
    // добавить pageX/pageY для IE
    if (e.pageX == null && e.clientX != null) {
        var html = document.documentElement;
        var body = document.body;
        e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
        e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0)
    }
    //if (modal.length > 0 && modal.css("position")=="absolute"){
    //log($(t).offset().left);

    e.pageX -= $(t).offset().left;///* + parseInt($(t).css("borderWidth"))*/-$("body").scrollLeft();
    e.pageY -= $(t).offset().top;///* + parseInt($(t).css("borderWidth"))*/ -$("body").scrollTop();

    //}

    // добавить which для IE
    if (!e.which && e.button) {
        e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) )
    }

    return e;
};
Map1.prototype.mouseOnLayout = function (x, y) {
    if (this.loading) return false;
    var w = this.layoutSquares[0].w;
    var h = this.layoutSquares[0].h;
    var key = (Math.floor(y / h) * this.layoutVCount + Math.floor(x / w));
    if (key < 0 || key >= this.layoutHCount * this.layoutVCount) return false;
    return key;
};
Map1.prototype.mouseOnElement = function (x, y) {
    if (this.moving) return false;
    if (this.loading) return false;
    var square = this.mouseOnLayout(x, y);
    if (square !== false) {
        var shapes = this.layoutSquares[square].shapes;
        if (document.all && !document.addEventListener) {
            for (var key = 0; key < shapes.length; key++) {
                var x2 = this.squares[shapes[key]].x * this.scaleCoeff + this.XCoeff;
                var y2 = this.squares[shapes[key]].y * this.scaleCoeff + this.YCoeff;
                var wh = this.squareWH * this.scaleCoeff;
                if (x >= x2 && x <= +(x2 + wh) && y >= +y2 && y <= +(y2 + wh)) {
                    return this.squares[shapes[key]].id;
                }
            }
        } else {
            for (var key in shapes) {
                var x2 = this.squares[shapes[key]].x * this.scaleCoeff + this.XCoeff;
                var y2 = this.squares[shapes[key]].y * this.scaleCoeff + this.YCoeff;
                //var wh = this.squareWH * this.scaleCoeff;
                var w = this.squares[shapes[key]].w * this.scaleCoeff;
                var h = this.squares[shapes[key]].h * this.scaleCoeff;
                if (x >= x2 && x <= +(x2 + w) && y >= +y2 && y <= +(y2 + h)) {
                    return this.squares[shapes[key]].id;
                }
            }
        }

    }
    return false;
};
Map1.prototype.mouseOnSector = function (x, y) {
    if (this.moving) return false;
    if (this.loading) return false;
    /* x = x * this.scaleCoeff + this.XCoeff;
     y = y * this.scaleCoeff + this.YCoeff;*/
    var x2 = Math.round((x - this.XCoeff) / this.scaleCoeff);
    var y2 = Math.round((y - this.YCoeff) / this.scaleCoeff);
    var inSector = false;
    var sectors = this.sectors;
    if (!sectors.length) {
        return false;
    }
    for (var i in sectors) {
        var sub_groups = sectors[i].sub_groups;
        if (!sub_groups.length) {
            continue;
        }
        for (var i2 in sub_groups) {
            var one_group = sub_groups[i2];
            if (isPointInPoly(one_group, {x: x2, y: y2})) {
                return sectors[i];
            }
        }
    }
    return false;
};
Map1.prototype.layoutInRect = function (x0, y0, w, h) {
    var layouts = [];
    for (var key in this.layoutSquares) {
        var xL = this.layoutSquares[key].x;
        var yL = this.layoutSquares[key].y;
        var wL = this.layoutSquares[key].w;
        var hL = this.layoutSquares[key].h;
        if (
            (xL >= x0 && yL >= y0 && xL <= x0 + w && yL <= y0 + h) ||
            (xL + wL >= x0 && yL >= y0 && xL + wL <= x0 + w && yL <= y0 + h) ||
            (xL + wL >= x0 && yL + hL >= y0 && xL + wL <= x0 + w && yL + hL <= y0 + h) ||
            (xL >= x0 && yL + hL >= y0 && xL <= x0 + w && yL + hL <= y0 + h) ||

            (x0 >= xL && y0 >= yL && x0 <= xL + wL && y0 <= yL + hL) ||
            (x0 + w >= xL && y0 >= yL && x0 + w <= xL + wL && y0 <= yL + hL) ||
            (x0 + w >= xL && y0 + h >= yL && x0 + w <= xL + wL && y0 + h <= yL + hL) ||
            (x0 >= xL && y0 + h >= yL && x0 <= xL + wL && y0 + h <= yL + hL)

        ) {
            layouts.push(key);
        }
    }
    return layouts;
};
Map1.prototype.squaresInRect = function (x0, y0, w, h) {
    var squares = [];
    var layouts = this.layoutInRect(x0, y0, w, h);
    for (var key1 in layouts) {
        var arr2 = this.layoutSquares[layouts[key1]].shapes;//.squares;
        for (var key2 in arr2) {
            var xL = this.squares[arr2[key2]].x * this.scaleCoeff + this.XCoeff;
            var yL = this.squares[arr2[key2]].y * this.scaleCoeff + this.YCoeff;
            var wL = this.squareWH * this.scaleCoeff;
            var hL = this.squareWH * this.scaleCoeff;
            if (
                (xL >= x0 && yL >= y0 && xL <= x0 + w && yL <= y0 + h) &&
                (xL + wL >= x0 && yL >= y0 && xL + wL <= x0 + w && yL <= y0 + h) &&
                (xL + wL >= x0 && yL + hL >= y0 && xL + wL <= x0 + w && yL + hL <= y0 + h) &&
                (xL >= x0 && yL + hL >= y0 && xL <= x0 + w && yL + hL <= y0 + h) /*&&

             (x0>=xL && y0>=yL && x0<=xL+wL && y0<=yL+hL) &&
             (x0+w>=xL && y0>=yL && x0+w<=xL+wL && y0<=yL+hL) &&
             (x0+w>=xL && y0+h>=yL && x0+w<=xL+wL && y0+h<=yL+hL) &&
             (x0>=xL && y0+h>=yL && x0<=xL+wL && y0+h<=yL+hL)*/

            ) {
                if ($.inArray(arr2[key2], squares) == -1)
                    squares.push(arr2[key2]);
            }
        }
    }
    return squares;
};
/// Навешиваем события
Map1.prototype.setEvents = function () {
    console.log('setEvents');
    var self = this;
    /****   Пользовательские события    ***/
    this.container.on("sendSelection", function () {
        if (self.selection.length == 0) return;
        if (typeof self.sendSelection === "function") {
            self.sendSelection();
        }
    });

    //// HINT
    this.container.on("show_hint", function (e, square) {
        if (typeof square !== 'object') return;
        self.showStatus({
            status_area: square.areaGroup,
            status_row: square.line,
            status_col: square.place,
            status_cost: square.salePrice,
            status_fund: square.fundGroup,
            status_price: square.priceGroup,
            status_status: square.textStatus,
            status_id: square.id,
            status_line_title: square.line_title,
            status_place_title: square.place_title
        });
    });
    this.container.on("hide_hint", function (e, duration) {
        self.hideStatus(duration);
        return false;
    });
    this.container.on("move_hint", function (e, x, y) {
        self.moveStatus(x, y);
        return false;
    });
    /// КОНЕЦ HINT

    this.container.on("leave_container", function (e) {
        self.mouseKey = 0;

        if (self.moving) {
            window.setTimeout(function () {
                self.moving = false;
                self.render();
                self.reLoadLayout();
                //self.shiftState = 0;
            }, 0);
        }

        self.oldMouseX = 0;
        self.oldMouseY = 0;
        self.selecting = -1;
        self.container.trigger("hide_hint", 10);
        self.mousemovingFirst = true;
        return false;
    });
    this.container.on("hint_map", function (e, x, y) {
        var square_id = self.mouseOnElement(x, y);
        if (square_id)
            self.container.trigger("show_hint", [self.squares[square_id]]);
        else {
            self.container.trigger("hide_hint");
        }
        self.container.trigger("move_hint", [x + 30, y + 30]);
    });
    this.container.on("move_map", function (e, x, y) {


        if (self.oldMouseX == 0 || self.oldMouseY == 0) {
            self.oldMouseX = x;
            self.oldMouseY = y;
            return;
        }
        self.moving = true;
        self.XCoeff += x - self.oldMouseX;
        self.YCoeff += y - self.oldMouseY;
        self.oldMouseX = x;
        self.oldMouseY = y;
        self.render();
    });
    this.container.on("move_to_point_map", function (e, x, y) {
        self.zoomToPoint(x, y);
        self.render();
        self.reLoadLayout();
    });

    Map1.prototype.scrollControl = function () {
//TODO Здесь есть задержки
        if (self.timerForMouseWheel != undefined) return;
        self.timerForMouseWheel = window.setInterval(function () {
            if (!self.mouseWheelFlag) {
                window.clearInterval(self.timerForMouseWheel);
                self.timerForMouseWheel = undefined;
                self.moving = false;
                self.reLoadLayout();
                self.render();

            }
            self.mouseWheelFlag = false;
        }, 50);
    };
    var tmpArray = [];
    Map1.prototype.getNextScale = function (delta) {
        //var cCoef = self.scaleCoeff.toFixed(3);
        var cCoef = self.roundPlus(self.scaleCoeff, 3);
        //step = 0.025;
        var wdth = this.maxX - this.minX;
        step = this.round((0.05*7000/wdth),100);
        //console.log('WIDTH', wdth);
        delta = (delta > 0) ? 1 : -1;
        var balance = (cCoef % step).toFixed(3);
        if (balance == step) balance = 0;
        var oldscaleCoeff = self.scaleCoeff;
        if (delta > 0) {
            self.mouseWheelCounter++;
            if (balance > 0) self.scaleCoeff -= balance;
            self.scaleCoeff += step;
        } else {
            self.mouseWheelCounter--;
            if (balance > 0) self.scaleCoeff += (step - balance);
            if (cCoef <= step) {
                self.moving = false;
                return false;
            }
            self.scaleCoeff -= step;
            self.scaleCoeff = self.roundPlus(self.scaleCoeff, 3);
        }
        return {delta: delta, oldscaleCoeff: oldscaleCoeff};
    };

    this.container.on("scale_map", function (e, x, y, delta) {
        if (self.mode == "sector") {
            return;
        }
        //console.log("scale_map");
        self.scrollControl();
        if (!self.mouseWheelFlag){
            self.oldScale = self.scaleCoeff;
        }
        self.mouseWheelFlag = true;
        self.moving = true;

        var __ret = self.getNextScale(delta);
        if (!__ret) {
            return;
        }
        delta = __ret.delta;
        var oldscaleCoeff = __ret.oldscaleCoeff;
        var boxWidth = self.cWidth;
        var boxHeight = self.cHeight;
        if (self.minX == Infinity) {
            self.minX = 0;
            self.minY = 0;
            self.maxX = boxWidth;
            self.maxY = boxHeight;
        }
        var W = (Math.abs(self.maxX - self.minX) + self.squareWH);
        var H = (Math.abs(self.maxY - self.minY) + self.squareWH);
        var dx = 0;
        var dy = 0;

        if (delta != 0) {
            /*
             var Ximg = (x - boxWidth/2)*W/boxWidth;
             var Yimg = (y - boxHeight/2)*H/boxHeight;
             dx =  (W*step*delta/2) + Ximg*step*delta;
             dy =  (H*step*delta/2)+ Yimg*step*delta;*/
            /*var mouseX = (x - boxWidth/2)*(self.scaleCoeff-oldscaleCoeff);
             var mouseY = (y - boxHeight/2)*(self.scaleCoeff-oldscaleCoeff);*/
            /* var mouseX = (x - boxWidth/2)*step;
             var mouseY = (y - boxHeight/2)*step;*/

            var mouseX = 0;
            var mouseY = 0;

            dx = (W * self.scaleCoeff - W * oldscaleCoeff) / 2 + self.minX * self.scaleCoeff - self.minX * oldscaleCoeff + mouseX;
            dy = (H * self.scaleCoeff - H * oldscaleCoeff) / 2 + self.minY * self.scaleCoeff - self.minY * oldscaleCoeff + mouseY;
            /* console.log('delta!=0');
             var Ximg = (x - boxWidth/2)*W/boxWidth;
             var Yimg = (y - boxHeight/2)*H/boxHeight;
             dx = (W*step*delta/2) + Ximg*step*delta;
             dy = (H*step*delta/2)+ Yimg*step*delta;*/
        } else {
            console.log('delta==0');
            var counter = (self.mouseWheelCounter > 0) ? self.mouseWheelCounter : 1;
            var Xd = (Math.abs(self.XCoeff - (boxWidth - W * self.scaleCoeff) / 2)) / counter;
            var Yd = (Math.abs(self.YCoeff - (boxHeight - H * self.scaleCoeff) / 2)) / counter;


            if (self.XCoeff > (boxWidth - W * self.scaleCoeff) / 2) dx = +Xd;
            else dx = -Xd;
            if (self.YCoeff > (boxHeight - H * self.scaleCoeff) / 2) dy = +Yd;
            else dy = -Yd;
        }

        self.scaleCoeff = self.roundPlus(self.scaleCoeff, 3);
        self.XCoeff -= dx;
        self.YCoeff -= dy;
        //console.log(self.scaleCoeff);
        if (tmpArray.indexOf(self.scaleCoeff) == -1) {
            tmpArray.push(self.scaleCoeff);
        }
        self.render();

    });
    this.container.on("select_stop", function (e, x, y, callback) {
        self.selector.selectStop(x, y, function (x0, y0, w, h) {
                var squares = self.squaresInRect(x0, y0, w, h);
                if (squares.length == 0) return;
                if (self.selector.type == "add") {
                    self.addToSelectionArray(squares);
                    /*for (var k in squares){
                     self.addToSelection(squares[k]);
                     }*/
                } else {
                    self.removeFromSelection(squares);
                    /* for (var k in squares){
                     self.removeFromSelection(squares[k]);
                     }*/
                }

                if (typeof callback == "function")
                    callback();

            }
        );
        //self.shi

    });

    this.container.on("squares_select", function (e, x, y, onlyOne,sq) {
        /*if (self.moving) return;*/
        self.selecting = 1;
        var square = (!x && !y)? sq : self.mouseOnElement(x, y);
        if (square){
            if (+self.squares[square].status==0 && self.mode!=="editor") return;
            if (onlyOne){
                var placeGroupId = self.squares[square].place_group_id;

                if (placeGroupId){
                    var inSelection = false;
                    var ids = [];
                    if ($.inArray(+square,self.selection)!=-1){
                        inSelection = true;
                    }
                    for (var i in self.squares) {
                        if (self.squares[i].place_group_id == placeGroupId){
                            ids.push(self.squares[i].id);

                        }
                    }
                    if (!inSelection){
                        self.addToSelection(ids);
                    }else{
                        self.removeFromSelection(ids);
                    }
                    return;
                }


                if ($.inArray(+square,self.selection)!=-1)
                    self.removeFromSelection(square);
                else
                    self.addToSelection(square);

                return;
            }
            self.addToSelection(square);
        }
    });

    this.container.on("squares_deselect", function (e, x, y) {
        /*if (self.moving) return;*/
        self.selecting = 1;
        var square = self.mouseOnElement(x, y);
        if (square) {
            if (+self.squares[square].status == 0 && self.mode !== "editor") return;
            self.removeFromSelection(square);
        }
    });
    this.container.on("go_to_sector", function (e, x, y) {
        var sector = self.mouseOnSector(x, y);
        if (sector) {
            if (+sector.free_places==0){
                return;
            }
            sector.selected = true;
            self.container.trigger('sector_click');
        }
    });
    this.container.on("select_sector", function (e, x, y) {
        var sector = self.mouseOnSector(x, y);
        if (sector) {
            if (+sector.free_places==0){
                return;
            }
           /*zoneHoverColorRGB =
            zoneHoverColorRGB */
            /* sector.stop = true;*/
            sector.selected = !(sector.selected);
            /*var from = (sector.selected) ? [156, 133, 84] : [84, 126, 156];
            var to = (sector.selected) ? [84, 126, 156] : [156, 133, 84];*/
            var from = (sector.selected) ? self.zoneHoverColorRGB : self.zoneSelectColorRGB;
            var to = (sector.selected) ? self.zoneSelectColorRGB : self.zoneHoverColorRGB;

            self.highlight({
                elem: sector,
                from: sector.color || from,
                to: to,
                duration: 50
            }, function (elem, color) {
                elem.color = color.match(/[0-9]+/g);
                /*if (elem.stop) {
                 delete elem.stop;
                 return;
                 }*/
                self.drawOneSector(elem.sub_groups, {
                    drawNow: true,
                    /*fillStyle: "#FF0000",*/
                    fillStyle: color,
                    strokeStyle: color,
                    lineWidth: 0,
                    lineJoin: "round",
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowBlur: 0,
                    shadowColor: "black"
                });

            }, function (elem) {
                //elem.stop = false;
            });
        }
    });

    /*this.highlightSectorFunc = function(){

    }*/
    //Map1.prototype.lightSector =

    this.container.on("light_sector", function (e, x, y) {
        for (var i in self.sectors) {
            self.sectors[i].light = -1;
        }
        var sector = self.mouseOnSector(x, y);
        var sectorId;
        if (sector) {
            self.container.css({cursor:"pointer"});
          /*  sectorId = sector.action_group_id;*/
            sector.light = 1;
        }else{
            self.container.css({cursor:"default"});
        }

       /* for (var i in self.sectors) {
            if (self.sectors[i].action_group_id == sectorId){
                self.sectors[i].opaciti = y/1000;
            }
            self.sectors[i].opaciti = y/1000;
        }*/
        return;
        var sector = self.mouseOnSector(x, y);
        if (sector) {
            var sector_id = sector.action_group_id;
            self.container.trigger("show_hint", [{areaGroup: sector.name}]);
            if (sector.free_places>0){
                self.container.css({cursor:"pointer"});
            }else{
                self.container.css({cursor:"default"});
            }

        }else{
            self.container.css({cursor:"default"});
        }
        // Снимем подсветку с активных секторов кроме выбранного
        var lightSector = function () {
            if (sector) {
                if (sector.selected || +sector.free_places==0) {
                    return;
                }
                if (!sector.lighted) {
                    sector.lighted = true;
                    if (sector.animatedHide) {
                        sector.stop = true;
                    }
                    sector.animatedShow = true;
                    self.highlight({
                        elem: sector,
                        from: sector.color || self.zoneFillColorRGB,
                        to: self.zoneHoverColorRGB,
                        duration: 50
                    }, function (elem, color) {
                        if (elem.stop || elem.selected) {
                            delete elem.stop;
                            elem.animatedShow = false;
                            return;
                        }
                        elem.color = color.match(/[0-9]+/g);
                        self.ctx.clearRect(0,0,self.cWidth,self.cHeight);
                        //self.drawSectors();
                        self.drawOneSector(elem.sub_groups, {
                            drawNow: true,
                            fillStyle: "#FF0000",
                            fillStyle: color,
                            strokeStyle: color,
                            lineWidth: 0,
                            lineJoin: "round",
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            shadowBlur: 0,
                            shadowColor: "black"
                        });

                    }, function (elem) {
                        elem.animatedShow = false;
                    });
                }
                self.zoom_container.html('inSector');
            } else {
                self.zoom_container.html('outSector');
            }
        };
        for (var i in self.sectors) {
            if (self.sectors[i].lighted && self.sectors[i].action_group_id !== sector_id && !self.sectors[i].animatedShow && !self.sectors[i].animatedHide && !self.sectors[i].selected) {
                delete self.sectors[i].lighted;
                self.sectors[i].animatedHide = true;
                //console.log(self.sectors[i].action_group_id);

                self.highlight({
                    elem: self.sectors[i],
                    from: self.sectors[i].color || self.zoneHoverColorRGB,
                    to: self.zoneFillColorRGB,
                    duration: 100,
                    sleep: 100
                    /*sleep:0*/
                }, function (elem, color) {
                    if (elem.stop || elem.selected) {
                        delete elem.stop;
                        elem.animatedHide = false;
                        lightSector(sector);
                        return;
                    }
                    elem.color = color.match(/[0-9]+/g);
                    self.drawOneSector(elem.sub_groups, {
                        drawNow: true,
                        fillStyle: color,
                        strokeStyle: color,
                        lineWidth: 0,
                        lineJoin: "round",
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        shadowBlur: 0,
                        shadowColor: "black"
                    });

                }, function (elem) {
                    delete elem.stop;
                    elem.animatedHide = false;
                    lightSector(sector);


                });

            } else {
                lightSector(sector);
            }
        }


    });
    this.container.on("show_contextMenu", function (e, x, y) {

    });

    /****  КОНЕЦ Пользовательские события    ***/


    /**** Системные события   ****/
    /*this.container.on('leave',function(e){
     self.container.trigger("leave_container");
     });*/
    this.container.on("contextmenu", function (e) {
        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;
        switch (self.mode) {
            case "casher":
                self.container.trigger("myContextMenu", [x, y]);
                break;
            case "admin":
                break;
            case "editor":
                break;
            case "iFrame":
                break;
            case "client_screen":
                break;
            default:

                break;
        }


        return false;
    });
    $(".modal-open").bind("contextmenu", function (e) {
        return false;
    });


    this.container.on("mousewheel", function (e, delta) {

        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;
        switch (self.mode) {
            case "casher":
            case "admin":
            case "editor":
            case "iFrame":
                self.container.trigger("scale_map", [x, y, delta]);
                break;
            default:
                break;
        }
        return false;

    });
    this.container.on('dblclick', function (e) {
        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;
        if (self.mode!=="sector"){

            var square_id = self.mouseOnElement(x, y);
            if (square_id){
                console.log(self.squares[square_id]);
            }else{
                self.setScaleCoff(function () {
                    self.render(function () {
                        self.reLoadLayout(function () {

                        });
                    });
                });
            }

        }else{
            self.drawSectors();
            var sector = self.mouseOnSector(x, y);
            if (sector)
                console.log(sector);
        }

        //self.reLoad();
    });

    this.container.on("click", function (e) {
        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;

        self.mouseKey = e.which;
        switch (e.which) {
            case 1:    /// левая кнопка мыши
                switch (self.shiftState) {
                    case 16:
                    case 17:
                        switch (self.mode) {
                            case "casher":
                                break;
                            case "admin":

                                break;
                            case "editor":
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    default:
                        //if (self.moving) return;
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("squares_select", [x, y, true]);
                                self.container.trigger("sendSelection");
                                break;
                            case "admin":
                                self.container.trigger("squares_select", [x, y, true]);
                                self.container.trigger("sendSelection");
                                break;
                            case "editor":
                                var square = (!x && !y)? sq : self.mouseOnElement(x, y);
                                if (square){
                                    var c = 0;
                                    for (var i in self.squares) {
                                        if (self.squares[i].line==self.squares[square].line && self.squares[i].areaGroup==self.squares[square].areaGroup){
                                            c++;
                                        }
                                    }
                                    self.mapInfo.inRow = 'Ряд '+self.squares[square].line+' : '+c;
                                    self.showInfo()
                                }
                                break;
                            case "iFrame":
                                self.container.trigger("squares_select", [x, y, true]);
                                self.container.trigger("sendSelection");
                                break;
                            case "client_screen":
                                break;
                            case "sector":
                                //self.container.trigger("select_sector", [x, y]);
                                self.container.trigger("go_to_sector", [x, y]);
                                break;
                        }
                        break;
                }
                break;
            case 2:
                break;
            case 3:
                switch (self.shiftState) {
                    case 16:
                        switch (self.mode) {
                            case "casher":
                                break;
                            case "admin":
                                break;
                            case "editor":
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    default:
                        if (self.moving) return;
                        switch (self.mode) {
                            case "casher":
                                break;
                            case "admin":
                                break;
                            case "editor":
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }
                        break;
                }
                break;
            default:
                break;
        }
        self.container.trigger("leave_container");
        return false;
    });


    this.container.on("mouseup", function (e) {
        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;

        switch (self.mouseKey) {
            case 1:    /// левая кнопка мыши
                switch (self.shiftState) {
                    case 16:
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("select_stop", [x, y, function () {
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "admin":
                                self.container.trigger("select_stop", [x, y, function () {
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "editor":
                                self.container.trigger("select_stop", [x, y, function () {
                                    //self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    case 17:
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("sendSelection");
                                break;
                            case "admin":
                                self.container.trigger("sendSelection");
                                break;
                            case "editor":
                                self.container.trigger("mouseup_1_17");
                                /*switch(self.editorMode){
                                 case "squares":
                                 self.container.trigger("move_squares_end");
                                 break;
                                 }*/
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    default:
                        //if (self.moving) return;
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("sendSelection");
                                break;
                            case "admin":
                                self.container.trigger("sendSelection");

                                break;
                            case "editor":
                                self.container.trigger("mouseup_1_");
                                break;
                            case "iFrame":
                                self.container.trigger("leave_container");
                                break;
                            case "client_screen":
                                break;
                        }
                        break;
                }
                break;
            case 2:
                break;
            case 3:
                switch (self.shiftState) {
                    case 16:
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("select_stop", [x, y, function () {
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "admin":
                                self.container.trigger("select_stop", [x, y, function () {
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "editor":
                                self.container.trigger("mouseup_3_16", [x, y]);
                                self.container.trigger("select_stop", [x, y, function () {
                                }]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    default:
                        if (self.moving) return;
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("sendSelection");
                                break;
                            case "admin":
                                self.container.trigger("sendSelection");
                                break;
                            case "editor":

                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }
                        break;
                }
                break;
            default:
                switch (self.mode) {
                    case "casher":

                        break;
                    case "admin":

                        break;
                    case "editor":
                        break;
                    case "iFrame":
                        self.container.trigger("leave_container");
                        break;
                    case "client_screen":
                        break;
                }

                break;
        }


        self.container.trigger("leave_container");
        return false;

    });


    this.container.on("mousedown", function (e) {
        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;
        self.downX = x;
        self.downY = y;
        self.downX_obj = x;
        self.downY_obj = y;
        self.moveCounter = 0;
        self.mousemovingFirst = true;
        self.mouseKey = e.which;

        switch (self.mouseKey) {
            case 1:    /// левая кнопка мыши
                switch (self.shiftState) {
                    case 16:
                        switch (self.mode) {
                            case "casher":
                                self.selector.selectStart(x, y);
                                break;
                            case "admin":
                                self.selector.selectStart(x, y);
                                break;
                            case "editor":
                                self.selector.selectStart(x, y);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    case 17:
                        switch (self.mode) {
                            case "casher":
                                break;
                            case "admin":
                                break;
                            case "editor":
                                self.container.trigger("mousedown_1_17", [x, y]);

                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    default:
                        if (self.moving) return;
                        switch (self.mode) {
                            case "casher":
                                //self.container.trigger("squares_select", [x, y]);
                                break;
                            case "admin":
                                //self.container.trigger("squares_select", [x, y]);
                                break;
                            case "editor":

                                self.container.trigger("mousedown_1_", [x, y]);
                                break;
                            case "iFrame":
                                // self.container.trigger("squares_select",[x,y]);
                                break;
                            case "client_screen":
                                break;
                        }
                        break;
                }
                break;
            case 2:
                break;
            case 3:
                switch (self.shiftState) {
                    case 16:
                        switch (self.mode) {
                            case "casher":
                                self.selector.selectStart(x, y);
                                break;
                            case "admin":
                                self.selector.selectStart(x, y);
                                break;
                            case "editor":
                                self.selector.selectStart(x, y, 'remove');
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    default:
                        if (self.moving) return;
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("squares_select", [x, y]);
                                break;
                            case "admin":
                                self.container.trigger("squares_select", [x, y]);
                                break;
                            case "editor":
                                self.container.trigger("mousedown_3_", [x, y]);
                                //
                                break;
                            case "iFrame":
                                self.container.trigger("squares_deselect", [x, y]);
                                break;
                            case "client_screen":
                                break;
                        }
                        break;
                }
                break;
            default:
                break;
        }
    });


    this.container.on("mousemove", function (e) {

        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;
        if (self.mousemovingFirst) {
            self.container.trigger("hide_hint", 10);
            self.mousemovingFirst = false;
        }
        /**** ******/

        switch (self.mouseKey) {
            case 1:
                switch (self.shiftState) {
                    case 32:
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("move_map", [x, y]);

                                break;
                            case "admin":
                                self.container.trigger("move_map", [x, y]);
                                break;
                            case "editor":
                                self.container.trigger("mousemove_1_32", [x, y]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }
                        break;
                    case 17:
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("squares_select", [x, y]);
                                break;
                            case "admin":
                                self.container.trigger("squares_select", [x, y]);
                                break;
                            case "editor":
                                self.container.trigger("mousemove_1_17", [x, y]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }
                        break;
                    case 16:
                        switch (self.mode) {
                            case "casher":
                                self.selecting = 1;
                                self.selector.selectMove(x, y);
                                break;
                            case "admin":
                                self.selecting = 1;
                                self.selector.selectMove(x, y);
                                break;
                            case "editor":
                                self.selecting = 1;
                                self.selector.selectMove(x, y);
                                self.container.trigger("mousemove_1_16", [x, y]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }


                        break;
                    default:
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("move_map", [x, y]);
                                break;
                            case "admin":
                                self.container.trigger("move_map", [x, y]);
                                break;
                            case "editor":
                                self.container.trigger("mousemove_1_", [x, y]);
                                break;
                            case "iFrame":
                                self.container.trigger("move_map", [x, y]);
                                console.log('move_map');
                                break;
                            case "client_screen":
                                break;

                        }
                        break;
                }
                break;
            case 2:
                switch (self.shiftState) {
                    default:
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("move_map", [x, y]);
                                break;
                            case "admin":
                                self.container.trigger("move_map", [x, y]);
                                break;
                            case "editor":
                                self.container.trigger("move_map", [x, y]);
                                break;
                            case "iFrame":

                                break;
                            case "client_screen":
                                self.container.trigger("move_map", [x, y]);
                                break;
                        }

                        break;
                }

                break;
            case 3:
                switch (self.shiftState) {
                    case 32:
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("move_map", [x, y]);
                                break;
                            case "admin":
                                self.container.trigger("move_map", [x, y]);
                                break;
                            case "editor":
                                self.container.trigger("mousemove_3_32", [x, y]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }
                        break;
                    case 16:
                        switch (self.mode) {
                            case "casher":
                                break;
                            case "admin":
                                break;
                            case "editor":
                                self.container.trigger("mousemove_3_16", [x, y]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        self.selecting = 1;
                        self.selector.selectMove(x, y);
                        break;
                    default:
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("squares_select", [x, y]);
                                break;
                            case "admin":
                                self.container.trigger("squares_select", [x, y]);
                                break;
                            case "editor":
                                self.container.trigger("mousemove_3_", [x, y]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }
                        break;
                }

                break;
            default:
                switch (self.shiftState) {
                    case 32:
                        break;
                    case 13:
                        break;
                    default:
                        switch (self.mode) {
                            case "sector":
                                self.container.trigger("light_sector", [x, y]);
                                break;
                            default:
                                self.container.trigger("hint_map", [x, y]);
                                break
                        }
                        break;
                }
                break;
        }


        /**** ******/


        return false;


    });
    var leaveCanvas = function (e) {
        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;
        switch (self.mouseKey) {
            case 1:
                switch (self.shiftState) {
                    case 16:
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("select_stop", [x, y, function () {
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "admin":
                                self.container.trigger("select_stop", [x, y, function () {
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "editor":
                                self.container.trigger("select_stop", [x, y, function () {

                                }]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                }
                break;
            case 3:
                switch (self.shiftState) {
                    case 16:
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("select_stop", [x, y, function () {
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "admin":
                                self.container.trigger("select_stop", [x, y, function () {
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "editor":
                                self.container.trigger("select_stop", [x, y, function () {
                                }]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                }
                break;
        }

        self.container.trigger("leave_container");
    };
    this.container.on("mouseout", function (e) {
        leaveCanvas(e);
        return false;
    });
    this.container.on("mouseleave", function (e) {
        leaveCanvas(e);
        return false;
    });
    this.zoom_container.on("click", function (e) {
        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;
        self.container.trigger("move_to_point_map", [x, y]);
        return false;
    });
    this.zoom_container.on("mousedown", function (e) {
        return false;
    });
    this.zoom_container.on("mouseup", function (e) {
        return false;
    });
    this.zoom_container.on("mousemove", function (e) {
        return false;
    });
    this.zoom_container.on("mouseenter", function (e) {
        self.container.trigger("leave_container");
        return false;
    });
    $('body').find('*').not(self.container).on("mouseenter", function (e) {
        self.container.trigger("leave_container");
        return false;
    });
    this.container.on("mouseenter", function (e) {
        self.container.attr("tabindex", "1").focus();
        self.container.trigger("leave_container");
        return false;
    });

    this.container.on("keydown", function (e) {
        if (e.which >= 37 && e.which <= 40) {
            return;
        }
        if (e.which == 123) {
            self.shiftState = 0;
            return;
        }
        //if (e.which==self.shiftState && self.shiftState!=0) return;
        self.shiftState = e.which;
        //console.log(self.shiftState);
    });
    this.container.on("keyup", function (e) {
        switch (self.mouseKey) {
            case 1:    /// левая кнопка мыши
                switch (self.shiftState) {
                    case 16:
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("select_stop", [undefined, undefined, function () {
                                }]);
                                break;
                            case "admin":
                                self.container.trigger("select_stop", [undefined, undefined, function () {
                                }]);
                                break;
                            case "editor":
                                self.container.trigger("select_stop", [undefined, undefined, function () {
                                }]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    case 17:
                        switch (self.mode) {
                            case "casher":
                                break;
                            case "admin":
                                break;
                            case "editor":
                                self.container.trigger("keyup_1_17");
                                /*switch(self.editorMode){
                                 case "squares":
                                 self.container.trigger("move_squares_end");
                                 break;
                                 }*/
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    default:
                        if (self.moving) return;
                        switch (self.mode) {
                            case "casher":
                                break;
                            case "admin":
                                break;
                            case "editor":
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }
                        break;
                }
                break;
            case 2:
                break;
            case 3:
                switch (self.shiftState) {
                    case 16:
                        switch (self.mode) {
                            case "casher":
                                self.container.trigger("select_stop", [undefined, undefined, function () {
                                }]);
                                break;
                            case "admin":
                                self.container.trigger("select_stop", [undefined, undefined, function () {
                                }]);
                                break;
                            case "editor":
                                self.container.trigger("select_stop", [undefined, undefined, function () {
                                }]);
                                //self.container.trigger("select_stop",[x, y, "remove", function(){
                                //self.container.trigger("sendSelection");
                                //}]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    default:
                        if (self.moving) return;
                        switch (self.mode) {
                            case "casher":
                                break;
                            case "admin":
                                break;
                            case "editor":
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }
                        break;
                }
                break;
            default:
                break;
        }
        self.container.trigger("leave_container");
    });
    $(document).on('keyup', function (e) {
        if (e.which >= 37 && e.which <= 40) {
            return;
        }
        self.shiftState = 0;
        self.container.trigger("leave_container");
    });

    if(isMobile.any()){
        /**-----TOUCH EVENTS--------*/
        var myOptions = {};

        var touchEvents = new Hammer(this.container[0], myOptions);
        touchEvents.get('pinch').set({enable: true});
        touchEvents.get('press').set({enable: true});
        //touchEvents.get('rotate').set({ enable: true });
        touchEvents.on('panstart', function (ev) {
            if (self.mousemovingFirst) {
                self.container.trigger("hide_hint", 10);
                self.mousemovingFirst = false;
            }
            var s = '';
            for (var i in ev.pointers[0]) {
                s += i + ', ';
            }
            //self.zoom_container.html('pageX: ' + ev.pointers[0].pageX);//.css({width:"100px",height:"40px"});
            if (self.zoom_container.css("display") !== 'none') {
                //self.zoom_container.fadeOut(100);
            }
        });
        touchEvents.on('panend', function (ev) {
            self.container.trigger("leave_container", 10);
        });
        touchEvents.on('tap', function (ev) {
            var x = ev.pointers[0].pageX - self.container.offset().left;
            var y = ev.pointers[0].pageY - self.container.offset().top;
            switch (self.mode){
                case "sector":
                    //self.container.trigger("select_sector", [x, y]);
                    self.container.trigger("go_to_sector", [x, y]);
                    break;
                case "iFrame":
                    if(isMobile.iOS()) {
                    self.container.trigger("squares_select", [x, y, true]);
                    }
                    break;
                default:
                    self.container.trigger("squares_select", [x, y, true]);
                    self.container.trigger("sendSelection");
                    break;
            }
        });
        touchEvents.on('pan', function (ev) {
            self.container.trigger("move_map", [ev.pointers[0].pageX, ev.pointers[0].pageY]);
            //self.zoom_container.html('pageX: ' + ev.pointers[0].pageX);//.css({width:"100px",height:"40px"});
            //self.zoom_container.html('angle: '+ev.center.x).css({width:"100px",height:"40px"});
        });
        touchEvents.on('pinch', function (ev) {
            //self.zoom_container.html('angle: '+JSON.stringify(ev.center)).css({width:"100px",height:"40px"});
            self.container.trigger("scale_map", [ev.center.x, ev.center.y, ev.scale - 1]);
        });

    }



    /*    this.container[0].addEventListener("touchmove", function (e) {

     var x = event.touches[0].pageX; // Собираем данные
     var y = event.touches[0].pageY; // и еще



     if (self.mousemovingFirst) {
     self.container.trigger("hide_hint", 10);
     self.mousemovingFirst = false;
     }

     switch (self.mode) {
     case "casher":
     self.container.trigger("move_map", [x, y]);
     break;
     case "admin":
     self.container.trigger("move_map", [x, y]);
     break;
     case "editor":
     self.container.trigger("mousemove_1_", [x, y]);
     break;
     case "iFrame":
     self.container.trigger("move_map", [x, y]);
     break;
     case "client_screen":
     break;
     default :
     break;
     }
     return false;
     }, false);*/


    /* var gestureStart = function(e){};
     var gestureEnd = function(e){};
     var gestureChange = function(e){
     var angle = e.scale;
     self.zoom_container.html('angle: '+angle).css({width:"100px",height:"40px"});
     };
     this.container[0].addEventListener("gesturestart", gestureStart, false);
     this.container[0].addEventListener("gesturechange", gestureChange, false);
     this.container[0].addEventListener("gestureend", gestureEnd, false);
     */
    /**----- END     TOUCH EVENTS--------*/

    /**** КОНЕЦ Системные события   ****/
};
Map1.prototype.printCanvas = function (obj) {
    var dataUrl = this.container.children("#canvas1")[0].toDataURL(); //attempt to save base64 string to server using this var
    var windowContent = '<!DOCTYPE html>';
    windowContent += '<html>'
    windowContent += '<head><title>Print canvas</title></head>';
    windowContent += '<body>'
    windowContent += '<img src="' + dataUrl + '">';
    windowContent += '</body>';
    windowContent += '</html>';
    var printWin = window.open('','','width='+this.cWidth+',height='+this.cHeight);
    printWin.document.open();
    printWin.document.write(windowContent);
    printWin.document.close();
    printWin.focus();
    printWin.print();
    printWin.close();
};
Map1.prototype.resize = function(params){
    if (typeof params!='object'){
        this.container.css({width:"100%",height:"100%"});
        params = {};
    }
    var cW = params.width || this.container.outerWidth();
    var cH = params.height || this.container.outerHeight();
    this.setSize.call(this,{cWidth:cW,cHeight:cH});
    this.container.css({width: this.containerWidth + "px", height: this.containercHeight + "px"});
    this.container.find('#canvas1').attr({width: this.cWidth, height: this.cHeight});
    this.container.find('.loader_box').css({width: this.containerWidth + "px", height: this.containercHeight + "px"});
    this.container.find('.box_for_zoom').css({width: this.navWideSide + "px", height: this.navNarrowSide + "px"});
    this.container.find('#canvas2').attr({width: this.navWideSide, height: this.navNarrowSide});
    this.loader.css({left: this.containerWidth / 2 - 50 + "px", top: this.containercHeight / 2 - 50 + "px"});
    if (this.navWideSide == 0 || this.navNarrowSide == 0){
        this.zoom_container.css("display", "none");
    }
    var self = this;
    self.setLayout(function () {
        self.setMinMax(function () {
            self.setScaleCoff(function () {
                self.render(function () {
                    self.reLoadLayout();
                });
            });
        });
    });
};

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};
var m;

    setTimeout(function () {
        if (typeof MB === "object") {

            if (MB.User.username == 'igoptarev'/* || MB.User.username == 'aig'*/) {
               /* MB.Core.switchModal({
                    type: "content",
                    filename: "action_fundZones",
                    isNewContent: false,
                    *//*params: {hall_scheme_id: 757}*//*
                    params: {action_id: 1112}
                });*/
                //MB.Core.switchModal({type: "content", filename: "one_action", params: {action_id: 932}});
                //MB.Core.switchModal({type: "content", filename: "one_action", params: {action_id: 2}});
                setTimeout(function () {
                    m = function () {
                        if (!MB.User.mapEditor_map)
                            m = MB.User.map;
                        else
                            m = MB.User.mapEditor_map;
                    };
                    m();
                    //console.log('m');
                }, 1000);
            }
        }

    }, 1000);


/**** КОНЕЦ  Controller   *****/

function launchFullScreen(element) {
    if(element.requestFullScreen) {
        element.requestFullScreen();
    } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if(element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
    }
}

// Выход из полноэкранного режима
function cancelFullscreen() {
    if(document.cancelFullScreen) {
        document.cancelFullScreen();
    } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if(document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    }
}

var onfullscreenchange =  function(e){
    var fullscreenElement =
        document.fullscreenElement ||
        document.mozFullscreenElement ||
        document.webkitFullscreenElement;
    var fullscreenEnabled =
        document.fullscreenEnabled ||
        document.mozFullscreenEnabled ||
        document.webkitFullscreenEnabled;
    console.log( 'fullscreenEnabled = ' + fullscreenEnabled, ',  fullscreenElement = ', fullscreenElement, ',  e = ', e);
}

// Событие об изменениии режима
/*el.addEventListener("webkitfullscreenchange", onfullscreenchange);
el.addEventListener("mozfullscreenchange",    onfullscreenchange);
el.addEventListener("fullscreenchange",       onfullscreenchange);*/


mergeSchemes = function(id1){
//      933
     var count = 0;
    var squareO1 = {
        command: "get",
        object: "action_scheme",
        sid: MB.User.sid,
        params: {
            action_id:933
        }
    };
    socketQuery(squareO1, function (data) {
        data = JSON.parse(data);
        var DATA = jsonToObj(data['results'][0]);
        var squares1 = [];
        var squares2 = [];
        for (var k in DATA) {
            var index = DATA[k].FUND_ZONE_ITEM_ID || DATA[k].PRICE_ZONE_ITEM_ID || DATA[k].HALL_SCHEME_ITEM_ID || DATA[k].ACTION_SCHEME_ID || DATA[k].ID;
            squares1[index] = {};
            squares1[index].id = index;
            squares1[index].areaGroup = DATA[k].AREA_GROUP_NAME || '';
            squares1[index].line = String(DATA[k].LINE) || '';
            squares1[index].place = String(DATA[k].PLACE) || '';
        }
        var squareO2 = {
            command: "get",
            object: "hall_scheme_item",
            sid: MB.User.sid,
            params: {
                hall_scheme_id:757
            }
        };
        socketQuery(squareO2, function (data) {
            data = JSON.parse(data);
            var DATA = jsonToObj(data['results'][0]);

            for (var k in DATA) {
                var index = DATA[k].FUND_ZONE_ITEM_ID || DATA[k].PRICE_ZONE_ITEM_ID || DATA[k].HALL_SCHEME_ITEM_ID || DATA[k].ACTION_SCHEME_ID || DATA[k].ID;
                squares2[index] = {};
                squares2[index].id = index;
                squares2[index].areaGroup = DATA[k].AREA_GROUP_NAME || '';
                squares2[index].line = String(DATA[k].LINE) || '';
                squares2[index].place = String(DATA[k].PLACE) || '';
            }
            for (var i in squares1) {
                var sq1 = squares1[i];
              /*  if (sq1.areaGroup.indexOf("Ложа")==-1){
                    continue;
                }*/
                var exist = false;
                for (var j in squares2) {
                    var sq2 = squares2[j];
                    if ((sq1.areaGroup == sq2.areaGroup) && (sq1.line == sq2.line) && (sq1.place == sq2.place)){
                        exist = true;
                        break;
                    }
                }
                if (!exist){
                    count++;
                    console.log(sq1.areaGroup, sq1.line, sq1.place);

                }
            }
            console.log(count);
            console.log('ended');
        });
    });
};


/*
var o = {
        className: 'to_XML_for_concert_ru',
        disabled: function () {
            return false;
        },

        callback: function () {
            var order_id = 2843;
            var o = {
                output_format: "xml",
                command: "get",
                object: "export_quota_bazis",
                sid: MB.User.sid,
                params: {
                    order_id: order_id
                }
            };
            getFile({o: o, fileName: 'order_'+order_id});
        }
    };
*/
//