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
var Map1 = function(params){
    //m1 = this;
    var map = this;
    /*this.box = ($("#"+params.box).length==1) ? $("#box_for_map") : $("#box_for_map");*/
   /* this.container = params.container || (function(){
        $("body").append("<div id='box_for_map'></div>");
        return $("#box_for_map");
    })();*/

    //IE8 indexOf()
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) { return i; }
            }
            return -1;
        }
    }


    this.container = params.container || (function(){
        $("body").append("<div id='box_for_canvas'></div>");
        return $("#box_for_canvas");
    })();
    this.host = params.host || "";
    this.doc_root = params.doc_root || "";
    this.container.css("position","relative");
    this.ctx = '';
    this.ctx2 = '';
    this.shiftState =  0;
    this.mouseKey = 0;
    this.mousemovingFirst = true;
    this.oldMouseX = 0;
    this.oldMouseY = 0;
    this.startScaleCoeff =  0.3;
    this.scaleCoeff =  0.3;
    this.scaleCoeff2 =  0.025;
    this.firstLoad = true;
    this.loadObj = {};
    this.rightColWidth = 410;
    this.containerWidth = params.cWidth || this.container.width();
    this.containercHeight = params.cHeight || this.container.height();
    this.cWidth = params.cWidth - (params.minusWidth || 0) || this.container.width() - (params.minusWidth || 0);
    this.cHeight = params.cHeight - (params.minusHeight || 0) || this.container.height() - (params.minusHeight || 0);
    this.navWideSide = (params.navWideSide!=undefined)? +params.navWideSide : 200;
    this.navNarrowSide = (params.navNarrowSide!=undefined)? +params.navNarrowSide : 110;
    this.bgColor = params.bgColor || "#f7f7f7";
    this.minX = Infinity;
    this.maxX = -Infinity;
    this.maxY = -Infinity;
/*    this.maxX = params.cWidth || this.container.width();
    this.maxY = params.cHeight || this.container.height();*/

    this.minY = Infinity;
    this.XCoeff =  100;
    this.YCoeff =  0;
    this.XCoeff2 =  0;
    this.YCoeff2 =  0;
    this.toPointX = this.navWideSide/2 || 0;
    this.toPointY = this.navNarrowSide/2 || 0;
    this.squareWH = 40;
    this.layoutSquares = {};
    this.layoutVCount = 20;
    this.layoutHCount = 20;
    this.squares = {};
    this.renderList = {
        items:[],
        findItem:function(id){
            var items = this.items;
            for (var k in items){
                if (items[k].object.object_id==id) return items[k];
            }
            return false;
        },
        removeItem:function(id){
                var self = this;
            var items = this.items;
            for (var k in items){
                if (items[k].object.object_id==id) delete items[k];
            }
            function clearEmpty(){
                for(var i=0; i< self.items.length; i++){
                    if(self.items[i] === undefined){
                        self.items.splice(i,1);
                        clearEmpty();
                    }
                }
            }
            clearEmpty();
        }
    };
    this.RenderItem = function(params){
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
        admin:'VISIBLE_ADMIN',
        casher:"VISIBLE_CASHER",
        editor:"VISIBLE_EDITOR",
        iFrame:"VISIBLE_IFRAME",
        client_screen:"VISIBLE_CLIENT_SCREEN"
    };
    this.editorMode = params.editorMode || "squares";
    this.downX = 0;
    this.downY = 0;
    this.downX_obj = 0;
    this.downY_obj = 0;
    this.changed=false;

    map.container.css({width:map.containerWidth+"px",height:map.containercHeight+"px"}).html('' +
        '<div class="loader_box" style="width: '+map.containerWidth+'px; height:'+map.containercHeight+'px;"><div class="loader"></div></div> ' +
        '<canvas height="'+map.cHeight+'" width="'+map.cWidth+'" id="canvas1" style="background-color:'+this.bgColor+';">Обновите браузер</canvas>' +
        ''+
        '<div id="topHint">' +
            '<span id="status_area"></span>' +
            '<span id="status_row"></span>' +
            '<span id="status_col"></span>' +
            '<span id="status_cost"></span>' +
            '<span id="status_fund"></span>' +
            '<span id="status_price"></span>' +
            '<span id="status_status"></span>' +
            '<span id="status_id"></span>' +
        '</div>'+
        '<div class="box_for_zoom" style="width: '+map.navWideSide+'px; height:'+map.navNarrowSide+'px;">' +
            '<canvas height="'+map.navNarrowSide+'" width="'+map.navWideSide+'" id="canvas2">Обновите браузер</canvas>' +
        '</div>'
    );
    map.container.attr("tabindex","1").focus();
    map.loader_box = map.container.children(".loader_box");
    map.loader = map.loader_box.children(".loader");
    map.loader.css({left:map.containerWidth/2-50+"px",top:map.containercHeight/2-50+"px"});
    map.hint = map.container.children("#topHint");
    map.zoom_container = map.container.children(".box_for_zoom");
    if (map.navWideSide==0 || map.navNarrowSide==0)
        map.zoom_container.css("display","none");

    if(document.all && !document.addEventListener){
        G_vmlCanvasManager.initElement(map.container.children("#canvas1")[0]);
        G_vmlCanvasManager.initElement(map.zoom_container.children("#canvas2")[0]);
    }
    map.ctx = map.container.children("#canvas1")[0].getContext('2d');
    map.ctx2 = map.zoom_container.children("#canvas2")[0].getContext('2d');

    map.ctx.font =  "italic 20pt 'Open Sans'";
    map.ctx.fillStyle = "#000";
    if (typeof Selector === "function")
        map.selector = new Selector({
            parentBox:map.container,
            zIndex:102
        });

   // })();



};
Map1.prototype.setLayout = function(callback){
    if (typeof callback!=="function") callback=function(){};
    this.layoutSquares = {};
    var w = this.cWidth/this.layoutHCount;
    var h = this.cHeight/this.layoutVCount;
    var count = 0;
    for (var i=0; i<this.layoutVCount;i++){
        for(var k=0;k<this.layoutHCount;k++){
            this.layoutSquares[count] = {x:w*k,y:h*i,w:w,h:h,shapes:[]};
            this.ctx.strokeRect(this.layoutSquares[count].x,this.layoutSquares[count].y,this.layoutSquares[count].w,this.layoutSquares[count].h);
            count++;
        }
    }
    return callback();
};

Map1.prototype.reLoadLayout = function(callback){
    if (typeof callback!=="function") callback=function(){};
    var wh = this.squareWH;
    var cw = this.cWidth;
    var ch = this.cHeight;
    var coef = wh/10;
    var self = this;
    function reLoadLayoutChild(key){
        var x = Math.round((self.squares[key].x)*self.scaleCoeff+self.XCoeff);
        var y = Math.round((self.squares[key].y)*self.scaleCoeff+self.YCoeff);
        if (x<=cw && x>=0 && y <=ch && y>=0){
            var layout1 = self.mouseOnLayout(x-coef,y-coef);
            if (layout1!==false) {
                self.layoutSquares[layout1].shapes.push(self.squares[key].id);
            }
            var layout2 = self.mouseOnLayout(x+wh*self.scaleCoeff+coef,y-coef);
            if (layout2!==false) {
                self.layoutSquares[layout2].shapes.push(self.squares[key].id);
            }
            var layout4 = self.mouseOnLayout(x+wh*self.scaleCoeff+coef,y+wh*self.scaleCoeff+coef);
            if (layout4!==false) {
                self.layoutSquares[layout4].shapes.push(self.squares[key].id);
            }
            var layout3 = self.mouseOnLayout(x-coef,y+wh*self.scaleCoeff+coef);
            if (layout3!==false) {
                self.layoutSquares[layout3].shapes.push(self.squares[key].id);
            }
            var dyLayout = (layout3-layout1)/self.layoutHCount-1;

            for (var kX=layout1;kX<=layout2;kX++){
                for (var kY=1;kY<=dyLayout;kY++){
                    var index = kX+kY*self.layoutHCount;
                    self.layoutSquares[index].shapes.push(self.squares[key].id);
                }
            }

        }
    }

    for (var key in this.squares){
        reLoadLayoutChild(key);
    }
    return callback();
};



Map1.prototype.openSocket = function(params,callback){
    if (typeof callback!=="function") callback=function(){};
    var self = this;
    var room = params.type+"_"+params.param+"_"+params.id;
    socket.emit('mapConnection', params);
    //socket.removeAllListeners(room+"_callback").on(room+"_callback",function(data,return_type){

    socket.removeAllListeners(room+"_callback").on(room+"_callback",function(data,return_type){
        //return;
        switch(return_type){
            case "places":
                console.log(room+"_callback   "+'places');
                console.log(data);
                if (data[0]===undefined){
                    self.clearSelection(true);
                    log("В "+room+"_callback пришел пустой объект");
                    return;
                }
                self.updateSquares(data);
                if (typeof self.sendSelectionCallback === "function") self.sendSelectionCallback();
                break;
            case "ids":
                if(typeof data!=="object") return;
                var obj = {
                    event:"load",
                    load_params:{
                        list:data,
                        portion:40
                    }
                };
                self.toSocket(obj);
                break;
        }


    });
    //socket.removeAllListeners(room+"_callbackFull").on(room+"_callbackFull",function(data){
    socket.removeAllListeners(room+"_callbackFull").on(room+"_callbackFull",function(data){
        if (typeof self.sendSelectionCallbackFull === "function") self.sendSelectionCallbackFull();
    });


    //socket.removeAllListeners(room+"_get_callback_layers").on(room+"_get_callback_layers",function(obj){
    socket.removeAllListeners(room+"_get_callback_layers").on(room+"_get_callback_layers",function(obj){

        //this.loadObjects()
        //mapEditor_map.container.trigger('getObject_callback',[obj]);
    });




    this.toSocket = function(obj){
        var guid = '';
        if (typeof MB ==="object"){
            guid = MB.Core.getUserGuid();
        }
        socket.emit(room,obj,guid);
    };
    //socket.removeAllListeners("disconnect").on("disconnect",function(){
    socket.removeAllListeners("disconnect").on("disconnect",function(){
        console.log("socket was disconnected");
        if (self.disconnect) return;
        self.clearSelection(true);
        window.setTimeout(function(){
            self.openSocket(params);
        },500);
    });

    Map1.prototype.closeSocket = function(){
        //self.disconnect = true;
        socket.emit(room,"leave");
    };

    return callback(room);

};
/*Map1.prototype.socketMAP = function(obj){
    socket.emit('socketMAP',obj);
};*/



Map1.prototype.loadImage = function(object,callback){
    if (typeof object!=="object") return;
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
    image.onload = function(){
        if (typeof callback=="function")
        callback(image,object.id);
    };
    image.src = this.doc_root+path+name;
    //console.log(this.doc_root+path+name);
};

/**
 * Функция загружает физические места схемы
 * @param params - объект для sendQuery (command, object, sid...)
 * @param callback
 * @return {*}
 */
Map1.prototype.loadObjects = function(callback){
    if (typeof callback=="function")
        return callback;
};
Map1.prototype.loadSquares = function(params,callback){
    if (typeof callback!=="function") callback=function(){};
    this.loading = true;
    this.loadObj = cloneObj(params);

    this.squares = [];
    var self = this;
    socketQuery(params,function (data) {
        data = JSON.parse(data);
        var DATA = jsonToObj(data['results'][0]);
        self.squares = [];
        for (var k in DATA){
            var index =  DATA[k].FUND_ZONE_ITEM_ID || DATA[k].PRICE_ZONE_ITEM_ID || DATA[k].HALL_SCHEME_ITEM_ID || DATA[k].ACTION_SCHEME_ID || DATA[k].ID;
            self.squares[index] = {};
            self.squares[index].id = index;
            self.squares[index].areaGroup = DATA[k].AREA_GROUP_NAME || '';
            self.squares[index].x = +DATA[k].X || 0;
            self.squares[index].y = +DATA[k].Y || 0;
            self.squares[index].w = (DATA[k].W!="" && DATA[k].W!=undefined)? +DATA[k].W : 40;
            self.squares[index].h = (DATA[k].H!="" && DATA[k].H!=undefined)? +DATA[k].H : 40;
            self.squares[index].line = String(DATA[k].LINE) || '';
            self.squares[index].line_title = (String(DATA[k].LINE_TITLE)!==undefined)?String(DATA[k].LINE_TITLE):"Ряд";
            self.squares[index].place = String(DATA[k].PLACE) || '';
            self.squares[index].place_title = (String(DATA[k].PLACE_TITLE)!==undefined)?String(DATA[k].PLACE_TITLE):"Место";
            self.squares[index].salePrice = (DATA[k].PRICE!=undefined) ? DATA[k].PRICE : "";
            self.squares[index].status = (DATA[k].STATUS!=undefined && DATA[k].STATUS!="") ? +DATA[k].STATUS : 1;
            self.squares[index].order_id = (DATA[k].ORDER_ID!=undefined && DATA[k].ORDER_ID!="") ? DATA[k].ORDER_ID : -1;
            self.squares[index].ticket_id = (DATA[k].ORDER_TICKET_ID!=undefined && DATA[k].ORDER_TICKET_ID!="") ? DATA[k].ORDER_TICKET_ID : -1;
            self.squares[index].textStatus = (DATA[k].STATUS_TEXT!=undefined && DATA[k].STATUS_TEXT!="") ? DATA[k].STATUS_TEXT.replace(/\&lt\;br\&gt\;/g,'<br>') : "";
            self.squares[index].fundGroup = DATA[k].FUND_GROUP_NAME || '';
            /*self.squares[index].fundGroupId = DATA[k].FUND_GROUP_ID;*/
            self.squares[index].priceGroup = DATA[k].PRICE_GROUP_NAME || '';
            self.squares[index].blocked = DATA[k].BLOCK_COLOR || "#c1c1c1";
            self.squares[index].layer_id = DATA[k].HALL_SCHEME_LAYER_ID || "";
            self.squares[index].object_id = DATA[k].HALL_SCHEME_OBJECT_ID || DATA[k].ACTION_SCHEME_OBJECT_ID || "";
            self.squares[index].color0 = (DATA[k].COLOR!=undefined && DATA[k].COLOR!="")?DATA[k].COLOR:"#c1c1c1";
            self.squares[index].comment = DATA[k].PLACE_COMMENT || "";
            self.squares[index].colorShadow ="#c6c2c2";
            self.squares[index].colorSelected = "#FF0000";
            if (self.mode === 'iFrame'){
                self.squares[index].colorSelected = "#000";
            }
            var color = +self.squares[index].color0.replace("#","0x");
            if (color>+"0x8b5742")
                self.squares[index].textColor = "#000";
            else
                self.squares[index].textColor = "#fff";
        }
        self.loading = false;
        self.container.trigger("squaresLoaded",[self.squares]);
        self.loader_box.fadeOut(650);
        return callback();

    });

    Map1.prototype.reLoad = function(callback){
        self.changed=false;
        self.loading = true;
        self.loader_box.fadeIn(250);

        self.loadSquares(self.loadObj,function(){
            self.setLayout(function(){
                self.reLoadLayout(function(){
                    self.render(function(){});
                    self.loading = false;
                    if (typeof callback==="function")
                        callback();
                });
            });


        });
    };
    Map1.prototype.reLoadList = function(list,callback){
        if (!self.reLoadListCount) self.reLoadListCount = 0;
        self.reLoadListCount++;
        console.log(self.reLoadListCount);
        if (typeof list!="object"){
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
 * Функция загружает данные обводок и надписей
 * @param params - объект,  - запрос данных command, object, sid, params
 *
 */
Map1.prototype.fillRenderList = function(objects,callback){
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
    objects = objects.sort(function(a,b){
        if (a.type === 1 && b.type !== 1){
            return -1;
        }else if(a.type !== 1 && b.type === 1){
            return 1;
        }
        return 0;
    });
    for (var k in objects){
        counter1++;
        var OBJECT = objects[k];
        switch (OBJECT.type){
            case 1:  //  BACKGROUND
                self.loadImage({
                    path:"",
                    name:OBJECT.image,
                    id:counter1-1
                },function(image,index){
                    objects[index].value = image;
                    objects[index].loaded = true;
                    counter2++;
                });
                break;
            case 2:  //  IMAGE
                self.loadImage({
                    path:"",
                    name:OBJECT.image,
                    id:counter1-1
                },function(image,index){
                    objects[index].value = image;
                    objects[index].loaded = true;
                    counter2++;
                });
                break;
            case 4:  //  LABEL
                    counter2++;
                break;
            default:
                counter2++;
                break;
        }
        var item = new self.RenderItem({
            object_type:OBJECT.type,
            object:OBJECT
        });
        self.renderList.items.push(item);

    }
    var t1 = setInterval(function(){

        if (counter1==counter2){
            if (typeof callback=="function")
                callback();

            clearInterval(t1);
        }
    },100)

};

/**
 * Загружает вспомогательные объекты отображаемые на схеме (обводки, изображения)
 * @param params
 * @param callback
 */
Map1.prototype.loadRenderItems = function(params,callback){

    var self = this;
    var where_field = params.objectO.where_field;
    var param_field = params.objectO.param_field;
    //var object_where = params.objectO.where;
    if (where_field)
        delete params.objectO.where_field;
    if (param_field)
        delete params.objectO.param_field;

    socketQuery(params.layerO,function(results){
        var objectList = [];
        var layersCount = 0;
        var currentLayer = 0;


        var data = JSON.parse(results);
        var LAYERS = jsonToObj(data['results'][0]);
        for (var i in LAYERS) {
            layersCount++;
        }

        var OBJECT_TYPE = {
            PLACE_GROUP:{
                type:0,
                object_title:"Места"
            },
            BACKGROUND:{
                type:1,
                object_title:"Фон"

            },
            IMAGE:{
                type:2,
                object_title:"Изображение"
            },
            STROKE:{
                type:3,
                object_title:"Обводка"
            },
            LABEL:{
                type:4,
                object_title:"Надпись"
            }
        };

        for (var l in LAYERS){
            if (where_field)
                params.objectO.params.where = where_field+" = "+LAYERS[l][where_field]+" and OBJECT_TYPE <> 'PLACE_GROUP'";
            if (param_field)
                params.objectO.params[param_field] = LAYERS[l][param_field];

            if (self.mode!='editor') {
                params.objectO.params.where = (typeof params.objectO.params.where !== undefined) ? params.objectO.params.where + " and VISIBLE_" + self.mode.toUpperCase() + " = 'TRUE'" : 'VISIBLE_' + self.mode.toUpperCase() + " = 'TRUE'";
            }
            socketQuery(params.objectO,function(results){
                var data = JSON.parse(results);
                var OBJECTS = jsonToObj(data['results'][0]);
              /*  log("OBJECTS");
                log(OBJECTS);*/
                var objs = [];
                for (var k in OBJECTS){
                    var obj = OBJECTS[k];
                    if (OBJECT_TYPE[obj.OBJECT_TYPE].type==0) continue;
                    objectList.push({
                        object_id : obj.HALL_SCHEME_OBJECT_ID || obj.ACTION_SCHEME_OBJECT_ID || undefined,
                        type : OBJECT_TYPE[obj.OBJECT_TYPE].type,
                        value : obj.VALUE || obj.value || "",
                        color : obj.COLOR || "#000",
                        object_title : obj.NAME || OBJECT_TYPE[obj.OBJECT_TYPE].object_title,
                        image : obj.BACKGROUND_URL_SCALE || obj.BACKGROUND_URL_ORIGINAL || undefined,
                        scaleCoeff : +obj.SCALE || 1,
                        rotation : +obj.ROTATION || 0,
                        visibility:{
                            visible_editor: (obj.VISIBLE_EDITOR=="TRUE"),
                            visible_admin:  (obj.VISIBLE_ADMIN=="TRUE"),
                            visible_casher:  (obj.VISIBLE_CASHER=="TRUE"),
                            visible_iframe:  (obj.VISIBLE_IFRAME=="TRUE"),
                            visible_client_screen: (obj. VISIBLE_CLIENT_SCREEN=="TRUE")
                        },
                        x:obj.X,
                        y:obj.Y,
                        fontFamily:obj.FONT_FAMILY,
                        fontSize:obj.FONT_SIZE,
                        fontStyle:obj.FONT_STYLE,
                        fontWeight:obj.FONT_WIEGHT
                    });

                }
                currentLayer++;
                if (currentLayer === layersCount){
                    self.fillRenderList(objectList, function () {
                    if (typeof callback=="function")
                        callback();
                });
                }



            })
        }

    });


};
Map1.prototype.updateSquare = function(square,indexName){
    if (typeof square!=="object") return;
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log(square);
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!');
    //var indexName =  getIndexFieldName();
    //if (!indexName) return;
    var index = square[indexName];
    if (this.squares[index]==undefined) {
        this.squares[index] = {};
        this.squares[index].id = index;
    }
    this.squares[index].areaGroup = (square.AREA_GROUP_NAME!=undefined && square.AREA_GROUP_NAME!="") ? square.AREA_GROUP_NAME : (this.squares[index].areaGroup!=undefined) ? this.squares[index].areaGroup : "";
    this.squares[index].x = (square.X!=undefined && square.X!="") ? +square.X : (this.squares[index].x!=undefined) ? this.squares[index].x : 10;
    this.squares[index].y = (square.Y!=undefined && square.Y!="") ? +square.Y : (this.squares[index].y!=undefined) ? this.squares[index].y : 10;
    this.squares[index].w = (square.W!=undefined && square.W!="") ? +square.W : (this.squares[index].w!=undefined) ? this.squares[index].w : 40;
    this.squares[index].h = (square.H!=undefined && square.H!="") ? +square.H : (this.squares[index].h!=undefined) ? this.squares[index].h : 40;
    this.squares[index].line = (square.LINE!=undefined && square.LINE!="") ? String(square.LINE) : (this.squares[index].line!=undefined) ? String(this.squares[index].line) : "";
    this.squares[index].line_title = (square.LINE_TITLE!==undefined)?String(square.LINE_TITLE):(this.squares[index].line_title!==undefined)?this.squares[index].line_title:"Ряд";
    this.squares[index].place_title = (square.PLACE_TITLE!==undefined)?String(square.PLACE_TITLE):(this.squares[index].place_title!==undefined)?this.squares[index].place_title:"Место";
    this.squares[index].place = (square.PLACE!=undefined && square.PLACE!="") ? String(square.PLACE) : (this.squares[index].place!=undefined) ? String(this.squares[index].place) : "";
    this.squares[index].salePrice = (square.PRICE!=undefined) ? square.PRICE : (this.squares[index].salePrice!=undefined) ? this.squares[index].salePrice : "";
    this.squares[index].status = (square.STATUS!=undefined && square.STATUS!="") ? +square.STATUS : (this.squares[index].status!=undefined) ? this.squares[index].status : "";
    this.squares[index].order_id = (square.ORDER_ID!=undefined && square.ORDER_ID!="") ? square.ORDER_ID : (this.squares[index].order_id!=undefined) ? this.squares[index].order_id : -1;
    this.squares[index].ticket_id = (square.ORDER_TICKET_ID!=undefined && square.ORDER_TICKET_ID!="") ? square.ORDER_TICKET_ID : (this.squares[index].ticket_id!=undefined) ? this.squares[index].ticket_id : -1;
    this.squares[index].textStatus = (square.STATUS_TEXT!=undefined && square.STATUS_TEXT!="") ? square.STATUS_TEXT.replace(/\&lt\;br\&gt\;/g,'<br>') : (this.squares[index].textStatus!=undefined) ? this.squares[index].textStatus : "";
    this.squares[index].fundGroup = (square.FUND_GROUP_NAME!==undefined)? square.FUND_GROUP_NAME: (this.squares[index].fundGroup!=undefined) ? this.squares[index].fundGroup : "";
    this.squares[index].priceGroup = (square.PRICE_GROUP_NAME!==undefined)?square.PRICE_GROUP_NAME: (this.squares[index].priceGroup!=undefined) ? this.squares[index].priceGroup : "";
    this.squares[index].blocked = (square.BLOCK_COLOR!==undefined)? square.BLOCK_COLOR: this.squares[index].blocked;
    this.squares[index].color0 = (square.COLOR!=undefined && square.COLOR!="")?square.COLOR:this.squares[index].color0;
    this.squares[index].layer_id = square.HALL_SCHEME_LAYER_ID || this.squares[index].layer_id;
    this.squares[index].object_id = square.HALL_SCHEME_OBJECT_ID || this.squares[index].object_id;
    this.squares[index].comment = square.PLACE_COMMENT || this.squares[index].comment;
    this.squares[index].colorShadow ="#c6c2c2";
    this.squares[index].colorSelected = "#FF0000";

    var color = +this.squares[index].color0.replace("#","0x");
    if (color>+"0x8b5742")
        this.squares[index].textColor = "#000";
    else
        this.squares[index].textColor = "#fff";

    delete this.squares[index].lighted;


    this.drawOneSquare(index);
};
Map1.prototype.updateSquares = function(data,callback){
    if (typeof data!=="object") return;
    if (typeof callback!=="function") callback=function(){};
    function getIndexFieldName(){
        var arr = ["FUND_ZONE_ITEM_ID","PRICE_ZONE_ITEM_ID","HALL_SCHEME_ITEM_ID","ACTION_SCHEME_ID","ID"];
        for (var k in arr){
            if (data[0][arr[k]]!==undefined) return arr[k];
        }
        return false;
    }
    var indexName =  getIndexFieldName();
    if (!indexName) return;

    for (var k in data) {
        this.updateSquare(data[k],indexName);
    }
    //this.render();
    return callback();
};

Map1.prototype.squaresCount= function(){
    var counter = 0;
    for (var k in this.squares){
        counter++;
    }
    return counter;
};

Map1.prototype.removeSquares = function(ids,callback){
    if (typeof ids!=="object"){
        ids = [ids];
    }
    for (var i in ids){
        delete this.squares[+ids[i]];
    }

    var self = this;
    /*function clearEmpty(){
        for (var k in self.squares){
            if(self.squares[i] === undefined){
                self.selection.splice(i,1);
                clearEmpty();
            }
        }
    }
    clearEmpty();*/
    if (typeof callback=="function")
        callback();
    else
        this.render();
    this.container.trigger('removeSquares');
};


/**
 * Функция находит минимальные и максимальные значения X,Y для элементов отрисовываемых на схеме
 * this.squares = []
 * this.labels = []
 * @param callback
 * @return {*}
 */
Map1.prototype.setMinMax = function(callback){
    if (typeof callback!=="function") callback=function(){};

    var tmX,tmY;
    var squares = this.squares;
    if (typeof squares[squares.length-1] === "object"){
        this.squareWH = squares[squares.length-1].w || 40;
    }
    if (typeof squares==="object"){
        for (var k in squares){
            tmX = +squares[k].x;
            tmY = +squares[k].y;
            if (this.maxX<tmX) this.maxX = tmX;
            if (this.maxY<tmY) this.maxY = tmY;
            if (this.minX>tmX) this.minX = tmX;
            if (this.minY>tmY) this.minY = tmY;
        }
    }
    var labels = this.labels;
    if (typeof labels==="object"){
        for (var i in labels){
            tmX = +labels[i].x;
            tmY = +labels[i].y;
            if (this.maxX<tmX) this.maxX = tmX;
            if (this.maxY<tmY) this.maxY = tmY;
            if (this.minX>tmX) this.minX = tmX;
            if (this.minY>tmY) this.minY = tmY;
        }
    }
    return callback();

};
Map1.prototype.setScaleCoff = function(callback){
    if (typeof callback!=="function") callback=function(){};

    var bw = this.cWidth;
    var bh = this.cHeight;

    this.XCoeff =  0;
    this.YCoeff = 0;

    var w = Math.abs(this.maxX-this.minX)+this.squareWH;//+bw*2/10;
    var h = Math.abs(this.maxY-this.minY)+this.squareWH;//+bh*2/10;

   /* if (w/bh < h/bh) {
        if (bw < w) {
            this.scaleCoeff = (bw - 4 * this.squareWH) / w;
            this.startScaleCoeff = (bw - 4 * this.squareWH) / w;
        } else {
            this.scaleCoeff = (w - 4 * this.squareWH) / bw;
            this.startScaleCoeff = (w - 4 * this.squareWH) / bw;
        }
    } else {
        if (bh < h) {
            this.scaleCoeff = (bh - 4 * this.squareWH) / h;
            this.startScaleCoeff = (bh - 4 * this.squareWH) / h;
        } else {
            this.scaleCoeff = (h - 4 * this.squareWH) / bh;
            this.startScaleCoeff = (h - 4 * this.squareWH) / bh;
        }
    }*/
    var minusScale;
    if (w/bw > h/bh) {
        if (bw < w) {
            this.scaleCoeff = bw / w;
        } else {
            this.scaleCoeff = w / bw;
        }

        //this.scaleCoeff = bw / w;


        minusScale =  4 * this.squareWH / w;

    } else {
        if (bh < h) {
            this.scaleCoeff = bh / h;
        } else {
            this.scaleCoeff = h / bh;
        }


        //this.scaleCoeff = bh / h;

        minusScale =  4 * this.squareWH / h;
    }
    minusScale = 0.02;

    this.scaleCoeff -= minusScale;
    this.startScaleCoeff = this.scaleCoeff;
    /*var dx = Math.abs(this.maxX+this.squareWH - this.minX);
    var dy = Math.abs(this.maxY+this.squareWH - this.minY);*/
    var dx = Math.abs(this.maxX - this.minX)+this.squareWH;
    var dy = Math.abs(this.maxY - this.minY)+this.squareWH-450;
/*
    this.XCoeff =  (bw-(dx-this.minX*this.scaleCoeff))/2;
    this.YCoeff = (bh-(dy - this.minY*this.scaleCoeff))/2;*/
    /*this.XCoeff =  this.minX*this.scaleCoeff/2;
    this.YCoeff = this.minY*this.scaleCoeff/2;

*/

    this.XCoeff = -this.minX*this.scaleCoeff+(bw-dx*this.scaleCoeff)/2;
    this.YCoeff = -this.minY*this.scaleCoeff+(bh-dy*this.scaleCoeff)/2;
    //this.YCoeff = (bh-dy*this.scaleCoeff)/2;



    if (this.scaleCoeff<=0){
        this.scaleCoeff = 0.3;
        this.startScaleCoeff = 0.3;
        this.XCoeff =  0;
        this.YCoeff = 0;
    }

    // Вычисляем ориентацию навигатора

    var bw2 = this.navWideSide;
    var bh2 = this.navNarrowSide;

   /* if (dx<dy){
        bw2 = this.navNarrowSide;
        bh2 = this.navWideSide;
    }*/
    this.zoom_container.width(bw2);
    this.zoom_container.height(bh2);



    var coef1 = bw2/dx;
    var coef2 = bh2/dy;

    if (coef1>=coef2){
        this.scaleCoeff2 = coef2;
        this.XCoeff2 = (bw2-dx*this.scaleCoeff2)/2;

    }else{
        this.scaleCoeff2 = coef1;
        this.YCoeff2 = (bh2-dy*this.scaleCoeff2)/2;
    }
    return callback();


};
Map1.prototype.addToSelection = function(ids,noDraw,callback){

    if (typeof ids!=="object"){
        ids = [ids];
    }
    if (this.selectionLimit!=-1 && this.countSelection()>=this.selectionLimit){
        this.container.trigger("selectionLimit",[this.selectionLimit]);
        return;
    }
    for (var i in ids){
        var id = +ids[i];
        if ($.inArray(id,this.selection)!=-1 || (+this.squares[id].status==0 && this.mode!=="editor")) continue;
        this.selection.push(id);
        this.squares[id].lighted = true;
        if (!noDraw)
            this.drawOneSquare(id);
    }
    this.container.trigger('addToSelection',[this.selection]);
    if (typeof callback=="function"){
        callback();
    }


};
Map1.prototype.addToSelectionArray = function(arr,clearSelection,callback){
    var self = this;
    if (typeof arr!=="object") return;
    if (clearSelection) {
        this.clearSelection(true);
        //mapEditor_map.render();
    }
    this.addToSelection(arr,true,function(){
        if (typeof callback=="function")
            callback();
        else
            self.render();
    });
};
Map1.prototype.removeFromSelection = function(ids,noDraw,callback){

    if (typeof ids!=="object"){
        ids = [ids];
    }
    for (var i in ids){
        var id = +ids[i];
        var index = $.inArray(id,this.selection);
        delete this.selection[index];
        if (this.squares[id]!==undefined){
            delete this.squares[id].lighted;
        }
        if (!noDraw)
            this.drawOneSquare(id);
    }

    var self = this;
    function clearEmpty(){
        for(var i=0; i< self.selection.length; i++){
            if(self.selection[i] === undefined){
                self.selection.splice(i,1);
                clearEmpty();
            }
        }
    }
    clearEmpty();
    if (typeof callback=="function")
        callback();
    //this.render();
    this.container.trigger('removeFromSelection',[this.selection]);
};

Map1.prototype.clearSelection = function(unlight){
    if (unlight!==undefined)
        for (var k in this.selection)
            delete this.squares[this.selection[k]].lighted;
    this.selection = [];
    this.container.trigger('clearSelection',[this.selection]);
};
Map1.prototype.countSelection = function(){
    var count = 0;
    for (var k in this.selection){
        count++;
    }
    return count;
};
Map1.prototype.getBlocked = function(){
    this.blockedArray = [];
    for (var k in this.squares){
        if (+this.squares[k].blocked!==0){
            this.blockedArray.push(k);
        }
    }
    return this.blockedArray;
};



Map1.prototype.zoomToPoint = function(x,y){
    if (x==undefined){
        x = this.toPointX;
        y = this.toPointY;
    }
    this.toPointX = x;
    this.toPointY = y;
    var dX = (x-this.XCoeff2)*this.scaleCoeff/(this.scaleCoeff2)-this.cWidth/2;
    var dY = (y-this.YCoeff2)*this.scaleCoeff/(this.scaleCoeff2)-this.cHeight/2;
    this.XCoeff = -dX;
    this.YCoeff = -dY;
};


/***    Рендер (View)       ***/
Map1.prototype.canvasRadiusFill = function(x, y, w, h, tl, tr, br, bl,color){
    var r = x + w,
        b = y + h;

    this.ctx.beginPath();
    this.ctx.moveTo(x+tl, y);
    this.ctx.lineTo(r-(tr), y);
    this.ctx.quadraticCurveTo(r, y, r, y+tr);
    this.ctx.lineTo(r, b-br);
    this.ctx.quadraticCurveTo(r, b, r-br, b);
    this.ctx.lineTo(x+bl, b);
    this.ctx.quadraticCurveTo(x, b, x, b-bl);
    this.ctx.lineTo(x, y+tl);
    this.ctx.quadraticCurveTo(x, y, x+tl, y);
    if (this.ctx.fillStyle!=color) this.ctx.fillStyle = color;
    this.ctx.fill();

};
Map1.prototype.canvasRadiusStroke = function(x, y, w, h, tl, tr, br, bl,color){
    var r = x + w,
        b = y + h;

    this.ctx.beginPath();
    this.ctx.moveTo(x+tl, y);
    this.ctx.lineTo(r-(tr), y);
    this.ctx.quadraticCurveTo(r, y, r, y+tr);
    this.ctx.lineTo(r, b-br);
    this.ctx.quadraticCurveTo(r, b, r-br, b);
    this.ctx.lineTo(x+bl, b);
    this.ctx.quadraticCurveTo(x, b, x, b-bl);
    this.ctx.lineTo(x, y+tl);
    this.ctx.quadraticCurveTo(x, y, x+tl, y);
    if (this.ctx.strokeStyle!=color) this.ctx.strokeStyle = color;
    this.ctx.stroke();

};
Map1.prototype.drawOneSquare = function(key,callback){
    if (typeof callback!=="function") callback=function(){};
    var wh = this.squareWH;
    var cw = this.cWidth;
    var ch = this.cHeight;
    var x = Math.round((this.squares[key].x)*this.scaleCoeff+this.XCoeff);
    var y = Math.round((this.squares[key].y)*this.scaleCoeff+this.YCoeff);
    var w = +this.squares[key].w;
    var h = +this.squares[key].h;
    var scaledW = Math.round(w*this.scaleCoeff);
    var scaledH = Math.round(h*this.scaleCoeff);

    if (x<0 || y<0 || x>cw-(cw*2/100) || y>ch-(ch*2/100))
        return;

    var color = this.squares[key].color0;
    if (this.squares[key].lighted!=undefined){
        color = this.squares[key].colorSelected;

    }
    var textColor = (this.squares[key].lighted) ? "#F00" : this.squares[key].textColor;
    var innerFill = (this.squares[key].lighted_now && this.mode === "iFrame")? color : '#FFFFFF'; //changed by aig



    if ((this.mode=="casher" && this.squares[key].status==1 && this.squares[key].blocked==0) || (this.mode=="client_screen") && !this.squares[key].lighted && this.squares[key].status==1){

        /*if(this.squares[key].lighted_now){         //changed by aig
            color = '#b5ec21';                     //changed by aig
        }  */
                                             //changed by aig



            this.canvasRadiusFill(x+(scaledW/60),y+(scaledH/40),scaledW,scaledH,
                Math.round(w/10*this.scaleCoeff),
                Math.round(w/10*this.scaleCoeff),
                Math.round(w/10*this.scaleCoeff),
                Math.round(w/10*this.scaleCoeff),
                color);
        //if (!this.moving)
        this.canvasRadiusFill(x+(scaledW/10),y+(scaledH/10),scaledW-(scaledW/5),scaledH-(scaledH/5),
            Math.round(w/10*this.scaleCoeff),
            Math.round(w/10*this.scaleCoeff),
            Math.round(w/10*this.scaleCoeff),
            Math.round(w/10*this.scaleCoeff),
            innerFill); //changed by aig    was "#FFFFFF"
        textColor = "#000";
        //textColor = (this.squares[key].lighted_now)? '#000000': '#000000';

    }else{

        var innerFill2 = color;

        //if(!this.squares[key].lighted && this.squares[key].status==1 && this.squares[key].blocked==0){
        if(!this.squares[key].lighted && this.squares[key].status==1 && this.squares[key].blocked==0){
            innerFill2 = (!this.squares[key].lighted_now)? color : '#FFFFFF'; //changed by aig;
        }

        if (!this.moving)
            this.canvasRadiusFill(x+(scaledW/60),y+(scaledH/40),scaledW,scaledH,
                Math.round(w/10*this.scaleCoeff),
                Math.round(w/10*this.scaleCoeff),
                Math.round(w/10*this.scaleCoeff),
                Math.round(w/10*this.scaleCoeff),
                this.squares[key].colorShadow);

        this.canvasRadiusFill(x,y,scaledW,scaledH,
            Math.round(w/10*this.scaleCoeff),
            Math.round(w/10*this.scaleCoeff),
            Math.round(w/10*this.scaleCoeff),
            Math.round(w/10*this.scaleCoeff),
            innerFill2);
    }



    if (!this.moving){

        if (this.ctx.font != "normal "+Math.round((w/2)*this.scaleCoeff)+"px 'Open Sans'"){

            if (this.mode=="casher" || this.mode=="client_screen" || this.mode=="iFrame") {
                this.ctx.font = "normal " + Math.round((w*0.7) * this.scaleCoeff) + "px 'Open Sans'";
            }else{
                this.ctx.font = "normal " + Math.round((w/2) * this.scaleCoeff) + "px 'Open Sans'";
            }
        }


        if (this.ctx.fillStyle!=textColor)
            this.ctx.fillStyle = textColor;


        if(document.all && !document.addEventListener){
            if(typeof callback == 'function'){
                this.ctx.fillText(this.squares[key].place,x+((w-1.5*(w/2.3*0.9))*this.scaleCoeff),y+((h-h/15)*this.scaleCoeff));
                return callback();
            }
        }
        if (this.mode=="casher" || this.mode=="client_screen" || this.mode=="iFrame"){
            var pCount = this.squares[key].place.length;
            this.ctx.fillText(this.squares[key].place,x+((w/(w/10)+10-pCount*8)*this.scaleCoeff),y+((h/1.25)*this.scaleCoeff));
            return callback();
        }

        this.ctx.fillText(this.squares[key].line,x+((w/(w/4))*this.scaleCoeff),y+((h/2.1)*this.scaleCoeff));
        if (this.squares[key].place.length == 1){
            this.ctx.fillText(this.squares[key].place,x+((w-(w/3*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
        }else if (this.squares[key].place.length == 2){
            this.ctx.fillText(this.squares[key].place,x+((w-1.5*(w/2.3*0.9))*this.scaleCoeff),y+((h-h/15)*this.scaleCoeff));
        }else if (this.squares[key].place.length == 3){
            this.ctx.fillText(this.squares[key].place,x+((w-2.5*(w/2*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
        }

        /* this.ctx.fillText(this.squares[key].line,x+((w/(w/4))*this.scaleCoeff),y+((h/3)*this.scaleCoeff));
         if (this.squares[key].place.length == 1){
         this.ctx.fillText(this.squares[key].place,x+((w-(w/3*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
         }else if (this.squares[key].place.length == 2){
         this.ctx.fillText(this.squares[key].place,x+((w-1.5*(w/3*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
         }else if (this.squares[key].place.length == 3){
         this.ctx.fillText(this.squares[key].place,x+((w-2.5*(w/3*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
         }*/
    }
    return callback();
};
Map1.prototype.drawSquares = function(callback){
    if (typeof callback!=="function") callback=function(){};
    for (var key in this.squares){
        this.drawOneSquare(key);
    }
    return callback();
};
Map1.prototype.drawZoom = function(){
    if(this.moving) return;
    for (var key in this.squares){
        var x = (this.squares[key].x-this.minX)*this.scaleCoeff2+this.XCoeff2;
        var y = (this.squares[key].y-this.minY)*this.scaleCoeff2+this.YCoeff2;
        var w = this.squares[key].w;
        var h = this.squares[key].h;
        this.ctx2.fillStyle = this.squares[key].color0;
        this.ctx2.fillRect(x,y,w*this.scaleCoeff2,h*this.scaleCoeff2);
    }
};
Map1.prototype.drawSVG = function(object,callback){
    var context = this.ctx;
    var context2 = this.ctx2;
    var string = object.value;
    context.beginPath();
    context2.beginPath();
    var self = this;
    (function execCommand(){
        if (!string.match(/[A-Z]/)){
            context.strokeStyle=object.colorSelected;
            context.fillStyle=object.color2;
            context.fill();
            context.stroke();
            if (!self.moving){
                context2.strokeStyle=object.color1;
                context2.fillStyle=object.color2;
                context2.fill();
                context2.stroke();
            }
            if (typeof callback=="function")
                callback();

            return;
        }
        var letter = string.match(/[A-Z]/)[0];
        string = string.replace(/\s*[A-Z]/,"");
        //log(letter[0]);
        var coor = string.match(/[^A-Z]+/)[0];
        string = string.replace(/[^A-Z]+/,"");
        var coors = coor.split(" ");
        var coors2 = coor.split(" ");
        for (var k in coors){
            //coors[k] = +coors[k]*this.scaleCoeff;
            if (k%2==0){
                coors[k] = +coors[k]*self.scaleCoeff+self.XCoeff;
            }else{
                coors[k] = +coors[k]*self.scaleCoeff+self.YCoeff;
            }

        }
        for (var k2 in coors2){
            //coors[k] = +coors[k]*this.scaleCoeff;
            if (k2%2==0){
                coors2[k2] = +coors2[k2]*self.scaleCoeff2+self.XCoeff2;
            }else{
                coors2[k2] = +coors2[k2]*self.scaleCoeff2+self.YCoeff2;
            }
        }
        switch (letter){
            case "M":

                context.moveTo(coors[0],coors[1]);
                context2.moveTo(coors2[0],coors2[1]);
                break;
            case "L":
                context.lineTo(coors[0],coors[1]);
                context2.lineTo(coors2[0],coors2[1]);
                break;
            case "Q":
                context.quadraticCurveTo(coors[0],coors[1],coors[2],coors[3]);
                context2.quadraticCurveTo(coors2[0],coors2[1],coors2[2],coors2[3]);
                break;
            case "C":
                context.bezierCurveTo(coors[0],coors[1],coors[2],coors[3],coors[4],coors[5]);
                context2.bezierCurveTo(coors2[0],coors2[1],coors2[2],coors2[3],coors2[4],coors2[5]);
                break;
        }
        execCommand();
    })();

};


Map1.prototype.drawObjects = function(callback){
    var oldValues = {};
    oldValues.font = "normal 10pt 'Open Sans'";
    oldValues.fillStyle = "#000000";
    oldValues.strokeStyle = "#000000";

    if(document.all && !document.addEventListener){
        if(typeof callback == 'function'){
            callback();
        }
        return;
    }

    var items = this.renderList.items;
    var mode = this.mode.toLowerCase();
    for (var k in items){
        var obj = items[k].object;
        switch (obj.type){
            case 1: // BACKGROUND
                if (obj.loaded && obj.visibility['visible_'+mode]){
                    var x = +obj.x*this.scaleCoeff+this.XCoeff;
                    var y = +obj.y*this.scaleCoeff+this.YCoeff;
                    if (!obj.rotation){
                        this.ctx.drawImage(obj.value,x,y,obj.value.width*this.scaleCoeff*obj.scaleCoeff,obj.value.height*this.scaleCoeff*obj.scaleCoeff);
                    }else{
                        this.ctx.save();
                        //this.ctx.translate(x+obj.value.width*this.scaleCoeff*obj.scaleCoeff/2,y+obj.value.height*this.scaleCoeff*obj.scaleCoeff/2);
                        this.ctx.translate(x+obj.value.width*this.scaleCoeff*obj.scaleCoeff/2,y+obj.value.height*this.scaleCoeff*obj.scaleCoeff/2);
                        this.ctx.rotate(obj.rotation);
                        this.ctx.drawImage(obj.value,-obj.value.width*this.scaleCoeff*obj.scaleCoeff/2,-obj.value.height*this.scaleCoeff*obj.scaleCoeff/2,obj.value.width*this.scaleCoeff*obj.scaleCoeff,obj.value.height*this.scaleCoeff*obj.scaleCoeff);
                        this.ctx.restore();
                    }
                }
                break;
            case 2: // IMAGE
                if (obj.loaded && obj.visibility['visible_'+mode]){
                    var x = +obj.x*this.scaleCoeff+this.XCoeff;
                    var y = +obj.y*this.scaleCoeff+this.YCoeff;
                    if (!obj.rotation){
                        this.ctx.drawImage(obj.value,x,y,obj.value.width*this.scaleCoeff*obj.scaleCoeff,obj.value.height*this.scaleCoeff*obj.scaleCoeff);
                    }else{
                        this.ctx.save();
                        //this.ctx.translate(x+obj.value.width*this.scaleCoeff*obj.scaleCoeff/2,y+obj.value.height*this.scaleCoeff*obj.scaleCoeff/2);
                        this.ctx.translate(x+obj.value.width*this.scaleCoeff*obj.scaleCoeff/2,y+obj.value.height*this.scaleCoeff*obj.scaleCoeff/2);
                        this.ctx.rotate(obj.rotation);
                        this.ctx.drawImage(obj.value,-obj.value.width*this.scaleCoeff*obj.scaleCoeff/2,-obj.value.height*this.scaleCoeff*obj.scaleCoeff/2,obj.value.width*this.scaleCoeff*obj.scaleCoeff,obj.value.height*this.scaleCoeff*obj.scaleCoeff);
                        this.ctx.restore();
                    }
                }
                break;
            case 4: // LABELS
                if (obj.visibility['visible_'+mode]){
                    if (this.ctx.font != obj.fontStyle+" "+Math.round(obj.fontSize*this.scaleCoeff)+"px '"+obj.fontFamily+"'")
                        this.ctx.font =  obj.fontStyle+" "+Math.round(obj.fontSize*this.scaleCoeff)+"px '"+obj.fontFamily+"'";
                    if (this.ctx.fillStyle != obj.color)
                        this.ctx.fillStyle = obj.color;
                  /*  if (this.ctx.fillStyle!=textColor)
                        this.ctx.fillStyle = textColor;
*/                  var x = +obj.x*this.scaleCoeff+this.XCoeff;
                    var y = +obj.y*this.scaleCoeff+this.YCoeff;

                    if (!obj.rotation){
                        this.ctx.fillText(obj.value,x,y);
                    }else{
                        this.ctx.save();
                        this.ctx.translate(x,y);
                        this.ctx.rotate(obj.rotation);
                        this.ctx.fillText(obj.value,0,0);
                        this.ctx.restore();
                    }
                }
                break;
        }
    }
    if (typeof callback=="function")
        callback();



};


Map1.prototype.render = function(callback){
    if (typeof callback!=="function") callback=function(){};

    var mX = this.x*this.scaleCoeff;
    var mY = this.y*this.scaleCoeff;

    var cw = this.cWidth;
    var ch = this.cHeight;
    this.ctx.clearRect(0,0,cw,ch);
    if (!this.moving)
        this.ctx2.clearRect(0,0,cw,ch);

    var self = this;
    this.drawZoom();
    this.drawObjects(function(){
        self.drawSquares(function(){
            return callback();
        });
    });

    if (self.mode==="editor"){
        if (typeof self.specialObjects==="object"){
            self.drawSpecialObjects();
        }
    }



};


Map1.prototype.showStatus = function(status){
    this.hintState = true;
    var line_title = status.status_line_title || 'Ряд';
    var place_title = status.status_place_title || 'Место';

    if (typeof status != "object") return;
    if (status.status_area!=undefined && status.status_area!="")
        this.hint.children("#status_area").text(status.status_area);
    else
        this.hint.children("#status_area").text("");
    if (status.status_row!=undefined && status.status_row!="")
        this.hint.children("#status_row").text(line_title+": " + status.status_row);
    else
        this.hint.children("#status_row").text("");
    if (status.status_col!=undefined && status.status_col!="")
        this.hint.children("#status_col").text(place_title+": " + status.status_col);
    else
        this.hint.children("#status_col").text("");
    if (status.status_cost!=undefined && status.status_cost!="")
        this.hint.children("#status_cost").text("Цена: "+status.status_cost);
    else
        this.hint.children("#status_cost").text("");
    if (status.status_fund!=undefined && status.status_fund!="")
        this.hint.children("#status_fund").text("Фонд: "+status.status_fund);
    else
        this.hint.children("#status_fund").text("");
    if (status.status_price!=undefined && status.status_price!="")
        this.hint.children("#status_price").text("Пояс: "+status.status_price);
    else
        this.hint.children("#status_price").text("");
    if (status.status_status!=undefined && status.status_status!="")
        this.hint.children("#status_status").html(status.status_status);
    else
        this.hint.children("#status_status").text("");
    if (status.status_id!=undefined && status.status_id!="")
        this.hint.children("#status_id").text(status.status_id);
    else
        this.hint.children("#status_id").text("");

    if (this.hint.css('display')=='none' || +this.hint.css("opacity")<1)
        this.hint.stop(true,true).fadeIn(450);

};
Map1.prototype.hideControl = function(duration){
    var self = this;
    window.clearTimeout(this.hintTimer);
    this.hintTimer = window.setTimeout(function(){
        window.clearTimeout(self.hintTimer);
        if (!self.hintState){
            if (self.hint.length>0 && self.hint.css("display")!="none"){
                self.hint.stop(true,true).fadeOut(duration);
            }
            self.hintState = false;
        }
    },duration);
};
Map1.prototype.hideStatus = function(){
    if (arguments[0]!=undefined && !isNaN(+arguments[0])){
        this.hideControl(arguments[0]);
    }else{
        if (!this.hintState) return;
        this.hideControl(450);
    }
    this.hintState = false;
};
Map1.prototype.moveStatus = function(x,y){
    this.hint.css({top:y+"px",left:x+"px"});
};


/***    КОНЕЦ Рендер (View)        ***/

/**** Controller   *****/

Map1.prototype.fixEvent = function(e){

    // получить объект событие для IE
    e = e || window.event;
    var t = e.target || e.srcElement;
    //var l = $(t).parents(".modal-content-wrapper").length;
    var modal = $(t).parents(".modal-content-wrapper");
    // добавить pageX/pageY для IE
    if ( e.pageX == null && e.clientX != null ) {
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
Map1.prototype.mouseOnLayout = function(x,y){
    if (this.loading) return false;
    var w = this.layoutSquares[0].w;
    var h = this.layoutSquares[0].h;
    var key = (Math.floor(y  / h)* this.layoutVCount+Math.floor(x / w));
    if (key<0 || key>=this.layoutHCount*this.layoutVCount) return false;
    return key;
};
Map1.prototype.mouseOnElement = function(x,y){
    if (this.moving) return false;
    if (this.loading) return false;
    var square = this.mouseOnLayout(x,y);
    if (square!==false){
        var shapes = this.layoutSquares[square].shapes;
        if(document.all && !document.addEventListener){
            for(var key=0; key<shapes.length; key++){
                var x2 = this.squares[shapes[key]].x*this.scaleCoeff+this.XCoeff;
                var y2 = this.squares[shapes[key]].y*this.scaleCoeff+this.YCoeff;
                var wh = this.squareWH*this.scaleCoeff;
                if(x>=x2 && x<=+(x2+wh) && y>=+y2 && y<=+(y2+wh)){
                    return this.squares[shapes[key]].id;
                }
            }
        }else{
            for(var key in shapes){
                var x2 = this.squares[shapes[key]].x*this.scaleCoeff+this.XCoeff;
                var y2 = this.squares[shapes[key]].y*this.scaleCoeff+this.YCoeff;
                var wh = this.squareWH*this.scaleCoeff;
                if(x>=x2 && x<=+(x2+wh) && y>=+y2 && y<=+(y2+wh)){
                    return this.squares[shapes[key]].id;
                }
            }
        }

    }
    return false;
};
Map1.prototype.layoutInRect = function(x0,y0,w,h){
    var layouts = [];
    for (var key in this.layoutSquares){
        var xL = this.layoutSquares[key].x;
        var yL = this.layoutSquares[key].y;
        var wL = this.layoutSquares[key].w;
        var hL = this.layoutSquares[key].h;
        if (
            (xL>=x0 && yL>=y0 && xL<=x0+w && yL<=y0+h) ||
                (xL+wL>=x0 && yL>=y0 && xL+wL<=x0+w && yL<=y0+h) ||
                (xL+wL>=x0 && yL+hL>=y0 && xL+wL<=x0+w && yL+hL<=y0+h) ||
                (xL>=x0 && yL+hL>=y0 && xL<=x0+w && yL+hL<=y0+h) ||

                (x0>=xL && y0>=yL && x0<=xL+wL && y0<=yL+hL) ||
                (x0+w>=xL && y0>=yL && x0+w<=xL+wL && y0<=yL+hL) ||
                (x0+w>=xL && y0+h>=yL && x0+w<=xL+wL && y0+h<=yL+hL) ||
                (x0>=xL && y0+h>=yL && x0<=xL+wL && y0+h<=yL+hL)

            )
        {
            layouts.push(key);
        }
    }
    return layouts;
};
Map1.prototype.squaresInRect = function(x0,y0,w,h){
    var squares = [];
    var layouts = this.layoutInRect(x0,y0,w,h);
    for (var key1 in layouts){
        var arr2 = this.layoutSquares[layouts[key1]].shapes;//.squares;
        for (var key2 in arr2){
            var xL = this.squares[arr2[key2]].x*this.scaleCoeff+this.XCoeff;
            var yL = this.squares[arr2[key2]].y*this.scaleCoeff+this.YCoeff;
            var wL = this.squareWH*this.scaleCoeff;
            var hL = this.squareWH*this.scaleCoeff;
            if (
                (xL>=x0 && yL>=y0 && xL<=x0+w && yL<=y0+h) &&
                    (xL+wL>=x0 && yL>=y0 && xL+wL<=x0+w && yL<=y0+h) &&
                    (xL+wL>=x0 && yL+hL>=y0 && xL+wL<=x0+w && yL+hL<=y0+h) &&
                    (xL>=x0 && yL+hL>=y0 && xL<=x0+w && yL+hL<=y0+h) /*&&

                    (x0>=xL && y0>=yL && x0<=xL+wL && y0<=yL+hL) &&
                    (x0+w>=xL && y0>=yL && x0+w<=xL+wL && y0<=yL+hL) &&
                    (x0+w>=xL && y0+h>=yL && x0+w<=xL+wL && y0+h<=yL+hL) &&
                    (x0>=xL && y0+h>=yL && x0<=xL+wL && y0+h<=yL+hL)*/

                )
            {
                if ($.inArray(arr2[key2],squares)==-1)
                    squares.push(arr2[key2]);
            }
        }
    }
    return squares;
};
/// Навешиваем события
Map1.prototype.setEvents = function(){
    var self = this;
    /****   Пользовательские события    ***/

    this.container.on("sendSelection",function(){
        if (self.selection.length==0) return;
        if (typeof self.sendSelection==="function"){
            self.sendSelection();
        }

    });

    //// HINT
    this.container.on("show_hint",function(e,square){
        if (typeof square!=="object") return;
        self.showStatus({
            status_area:square.areaGroup,
            status_row:square.line,
            status_col:square.place,
            status_cost:square.salePrice,
            status_fund:square.fundGroup,
            status_price:square.priceGroup,
            status_status:square.textStatus,
            status_id: square.id,
            status_line_title: square.line_title,
            status_place_title: square.status_place_title
        });
    });
    this.container.on("hide_hint",function(e,duration){
        self.hideStatus(duration);
        return false;
    });
    this.container.on("move_hint",function(e,x,y){
        self.moveStatus(x,y);
        return false;
    });
    /// КОНЕЦ HINT

    this.container.on("leave_container",function(e){
        self.mouseKey = 0;
        if (self.moving){
            window.setTimeout(function(){
                self.moving=false;
                self.render();
                self.reLoadLayout();
            },50);
        }

        self.oldMouseX = 0;
        self.oldMouseY = 0;
        self.selecting = -1;
        return false;
    });
    this.container.on("hint_map",function(e,x,y){
        var square_id = self.mouseOnElement(x,y);
        if (square_id)
            self.container.trigger("show_hint",[self.squares[square_id]]);
        else{
            self.container.trigger("hide_hint");
        }
        self.container.trigger("move_hint",[x+30,y+30]);
    });
    this.container.on("move_map",function(e,x,y){

        if (self.oldMouseX==0 || self.oldMouseY==0){
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
    this.container.on("move_to_point_map",function(e,x,y){
        self.zoomToPoint(x,y);
        self.render();
        self.reLoadLayout();
    });

    Map1.prototype.scrollControl = function(){
        if (self.timerForMouseWheel!=undefined) return;
        self.timerForMouseWheel = window.setInterval(function(){
            if (!self.mouseWheelFlag){
                window.clearInterval(self.timerForMouseWheel);
                self.timerForMouseWheel = undefined;
                self.moving = false;
                self.render();
                self.reLoadLayout();
                return;
            }
            self.mouseWheelFlag = false;
        },250);
    };
    this.container.on("scale_map",function(e,x,y,delta){
        self.scrollControl();
        self.mouseWheelFlag = true;
        self.moving = true;

        var cCoef = self.scaleCoeff.toFixed(6);
        step = 0.025;


        delta = (delta>0) ? 1 : -1;
        var balance = (cCoef%step).toFixed(6);
        if (balance==step) balance = 0;
        var oldscaleCoeff = self.scaleCoeff;
        if(delta>0){
            self.mouseWheelCounter++;
            if (balance>0) self.scaleCoeff-= balance;
            self.scaleCoeff +=step;

        }else{
            self.mouseWheelCounter--;
            if (balance>0) self.scaleCoeff += (step-balance);
            if (cCoef<=step) {
                self.moving = false;
                return false;
            }
            self.scaleCoeff -=step;

        }
        var boxWidth = self.cWidth;
        var boxHeight = self.cHeight;
        if (self.minX==Infinity){
            self.minX = 0;
            self.minY = 0;
            self.maxX = boxWidth;
            self.maxY = boxHeight;
        }
        var W = (Math.abs(self.maxX-self.minX)+self.squareWH);
        var H = (Math.abs(self.maxY-self.minY)+self.squareWH);
        var dx = 0;
        var dy = 0;

        if(delta!=0){
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

            dx =  (W*self.scaleCoeff- W*oldscaleCoeff)/2 + self.minX*self.scaleCoeff - self.minX*oldscaleCoeff + mouseX;
            dy =  (H*self.scaleCoeff- H*oldscaleCoeff)/2 + self.minY*self.scaleCoeff - self.minY*oldscaleCoeff + mouseY;
           /* console.log('delta!=0');
            var Ximg = (x - boxWidth/2)*W/boxWidth;
            var Yimg = (y - boxHeight/2)*H/boxHeight;
            dx = (W*step*delta/2) + Ximg*step*delta;
            dy = (H*step*delta/2)+ Yimg*step*delta;*/
        }else{
            console.log('delta==0');
            var  counter = (self.mouseWheelCounter>0) ?self.mouseWheelCounter:1;
            var Xd = (Math.abs(self.XCoeff-(boxWidth-W*self.scaleCoeff)/2))/counter;
            var Yd = (Math.abs(self.YCoeff-(boxHeight-H*self.scaleCoeff)/2))/counter;


            if (self.XCoeff>(boxWidth-W*self.scaleCoeff)/2) dx = +Xd;
            else dx = -Xd;
            if (self.YCoeff>(boxHeight-H*self.scaleCoeff)/2) dy = +Yd;
            else dy = -Yd;
        }
        self.XCoeff -= dx;
        self.YCoeff -= dy;
        self.render();

    });
    this.container.on("select_stop",function(e,x,y,callback){
        self.selector.selectStop(x,y,function(x0,y0,w,h){
                var squares = self.squaresInRect(x0,y0,w,h);
                if (squares.length==0) return;
                if (self.selector.type=="add"){
                    self.addToSelectionArray(squares);
                    /*for (var k in squares){
                        self.addToSelection(squares[k]);
                    }*/
                }else{
                    self.removeFromSelection(squares);
                   /* for (var k in squares){
                        self.removeFromSelection(squares[k]);
                    }*/
                }

                if (typeof callback=="function")
                    callback();

            }
        );
        //self.shi

    });

    this.container.on("squares_select",function(e,x,y,onlyOne){
        /*if (self.moving) return;*/
        self.selecting = 1;
        var square = self.mouseOnElement(x, y);
        if (square){
            if (+self.squares[square].status==0 && self.mode!=="editor") return;
            if (onlyOne){

                if ($.inArray(+square,self.selection)!=-1)
                    self.removeFromSelection(square);
                else
                    self.addToSelection(square);

                return;
            }
            self.addToSelection(square);
        }
    });

    this.container.on("squares_deselect",function(e,x,y){
        /*if (self.moving) return;*/
        self.selecting = 1;
        var square = self.mouseOnElement(x, y);
        if (square){
            if (+self.squares[square].status==0 && self.mode!=="editor") return;
            self.removeFromSelection(square);
        }
    });

    /****  КОНЕЦ Пользовательские события    ***/



    /**** Системные события   ****/
    this.container.on("contextmenu",function(e){
        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;
        switch (self.mode){
            case "casher":
                self.container.trigger("myContextMenu",[x,y]);
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
    $(".modal-open").bind("contextmenu",function(e){
        return false;
    });



    this.container.on("mousewheel",function(e,delta){

        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;
        self.container.trigger("scale_map",[x,y,delta]);


        return false;

    });
    this.container.on('dblclick',function(e){
        //self.reLoad();
    });

    this.container.on("click",function(e){
        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;
        //self.mouseKey = e.which;

        switch (e.which){
            case 1:    /// левая кнопка мыши
                switch (self.shiftState){
                    case 16:
                        switch (self.mode){
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
                        switch (self.mode){
                            case "casher":
                                break;
                            case "admin":
                                break;
                            case "editor":
                                break;
                            case "iFrame":

                                self.container.trigger("squares_select",[x,y,true]);
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
                switch (self.shiftState){
                    case 16:
                        switch (self.mode){
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
                        switch (self.mode){
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

        return false;
    });


    this.container.on("mouseup",function(e){
        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;

        switch (self.mouseKey){
            case 1:    /// левая кнопка мыши
                switch (self.shiftState){
                    case 16:
                        switch (self.mode){
                            case "casher":
                                self.container.trigger("select_stop",[x, y, function(){
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "admin":
                                self.container.trigger("select_stop",[x, y, function(){
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "editor":
                                self.container.trigger("select_stop",[x, y, function(){
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
                        switch (self.mode){
                            case "casher":
                                break;
                            case "admin":
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
                        switch (self.mode){
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
                switch (self.shiftState){
                    case 16:
                        switch (self.mode){
                            case "casher":
                                self.container.trigger("select_stop",[x, y, function(){
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "admin":
                                self.container.trigger("select_stop",[x, y, function(){
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "editor":
                                self.container.trigger("mouseup_3_16",[x, y]);
                                self.container.trigger("select_stop",[x, y, function(){}]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    default:
                        if (self.moving) return;
                        switch (self.mode){
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
                switch (self.mode){
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



    this.container.on("mousedown",function(e){
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

        switch (self.mouseKey){
            case 1:    /// левая кнопка мыши
                switch (self.shiftState){
                    case 16:
                        switch (self.mode){
                            case "casher":
                                self.selector.selectStart(x,y);
                                break;
                            case "admin":
                                self.selector.selectStart(x,y);
                                break;
                            case "editor":
                                self.selector.selectStart(x,y);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    case 17:
                        switch (self.mode){
                            case "casher":
                                break;
                            case "admin":
                                break;
                            case "editor":
                                self.container.trigger("mousedown_1_17",[x,y]);

                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    default:
                        if (self.moving) return;
                        switch (self.mode){
                            case "casher":
                                self.container.trigger("squares_select",[x,y]);
                                break;
                            case "admin":
                                self.container.trigger("squares_select",[x,y]);
                                break;
                            case "editor":

                                self.container.trigger("mousedown_1_",[x,y]);
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
                switch (self.shiftState){
                    case 16:
                        switch (self.mode){
                            case "casher":
                                self.selector.selectStart(x,y);
                                break;
                            case "admin":
                                self.selector.selectStart(x,y);
                                break;
                            case "editor":
                                self.selector.selectStart(x,y,'remove');
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    default:
                        if (self.moving) return;
                        switch (self.mode){
                            case "casher":
                                self.container.trigger("squares_select",[x,y]);
                                break;
                            case "admin":
                                self.container.trigger("squares_select",[x,y]);
                                break;
                            case "editor":
                                self.container.trigger("mousedown_3_",[x,y]);
                                //
                                break;
                            case "iFrame":
                                self.container.trigger("squares_deselect",[x,y]);
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


    this.container.on("mousemove",function(e){
        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;
        if (self.mousemovingFirst){
            self.container.trigger("hide_hint",10);
            self.mousemovingFirst = false;
        }
        /**** ******/
        switch (self.mouseKey){
            case 1:
                switch (self.shiftState){
                    case 32:
                        switch (self.mode){
                            case "casher":
                                self.container.trigger("move_map",[x,y]);
                                break;
                            case "admin":
                                self.container.trigger("move_map",[x,y]);
                                break;
                            case "editor":
                                self.container.trigger("mousemove_1_32",[x,y]);
                                break;
                            case "iFrame":

                                break;
                            case "client_screen":
                                break;
                        }
                        break;
                    case 17:
                        switch (self.mode){
                            case "casher":
                                break;
                            case "admin":
                                break;
                            case "editor":
                                self.container.trigger("mousemove_1_17",[x,y]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }
                        break;
                    case 16:
                        switch (self.mode){
                            case "casher":
                                break;
                            case "admin":
                                break;
                            case "editor":
                                self.container.trigger("mousemove_1_16",[x,y]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        self.selecting = 1;
                        self.selector.selectMove(x,y);
                        break;
                    default:
                        switch (self.mode){
                            case "casher":
                                self.container.trigger("squares_select",[x,y]);
                                break;
                            case "admin":
                                self.container.trigger("squares_select",[x,y]);
                                break;
                            case "editor":
                                self.container.trigger("mousemove_1_",[x,y]);
                                break;
                            case "iFrame":
                                self.container.trigger("move_map",[x,y]);
                                break;
                            case "client_screen":
                                break;
                        }
                        break;
                }
                break;
            case 2:
                switch (self.shiftState){
                    default:
                        switch (self.mode){
                            case "casher":
                                self.container.trigger("move_map",[x,y]);
                                break;
                            case "admin":
                                self.container.trigger("move_map",[x,y]);
                                break;
                            case "editor":
                                self.container.trigger("move_map",[x,y]);
                                break;
                            case "iFrame":

                                break;
                            case "client_screen":
                                self.container.trigger("move_map",[x,y]);
                                break;
                        }

                        break;
                }

                break;
            case 3:
                switch (self.shiftState){
                    case 32:
                        switch (self.mode){
                            case "casher":
                                self.container.trigger("move_map",[x,y]);
                                break;
                            case "admin":
                                self.container.trigger("move_map",[x,y]);
                                break;
                            case "editor":
                                self.container.trigger("mousemove_3_32",[x,y]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }
                        break;
                    case 16:
                        switch (self.mode){
                            case "casher":
                                break;
                            case "admin":
                                break;
                            case "editor":
                                self.container.trigger("mousemove_3_16",[x,y]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        self.selecting = 1;
                        self.selector.selectMove(x,y);
                        break;
                    default:
                        switch (self.mode){
                            case "casher":
                                self.container.trigger("squares_select",[x,y]);
                                break;
                            case "admin":
                                self.container.trigger("squares_select",[x,y]);
                                break;
                            case "editor":
                                self.container.trigger("mousemove_3_",[x,y]);
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
                switch (self.shiftState){
                    case 32:
                        break;
                    case 13:
                        break;
                    default:
                        self.container.trigger("hint_map",[x,y]);
                        break;
                }
                break;
        }


        /**** ******/


        return false;


    });
    this.container.on("mouseout",function(e){
        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;
        switch (self.mouseKey) {
            case 1:
                switch (self.shiftState){
                    case 16:
                        switch (self.mode){
                            case "casher":
                                self.container.trigger("select_stop",[x, y,  function(){
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "admin":
                                self.container.trigger("select_stop",[x, y,  function(){
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "editor":
                                self.container.trigger("select_stop",[x, y,  function(){

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
                switch (self.shiftState){
                    case 16:
                        switch (self.mode){
                            case "casher":
                                self.container.trigger("select_stop",[x, y,  function(){
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "admin":
                                self.container.trigger("select_stop",[x, y,  function(){
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "editor":
                                self.container.trigger("select_stop",[x, y,  function(){
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
        self.container.trigger("hide_hint",10);
        self.container.trigger("leave_container");
        self.mousemovingFirst = true;
        return false;
    });
    this.zoom_container.on("click",function(e){
        e = self.fixEvent(e);
        var x = e.pageX;
        var y = e.pageY;
        self.container.trigger("move_to_point_map",[x,y]);
        return false;
    });
    this.zoom_container.on("mousedown",function(e){
        return false;
    });
    this.zoom_container.on("mouseup",function(e){
        return false;
    });
    this.zoom_container.on("mousemove",function(e){
        return false;
    });
    this.zoom_container.on("mouseenter",function(e){
        self.container.trigger("hide_hint",10);

        self.container.trigger("leave_container");
        self.mousemovingFirst = true;
        return false;
    });
    this.container.on("mouseenter",function(e){
        self.container.attr("tabindex","1").focus();
        return false;
    });

    this.container.on("keydown",function(e){
        if (e.which>=37 && e.which<=40){
            return;
        }
        if (e.which==123){
            self.shiftState = 0;
            return;
        }
        //if (e.which==self.shiftState && self.shiftState!=0) return;
        self.shiftState = e.which;
        //console.log(self.shiftState);
    });
    this.container.on("keyup",function(e){
        switch (self.mouseKey){
            case 1:    /// левая кнопка мыши
                switch (self.shiftState){
                    case 16:
                        switch (self.mode){
                            case "casher":
                                self.container.trigger("select_stop",[undefined, undefined, function(){}]);
                                break;
                            case "admin":
                                self.container.trigger("select_stop",[undefined, undefined, function(){}]);
                                break;
                            case "editor":
                                self.container.trigger("select_stop",[undefined, undefined, function(){}]);
                                break;
                            case "iFrame":
                                break;
                            case "client_screen":
                                break;
                        }

                        break;
                    case 17:
                        switch (self.mode){
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
                        switch (self.mode){
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
                switch (self.shiftState){
                    case 16:
                        switch (self.mode){
                            case "casher":
                                self.container.trigger("select_stop",[undefined, undefined, function(){}]);
                                break;
                            case "admin":
                                self.container.trigger("select_stop",[undefined, undefined, function(){}]);
                                break;
                            case "editor":
                                self.container.trigger("select_stop",[undefined, undefined, function(){}]);
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
                        switch (self.mode){
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
       /* if (self.shiftState==e.which) self.shiftState = 0;
        else{
            self.shiftState = e.which;
        }*/


    });
    $(document).on('keyup',function(e){
        if (e.which>=37 && e.which<=40){
            return;
        }
        self.shiftState = 0;
    });

    /**** КОНЕЦ Системные события   ****/
};






/**** КОНЕЦ  Controller   *****/

