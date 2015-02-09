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
    cWidth:0,
    cHeight:0,
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
    squares:[],
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
    autoReloadInterval:3000,
    backgroundImage: new Image(),
    loadBackgroundFlag:true,
    mode:'squares',
    modes:['squares','squares','strokes','labels'],
    downX:0,
    downY:0,

    setBoxSize:function(params){


        this.box = $("#box_for_map");
        this.box2 = $("#box_for_zoom");
        if (params!=undefined){
            if (params.box!=undefined) this.box = $("#"+params.box);
            if (params.box2!=undefined) this.box2 = $("#"+params.box2);
        }
        if ($("#canvas1").length>0){
            var el = $("#canvas1").parents(".content_box").remove();
        }



        this.box.html("<canvas height='2000' width='2000' id='canvas1'>Обновите браузер</canvas>");
        this.box2.html("<canvas height='380' width='380' id='canvas2'>Обновите браузер</canvas>");
        this.canvas = this.box.children("#canvas1");
        this.canvas2 = this.box.children("#canvas2");
        cWidth = $("#content_box").width();
        cHeight = $("#content_box").height();
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

        //map_price_info_mini_modal_header


        /*$("#right_column").width(380);*/
        //$("#right_column").css("left",cWidth-390+"px");
        /*$("#right_column").css("right",420+"px");*/


    },
    normalizeCanvasSize:function(){




        if (this.box.width()>this.box.height()){
            this.cWidth = this.box.width();
            this.cHeight = this.box.width();
        }else{
            this.cWidth = this.box.height();
            this.cHeight = this.box.height();
        }
        this.canvas.attr("width",this.cWidth+"px");
        this.canvas.attr("height",this.cHeight+"px");
        this.ctx=document.getElementById("canvas1").getContext('2d');

        this.canvas2.attr("width","380px");
        this.canvas2.attr("height","380px");
        this.ctx2=document.getElementById("canvas2").getContext('2d');

        this.ctx.font =  "italic 20pt Arial";
        this.ctx.fillStyle = "#000";

        //navigator.init(function(){},'one_action');
        navigator.init();


        /*map_price_info.init(function(){
         map_price_info.map_price_info_load_info(action_item,function(){
         map_price_info.map_price_info_normalize_height();
         });

         },'one_action');*/


    },

    setLayout:function(){
        this.layoutSquares = {};
        var w = this.canvas.width()/this.layoutHCount;
        var h = this.canvas.height()/this.layoutVCount;
        var count = 0;
        for (var i=0; i<this.layoutVCount;i++){
            for(var k=0;k<this.layoutHCount;k++){
                this.layoutSquares[count] = {x:w*k,y:h*i,w:w,h:h,shapes:[]};
                map.ctx.strokeRect(this.layoutSquares[count].x,this.layoutSquares[count].y,this.layoutSquares[count].w,this.layoutSquares[count].h);
                count++;
            }
        }
    },


    createSquares:function(data){
        this.loading = true;
        var self = map;
        self.squares = [];
        map.loadObjects();

        var DATA = jsonToObj(data);

        for (var k in DATA){

            var index = DATA[k].HALL_SCHEME_ITEM_ID;
            self.squares[index] = {};
            self.squares[index].id = DATA[k].HALL_SCHEME_ITEM_ID;
            self.squares[index].areaGroup = DATA[k].AREA_GROUP_ID;
            self.squares[index].x = +DATA[k].X;
            self.squares[index].y = +DATA[k].Y;
            self.squares[index].line = String(DATA[k].LINE);
            self.squares[index].place = String(DATA[k].PLACE);
            self.squares[index].color0 = DATA[k].COLOR;
            self.squares[index].color1 = DATA[k].COLOR;
            //self.squares[index].color0 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
            //self.squares[index].color1 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
            self.squares[index].group = DATA[k].GROUP_ID;
            self.squares[index].group_name = (DATA[k].GROUP_NAME.length>0) ? DATA[k].GROUP_NAME : "Автогруппа";
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


        if (self.firstLoad){
            self.firstLoadFunc();
        }

        //self.render();


        window.setTimeout(function(){
            self.loading = false;
            self.reLoadLayout();
        },350);




    },
    firstLoadFunc: function(){
        var self = this;
        //var deltaX = 0.3;
        self.setScaleCoff(function(){
            /*Math.abs(map.scaleCoeff);
            deltaX = Math.sqrt(map.scaleCoeff*10);
            log(deltaX);*/
            //map.zoomToPoint(100,100);
            //map.render();
        });
        //self.autoReloadStart();

        map.box.mousewheel(function(e,delta){
            /*map.XCoeff = e.offsetX-500;
             map.YCoeff = e.offsetY-500;*/
            //var W = map.cWidth; //1510

          /*  var W =2200;
            deltaX += delta/5;
            deltaX = Math.abs(deltaX);
            var old_deltaX = deltaX;
            map.scaleCoeff = deltaX*deltaX/10;
            map.scaleCoeff = Math.abs(map.scaleCoeff);
            log(deltaX);
            //map.XCoeff += W*(deltaX-old_deltaX);
            *//*if(delta>0){
                 map.XCoeff -= W*(deltaX-old_deltaX);
            }else{
            //             if(map.scaleCoeff<=0.4) return;
             map.XCoeff += W*0.2;
            }*//*
             if (map.scaleCoeff>0.9)
                 shadow = true;
             else
                 shadow = false;*/


            //log(map.scaleCoeff);
            //log(map.scaleCoeff);
            var W =2200;
            var step = 0.2;
            if(map.scaleCoeff<=0.2)
                step = 0.02;

            if(delta>0){
                map.scaleCoeff += step;
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
            var x = e.offsetX;
            var y = e.offsetY;
            var x1 = (e.offsetX-map.XCoeff)/map.scaleCoeff;
            var y1 = (e.offsetY-map.YCoeff)/map.scaleCoeff;
            if (map.loading) return;
            var hovered = false;

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
                            switch (map.mode){
                                case 'squares':

                                    map.selecting = 1;
                                    selector.selectMove(x,y);
                                    break;
                                case 'strokes':
                                    switch (+map.strokes.point_mode){
                                        case 1:


                                            break;
                                        case 2:
                                            map.selecting = 1;
                                            selector.selectMove(x,y);

                                            break;
                                    }

                                    break;
                                case 'labels':

                                    map.selecting = 1;
                                    selector.selectMove(x,y);

                                    break;
                            }

                            break;
                        case 17:
                            switch (map.mode){
                                case 'squares':

                                    break;
                                case 'strokes':
                                    switch (+map.strokes.point_mode){
                                        case 1:


                                            break;
                                        case 2:
                                            /// смещаем точки
                                            //var items = map.strokes.items;
                                            var items = map.strokes.items;
                                            for (var k in items){
                                                var points = items[k].points;
                                                for (var k2 in points){
                                                    if (!points[k2].selected) continue;
                                                    var dX = (e.offsetX-map.downX)/map.scaleCoeff;
                                                    var dY = (e.offsetY-map.downY)/map.scaleCoeff;
                                                    var Xnew = points[k2].X + dX;
                                                    var Ynew = points[k2].Y + dY;
                                                    map.strokes.movePoint(Xnew,Ynew,points[k2]);

                                                }

                                            }
                                            map.downX = e.offsetX;
                                            map.downY = e.offsetY;
                                            map.render();

                                            break;
                                    }

                                    break;
                                case 'labels':

                                    /// смещаем надписи
                                    //var items = map.strokes.items;
                                    var labels = map.labels;
                                    for (var l in labels){
                                        var label = labels[l];

                                        if (label.type!="LABEL" || !label.selected) continue;

                                        var dX = (e.offsetX-map.downX)/map.scaleCoeff;
                                        var dY = (e.offsetY-map.downY)/map.scaleCoeff;
                                        var Xnew = label.x + dX;
                                        var Ynew = label.y + dY;
                                        label.x = Xnew;
                                        label.y = Ynew;
                                    }
                                    map.downX = e.offsetX;
                                    map.downY = e.offsetY;
                                    map.render();


                                    break;
                            }
                            break;
                        default:
                            switch (map.mode){
                                case 'squares':
                                    if (map.keyboardKey != 16){
                                        if (map.moving) return;
                                        map.selecting = 1;
                                        map.hideStatus();
                                        var square = map.mouseOnElement(e.offsetX, e.offsetY);

                                        if (square){
                                            //if (+map.squares[square].status!=1) return;
                                            map.addToSelection(square);
                                        }
                                    }
                                    break;
                                case 'strokes':
                                    switch (+map.strokes.point_mode){
                                        case 1:


                                            break;
                                        case 2:
                                            /// выбираем точку
                                             var point = map.mouseOnPoint(x1,y1);
                                             if (point && !point.selected){
                                                 point.selected = true;
                                                 map.render();
                                             }

                                            break;
                                    }

                                    break;
                                case 'labels':

                                    /// выбираем надпись
                                    var label = map.mouseOnLabel(x1,y1);
                                    if (label && !label.selected){

                                        label.selected = true;
                                        map.render();
                                    }


                                    break;
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
                            switch (map.mode){
                                case 'squares':
                                    x = e.offsetX;
                                    y = e.offsetY;
                                    map.selecting = 0;
                                    selector.selectMove(x,y/*,function(x0,y0,w,h){
                                        map.selection = map.squaresInRect(x0,y0,w,h);
                                    }*/);
                                    break;
                                case 'strokes':
                                    switch (+map.strokes.point_mode){
                                        case 1:


                                            break;
                                        case 2:
                                            x = e.offsetX;
                                            y = e.offsetY;
                                            map.selecting = 0;
                                            selector.selectMove(x,y/*,function(x0,y0,w,h){
                                             map.selection = map.squaresInRect(x0,y0,w,h);
                                             }*/);

                                            break;
                                    }

                                    break;
                                case 'labels':

                                    x = e.offsetX;
                                    y = e.offsetY;
                                    map.selecting = 0;
                                    selector.selectMove(x,y/*,function(x0,y0,w,h){
                                     map.selection = map.squaresInRect(x0,y0,w,h);
                                     }*/);



                                    break;
                            }
                            break;
                        default:
                            switch (map.mode){
                                case 'squares':
                                    map.contextmenu_ready = false;
                                    if (map.keyboardKey != 16){
                                        if (map.moving) return;
                                        map.selecting = 0;
                                        map.hideStatus();
                                        var square = map.mouseOnElement(e.offsetX, e.offsetY);
                                        if (square){
                                            //if (+map.squares[square].status==0 && +map.squares[square].status!=2) return;
                                            map.removeFromSelection(square);
                                        }
                                    }
                                    break;
                                case 'strokes':
                                    switch (+map.strokes.point_mode){
                                        case 1:

                                            break;
                                        case 2:
                                            var point = map.mouseOnPoint(x1,y1);
                                            if (point && point.selected){
                                                point.selected = false;
                                                map.render();
                                            }


                                            //map.strokes.items[point.item].points[].selected = !map.strokes.items[point.item].selected;
                                            break;
                                    }

                                    break;
                                case 'labels':

                                    /// выбираем надпись
                                    var label = map.mouseOnLabel(x1,y1);

                                    if (label && label.selected){
                                        label.selected = false;
                                        map.render();
                                    }


                                    break;
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
                            switch (map.mode){
                                case 'squares':
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
                                    if (square && shiftState==18){

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



                    break;


            }



        });
        map.box.contextmenu(function(e){
            return false;
        });

////for (var key in mp.squares){send_query({command:"edit",subcommand:"block_by_cashier",sid:sid,params:{action_scheme_id:mp.squares[key].id}},function(){});}
        map.box.mousedown(function(e){
            var x = e.offsetX;
            var y = e.offsetY;
            map.downX = x;
            map.downY = y;
            var x1 = (e.offsetX-map.XCoeff)/map.scaleCoeff;
            var y1 = (e.offsetY-map.YCoeff)/map.scaleCoeff;
            map.moveCounter = 0;
            map.autoReloadStop();
            switch (e.which){
                case 1:    /// левая кнопка мыши
                    switch (shiftState){
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
                        case 80:
                            // p

                            break;

                        default:

                            switch (map.mode){
                                case 'strokes':
                                    switch (+map.strokes.point_mode){
                                        case 1:
                                            /*if (shiftState==88){  /// нажата кл x
                                                var arr = map.strokes.items[map.strokes.selected].points.reverse();
                                                if (arr[0]!=undefined)
                                                    x1 = arr[0].X;
                                            }
                                            if (shiftState==89){  /// нажата кл y
                                                var arr = map.strokes.items[map.strokes.selected].points.reverse();
                                                if (arr[0]!=undefined)
                                                    y1 = arr[0].Y;
                                            }*/
                                            map.strokes.addPoint({
                                                X:x1,
                                                Y:y1,
                                                OBJECT_ID:map.strokes.selected,
                                                selected:false
                                            });
                                            map.strokes.loadPoints();
                                            break;
                                        case 2:
                                            /*var point = map.mouseOnPoint(x1,y1);
                                            if (point && !point.selected){
                                                point.selected = true;
                                                map.render();
                                            }*/


                                                //map.strokes.items[point.item].points[].selected = !map.strokes.items[point.item].selected;
                                            break;
                                    }

                                    break;
                            }

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
                          /*  var square = map.mouseOnElement(e.offsetX, e.offsetY);
                            if (square){
                                //log(square);
                                if (!map.squares[square].status){
                                    map.contextmenu_ready = square;
                                }
                            }*/
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

            $(".Xinput").val((e.offsetX-map.XCoeff)/map.scaleCoeff);
            $(".Yinput").val((e.offsetY-map.YCoeff)/map.scaleCoeff);

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
                            //var square = map.mouseOnElement(e.offsetX, e.offsetY);

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
            //map.autoReloadStart();
            var x = e.offsetX;
            var y = e.offsetY;
            if (map.contextmenu_ready) {
                $('.context-menu-one').contextMenu(true);
            } else
                $('.context-menu-one').contextMenu(false);
            //sendSelection(map.selecting);
                switch (e.which){
                    case 1:
                        switch (map.mode){
                            case "squares":
                                selector.selectStop(x,y,function(x0,y0,w,h){
                                    var arr = map.squaresInRect(x0,y0,w,h);
                                    for (var k in arr){
                                        map.addToSelection(arr[k]);
                                    }
                                    //map.selection = map.selection.concat(map.squaresInRect(x0,y0,w,h));
                                    /*for( var k in map.selection){
                                     map.squares[map.selection[k]].color0 = "#F00";
                                     }*/
                                    map.render();
                                    //map.sendSelection(map.selecting);
                                });
                                break;
                            case "strokes":
                                switch (+map.strokes.point_mode){
                                    case 2:

                                        selector.selectStop(x,y,function(x0,y0,w,h){
                                            // выделяем несколько точек
                                            var arr = map.pointsInRect(x0,y0,w,h);
                                            for (var k in arr){
                                                map.strokes.items[map.strokes.selected].points[arr[k]].selected = true;
                                            }

                                            map.render();
                                            map.strokes.loadPoints();
                                        });
                                        break;
                                }

                                break;
                            case "labels":

                                selector.selectStop(x,y,function(x0,y0,w,h){
                                    // выделяем несколько точек
                                    var arr = map.labelsInRect(x0,y0,w,h);
                                    for (var k in arr){
                                        map.labels[arr[k]].selected = true;
                                    }

                                    map.render();
                                });


                                break;
                        }

                        if (map.mode=="strokes" && +map.strokes.point_mode==2 && shiftState==17){
                            map.strokes.createStrokes(map.strokes.selected);
                        }
                        break;
                    case 3:


                        switch (map.mode){
                            case "squares":
                                selector.selectStop(x,y,function(x0,y0,w,h){
                                    var arr = map.squaresInRect(x0,y0,w,h);
                                    for (var k in arr){
                                        map.removeFromSelection(arr[k]);
                                    }
                                    //map.selection = map.selection.concat(map.squaresInRect(x0,y0,w,h));
                                    /*for( var k in map.selection){
                                     map.squares[map.selection[k]].color0 = "#F00";
                                     }*/
                                    map.render();
                                    //map.sendSelection(map.selecting);
                                });
                                break;
                            case "strokes":
                                switch (+map.strokes.point_mode){
                                    case 2:

                                        selector.selectStop(x,y,function(x0,y0,w,h){
                                            // выделяем несколько точек
                                            var arr = map.pointsInRect(x0,y0,w,h);
                                            for (var k in arr){
                                                map.strokes.items[map.strokes.selected].points[arr[k]].selected = false;
                                            }

                                            map.render();
                                        });
                                        break;
                                }

                                break;
                            case "labels":

                                selector.selectStop(x,y,function(x0,y0,w,h){
                                    // выделяем несколько точек
                                    var arr = map.labelsInRect(x0,y0,w,h);
                                    for (var k in arr){
                                        map.labels[arr[k]].selected = false;
                                    }

                                    map.render();
                                });


                                break;
                        }




                        break;
                }

            if (map.moving){
                window.setTimeout(function(){
                    map.moving=false;
                },50);
            }
            /* map.XCoeff = 0;
             map.YCoeff = 0;*/
            map.oldMouseX = 0;
            map.oldMouseY = 0;
            map.selecting = -1;
            log("reLoadLayout");
            map.reLoadLayout();

            /*if(e.which==2 || (e.which==1 && map.keyboardKey==32)){

             }*/





            //map.drawSquares();
        });

        /*map.box.dblclick(function(e){
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



        });*/


        $(document).keydown(function(e){
            map.keyboardKey = e.which;
            switch (e.which){
                case 32:
                    map.box.css("cursor","move");
                    break;
                case 46:
                    switch (map.mode){
                        case 'strokes':
                            switch (+map.strokes.point_mode){
                                case 2:
                                    if (shiftState==16){
                                        alert_yesno("","Удалить точки?","Да","Отмена",function(){
                                            map.strokes.deleteSelectedPoints();
                                        });
                                    }
                                    break;
                            }
                            break;
                        case 'labels':

                                if (shiftState==16){
                                    alert_yesno("","Удалить выделеные надписи?","Да","Отмена",function(){
                                        for (var l in map.labels){
                                            if (map.labels[l].selected)
                                                map.deleteLabels(l);
                                        }

                                    });
                            }
                            break;
                    }
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
        var params = {action_id:action_item};
        if (typeof this.loadObjectsParam=="object"){
            subcommand = this.loadObjectsParam.subcommand;
            params = this.loadObjectsParam.params;

        }

        var self = this;
        $("#for_labels,#for_strokes").html("");

        send_queryJ({command:"get",subcommand:subcommand,sid:sid,params:params},function(data0){


            var DATA = jsonToObj(data0);

            for(var k in DATA){

                if(DATA[k].OBJECT_TYPE!="STROKE" && DATA[k].OBJECT_TYPE!="LABEL") continue;
                var index = DATA[k].OBJECT_ID;
                self.labels[index] = {};
                self.labels[index].id = DATA[k].OBJECT_ID;
                self.labels[index].name = (DATA[k].ANOTHER!=undefined && DATA[k].ANOTHER!=null)?DATA[k].ANOTHER:"Автонаименование "+DATA[k].OBJECT_ID;
                self.labels[index].type = DATA[k].OBJECT_TYPE;
                self.labels[index].value = (DATA[k].VALUE!=undefined && DATA[k].VALUE!=null) ? DATA[k].VALUE : "";
                self.labels[index].x = (DATA[k].X!=undefined && DATA[k].X!=null) ? +DATA[k].X : 0;
                self.labels[index].y = (DATA[k].Y!=undefined && DATA[k].Y!=null) ? +DATA[k].Y : 0;
                self.labels[index].rotation = (DATA[k].ROTATION!=undefined && DATA[k].ROTATION!="") ? +DATA[k].ROTATION*Math.PI/180 : false;
                self.labels[index].fontSize = (DATA[k].FONT_SIZE!=undefined && DATA[k].FONT_SIZE!="") ? +DATA[k].FONT_SIZE : 40;
                self.labels[index].fontStyle = (DATA[k].FONT_STYLE!=undefined && DATA[k].FONT_STYLE!="") ? DATA[k].FONT_STYLE : "normal";
                self.labels[index].fontFamily = (DATA[k].FONT_FAMILY!=undefined && DATA[k].FONT_FAMILY!="") ? DATA[k].FONT_FAMILY : "Arial";
                self.labels[index].fontDecaration = (DATA[k].TEXT_DECARATION!=undefined && DATA[k].TEXT_DECARATION!="") ? DATA[k].TEXT_DECARATION : "none";
                self.labels[index].color1 = (DATA[k].COLOR1!=undefined && DATA[k].COLOR1!="") ? DATA[k].COLOR1 : "#000000";
                self.labels[index].color2 = (DATA[k].COLOR2!=undefined && DATA[k].COLOR2!="") ? DATA[k].COLOR2 : "#FFFFFF";
                self.labels[index].color3 = (DATA[k].COLOR3!=undefined && DATA[k].COLOR3!="") ? DATA[k].COLOR3 : "#000000";
                self.labels[index].color4 = (DATA[k].COLOR4!=undefined && DATA[k].COLOR4!="") ? DATA[k].COLOR4 : "#FFFFFF";
                self.labels[index].another = (DATA[k].ANOTHER!=undefined && DATA[k].ANOTHER!=null) ? DATA[k].ANOTHER : "";
                self.labels[index].OBJVERSION = DATA[k].OBJVERSION;
                self.labels[index].points = [];
                self.labels[index].lines = [];
                if (DATA[k].OBJECT_TYPE=="STROKE"){
                    map.strokes.items[index] = self.labels[index];
                    $("#for_strokes").append('<div class="one_stroke" id="one_stroke'+DATA[k].OBJECT_ID+'"><span>'+self.labels[index].name+'</span><div class="one_strokes_del" id="one_strokes_del'+DATA[k].OBJECT_ID+'">X</div></div>');

                    map.strokes.items[DATA[k].OBJECT_ID].lines = [];
                    send_queryJ({command:"get",subcommand:"hall_scheme_object_item",sid:sid,params:{where:"OBJECT_ID = "+DATA[k].OBJECT_ID,ORDER_BY : "OBJECT_TYPE, SORT_NO"}},function(items0){
                        var items = jsonToObj(items0);
                        for (var i in items){
                            if (items[i].OBJECT_TYPE=="POINT"){
                                map.strokes.items[items[i].OBJECT_ID].points[items[i].OBJECT_ITEM_ID] = items[i];
                                map.strokes.items[items[i].OBJECT_ID].points[items[i].OBJECT_ITEM_ID].selected = false;
                            }
                            if (items[i].OBJECT_TYPE=="LINE"){
                                map.strokes.items[items[i].OBJECT_ID].lines[items[i].OBJECT_ITEM_ID] = items[i];
                            }


                        }
                        map.strokes.init();
                        if ($(".one_stroke:first").length>0) $(".one_stroke:first").click();

                    });
                }else if (DATA[k].OBJECT_TYPE=="LABEL"){


                    $("#for_labels").append('<div class="one_labels" id="one_labels'+self.labels[index].id+'"><span>'+self.labels[index].value+'</span><div class="one_labels_del" id="one_labels_del'+self.labels[index].id+'">X</div></div>');


                }
                //map.strokes.loadPoints();
            }

            self.render();
            //self.drawObjects();

        });

    },
    updateSquares:function(xml){
        var self = map;
        var DATA = jsonToObj(data);

        for (var k in DATA){

            var index = DATA[k].HALL_SCHEME_ITEM_ID;
            self.squares[index] = {};
            self.squares[index].id = DATA[k].HALL_SCHEME_ITEM_ID;
            self.squares[index].areaGroup = DATA[k].AREA_GROUP_ID;
            self.squares[index].x = +DATA[k].X;
            self.squares[index].y = +DATA[k].Y;
            self.squares[index].line = String(DATA[k].LINE);
            self.squares[index].place = String(DATA[k].PLACE);
            self.squares[index].color0 = DATA[k].COLOR;
            self.squares[index].color1 = DATA[k].COLOR;
            //self.squares[index].color0 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
            //self.squares[index].color1 = $(this).find("C").text() || $(this).find("CP").text() || $(this).find("CF").text();
            self.squares[index].group = DATA[k].GROUP_ID;
            self.squares[index].group_name = (DATA[k].GROUP_NAME>0) ? DATA[k].GROUP_NAME : "Автогруппа";
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


        //log("Squares REloaded...");


        self.render();
        self.reLoadLayout();




    },


    setScaleCoff:function(callback){

        this.maxX = 100;
        this.maxY = 100;
        //this.maxY = this.box.height();




        for (var k in this.squares){
            var tmX = +this.squares[k].x;
            var tmY = +this.squares[k].y;
            if (this.maxX<tmX) this.maxX = tmX;
            if (this.maxY<tmY) this.maxY = tmY;
            if (this.minX>tmX) this.minX = tmX;
            if (this.minY>tmY) this.minY = tmY;
        }


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
        this.YCoeff = this.minY*this.scaleCoeff+bh/40;
        this.YCoeff = (bh - (this.maxY*this.scaleCoeff-this.minY*this.scaleCoeff))/4;
        this.YCoeff = 0;
        //console.log(this.YCoeff);
        if (typeof callback=="function")
            callback();

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
        //log(x0);
        var squares = [];
        var layouts = this.layoutInRect(x0,y0,w-1,h-1);
        for (var key1 in layouts){
            //log(layouts[key1]);
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
    pointsInRect:function(x0,y0,w,h){
        if (map.strokes.selected<0) return false;
        //log(x0);
        var result = [];
        var points = map.strokes.items[map.strokes.selected].points;
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

      /*  var points0 = [];
        var items = map.strokes.items;
        for (var key1 in items){
            var points =  map.strokes.items[key1].points;
            for (var key2 in points){


                var xL = points[key2].x*this.scaleCoeff+this.XCoeff;
                var yL = points[key2].y*this.scaleCoeff+this.YCoeff;
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
                    if ($.inArray(key2,points0)==-1)
                        points0.push(key2);
                }
            }
        }
        return points0;*/
    },

    labelsInRect:function(x0,y0,w,h){
        var result = [];
        var labels = map.labels;
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

    mouseOnPoint:function(x,y){
        var wh = this.squareWH*this.scaleCoeff/4;
        var strokesItemms = this.strokes.items;
        for(var key in strokesItemms){
            var points = strokesItemms[key].points;
            for (var key2 in points){
                /*var x2 = points[key2].x*this.scaleCoeff+this.XCoeff;
                var y2 = points[key2].y*this.scaleCoeff+this.YCoeff;*/
                var x2 = points[key2].X;
                var y2 = points[key2].Y;
                if(x>=x2 && x<=+(x2+wh) && y>=+y2 && y<=+(y2+wh)){
                    //log("mouseOnSquare "+this.squares[shapes[key]].id);
                    return points[key2];
                }
            }
        }
        return false;

    },

    mouseOnLabel:function(x,y){


        //var wh = this.squareWH*this.scaleCoeff/2;
        //var wh = this.squareWH*this.scaleCoeff;

        var labels = map.labels;
        for(var key in labels){
            var label = labels[key];

            if (label.type!="LABEL") continue;
                var wh = +label.fontSize;
                /*var x2 = points[key2].x*this.scaleCoeff+this.XCoeff;
                 var y2 = points[key2].y*this.scaleCoeff+this.YCoeff;*/
                var x2 = +label.x;
                var y2 = +label.y-wh;


                /*var y2 = label.y-label.fontSize*map.scaleCoeff;*/

                map.ctx.strokeRect(label.x*this.scaleCoeff+this.XCoeff,(label.y-label.fontSize)*this.scaleCoeff+this.YCoeff,label.fontSize*this.scaleCoeff,label.fontSize*this.scaleCoeff);

                if(x>=x2 && x<=+(x2+wh) && y>=+y2 && y<=+(y2+wh)){

                    //log("mouseOnSquare "+this.squares[shapes[key]].id);
                    return label;
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
            if (status.y>=this.box.height()+parseInt(this.box.css("top"))-$("#"+alias+" #hint").height())
                status.y = this.box.height()+parseInt(this.box.css("top"))-$("#"+alias+" #hint").height()+10;
            $("#"+alias+" #hint").stop(true,true).animate({top:status.y+"px",left:status.x+10+"px"},450);
            $("#"+alias+" #hint").stop(true,true).fadeIn(450);
        }
    },
    hideStatus:function(){
        var duration = 450;
        if (arguments[0]!=undefined && !isNaN(+arguments[0]))
            duration = arguments[0];
        if ($("#"+alias+" #hint").length>0 && $("#"+alias+" #hint").css("display")!="none")
            $("#"+alias+" #hint").stop(true,true).delay(300).fadeOut(duration);
    },
    drawBackground:function(){
        //if (!this.backgroundImageLoaded) return;
        var x = Math.round(1*this.scaleCoeff+this.XCoeff);
        var y = Math.round(1*this.scaleCoeff+this.YCoeff);
        this.ctx.drawImage(this.backgroundImage,x,y,this.backgroundImage.width*3*this.scaleCoeff,this.backgroundImage.height*3*this.scaleCoeff);
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
        if (shadow){
            this.ctx.shadowOffsetX = 2*this.scaleCoeff;
            this.ctx.shadowOffsetY = 2*this.scaleCoeff;
            this.ctx.shadowBlur = 8*this.scaleCoeff;
            this.ctx.shadowColor = "#000";
        }
        if (this.squares[key].order_id==selected_order_id && this.squares[key].order_id!=undefined){
            if(this.squares[key].ticket_status=="RESERVED"){
                this.ctx.fillStyle = "#F00";
                this.squares[key].status = 2;
            }else
                this.ctx.fillStyle = "#DB0000";


        }

        //if (key == 1642) log(this.ctx.fillStyle);
        this.ctx.fillRect(x,y,Math.round(wh*this.scaleCoeff),Math.round(wh*this.scaleCoeff));
        if (shadow){
            this.ctx.shadowOffsetX =0;
            this.ctx.shadowOffsetY = 0;
            this.ctx.shadowBlur = 0;
        }

        this.ctx.strokeStyle = "#000";

        this.ctx.strokeRect(x,y,Math.round(wh*this.scaleCoeff),Math.round(wh*this.scaleCoeff));

        map.ctx.font =  "italic "+Math.round((wh/2.5)*this.scaleCoeff)+"px Arial";

        //map.ctx.fillStyle = "#000";
        map.ctx.fillStyle = this.squares[key].textColor;
        /*if (this.squares[key].status == 1)
         map.ctx.fillStyle = "#fff";*/
        this.ctx.fillText(this.squares[key].line,x+((wh/(wh/2.5))*this.scaleCoeff),y+((wh/2.5)*this.scaleCoeff));
        if (this.squares[key].place.length == 1){
            this.ctx.fillText(this.squares[key].place,x+((wh-(wh/2.5*0.9))*this.scaleCoeff),y+((wh-wh/10)*this.scaleCoeff));
        }else if (this.squares[key].place.length == 2){
            this.ctx.fillText(this.squares[key].place,x+((wh-1.5*(wh/2.5*0.9))*this.scaleCoeff),y+((wh-wh/10)*this.scaleCoeff));
        }
    },
    drawSquares:function(){
        //debugger;
        //this.ctx.font =  "italic "+Math.round(3*sc)+"pt Arial";
        var wh = this.squareWH;
        //var wh = this.squareWH*this.scaleCoeff;
        var cw = this.canvas.width();
        //var ch = this.canvas.height();
        var ch = this.box.height();




        //map.ctx.fillText("sadsads",210,210,100);
         //log("drawSquares");
        for(var i in this.layoutSquares){
            this.layoutSquares[i].shapes = [];
        }
        /* var count = 0;
         var boxWidth = this.box.width();
         var boxHeight = this.box.height();*/
        //var count = 0;
        for (var key in this.squares){
            this.drawSquaresChild(key,wh,cw,ch);

        }


        //log("Rendered..");

    },
    // M1454 99L1595 99C1883 330 2616 330 2904 99L3037 99Q3077 99 3077 139L3077 633L3000 633L3000 784L2861 784L2861 880L2615 880L2615 980L1885 980L1885 880L1638 880L1638 784L1499 784L1499 633L1414 633L1414 139Q1414 99 1454 99
    drawSVG:function(object,callback){
        var context = this.ctx;
        var context2 = this.ctx2;
        var self = this;
        if (object.value==undefined) return;
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
                        var color = labels[k1].color1;
                        if (labels[k1].selected)
                            color = labels[k1].color2;

                        if (color != oldValues.fillStyle){
                            self.ctx.fillStyle = color;
                            oldValues.fillStyle = color;
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
        if (this.squares[id] == undefined) return;


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



        }



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
            /// Если удален во время подсветки
            if (self.squares[id]==undefined) {
                window.clearInterval(self.timersForLight[id]);
                delete self.timersForLight[id];
                self.drawSquare(id);
                //map.reLoadLayout();
                //log(map.layoutSquares);
                return;
            }

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
        if (this.loadBackgroundFlag)
            this.drawBackground();

        this.drawObjects();
        if (map.mode == "strokes" && map.strokes.selected>=0) {
            if (map.strokes.selected<0) return;
            this.strokes.drawStrokes();
            var points = map.strokes.items[map.strokes.selected].points;
            for (var k2 in points){
                map.strokes.drawPoint(points[k2]);
            }
        }

        this.drawSquares();
        //this.drawZoom();
    },
    init:function(params){

        this.setBoxSize(params);
        this.normalizeCanvasSize();
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
        //var params2 = (this.loadParams.params!=undefined) ? this.loadParams.params : {action_id:action_item};
        var params2 = (this.loadParams.params!=undefined) ? this.loadParams.params : {action_id:action_item};
        var self = this;

        this.backgroundImage.onload = function(){
            //log("imgLoaded");
            this.backgroundImageLoaded = true;
        };
        this.backgroundImage.src = "img/loaded/zal1BG.png";

        send_queryJ({command:"get",subcommand:subcommand,sid:sid,params:params2},function(data){
            self.createSquares(data);
            map.selection = [];
            if (typeof callback=="function")
                callback(data);


            $.contextMenu({
                selector: '.context-menu-one',
                /*appendTo:map.box,*/
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
        var params2 = (this.loadParams.params!=undefined) ? this.loadParams.params : {action_id:action_item};
        var oldWhere = params2.where;
        if (params2.where!=undefined)
            params2.where += " and LIFE_TIME |lt| 200";
        else
            params2.where = "LIFE_TIME |lt| 200";
        var self = this;
        //this.loadObjects();
        send_query({command:"get",subcommand:subcommand,sid:sid,params:params2},function(data){
            params2.where = oldWhere;
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
        this.autoReloadTimer = window.setInterval(function(){
            map.reLoad();
        },this.autoReloadInterval);

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
            var layout = map.mouseOnLayout(x-1,y-1);
            if (layout && $.inArray(map.squares[key].id,map.layoutSquares[layout].shapes)==-1){
                map.layoutSquares[layout].shapes.push(map.squares[key].id);
                return;
            }
            layout = map.mouseOnLayout(x+1+wh*map.scaleCoeff,y-1);
            if (layout && $.inArray(map.squares[key].id,map.layoutSquares[layout].shapes)==-1) {
                map.layoutSquares[layout].shapes.push(map.squares[key].id);
                return;
            }
            layout = map.mouseOnLayout(x+1+wh*map.scaleCoeff,y+1+wh*map.scaleCoeff);
            if (layout && $.inArray(map.squares[key].id,map.layoutSquares[layout].shapes)==-1) {
                map.layoutSquares[layout].shapes.push(map.squares[key].id);
                return;
            }
            layout = map.mouseOnLayout(x-1,y+1+wh*map.scaleCoeff);
            if (layout && $.inArray(map.squares[key].id,map.layoutSquares[layout].shapes)==-1) {
                map.layoutSquares[layout].shapes.push(map.squares[key].id);
                return;
            }
            //this.layoutSquares[this.mouseOnLayout(x+wh*this.scaleCoeff,y+wh*this.scaleCoeff)].shapes.push(this.squares[key].id);
            /*if (map.mouseOnLayout(x-wh,y-wh) && $.inArray(map.squares[key].id,map.layoutSquares[map.mouseOnLayout(x-wh,y-wh)].shapes)==-1)
                map.layoutSquares[map.mouseOnLayout(x-wh,y-wh)].shapes.push(map.squares[key].id);
*/
        }
    },
    reLoadLayout:function(){
        //return;
        //log("reLayout");
        var wh = map.squareWH;
        //var wh = this.squareWH*this.scaleCoeff;
        var cw = map.canvas.width();
        //var ch = this.canvas.height();
        var ch = map.box.height();

        for (var key in map.squares){
            this.reLoadLayoutChild(key,wh,cw,ch);

        }
        //log("reLoadLayoutChild");
    },


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
        //if (this.selection.inArray(id)!=-1 || this.selection.length>1000) return;
        if ($.inArray(id,this.selection)!=-1) return;
        this.selection.push(id);
        this.squares[id].color0 = "#F00";
        this.drawSquare(id);
        //this.drawLightOne(id);
    },
    removeFromSelection:function(id){
        var index = $.inArray(id,this.selection);
        delete this.selection[index];
        this.squares[id].color0 = this.squares[id].color1;
        this.drawSquare(id);
    },
    clearSelection:function(){
        for (var k in this.selection){
            this.squares[this.selection[k]].color0 = this.squares[this.selection[k]].color1;
        }
        this.selection = [];
        this.render();
    },
    countSelection:function(){
        var count = 0;
        for (var k in this.selection){
            count++;
        }
        return count;
    },
    loadBackground:function(){



    },
    strokes:
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
            for (var k in map.strokes.items){

                // map.strokes.items[data[k].OBJECT_ID].points

                map.strokes.items[k].points = map.strokes.items[k].points.sort(function(a,b){
                    if (a.SORT_NO>b.SORT_NO) return 1;
                    if (a.SORT_NO<b.SORT_NO) return -1;
                    return 0;
                });
                /*if (k==115)
                    debugger;*/
                map.strokes.items[k].lines = map.strokes.items[k].lines.sort(function(a,b){
                    if (a.SORT_NO>b.SORT_NO) return 1;
                    if (a.SORT_NO<b.SORT_NO) return -1;
                    return 0;
                });

                var name = (map.strokes.items[k].name!=undefined)?map.strokes.items[k].name:"Автонаименование";
                $("#for_strokes").append('<div class="one_stroke" id="one_stroke'+map.strokes.items[k].id+'"><span>'+name+'</span><div class="one_strokes_del" id="one_strokes_del'+k+'">X</div></div>');




            }
            //this.loadPoints();

        },
        /*loadStrokes:function(){

        },*/
        add:function(){
            var name = ($("#stroke_name").val()!="") ?  $("#stroke_name").val() : "Авто";
            send_queryJ({command:"new",subcommand:"hall_scheme_object",sid:sid,params:{HALL_SCHEME_ID:30,OBJECT_TYPE:"STROKE",ANOTHER:name}},function(data){
                map.strokes.items[data.ID] = {
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
                //map.strokes.loadPoints();

            });

        },
        remove:function(id){
            var item = map.strokes.items[id];
            if (item.OBJVERSION==undefined){
                delete map.strokes.items[id];
                $("#one_stroke"+id).remove();
                if (map.strokes.selected==id) map.strokes.selected = -1;
                return;
            }
            alert_yesno("Удалить?","<span style='color:#f00;'>Внимание!</span> Все элементы данной обводки будут удалены. Вы Уверены?","Да","Нет",function(){
                send_queryJ({command:"remove",subcommand:"hall_scheme_object",sid:sid,params:{OBJVERSION:item.OBJVERSION,OBJECT_ID:id}},function(data){
                    delete map.strokes.items[id];
                    delete map.labels[id];
                    $("#one_stroke"+id).remove();
                    if (map.strokes.selected==id) map.strokes.selected = -1;
                    map.loadObjects();
                });
            });


        },
        update:function(id){
            if (isNaN(+id)) return;
            var item = map.strokes.items[id];
            map.strokes.createStrokes(id);

            send_queryJ({command:"modify",subcommand:"hall_scheme_object",sid:sid,params:{OBJVERSION:item.OBJVERSION,OBJECT_ID:item.id,VALUE:item.value}},function(data){
                item.OBJVERSION = data.OBJVERSION;
            });
        },
        save:function(){
            if (this.selected < 0) return;
            var OBJECT_ID = this.selected;


            var item = map.strokes.items[OBJECT_ID];
            if (item.value==null || item.OBJVERSION==undefined) return;
            var name = ($("#stroke_name").val()!="") ?  $("#stroke_name").val() : "Авто";
            send_queryJ({command:"modify",subcommand:"hall_scheme_object",sid:sid,params:{OBJVERSION:item.OBJVERSION,OBJECT_ID:OBJECT_ID,VALUE:item.value,ANOTHER:name}},function(data){
                item.OBJVERSION = data.OBJVERSION;
                $("#one_stroke"+OBJECT_ID+" span").text(name);
            });

            // сохраним точки
            var points = map.strokes.items[OBJECT_ID].points;
            for (var p in points){
                var point = points[p];
                if (point.OBJVERSION!=undefined){
                    if (point.SORT_NO==undefined) point.SORT_NO = point.OBJECT_ID;
                    send_queryJ({command:"modify",subcommand:"hall_scheme_object_item",sid:sid,params:{OBJVERSION:point.OBJVERSION,OBJECT_ITEM_ID:point.OBJECT_ITEM_ID,OLD_ID:p,X:point.X,Y:point.Y,SORT_NO:point.SORT_NO}},function(data){
                        if (data.RC==0)
                            map.strokes.items[OBJECT_ID].points[data.OLD_ID].OBJVERSION = data.OBJVERSION;
                        else
                            log("modify hall_scheme_object_item !RC0");


                    });
                }else{
                    send_queryJ({command:"new",subcommand:"hall_scheme_object_item",sid:sid,params:{OBJECT_ID:OBJECT_ID,OBJECT_TYPE:"POINT",OLD_ID:p,X:point.X,Y:point.Y,SORT_NO:p}},function(data){
                        log(data);
                        map.strokes.items[OBJECT_ID].points[data.ID] = map.strokes.items[OBJECT_ID].points[data.OLD_ID];
                        map.strokes.items[OBJECT_ID].points[data.ID].OBJECT_ITEM_ID = data.ID;
                        map.strokes.items[OBJECT_ID].points[data.ID].OBJVERSION = data.OBJVERSION;
                        //if (map.strokes.items[OBJECT_ID].points[data.OLD_ID].OBJVERSION==undefined)
                        if (data.ID!=data.OLD_ID)
                            delete  map.strokes.items[OBJECT_ID].points[data.OLD_ID];

                        //map.strokes.loadPoints();
                    });
                }
            }
            // сохраним линии
            var lines = map.strokes.items[OBJECT_ID].lines;
            for (var l in lines){
                var line = lines[l];
                if (line.OBJVERSION!=undefined){

                    send_queryJ({command:"modify",subcommand:"hall_scheme_object_item",sid:sid,params:{OBJVERSION:line.OBJVERSION,OBJECT_ITEM_ID:line.OBJECT_ITEM_ID,OLD_ID:l,VALUE:line.VALUE,SORT_NO:line.SORT_NO}},function(data){
                        if (data.RC==0)
                            map.strokes.items[OBJECT_ID].lines[data.OLD_ID].OBJVERSION = data.OBJVERSION;
                        else
                            log("modify hall_scheme_object_item !RC0");

                    });
                }else{
                    send_queryJ({command:"new",subcommand:"hall_scheme_object_item",sid:sid,params:{OBJECT_ID:OBJECT_ID,OBJECT_TYPE:"LINE",OLD_ID:l,VALUE:line.VALUE,SORT_NO:line.SORT_NO}},function(data){
                        map.strokes.items[OBJECT_ID].lines[data.ID] = map.strokes.items[OBJECT_ID].lines[data.OLD_ID];
                        map.strokes.items[OBJECT_ID].lines[data.ID].OBJECT_ITEM_ID = data.ID;
                        map.strokes.items[OBJECT_ID].lines[data.ID].OBJVERSION = data.OBJVERSION;
                        //if (map.strokes.items[OBJECT_ID].lines[data.OLD_ID].OBJVERSION==undefined)
                        if (data.ID!=data.OLD_ID)
                            delete  map.strokes.items[OBJECT_ID].lines[data.OLD_ID];

                        //map.strokes.loadLines();
                    });
                }
            }



        },
        // работа с точками
        loadPoints:function(){
            if (this.selected<0 || map.strokes.items[this.selected]==undefined) return;
            $("#for_points").html("");
            for (var k in map.strokes.items[this.selected].points){
                $("#for_points").append('<li class="one_point" id="one_point'+k+'"><span> '+Math.round(map.strokes.items[this.selected].points[k].X)+'x'+Math.round(map.strokes.items[this.selected].points[k].Y)+'</span></li>');
            }
            $( "#for_points" ).sortable(
                {
                    stop:function(){
                        //log("sdsd");
                        map.strokes.reLoadPointsArr(map.strokes.selected);
                    }
                }
            );
            $( "#for_points" ).disableSelection();
            map.render();
        },

        reLoadPointsArr:function(item_id){
            $(".one_point").each(function(index){
                if (this.id!=""){
                    var id = this.id.replace(/[^0-9]/ig,'');
                    map.strokes.items[item_id].points[id].SORT_NO = index;
                }
            });
            map.strokes.items[item_id].points = map.strokes.items[item_id].points.sort(function(a,b){
                if (a.SORT_NO>b.SORT_NO) return 1;
                if (a.SORT_NO<b.SORT_NO) return -1;
                return 0;
            });
            map.strokes.loadPoints();
            map.strokes.createStrokes(item_id);
        },
        clearPoints:function(){
            if (this.selected<0) return;
            map.strokes.items[this.selected].points = [];
        },
        addPoint:function(point){
            if (this.selected<0) return;
            map.strokes.items[this.selected].points.push(point);
            /*send_queryJ({command:"new",subcommand:"hall_scheme_object_item",sid:sid,params:{OBJECT_ID:this.selected,OBJECT_TYPE:"POINT",X:point.X,Y:point.Y}},function(data){
                map.strokes.items[this.selected].points.push(point);
                map.strokes.loadPoints();

            });*/

        },
        removePoint:function(point_id){
            if (this.selected<0) return;
            var point = map.strokes.items[this.selected].points[point_id];
            if (point.OBJVERSION==undefined){
                delete map.strokes.items[map.strokes.selected].points[point_id];
                return;
            }
            send_queryJ({command:"remove",subcommand:"hall_scheme_object_item",sid:sid,params:{OBJVERSION:point.OBJVERSION,OBJECT_ITEM_ID:point.OBJECT_ITEM_ID}},function(data){
                delete map.strokes.items[map.strokes.selected].points[point_id];
                map.strokes.update();

            });

        },
        updatePoint:function(point_id,point){
            if (this.selected<0) return;
            for (var key in point){
                map.strokes.items[this.selected].points[point_id].key = point[key];
            }
        },
        movePoint:function(x,y,point){

            point.X = x;
            point.Y = y;


        },

        drawPoint:function(point){

            var x = point.X*map.scaleCoeff+map.XCoeff;
            var y = point.Y*map.scaleCoeff+map.YCoeff;
            if (point.selected)
                map.ctx.fillStyle = "#ff0000";
            else
                map.ctx.fillStyle = "#0000FF";
            map.ctx.fillRect(x,y,(map.squareWH*map.scaleCoeff)/4,(map.squareWH*map.scaleCoeff)/4);
        },
        deleteSelectedPoints:function(){
            var items = map.strokes.items;
            for (var k in items){
                var points = items[k].points;
                for (var k2 in points){
                    if (!points[k2].selected) continue;
                    map.strokes.removePoint(k2);
                    //delete points[k2];
                }
            }
            map.render();
            map.strokes.loadPoints();
            map.strokes.createStrokes(map.strokes.selected);

        },
        createLine:function(){
            var lineType = $("[name = lineType]:checked").val();
            if ((lineType == "M" && map.strokes.items[map.strokes.selected].lines.length>0) || (lineType != "M" && map.strokes.items[map.strokes.selected].lines.length==0))return;
            map.strokes.items[map.strokes.selected].lines.push({
                VALUE:lineType,
                OBJECT_ID:map.strokes.selected,
                SORT_NO:map.strokes.items[map.strokes.selected].lines.length+1
            });
            map.strokes.loadLines();


        },
        deleteLine:function(line_id){
            if (map.strokes.selected<0) return;
            var line  =  map.strokes.items[map.strokes.selected].lines[line_id];
            if (line==undefined) return;
            alert_yesno("","Удалить линию?","Да","Нет",function(){
                if (line.OBJVERSION==undefined){
                    delete map.strokes.items[map.strokes.selected].lines[line_id];
                    return;
                }
                send_queryJ({command:"remove",subcommand:"hall_scheme_object_item",sid:sid,params:{OBJVERSION:line.OBJVERSION,OBJECT_ITEM_ID:line.OBJECT_ITEM_ID}},function(data){

                    delete map.strokes.items[map.strokes.selected].lines[line_id];
                    map.strokes.loadLines();
                    map.strokes.createStrokes(map.strokes.selected);
                    map.strokes.update();


                });

            });
        },
        loadLines:function(){
            if (+this.selected<0 || map.strokes.items[+map.strokes.selected].lines==undefined) return;
            $("#for_lines").html("");
            for (var k in map.strokes.items[map.strokes.selected].lines){
                $("#for_lines").append('<li class="one_lines" id="one_lines'+k+'"><span> '+map.strokes.items[map.strokes.selected].lines[k].VALUE+'</span><div class="one_lines_del" id="one_lines_del'+k+'">X</div></li>');
            }
            $(".one_lines_del").die("click").live("click",function(){
                var id = this.id.replace(/[^0-9]/ig,'');
                map.strokes.deleteLine(id);
            });
            $( "#for_lines" ).sortable(
                {
                    stop:function(){
                        //log("sdsd");
                        map.strokes.reLoadLinesArr(map.strokes.selected);
                    }
                }
            );
            $( "#for_points" ).disableSelection();
        },
        reLoadLinesArr:function(item_id){
            $(".one_lines").each(function(index){
                if (this.id!=""){
                    var id = this.id.replace(/[^0-9]/ig,'');
                    map.strokes.items[item_id].lines[id].SORT_NO = index;
                }
            });
            map.strokes.items[item_id].lines = map.strokes.items[item_id].lines.sort(function(a,b){
                if (a.SORT_NO>b.SORT_NO) return 1;
                if (a.SORT_NO<b.SORT_NO) return -1;
                return 0;
            });
            map.strokes.loadLines();
            map.strokes.createStrokes(item_id);
        },

        createStrokes:function(item_id){
            if (item_id==undefined || map.strokes.items[item_id].points==undefined) return;
            var point = 0;
            var points = [];
            var s = "";
            for (var k0 in map.strokes.items[item_id].points){
                points.push(map.strokes.items[item_id].points[k0]);
            }
            //log(points);
            for (var k in map.strokes.items[item_id].lines){
                switch (map.strokes.items[item_id].lines[k].VALUE){
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
                        point +=2;
                        break;
                }
            }
            map.strokes.items[item_id].value = s;
            map.render();

        },
        drawStrokes:function(){
            for (var k in map.strokes.items){
                map.drawSVG(map.strokes.items[k]);
            }

        }



    },

    //// Работа с надписями

    addLabel:function(){
        var value = ($("#label_text").val()!="" && $("#label_text").val()!=undefined) ? $("#label_text").val() : "Автонадпись";
        var size = (!isNaN(parseInt($("#label_size").val()))) ? parseInt($("#label_size").val()) : 18;
        var rotation = (!isNaN(parseInt($("#label_rotation").val()))) ? parseInt($("#label_rotation").val()) : 0;
        var x = (!isNaN(+$(".Xinput").val()))?+$(".Xinput").val():100;
        var y = (!isNaN(+$(".Yinput").val()))?+$(".Yinput").val():100;
        send_queryJ({command:"new",subcommand:"hall_scheme_object",sid:sid,params:{
            OBJECT_TYPE:"LABEL",
            HALL_SCHEME_ID:30,
            VALUE:value,
            FONT_SIZE:size,
            ROTATION:rotation,
            X:x,
            Y:y,
            COLOR1:"#000000",
            COLOR2:"#FF0000"
        }},function(data){
            map.loadObjects();
        });
    },
    deleteLabels:function(id){
        var label = map.labels[id];
        send_queryJ({command:"remove",subcommand:"hall_scheme_object",sid:sid,params:{
            OBJECT_ID:label.id,
            OBJVERSION:label.OBJVERSION
        }},function(data){
            delete map.labels[id];
            $("#one_labels"+label.id).remove();
            map.render();
        });

    },
    saveLabels:function(){
        for (var k in map.labels){
            var label=map.labels[k];
            if (label.type!="LABEL") continue;
            send_queryJ({command:"modify",subcommand:"hall_scheme_object",sid:sid,params:{
                OBJECT_ID:label.id,
                OBJVERSION:label.OBJVERSION,
                VALUE:label.value,
                X:label.x,
                Y:label.y,
                FONT_SIZE:label.fontSize
            }},function(data){
                map.labels[data.ID].OBJVERSION = data.OBJVERSION;
            });
        }
    }




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

