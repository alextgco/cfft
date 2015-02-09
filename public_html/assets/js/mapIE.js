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
    this.container = params.container || function(){
        $("body").append("<div id='box_for_map'></div>");
        return $("#box_for_map");
    };
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
    this.navWideSide = params.navWideSide || 200;
    this.navNarrowSide = params.navNarrowSide || 110;
    this.minX = 0;
    this.maxX = params.cWidth || this.container.width();
    this.maxY = params.cHeight || this.container.height();
    this.minY = 0;
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
    this.IEmode = (params.IEmode)?params.IEmode:false;





    /*log("cWidth:");
     log(this.cWidth);*/
    /*var style1 = '';
    if (document.all && !document.querySelector)*/
        var style1 =  'style="background-color: #ccc;"';

    map.container.css({width:map.containerWidth+"px",height:map.containercHeight+"px"}).html('<div style="height:'+map.cHeight+'px; width:'+map.cWidth+'px;" id="canvas1"></div>' +
        '<div id="topHint"'+style1+'>' +
        '<span id="status_area"></span>' +
        '<span id="status_row"></span>' +
        '<span id="status_col"></span>' +
        '<span id="status_cost"></span>' +
        '<span id="status_fund"></span>' +
        '<span id="status_price"></span>' +
        '<span id="status_status"></span>' +
        '<span id="status_id"></span>' +
        '</div>'
    );
    map.canvas1 =  map.container.children("#canvas1");
    map.hint = map.container.children("#topHint");

    if (typeof Selector === "function")
        map.selector = new Selector({
            parentBox:map.container,
            zIndex:102
        });

    // })();



};




Map1.prototype.openSocket = function(params,callback){
    if (typeof callback!=="function") callback=function(){};
    var self = this;
    var room = params.type+"_"+params.param+"_"+params.id;
    socket.emit('mapConnection', params);
    socket.on(room+"_callback",function(data,return_type){
        switch(return_type){
            case "places":
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
    socket.on(room+"_callbackFull",function(data){
        if (typeof self.sendSelectionCallbackFull === "function") self.sendSelectionCallbackFull();
    });


    socket.on(room+"_get_callback_layers",function(obj){
        //this.loadObjects()
        //mapEditor_map.container.trigger('getObject_callback',[obj]);
    });




    this.toSocket = function(obj){
        socket.emit(room,obj);
    };
    socket.on("disconnect",function(){
        log("socket was disconnected");
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
    switch (this.mode){
        case "iFrame":
            var path = object.path || "../";
            break;
        default:
            var path = object.path || "";
            break;
    }

    var image = new Image();
    image.onload = function(){
        if (typeof callback=="function")
            callback(image,object.id);
    };
    image.src = this.doc_root+path+name;
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
        var s = "";
        //data = JSON.parse(data);
        eval("var data = "+data);
        var DATA = jsonToObj(data['results'][0]);
        self.squares = [];
        for (var k in DATA){
            var index =  DATA[k].FUND_ZONE_ITEM_ID || DATA[k].PRICE_ZONE_ITEM_ID || DATA[k].HALL_SCHEME_ITEM_ID || DATA[k].ACTION_SCHEME_ID || DATA[k].ID;
            self.squares[index] = {};
            self.squares[index].id = index;
            self.squares[index].areaGroup = DATA[k].AREA_GROUP_NAME;
            self.squares[index].x = +DATA[k].X;
            self.squares[index].y = +DATA[k].Y;
            self.squares[index].w = (DATA[k].W!="" && DATA[k].W!=undefined)? +DATA[k].W : 40;
            self.squares[index].h = (DATA[k].H!="" && DATA[k].H!=undefined)? +DATA[k].H : 40;
            self.squares[index].line = String(DATA[k].LINE);
            self.squares[index].line_title = (String(DATA[k].LINE_TITLE)!==undefined)?String(DATA[k].LINE_TITLE):"Ряд";
            self.squares[index].place = String(DATA[k].PLACE);
            self.squares[index].place_title = (String(DATA[k].PLACE_TITLE)!==undefined)?String(DATA[k].PLACE_TITLE):"Место";
            self.squares[index].salePrice = (DATA[k].PRICE!=undefined) ? DATA[k].PRICE : "";
            self.squares[index].status = (DATA[k].STATUS!=undefined && DATA[k].STATUS!="") ? DATA[k].STATUS : 1;
            self.squares[index].textStatus = (DATA[k].STATUS_TEXT!=undefined && DATA[k].STATUS_TEXT!="") ? DATA[k].STATUS_TEXT : "";
            self.squares[index].fundGroup = DATA[k].FUND_GROUP_NAME;
            /*self.squares[index].fundGroupId = DATA[k].FUND_GROUP_ID;*/
            self.squares[index].priceGroup = DATA[k].PRICE_GROUP_NAME;
            self.squares[index].blocked = DATA[k].BLOCK_COLOR;
            self.squares[index].layer_id = DATA[k].HALL_SCHEME_LAYER_ID || "";
            self.squares[index].object_id = DATA[k].HALL_SCHEME_OBJECT_ID || "";
            self.squares[index].color0 = (DATA[k].COLOR!=undefined && DATA[k].COLOR!="")?DATA[k].COLOR:"#c1c1c1";
            self.squares[index].colorShadow ="#c6c2c2";
            self.squares[index].colorSelected = "#FF0000";
            var color = +self.squares[index].color0.replace("#","0x");
            if (color>+"0x8b5742")
                self.squares[index].textColor = "#000";
            else
                self.squares[index].textColor = "#fff";
            s += '<div class="MapSquares" style="position: absolute;" id="sq'+index+'"></div>';
        }
        self.canvas1.html(s);
        self.loading = false;
        self.container.trigger("squaresLoaded",[self.squares]);

        Map1.prototype.reLoad = function(callback){
            self.loading = true;
            self.loadSquares(self.loadObj,function(){
                self.render(function(){});
                self.loading = false;
                if (typeof callback==="function")
                    callback();

            });
        };

        return callback();


    });



};




/**
 * Функция загружает данные обводок и надписей
 * @param params - объект,  - запрос данных command, object, sid, params
 *
 */
/*Map1.prototype.fillRenderList = function(objects,callback){
    var self = this;
    var counter1 = 0;
    var counter2 = 0;
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

};*/


Map1.prototype.loadRenderItems = function(params,callback){
    if (typeof callback!=="function") callback=function(){};
    return callback();

};
Map1.prototype.updateSquare = function(square,indexName){
    if (typeof callback!=="function") callback=function(){};
    return callback();
};
Map1.prototype.updateSquares = function(data,callback){
    if (typeof callback!=="function") callback=function(){};

    return callback();
};

Map1.prototype.squaresCount= function(){
    var counter = 0;
    for (var k in this.squares){
        counter++;
    }
    return counter;
};

Map1.prototype.squaresInTrash = function(ids,callback){
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
    this.container.trigger('squaresInTrash');
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

    var tmX = 0;
    var tmY = 0;
    var squares = this.squares;
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

    var w = this.maxX-this.minX+this.squareWH;//+bw*2/10;
    var h = this.maxY-this.minY+this.squareWH;//+bh*2/10;

    if (bw<w){
        this.scaleCoeff = (bw-4*this.squareWH)/w;
        this.startScaleCoeff = (bw-4*this.squareWH)/w;
    }else{
        this.scaleCoeff = (w-4*this.squareWH)/bw;
        this.startScaleCoeff = (w-4*this.squareWH)/bw;
    }

    var dx = Math.abs(this.maxX+this.squareWH - this.minX);
    var dy = Math.abs(this.maxY+this.squareWH - this.minY);

    this.XCoeff =  (bw-dx*this.scaleCoeff)/2;
    this.YCoeff = (bh-dy*this.scaleCoeff)/2;


    if (this.scaleCoeff<=0){
        this.scaleCoeff = 0.3;
        this.startScaleCoeff = 0.3;
        this.XCoeff =  0;
        this.YCoeff = 0;
    }

    return callback();


};
Map1.prototype.addToSelection = function(ids,noDraw,callback){

    if (typeof ids!=="object"){
        ids = [ids];
    }
    for (var i in ids){
        var id = +ids[i];
        if ($.inArray(id,this.selection)!=-1/* || this.selection.length>1000*/) continue;
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

   /* if (x<0 || y<0 || x>cw-(cw*2/100) || y>ch-(ch*2/100))
        return;*/

    var color = this.squares[key].color0;
    if (this.squares[key].lighted!=undefined)
        color = this.squares[key].colorSelected;
    var textColor = this.squares[key].textColor;
        $("#sq"+key).css({width:scaledW+"px",height:scaledH+"px",top:y+"px",left:x+"px",backgroundColor:color});



    if (!this.moving){
       /* if (this.ctx.font != "normal "+Math.round((w/2)*this.scaleCoeff)+"px 'Open Sans'")
            this.ctx.font =  "normal "+Math.round((w/2)*this.scaleCoeff)+"px 'Open Sans'";

        if (this.ctx.fillStyle!=textColor)
            this.ctx.fillStyle = textColor;


        this.ctx.fillText(this.squares[key].line,x+((w/(w/4))*this.scaleCoeff),y+((h/2.1)*this.scaleCoeff));
        if (this.squares[key].place.length == 1){
            this.ctx.fillText(this.squares[key].place,x+((w-(w/3*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
        }else if (this.squares[key].place.length == 2){
            this.ctx.fillText(this.squares[key].place,x+((w-1.5*(w/2.3*0.9))*this.scaleCoeff),y+((h-h/15)*this.scaleCoeff));
        }else if (this.squares[key].place.length == 3){
            this.ctx.fillText(this.squares[key].place,x+((w-2.5*(w/2*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
        }
*/

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
   return;
};
Map1.prototype.drawSVG = function(object,callback){
    return;

};


Map1.prototype.drawObjects = function(callback){

    if (typeof callback=="function")
        callback();



};

/*Map1.prototype.drawObjects = function(){
 var oldValues = {};

 oldValues.font = "normal 10pt 'Open Sans'";
 oldValues.fillStyle = "#000000";
 oldValues.strokeStyle = "#000000";

 var x,y;
 //oldValues.rotation = false;
 var labels = [];
 var strokes = [];
 for(var k0 in this.labels){
 if (this.labels[k0].type=="LABEL") labels.push(this.labels[k0]);
 if (this.labels[k0].type=="STROKE") strokes.push(this.labels[k0]);
 }
 var self = this;
 for(var k2 in strokes){
 if (k2==strokes.length-1){

 this.drawSVG(strokes[k2],function(){
 self.ctx.font = oldValues.font;
 self.ctx.fillStyle = oldValues.fillStyle;
 self.ctx.strokeStyle = oldValues.strokeStyle;

 });
 break;
 }
 this.drawSVG(strokes[k2]);
 }
 for(var k1 in labels){
 if (labels[k1].fontStyle+" "+labels[k1].fontSize*self.scaleCoeff+"pt "+labels[k1].fontFamily != oldValues.font){
 self.ctx.font = labels[k1].fontStyle+" "+labels[k1].fontSize*self.scaleCoeff+"pt "+labels[k1].fontFamily;
 oldValues.font = labels[k1].fontStyle+" "+labels[k1].fontSize*self.scaleCoeff+"pt "+labels[k1].fontFamily;
 }
 if (labels[k1].color1 != self.ctx.fillStyle){
 self.ctx.fillStyle = labels[k1].color1;
 }


 if (!labels[k1].rotation){
 x = labels[k1].x*self.scaleCoeff+self.XCoeff;
 y = labels[k1].y*self.scaleCoeff+self.YCoeff;
 self.ctx.fillText(labels[k1].value,x,y);
 }else{
 self.ctx.save();
 x = labels[k1].x*self.scaleCoeff+self.XCoeff;
 y = labels[k1].y*self.scaleCoeff+self.YCoeff;
 self.ctx.translate(x,y);
 self.ctx.rotate(labels[k1].rotation);
 self.ctx.fillText(labels[k1].value,0,0);
 self.ctx.restore();
 }
 }



 };*/





Map1.prototype.render = function(callback){
    if (typeof callback!=="function") callback=function(){};

    var mX = this.x*this.scaleCoeff;
    var mY = this.y*this.scaleCoeff;

    var cw = this.cWidth;
    var ch = this.cHeight;


    var self = this;
        self.drawSquares(function(){
            return callback();
        });




};


Map1.prototype.showStatus = function(status){
    this.hintState = true;

    if (typeof status != "object") return;
    if (status.status_area!=undefined && status.status_area!="")
        this.hint.children("#status_area").text(status.status_area);
    else
        this.hint.children("#status_area").text("");
    if (status.status_row!=undefined && status.status_row!="")
        this.hint.children("#status_row").text("Ряд: "+status.status_row);
    else
        this.hint.children("#status_row").text("");
    if (status.status_col!=undefined && status.status_col!="")
        this.hint.children("#status_col").text("Место: "+status.status_col);
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
        this.hint.children("#status_status").text(status.status_status);
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
    return false;
    if (this.loading) return false;
    var w = this.layoutSquares[0].w;
    var h = this.layoutSquares[0].h;
    var key = (Math.floor(y  / h)* this.layoutVCount+Math.floor(x / w));
    if (key<0 || key>=this.layoutHCount*this.layoutVCount) return false;
    return key;
};
Map1.prototype.mouseOnElement = function(x,y){
    return false;
    if (this.moving) return false;
    if (this.loading) return false;
    var square = this.mouseOnLayout(x,y);
    if (square!==false){
        var shapes = this.layoutSquares[square].shapes;
        for(var key in shapes){
            var x2 = this.squares[shapes[key]].x*this.scaleCoeff+this.XCoeff;
            var y2 = this.squares[shapes[key]].y*this.scaleCoeff+this.YCoeff;
            var wh = this.squareWH*this.scaleCoeff;
            if(x>=x2 && x<=+(x2+wh) && y>=+y2 && y<=+(y2+wh)){
                return this.squares[shapes[key]].id;
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
            status_id:square.id
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
                //self.reLoadLayout();
            },50);
        }
        self.oldMouseX = 0;
        self.oldMouseY = 0;
        self.selecting = -1;
        return false;
    });
    this.container.on("hint_map",function(e,x,y){
        return;
        var square_id = self.mouseOnElement(x,y);
        if (square_id)
            self.container.trigger("show_hint",[self.squares[square_id]]);
        else{
            self.container.trigger("hide_hint");
        }
        self.container.trigger("move_hint",[x+20,y+20]);
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


    Map1.prototype.scrollControl = function(){
        if (self.timerForMouseWheel!=undefined) return;
        self.timerForMouseWheel = window.setInterval(function(){
            if (!self.mouseWheelFlag){
                window.clearInterval(self.timerForMouseWheel);
                self.timerForMouseWheel = undefined;
                self.moving = false;
                self.render();
                //self.reLoadLayout();
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
        var W = (self.maxX-self.minX);
        var H = (self.maxY-self.minY);
        var dx = 0;
        var dy = 0;
        if(delta!=0){
            var Ximg = (x - boxWidth/2)*W/boxWidth;
            var Yimg = (y - boxHeight/2)*H/boxHeight;
            dx = (W*step*delta/2) + Ximg*step*delta;
            dy = (H*step*delta/2)+ Yimg*step*delta;
        }else{
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
    this.container.on("select_stop",function(e,x,y,type,callback){
        self.selector.selectStop(x,y,function(x0,y0,w,h){
                var squares = self.squaresInRect(x0,y0,w,h);
                if (squares.length==0) return;
                if (type=="add"){
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
            if (+self.squares[square].status!=1) return;
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
            if (+self.squares[square].status!=1) return;
            self.removeFromSelection(square);
        }
    });

    /****  КОНЕЦ Пользовательские события    ***/



    $(".MapSquares").on("mousemove",function(){
        var id = this.id.substr(2);
        var sq = self.squares[id];
        var x = sq.x*self.scaleCoeff+self.XCoeff;
        var y = sq.y*self.scaleCoeff+self.YCoeff;
        self.container.trigger("show_hint",[sq]);
        self.container.trigger("move_hint",[x+20,y+20]);
    });
    $(".MapSquares").on("mouseleave",function(){
        self.container.trigger("hide_hint",10);
    });
    $(".MapSquares").on("click",function(){
        self.selecting = 1;
        var square = this.id.substr(2);
        //var square = self.squares[id];
        if (square){
            if (+self.squares[square].status!=1) return;

            if ($.inArray(+square,self.selection)!=-1)
                self.removeFromSelection(square);
            else
                self.addToSelection(square);

        }
    });



    /**** Системные события   ****/
    this.container.on("contextmenu",function(e){
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
                                self.container.trigger("select_stop",[x, y, "add", function(){
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "admin":
                                self.container.trigger("select_stop",[x, y, "add", function(){
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "editor":
                                self.container.trigger("select_stop",[x, y, "add", function(){
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
                                self.container.trigger("select_stop",[x, y, "add", function(){
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "admin":
                                self.container.trigger("select_stop",[x, y, "add", function(){
                                    self.container.trigger("sendSelection");
                                }]);
                                break;
                            case "editor":
                                self.container.trigger("mouseup_3_16",[x, y]);
                                //self.container.trigger("select_stop",[x, y, "remove", function(){}]);
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

        /*self.selector.selectStop(x,y,function(x0,y0,w,h){
         var squares = self.squaresInRect(x0,y0,w,h);
         for (var k in squares){
         self.addToSelection(squares[k]);
         }
         self.container.trigger("sendSelection");
         }
         );
         */

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
                                //self.container.trigger("squares_select",[x,y]);
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
                                self.selector.selectStart(x,y);
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
            //self.container.trigger("hide_hint",10);
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
                        self.container.trigger("move_map",[x,y]);
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
    this.container.on("mouseleave",function(e){
        //self.container.trigger("hide_hint",10);
        self.container.trigger("leave_container");
        self.mousemovingFirst = true;
        return false;
    });


    $(document).on("keydown",function(e){
        if (e.which==self.shiftState) return;
        self.shiftState = e.which;

    });
    $(document).on("keyup",function(e){
        switch (self.mouseKey){
            case 1:    /// левая кнопка мыши
                switch (self.shiftState){
                    case 16:
                        switch (self.mode){
                            case "casher":
                                break;
                            case "admin":
                                break;
                            case "editor":
                                /* self.container.trigger("select_stop",[self.downX, self.downY, "add", function(){
                                 //self.container.trigger("sendSelection");
                                 }]);*/
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
                                break;
                            case "admin":
                                break;
                            case "editor":
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
        if (self.shiftState==e.which) self.shiftState = 0;
        else{
            self.shiftState = e.which;
        }

    });

    /**** КОНЕЦ Системные события   ****/
};






/**** КОНЕЦ  Controller   *****/


/*this.prototype.init = function(){
 map

 };*/
