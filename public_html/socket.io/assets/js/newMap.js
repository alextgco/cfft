var sid = MB.User.sid;
if (document.location.href.indexOf("ForExperiment")!=-1) MB.Core.switchModal({type:"content", filename:"ForExperiment", params:{hall_scheme_id:92, label:"Для экспериментов", action_name:"Для экспериментов"}});
if (document.location.href.indexOf("CreateColor")!=-1) MB.Core.switchModal({type:"content", filename:"CreateColor", params:{label:"CreateColor", action_name:"CreateColor"}});
if (document.location.href.indexOf("mapEditor")!=-1) MB.Core.switchModal({type:"content", filename:"mapEditor", params:{hall_scheme_id:38,hall_id:176}});


function fixEvent(e) {
    //return e;
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
    if (modal.length > 0 && modal.css("position")=="absolute"){
        e.pageX -= $(t).offset().left;///* + parseInt($(t).css("borderWidth"))*/-$("body").scrollLeft();
        e.pageY -= $(t).offset().top;///* + parseInt($(t).css("borderWidth"))*/ -$("body").scrollTop();

    }

    // добавить which для IE
    if (!e.which && e.button) {
        e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) )
    }

    return e
}


var chairImg = new Image();

chairImg.onload = function(){
    chairImg.loaded = true;
};
//chairImg.src = "https://cdn2.iconfinder.com/data/icons/office/512/Icon_14-128.png";
//chairImg.src = "http://3stade.pbworks.com/f/1347051918/cube.png";
chairImg.src = "upload/c4.png";



function Map(params){
    var self = this;
    this.box = "";
    this.canvas = "";
    this.ctx = '';
    this.box2 = "";
    this.canvas2 = "";
    this.ctx2 = '';
    this.keyboardKey =  0;
    this.mouseKey = 0;
    this.shiftState =  0;
    this.oldMouseX = 0;
    this.oldMouseY = 0;
    this.startScaleCoeff =  0.3;
    this.scaleCoeff =  0.3;
    this.scaleCoeff2 =  0.025;
    this.firstLoad = true;
    this.rightColWidth = 410;
    this.cWidth = 1000;
    this.cHeight = 600;
    this.navWideSide = 200;
    this.navNarrowSide = 110;
    this.minX = 100000;
    this.maxX = 0;
    this.maxY = 0;
    this.minY = 100000;
    this.XCoeff =  100;
    this.YCoeff =  0;
    this.XCoeff2 =  0;
    this.YCoeff2 =  0;
    this.toPointX = 0;
    this.toPointY = 0;
    this.squareWH = 40;
    this.layoutSquares = {};
    this.layoutVCount = 20;
    this.layoutHCount = 20;
    this.squares = {};
    this.labels = {};
    this.hoveredSquare = 0;
    this.moving = false;
    this.shadow = false;
    this.moveCounter = 0;
    this.lighting = false;
    this.selection = [];
    this.selecting = -1;
    this.loadParams = undefined;
    this.loading = false;
    this.timersForLight = [];
    this.mouseWheelCounter = 1;
    this.mouseWheelFlag = false;
    this.timerForMouseWheel = null;
    this.autoReloadTimer = undefined;
    this.autoReloadInterval = 30000;
    this.chairImg = new Image();

    this.chairImg.onload = function(){
        self.chairImg.loaded = true;
        self.render();
    };

    this.init = function(){
        $("#loadImage").click(function(){
            self.chairImg.src=$("#imageURL").val();
        });

        //log("mapInitFunc");
        this.setBoxSize();
        this.normalizeCanvasSize();
        this.setLayout();
        //box_for_zoom


        var self = this;
        this.box2.click(function(e){
            e = fixEvent(e);
            var x = e.pageX;
            var y = e.pageY;
            self.zoomToPoint(x, y);
            return false;
        });
        this.box2.on("mousemove",function(){
            return false;
        });


        MB.User.Map = self;

    };

    this.setBoxSize = function(){
        this.box = $("#box_for_map");
        if (params!=undefined){
            if (params.box!=undefined) this.box = $("#"+params.name+ " #"+params.box);
            this.cWidth = params.cWidth;
            this.cHeight = params.cHeight;

        }
        this.box.html("<canvas height='"+this.cHeight+"' width='"+this.cWidth+"' id='canvas1'>Обновите браузер</canvas>" +
            "<div id='topHint'>" +
                "<span id='status_area'></span>" +
                "<span id='status_row'></span>" +
                "<span id='status_col'></span>" +
                "<span id='status_row'></span>" +
                "<span id='status_cost'></span>" +
                "<span id='status_fund'></span>" +
                "<span id='status_price'></span>" +
                "<span id='status_status'></span>" +
            "</div>"+
            "<div class='box_for_zoom' id='"+params.name+"_zoom'>" +
            "<canvas height='"+this.navNarrowSide+"' width='"+this.navWideSide+"' id='canvas2'>Обновите браузер</canvas>" +
            "</div>");
        this.box2 = $("#"+params.name+"_zoom");
        this.canvas = this.box.children("#canvas1");
        this.canvas2 = this.box.children("#canvas2");
        this.box.width(this.cWidth-this.rightColWidth);
        this.box.height(this.cHeight-10);
        $("#right_column").height(this.cHeight-10);
        this.box2.width(this.navWideSide);
        this.box2.height(this.navNarrowSide);
        this.toPointX = this.navWideSide/2;
        this.toPointY = this.navNarrowSide/2;

        if ($("#tickets_box").length>0)
            $("#tickets_box").css({left:this.cWidth-this.rightColWidth+20+"px",top:"160px"});


    };

    this.normalizeCanvasSize = function(){
        this.cWidth = this.box.width();
        this.cHeight = this.box.height();

        this.canvas.attr("width",this.cWidth+"px");
        this.canvas.attr("height",this.cHeight+"px");
        this.ctx=document.querySelector("#"+params.name+" #"+this.box.attr("id")+" #canvas1").getContext('2d');
        this.canvas2.attr("width",this.navWideSide+"px");
        this.canvas2.attr("height",this.navNarrowSide+"px");

        this.ctx2=document.querySelector("#"+params.name+" #"+this.box.attr("id")+" #"+this.box2.attr("id")+" #canvas2").getContext('2d');
        this.ctx.font =  "italic 20pt 'Open Sans'";
        this.ctx.fillStyle = "#000";
        this.ctx.fillSize = "24px";

    };

    this.setLayout = function(){
        this.layoutSquares = {};
        var w = this.box.width()/this.layoutHCount;
        var h = this.box.height()/this.layoutVCount;
        var count = 0;
        for (var i=0; i<this.layoutVCount;i++){
            for(var k=0;k<this.layoutHCount;k++){
                this.layoutSquares[count] = {x:w*k,y:h*i,w:w,h:h,shapes:[]};
                //this.ctx.strokeRect(this.layoutSquares[count].x,this.layoutSquares[count].y,this.layoutSquares[count].w,this.layoutSquares[count].h);
                count++;
            }
        }
    };
    this.createSquares = function(data){
        this.loading = true;

        this.squares = [];
        this.loadObjects();

        var DATA = MB.Core.jsonToObj(data);

        for (var k in DATA){

            var index =  DATA[k].FUND_ZONE_ITEM_ID || DATA[k].PRICE_ZONE_ITEM_ID || DATA[k].HALL_SCHEME_ITEM_ID || DATA[k].ACTION_SCHEME_ID;
            //log(+DATA[k].W);
            this.squares[index] = {};
            this.squares[index].id = index;
            this.squares[index].areaGroup = DATA[k].AREA_GROUP_NAME;
            this.squares[index].x = +DATA[k].X;
            this.squares[index].y = +DATA[k].Y;
            this.squares[index].w = (DATA[k].W!="" && DATA[k].W!=undefined)? +DATA[k].W : 40;
            this.squares[index].h = (DATA[k].H!="" && DATA[k].H!=undefined)? +DATA[k].H : 40;
            this.squares[index].line = String(DATA[k].LINE);
            this.squares[index].place = String(DATA[k].PLACE);


            this.squares[index].salePrice = (DATA[k].PRICE!=undefined) ? DATA[k].PRICE : "";
            this.squares[index].status = (DATA[k].STATUS!=undefined && DATA[k].STATUS!="") ? DATA[k].STATUS : 1;
            this.squares[index].textStatus = (DATA[k].STATUS_TEXT!=undefined && DATA[k].STATUS_TEXT!="") ? DATA[k].STATUS_TEXT : "";
            this.squares[index].fundGroup = DATA[k].FUND_GROUP_NAME;
            /*this.squares[index].fundGroupId = DATA[k].FUND_GROUP_ID;*/
            this.squares[index].priceGroup = DATA[k].PRICE_GROUP_NAME;
            this.squares[index].blocked = DATA[k].BLOCK_COLOR;
            /*this.squares[index].priceGroupId = DATA[k].PRICE_GROUP_ID;*/

            this.squares[index].color0 = (DATA[k].COLOR!=undefined && DATA[k].COLOR!="")?DATA[k].COLOR:"#c1c1c1";
            this.squares[index].color1 = (DATA[k].COLOR!=undefined && DATA[k].COLOR!="")?DATA[k].COLOR:"#c1c1c1";
            //this.squares[index].color0 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
            //this.squares[index].color1 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
            /*this.squares[index].group = DATA[k].GROUP_ID;
             this.squares[index].group_name = (DATA[k].GROUP_NAME!=undefined && DATA[k].GROUP_NAME!="") ? DATA[k].GROUP_NAME : "Автогруппа";*/
            var color = +this.squares[index].color0.replace("#","0x");

            if (color>+"0x8b5742")
                this.squares[index].textColor = "#000";
            else
                this.squares[index].textColor = "#fff";




            var tmX = +this.squares[index].x;
            var tmY = +this.squares[index].y;
            if (this.maxX<tmX) this.maxX = tmX;
            if (this.maxY<tmY) this.maxY = tmY;
            if (this.minX>tmX) this.minX = tmX;
            if (this.minY>tmY) this.minY = tmY;


        }

        var self = this;
        if (this.firstLoad){
            if (DATA[0] == undefined){
                this.maxX = this.cWidth;
                this.maxY = this.cHeight;
                this.minX = 0;
                this.minY = 0;
            }
            self.chairImg.src = "upload/c4.png";
            self.box.scrollControl = function(){
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
            self.box.mousewheel(function(e,delta){

                e = fixEvent(e);
                var x = e.pageX;
                var y = e.pageY;

                self.box.scrollControl();
                self.mouseWheelFlag = true;
                self.moving = true;

                var cCoef = self.scaleCoeff.toFixed(6);
                var step = 0.1;
                if(cCoef<=0.2){
                    step = 0.015;
                }else if (cCoef<=1){
                    step = 0.025;
                }else if (cCoef>1){
                    step = 0.025;
                }
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
                var boxWidth = self.box.width();
                var boxHeight = self.box.height();
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
                self.render(function(){
                    self.moving = false;
                });
                return false;

            });



            self.box.on("mousemove",function(e,delta){
                if (self.loading) return;
                e = fixEvent(e);
                var x = e.pageX;
                var y = e.pageY;
                switch (self.mouseKey){
                    case 1:

                        switch (self.keyboardKey){
                            case 32:

                                self.moving = true;
                                self.hideStatus();
                                if (self.oldMouseX==0 || self.oldMouseY==0){
                                    self.oldMouseX = x;
                                    self.oldMouseY = y;
                                    return;
                                }
                                self.XCoeff += x - self.oldMouseX;
                                self.YCoeff += y - self.oldMouseY;
                                self.render();
                                self.oldMouseX = x;
                                self.oldMouseY = y;

                                break;
                            case 13:

                                break;
                            case 16:
                                self.selecting = 1;
                                selector.selectMove(x,y
                                    /*,function(x0,y0,w,h){
                                     self.selection = self.squaresInRect(x0,y0,w,h);
                                     }*/
                                );
                                break;
                            default:
                                if (self.keyboardKey != 16){

                                    if (self.moving) return;
                                    self.selecting = 1;
                                    self.hideStatus();
                                    var square = self.mouseOnElement(x, y);
                                    if (square){
                                        if (+self.squares[square].status!=1) return;
                                        self.addToSelection(square);
                                    }
                                }

                                break;


                        }
                        break;
                    case 2:
                        switch (self.keyboardKey){
                            case 13:

                                break;
                            default:
                                self.hideStatus();
                                if (self.oldMouseX==0 || self.oldMouseY==0){
                                    self.oldMouseX = x;
                                    self.oldMouseY = y;
                                    return;
                                }
                                self.moving = true;
                                self.mouseWheelFlag = true;

                                self.XCoeff += x - self.oldMouseX;
                                self.YCoeff += y - self.oldMouseY;

                                self.oldMouseX = x;
                                self.oldMouseY = y;

                                var dX = -self.XCoeff;
                                var dY = -self.YCoeff;

                                //self.moveCanvas(self.XCoeff,self.YCoeff);

                                //return;

                                /*var dX = (x*self.box.width()/self.box2.width())*self.scaleCoeff/self.startScaleCoeff-self.box.width()/2;
                                 var dY = (y*self.box.height()/self.box2.height())*self.scaleCoeff/self.startScaleCoeff-self.box.height()/2;*/
                                self.toPointX = ((2*dX+self.box.width())*self.box2.width()*self.startScaleCoeff)/(2*self.box.width()*self.scaleCoeff);
                                self.toPointY = ((2*dY+self.box.height())*self.box2.height()*self.startScaleCoeff)/(2*self.box.height()*self.scaleCoeff);

                                self.render();

                                break;
                        }

                        break;
                    case 3:
                        switch (self.keyboardKey){
                            case 13:

                                break;
                            case 16:

                                self.selecting = 0;
                                selector.selectMove(x,y
                                    /*  ,function(x0,y0,w,h){
                                     self.selection = self.squaresInRect(x0,y0,w,h);
                                     }*/
                                );
                                break;
                            default:
                                self.contextmenu_ready = false;
                                if (self.keyboardKey != 16){
                                    if (self.moving) return;
                                    self.selecting = 0;
                                    self.hideStatus();
                                    var square = self.mouseOnElement(x, y);

                                    if (square){
                                        if (+self.squares[square].status==0 && +self.squares[square].status!=2) return;
                                        self.addToSelection(square);
                                    }
                                }
                        }

                        break;
                    default:
                        switch (self.keyboardKey){
                            case 32:
                                break;
                            case 13:

                                break;
                            default:

                                square = self.mouseOnElement(x, y);

                                if (square != self.hoveredSquare && self.hoveredSquare!=0){
                                    self.hideStatus();
                                    /*  var x0 = self.squares[self.hoveredSquare].x*self.scaleCoeff+self.XCoeff;
                                     var y0 = self.squares[self.hoveredSquare].y*self.scaleCoeff+self.YCoeff;
                                     var wh0 = self.squareWH*self.scaleCoeff;
                                     //self.squares[square].color0 = "#FFE116";
                                     self.ctx.clearRect(x0,y0,wh0,wh0);
                                     self.ctx.fillStyle =  self.squares[self.hoveredSquare].color0;
                                     self.ctx.fillRect(x0,y0,wh0,wh0);*/
                                    //self.showStatus({status_area:'',status_row:'0',status_col:'0',status_cost:'',status_fond:'',status_status:'',status_zone:''});

                                }
                                if (square){

                                    //  square содержит id места на котором произведен hover
                                    self.hoveredSquare = square;
                                    /*  var x = self.squares[square].x*self.scaleCoeff+self.XCoeff;
                                     var y = self.squares[square].y*self.scaleCoeff+self.YCoeff;
                                     var wh = self.squareWH*self.scaleCoeff;*/
                                    //self.squares[square].color0 = "#FFE116";
                                    /* self.ctx.clearRect(x,y,wh,wh);
                                     self.ctx.fillStyle =  "#0f0";
                                     self.ctx.fillRect(x,y,wh,wh);*/
                                    //log(e.offsetY+parseInt(self.box.css("top"))+20);
                                    //log(self.box.offset().top);
                                    self.showStatus({
                                        /* x:e.offsetX+parseInt(self.box.offset().left)+20,
                                         y:e.offsetY+parseInt(self.box.offset().top)+20,*/

                                        x:x+20,
                                        y:y+20,
                                        status_area:self.squares[square].areaGroup,
                                        status_row:self.squares[square].line,
                                        status_col:self.squares[square].place,
                                        status_cost:self.squares[square].salePrice,
                                        status_fund:self.squares[square].fundGroup,
                                        status_price:self.squares[square].priceGroup,
                                        status_status:self.squares[square].textStatus,
                                        status_id:self.squares[square].id
                                    });
                                    //$("#clear_tickets_stack").html(self.squares[square].x+"x"+self.squares[square].y);
                                }

                                break;


                        }



                        break;


                }



            });
            self.box.on("contextmenu",function(e){
                return false;
            });

////for (var key in mp.squares){send_query({command:"edit",object:"block_by_cashier",sid:sid,params:{action_scheme_id:mp.squares[key].id}},function(){});}
            self.box.on("mousedown",function(e){
                e = fixEvent(e);
                var x = e.pageX;
                var y = e.pageY;
                self.moveCounter = 0;
                self.mouseKey = e.which;
                switch (self.mouseKey){
                    case 1:    /// левая кнопка мыши
                        switch (self.keyboardKey){
                            case 32:
                                // пробел
                                break;
                            case 13:
                                // esc

                                break;
                            case 16:
                                // shift

                                selector.selectStart(x,y);


                                break;
                            default:
                                //  Любая или никакой
                                //log(self.mouseOnElement(e.offsetX, e.offsetY));
                                //var sq = self.squares[self.mouseOnElement(e.offsetX, e.offsetY)];
                                /* var square = self.mouseOnElement(e.offsetX, e.offsetY);

                                 if (square){
                                 if (!+self.squares[square].status) return;
                                 //  square содержит id места на котором произведен клик.
                                 self.blockUnblockSquare(square);
                                 }*/

                                //self.drawSquares();
                                //self.ctx.fillRect(sq.x,sq.y,self.squareWH);

                                break;
                        }
                        break;
                    case 2:


                        break;
                    case 3:
                        switch (self.keyboardKey){
                            case 32:
                                // пробел
                                break;
                            case 13:
                                // esc

                                break;
                            case 16:
                                // shift

                                selector.selectStart(x,y);


                                break;
                            default:
                                //  Любая или никакой
                                //log(self.mouseOnElement(e.offsetX, e.offsetY));
                                //var sq = self.squares[self.mouseOnElement(e.offsetX, e.offsetY)];
                                var square = self.mouseOnElement(x, y);
                                if (square){
                                    //log(square);
                                    if (!self.squares[square].status){
                                        self.contextmenu_ready = square;
                                    }
                                }
                                /* //  square содержит id места на котором произведен клик.
                                 var x2 = self.squares[square2].x*self.scaleCoeff+self.XCoeff;
                                 var y2 = self.squares[square2].y*self.scaleCoeff+self.YCoeff;
                                 var wh2 = self.squareWH*self.scaleCoeff;
                                 self.squares[square2].color0 = self.squares[square2].color1;
                                 self.ctx.clearRect(x2,y2,wh2,wh2);
                                 self.ctx.fillStyle =  self.squares[square2].color0;
                                 self.ctx.fillRect(x2,y2,wh2,wh2);*/
                                // }
                                //self.reLoad();
                                //v.loadJ();

                                //self.drawSquares();
                                //self.ctx.fillRect(sq.x,sq.y,self.squareWH);

                                break;
                        }

                        break;
                    default:

                        break;


                }



            });
        /*    self.box.children("canvas").on("click",function(e){
                var coor = mouseShowHandler(e);
                var x = coor[0];
                var y = coor[1];

                var e2 = fixEvent(e);
                log("canvas "+e2.pageX);

            });*/
            self.box.on("click",function(e){
                e = fixEvent(e);
                var x = e.pageX;
                var y = e.pageY;
              /*  var coor = mouseShowHandler(e);
                var x = coor[0];
                var y = coor[1];*/

                switch (e.which){
                    case 1:    /// левая кнопка мыши
                        switch (self.keyboardKey){
                            case 32:
                                // пробел
                                break;
                            case 13:
                                // esc

                                break;
                            default:
                                //  Любая или никакой

                                if (self.keyboardKey != 16){

                                    if (self.moving) return;
                                    self.selecting = 1;
                                    self.hideStatus();
                                    var square = self.mouseOnElement(x, y);
                                    if (square){
                                        if (+self.squares[square].status!=1) return;
                                        self.addToSelection(square);
                                    }
                                }


                                break;
                        }
                        break;
                    case 2:


                        break;
                    case 3:
                        switch (self.keyboardKey){
                            case 32:
                                // пробел
                                break;
                            case 13:
                                // esc

                                break;
                            default:
                                //  Любая или никакой
                                //log(self.mouseOnElement(e.offsetX, e.offsetY));
                                //var sq = self.squares[self.mouseOnElement(e.offsetX, e.offsetY)];
                                var square2 = self.mouseOnElement(x,y);
                                if (square2){
                                    /* //  square содержит id места на котором произведен клик.
                                     var x2 = self.squares[square2].x*self.scaleCoeff+self.XCoeff;
                                     var y2 = self.squares[square2].y*self.scaleCoeff+self.YCoeff;
                                     var wh2 = self.squareWH*self.scaleCoeff;
                                     self.squares[square2].color0 = self.squares[square2].color1;
                                     self.ctx.clearRect(x2,y2,wh2,wh2);
                                     self.ctx.fillStyle =  self.squares[square2].color0;
                                     self.ctx.fillRect(x2,y2,wh2,wh2);*/
                                }
                                self.reLoad();
                                //self.loadJ();

                                //self.drawSquares();
                                //self.ctx.fillRect(sq.x,sq.y,self.squareWH);

                                break;
                        }

                        break;
                    default:

                        break;


                }



            });

            self.box.on("mouseup",function(e){

                self.ImageLoaded = false;
                /*if (typeof self.sendSelection=="function" && self.mouseKey!=0) {
                    self.sendSelection(self.selecting);
                }*/


                e = fixEvent(e);
                var x = e.pageX;
                var y = e.pageY;
                if (self.contextmenu_ready) {
                    $('.context-menu-one').contextMenu(true);
                } else
                    $('.context-menu-one').contextMenu(false);

                selector.selectStop(x,y,function(x0,y0,w,h){
                        self.selection = self.squaresInRect(x0,y0,w,h);
                        if (typeof self.sendSelection=="function" && self.mouseKey!=0) {
                            log(self.selection);
                            self.sendSelection(self.selecting);
                        }
                    }
                );
                self.mouseKey = 0;

                if (self.moving){
                    //window.setTimeout(function(){
                        self.moving=false;
                        self.render();
                        self.reLoadLayout();
                    //},50);
                }

                /* self.XCoeff = 0;
                 self.YCoeff = 0;*/
                self.oldMouseX = 0;
                self.oldMouseY = 0;
                self.selecting = -1;
                return false;
                //self.reLoadLayout();

                /*if(e.which==2 || (e.which==1 && self.keyboardKey==32)){

                 }*/





                //self.drawSquares();
            });
            self.box.on("mouseleave",function(e){
                $(this).mouseup();
                return false;
            });

            self.box.on("dblclick",function(e){
                e = fixEvent(e);
                var x = e.pageX;
                var y = e.pageY;
                switch (e.which){
                    case 1:    /// левая кнопка мыши
                        switch (self.keyboardKey){
                            case 32:
                                // пробел
                                break;
                            case 13:
                                // esc

                                break;
                            default:
                                //  Любая или никакой
                                //log(self.mouseOnElement(e.offsetX, e.offsetY));
                                //var sq = self.squares[self.mouseOnElement(e.offsetX, e.offsetY)];
                                var square = self.mouseOnElement(x, y);

                                if (square){
                                    if (+self.squares[square].status==0) return;
                                    //  square содержит id места на котором произведен клик.

                                    open_order(square,"RESERVED");

                                }

                                //self.drawSquares();
                                //self.ctx.fillRect(sq.x,sq.y,self.squareWH);

                                break;
                        }
                        break;
                    case 2:


                        break;
                    case 3:
                        switch (self.keyboardKey){
                            case 32:
                                // пробел
                                break;
                            case 13:
                                // esc

                                break;
                            default:


                                //self.drawSquares();
                                //self.ctx.fillRect(sq.x,sq.y,self.squareWH);

                                break;
                        }

                        break;
                    default:

                        break;


                }



            });


            $(document).on("keydown",function(e){
                self.keyboardKey = e.which;
                switch (e.which){
                    case 32:
                        self.box.css("cursor","move");
                        break;
                }
                if (self.shiftState!=0) return;
                switch (e.which){
                    case 16:
                        self.shiftState = 16;
                        break;
                    case 17:           /// CTRL
                        self.shiftState = 17;

                        break;
                    case 18:
                        self.shiftState = 18;

                        break;
                    case 80:
                        self.shiftState = 80;

                        break;
                    default:
                        self.shiftState = e.which;
                        break;
                }
            });
            $(document).on("keyup",function(e){
                if (self.shiftState==e.which) self.shiftState = 0;
                self.keyboardKey = 0;
                self.box.css("cursor","default");
            });

            this.box.on("mouseleave",function(){
                self.hideStatus();
            });

            // Использование:
            //var self = this;
/*
            (function animloop(){
                render();
                requestAnimFrame(animloop);
            })();*/
            self.firstLoad = false;
        }

        //this.render();

        window.setTimeout(function(){
            self.loading = false;
            self.reLoadLayout();
        },350);




    };

    /**
     * Функция подгружает обводки и надписи для схемы мероприятия
     * *
     */
    this.loadObjects=function(){
        var object = "action_scheme_object";
        //var params = {action_id:1};
        var params = {};
        if (typeof this.loadObjectsParam=="object"){
            object = this.loadObjectsParam.object;
            params = this.loadObjectsParam.params;
        }
        var self = this;
        MB.Core.sendQuery({command:"get",object:object,sid:sid,params:params},function(data){
            //var obj = xmlToObject(data,"ROW");
            var obj = MB.Core.jsonToObj(data);
            for(var k in obj){
                if(obj[k]['OBJECT_TYPE']!="STROKE" && obj[k]['OBJECT_TYPE']!="LABEL") continue;
                var index = obj[k]['OBJECT_ID'];
                self.labels[index] = {};
                self.labels[index].type = obj[k]['OBJECT_TYPE'];
                self.labels[index].value = (obj[k]['VALUE']!="") ? obj[k]['VALUE'] : "";
                self.labels[index].x = (obj[k]['X']!="") ? obj[k]['X'] : 0;
                self.labels[index].y = (obj[k]['Y']!="") ? obj[k]['Y'] : 0;
                self.labels[index].rotation = (obj[k]['ROTATION']!="") ? +obj[k]['ROTATION']*Math.PI/180 : false;
                self.labels[index].fontSize = (obj[k]['FONT_SIZE']!="") ? obj[k]['FONT_SIZE'] : 10;
                self.labels[index].fontStyle = (obj[k]['FONT_STYLE']!="") ? obj[k]['FONT_STYLE'] : "normal";
                self.labels[index].fontFamily = (obj[k]['FONT_FAMILY']!="") ? obj[k]['FONT_FAMILY'] : "'Open Sans'";
                self.labels[index].fontDecaration = (obj[k]['TEXT_DECARATION']!="") ? obj[k]['TEXT_DECARATION'] : "none";
                self.labels[index].color1 = (obj[k]['COLOR1']!="") ? obj[k]['COLOR1'] : "#000000";
                self.labels[index].color2 = (obj[k]['COLOR2']!="") ? obj[k]['COLOR2'] : "#FFFFFF";
                self.labels[index].color3 = (obj[k]['COLOR3']!="") ? obj[k]['COLOR3'] : "#000000";
                self.labels[index].color4 = (obj[k]['COLOR4']!="") ? obj[k]['COLOR4'] : "#FFFFFF";
                self.labels[index].another = (obj[k]['ANOTHER']!="") ? obj[k]['ANOTHER'] : "";
                var tmX = +self.labels[index].x-self.labels[index].fontSize;
                var tmY = +self.labels[index].y-self.labels[index].fontSize;
                if (self.maxX<tmX) self.maxX = tmX;
                if (self.maxY<tmY) self.maxY = tmY;
                if (self.minX>tmX) self.minX = tmX;
                if (self.minY>tmY) self.minY = tmY;
            }
            self.setScaleCoff();
            self.render();
            //this.drawObjects();
        });

    };
    this.updateSquares = function(data){
        var DATA = MB.Core.jsonToObj(data);

        for (var k in DATA){

            var index =  DATA[k].FUND_ZONE_ITEM_ID || DATA[k].PRICE_ZONE_ITEM_ID || DATA[k].HALL_SCHEME_ITEM_ID || DATA[k].ACTION_SCHEME_ID;

            this.squares[index] = {};
            this.squares[index].id = index;
            this.squares[index].areaGroup = DATA[k].AREA_GROUP_NAME;
            this.squares[index].x = +DATA[k].X;
            this.squares[index].y = +DATA[k].Y;
            this.squares[index].w = (DATA[k].W!="")? +DATA[k].W : 40;
            this.squares[index].h = (DATA[k].H!="")? +DATA[k].H : 40;
            this.squares[index].line = String(DATA[k].LINE);
            this.squares[index].place = String(DATA[k].PLACE);


            this.squares[index].salePrice = (DATA[k].PRICE!=undefined) ? DATA[k].PRICE : "";
            this.squares[index].status = (DATA[k].STATUS!=undefined && DATA[k].STATUS!="") ? DATA[k].STATUS : 1;
            this.squares[index].textStatus = (DATA[k].STATUS_TEXT!=undefined && DATA[k].STATUS_TEXT!="") ? DATA[k].STATUS_TEXT : "";
            this.squares[index].fundGroup = DATA[k].FUND_GROUP_NAME;
            /*this.squares[index].fundGroupId = DATA[k].FUND_GROUP_ID;*/
            this.squares[index].priceGroup = DATA[k].PRICE_GROUP_NAME;
            this.squares[index].blocked = DATA[k].BLOCK_COLOR;
            /*this.squares[index].priceGroupId = DATA[k].PRICE_GROUP_ID;*/

            this.squares[index].color0 = (DATA[k].COLOR!=undefined && DATA[k].COLOR!="")?DATA[k].COLOR:"#c1c1c1";
            this.squares[index].color1 = (DATA[k].COLOR!=undefined && DATA[k].COLOR!="")?DATA[k].COLOR:"#c1c1c1";
            //this.squares[index].color0 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
            //this.squares[index].color1 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
            /*this.squares[index].group = DATA[k].GROUP_ID;
             this.squares[index].group_name = (DATA[k].GROUP_NAME!=undefined && DATA[k].GROUP_NAME!="") ? DATA[k].GROUP_NAME : "Автогруппа";*/
            var color = +this.squares[index].color0.replace("#","0x");

            if (color>+"0x8b5742")
                this.squares[index].textColor = "#000";
            else
                this.squares[index].textColor = "#fff";




            var tmX = +this.squares[index].x;
            var tmY = +this.squares[index].y;
            if (this.maxX<tmX) this.maxX = tmX;
            if (this.maxY<tmY) this.maxY = tmY;
            if (this.minX>tmX) this.minX = tmX;
            if (this.minY>tmY) this.minY = tmY;


        }
        /*$(xml).find("ROWSET").find("ROW").each(function(index){
         index = $(this).find("ID").text();
         if (this.squares[index] != undefined){
         this.squares[index].id = $(this).find("ID").text();
         this.squares[index].areaGroup = $(this).find("AG").text();
         this.squares[index].x = +$(this).find("X").text();
         this.squares[index].x = +$(this).find("X").text();
         this.squares[index].y = +$(this).find("Y").text();
         this.squares[index].line = $(this).find("L").text();
         this.squares[index].place = $(this).find("P").text();
         this.squares[index].salePrice = $(this).find("SP").text();
         this.squares[index].fundGroup = $(this).find("FG").text();
         this.squares[index].fundGroupId = $(this).find("FGI").text();
         this.squares[index].priceGroup = $(this).find("PG").text();
         this.squares[index].priceGroupId = $(this).find("PGI").text();
         this.squares[index].status = ($(this).find("S").text()!=undefined) ? +$(this).find("S").text() : 1;
         this.squares[index].blocked = $(this).find("B").text();
         this.squares[index].textStatus = $(this).find("ST").text();
         this.squares[index].ticket_id = $(this).find("TI").text();
         this.squares[index].color0 = $(this).find("C").text();
         this.squares[index].color1 = $(this).find("C").text();
         this.squares[index].order_id = +$(this).find("OI").text();
         this.squares[index].ticket_status = $(this).find("TS").text();
         var color = +this.squares[index].color0.replace("#","0x");

         if (color>+"0x8b5742")
         this.squares[index].textColor = "#000";
         else
         this.squares[index].textColor = "#fff";


         }


         });*/

        //log("Squares REloaded...");

        this.render();
        this.reLoadLayout();



    };
    this.setScaleCoff = function(){
        var bw = this.box.width();
        var bh = this.box.height();

        var w = this.maxX-this.minX+this.squareWH;//+bw*2/10;
        var h = this.maxY-this.minY+this.squareWH;//+bh*2/10;

        if (this.cWidth<w){
            this.scaleCoeff = (this.cWidth-4*this.squareWH)/w;
            this.startScaleCoeff = (this.cWidth-4*this.squareWH)/w;
        }else{
            this.scaleCoeff = (w-4*this.squareWH)/this.cWidth;
            this.startScaleCoeff = (w-4*this.squareWH)/this.cWidth;
        }

        var dx = Math.abs(this.maxX+this.squareWH - this.minX);
        var dy = Math.abs(this.maxY+this.squareWH - this.minY);


        this.XCoeff =  (bw-dx*this.scaleCoeff)/2;

        this.YCoeff = (bh-dy*this.scaleCoeff)/2;

        // Вычисляем ориентацию навигатора


        var bw2 = this.navWideSide;
        var bh2 = this.navNarrowSide;


        if (dx<dy){
            bw2 = this.navNarrowSide;
            bh2 = this.navWideSide;
        }
        this.box2.width(bw2);
        this.box2.height(bh2);



        var coef1 = bw2/dx;
        var coef2 = bh2/dy;

        if (coef1>=coef2){
            this.scaleCoeff2 = coef2;
            this.XCoeff2 = (bw2-dx*this.scaleCoeff2)/2;

        }else{
            this.scaleCoeff2 = coef1;
            this.YCoeff2 = (bh2-dy*this.scaleCoeff2)/2;
        }



    };
    this.mouseOnLayout = function(x,y){
       var w = this.layoutSquares[0].w;
       var h = this.layoutSquares[0].h;

        var key = (Math.floor(y  / h)* this.layoutHCount+Math.floor(x / w));
        if (key<0 || key>=this.layoutHCount*this.layoutVCount) return false;
        return key;
    };
    this.drawLayout = function(key){
        this.ctx.strokeRect(this.layoutSquares[key].x,this.layoutSquares[key].y,this.layoutSquares[key].w,this.layoutSquares[key].h);
    };

    this.mouseOnLayout2 = function(x,y){
        x = x*this.scaleCoeff;
         y = y*this.scaleCoeff;
        var wh = this.squareWH*this.scaleCoeff;
        for (var key in this.layoutSquares){
            if (x>=this.layoutSquares[key].x && x<=this.layoutSquares[key].x+this.layoutSquares[key].w && y>=this.layoutSquares[key].y && y<=this.layoutSquares[key].y+this.layoutSquares[key].h){
                log(key);
                return key;
            }
        }
        log("noLayout");
        return false;
    };
    this.layoutInRect = function(x0,y0,w,h){

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

    this.squaresInRect = function(x0,y0,w,h){
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
                    if ($.inArray(arr2[key2],squares)==-1)
                        squares.push(arr2[key2]);
                }
            }
        }
        return squares;
    };
    this.mouseOnElement = function(x,y){


        if (this.moving || this.loading) return false;

        var square = this.mouseOnLayout(x,y);
        //log("tomouseOnElement "+x+", "+y);


        if (square!==false){
            var shapes = this.layoutSquares[square].shapes;
            for(var key in shapes){
                //this.ctx.fillStyle = "#f00";
                //this.ctx.fillRect(10*key,10,100,100);
                var x2 = this.squares[shapes[key]].x*this.scaleCoeff+this.XCoeff;
                var y2 = this.squares[shapes[key]].y*this.scaleCoeff+this.YCoeff;
                var wh = this.squareWH*this.scaleCoeff;
                //log(this.XCoeff);
                //log(this.squares[shapes[key]].w);

                if(x>=x2 && x<=+(x2+wh) && y>=+y2 && y<=+(y2+wh)){
                    //log("mouseOnSquare "+this.squares[shapes[key]].id);

                    return this.squares[shapes[key]].id;
                }
            }
        }
        return false;


    };
    this.showStatus = function(status){
        if (this.selecting!=-1) return;
        if (typeof status != "object") return;

        if (status.status_area!=undefined && status.status_area!="")
            $("#status_area").text(status.status_area);
        else
            $("#status_area").text("");
        if (status.status_row!=undefined && status.status_row!="")
            $("#status_row").text("Ряд: "+status.status_row);
        else
            $("#status_row").text("");
        if (status.status_col!=undefined && status.status_col!="")
            $("#status_col").text("Место: "+status.status_col);
        else
            $("#status_col").text("");
        if (status.status_cost!=undefined && status.status_cost!="")
            $("#status_cost").text("Цена: "+status.status_cost);
        else
            $("#status_cost").text("");
        if (status.status_fund!=undefined && status.status_fund!="")
            $("#status_fund").text("Фонд: "+status.status_fund);
        else
            $("#status_fund").text("");
        if (status.status_price!=undefined && status.status_price!="")
            $("#status_price").text("Пояс: "+status.status_price);
        else
            $("#status_price").text("");
        if (status.status_status!=undefined && status.status_status!="")
            $("#status_status").text(status.status_status);
        else
            $("#status_status").text("");
        if (status.status_id!=undefined && status.status_id!="")
            $("#status_id").text(status.status_id);
        else
            $("#status_id").text("");
        if (status.x!=undefined && status.y!=undefined){
            if (status.y>=this.box.height()+parseInt(this.box.css("top"))-$("#topHint").height())
                status.y = this.box.height()+parseInt(this.box.css("top"))-$("#topHint").height()+10;
            $("#topHint").stop(true,true).animate({top:status.y+"px",left:status.x+10+"px"},450);
            $("#topHint").stop(true,true).fadeIn(450);
        }
    };
    this.hideStatus = function(){
        var duration = 450;
        if (arguments[0]!=undefined && !isNaN(+arguments[0]))
            duration = arguments[0];
        if ($("#topHint").length>0 && $("#topHint").css("display")!="none")
            $("#topHint").stop(true,true).delay(300).fadeOut(duration);
    };

    this.canvasRadiusFill = function(x, y, w, h, tl, tr, br, bl,color){
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
    this.canvasRadiusStroke = function(x, y, w, h, tl, tr, br, bl,color){
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
    this.drawRoundedRect = function(x,y,w,h,cr,color){

        this.ctx.beginPath();
        this.ctx.moveTo(x + w / 2, y);
        this.ctx.arcTo(x + w, y, x + w, y + h, cr);
        this.ctx.arcTo(x + w, y + h, x, y + h, cr);
        this.ctx.arcTo(x, y + h, x, y, cr);
        this.ctx.arcTo(x, y, x + w, y, cr);
        this.ctx.closePath();
        if (this.ctx.strokeStyle!=color) this.ctx.strokeStyle = color;
        this.ctx.fill();


    };


    this.drawSquaresChild = function(key,cw,ch){
        var x = Math.round((this.squares[key].x)*this.scaleCoeff+this.XCoeff);
        var y = Math.round((this.squares[key].y)*this.scaleCoeff+this.YCoeff);
        var w = +this.squares[key].w;
        var h = +this.squares[key].h;
        var scaledW = Math.round(w*this.scaleCoeff);
        var scaledH = Math.round(h*this.scaleCoeff);

        if (x<0 || y<0 || x>cw-(cw*2/100) || y>ch-(ch*2/100))
            return;


        if (this.squares[key].lighted!=undefined){
            color0 = "#f6ebb8";
        }else{
            color0 = "#FFFFFF";
        }

/*
        this.ctx.fillRect(x,y,Math.round(40*this.scaleCoeff),Math.round(40*this.scaleCoeff));
        return;*/

 /*       if (chairImg.loaded)
            this.ctx.drawImage(chairImg,x,y,w*this.scaleCoeff,h*this.scaleCoeff);*/

        /*if (this.chairImg.loaded)
            this.ctx.drawImage(this.chairImg,x,y,w*1.25*this.scaleCoeff,h*1.25*this.scaleCoeff);*/


        if (!this.moving)
            this.canvasRadiusFill(x+(scaledW/60),y+(scaledH/40),scaledW,scaledH,
                Math.round(w/10*this.scaleCoeff),
                Math.round(w/10*this.scaleCoeff),
                Math.round(w/10*this.scaleCoeff),
                Math.round(w/10*this.scaleCoeff),
                "#c6c2c2");

        this.canvasRadiusFill(x,y,scaledW,scaledH,
            Math.round(w/10*this.scaleCoeff),
            Math.round(w/10*this.scaleCoeff),
            Math.round(w/10*this.scaleCoeff),
            Math.round(w/10*this.scaleCoeff),
            this.squares[key].color0);

        if (!this.moving){
            if (this.ctx.font != "normal "+Math.round((w/3)*this.scaleCoeff)+"px 'Open Sans'")
                this.ctx.font =  "normal "+Math.round((w/3)*this.scaleCoeff)+"px 'Open Sans'";
            //this.squares[key].textColor = "#737373";
            //this.squares[key].textColor = "#fbfbfb";
            //this.squares[key].textColor = "#000";

            if (this.ctx.fillStyle!=this.squares[key].textColor)
                this.ctx.fillStyle = this.squares[key].textColor;
            /*if (this.squares[key].status == 1)
             this.ctx.fillStyle = "#fff";*/



            this.ctx.fillText(this.squares[key].line,x+((w/(w/4))*this.scaleCoeff),y+((h/3)*this.scaleCoeff));
            if (this.squares[key].place.length == 1){
                this.ctx.fillText(this.squares[key].place,x+((w-(w/3*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
            }else if (this.squares[key].place.length == 2){
                this.ctx.fillText(this.squares[key].place,x+((w-1.5*(w/3*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
            }else if (this.squares[key].place.length == 3){
                this.ctx.fillText(this.squares[key].place,x+((w-2.5*(w/3*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
            }

        }
    };
    this.drawSquares = function(){
        //this.ctx.font =  "normal "+Math.round(3*sc)+"pt 'Open Sans'";
        var wh = this.squareWH;
        //var wh = this.squareWH*this.scaleCoeff;
        var cw = this.canvas.width();
        //var ch = this.canvas.height();
        var ch = this.box.height();




        //this.ctx.fillText("sadsads",210,210,100);

       /* for(var i in this.layoutSquares){
            this.layoutSquares[i].shapes = [];
        }*/
        /* var count = 0;
         var boxWidth = this.box.width();
         var boxHeight = this.box.height();*/
        //var count = 0;
        for (var key in this.squares){
            this.drawSquaresChild(key,cw,ch);
            //log(key);
            /*var x = (this.squares[key].x/4)*this.scaleCoeff+this.XCoeff;
             var y = (this.squares[key].y/4)*this.scaleCoeff+this.YCoeff;*/

            //

            //if (this.squares[key].order_id==selected_order_id){
            //var arrow = "M"+(x+wh*this.scaleCoeff)+" "+(y-wh*this.scaleCoeff/4)+"L"+(x+wh*this.scaleCoeff)+" "+y+"L"+(x+wh*this.scaleCoeff+wh*this.scaleCoeff/4)+" "+(y-wh*this.scaleCoeff/4)+" M"+(x+wh*this.scaleCoeff)+" "+y+"L"+(x+wh*2*this.scaleCoeff)+" "+(y-wh*this.scaleCoeff);
            //this.ctx.strokeStyle = "#FF0000";
            //this.drawSVG({value:arrow,color1:"#FF0000"});

            //}


            //this.ctx.fillText("sadsads",100,100);
            /*if (x<=cw && x>=0 && y <=ch && y>=0){
             var layout = this.mouseOnLayout(x,y);
             if (layout) {
             this.layoutSquares[layout].shapes.push(this.squares[key].id);
             }
             layout = this.mouseOnLayout(x+wh*this.scaleCoeff,y);
             if (layout) {
             this.layoutSquares[layout].shapes.push(this.squares[key].id);
             }
             layout = this.mouseOnLayout(x+wh*this.scaleCoeff,y+wh*this.scaleCoeff);
             if (layout) {
             this.layoutSquares[layout].shapes.push(this.squares[key].id);
             }
             layout = this.mouseOnLayout(x,y+wh*this.scaleCoeff);
             if (layout) {
             this.layoutSquares[layout].shapes.push(this.squares[key].id);
             }
             //this.layoutSquares[this.mouseOnLayout(x+wh*this.scaleCoeff,y+wh*this.scaleCoeff)].shapes.push(this.squares[key].id);
             *//*this.layoutSquares[this.mouseOnLayout(x-wh,y-wh)].shapes.push(this.squares[key].id);*//*
             }*/
        }


        //log("Rendered..");
        //log(this.layoutSquares[0]);
    };
    this.drawSVG = function(object,callback){
        var context = this.ctx;
        var context2 = this.ctx2;
        var string = object.value;
        context.beginPath();
        context2.beginPath();
        var self = this;
        (function execCommand(){
            if (!string.match(/[A-Z]/)){
                context.strokeStyle=object.color1;
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
    this.drawObjects = function(){
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



    };
    this.drawSquare = function(id){

        var wh = this.squareWH;


        /*
         if (this.squares[id].status == "LABEL"){
         alert("LABEL");
         return;
         }*/
        //log(id);
        /*var x = (this.squares[id].x/4)*this.scaleCoeff+this.XCoeff;
         var y = (this.squares[id].y/4)*this.scaleCoeff+this.YCoeff;*/
        var x = Math.round((this.squares[id].x)*this.scaleCoeff+this.XCoeff);
        var y = Math.round((this.squares[id].y)*this.scaleCoeff+this.YCoeff);
        var w = +this.squares[id].w;
        var h = +this.squares[id].h;
        var scaledW = Math.round(w*this.scaleCoeff);
        var scaledH = Math.round(h*this.scaleCoeff);



        //if (this.squares[id].lighted!=undefined && this.squares[id].priceGroupId == 6 && this.squares[id].order_id==-1){
        if (this.squares[id].lighted!=undefined){
            var grd=this.ctx.createRadialGradient(x+wh*this.scaleCoeff/2,y+wh*this.scaleCoeff/2,wh*this.scaleCoeff/2,x+wh*this.scaleCoeff/2,y+wh*this.scaleCoeff/2,(wh*this.scaleCoeff)/(20));
            grd.addColorStop(1,"#e6e5e1");
            grd.addColorStop(0,this.squares[id].color0);
            this.ctx.fillStyle=grd;
        }else{
            this.ctx.fillStyle = this.squares[id].color0;
        }
        /*if (shadow){
         this.ctx.shadowOffsetX = 2*this.scaleCoeff;
         this.ctx.shadowOffsetY = 2*this.scaleCoeff;
         this.ctx.shadowBlur = 8*this.scaleCoeff;
         this.ctx.shadowColor = "#000";
         }*/


        this.canvasRadiusFill(x+(scaledW/60),y+(scaledH/40),scaledW,scaledH,
            Math.round(w/10*this.scaleCoeff),
            Math.round(w/10*this.scaleCoeff),
            Math.round(w/10*this.scaleCoeff),
            Math.round(w/10*this.scaleCoeff),
            "#c6c2c2");

        this.canvasRadiusFill(x,y,scaledW,scaledH,
            Math.round(w/10*this.scaleCoeff),
            Math.round(w/10*this.scaleCoeff),
            Math.round(w/10*this.scaleCoeff),
            Math.round(w/10*this.scaleCoeff),
            this.squares[id].color1);
        
        
        //this.ctx.fillRect(x,y,Math.round(wh*this.scaleCoeff),Math.round(wh*this.scaleCoeff));
        /* if (shadow){
         this.ctx.shadowOffsetX =0;
         this.ctx.shadowOffsetY = 0;
         this.ctx.shadowBlur = 0;
         }*/
        //this.ctx.strokeRect(x,y,Math.round(wh*this.scaleCoeff),Math.round(wh*this.scaleCoeff),{fillStyle:"#000"});

        this.ctx.font =  "normal "+Math.round((w/4)*this.scaleCoeff)+"px 'Open Sans'";
        this.squares[id].textColor = "#737373";

        if (this.ctx.fillStyle!=this.squares[id].textColor)
            this.ctx.fillStyle = this.squares[id].textColor;
        /*if (this.squares[key].status == 1)
         this.ctx.fillStyle = "#fff";*/



        this.ctx.fillText(this.squares[id].line,x+((w/(w/4))*this.scaleCoeff),y+((h/4)*this.scaleCoeff));
        if (this.squares[id].place.length == 1){
            this.ctx.fillText(this.squares[id].place,x+((w-(w/4*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
        }else if (this.squares[id].place.length == 2){
            this.ctx.fillText(this.squares[id].place,x+((w-1.5*(w/4*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
        }else if (this.squares[id].place.length == 3){
            this.ctx.fillText(this.squares[id].place,x+((w-2.5*(w/4*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
        }
        //log("Rendered..");
        //log(this.layoutSquares[0]);
    };
    this.drawZoom = function(){
        if(this.moving) return;
        var wh = this.squareWH;
        var cw = this.box2.width();
        var ch = this.box2.height();
        for (var key in this.squares){
            var x = (this.squares[key].x-this.minX)*this.scaleCoeff2+this.XCoeff2;
            var y = (this.squares[key].y-this.minY)*this.scaleCoeff2+this.YCoeff2;
            var w = this.squares[key].w;
            var h = this.squares[key].h;
            this.ctx2.fillStyle = this.squares[key].color0;
            this.ctx2.fillRect(x,y,w*this.scaleCoeff2,h*this.scaleCoeff2);
        }
    };

    this.drawLight = function(priceGroupId,callback0){
        if (priceGroupId==undefined || this.lighting) return;
        this.lighting = true;
        if (typeof callback0 == "function")
            callback0();
        //
        var wh = this.squareWH;
        //var grd=this.ctx.createRadialGradient(wh*this.scaleCoeff/2,wh*this.scaleCoeff/2,wh*this.scaleCoeff,wh*this.scaleCoeff/2,wh*this.scaleCoeff/2,wh*this.scaleCoeff/4);
        var count = 0;
        var self = this;
        var t1 = window.setInterval(function(){
            if (count>2) {
                self.render();
                window.clearInterval(t1);
                self.lighting = false;
                //this.reLoadLayout();
                return;
            }
            count += 0.2;
            for (var key in self.squares){
                if (self.squares[key].priceGroupId != priceGroupId || self.squares[key].order_id!=-1 || self.squares[key].status==0) continue;
                var x = Math.round((self.squares[key].x)*self.scaleCoeff+self.XCoeff)+1;
                var y = Math.round((self.squares[key].y)*self.scaleCoeff+self.YCoeff)+1;
                var w = +self.squares[key].w;
                var h = +self.squares[key].h;
                var scaledW = Math.round(w*self.scaleCoeff);
                var scaledH = Math.round(h*self.scaleCoeff);

                var grd=self.ctx.createRadialGradient(x+w*self.scaleCoeff/2,y+h*self.scaleCoeff/2,w*self.scaleCoeff/(count),x+w*self.scaleCoeff/2,y+h*self.scaleCoeff/2,(h*self.scaleCoeff)/(10*count));
                grd.addColorStop(1,"#e6e5e1");
                grd.addColorStop(0,self.squares[key].color0);
                self.ctx.fillStyle=grd;


                self.canvasRadiusFill(x+(scaledW/60),y+(scaledH/40),scaledW,scaledH,
                    Math.round(w/10*self.scaleCoeff),
                    Math.round(w/10*self.scaleCoeff),
                    Math.round(w/10*self.scaleCoeff),
                    Math.round(w/10*self.scaleCoeff),
                    "#c6c2c2");

                self.canvasRadiusFill(x,y,scaledW,scaledH,
                    Math.round(w/10*self.scaleCoeff),
                    Math.round(w/10*self.scaleCoeff),
                    Math.round(w/10*self.scaleCoeff),
                    Math.round(w/10*self.scaleCoeff),
                    grd);


                //self.ctx.fillRect(x,y,Math.round(w*self.scaleCoeff-2),Math.round(h*self.scaleCoeff-2));

                var x2 = Math.round((self.squares[key].x)*self.scaleCoeff2);
                var y2 = Math.round((self.squares[key].y)*self.scaleCoeff2);

                var grd2=self.ctx2.createRadialGradient(x2+w*self.scaleCoeff2/2,y2+h*self.scaleCoeff2/2,w*self.scaleCoeff2/(4*count),x2+w*self.scaleCoeff2/2,y2+h*self.scaleCoeff2/2,(h*self.scaleCoeff2)/(50*count));
                grd2.addColorStop(0,"#ffffff");
                grd2.addColorStop(1,self.squares[key].color0);
                //self.ctx2.fillStyle=grd2;

                self.canvasRadiusFill(x+(scaledW/60),y+(scaledH/40),scaledW,scaledH,
                    Math.round(w/10*self.scaleCoeff),
                    Math.round(w/10*self.scaleCoeff),
                    Math.round(w/10*self.scaleCoeff),
                    Math.round(w/10*self.scaleCoeff),
                    "#c6c2c2");

                self.canvasRadiusFill(x,y,scaledW,scaledH,
                    Math.round(w/10*self.scaleCoeff),
                    Math.round(w/10*self.scaleCoeff),
                    Math.round(w/10*self.scaleCoeff),
                    Math.round(w/10*self.scaleCoeff),
                    grd2);

                //self.ctx2.fillRect(x2,y2,Math.round(w*self.scaleCoeff2),Math.round(h*self.scaleCoeff2));

                self.squares[key].lighted = true;
            }


        },100);
        //setTimeout(function(){this.setLayout();},1500);
    };
    this.drawUnLight = function(priceGroupId,callback0){
        if (this.lighting) return;
        this.lighting = true;
        if (typeof callback0 == "function")
            callback0();

        for (var key in this.squares){
            if (priceGroupId!=undefined)
                if (this.squares[key].priceGroupId != priceGroupId || this.squares[key].order_id!=-1  || this.squares[key].status==0) continue;
            this.squares[key].lighted = undefined;
        }
        this.render();
        this.lighting = false;

        setTimeout(function(){
            //this.reLoadLayout();
        },150);

    };
    this.drawLightOne = function(id){

        var wh = this.squareWH;
        var count = 0;
        if (this.timersForLight[id]!=undefined) return;
        var self = this;
        this.timersForLight[id] = window.setInterval(function(){
            if (count>2) {
                window.clearInterval(self.timersForLight[id]);
                delete self.timersForLight[id];
                self.drawSquare(id);
                //this.reLoadLayout();
                //log(this.layoutSquares);
                return;
            }

            count += 0.2;
            var x = Math.round((self.squares[id].x)*self.scaleCoeff+self.XCoeff)+1;
            var y = Math.round((self.squares[id].y)*self.scaleCoeff+self.YCoeff)+1;
            var w = +self.squares[id].w;
            var h = +self.squares[id].h;
            var scaledW = Math.round(w*self.scaleCoeff);
            var scaledH = Math.round(h*self.scaleCoeff);

            var grd=self.ctx.createRadialGradient(x+wh*self.scaleCoeff/2,y+wh*self.scaleCoeff/2,wh*self.scaleCoeff/(count),x+wh*self.scaleCoeff/2,y+wh*self.scaleCoeff/2,(wh*self.scaleCoeff)/(10*count));
            grd.addColorStop(1,"#e6e5e1");
            grd.addColorStop(0,self.squares[id].color0);
            //self.ctx.fillStyle=grd;


            /*self.canvasRadiusFill(x+(scaledW/60),y+(scaledH/40),scaledW,scaledH,
                Math.round(w/10*self.scaleCoeff),
                Math.round(w/10*self.scaleCoeff),
                Math.round(w/10*self.scaleCoeff),
                Math.round(w/10*self.scaleCoeff),
                "#c6c2c2");*/

            self.canvasRadiusFill(x,y,scaledW,scaledH,
                Math.round(w/10*self.scaleCoeff),
                Math.round(w/10*self.scaleCoeff),
                Math.round(w/10*self.scaleCoeff),
                Math.round(w/10*self.scaleCoeff),
                grd);


            //self.ctx.fillRect(x,y,Math.round(wh*self.scaleCoeff-2),Math.round(wh*self.scaleCoeff-2));

            /*var x2 = Math.round((self.squares[id].x)*self.scaleCoeff2);
            var y2 = Math.round((self.squares[id].y)*self.scaleCoeff2);

            var grd2=self.ctx2.createRadialGradient(x2+wh*self.scaleCoeff2/2,y2+wh*self.scaleCoeff2/2,wh*self.scaleCoeff2/(4*count),x2+wh*self.scaleCoeff2/2,y2+wh*self.scaleCoeff2/2,(wh*self.scaleCoeff2)/(50*count));
            grd2.addColorStop(0,"#ffffff");
            grd2.addColorStop(1,self.squares[id].color0);
            //self.ctx2.fillStyle=grd2;


            self.canvasRadiusFill(x2+(scaledW/60),y2+(scaledH/40),scaledW,scaledH,
                Math.round(w/10*self.scaleCoeff),
                Math.round(w/10*self.scaleCoeff),
                Math.round(w/10*self.scaleCoeff),
                Math.round(w/10*self.scaleCoeff),
                "#c6c2c2");

            self.canvasRadiusFill(x2,y2,scaledW,scaledH,
                Math.round(w/10*self.scaleCoeff),
                Math.round(w/10*self.scaleCoeff),
                Math.round(w/10*self.scaleCoeff),
                Math.round(w/10*self.scaleCoeff),
                grd2);
*/
            //self.ctx2.fillRect(x2,y2,Math.round(wh*self.scaleCoeff2),Math.round(wh*self.scaleCoeff2));




        },100);
        //setTimeout(function(){this.setLayout();},1500);
    };

    // Если ничего нет - возвращаем обычный таймер
    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
            };
    })();



    this.render = function(callback){

        //log(this.timersForLight);
        var cw = this.canvas.width();
        var ch = this.box.height();
        this.ctx.clearRect(0,0,cw,ch);
        if (!this.moving)
            this.ctx2.clearRect(0,0,cw,ch);
        this.drawObjects();
        this.drawZoom();
        this.drawSquares();
        if (typeof callback=="function"){
            callback();
        }

    };




    this.load = function(params,callback){
        this.loadParams = params;
        this.reLoadCallback = (typeof params.reLoadCallback=="function") ? params.reLoadCallback : function(){};
        this.loadObjectsParam = (typeof params.loadObjectsParam=="object") ? params.loadObjectsParam :undefined;
        if (typeof this.loadParams!="object") this.loadParams = {};
        var object0 = (this.loadParams.object!=undefined) ? this.loadParams.object : "action_scheme";
        var params2 = (this.loadParams.params!=undefined) ? this.loadParams.params : {action_id:1};
        var self = this;
        MB.Core.sendQuery({command:"get",object:object0,sid:sid,params:params2},function(data){
            self.createSquares(data);
            if (typeof callback=="function")
                callback(data);
            //navigator.init();


            $.contextMenu({
                selector: '.context-menu-one',
                appendTo:self.box,
                zIndex:110,
                events:{
                    hide:function(){
                        this.contextmenu_ready = false;
                    }

                },
                items: {
                    "contextToTicket": {name: "Перейти к билету", callback:function(){
                        if (!this.contextmenu_ready) return;
                        open_ticket(self.squares[this.contextmenu_ready].ticket_id, self.squares[this.contextmenu_ready].ticket_status);
                        this.contextmenu_ready = false;
                        //log("Перейти к билету "+this.contextmenu_ready);
                    }},
                    separator1: "-----",
                    "contextToOrder": {name: "Перейти в заказ", callback:function(){
                        if (!this.contextmenu_ready) return;
                        open_order(self.squares[this.contextmenu_ready].order_id);
                        this.contextmenu_ready = false;
                        //log(this.squares[this.contextmenu_ready].order_id);
                    }}
                }
            });
            $('.context-menu-one').contextMenu(false);






        });

        selector.init({
            parentBox:this.box,
            zIndex:102
        });


    };
    this.reLoad = function(callback){
        if (typeof this.loadParams!="object") this.loadParams = {};
        var object = (this.loadParams.object!=undefined) ? this.loadParams.object : "action_scheme";
        var params2 = (this.loadParams.params!=undefined) ? this.loadParams.params : {action_id:1};
        params2.refresh_time = 200;

        //this.loadObjects();
        var self = this;
        MB.Core.sendQuery({command:"get",object:object,sid:sid,params:params2},function(data){
            self.updateSquares(data);
            if(typeof callback=="function"){
                callback();
            }
            if (typeof self.reLoadCallback == "function"){
                self.reLoadCallback();
            }
            //price_info.load_info(action_item);

            //this.autoReload();
        });






    };
    this.reLoadLayoutChild = function(key,wh,cw,ch){
        var x = Math.round((this.squares[key].x)*this.scaleCoeff+this.XCoeff);
        var y = Math.round((this.squares[key].y)*this.scaleCoeff+this.YCoeff);
        if (x<=cw && x>=0 && y <=ch && y>=0){
            var layout = this.mouseOnLayout(x,y);
            if (layout!==false) {
                this.layoutSquares[layout].shapes.push(this.squares[key].id);
            }
            layout = this.mouseOnLayout(x+wh*this.scaleCoeff,y);
            if (layout!==false) {
                this.layoutSquares[layout].shapes.push(this.squares[key].id);
            }
            layout = this.mouseOnLayout(x+wh*this.scaleCoeff,y+wh*this.scaleCoeff);
            if (layout!==false) {
                this.layoutSquares[layout].shapes.push(this.squares[key].id);
            }
            layout = this.mouseOnLayout(x,y+wh*this.scaleCoeff);
            if (layout!==false) {
                this.layoutSquares[layout].shapes.push(this.squares[key].id);
            }
            layout = this.mouseOnLayout(x-wh,y-wh);
            if (layout!==false)
                this.layoutSquares[layout].shapes.push(this.squares[key].id);
        }
    };
    this.reLoadLayout = function(){
        var wh = this.squareWH;
        //var wh = this.squareWH*this.scaleCoeff;
        var cw = this.cWidth;
        //var ch = this.canvas.height();
        var ch = this.cHeight;

        for (var key in this.squares){
            this.reLoadLayoutChild(key,wh,cw,ch);
        }
    };
    this.zoomToPoint = function(x,y){
        if (x==undefined){
            x = this.toPointX;
            y = this.toPointY;
        }
        this.toPointX = x;
        this.toPointY = y;
        var dX = (x-this.XCoeff2)*this.scaleCoeff/(this.scaleCoeff2)-this.box.width()/2;
        var dY = (y-this.YCoeff2)*this.scaleCoeff/(this.scaleCoeff2)-this.box.height()/2;
        this.XCoeff = -dX;
        this.YCoeff = -dY;
        this.render();
        this.reLoadLayout();
    };
    this.addToSelection = function(id){
        if ($.inArray(id,this.selection)!=-1 || this.selection.length>1000) return;
        this.selection.push(id);
        this.drawLightOne(id);
    };
    this.removeFromSelection = function(id){
        var index = $.inArray(id,this.selection);
        delete this.selection[index];
    };
    this.clearSelection = function(){
        this.selection = [];
    };
    this.init();


}





var selector = {
    xStart:0,
    yStart:0,
    el:undefined,
    selecting:false,
    init:function(params){
        var parent = (params.parentBox!=undefined) ? params.parentBox : "body";
        var zIndex = (params.zIndex!=undefined) ? params.zIndex : 2;
        if ($("#select_rect").length==0)
            $(parent).append('<div id="select_rect"></div>');

        $("#select_rect").css("zIndex",zIndex);
        this.el = $("#select_rect");

    },
    selectStart:function(x,y){
        this.selecting = true;
        this.xStart = x;
        this.yStart = y;
        this.el.css({width:0,height:0,top:y+"px",left:x+"px"}).fadeIn(150);

    },
    selectMove:function(x,y,callback){
        var w = (x-this.xStart-10);
        var h = (y-this.yStart-10);
        this.el.css({width:w+"px",height:h+"px"});
        if (typeof callback=="function"){
            callback(this.xStart,this.yStart,w,h);
        }
    },
    selectStop:function(x,y,callback){
        if (!this.selecting) return;
        this.selecting = false;
        var w = (x-this.xStart-10);
        var h = (y-this.yStart-10);
        this.el.fadeOut(250);
        if (typeof callback=="function")
            callback(this.xStart,this.yStart,w,h);
    }



};
selector_outer = selector;


