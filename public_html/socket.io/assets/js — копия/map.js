    var sid = MBOOKER.UserData.sid;



    var shadow = false;
    var map = {
        box:"",
        canvas:"",
        ctx:'',
        box2:"",
        canvas2:"",
        ctx2:'',
        keyboardKey: 0,
        oldMouseX:0,
        oldMouseY:0,
        startScaleCoeff: 0.3,
        scaleCoeff: 0.3,
        scaleCoeff2: 0.085,
        firstLoad:true,
        cWidth:1000,
        cHeight:600,
        minX:10000,
        maxX:0,
        maxY:0,
        minY:10000,
        XCoeff: 100,
        YCoeff: 0,
        toPointX:0,
        toPointY:0,
        squareWH:40,
        layoutSquares:{},
        layoutVCount:1,
        layoutHCount:1,
        squares:{},
        labels:{},
        hoveredSquare:0,
        moving:false,
        moveCounter:0,
        lighting:false,
        selection:[],
        selecting:-1,
        loadParams:undefined,
        loading:false,
        timersForLight:[],
        autoReloadTimer:undefined,
        autoReloadInterval:30000,
        setBoxSize:function(params){
            this.box = $("#box_for_map");
            this.box2 = $("#box_for_zoom");
            if (params!=undefined){
                if (params.box!=undefined) this.box = $("#"+params.name+ " #"+params.box);
                if (params.box2!=undefined) this.box2 = $("#"+params.name+ " #"+params.box2);
                cWidth = params.cWidth;
                cHeight = params.cHeight;
            }
            /*if ($("#canvas1").length>0){
                var el = $("#canvas1").parents(".content_box").remove();
            }*/

            this.box.html("<canvas height='2000' width='2000' id='canvas1'>Обновите браузер</canvas>");
            this.box2.html("<canvas height='380' width='380' id='canvas2'>Обновите браузер</canvas>");
            this.canvas = this.box.children("#canvas1");
            this.canvas2 = this.box.children("#canvas2");

            if ($("#hint").length==0)
                $("body").append('<div id="hint">' +
                    '<div class="status_info"><div class="label">Зона: </div><div class="status_text" id="status_area"></div></div>' +
                    '<div class="status_info"><div class="label">Ряд</div> <div class="status_text" id="status_row">9</div></div>' +
                    '<div class="status_info"><div class="label">Место</div> <div id="status_col">6</div></div>' +
                    '<!--<div class="status_info"><div class="label">Цена:</div> <div class="status_text" id="status_cost">1000руб.</div></div>-->' +
                    '<div class="status_info"><div class="label">Фонд:</div> <div class="status_text" id="status_fund">Реализация через кассы</div></div>' +
                    '<div class="status_info"><div class="label">Комментарий:</div> <div class="status_text" id="status_status">Доступно для продажи</div></div>' +
                    '<!-- <div class="status_info"><div class="label">Пояс:</div> <div class="status_text" id="status_zone">Пояс 3</div></div>-->' +
                    '<div class="status_info"><div class="label">id:</div> <div class="status_text" id="status_id"></div></div>' +
                    '</div>');



            this.box.width(cWidth-410);
            /*this.box.height(cHeight-110);*/
            this.box.height(cHeight-10);

            //this.box2.css("left",cWidth-400);

            this.box2.width(380);
            this.box2.height(215);  /// Вычислено из пропорции
            //this.box2.css("left",this.box.width()-370+"px");
            this.box2.css("left",this.box.width()+20+"px");
            this.box2.css("top",this.box.height()-151+"px");
            this.toPointX = 380/2;
            this.toPointY = 215/2;
            //$("#map_price_info").css({left:cWidth-402-$("#map_price_info").width()+"px",top:this.box.offset().top-18+"px",height:this.box.height()-25+"px"});
            if ($("#map_price_info").length>0)
                $("#map_price_info").css({left:"10px",top:this.box.offset().top-18+"px",height:this.box.height()-25+"px"});

            //map_price_info_mini_modal_header


            /*$("#right_column").width(380);*/
            //$("#right_column").css("left",cWidth-390+"px");
            /*$("#right_column").css("right",420+"px");*/
            if ($("#tickets_box").length>0)
                $("#tickets_box").css({left:cWidth-390+"px",top:"160px"});


        },
        normalizeCanvasSize:function(params){



            if (this.box.width()>this.box.height()){
                this.cWidth = this.box.width();
                this.cHeight = this.box.width();
            }else{
                this.cWidth = this.box.height();
                this.cHeight = this.box.height();
            }
            this.canvas.attr("width",this.cWidth+"px");
            this.canvas.attr("height",this.cHeight+"px");
            /*var box = document.getElementById(this.box.attr("id"));
            this.ctx=document.getElementById("canvas1").getContext('2d');*/
            //debugger;
            this.ctx=document.querySelector("#"+params.name+" #"+this.box.attr("id")+" #canvas1").getContext('2d');
            //this.ctx=document.getElementById("canvas1").getContext('2d');

            this.canvas2.attr("width","380px");
            this.canvas2.attr("height","380px");

            this.ctx2=document.querySelector("#"+params.name+" #"+this.box2.attr("id")+" #canvas2").getContext('2d');

            this.ctx.font =  "italic 20pt Arial";
            this.ctx.fillStyle = "#000";

            //navigator.init(function(){},'one_action');
            if (typeof navigator!="undefined")
                if (typeof navigator.init=="function")
                    navigator.init();


            /*map_price_info.init(function(){
             map_price_info.map_price_info_load_info(action_item,function(){
             map_price_info.map_price_info_normalize_height();
             });

             },'one_action');*/
            /*map_price_info.init(function(){
                *//*map_price_info.map_price_info_load_info(action_item,function(){
                 map_price_info.map_price_info_normalize_height();
                 });*//*

            });*/


        },

        setLayout:function(){
            this.layoutSquares = {};
            var w = this.canvas.width()/this.layoutHCount;
            var h = this.canvas.height()/this.layoutVCount;
            var count = 0;
            for (var i=0; i<this.layoutVCount;i++){
                for(var k=0;k<this.layoutHCount;k++){
                    this.layoutSquares[count] = {x:w*k,y:h*i,w:w,h:h,shapes:[]};
                    //map.ctx.strokeRect(this.layoutSquares[count].x,this.layoutSquares[count].y,this.layoutSquares[count].w,this.layoutSquares[count].h);
                    count++;
                }
            }
        },

        createSquares:function(data){
            this.loading = true;
            var self = map;
            self.squares = [];
            map.loadObjects();

            var DATA = MBOOKER.Fn.jsonToObj(data);

            for (var k in DATA){

                var index =  DATA[k].FUND_ZONE_ITEM_ID || DATA[k].PRICE_ZONE_ITEM_ID || DATA[k].HALL_SCHEME_ITEM_ID || DATA[k].ACTION_SCHEME_ID;

                self.squares[index] = {};
                self.squares[index].id = index;
                self.squares[index].areaGroup = DATA[k].AREA_GROUP_NAME;
                self.squares[index].x = +DATA[k].X;
                self.squares[index].y = +DATA[k].Y;
                self.squares[index].line = String(DATA[k].LINE);
                self.squares[index].place = String(DATA[k].PLACE);


                self.squares[index].salePrice = String(DATA[k].PRICE);
                self.squares[index].status = (DATA[k].STATUS!=undefined && DATA[k].STATUS!="") ? DATA[k].STATUS : 1;
                self.squares[index].textStatus = (DATA[k].STATUS_TEXT!=undefined && DATA[k].STATUS_TEXT!="") ? DATA[k].STATUS_TEXT : "";
                self.squares[index].fundGroup = DATA[k].FUND_GROUP_NAME;
                /*self.squares[index].fundGroupId = DATA[k].FUND_GROUP_ID;*/
                self.squares[index].priceGroup = DATA[k].PRICE_GROUP_NAME;
                self.squares[index].blocked = DATA[k].BLOCK_COLOR;
                /*self.squares[index].priceGroupId = DATA[k].PRICE_GROUP_ID;*/

                self.squares[index].color0 = DATA[k].COLOR;
                self.squares[index].color1 = DATA[k].COLOR;
                //self.squares[index].color0 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
                //self.squares[index].color1 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
                /*self.squares[index].group = DATA[k].GROUP_ID;
                self.squares[index].group_name = (DATA[k].GROUP_NAME!=undefined && DATA[k].GROUP_NAME!="") ? DATA[k].GROUP_NAME : "Автогруппа";*/
                var color = +self.squares[index].color0.replace("#","0x");

                if (color>+"0x8b5742")
                    self.squares[index].textColor = "#000";
                else
                    self.squares[index].textColor = "#fff";




                var tmX = +self.squares[index].x;
                var tmY = +self.squares[index].y;
                if (self.maxX<tmX) self.maxX = tmX;
                if (self.maxY<tmY) self.maxY = tmY;
                if (self.minX>tmX) self.minX = tmX;
                if (self.minY>tmY) self.minY = tmY;


            }
            /*$(xml).find("ROWSET").find("ROW").each(function(index) {
                index = $(this).find("ID").text();

                self.squares[index] = {};
                self.squares[index].id = $(this).find("ID").text();
                self.squares[index].areaGroup = $(this).find("AG").text();
                self.squares[index].x = +$(this).find("X").text();
                self.squares[index].y = +$(this).find("Y").text();
                self.squares[index].line = $(this).find("L").text();
                self.squares[index].place = $(this).find("P").text();
                self.squares[index].salePrice = $(this).find("SP").text();
                self.squares[index].fundGroup = $(this).find("FG").text();
                self.squares[index].fundGroupId = $(this).find("FGI").text();
                self.squares[index].priceGroup = $(this).find("PG").text();
                self.squares[index].priceGroupId = $(this).find("PGI").text();
                self.squares[index].status = ($(this).find("S").text()!=undefined) ? +$(this).find("S").text() : 1;
                self.squares[index].blocked = $(this).find("B").text();
                self.squares[index].textStatus = $(this).find("ST").text();
                self.squares[index].ticket_id = $(this).find("TI").text();
                self.squares[index].color0 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
                self.squares[index].color1 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
                self.squares[index].order_id = +$(this).find("OI").text();
                self.squares[index].ticket_status = $(this).find("TS").text();
                var color = +self.squares[index].color0.replace("#","0x");

                if (color>+"0x8b5742")
                    self.squares[index].textColor = "#000";
                else
                    self.squares[index].textColor = "#fff";




                var tmX = +self.squares[index].x;
                var tmY = +self.squares[index].y;
                if (self.maxX<tmX) self.maxX = tmX;
                if (self.maxY<tmY) self.maxY = tmY;
                if (self.minX>tmX) self.minX = tmX;
                if (self.minY>tmY) self.minY = tmY;

            });*/
            //log("Squares loaded..." + self.maxY);
            if (self.firstLoad){
                self.setScaleCoff();
                self.autoReloadStart();

                map.box.mousewheel(function(e,delta){

                    /*map.XCoeff = e.offsetX-500;
                     map.YCoeff = e.offsetY-500;*/
                    //var W = map.cWidth; //1510

                    var W =2200;
                    var step = 0.2;
                    if(map.scaleCoeff<=0.2)
                        step = 0.02;

                    if(delta>0){
                        map.scaleCoeff +=step;
                        map.XCoeff -= W*step;
                        map.YCoeff -= 0;
                    }else{
                        if(map.scaleCoeff<=0.4) return;
                        map.scaleCoeff -=step;
                        map.XCoeff += W*step;
                        map.YCoeff += 0;
                    }
                    if (map.scaleCoeff>0.9)
                        shadow = true;
                    else
                        shadow = false;
                    map.zoomToPoint(map.toPointX,map.toPointY);
                    map.render();
                    map.reLoadLayout();

                });
                map.box.mousemove(function(e,delta){
                    if (map.loading) return;
                    var hovered = false;
                    /* if (tickets_stack==undefined)
                     tickets_stack_box = {}*/

                    switch (e.which){
                        case 1:
                            switch (map.keyboardKey){
                                case 32:
                                    if (map_price_info.moving || navigator.moving || tickets_stack_box.moving) {
                                        return;
                                    }
                                    map.moving = true;
                                    map.hideStatus();
                                    if (map.oldMouseX==0 || map.oldMouseY==0){
                                        map.oldMouseX = e.offsetX;
                                        map.oldMouseY = e.offsetY;
                                        return;
                                    }
                                    map.XCoeff += e.offsetX - map.oldMouseX;
                                    map.YCoeff += e.offsetY - map.oldMouseY;
                                    map.render();
                                    map.oldMouseX = e.offsetX;
                                    map.oldMouseY = e.offsetY;

                                    break;
                                case 13:

                                    break;
                                case 16:
                                    var x = e.offsetX;
                                    var y = e.offsetY;
                                    map.selecting = 1;
                                    selector.selectMove(x,y
                                        /*,function(x0,y0,w,h){
                                        map.selection = map.squaresInRect(x0,y0,w,h);
                                    }*/
                                    );
                                    break;
                                default:

                                    if (map.keyboardKey != 16){
                                        if (map.moving) return;
                                        map.selecting = 1;
                                        map.hideStatus();
                                        var square = map.mouseOnElement(e.offsetX, e.offsetY);

                                        if (square){
                                            if (+map.squares[square].status!=1) return;
                                            map.addToSelection(square);
                                        }
                                    }

                                    break;


                            }
                            break;
                        case 2:
                            switch (map.keyboardKey){
                                case 13:

                                    break;
                                default:
                                    if (map.oldMouseX==0 || map.oldMouseY==0){
                                        map.oldMouseX = e.offsetX;
                                        map.oldMouseY = e.offsetY;
                                        return;
                                    }
                                    map.moving = true;
                                    map.moveCounter++;
                                    if (map.moveCounter%2!=0) return;

                                    map.XCoeff += e.offsetX - map.oldMouseX;
                                    map.YCoeff += e.offsetY - map.oldMouseY;

                                    map.oldMouseX = e.offsetX;
                                    map.oldMouseY = e.offsetY;

                                    var dX = -map.XCoeff;
                                    var dY = -map.YCoeff;
                                    /*var dX = (x*this.box.width()/this.box2.width())*this.scaleCoeff/this.startScaleCoeff-this.box.width()/2;
                                     var dY = (y*this.box.height()/this.box2.height())*this.scaleCoeff/this.startScaleCoeff-this.box.height()/2;*/
                                    map.toPointX = ((2*dX+map.box.width())*map.box2.width()*map.startScaleCoeff)/(2*map.box.width()*map.scaleCoeff);
                                    map.toPointY = ((2*dY+map.box.height())*map.box2.height()*map.startScaleCoeff)/(2*map.box.height()*map.scaleCoeff);

                                    map.render();

                                    break;
                            }

                            break;
                        case 3:
                            switch (map.keyboardKey){
                                case 13:

                                    break;
                                case 16:
                                    x = e.offsetX;
                                    y = e.offsetY;
                                    map.selecting = 0;
                                    selector.selectMove(x,y
                                      /*  ,function(x0,y0,w,h){
                                        map.selection = map.squaresInRect(x0,y0,w,h);
                                    }*/
                                    );
                                    break;
                                default:
                                    map.contextmenu_ready = false;
                                    if (map.keyboardKey != 16){
                                        if (map.moving) return;
                                        map.selecting = 0;
                                        map.hideStatus();
                                        var square = map.mouseOnElement(e.offsetX, e.offsetY);

                                        if (square){
                                            if (+map.squares[square].status==0 && +map.squares[square].status!=2) return;
                                            map.addToSelection(square);
                                        }
                                    }
                            }

                            break;
                        default:
                            switch (map.keyboardKey){
                                case 32:
                                    break;
                                case 13:

                                    break;
                                default:

                                    square = map.mouseOnElement(e.offsetX, e.offsetY);

                                    if (square != map.hoveredSquare && map.hoveredSquare!=0){
                                        map.hideStatus();
                                        /*  var x0 = map.squares[map.hoveredSquare].x*map.scaleCoeff+map.XCoeff;
                                         var y0 = map.squares[map.hoveredSquare].y*map.scaleCoeff+map.YCoeff;
                                         var wh0 = map.squareWH*map.scaleCoeff;
                                         //map.squares[square].color0 = "#FFE116";
                                         map.ctx.clearRect(x0,y0,wh0,wh0);
                                         map.ctx.fillStyle =  map.squares[map.hoveredSquare].color0;
                                         map.ctx.fillRect(x0,y0,wh0,wh0);*/
                                        //map.showStatus({status_area:'',status_row:'0',status_col:'0',status_cost:'',status_fond:'',status_status:'',status_zone:''});

                                    }
                                    if (square){

                                        //  square содержит id места на котором произведен hover
                                        map.hoveredSquare = square;
                                        /*  var x = map.squares[square].x*map.scaleCoeff+map.XCoeff;
                                         var y = map.squares[square].y*map.scaleCoeff+map.YCoeff;
                                         var wh = map.squareWH*map.scaleCoeff;*/
                                        //map.squares[square].color0 = "#FFE116";
                                        /* map.ctx.clearRect(x,y,wh,wh);
                                         map.ctx.fillStyle =  "#0f0";
                                         map.ctx.fillRect(x,y,wh,wh);*/
                                        //log(e.offsetY+parseInt(map.box.css("top"))+20);
                                        //log(map.box.offset().top);
                                        map.showStatus({
                                            /* x:e.offsetX+parseInt(map.box.offset().left)+20,
                                             y:e.offsetY+parseInt(map.box.offset().top)+20,*/

                                            x:e.offsetX+20,
                                            y:e.offsetY+20,
                                            status_area:map.squares[square].areaGroup,
                                            status_row:map.squares[square].line,
                                            status_col:map.squares[square].place,
                                            status_cost:map.squares[square].salePrice,
                                            status_fund:map.squares[square].fundGroup,
                                            status_status:map.squares[square].textStatus,
                                            status_zone:map.squares[square].priceGroup,
                                            status_id:map.squares[square].id
                                        });
                                        //$("#clear_tickets_stack").html(map.squares[square].x+"x"+map.squares[square].y);
                                    }

                                    break;


                            }



                            break;


                    }



                });
                /*map.box.contextmenu(function(e){
                 return false;
                 });*/

    ////for (var key in mp.squares){send_query({command:"edit",subcommand:"block_by_cashier",sid:sid,params:{action_scheme_id:mp.squares[key].id}},function(){});}
                map.box.mousedown(function(e){
                    map.moveCounter = 0;
                    map.autoReloadStop();
                    switch (e.which){
                        case 1:    /// левая кнопка мыши
                            switch (map.keyboardKey){
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
                                    //log(map.mouseOnElement(e.offsetX, e.offsetY));
                                    //var sq = map.squares[map.mouseOnElement(e.offsetX, e.offsetY)];
                                    /* var square = map.mouseOnElement(e.offsetX, e.offsetY);

                                     if (square){
                                     if (!+map.squares[square].status) return;
                                     //  square содержит id места на котором произведен клик.
                                     map.blockUnblockSquare(square);
                                     }*/

                                    //map.drawSquares();
                                    //map.ctx.fillRect(sq.x,sq.y,map.squareWH);

                                    break;
                            }
                            break;
                        case 2:


                            break;
                        case 3:
                            switch (map.keyboardKey){
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
                                    //log(map.mouseOnElement(e.offsetX, e.offsetY));
                                    //var sq = map.squares[map.mouseOnElement(e.offsetX, e.offsetY)];
                                    var square = map.mouseOnElement(e.offsetX, e.offsetY);
                                    if (square){
                                        //log(square);
                                        if (!map.squares[square].status){
                                            map.contextmenu_ready = square;
                                        }
                                    }
                                    /* //  square содержит id места на котором произведен клик.
                                     var x2 = map.squares[square2].x*map.scaleCoeff+map.XCoeff;
                                     var y2 = map.squares[square2].y*map.scaleCoeff+map.YCoeff;
                                     var wh2 = map.squareWH*map.scaleCoeff;
                                     map.squares[square2].color0 = map.squares[square2].color1;
                                     map.ctx.clearRect(x2,y2,wh2,wh2);
                                     map.ctx.fillStyle =  map.squares[square2].color0;
                                     map.ctx.fillRect(x2,y2,wh2,wh2);*/
                                    // }
                                    //map.reLoad();
                                    //map.loadJ();

                                    //map.drawSquares();
                                    //map.ctx.fillRect(sq.x,sq.y,map.squareWH);

                                    break;
                            }

                            break;
                        default:

                            break;


                    }



                });
                map.box.click(function(e){

                    switch (e.which){
                        case 1:    /// левая кнопка мыши
                            switch (map.keyboardKey){
                                case 32:
                                    // пробел
                                    break;
                                case 13:
                                    // esc

                                    break;
                                default:
                                    //  Любая или никакой
                                    //log(map.mouseOnElement(e.offsetX, e.offsetY));
                                    //var sq = map.squares[map.mouseOnElement(e.offsetX, e.offsetY)];
                                    if (map.moving) return;
                                    var square = map.mouseOnElement(e.offsetX, e.offsetY);

                                    /* if (square){
                                     if (!+map.squares[square].status) return;
                                     //  square содержит id места на котором произведен клик.
                                     map.blockUnblockSquare(square);
                                     }*/

                                    //map.drawSquares();
                                    //map.ctx.fillRect(sq.x,sq.y,map.squareWH);

                                    break;
                            }
                            break;
                        case 2:


                            break;
                        case 3:
                            switch (map.keyboardKey){
                                case 32:
                                    // пробел
                                    break;
                                case 13:
                                    // esc

                                    break;
                                default:
                                    //  Любая или никакой
                                    //log(map.mouseOnElement(e.offsetX, e.offsetY));
                                    //var sq = map.squares[map.mouseOnElement(e.offsetX, e.offsetY)];
                                    var square2 = map.mouseOnElement(e.offsetX, e.offsetY);
                                    if (square2){
                                        /* //  square содержит id места на котором произведен клик.
                                         var x2 = map.squares[square2].x*map.scaleCoeff+map.XCoeff;
                                         var y2 = map.squares[square2].y*map.scaleCoeff+map.YCoeff;
                                         var wh2 = map.squareWH*map.scaleCoeff;
                                         map.squares[square2].color0 = map.squares[square2].color1;
                                         map.ctx.clearRect(x2,y2,wh2,wh2);
                                         map.ctx.fillStyle =  map.squares[square2].color0;
                                         map.ctx.fillRect(x2,y2,wh2,wh2);*/
                                    }
                                    map.reLoad();
                                    //map.loadJ();

                                    //map.drawSquares();
                                    //map.ctx.fillRect(sq.x,sq.y,map.squareWH);

                                    break;
                            }

                            break;
                        default:

                            break;


                    }



                });
                map.box.mouseup(function(e){
                    var x = e.offsetX;
                    var y = e.offsetY;
                    if (map.contextmenu_ready) {
                        $('.context-menu-one').contextMenu(true);
                    } else
                        $('.context-menu-one').contextMenu(false);

                    selector.selectStop(x,y,function(x0,y0,w,h){
                     map.selection = map.squaresInRect(x0,y0,w,h);
                     }
                    );

                    //map.autoReloadStart();
                    if (map.moving){
                        window.setTimeout(function(){
                            map.moving=false;
                            map.render();
                            map.reLoadLayout();
                        },50);
                    }
                    sendSelection(map.selecting);
                    /* map.XCoeff = 0;
                     map.YCoeff = 0;*/
                    map.oldMouseX = 0;
                    map.oldMouseY = 0;
                    map.selecting = -1;
                    map.reLoadLayout();

                    /*if(e.which==2 || (e.which==1 && map.keyboardKey==32)){

                     }*/





                    //map.drawSquares();
                });

                map.box.dblclick(function(e){
                    switch (e.which){
                        case 1:    /// левая кнопка мыши
                            switch (map.keyboardKey){
                                case 32:
                                    // пробел
                                    break;
                                case 13:
                                    // esc

                                    break;
                                default:
                                    //  Любая или никакой
                                    //log(map.mouseOnElement(e.offsetX, e.offsetY));
                                    //var sq = map.squares[map.mouseOnElement(e.offsetX, e.offsetY)];
                                    var square = map.mouseOnElement(e.offsetX, e.offsetY);

                                    if (square){
                                        if (+map.squares[square].status==0) return;
                                        //  square содержит id места на котором произведен клик.

                                        open_order(square,"RESERVED");

                                    }

                                    //map.drawSquares();
                                    //map.ctx.fillRect(sq.x,sq.y,map.squareWH);

                                    break;
                            }
                            break;
                        case 2:


                            break;
                        case 3:
                            switch (map.keyboardKey){
                                case 32:
                                    // пробел
                                    break;
                                case 13:
                                    // esc

                                    break;
                                default:


                                    //map.drawSquares();
                                    //map.ctx.fillRect(sq.x,sq.y,map.squareWH);

                                    break;
                            }

                            break;
                        default:

                            break;


                    }



                });


                $(document).keydown(function(e){
                    map.keyboardKey = e.which;
                    switch (e.which){
                        case 32:
                            map.box.css("cursor","move");
                            break;
                    }
                });
                $(document).keyup(function(e){
                    map.keyboardKey = 0;
                    map.box.css("cursor","default");
                });

                map.box.mouseleave(function(){
                    map.hideStatus();
                });

                self.firstLoad = false;
            }

            //self.render();


            window.setTimeout(function(){
                self.loading = false;
                self.reLoadLayout();
            },350);




        },
        /*createSquares:function(xml){
         var self = map;
         $(xml).find("ROWSET").find("ROW").each(function(index) {
         index = $(this).find("ID").text();


         self.squares[index] = {};
         self.squares[index].id = $(this).find("ID").text();
         self.squares[index].areaGroup = $(this).find("AREA_GROUP").text();
         self.squares[index].x = +$(this).find("X").text();
         self.squares[index].y = +$(this).find("Y").text();
         self.squares[index].line = $(this).find("LINE").text();
         self.squares[index].place = $(this).find("PLACE").text();
         self.squares[index].salePrice = $(this).find("SALE_PRICE").text();
         self.squares[index].fundGroup = $(this).find("FUND_GROUP").text();
         self.squares[index].priceGroup = $(this).find("PRICE_GROUP").text();
         self.squares[index].priceGroupId = $(this).find("PRICE_GROUP_ID").text();
         self.squares[index].status = +$(this).find("STATUS").text();
         self.squares[index].blocked = $(this).find("BLOCKED").text();
         self.squares[index].textStatus = $(this).find("TEXT_STATUS").text();
         self.squares[index].color0 = $(this).find("COLOR").text();
         self.squares[index].color1 = $(this).find("COLOR").text();
         self.squares[index].order_id = +$(this).find("ORDER_ID").text();
         self.squares[index].order_status = $(this).find("ORDER_STATUS").text();
         var color = +self.squares[index].color0.replace("#","0x");

         if (color>+"0x8b5742")
         self.squares[index].textColor = "#000";
         else
         self.squares[index].textColor = "#fff";




         var tmX = +self.squares[index].x;
         var tmY = +self.squares[index].y;
         if (self.maxX<tmX) self.maxX = tmX;
         if (self.maxY<tmY) self.maxY = tmY;
         if (self.minX>tmX) self.minX = tmX;
         if (self.minY>tmY) self.minY = tmY;


         });
         //log("Squares loaded..." + self.maxY);
         if (self.firstLoad){
         self.setScaleCoff();
         self.firstLoad = false;
         }

         //self.render();
         tickets_stack.loadStack();



         },*/
        /**
         * Функция подгружает обводки и надписи для схемы мероприятия
         * *
         */
        loadObjects:function(){
            var subcommand = "action_scheme_object";
            //var params = {action_id:1};
            var params = {};
            if (typeof this.loadObjectsParam=="object"){
                subcommand = this.loadObjectsParam.subcommand;
                params = this.loadObjectsParam.params;
            }

            var self = this;
            MBOOKER.Fn.sendQuery({command:"get",subcommand:subcommand,sid:sid,params:params},function(data){
                //var obj = xmlToObject(data,"ROW");
                var obj = MBOOKER.Fn.jsonToObj(data,"ROW");
                for(var k in obj){

                    if(obj[k]['OBJECT_TYPE']!="STROKE" && obj[k]['OBJECT_TYPE']!="LABEL") continue;
                    var index = obj[k]['OBJECT_ID'];
                    self.labels[index] = {};
                    self.labels[index].type = obj[k]['OBJECT_TYPE'];
                    self.labels[index].value = (obj[k]['VALUE']!=undefined) ? obj[k]['VALUE'] : "";
                    self.labels[index].x = (obj[k]['X']!=undefined) ? obj[k]['X'] : 0;
                    self.labels[index].y = (obj[k]['Y']!=undefined) ? obj[k]['Y'] : 0;
                    self.labels[index].rotation = (obj[k]['ROTATION']!=undefined) ? +obj[k]['ROTATION']*Math.PI/180 : false;
                    self.labels[index].fontSize = (obj[k]['FONT_SIZE']!=undefined) ? obj[k]['FONT_SIZE'] : 10;
                    self.labels[index].fontStyle = (obj[k]['FONT_STYLE']!=undefined) ? obj[k]['FONT_STYLE'] : "normal";
                    self.labels[index].fontFamily = (obj[k]['FONT_FAMILY']!=undefined) ? obj[k]['FONT_FAMILY'] : "Arial";
                    self.labels[index].fontDecaration = (obj[k]['TEXT_DECARATION']!=undefined) ? obj[k]['TEXT_DECARATION'] : "none";
                    self.labels[index].color1 = (obj[k]['COLOR1']!=undefined) ? obj[k]['COLOR1'] : "#000000";
                    self.labels[index].color2 = (obj[k]['COLOR2']!=undefined) ? obj[k]['COLOR2'] : "#FFFFFF";
                    self.labels[index].color3 = (obj[k]['COLOR3']!=undefined) ? obj[k]['COLOR3'] : "#000000";
                    self.labels[index].color4 = (obj[k]['COLOR4']!=undefined) ? obj[k]['COLOR4'] : "#FFFFFF";
                    self.labels[index].another = (obj[k]['ANOTHER']!=undefined) ? obj[k]['ANOTHER'] : "";
                }
                self.render();
                //self.drawObjects();

            });

        },
        updateSquares:function(data){
            var self = this;
            var DATA = MBOOKER.Fn.jsonToObj(data);

            for (var k in DATA){

                var index =  DATA[k].FUND_ZONE_ITEM_ID || DATA[k].PRICE_ZONE_ITEM_ID || DATA[k].HALL_SCHEME_ITEM_ID || DATA[k].ACTION_SCHEME_ID;

                self.squares[index] = {};
                self.squares[index].id = index;
                self.squares[index].areaGroup = DATA[k].AREA_GROUP_NAME;
                self.squares[index].x = +DATA[k].X;
                self.squares[index].y = +DATA[k].Y;
                self.squares[index].line = String(DATA[k].LINE);
                self.squares[index].place = String(DATA[k].PLACE);


                self.squares[index].salePrice = String(DATA[k].PRICE);
                self.squares[index].status = (DATA[k].STATUS!=undefined && DATA[k].STATUS!="") ? DATA[k].STATUS : 1;
                self.squares[index].textStatus = (DATA[k].STATUS_TEXT!=undefined && DATA[k].STATUS_TEXT!="") ? DATA[k].STATUS_TEXT : "";
                self.squares[index].fundGroup = DATA[k].FUND_GROUP_NAME;
                /*self.squares[index].fundGroupId = DATA[k].FUND_GROUP_ID;*/
                self.squares[index].priceGroup = DATA[k].PRICE_GROUP_NAME;
                self.squares[index].blocked = DATA[k].BLOCK_COLOR;
                /*self.squares[index].priceGroupId = DATA[k].PRICE_GROUP_ID;*/

                self.squares[index].color0 = DATA[k].COLOR;
                self.squares[index].color1 = DATA[k].COLOR;
                //self.squares[index].color0 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
                //self.squares[index].color1 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
                /*self.squares[index].group = DATA[k].GROUP_ID;
                 self.squares[index].group_name = (DATA[k].GROUP_NAME!=undefined && DATA[k].GROUP_NAME!="") ? DATA[k].GROUP_NAME : "Автогруппа";*/
                var color = +self.squares[index].color0.replace("#","0x");

                if (color>+"0x8b5742")
                    self.squares[index].textColor = "#000";
                else
                    self.squares[index].textColor = "#fff";




                var tmX = +self.squares[index].x;
                var tmY = +self.squares[index].y;
                if (self.maxX<tmX) self.maxX = tmX;
                if (self.maxY<tmY) self.maxY = tmY;
                if (self.minX>tmX) self.minX = tmX;
                if (self.minY>tmY) self.minY = tmY;


            }
            /*$(xml).find("ROWSET").find("ROW").each(function(index){
                index = $(this).find("ID").text();
                if (self.squares[index] != undefined){
                    self.squares[index].id = $(this).find("ID").text();
                    self.squares[index].areaGroup = $(this).find("AG").text();
                    self.squares[index].x = +$(this).find("X").text();
                    self.squares[index].x = +$(this).find("X").text();
                    self.squares[index].y = +$(this).find("Y").text();
                    self.squares[index].line = $(this).find("L").text();
                    self.squares[index].place = $(this).find("P").text();
                    self.squares[index].salePrice = $(this).find("SP").text();
                    self.squares[index].fundGroup = $(this).find("FG").text();
                    self.squares[index].fundGroupId = $(this).find("FGI").text();
                    self.squares[index].priceGroup = $(this).find("PG").text();
                    self.squares[index].priceGroupId = $(this).find("PGI").text();
                    self.squares[index].status = ($(this).find("S").text()!=undefined) ? +$(this).find("S").text() : 1;
                    self.squares[index].blocked = $(this).find("B").text();
                    self.squares[index].textStatus = $(this).find("ST").text();
                    self.squares[index].ticket_id = $(this).find("TI").text();
                    self.squares[index].color0 = $(this).find("C").text();
                    self.squares[index].color1 = $(this).find("C").text();
                    self.squares[index].order_id = +$(this).find("OI").text();
                    self.squares[index].ticket_status = $(this).find("TS").text();
                    var color = +self.squares[index].color0.replace("#","0x");

                    if (color>+"0x8b5742")
                        self.squares[index].textColor = "#000";
                    else
                        self.squares[index].textColor = "#fff";


                }


            });*/

            //log("Squares REloaded...");

            self.render();
            self.reLoadLayout();



        },


        setScaleCoff:function(){

            var bw = this.box.width();
            var bh = this.box.height();

            var w = this.maxX-this.minX+this.squareWH+bw*2/10;
            //var h = this.maxY-this.minY+this.squareWH+bh*2/10;

            if (this.cWidth<w){
                this.scaleCoeff = this.cWidth/w;
                this.startScaleCoeff = this.cWidth/w;
            }else{
                this.scaleCoeff = w/this.cWidth;
                this.startScaleCoeff = w/this.cWidth;
            }

            this.scaleCoeff2 = this.scaleCoeff*this.box2.width()/this.box.width();
            this.XCoeff = -this.minX*this.scaleCoeff+bw/40;
            /*this.YCoeff = this.minY*this.scaleCoeff+bh/40;*/
            /*this.YCoeff = (bh - (this.maxY*this.scaleCoeff-this.minY*this.scaleCoeff))/4;*/
            this.YCoeff = 0;
            //console.log(this.YCoeff);

        },
        mouseOnLayout:function(x,y){
            /*x = x*this.scaleCoeff;
             y = y*this.scaleCoeff;*/
            var wh = this.squareWH*this.scaleCoeff;
            for (var key in this.layoutSquares){
                if (x>=this.layoutSquares[key].x && x<=this.layoutSquares[key].x+this.layoutSquares[key].w && y>=this.layoutSquares[key].y && y<=this.layoutSquares[key].y+this.layoutSquares[key].h){
                    //|| x-wh>=this.layoutSquares[key].x && x<=this.layoutSquares[key].x+this.layoutSquares[key].w && y-wh>=this.layoutSquares[key].y && y<=this.layoutSquares[key].y+this.layoutSquares[key].h){
                    return key;
                }
            }
            return false;
        },
        layoutInRect:function(x0,y0,w,h){

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

        },
        squaresInRect:function(x0,y0,w,h){
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
        },
        mouseOnElement:function(x,y){

            var square = this.mouseOnLayout(x,y);
            //log("tomouseOnElement "+x+", "+y);


            if (square){
                //this.ctx.strokeRect(this.layoutSquares[square].x,this.layoutSquares[square].y,this.layoutSquares[square].w,this.layoutSquares[square].h);
                var shapes = this.layoutSquares[square].shapes;
                for(var key in shapes){
                    //this.ctx.fillStyle = "#f00";
                    //this.ctx.fillRect(10*key,10,100,100);
                    var x2 = this.squares[shapes[key]].x*this.scaleCoeff+this.XCoeff;
                    var y2 = this.squares[shapes[key]].y*this.scaleCoeff+this.YCoeff;
                    var wh = this.squareWH*this.scaleCoeff;
                    //log(this.XCoeff);
                    //log(this.squares[shapes[key]].w);
                    //this.ctx.fillRect(x2,y2,this.squareWH*this.scaleCoeff,this.squareWH*this.scaleCoeff);
                    //this.ctx.fillRect(this.squares[shapes[key]].x,this.squares[shapes[key]].y,this.squares[shapes[key]].w,this.squares[shapes[key]].h,{fillStyle:"#f00"});
                    if(x>=x2 && x<=+(x2+wh) && y>=+y2 && y<=+(y2+wh)){
                        //log("mouseOnSquare "+this.squares[shapes[key]].id);
                        return this.squares[shapes[key]].id;
                    }
                }
            }
            return false;


        },
        ///  {status_area:'',status_row:'',status_col:'',status_cost:'',status_fond:'',status_status:'',status_zone:''}
        showStatus:function(status){
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
            if (status.x!=undefined && status.y!=undefined){
                if (status.y>=this.box.height()+parseInt(this.box.css("top"))-$("#hint").height())
                    status.y = this.box.height()+parseInt(this.box.css("top"))-$("#hint").height()+10;
                $("#hint").stop(true,true).animate({top:status.y+"px",left:status.x+10+"px"},450);
                $("#hint").stop(true,true).fadeIn(450);
            }
        },
        hideStatus:function(){
            var duration = 450;
            if (arguments[0]!=undefined && !isNaN(+arguments[0]))
                duration = arguments[0];
            if ($("#hint").length>0 && $("#hint").css("display")!="none")
                $("#hint").stop(true,true).delay(300).fadeOut(duration);
        },
        drawSquaresChild:function(key,wh,cw,ch){
            var x = Math.round((this.squares[key].x)*this.scaleCoeff+this.XCoeff);
            var y = Math.round((this.squares[key].y)*this.scaleCoeff+this.YCoeff);
            if (x<0 || y<0 || x>cw-(cw*2/100) || y>ch-(ch*2/100))
                return;


            //if (this.squares[key].lighted!=undefined && this.squares[key].priceGroupId == 6 && this.squares[key].order_id==-1){
            if (this.squares[key].lighted!=undefined){
                var grd=this.ctx.createRadialGradient(x+wh*this.scaleCoeff/2,y+wh*this.scaleCoeff/2,wh*this.scaleCoeff/2,x+wh*this.scaleCoeff/2,y+wh*this.scaleCoeff/2,(wh*this.scaleCoeff)/(20));
                grd.addColorStop(1,"#e6e5e1");
                grd.addColorStop(0,this.squares[key].color0);
                this.ctx.fillStyle=grd;
            }else{
                this.ctx.fillStyle = this.squares[key].color0;
            }
            if (shadow && !map.moving && 1!=1){
                this.ctx.shadowOffsetX = 2*this.scaleCoeff;
                this.ctx.shadowOffsetY = 2*this.scaleCoeff;
                this.ctx.shadowBlur = 8*this.scaleCoeff;
                this.ctx.shadowColor = "#000";
            }
            if (typeof selected_order_id!="undefined"){
                if (this.squares[key].order_id==selected_order_id){
                    if(this.squares[key].ticket_status=="RESERVED"){
                        this.ctx.fillStyle = "#F00";
                        this.squares[key].status = 2;
                    }else
                        this.ctx.fillStyle = "#DB0000";


                }
            }


            //if (key == 1642) log(this.ctx.fillStyle);
            this.ctx.fillRect(x,y,Math.round(wh*this.scaleCoeff),Math.round(wh*this.scaleCoeff));
            if (shadow && !map.moving){
                this.ctx.shadowOffsetX =0;
                this.ctx.shadowOffsetY = 0;
                this.ctx.shadowBlur = 0;
            }

            this.ctx.strokeStyle = "#000";

            this.ctx.strokeRect(x,y,Math.round(wh*this.scaleCoeff),Math.round(wh*this.scaleCoeff));
            if (!map.moving){
                map.ctx.font =  "italic "+Math.round((wh/2.5)*this.scaleCoeff)+"px Arial";

            //map.ctx.fillStyle = "#000";

                if (map.ctx.fillStyle!=this.squares[key].textColor)
                    map.ctx.fillStyle = this.squares[key].textColor;
            /*if (this.squares[key].status == 1)
             map.ctx.fillStyle = "#fff";*/


                    this.ctx.fillText(this.squares[key].line,x+((wh/(wh/2.5))*this.scaleCoeff),y+((wh/2.5)*this.scaleCoeff));
                if (this.squares[key].place.length == 1){
                    this.ctx.fillText(this.squares[key].place,x+((wh-(wh/2.5*0.9))*this.scaleCoeff),y+((wh-wh/10)*this.scaleCoeff));
                }else if (this.squares[key].place.length == 2){
                    this.ctx.fillText(this.squares[key].place,x+((wh-1.5*(wh/2.5*0.9))*this.scaleCoeff),y+((wh-wh/10)*this.scaleCoeff));
                }
            }
        },
        drawSquares:function(){
            //this.ctx.font =  "italic "+Math.round(3*sc)+"pt Arial";
            var wh = this.squareWH;
            //var wh = this.squareWH*this.scaleCoeff;
            var cw = this.canvas.width();
            //var ch = this.canvas.height();
            var ch = this.box.height();




            //map.ctx.fillText("sadsads",210,210,100);

            for(var i in this.layoutSquares){
                this.layoutSquares[i].shapes = [];
            }
            /* var count = 0;
             var boxWidth = this.box.width();
             var boxHeight = this.box.height();*/
            //var count = 0;
            for (var key in this.squares){
                this.drawSquaresChild(key,wh,cw,ch);
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
        },

        drawSVG:function(object,callback){
            var context = this.ctx;
            var context2 = this.ctx2;
            var self = this;
            var string = object.value;
            context.beginPath();
            context2.beginPath();
            (function execCommand(){
                if (!string.match(/[A-Z]/)){
                    context.strokeStyle=object.color1;
                    context.fillStyle=object.color2;
                    context.fill();
                    context.stroke();

                    context2.strokeStyle=object.color3;
                    context2.fillStyle=object.color4;
                    context2.fill();
                    context2.stroke();
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
                    //coors[k] = +coors[k]*self.scaleCoeff;
                    if (k%2==0){
                        coors[k] = +coors[k]*self.scaleCoeff+self.XCoeff;
                    }else{
                        coors[k] = +coors[k]*self.scaleCoeff+self.YCoeff;
                    }

                }
                for (var k2 in coors2){
                    //coors[k] = +coors[k]*self.scaleCoeff;
                    if (k2%2==0){
                        coors2[k2] = +coors2[k2]*self.scaleCoeff2;
                    }else{
                        coors2[k2] = +coors2[k2]*self.scaleCoeff2;
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

        },
        drawObjects:function(){
            var self = this;
            var oldValues = {};

            oldValues.font = "normal 10pt Arial";
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

            for(var k2 in strokes){
                if (k2==strokes.length-1){
                    this.drawSVG(strokes[k2],function(){
                        self.ctx.font = oldValues.font;
                        self.ctx.fillStyle = oldValues.fillStyle;
                        self.ctx.strokeStyle = oldValues.strokeStyle;
                        for(var k1 in labels){
                            if (labels[k1].fontStyle+" "+labels[k1].fontSize*self.scaleCoeff+"pt "+labels[k1].fontFamily != oldValues.font){
                                self.ctx.font = labels[k1].fontStyle+" "+labels[k1].fontSize*self.scaleCoeff+"pt "+labels[k1].fontFamily;
                                oldValues.font = labels[k1].fontStyle+" "+labels[k1].fontSize*self.scaleCoeff+"pt "+labels[k1].fontFamily;
                            }
                            if (labels[k1].color1 != oldValues.fillStyle){
                                self.ctx.fillStyle = labels[k1].color1;
                                oldValues.fillStyle = labels[k1].color1;
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
                    });
                    break;
                }
                this.drawSVG(strokes[k2]);
            }



        },
        drawSquare:function(id){

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

            this.ctx.fillRect(x,y,Math.round(wh*this.scaleCoeff),Math.round(wh*this.scaleCoeff));
            /* if (shadow){
             this.ctx.shadowOffsetX =0;
             this.ctx.shadowOffsetY = 0;
             this.ctx.shadowBlur = 0;
             }*/
            this.ctx.strokeRect(x,y,Math.round(wh*this.scaleCoeff),Math.round(wh*this.scaleCoeff),{fillStyle:"#000"});

            map.ctx.font =  "italic "+Math.round((wh/2.5)*this.scaleCoeff)+"px Arial";

            //map.ctx.fillStyle = "#000";
            map.ctx.fillStyle = this.squares[id].textColor;
            /*if (this.squares[id].status == 1)
             map.ctx.fillStyle = "#fff";*/
            this.ctx.fillText(this.squares[id].line,x+((wh/(wh/2.5))*this.scaleCoeff),y+((wh/2.5)*this.scaleCoeff));
            if (this.squares[id].place.length == 1){
                this.ctx.fillText(this.squares[id].place,x+((wh-(wh/2.5*0.9))*this.scaleCoeff),y+((wh-wh/10)*this.scaleCoeff));
            }else if (this.squares[id].place.length == 2){
                this.ctx.fillText(this.squares[id].place,x+((wh-1.5*(wh/2.5*0.9))*this.scaleCoeff),y+((wh-wh/10)*this.scaleCoeff));
            }

            //log("Rendered..");
            //log(this.layoutSquares[0]);
        },
        drawZoom:function(){

            var wh = this.squareWH;
            //var wh = this.squareWH* 0.566;

            var cw = this.canvas2.width();
            var ch = this.canvas2.height();
            //this.ctx2.clearRect(0,0,cw,ch);


            //this.scaleCoeff2 *= 5;

            for (var key in this.squares){

                var x = (this.squares[key].x)*this.scaleCoeff2;
                var y = (this.squares[key].y)*this.scaleCoeff2;
                //this.ctx2.fillStyle = "#000";
                //if (this.squares[key].lighted!=undefined && this.squares[key].priceGroup == 6 && this.squares[key].order_id==-1){
                if (this.squares[key].lighted!=undefined){
                    var grd=this.ctx.createRadialGradient(x+wh*this.scaleCoeff2/2,y+wh*this.scaleCoeff2/2,wh*this.scaleCoeff2/4,x+wh*this.scaleCoeff2/2,y+wh*this.scaleCoeff2/2,(wh*this.scaleCoeff2)/(50));
                    grd.addColorStop(0,"#ffffff");
                    grd.addColorStop(1,this.squares[key].color0);
                    this.ctx2.fillStyle=grd;
                }else{
                    this.ctx2.fillStyle = this.squares[key].color0;
                }

                this.ctx2.fillRect(x,y,wh*this.scaleCoeff2,wh*this.scaleCoeff2);
                /* this.ctx2.strokeStyle = "rgba(0, 0, 0, 0.72)";
                 this.ctx2.strokeRect(x,y,wh*this.scaleCoeff2,wh*this.scaleCoeff2);*/



            }
            /* var frameCoeff = this.scaleCoeff2/this.scaleCoeff;
             x = this.XCoeff*this.scaleCoeff2;
             y = this.YCoeff*this.scaleCoeff2;

             this.ctx2.strokeStyle = "#f00";
             this.ctx2.strokeRect(x,y,cw/(this.scaleCoeff+1),ch/(this.scaleCoeff+1));*/


        },
        drawLight:function(priceGroupId,callback0){
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
                    //map.reLoadLayout();
                    return;
                }
                count += 0.2;
                for (var key in self.squares){
                    if (self.squares[key].priceGroupId != priceGroupId || self.squares[key].order_id!=-1 || self.squares[key].status==0) continue;
                    var x = Math.round((self.squares[key].x)*self.scaleCoeff+self.XCoeff)+1;
                    var y = Math.round((self.squares[key].y)*self.scaleCoeff+self.YCoeff)+1;

                    var grd=self.ctx.createRadialGradient(x+wh*self.scaleCoeff/2,y+wh*self.scaleCoeff/2,wh*self.scaleCoeff/(count),x+wh*self.scaleCoeff/2,y+wh*self.scaleCoeff/2,(wh*self.scaleCoeff)/(10*count));
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
            //setTimeout(function(){map.setLayout();},1500);
        },
        drawUnLight:function(priceGroupId,callback0){
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
                //map.reLoadLayout();
            },150);

        },
        drawLightOne:function(id){

            var wh = this.squareWH;
            var count = 0;
            var self = this;
            if (self.timersForLight[id]!=undefined) return;
            self.timersForLight[id] = window.setInterval(function(){
                if (count>2) {
                    window.clearInterval(self.timersForLight[id]);
                    delete self.timersForLight[id];
                    self.drawSquare(id);
                    //map.reLoadLayout();
                    //log(map.layoutSquares);
                    return;
                }

                count += 0.2;
                var x = Math.round((self.squares[id].x)*self.scaleCoeff+self.XCoeff)+1;
                var y = Math.round((self.squares[id].y)*self.scaleCoeff+self.YCoeff)+1;

                var grd=self.ctx.createRadialGradient(x+wh*self.scaleCoeff/2,y+wh*self.scaleCoeff/2,wh*self.scaleCoeff/(count),x+wh*self.scaleCoeff/2,y+wh*self.scaleCoeff/2,(wh*self.scaleCoeff)/(10*count));
                grd.addColorStop(1,"#e6e5e1");
                grd.addColorStop(0,self.squares[id].color0);
                self.ctx.fillStyle=grd;

                self.ctx.fillRect(x,y,Math.round(wh*self.scaleCoeff-2),Math.round(wh*self.scaleCoeff-2));

                var x2 = Math.round((self.squares[id].x)*self.scaleCoeff2);
                var y2 = Math.round((self.squares[id].y)*self.scaleCoeff2);

                var grd2=self.ctx2.createRadialGradient(x2+wh*self.scaleCoeff2/2,y2+wh*self.scaleCoeff2/2,wh*self.scaleCoeff2/(4*count),x2+wh*self.scaleCoeff2/2,y2+wh*self.scaleCoeff2/2,(wh*self.scaleCoeff2)/(50*count));
                grd2.addColorStop(0,"#ffffff");
                grd2.addColorStop(1,self.squares[id].color0);
                self.ctx2.fillStyle=grd2;

                self.ctx2.fillRect(x2,y2,Math.round(wh*self.scaleCoeff2),Math.round(wh*self.scaleCoeff2));




            },100);
            //setTimeout(function(){map.setLayout();},1500);
        },

        render:function(){
            var cw = this.canvas.width();
            var ch = this.box.height();
            this.ctx.clearRect(0,0,cw,ch);
            //document.getElementById("canvas1").width = document.getElementById("canvas1").width;
            //this.canvas.width = this.canvas.width;
            this.ctx2.clearRect(0,0,cw,ch);
            this.drawObjects();
            this.drawSquares();
            this.drawZoom();

        },
        init:function(params){


            //log("mapInitFunc");
            this.setBoxSize(params);
            this.normalizeCanvasSize(params);
            this.setLayout();
            //box_for_zoom



            this.box2.click(function(e){
                map.zoomToPoint(e.offsetX, e.offsetY);
            });



            /*if (tickets_stack!=undefined)
                tickets_stack_box.init();*/
            //tickets_stack_box.init(function(){},'one_action');

        },
        load:function(params,callback){
            this.loadParams = params;
            this.reLoadCallback = (typeof params.reLoadCallback=="function") ? params.reLoadCallback : function(){};
            this.loadObjectsParam = (typeof params.loadObjectsParam=="object") ? params.loadObjectsParam :undefined;
            if (typeof this.loadParams!="object") this.loadParams = {};
            var subcommand = (this.loadParams.subcommand!=undefined) ? this.loadParams.subcommand : "action_scheme";
            var params2 = (this.loadParams.params!=undefined) ? this.loadParams.params : {action_id:1};
            var self = this;

            MBOOKER.Fn.sendQuery({command:"get",subcommand:subcommand,sid:sid,params:params2},function(data){
                self.createSquares(data);
                if (typeof callback=="function")
                    callback(data);
                //navigator.init();


                $.contextMenu({
                    selector: '.context-menu-one',
                    appendTo:map.box,
                    zIndex:110,
                    events:{
                        hide:function(){
                            map.contextmenu_ready = false;
                        }

                    },
                    items: {
                        "contextToTicket": {name: "Перейти к билету", callback:function(){
                            if (!map.contextmenu_ready) return;
                            open_ticket(map.squares[map.contextmenu_ready].ticket_id, map.squares[map.contextmenu_ready].ticket_status);
                            map.contextmenu_ready = false;
                            //log("Перейти к билету "+map.contextmenu_ready);
                        }},
                        separator1: "-----",
                        "contextToOrder": {name: "Перейти в заказ", callback:function(){
                            if (!map.contextmenu_ready) return;
                            open_order(map.squares[map.contextmenu_ready].order_id);
                            map.contextmenu_ready = false;
                            //log(map.squares[map.contextmenu_ready].order_id);
                        }}
                    }
                });
                $('.context-menu-one').contextMenu(false);






            });

            selector.init({
                parentBox:map.box,
                zIndex:102
            });


        },
        reLoad:function(callback){
            if (typeof this.loadParams!="object") this.loadParams = {};
            var subcommand = (this.loadParams.subcommand!=undefined) ? this.loadParams.subcommand : "action_scheme";
            var params2 = (this.loadParams.params!=undefined) ? this.loadParams.params : {action_id:1};
            params2.refresh_time = 200;
            var self = this;
            //this.loadObjects();
            MBOOKER.Fn.sendQuery({command:"get",subcommand:subcommand,sid:sid,params:params2},function(data){
                self.updateSquares(data);
                if(typeof callback=="function"){
                    callback();
                }
                if (typeof self.reLoadCallback == "function"){
                    self.reLoadCallback();
                }
                //price_info.load_info(action_item);

                //self.autoReload();
            });






        },
        autoReloadStart:function(){
           /* this.autoReloadTimer = window.setInterval(function(){
                map.reLoad();
            },this.autoReloadInterval);*/

        },
        autoReloadStop:function(){
            window.clearInterval(this.autoReloadTimer);
        },
        reLoadLayoutChild:function(key,wh,cw,ch){
            var x = Math.round((map.squares[key].x)*map.scaleCoeff+map.XCoeff);
            var y = Math.round((map.squares[key].y)*map.scaleCoeff+map.YCoeff);
            /*if (x<0 || y<0 || x>cw-(cw*2/100) || y>ch-(ch*2/100))
             continue;
             */




            //this.ctx.fillText("sadsads",100,100);
            if (x<=cw && x>=0 && y <=ch && y>=0){
                var layout = map.mouseOnLayout(x,y);
                if (layout) {
                    map.layoutSquares[layout].shapes.push(map.squares[key].id);
                }
                layout = map.mouseOnLayout(x+wh*map.scaleCoeff,y);
                if (layout) {
                    map.layoutSquares[layout].shapes.push(map.squares[key].id);
                }
                layout = map.mouseOnLayout(x+wh*map.scaleCoeff,y+wh*map.scaleCoeff);
                if (layout) {
                    map.layoutSquares[layout].shapes.push(map.squares[key].id);
                }
                layout = map.mouseOnLayout(x,y+wh*map.scaleCoeff);
                if (layout) {
                    map.layoutSquares[layout].shapes.push(map.squares[key].id);
                }
                //this.layoutSquares[this.mouseOnLayout(x+wh*this.scaleCoeff,y+wh*this.scaleCoeff)].shapes.push(this.squares[key].id);
                if (map.mouseOnLayout(x-wh,y-wh))
                    map.layoutSquares[map.mouseOnLayout(x-wh,y-wh)].shapes.push(map.squares[key].id);
            }
        },
        reLoadLayout:function(){
            //log("reLayout");
            var wh = map.squareWH;
            //var wh = this.squareWH*this.scaleCoeff;
            var cw = map.canvas.width();
            //var ch = this.canvas.height();
            var ch = map.box.height();

            for (var key in map.squares){
                this.reLoadLayoutChild(key,wh,cw,ch);
            }
        },

        /*blockUnblockSquare:function(square){
            map.squares[square].color0 = "#000";
            var oldText = map.squares[square].textColor;
            map.squares[square].textColor = "#fff";
            map.render();
            send_query({command:"operation",subcommand:"block_by_cashier",sid:sid,params:{action_scheme_id:map.squares[square].id}},function(data){
                if (+$(data).find("result").find("rc").text()==0){
                    *//*if(tickets_stack.stack[square]==undefined){
                     tickets_stack.addTicket(square);
                     }else{
                     tickets_stack.removeTicket(square);
                     }*//*
                    //map.reLoad();
                    if (tickets_stack!=undefined)
                        tickets_stack.loadStack();

                }else{
                    *//*if (tickets_stack.stack[square]!=undefined)*//*
                    alert_yesno("<span style='color:#f00;'>Ошибка.</span>",$(data).find("result").find("message").text(),"Ок","",function(){
                        map.squares[square].textColor = oldText;
                        map.squares[square].color0 = map.squares[square].color1;
                        map.reLoad();
                    },function(){
                        map.squares[square].textColor = oldText;
                        map.squares[square].color0 = map.squares[square].color1;
                        map.reLoad();
                    });

                }



                //map.reLoad();
                //map.loadJ();
            });
        },*/
        zoomToPoint:function(x,y){
            if (x==undefined){
                x = this.toPointX;
                y = this.toPointY;
            }
            this.toPointX = x;
            this.toPointY = y;
            var dX = (x*this.box.width()/this.box2.width())*this.scaleCoeff/this.startScaleCoeff-this.box.width()/2;
            var dY = (y*this.box.height()/this.box2.height())*this.scaleCoeff/this.startScaleCoeff-this.box.height()/2;

            this.XCoeff = -dX;
            this.YCoeff = -dY;
            this.render();
        },
        addToSelection:function(id){
            if ($.inArray(id,this.selection)!=-1 || this.selection.length>1000) return;
            this.selection.push(id);
            this.drawLightOne(id);
        },
        removeFromSelection:function(id){
            var index = $.inArray(id,this.selection);
            delete this.selection[index];
        },
        clearSelection:function(){
            this.selection = [];
        }
        /*sendSelection:function(block){
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
                send_query({command:"operation",subcommand:subcmd,sid:sid,params:{action_scheme_id:places}},function(data){
                    self.clearSelection();

                    tickets_stack.loadStack();
                    //self.reLoad();
                });
                for(var k2 in reserved){
                    send_query({command:"operation",subcommand:"cancel_ticket",sid:sid,params:{action_scheme_id:reserved[k2]}},function(data){})
                }
            }
        }*/

    };



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

