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



function MapEditor(params){
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
    this.scaleCoeff2 =  0.085;
    this.firstLoad = true;
    this.rightColWidth = 410;
    this.cWidth = 1000;
    this.cHeight = 600;
    this.navWideSide = 200;
    this.navNarrowSide = 110;
    this.minX = 10000;
    this.maxX = 0;
    this.maxY = 0;
    this.minY = 10000;
    this.XCoeff =  100;
    this.YCoeff =  0;
    this.XCoeff2 =  0;
    this.YCoeff2 =  0;
    this.toPointX = 0;
    this.toPointY = 0;
    this.squareWH = 40;
    this.squareW = 40;
    this.squareH = 40;
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
    this.backgroundImage = {
        image: new Image(),
        loaded:false,
        showed:false,
        x:0,
        y:0
    };

    this.shadowImage = new Image();
    //this.loadBackgroundFlag = true;
    this.mode = 'squares';
    this.modes = ['background','squares','strokes','labels'];
    this.downX = 0;
    this.downY = 0;

    this.init = function(){
        this.setBoxSize();
        this.normalizeCanvasSize();
        this.setLayout();
        var self = this;
        this.box2.click(function(e){
            self.zoomToPoint(e.offsetX, e.offsetY);
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




        this.box.html("<canvas height='"+this.cHeight+"' width='"+(this.cWidth-this.rightColWidth)+"' id='canvas1'>Обновите браузер</canvas>" +
            "<div id='topHint'>" +
                "<span id='status_area'></span>" +
                "<span id='status_row'></span>" +
                "<span id='status_col'></span>" +
                "<span id='status_row'></span>" +
                "<span id='status_cost'></span>" +
                "<span id='status_fund'></span>" +
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
        this.box2.height(this.navNarrowSide);  /// Вычислено из пропорции
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
        this.ctx2.fillStyle = "#a9a9a9";
    };

    this.setLayout = function(){
        this.layoutSquares = {};
        var w = this.box.width()/this.layoutHCount;
        var h = this.box.height()/this.layoutVCount;

        var count = 0;
        for (var i=0; i<this.layoutVCount;i++){
            for(var k=0;k<this.layoutHCount;k++){
                this.layoutSquares[count] = {x:w*k,y:h*i,w:w,h:h,shapes:[]};
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

            this.squares[index].color0 = DATA[k].COLOR;
            this.squares[index].color1 = DATA[k].COLOR;
            this.squares[index].color1 = DATA[k].COLOR;
            this.squares[index].group = DATA[k].GROUP_ID;
            this.squares[index].group_name = (DATA[k].GROUP_NAME!=undefined && DATA[k].GROUP_NAME!="") ? DATA[k].GROUP_NAME : "Автогруппа";
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
        if (this.firstLoad){
            if (DATA[0] == undefined){
                this.maxX = this.cWidth;
                this.maxY = this.cHeight;
                this.minX = 0;
                this.minY = 0;
            }
            this.setScaleCoff();
            var self = this;
            $("#ScaleCoef").change(function(){
                var val = +$(this).val();
                if (isNaN(val)) return;
                self.scaleCoeff = val;
            });

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
                var x1 = (x-self.XCoeff)/self.scaleCoeff;
                var y1 = (y-self.YCoeff)/self.scaleCoeff;
                switch (self.mouseKey){
                    case 1:
                        switch (self.keyboardKey){
                            case 32:
                                self.moving = true;
                                self.hideStatus();
                                if (self.oldMouseX==0 || self.oldMouseY==0){
                                    self.oldMouseX = e.offsetX;
                                    self.oldMouseY = e.offsetY;
                                    return;
                                }
                                self.XCoeff += e.offsetX - self.oldMouseX;
                                self.YCoeff += e.offsetY - self.oldMouseY;
                                self.render();
                                self.oldMouseX = e.offsetX;
                                self.oldMouseY = e.offsetY;

                                break;
                            case 13:

                                break;
                            case 16:
                                switch (self.mode){
                                    case 'squares':

                                        self.selecting = 1;
                                        selector.selectMove(x,y);
                                        break;
                                    case 'strokes':
                                        switch (+self.strokes.point_mode){
                                            case 1:


                                                break;
                                            case 2:
                                                self.selecting = 1;
                                                selector.selectMove(x,y);

                                                break;
                                        }

                                        break;
                                    case 'labels':

                                        self.selecting = 1;
                                        selector.selectMove(x,y);

                                        break;
                                }



                                break;
                            case 17:
                                switch (self.mode){
                                    case 'background':
                                        //debugger;
                                        var dX = +(x-self.downX)/self.scaleCoeff;
                                        var dY = +(y-self.downY)/self.scaleCoeff;

                                        self.backgroundImage.x += dX;
                                        self.backgroundImage.y += dY;
                                        self.downX = x;
                                        self.downY = y;
                                        self.render();


                                        break;
                                    case 'squares':

                                        break;
                                    case 'strokes':
                                        switch (+self.strokes.point_mode){
                                            case 1:


                                                break;
                                            case 2:
                                                /// смещаем точки
                                                //var items = self.strokes.items;
                                                var items = self.strokes.items;
                                                for (var k in items){
                                                    var points = items[k].points;
                                                    for (var k2 in points){
                                                        if (!points[k2].selected) continue;
                                                        var dX = +(e.offsetX-self.downX)/self.scaleCoeff;
                                                        var dY = +(e.offsetY-self.downY)/self.scaleCoeff;
                                                        var Xnew = +points[k2].X + dX;
                                                        var Ynew = +points[k2].Y + dY;
                                                        self.strokes.movePoint(Xnew,Ynew,points[k2]);

                                                    }

                                                }
                                                self.downX = e.offsetX;
                                                self.downY = e.offsetY;
                                                self.render();

                                                break;
                                        }

                                        break;
                                    case 'labels':

                                        /// смещаем надписи
                                        //var items = self.strokes.items;
                                        var labels = self.labels;
                                        for (var l in labels){
                                            var label = labels[l];

                                            if (label.type!="LABEL" || !label.selected) continue;

                                            var dX = (e.offsetX-self.downX)/self.scaleCoeff;
                                            var dY = (e.offsetY-self.downY)/self.scaleCoeff;
                                            var Xnew = label.x + dX;
                                            var Ynew = label.y + dY;
                                            label.x = Xnew;
                                            label.y = Ynew;
                                        }
                                        self.downX = e.offsetX;
                                        self.downY = e.offsetY;
                                        self.render();


                                        break;
                                }
                                break;
                            default:

                                switch (self.mode){
                                    case 'squares':
                                        if (self.keyboardKey != 16){
                                            if (self.moving) return;
                                            self.selecting = 1;
                                            self.hideStatus();
                                            var square = self.mouseOnElement(x, y);

                                            if (square){
                                                //if (+self.squares[square].status!=1) return;
                                                self.addToSelection(square);
                                            }
                                        }
                                        break;
                                    case 'strokes':
                                        switch (+self.strokes.point_mode){
                                            case 1:


                                                break;
                                            case 2:
                                                /// выбираем точку
                                                var point = self.mouseOnPoint(x1,y1);
                                                if (point && !point.selected){
                                                    point.selected = true;
                                                    self.render();
                                                }

                                                break;
                                        }

                                        break;
                                    case 'labels':

                                        /// выбираем надпись
                                        var label = self.mouseOnLabel(x1,y1);
                                        if (label && !label.selected){

                                            label.selected = true;
                                            self.render();
                                        }


                                        break;
                                }

                                break;


                        }
                        break;
                    case 2:
                        switch (self.keyboardKey){
                            case 13:

                                break;
                            default:
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
                               /* if (self.oldMouseX==0 || self.oldMouseY==0){
                                    self.oldMouseX = e.offsetX;
                                    self.oldMouseY = e.offsetY;
                                    return;
                                }
                                self.moving = true;
                                self.moveCounter++;
                                if (self.moveCounter%2!=0) return;

                                self.XCoeff += e.offsetX - self.oldMouseX;
                                self.YCoeff += e.offsetY - self.oldMouseY;

                                self.oldMouseX = e.offsetX;
                                self.oldMouseY = e.offsetY;

                                var dX = -self.XCoeff;
                                var dY = -self.YCoeff;
                                *//*var dX = (x*self.box.width()/self.box2.width())*self.scaleCoeff/self.startScaleCoeff-self.box.width()/2;
                                 var dY = (y*self.box.height()/self.box2.height())*self.scaleCoeff/self.startScaleCoeff-self.box.height()/2;*//*
                                self.toPointX = ((2*dX+self.box.width())*self.box2.width()*self.startScaleCoeff)/(2*self.box.width()*self.scaleCoeff);
                                self.toPointY = ((2*dY+self.box.height())*self.box2.height()*self.startScaleCoeff)/(2*self.box.height()*self.scaleCoeff);

                                self.render();*/

                                break;
                        }

                        break;
                    case 3:
                        switch (self.keyboardKey){
                            case 13:

                                break;
                            case 16:
                                switch (self.mode){
                                    case 'squares':
                                        x = e.offsetX;
                                        y = e.offsetY;
                                        self.selecting = 0;
                                        selector.selectMove(x,y/*,function(x0,y0,w,h){
                                         self.selection = self.squaresInRect(x0,y0,w,h);
                                         }*/);
                                        break;
                                    case 'strokes':
                                        switch (+self.strokes.point_mode){
                                            case 1:


                                                break;
                                            case 2:
                                                x = e.offsetX;
                                                y = e.offsetY;
                                                self.selecting = 0;
                                                selector.selectMove(x,y/*,function(x0,y0,w,h){
                                                 self.selection = self.squaresInRect(x0,y0,w,h);
                                                 }*/);

                                                break;
                                        }

                                        break;
                                    case 'labels':

                                        x = e.offsetX;
                                        y = e.offsetY;
                                        self.selecting = 0;
                                        selector.selectMove(x,y/*,function(x0,y0,w,h){
                                         self.selection = self.squaresInRect(x0,y0,w,h);
                                         }*/);



                                        break;
                                }
                                break;
                            default:
                                switch (self.mode){
                                    case 'squares':
                                        self.contextmenu_ready = false;
                                        if (self.keyboardKey != 16){
                                            if (self.moving) return;
                                            self.selecting = 0;
                                            self.hideStatus();
                                            var square = self.mouseOnElement(x, y);
                                            if (square){
                                                //if (+self.squares[square].status==0 && +self.squares[square].status!=2) return;
                                                self.removeFromSelection(square);
                                            }
                                        }
                                        break;
                                    case 'strokes':
                                        switch (+self.strokes.point_mode){
                                            case 1:

                                                break;
                                            case 2:
                                                var point = self.mouseOnPoint(x1,y1);
                                                if (point && point.selected){
                                                    point.selected = false;
                                                    self.render();
                                                }

                                                break;
                                        }

                                        break;
                                    case 'labels':

                                        /// выбираем надпись
                                        var label = self.mouseOnLabel(x1,y1);

                                        if (label && label.selected){
                                            label.selected = false;
                                            self.render();
                                        }


                                        break;
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

                                switch (self.mode){
                                    case 'squares':
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
                                        if (square/* && self.shiftState==18*/){

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

                                                x:e.offsetX+20,
                                                y:e.offsetY+20,
                                                status_area:self.squares[square].areaGroup,
                                                status_row:self.squares[square].line,
                                                status_col:self.squares[square].place,
                                                status_cost:self.squares[square].salePrice,
                                                status_fund:self.squares[square].fundGroup,
                                                status_status:self.squares[square].textStatus,
                                                status_zone:self.squares[square].priceGroup,
                                                status_id:self.squares[square].id
                                            });
                                            //$("#clear_tickets_stack").html(self.squares[square].x+"x"+self.squares[square].y);
                                        }


                                        break;
                                }
                        }
                        break;
                }
            });
            this.box.contextmenu(function(e){
             return false;
             });

            self.box.on("mousedown",function(e){
                e = fixEvent(e);
                var x = e.pageX;
                var y = e.pageY;
                self.moveCounter = 0;
                self.mouseKey = e.which;
                var x1 = (x-self.XCoeff)/self.scaleCoeff;
                var y1 = (y-self.YCoeff)/self.scaleCoeff;
                self.downX = x;
                self.downY = y;
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

                                selector.selectStart(e.offsetX,e.offsetY);


                                break;
                            default:


                                //  Любая или никакой
                                switch (self.mode){
                                    case 'strokes':
                                        switch (+self.strokes.point_mode){
                                            case 1:
                                                /*if (self.shiftState==88){  /// нажата кл x
                                                 var arr = self.strokes.items[self.strokes.selected].points.reverse();
                                                 if (arr[0]!=undefined)
                                                 x1 = arr[0].X;
                                                 }
                                                 if (self.shiftState==89){  /// нажата кл y
                                                 var arr = self.strokes.items[self.strokes.selected].points.reverse();
                                                 if (arr[0]!=undefined)
                                                 y1 = arr[0].Y;
                                                 }*/
                                                self.strokes.addPoint({
                                                    X:x1,
                                                    Y:y1,
                                                    OBJECT_ID:self.strokes.selected,
                                                    selected:false
                                                });
                                                self.strokes.loadPoints();
                                                break;
                                            case 2:
                                                /*var point = self.mouseOnPoint(x1,y1);
                                                 if (point && !point.selected){
                                                 point.selected = true;
                                                 self.render();
                                                 }*/


                                                break;
                                        }

                                        break;
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
                            case 16:
                                // shift

                                selector.selectStart(e.offsetX,e.offsetY);


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
            this.box.click(function(e){
                $(".Xinput").val((e.offsetX-self.XCoeff)/self.scaleCoeff);
                $(".Yinput").val((e.offsetY-self.YCoeff)/self.scaleCoeff);
                var x  = e.offsetX;
                var y  = e.offsetY;
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
                                if (self.moving) return;
                                var square = self.mouseOnElement(x, y);

                                /* if (square){
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
                            default:
                                //  Любая или никакой
                                //log(self.mouseOnElement(e.offsetX, e.offsetY));
                                //var sq = self.squares[self.mouseOnElement(e.offsetX, e.offsetY)];
                                var square2 = self.mouseOnElement(x, y);
                                if (square2){

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
                e = fixEvent(e);
                var x = e.pageX;
                var y = e.pageY;
                self.mouseKey = 0;

                switch (e.which){
                    case 1:
                        //self.render();
                        switch (self.mode){
                            case "background":
                                if (self.keyboardKey==17){
                                    var o = {
                                        command:"modify",
                                        object:"hall_scheme",
                                        sid:MB.User.sid,
                                        params:{
                                            hall_scheme_id:self.loadParams.params.hall_scheme_id,
                                            BACKGROUND_X:self.backgroundImage.x,
                                            BACKGROUND_Y:self.backgroundImage.y,
                                            objversion:self.objversion
                                        }
                                    };
                                    MB.Core.socketQuery(o,function(result){
                                        if (result.RC==0){
                                            self.objversion = result.OBJVERSION;
                                        }
                                    });
                                }

                                break;
                            case "squares":
                                selector.selectStop(x,y,function(x0,y0,w,h){
                                    var arr = self.squaresInRect(x0,y0,w,h);
                                    for (var k in arr){
                                        self.addToSelection(arr[k]);
                                    }
                                    //self.selection = self.selection.concat(self.squaresInRect(x0,y0,w,h));
                                    /*for( var k in self.selection){
                                     self.squares[self.selection[k]].color0 = "#F00";
                                     }*/
                                    //self.render();
                                    //self.sendSelection(self.selecting);
                                });

                                break;
                            case "strokes":
                                switch (+self.strokes.point_mode){
                                    case 2:

                                        selector.selectStop(x,y,function(x0,y0,w,h){
                                            // выделяем несколько точек
                                            var arr = self.pointsInRect(x0,y0,w,h);
                                            for (var k in arr){
                                                self.strokes.items[self.strokes.selected].points[arr[k]].selected = true;
                                            }

                                            //self.render();
                                            self.strokes.loadPoints();
                                        });
                                        break;
                                }
                                self.render();

                                break;
                            case "labels":

                                selector.selectStop(x,y,function(x0,y0,w,h){
                                    // выделяем несколько точек
                                    var arr = self.labelsInRect(x0,y0,w,h);
                                    for (var k in arr){
                                        self.labels[arr[k]].selected = true;
                                    }

                                    //self.render();
                                });


                                break;
                        }

                        if (self.mode=="strokes" && +self.strokes.point_mode==2 && self.shiftState==17){
                            self.strokes.createStrokes(self.strokes.selected);
                        }
                        break;
                    /*case 2:
                        self.render();
                        break;*/
                    case 3:


                        switch (self.mode){
                            case "squares":
                                selector.selectStop(x,y,function(x0,y0,w,h){
                                    var arr = self.squaresInRect(x0,y0,w,h);
                                    for (var k in arr){
                                        self.removeFromSelection(arr[k]);
                                    }
                                    //self.selection = self.selection.concat(self.squaresInRect(x0,y0,w,h));
                                    /*for( var k in self.selection){
                                     self.squares[self.selection[k]].color0 = "#F00";
                                     }*/
                                    //self.render();
                                    //self.sendSelection(self.selecting);
                                });
                                break;
                            case "strokes":
                                switch (+self.strokes.point_mode){
                                    case 2:

                                        selector.selectStop(x,y,function(x0,y0,w,h){
                                            // выделяем несколько точек
                                            var arr = self.pointsInRect(x0,y0,w,h);
                                            for (var k in arr){
                                                self.strokes.items[self.strokes.selected].points[arr[k]].selected = false;
                                            }

                                            //self.render();
                                        });
                                        break;
                                }

                                break;
                            case "labels":

                                selector.selectStop(x,y,function(x0,y0,w,h){
                                    // выделяем несколько точек
                                    var arr = self.labelsInRect(x0,y0,w,h);
                                    for (var k in arr){
                                        self.labels[arr[k]].selected = false;
                                    }

                                    //self.render();
                                });


                                break;
                        }




                        break;
                    default:
                        //self.render();
                        break;
                }

                if (self.moving){
                    //window.setTimeout(function(){
                        self.moving=false;
                        self.reLoadLayout();
                        self.render();
                    //},50);
                }
                /* self.XCoeff = 0;
                 self.YCoeff = 0;*/
                self.oldMouseX = 0;
                self.oldMouseY = 0;
                self.selecting = -1;
                return false;
               /* log("reLoadLayout");
                self.reLoadLayout();*/






                //self.drawSquares();
            });


            this.box.dblclick(function(e){
                e = fixEvent(e);
                var x = e.pageX;
                var y = e.pageY;
                var x1 = (x-self.XCoeff)/self.scaleCoeff;
                var y1 = (y-self.YCoeff)/self.scaleCoeff;
                switch (e.which){
                    case 1:    /// левая кнопка мыши
                        switch (self.mode){
                            case "squares":
                                selector.selectStop(x,y,function(x0,y0,w,h){
                                    var arr = self.squaresInRect(x0,y0,w,h);
                                    for (var k in arr){
                                        self.addToSelection(arr[k]);
                                    }
                                    //self.selection = self.selection.concat(self.squaresInRect(x0,y0,w,h));
                                    /*for( var k in self.selection){
                                     self.squares[self.selection[k]].color0 = "#F00";
                                     }*/
                                    self.render();
                                    //self.sendSelection(self.selecting);
                                });
                                break;
                            case "strokes":
                                switch (+self.strokes.point_mode){
                                    case 2:

                                        selector.selectStop(x,y,function(x0,y0,w,h){
                                            // выделяем несколько точек
                                            var arr = self.pointsInRect(x0,y0,w,h);
                                            for (var k in arr){
                                                self.strokes.items[self.strokes.selected].points[arr[k]].selected = true;
                                            }

                                            self.render();
                                            self.strokes.loadPoints();
                                        });
                                        break;
                                }

                                break;
                            case "labels":

                                selector.selectStop(x,y,function(x0,y0,w,h){
                                    // выделяем несколько точек
                                    var arr = self.labelsInRect(x0,y0,w,h);
                                    for (var k in arr){
                                        self.labels[arr[k]].selected = true;
                                    }

                                    self.render();
                                });


                                break;
                        }
                        if (self.mode=="strokes" && +self.strokes.point_mode==2 && self.shiftState==17){
                            self.strokes.createStrokes(self.strokes.selected);
                        }
                        break;
                    case 2:


                        break;
                    case 3:
                        switch (self.mode){
                            case "squares":
                                selector.selectStop(x,y,function(x0,y0,w,h){
                                    var arr = self.squaresInRect(x0,y0,w,h);
                                    for (var k in arr){
                                        self.removeFromSelection(arr[k]);
                                    }
                                    //self.selection = self.selection.concat(self.squaresInRect(x0,y0,w,h));
                                    /*for( var k in self.selection){
                                     self.squares[self.selection[k]].color0 = "#F00";
                                     }*/
                                    self.render();
                                    //self.sendSelection(self.selecting);
                                });
                                break;
                            case "strokes":
                                switch (+self.strokes.point_mode){
                                    case 2:

                                        selector.selectStop(x,y,function(x0,y0,w,h){
                                            // выделяем несколько точек
                                            var arr = self.pointsInRect(x0,y0,w,h);
                                            for (var k in arr){
                                                self.strokes.items[self.strokes.selected].points[arr[k]].selected = false;
                                            }

                                            self.render();
                                        });
                                        break;
                                }

                                break;
                            case "labels":

                                selector.selectStop(x,y,function(x0,y0,w,h){
                                    // выделяем несколько точек
                                    var arr = self.labelsInRect(x0,y0,w,h);
                                    for (var k in arr){
                                        self.labels[arr[k]].selected = false;
                                    }

                                    self.render();
                                });


                                break;
                        }
                        break;
                    default:

                        break;


                }



            });


            $(document).keydown(function(e){
                self.keyboardKey = e.which;
                switch (e.which){
                    case 32:
                        self.box.css("cursor","move");
                        break;
                    case 46:
                        switch (self.mode){
                            case 'strokes':
                                switch (+self.strokes.point_mode){
                                    case 2:
                                        if (self.shiftState==16){
                                            bootbox.dialog({
                                                message: "Удалить точки?",
                                                title: "",
                                                buttons: {
                                                    ok: {
                                                        label: "Да",
                                                        className: "red",
                                                        callback: function() {
                                                            self.strokes.deleteSelectedPoints();
                                                        }
                                                    },
                                                    cancel: {
                                                        label: "Отмена",
                                                        className: "green",
                                                        callback:function(){

                                                        }
                                                    }
                                                }
                                            });
                                        }
                                        break;
                                }
                                break;
                            case 'labels':

                                if (self.shiftState==16){
                                    bootbox.dialog({
                                        message: "Удалить выделеные надписи?",
                                        title: "",
                                        buttons: {
                                            ok: {
                                                label: "Да",
                                                className: "red",
                                                callback: function() {
                                                    for (var l in self.labels){
                                                        if (self.labels[l].selected)
                                                            self.deleteLabels(l);
                                                    }
                                                }
                                            },
                                            cancel: {
                                                label: "Отмена",
                                                className: "green",
                                                callback:function(){

                                                }
                                            }
                                        }
                                    });



                                }
                                break;
                        }
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
            $(document).keyup(function(e){
                if (self.shiftState==e.which) self.shiftState = 0;
                self.keyboardKey = 0;
                self.box.css("cursor","default");
            });

            this.box.mouseleave(function(){
                self.hideStatus();
            });

            this.firstLoad = false;
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
            var obj = MBOOKER.Fn.jsonToObj(data,"ROW");
            for(var k in obj){
                if(obj[k]['OBJECT_TYPE']!="STROKE" && obj[k]['OBJECT_TYPE']!="LABEL") continue;
                var index = obj[k]['OBJECT_ID'];
                self.labels[index] = {};
                self.labels[index].id = index;
                self.labels[index].type = obj[k]['OBJECT_TYPE'];
                self.labels[index].value = (obj[k]['VALUE']!="") ? obj[k]['VALUE'] : "";
                self.labels[index].name = (obj[k].ANOTHER!=undefined && obj[k].ANOTHER!=null)?obj[k].ANOTHER:"Автонаименование "+obj[k].OBJECT_ID;
                self.labels[index].x = (obj[k]['X']!="") ? +obj[k]['X'] : +0;
                self.labels[index].y = (obj[k]['Y']!="") ? +obj[k]['Y'] : +0;
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
                self.labels[index].OBJVERSION = obj[k].OBJVERSION;
                self.labels[index].points = [];
                self.labels[index].lines = [];
                if (obj[k].OBJECT_TYPE=="STROKE"){
                    self.strokes.items[index] = self.labels[index];
                    $("#for_strokes").append('<div class="one_stroke" id="one_stroke'+index+'"><span>'+self.labels[index].name+'</span><div class="one_strokes_del" id="one_strokes_del'+index+'">X</div></div>');

                    self.strokes.items[obj[k].OBJECT_ID].lines = [];
                    MB.Core.sendQuery({command:"get",object:"hall_scheme_object_item",sid:sid,params:{where:"OBJECT_ID = "+obj[k].OBJECT_ID,ORDER_BY : "OBJECT_TYPE, SORT_NO"}},function(items0){
                        var items = MB.Core.jsonToObj(items0);
                        for (var i in items){
                            if (items[i].OBJECT_TYPE=="POINT"){
                                self.strokes.items[items[i].OBJECT_ID].points[items[i].OBJECT_ITEM_ID] = items[i];
                                self.strokes.items[items[i].OBJECT_ID].points[items[i].OBJECT_ITEM_ID].selected = false;
                            }
                            if (items[i].OBJECT_TYPE=="LINE"){
                                self.strokes.items[items[i].OBJECT_ID].lines[items[i].OBJECT_ITEM_ID] = items[i];
                            }


                        }
                        self.strokes.init();
                        if ($(".one_stroke:first").length>0) $(".one_stroke:first").click();

                    });
                }else if (obj[k].OBJECT_TYPE=="LABEL"){

                    $("#for_labels").append('<div class="one_labels" id="one_labels'+self.labels[index].id+'"><span>'+self.labels[index].value+'</span><div class="one_labels_del" id="one_labels_del'+self.labels[index].id+'">X</div></div>');


                }
            }
            self.render();
            //this.drawObjects();
        });

    };
    this.updateSquares = function(data){
        var DATA = MBOOKER.Fn.jsonToObj(data);

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

            this.squares[index].color0 = DATA[k].COLOR;
            this.squares[index].color1 = DATA[k].COLOR;
            //this.squares[index].color0 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
            //this.squares[index].color1 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
            this.squares[index].group = DATA[k].GROUP_ID;
            this.squares[index].group_name = (DATA[k].GROUP_NAME!=undefined && DATA[k].GROUP_NAME!="") ? DATA[k].GROUP_NAME : "Автогруппа";
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
    this.pointsInRect = function(x0,y0,w,h){
        if (this.strokes.selected<0) return false;
        //log(x0);
        var result = [];
        var points = this.strokes.items[this.strokes.selected].points;
        for (var k in points){
            var xL = points[k].X*this.scaleCoeff+this.XCoeff;
            var yL = points[k].Y*this.scaleCoeff+this.YCoeff;
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
                if ($.inArray(k,result)==-1)
                    result.push(k);
            }
        }
        return result;


    };

    this.labelsInRect = function(x0,y0,w,h){
        var result = [];
        var labels = this.labels;
        for (var k in labels){
            var label = labels[k];
            var xL = label.x*this.scaleCoeff+this.XCoeff;
            var yL = label.y*this.scaleCoeff+this.YCoeff;
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
                if ($.inArray(k,result)==-1)
                    result.push(k);
            }
        }
        return result;


    };

    this.mouseOnElement = function(x,y){

        var square = this.mouseOnLayout(x,y);
        //log("tomouseOnElement "+x+", "+y);


        if (square!==false){
            var shapes = this.layoutSquares[square].shapes;
            for(var key in shapes){
                //this.ctx.fillStyle = "#f00";
                //this.ctx.fillRect(10*key,10,100,100);
                var x2 = this.squares[shapes[key]].x*this.scaleCoeff+this.XCoeff;
                var y2 = this.squares[shapes[key]].y*this.scaleCoeff+this.YCoeff;
                //var wh = this.squareWH*this.scaleCoeff;
                var w = this.squares[shapes[key]].w*this.scaleCoeff;
                var h = this.squares[shapes[key]].h*this.scaleCoeff;
                //log(this.XCoeff);
                //log(this.squares[shapes[key]].w);

                if(x>=x2 && x<=+(x2+w) && y>=+y2 && y<=+(y2+h)){
                    //log("mouseOnSquare "+this.squares[shapes[key]].id);
                    return this.squares[shapes[key]].id;
                }
            }
        }
        return false;


    };

    this.mouseOnPoint = function(x,y){
        var wh = +self.squareWH*self.scaleCoeff/4;
        var strokesItemms = self.strokes.items;
        for(var key in strokesItemms){
            var points = strokesItemms[key].points;
            for (var key2 in points){
                /*var x2 = points[key2].x*this.scaleCoeff+this.XCoeff;
                 var y2 = points[key2].y*this.scaleCoeff+this.YCoeff;*/
                var x2 = +points[key2].X;
                var y2 = +points[key2].Y;
                if(x>=x2 && x<=+(x2+wh) && y>=+y2 && y<=+(y2+wh)){
                    //log("mouseOnSquare "+this.squares[shapes[key]].id);
                    return points[key2];
                }
            }
        }
        return false;

    };

    this.mouseOnLabel = function(x,y){

        //var wh = this.squareWH*this.scaleCoeff/2;
        //var wh = this.squareWH*this.scaleCoeff;

        var labels = this.labels;
        for(var key in labels){
            var label = labels[key];

            if (label.type!="LABEL") continue;
            var wh = +label.fontSize;
            /*var x2 = points[key2].x*this.scaleCoeff+this.XCoeff;
             var y2 = points[key2].y*this.scaleCoeff+this.YCoeff;*/
            var x2 = +label.x;
            var y2 = +label.y-wh;


            /*var y2 = label.y-label.fontSize*self.scaleCoeff;*/

            this.ctx.strokeRect(label.x*this.scaleCoeff+this.XCoeff,(label.y-label.fontSize)*this.scaleCoeff+this.YCoeff,label.fontSize*this.scaleCoeff,label.fontSize*this.scaleCoeff);

            if(x>=x2 && x<=+(x2+wh) && y>=+y2 && y<=+(y2+wh)){

                //log("mouseOnSquare "+this.squares[shapes[key]].id);
                return label;
            }

        }
        return false;

    };

    this.toggleBackgroundImage = function(flag){
        if (flag!=undefined){
            this.backgroundImage.showed = !!flag;
        }else{
            this.backgroundImage.showed = !this.backgroundImage.showed;
        }
        $("#show_background")[0].checked = this.backgroundImage.showed;
        this.render();
        return false;
    };

    this.showStatus = function(status){
        if (this.selecting!=-1) return;
        if (typeof status != "object") return;

        /*for (var k in status){
         if ($("#"+k).length==0){

         }
         }*/

        if (status.status_area!=undefined)
            $("#status_area").text(status.status_area);
        else
            $("#status_area").text("");
        if (status.status_row!=undefined)
            $("#status_row").text(status.status_row);
        else
            $("#status_row").text("");
        if (status.status_col!=undefined)
            $("#status_col").text(status.status_col);
        else
            $("#status_col").text("");
        if (status.status_cost!=undefined)
            $("#status_cost").text(status.status_cost);
        else
            $("#status_cost").text("");
        if (status.status_fund!=undefined)
            $("#status_fund").text(status.status_fund);
        else
            $("#status_fund").text("");
        if (status.status_status!=undefined)
            $("#status_status").text(status.status_status);
        else
            $("#status_status").text("");
        if (status.status_zone!=undefined)
            $("#status_zone").text(status.status_zone);
        else
            $("#status_zone").text("");
        if (status.status_id!=undefined)
            $("#status_id").text(status.status_id);
        else
            $("#status_id").text("");
        /*if (status.x!=undefined && status.y!=undefined){
         if (status.y>=this.box.height()+parseInt(this.box.css("top"))-$("#hint").height())
         status.y = this.box.height()+parseInt(this.box.css("top"))-$("#hint").height()+10;
         $("#hint").stop(true,true).animate({top:status.y+"px",left:status.x+10+"px"},450);
         $("#hint").stop(true,true).fadeIn(450);
         }*/
    };
    this.hideStatus = function(){
        /* var duration = 450;
         if (arguments[0]!=undefined && !isNaN(+arguments[0]))
         duration = arguments[0];
         if ($("#hint").length>0 && $("#hint").css("display")!="none")
         $("#hint").stop(true,true).delay(300).fadeOut(duration);*/
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




    this.drawBackground = function(){
        if (!this.backgroundImage.showed) return;
        var x = Math.round(this.backgroundImage.x*this.scaleCoeff+this.XCoeff);
        var y = Math.round(this.backgroundImage.y*this.scaleCoeff+this.YCoeff);
        this.ctx.drawImage(this.backgroundImage.image,x,y,this.backgroundImage.image.width*3*this.scaleCoeff,this.backgroundImage.image.height*3*this.scaleCoeff);
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


        //if (this.squares[key].lighted!=undefined && this.squares[key].priceGroupId == 6 && this.squares[key].order_id==-1){
        //var color0 = "#c6c2c2";
        /*if (this.squares[key].lighted!=undefined){
            var grd=this.ctx.createRadialGradient(x+w*this.scaleCoeff/2,y+h*this.scaleCoeff/2,w*this.scaleCoeff/2,x+w*this.scaleCoeff/2,y+h*this.scaleCoeff/2,(h*this.scaleCoeff)/(20));
            grd.addColorStop(1,"#e6e5e1");
            grd.addColorStop(0,this.squares[key].color0);
            this.ctx.fillStyle=grd;
        }else{
            this.ctx.fillStyle = this.squares[key].color0;
        }*/

        if (this.squares[key].lighted!=undefined){
          color0 = "#f6ebb8";
        }else{
            color0 = "#FFFFFF";
        }


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




        //this.ctx.strokeRect(x,y,Math.round(w*this.scaleCoeff),Math.round(h*this.scaleCoeff));
        if (!this.moving){
            this.ctx.font =  "normal "+Math.round((w/4)*this.scaleCoeff)+"px 'Open Sans'";
            this.squares[key].textColor = "#737373";

            if (this.ctx.fillStyle!=this.squares[key].textColor)
                this.ctx.fillStyle = this.squares[key].textColor;
            /*if (this.squares[key].status == 1)
             this.ctx.fillStyle = "#fff";*/



            this.ctx.fillText(this.squares[key].line,x+((w/(w/4))*this.scaleCoeff),y+((h/4)*this.scaleCoeff));
            if (this.squares[key].place.length == 1){
                this.ctx.fillText(this.squares[key].place,x+((w-(w/4*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
            }else if (this.squares[key].place.length == 2){
                this.ctx.fillText(this.squares[key].place,x+((w-1.5*(w/4*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
            }else if (this.squares[key].place.length == 3){
                this.ctx.fillText(this.squares[key].place,x+((w-2.5*(w/4*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
            }

        }
    };
    this.drawSquares = function(){
        //this.ctx.font =  "italic "+Math.round(3*sc)+"pt Arial";
        //var wh = this.squareWH;
        //var wh = this.squareWH*this.scaleCoeff;
        var cw = this.canvas.width();
        //var ch = this.canvas.height();
        var ch = this.box.height();




        //this.ctx.fillText("sadsads",210,210,100);

        /*for(var i in this.layoutSquares){
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
            var color = labels[k1].color1;
            if (labels[k1].selected)
                color = labels[k1].color2;

            if (self.ctx.fillStyle != color){
                self.ctx.fillStyle = color;
                //oldValues.fillStyle = color;
            }

           /* log(oldValues.fillStyle+" | "+self.ctx.fillStyle+" | "+color);
            if (color != self.ctx.fillStyle){
                self.ctx.fillStyle = color;
                oldValues.fillStyle = color;
            }*/
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
            this.squares[id].color0);



        //this.ctx.font =  "italic "+Math.round((wh/2.5)*this.scaleCoeff)+"px Arial";

        //if (!this.moving){
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

        //}
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
            //this.ctx2.fillStyle = this.squares[key].color0;
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

                var grd=self.ctx.createRadialGradient(x+wh*self.scaleCoeff/2,y+wh*self.scaleCoeff/2,wh*self.scaleCoeff/(count),x+wh*self.scaleCoeff/2,y+wh*self.scaleCoeff/2,(wh*self.scaleCoeff)/(10*count));
                //grd.addColorStop(1,"#e6e5e1");
                grd.addColorStop(1,"#e6e5e1");
                grd.addColorStop(0,self.squares[key].color0);
                self.ctx.fillStyle=grd;

                self.ctx.fillRect(x,y,Math.round(wh*self.scaleCoeff-2),Math.round(wh*self.scaleCoeff-2));

                var x2 = Math.round((self.squares[key].x)*self.scaleCoeff2);
                var y2 = Math.round((self.squares[key].y)*self.scaleCoeff2);

                var grd2=self.ctx2.createRadialGradient(x2+wh*self.scaleCoeff2/2,y2+wh*self.scaleCoeff2/2,wh*self.scaleCoeff2/(4*count),x2+wh*self.scaleCoeff2/2,y2+wh*self.scaleCoeff2/2,(wh*self.scaleCoeff2)/(50*count));
                grd2.addColorStop(0,"#ffffff");
                grd2.addColorStop(1,self.squares[key].color0);
                self.ctx2.fillStyle=grd2;

                self.ctx2.fillRect(x2,y2,Math.round(wh*self.scaleCoeff2),Math.round(wh*self.scaleCoeff2));

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
            //grd.addColorStop(1,"#e6e5e1");
            grd.addColorStop(1,"#e6e5e1");
            grd.addColorStop(0,self.squares[id].color0);
            //self.ctx.fillStyle=grd;

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




            //self.ctx.fillRect(x,y,Math.round(wh*self.scaleCoeff-2),Math.round(wh*self.scaleCoeff-2));

            var x2 = Math.round((self.squares[id].x)*self.scaleCoeff2);
            var y2 = Math.round((self.squares[id].y)*self.scaleCoeff2);

            var grd2=self.ctx2.createRadialGradient(x2+wh*self.scaleCoeff2/2,y2+wh*self.scaleCoeff2/2,wh*self.scaleCoeff2/(4*count),x2+wh*self.scaleCoeff2/2,y2+wh*self.scaleCoeff2/2,(wh*self.scaleCoeff2)/(50*count));
            grd2.addColorStop(0,"#ffffff");
            grd2.addColorStop(1,self.squares[id].color0);
            self.ctx2.fillStyle=grd2;


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
                grd);

            //self.ctx2.fillRect(x2,y2,Math.round(wh*self.scaleCoeff2),Math.round(wh*self.scaleCoeff2));




        },100);
        //setTimeout(function(){this.setLayout();},1500);
    };
    this.render = function(){


        var cw = this.canvas.width();
        var ch = this.box.height();
        this.ctx.clearRect(0,0,cw,ch);
        if (!this.moving)
            this.ctx2.clearRect(0,0,cw,ch);
        if (this.backgroundImage.loaded!==null)
            this.drawBackground();

        this.drawObjects();
        if (this.mode == "strokes" && this.strokes.selected>=0) {
            if (this.strokes.selected<0) return;
            this.strokes.drawStrokes();
            var points = this.strokes.items[this.strokes.selected].points;
            for (var k2 in points){
                this.strokes.drawPoint(points[k2]);
            }
        }

        this.drawZoom();
        this.drawSquares();







    };

    this.load = function(params,callback){
        this.loadParams = params;
        this.reLoadCallback = (typeof params.reLoadCallback=="function") ? params.reLoadCallback : function(){};
        this.loadObjectsParam = (typeof params.loadObjectsParam=="object") ? params.loadObjectsParam :undefined;
        if (typeof this.loadParams!="object") this.loadParams = {};
        var object0 = (this.loadParams.object!=undefined) ? this.loadParams.object : "action_scheme";
        var params2 = {hall_scheme_id:this.loadParams.params.hall_scheme_id};
        var self = this;
        this.backgroundImage.image.onload = function(){
            self.backgroundImage.loaded = true;
            self.render();
        };
        this.toggleBackgroundImage(self.loadParams.params.background_show==="TRUE");
        if (this.loadParams.params.background_image!="")
            this.backgroundImage.image.src = "upload/"+this.loadParams.params.background_image;
        this.backgroundImage.x = (!isNaN(+this.loadParams.params.background_x))? +this.loadParams.params.background_x : 0;
        this.backgroundImage.y = (!isNaN(+this.loadParams.params.background_y))? +this.loadParams.params.background_y : 0;
        MB.Core.sendQuery({command:"get",object:object0,sid:sid,params:params2},function(data){
            self.createSquares(data);
            if (typeof callback=="function")
                callback(data);

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
        var params2 = {hall_scheme_id:this.loadParams.params.hall_scheme_id};
        params2.refresh_time = 200;

        //this.loadObjects();
        var self = this;
        MB.Core.sendQuery({command:"get",object:object,sid:sid,params:params2},function(data){
            self.updateSquares(data);
            if(typeof callback=="function"){
                callback();
            }
            if (typeof this.reLoadCallback == "function"){
                this.reLoadCallback();
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
        //log("reLayout");
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
        if ($.inArray(id,this.selection)!=-1/* || this.selection.length>1000*/) return;
        this.selection.push(id);
        //this.squares[id].color0 = "#f5f1e1";
        //this.squares[id].color0 = "#dad9d6";
        /*this.squares[id].color0 = "#f0f4fd";*/
        this.squares[id].color0 = "#ffff99";
        this.drawSquare(id);
    };
    this.removeFromSelection = function(id){
        var index = $.inArray(id,this.selection);
        delete this.selection[index];
        this.squares[id].color0 = this.squares[id].color1;
        this.drawSquare(id);
    };
    this.clearSelection = function(){
        for (var k in this.selection){
            this.squares[this.selection[k]].color0 = this.squares[this.selection[k]].color1;
        }
        this.selection = [];
        this.render();
    };
    this.countSelection = function(){
        var count = 0;
        for (var k in this.selection){
            count++;
        }
        return count;
    };
    this.copySelection = function(){
        var maxGroup = 0;
        for (var k in this.squares){
            if (+this.squares[k].group+1>maxGroup) maxGroup = +this.squares[k].group+1;
        }
        for (var k in this.selection){
            var obj =  {};//this.squares[this.selection[k]];
            for (var i in this.squares[this.selection[k]]){
                if (i=="id") continue;
                obj[i] = this.squares[this.selection[k]][i];
            }
            obj.group = maxGroup;
            obj.group_name = "Копия "+maxGroup;
            obj.y += 250;
            //obj.id += this.squares.length;
            this.removeFromSelection(this.squares[this.selection[k]].id);
            this.addSquare(obj);
        }
        this.clearSelection();
        this.shiftState = 0;
        $("#for_groups").append('<div class="one_group" id="one_group'+maxGroup+'"><span>'+"Копия "+maxGroup+'</span></div>');
        $("#one_group"+maxGroup).click();

        this.render();

    };
    this.loadBackground = function(){


    };
    this.init();


    var self = this;
    this.strokes =
    {
        items:[],
        selected:-1,
        point_mode:0,
        /*
         * 1 - добавление точек
         * 2 - перемещение
         * 3 - удаление
         * */
        init:function(){

            $("#for_strokes").html("");
            for (var k in self.strokes.items){

                // self.strokes.items[data[k].OBJECT_ID].points

                self.strokes.items[k].points = self.strokes.items[k].points.sort(function(a,b){
                    if (+a.SORT_NO>+b.SORT_NO) return 1;
                    if (+a.SORT_NO<+b.SORT_NO) return -1;
                    return 0;
                });
                /*if (k==115)
                 debugger;*/
                self.strokes.items[k].lines = self.strokes.items[k].lines.sort(function(a,b){
                    if (+a.SORT_NO>+b.SORT_NO) return 1;
                    if (+a.SORT_NO<+b.SORT_NO) return -1;
                    return 0;
                });

                var name = (self.strokes.items[k].name!=undefined)?self.strokes.items[k].name:"Автонаименование";
                $("#for_strokes").append('<div class="one_stroke" id="one_stroke'+self.strokes.items[k].id+'"><span>'+name+'</span><div class="one_strokes_del" id="one_strokes_del'+k+'">X</div></div>');




            }
        //this.loadPoints();

        },
        /*loadStrokes:function(){

         },*/
        add:function(){
            var name = ($("#stroke_name").val()!="") ?  $("#stroke_name").val() : "Авто";
            MB.Core.sendQuery({command:"new",object:"hall_scheme_object",sid:sid,params:{HALL_SCHEME_ID:params.environment.hall_scheme_id,OBJECT_TYPE:"STROKE",ANOTHER:name}},function(data){
                self.strokes.items[data.ID] = {
                    OBJVERSION:data.OBJVERSION,
                    name:name,
                    points:[],
                    lines:[],
                    color1:"#CCC",
                    color2:"#FFFFFF",
                    value:""
                };
                $("#for_strokes").append('<div class="one_stroke" id="one_stroke'+data.ID+'"><span>'+name+'</span><div class="one_strokes_del" id="one_strokes_del'+data.ID+'">X</div></div>');
                $("#one_stroke"+data.ID).click();
                //self.strokes.loadPoints();

            });

        },
        remove:function(id){
            var item = self.strokes.items[id];
            if (item.OBJVERSION==undefined){
                delete self.strokes.items[id];
                $("#one_stroke"+id).remove();
                if (self.strokes.selected==id) self.strokes.selected = -1;
                return;
            }


            bootbox.dialog({
                message: "<span style='color:#f00;'>Внимание!</span> Все элементы данной обводки будут удалены. Вы Уверены?",
                title: "Удалить?",
                buttons: {
                    ok: {
                        label: "Да",
                        className: "red",
                        callback: function() {
                            MB.Core.sendQuery({command:"remove",object:"hall_scheme_object",sid:sid,params:{OBJVERSION:item.OBJVERSION,OBJECT_ID:id}},function(data){
                                delete self.strokes.items[id];
                                delete self.labels[id];
                                $("#one_stroke"+id).remove();
                                if (self.strokes.selected==id) self.strokes.selected = -1;
                                self.loadObjects();
                            });
                        }
                    },
                    cancel: {
                        label: "Нет",
                        className: "green",
                        callback:function(){

                        }
                    }
                }
            });





        },
        update:function(id){
            if (isNaN(+id)) return;
            var item = self.strokes.items[id];
            self.strokes.createStrokes(id);

            MB.Core.sendQuery({command:"modify",object:"hall_scheme_object",sid:sid,params:{OBJVERSION:item.OBJVERSION,OBJECT_ID:item.id,VALUE:item.value}},function(data){
                item.OBJVERSION = data.OBJVERSION;
            });
        },
        save:function(){
            if (this.selected < 0) return;
            var OBJECT_ID = this.selected;


            var item = self.strokes.items[OBJECT_ID];
            if (item.value==null || item.OBJVERSION==undefined) return;
            var name = ($("#stroke_name").val()!="") ?  $("#stroke_name").val() : "Авто";
            MB.Core.sendQuery({command:"modify",object:"hall_scheme_object",sid:sid,params:{OBJVERSION:item.OBJVERSION,OBJECT_ID:OBJECT_ID,VALUE:item.value,ANOTHER:name}},function(data){
                item.OBJVERSION = data.OBJVERSION;
                $("#one_stroke"+OBJECT_ID+" span").text(name);
            });

            // сохраним точки
            var points = self.strokes.items[OBJECT_ID].points;
            var counter = 0;
            var point_count = 0;

            for (var p in points){
                point_count++;
                var point = points[p];
                if (point.OBJVERSION!=undefined){
                    if (point.SORT_NO==undefined) point.SORT_NO = point.OBJECT_ITEM_ID;
                    MB.Core.sendQuery({command:"modify",object:"hall_scheme_object_item",sid:sid,params:{OBJVERSION:point.OBJVERSION,OBJECT_ITEM_ID:point.OBJECT_ITEM_ID,OLD_ID:p,X:point.X,Y:point.Y,SORT_NO:point.SORT_NO}},function(data){
                        if (data.RC==0)
                            self.strokes.items[OBJECT_ID].points[data.OLD_ID].OBJVERSION = data.OBJVERSION;
                        else
                            log("modify hall_scheme_object_item !RC0");
                        counter++;
                        if (counter==point_count){
                            self.strokes.loadPoints();
                        }

                    });
                }else{
                    MB.Core.sendQuery({command:"new",object:"hall_scheme_object_item",sid:sid,params:{OBJECT_ID:OBJECT_ID,OBJECT_TYPE:"POINT",OLD_ID:p,X:point.X,Y:point.Y,SORT_NO:p}},function(data){
                        //log(data);
                        self.strokes.items[OBJECT_ID].points[data.ID] = self.strokes.items[OBJECT_ID].points[data.OLD_ID];
                        self.strokes.items[OBJECT_ID].points[data.ID].OBJECT_ITEM_ID = data.ID;
                        self.strokes.items[OBJECT_ID].points[data.ID].OBJVERSION = data.OBJVERSION;
                        self.strokes.items[OBJECT_ID].points[data.ID].SORT_NO = (data.SORT_NO!=undefined) ? data.SORT_NO : data.OLD_ID;
                        //if (self.strokes.items[OBJECT_ID].points[data.OLD_ID].OBJVERSION==undefined)
                        if (data.ID!=data.OLD_ID)
                            delete  self.strokes.items[OBJECT_ID].points[data.OLD_ID];

                        counter++;
                        if (counter==point_count){
                            self.strokes.loadPoints();
                        }

                    });
                }
            }
            // сохраним линии
            var lines = self.strokes.items[OBJECT_ID].lines;
            for (var l in lines){
                var line = lines[l];
                if (line.OBJVERSION!=undefined){

                    MB.Core.sendQuery({command:"modify",object:"hall_scheme_object_item",sid:sid,params:{OBJVERSION:line.OBJVERSION,OBJECT_ITEM_ID:line.OBJECT_ITEM_ID,OLD_ID:l,VALUE:line.VALUE,SORT_NO:line.SORT_NO}},function(data){
                        if (data.RC==0)
                            self.strokes.items[OBJECT_ID].lines[data.OLD_ID].OBJVERSION = data.OBJVERSION;
                        else
                            log("modify hall_scheme_object_item !RC0");

                    });
                }else{
                    MB.Core.sendQuery({command:"new",object:"hall_scheme_object_item",sid:sid,params:{OBJECT_ID:OBJECT_ID,OBJECT_TYPE:"LINE",OLD_ID:l,VALUE:line.VALUE,SORT_NO:line.SORT_NO}},function(data){
                        self.strokes.items[OBJECT_ID].lines[data.ID] = self.strokes.items[OBJECT_ID].lines[data.OLD_ID];
                        self.strokes.items[OBJECT_ID].lines[data.ID].OBJECT_ITEM_ID = data.ID;
                        self.strokes.items[OBJECT_ID].lines[data.ID].OBJVERSION = data.OBJVERSION;
                        //if (self.strokes.items[OBJECT_ID].lines[data.OLD_ID].OBJVERSION==undefined)
                        if (data.ID!=data.OLD_ID)
                            delete  self.strokes.items[OBJECT_ID].lines[data.OLD_ID];

                        //self.strokes.loadLines();
                    });
                }
            }



        },
        // работа с точками
        loadPoints:function(){
            if (this.selected<0 || self.strokes.items[this.selected]==undefined) return;
            $("#for_points").html("");
            log(self.strokes.items[this.selected].points);
            self.strokes.items[this.selected].points = self.strokes.items[this.selected].points.sort(function(a,b){
                if (+a.SORT_NO>+b.SORT_NO) return 1;
                if (+a.SORT_NO<+b.SORT_NO) return -1;
                return 0;
            });
            for (var k in self.strokes.items[this.selected].points){

                $("#for_points").append('<li class="one_point" id="one_point'+k+'"><span> '+Math.round(self.strokes.items[this.selected].points[k].X)+' x '+Math.round(self.strokes.items[this.selected].points[k].Y)+'</span></li>');
            }

            //$( "#for_points" ).disableSelection();
            self.render();
        },

        reLoadPointsArr:function(item_id){
            $(".one_point").each(function(index){
                if (this.id!=""){
                    var id = this.id.replace(/[^0-9]/ig,'');
                    self.strokes.items[item_id].points[id].SORT_NO = index;
                }
            });
            self.strokes.items[item_id].points = self.strokes.items[item_id].points.sort(function(a,b){
                if (+a.SORT_NO>+b.SORT_NO) return 1;
                if (+a.SORT_NO<+b.SORT_NO) return -1;
                return 0;
            });
            self.strokes.loadPoints();
            self.strokes.createStrokes(item_id);
        },
        clearPoints:function(){
            if (this.selected<0) return;
            self.strokes.items[this.selected].points = [];
        },
        addPoint:function(point){
            if (this.selected<0) return;
            if (point.SORT_NO==undefined) point.SORT_NO = self.strokes.items[this.selected].points.length+1;
            self.strokes.items[this.selected].points.push(point);
            /*MB.Core.sendQuery({command:"new",object:"hall_scheme_object_item",sid:sid,params:{OBJECT_ID:this.selected,OBJECT_TYPE:"POINT",X:point.X,Y:point.Y}},function(data){
             self.strokes.items[this.selected].points.push(point);
             self.strokes.loadPoints();

             });*/

        },
        removePoint:function(point_id){
            if (this.selected<0) return;
            var point = self.strokes.items[this.selected].points[point_id];
            if (point.OBJVERSION==undefined){
                delete self.strokes.items[self.strokes.selected].points[point_id];
                return;
            }
            MB.Core.sendQuery({command:"remove",object:"hall_scheme_object_item",sid:sid,params:{OBJVERSION:point.OBJVERSION,OBJECT_ITEM_ID:point.OBJECT_ITEM_ID}},function(data){
                delete self.strokes.items[self.strokes.selected].points[point_id];
                self.strokes.update();

            });

        },
        updatePoint:function(point_id,point){
            if (this.selected<0) return;
            for (var key in point){
                self.strokes.items[this.selected].points[point_id].key = point[key];
            }
        },
        movePoint:function(x,y,point){

            point.X = x;
            point.Y = y;


        },

        drawPoint:function(point){

            var x = point.X*self.scaleCoeff+self.XCoeff;
            var y = point.Y*self.scaleCoeff+self.YCoeff;
            if (point.selected)
                self.ctx.fillStyle = "#ff0000";
            else
                self.ctx.fillStyle = "#0000FF";
            self.ctx.fillRect(x,y,(self.squareWH*self.scaleCoeff)/4,(self.squareWH*self.scaleCoeff)/4);
        },
        deleteSelectedPoints:function(){
            var items = self.strokes.items;
            for (var k in items){
                var points = items[k].points;
                for (var k2 in points){
                    if (!points[k2].selected) continue;
                    self.strokes.removePoint(k2);
                    //delete points[k2];
                }
            }
            self.render();
            self.strokes.loadPoints();
            self.strokes.createStrokes(self.strokes.selected);

        },
        createLine:function(){
            var lineType = $("[name = lineType]:checked").val();
            if ((lineType == "M" && self.strokes.items[self.strokes.selected].lines.length>0) || (lineType != "M" && self.strokes.items[self.strokes.selected].lines.length==0))return;
            self.strokes.items[self.strokes.selected].lines.push({
                VALUE:lineType,
                OBJECT_ID:self.strokes.selected,
                SORT_NO:self.strokes.items[self.strokes.selected].lines.length+1
            });
            self.strokes.loadLines();


        },
        deleteLine:function(line_id){
            if (self.strokes.selected<0) return;
            var line  =  self.strokes.items[self.strokes.selected].lines[line_id];
            if (line==undefined) return;

            bootbox.dialog({
                message: "Удалить линию?",
                title: "",
                buttons: {
                    ok: {
                        label: "Да",
                        className: "red",
                        callback: function() {
                            if (line.OBJVERSION==undefined){
                                delete self.strokes.items[self.strokes.selected].lines[line_id];
                                return;
                            }
                            MB.Core.sendQuery({command:"remove",object:"hall_scheme_object_item",sid:sid,params:{OBJVERSION:line.OBJVERSION,OBJECT_ITEM_ID:line.OBJECT_ITEM_ID}},function(data){

                                delete self.strokes.items[self.strokes.selected].lines[line_id];
                                self.strokes.loadLines();
                                self.strokes.createStrokes(self.strokes.selected);
                                self.strokes.update();


                            });
                        }
                    },
                    cancel: {
                        label: "Нет",
                        className: "green",
                        callback:function(){

                        }
                    }
                }
            });


        },
        loadLines:function(){
            if (self.strokes.items[+self.strokes.selected]==undefined) return;

            if (+this.selected<0 || self.strokes.items[+self.strokes.selected].lines==undefined) return;
            $("#for_lines").html("");
            for (var k in self.strokes.items[self.strokes.selected].lines){
                $("#for_lines").append('<li class="one_lines" id="one_lines'+k+'"><span> '+self.strokes.items[self.strokes.selected].lines[k].VALUE+'</span><div class="one_lines_del" id="one_lines_del'+k+'">X</div></li>');
            }
            $(".one_lines_del").die("click").live("click",function(){
                var id = this.id.replace(/[^0-9]/ig,'');
                self.strokes.deleteLine(id);
            });
            /*$( "#for_lines" ).sortable(
                {
                    stop:function(){
                        //log("sdsd");
                        self.strokes.reLoadLinesArr(self.strokes.selected);
                    }
                }
            );*/
            //$( "#for_points" ).disableSelection();
        },
        reLoadLinesArr:function(item_id){
            $(".one_lines").each(function(index){
                if (this.id!=""){
                    var id = this.id.replace(/[^0-9]/ig,'');
                    self.strokes.items[item_id].lines[id].SORT_NO = index;
                }
            });
            self.strokes.items[item_id].lines = self.strokes.items[item_id].lines.sort(function(a,b){
                if (+a.SORT_NO>+b.SORT_NO) return 1;
                if (+a.SORT_NO<+b.SORT_NO) return -1;
                return 0;
            });
            self.strokes.loadLines();
            self.strokes.createStrokes(item_id);
        },

        createStrokes:function(item_id){
            if (item_id==undefined || self.strokes.items[item_id].points==undefined) return;
            var point = 0;
            var points = [];
            var s = "";
            for (var k0 in self.strokes.items[item_id].points){
                points.push(self.strokes.items[item_id].points[k0]);
            }
            //log(points);
            for (var k in self.strokes.items[item_id].lines){
                switch (self.strokes.items[item_id].lines[k].VALUE){
                    case "M":
                        if (point+1>points.length) continue;
                        s +="M"+points[point].X+" "+points[point].Y;
                        point++;
                        break;
                    case "L":
                        if (point+1>points.length) continue;
                        s +="L"+points[point].X+" "+points[point].Y;
                        point++;

                        break;
                    case "Q":
                        if (point+2>points.length) continue;
                        s +="Q"+points[point].X+" "+points[point].Y+" "+points[point+1].X+" "+points[point+1].Y;
                        point +=2;

                        break;
                    case "C":
                        if (point+3>points.length) continue;
                        s +="C"+points[point].X+" "+points[point].Y+" "+points[point+1].X+" "+points[point+1].Y+" "+points[point+2].X+" "+points[point+2].Y;//+" "+points[point+1].x+" "+points[point+1].y;
                        point +=3;
                        break;
                }
            }
            self.strokes.items[item_id].value = s;
            self.render();

        },
        drawStrokes:function(){
            for (var k in self.strokes.items){
                self.drawSVG(self.strokes.items[k]);
            }

        }



    };

    //// Работа с надписями

    this.addLabel = function(){
        var value = ($("#label_text").val()!="" && $("#label_text").val()!=undefined) ? $("#label_text").val() : "Автонадпись";
        var size = (!isNaN(parseInt($("#label_size").val()))) ? parseInt($("#label_size").val()) : 18;
        var rotation = (!isNaN(parseInt($("#label_rotation").val()))) ? parseInt($("#label_rotation").val()) : 0;
        var x = (!isNaN(+$(".Xinput").val()))?+$(".Xinput").val():100;
        var y = (!isNaN(+$(".Yinput").val()))?+$(".Yinput").val():100;
        MB.Core.sendQuery({command:"new",object:"hall_scheme_object",sid:sid,params:{
            OBJECT_TYPE:"LABEL",
            HALL_SCHEME_ID:params.environment.hall_scheme_id,
            VALUE:value,
            FONT_SIZE:size,
            ROTATION:rotation,
            X:x,
            Y:y,
            COLOR1:"#000000",
            COLOR2:"#FF0000"
        }},function(data){
            self.loadObjects();
        });
    };
    this.deleteLabels = function(id){
        var label = self.labels[id];
        MB.Core.sendQuery({command:"remove",object:"hall_scheme_object",sid:sid,params:{
            OBJECT_ID:label.id,
            OBJVERSION:label.OBJVERSION
        }},function(data){
            delete self.labels[id];
            $("#one_labels"+label.id).remove();
            self.render();
        });

    };
    this.saveLabels = function(){
        for (var k in self.labels){
            var label=self.labels[k];
            if (label.type!="LABEL") continue;
            MB.Core.sendQuery({command:"modify",object:"hall_scheme_object",sid:sid,params:{
                OBJECT_ID:label.id,
                OBJVERSION:label.OBJVERSION,
                VALUE:label.value,
                X:label.x,
                Y:label.y,
                FONT_SIZE:label.fontSize
            }},function(data){
                self.labels[data.ID].OBJVERSION = data.OBJVERSION;
            });
        }
    };


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



