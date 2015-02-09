var EL0,mapE;


function mapEditor_init(id){


    var mapEditor_map;
    var sid = MB.User.sid;
    var environment = MB.Content.find(id);



    mapEditor_map = new MapEditor({
        box:"box_for_mapEditor",
        name:"mapEditor",
        cWidth:environment.getWidth(),
        cHeight:environment.getHeight()
        /*environment:environment*/
    });
    mapEditor_map.objversion = environment.objversion;
    mapEditor_map.load({
            object:"hall_scheme_item",
            /*params:{where : "HALL_SCHEME_ID = "+environment.hall_scheme_id},*/
            params:{
                hall_scheme_id:environment.hall_scheme_id,
                background_image:environment.background_image,
                background_x:environment.background_x,
                background_y:environment.background_y,
                background_show:environment.background_show
            },
            loadObjectsParam:{
                object:"hall_scheme_object",
                params:{
                    where:"HALL_SCHEME_ID = "+environment.hall_scheme_id
                }
            },
            reLoadCallback:function(){


            }
        },function(){
            $("#count_lines").focus();
            EL.loadGroups();
            mapEditor_map.box.click(function(e){
                if (mapEditor_map.scaleCoeff==0) mapEditor_map.scaleCoeff=0.0001;


            });

            //log(mapEditor_map.squares.length);
            if (mapEditor_map.squares.length==0){

                EL.createGroup({0:{
                    x:1,
                    y:1,
                    color0:"#c1c1c1",
                    color1:"#c1c1c1",
                    place:0,
                    line:0
                }});

                mapEditor_map.setScaleCoff();
                delete mapEditor_map.squares[10000];
                $("#for_groups").html("");
            }else{
                mapEditor_map.setScaleCoff();
            }

            mapEditor_map.ctx.fillStyle = "#000";
            mapEditor_map.render();

            mapE = mapEditor_map;

        }
    );
    $("div").each(function(){
        if (this.id!="")
            preventSelection(document.getElementById(this.id));
    });
    
    

    $(document).keydown(function(e){
        if (e.which==46){
            if (mapEditor_map.shiftState==16)
                EL.deleteSelection();
        }
    });

    mapEditor_map.push = function(obj){

        if (typeof obj != "object") return;
        var max = 0;
        for (var k in mapEditor_map.squares){
            if (+k>max) max = +k;
        }
        max+=1;
        obj.id = max;
        var color = obj.color0.replace("#","0x");
        if (color>+"0x8b5742")
            obj.textColor = "#000";
        else
            obj.textColor = "#fff";
        obj.place += "";
        obj.status = 0;
        mapEditor_map.squares[max] = obj;
    };

    mapEditor_map.addSquare = function(obj){
        mapEditor_map.push(obj);


    };

    var EL = {
        renderCount:1,
        renderCounter:1,
        groups:[],
        last_group:0,
        xSelection:[],
        ySelection:[],
        minXSelection:0,
        minYSelection:0,
        maxXSelection:0,
        maxYSelection:0,
        splitSelection:function(){
            this.xSelection=[];
            this.ySelection=[];
            var sel =[];
            for (var s0 in mapEditor_map.selection){
                sel.push(mapEditor_map.selection[s0]);
            }
            //debugger;
            var get_sel_length = function(){
                var count = 0;
                for (var k in sel){
                    count++;
                }
                return count;

            };
            var get_sel_first = function(){
                var min = sel.length;
                for (var k in sel){
                    if (+k < min) min = k;
                }
                return min;
            };

            var xCount = 0;

            this.minXSelection = mapEditor_map.squares[sel[get_sel_first()]].x;
            this.minYSelection = mapEditor_map.squares[sel[get_sel_first()]].y;
            while (get_sel_length()!=0){
                //debugger;
                this.xSelection[xCount] = [];
                var get_first = get_sel_first();
                var firstY = mapEditor_map.squares[sel[get_first]].y;
                this.xSelection[xCount].push(sel[get_first]);



                delete sel[get_first];
                for (var k in sel){
                    /// вычисление границ выделения
                    if (mapEditor_map.squares[sel[k]].x<this.minXSelection) this.minXSelection = mapEditor_map.squares[sel[k]].x;
                    if (mapEditor_map.squares[sel[k]].x>this.maxXSelection) this.maxXSelection = mapEditor_map.squares[sel[k]].x;
                    if (mapEditor_map.squares[sel[k]].y<this.minYSelection) this.minYSelection = mapEditor_map.squares[sel[k]].y;
                    if (mapEditor_map.squares[sel[k]].y>this.maxYSelection) this.maxYSelection = mapEditor_map.squares[sel[k]].y;
                    /// конец вычисление границ выделения
                    if (k==0) continue;

                    if (mapEditor_map.squares[sel[k]].y>firstY-mapEditor_map.squareWH/2 && mapEditor_map.squares[sel[k]].y<firstY+mapEditor_map.squareWH/2){
                        this.xSelection[xCount].push(sel[k]);
                        delete sel[k];
                    }
                }
                this.xSelection[xCount] = this.xSelection[xCount].sort(function(a,b){
                    return mapEditor_map.squares[a].x - mapEditor_map.squares[b].x;
                });
                xCount++;
            }


            for (var s0 in mapEditor_map.selection){
                sel.push(mapEditor_map.selection[s0]);
            }

            var yCount = 0;
            while (get_sel_length()!=0){
                this.ySelection[yCount] = [];
                get_first = get_sel_first();
                var firstX = mapEditor_map.squares[sel[get_first]].x;
                this.ySelection[yCount].push(sel[get_first]);
                delete sel[get_first];
                for (var k in sel){
                    if (k==0) continue;
                    if (mapEditor_map.squares[sel[k]].x>firstX-mapEditor_map.squareWH/2 && mapEditor_map.squares[sel[k]].x<firstX+mapEditor_map.squareWH/2){
                        this.ySelection[yCount].push(sel[k]);
                        delete sel[k];
                    }
                }
                this.ySelection[yCount] = this.ySelection[yCount].sort(function(a,b){
                    return mapEditor_map.squares[a].y - mapEditor_map.squares[b].y;
                });
                yCount++;
            }
            this.xSelection.sort(function(a,b){
                if (mapEditor_map.squares[a[0]].y<mapEditor_map.squares[b[0]].y) return -1;
                else if (mapEditor_map.squares[a[0]].y>mapEditor_map.squares[b[0]].y) return 1;
                return 0;
            });
            //log(this.xSelection);
            //log(this.ySelection);



            //log("minX= "+this.minXSelection+"; minY= "+this.minYSelection+"; maxX= "+this.maxXSelection+"; maxY= "+this.maxYSelection);



        },
        fillNumbers:function(xReverse,yReverse){
            if (mapEditor_map.countSelection()==0){
                bootbox.dialog({
                    message: "Не выбрано ни одного места",
                    title: "",
                    buttons: {
                        error: {
                            label: "Ок",
                            className: "blue"
                        }
                    }
                });
                return;
            }
            this.splitSelection();

            var obj = EL.xSelection;
            if ($("#invert_line_place:checked").length>0)
                obj = EL.ySelection;
            if ($("#one_row").val()>0){
                obj = [];
                obj[+$("#one_row").val()-1] = mapEditor_map.selection.sort(function(a,b){
                    if (mapEditor_map.squares[a].x<mapEditor_map.squares[b].x) return -1;
                    if (mapEditor_map.squares[a].x>mapEditor_map.squares[b].x) return 1;
                    return 0;
                });
            }


            if (yReverse==1) obj.reverse();
            //var line = (+$("#one_row").val()>0) ? $("#one_row").val() : 1;
            var line = ($("#shift_lines").val()!=1 && !isNaN($("#shift_lines").val()))? +$("#shift_lines").val() : 1;
            var place = ($("#shift_places").val()!=1 && !isNaN($("#shift_places").val()))? +$("#shift_places").val() : 1;
            for (var r in obj){
                place = ($("#shift_places").val()!=1 && !isNaN($("#shift_places").val()))? +$("#shift_places").val() : 1;
                if (xReverse==1) obj[r].reverse();
                    for (var p in obj[r]){

                        mapEditor_map.squares[obj[r][p]].line = (+$("#one_row").val()>0) ? $("#one_row").val() : line;
                        mapEditor_map.squares[obj[r][p]].place = String(place);
                        if (mapEditor_map.squares[obj[r][p]].status==1)
                            mapEditor_map.squares[obj[r][p]].status = 2;
                        place++;
                }
                line++;
            }
            mapEditor_map.render();
        },

        get_last_group:function(){
            $(".one_group").each(function(){
                var id = +this.id.replace(/[^0-9]/ig,'');
                if (id>=EL.last_group) EL.last_group = id+1;
            });
            return this.last_group;
        },
        createGroup:function(params){
            if (typeof params!="object") return;
            var last_group = this.get_last_group();
            var gr_name = ($("#group_name").val()!='') ? ($("#group_name").val()=='Автогруппа') ? 'Автогруппа '+last_group : $("#group_name").val() : 'Группа '+last_group;
            this.groups.push("Group"+last_group);
            for (var k in params){
                mapEditor_map.addSquare(
                    {
                        x:params[k].x,
                        y:params[k].y,
                        w:params[k].w,
                        h:params[k].h,
                        color0:params[k].color0,
                        color1:params[k].color1,
                        place:params[k].place,
                        line:params[k].line,
                        group:last_group,
                        group_name:gr_name

                    }
                );

            }
            $("#for_groups").append('<div class="one_group" id="one_group'+last_group+'"><span>'+gr_name+'</span></div>');
        },
        loadGroups:function(){
//            mapEditor_map.squares[]
            for (var k in mapEditor_map.squares){
                if ($("#one_group"+mapEditor_map.squares[k].group).length==0){
                    $("#for_groups").append('<div class="one_group" id="one_group'+mapEditor_map.squares[k].group+'"><span>'+mapEditor_map.squares[k].group_name+'</span></div>');
                }
            }

        },
        func1: function(){
            var x = +$("#X").val();
            var y = +$("#Y").val();
            var w = +$("#W").val();
            var h = +$("#H").val();
            var places = +$("#count_places").val();
            var lines = +$("#count_lines").val();
            var color = $("#COLOR").val();
            var Xcoef = $("#Xcoef").val();
            var Ycoef = $("#Ycoef").val();



            var wh = mapEditor_map.squareWH;//*mapEditor_map.scaleCoeff;

            var squares = {};
            var count = 1;
            for (var l = 1; l<=lines; l++){
                for (var p = 1; p<=places; p++){
                    squares[count] = {
                        x:x+(p-1)*(w+w*Xcoef),
                        y:y+(l-1)*(h+h*Ycoef),
                        w:w,
                        h:h,
                        color0:color,
                        color1:color,
                        place:p,
                        line:l
                    };
                    count++;
                }
            }
            this.createGroup(squares);
            mapEditor_map.render();
            var sqLength = 0 ;
            for (var k in mapEditor_map.squares){
                sqLength++;
            }
            this.renderCounter = Math.floor(sqLength/1000)+1;
            //log(this.renderCounter);

        },
        reLoadGroups:function(){
            $(".one_group").each(function(){
                var id = this.id.replace(/[^0-9]/ig,'');

                for (var k in mapEditor_map.squares){
                    if (mapEditor_map.squares[k].group == id) {
                        return true;
                    }
                }
                $("#one_group"+id).remove();
            });
        },
        deleteSelection:function(){
            if (mapEditor_map.selection.length==0) return;
            mapEditor_map.loading = true;
            var allSelection = mapEditor_map.countSelection();
            var counter =0;

            MB.Core.sendQuery({command:"operation",object:"delete_hall_scheme_item",sid:sid,params:{hall_scheme_item_id:mapEditor_map.selection.join(',').replace(/,+[^0-9]/ig,',').replace(/,$/ig,'').replace(/^,/ig,'')}},function(data){
                if (data.RC == 0){
                    for (var k in mapEditor_map.selection){
                        delete mapEditor_map.squares[mapEditor_map.selection[k]];
                    }
                    mapEditor_map.selection = [];
                    mapEditor_map.reLoad();
                    EL.reLoadGroups();
                    mapEditor_map.loading = false;
                }else{
                    log(data.MESSAGE);
                }
            });
            /*for (var k in mapEditor_map.selection){
                if (mapEditor_map.squares[mapEditor_map.selection[k]].status==1  || mapEditor_map.squares[mapEditor_map.selection[k]].status==2){
                    MB.Core.sendQuery({command:"delete",object:"hall_scheme_item",sid:sid,params:{hall_scheme_item_id:mapEditor_map.squares[mapEditor_map.selection[k]].id}},function(data){
                        counter++;
                        var id = $(data).find("id").text();
                        delete mapEditor_map.squares[id];
                        if (counter==allSelection){
                            mapEditor_map.reLoad();
                            mapEditor_map.render();
                            EL.reLoadGroups();
                            mapEditor_map.selection = [];
                            mapEditor_map.loading = false;
                            mapEditor_map.reLoadLayout();
                        }

                    });
                }else{
                    counter++;
                    delete mapEditor_map.squares[mapEditor_map.selection[k]];
                    mapEditor_map.render();
                    EL.reLoadGroups();
                    if (counter==allSelection){
                        mapEditor_map.loading = false;
                        mapEditor_map.reLoadLayout();
                    }
                }

            }*/

        },
        xScale:function(dX){
            if (mapEditor_map.selection.length==0) return;
            //var minX = mapEditor_map.squares[mapEditor_map.selection[0]].x;
            var minX = 1000000;
            for (var k in mapEditor_map.selection){
                if (mapEditor_map.squares[mapEditor_map.selection[k]].x<minX) minX = mapEditor_map.squares[mapEditor_map.selection[k]].x;
            }
            var maxX = 0;
            for (var k in mapEditor_map.selection){
                if (mapEditor_map.squares[mapEditor_map.selection[k]].x>maxX) maxX = mapEditor_map.squares[mapEditor_map.selection[k]].x;
            }
            if (minX==maxX) return;
            var scaleCoef = (maxX - minX+dX)/(maxX - minX);
            for (var k0 in mapEditor_map.selection){
                var delta = (mapEditor_map.squares[mapEditor_map.selection[k0]].x - minX)*scaleCoef;
                mapEditor_map.squares[mapEditor_map.selection[k0]].x = minX +delta;
                if (mapEditor_map.squares[mapEditor_map.selection[k0]].status==1)
                    mapEditor_map.squares[mapEditor_map.selection[k0]].status = 2;
            }


            mapEditor_map.render();
        },
        yScale:function(dY){
            if (mapEditor_map.selection.length==0) return;
            //var minY = mapEditor_map.squares[mapEditor_map.selection[0]].y;
            var minY = 1000000;
            for (var k in mapEditor_map.selection){
                if (mapEditor_map.squares[mapEditor_map.selection[k]].y<minY) minY = mapEditor_map.squares[mapEditor_map.selection[k]].y;
            }
            var maxY = 0;
            if (minY==maxY) return;
            for (var k in mapEditor_map.selection){
                if (mapEditor_map.squares[mapEditor_map.selection[k]].y>maxY) maxY = mapEditor_map.squares[mapEditor_map.selection[k]].y;
            }
            var scaleCoef = (maxY - minY+dY)/(maxY - minY);
            for (var k0 in mapEditor_map.selection){
                var delta = (mapEditor_map.squares[mapEditor_map.selection[k0]].y - minY)*scaleCoef;
                mapEditor_map.squares[mapEditor_map.selection[k0]].y = minY +delta;
                if (mapEditor_map.squares[mapEditor_map.selection[k0]].status==1)
                    mapEditor_map.squares[mapEditor_map.selection[k0]].status = 2;
            }


            mapEditor_map.render();
        },
        moveTo:function(x,y){
            var group = mapEditor_map.selection;
            var dX = (x-this.downX)/mapEditor_map.scaleCoeff;
            var dY = (y-this.downY)/mapEditor_map.scaleCoeff;
            for (var k in group){
                var sq = mapEditor_map.squares[group[k]];
                var Xnew = mapEditor_map.squares[group[k]].x + dX;
                var Ynew = mapEditor_map.squares[group[k]].y + dY;
                mapEditor_map.squares[group[k]].x = Xnew;
                mapEditor_map.squares[group[k]].y = Ynew;
                if (mapEditor_map.squares[group[k]].status==1)
                    mapEditor_map.squares[group[k]].status = 2;
            }
            this.downX = x;
            this.downY = y;
            if (this.renderCount%EL.renderCounter==0)
                mapEditor_map.render();
            this.renderCount++;
        }

    };

    EL0 = EL;







    /*mapEditor_map.init({
        box:"box_for_mapEditor"

    });


    mapEditor_map.load({
        object:"hall_scheme_item",
        params:{where : "HALL_SCHEME_ID = 30"},
        reLoadCallback:function(){

        },
        loadObjectsParam:{
            object:"hall_scheme_object",
            params:{
                where:"HALL_SCHEME_ID = 30"
            }
        }
    },function(data){
        testVisibilityminiModal('mapEditor');
        EL.loadGroups();
        mapEditor_map.box.click(function(e){
            if (mapEditor_map.scaleCoeff==0) mapEditor_map.scaleCoeff=0.0001;

           *//* $("#X").val((e.offsetX-mapEditor_map.XCoeff)/mapEditor_map.scaleCoeff);
            $("#Y").val((e.offsetY-mapEditor_map.YCoeff)/mapEditor_map.scaleCoeff);*//*
        });

        //log(mapEditor_map.squares.length);
        if (mapEditor_map.squares.length==0){

            EL.createGroup({0:{
                x:1,
                y:1,
                color0:"#c1c1c1",
                color1:"#c1c1c1",
                place:0,
                line:0
            }});

            mapEditor_map.setScaleCoff();
            delete mapEditor_map.squares[10000];
            $("#for_groups").html("");
        }else{
            mapEditor_map.setScaleCoff();
        }

        mapEditor_map.ctx.fillStyle = "#000";
        mapEditor_map.render();

        $("div").each(function(){
            if (this.id!="")
                preventSelection(document.getElementById(this.id));
        });


    });
    */
    mapEditor_map.box.mousedown(function(e){
        var x = e.offsetX;
        var y = e.offsetY;
        switch (e.which){
            case 1:
                EL.downX = x;
                EL.downY = y;
                EL.downed = 1;

                break;



        }


    });

    mapEditor_map.box.mousemove(function(e){

        var x = e.offsetX;
        var y = e.offsetY;
        var wh = mapEditor_map.squareWH;
        var cw = mapEditor_map.canvas.width();
        var ch = mapEditor_map.box.height();

        var group = mapEditor_map.selection;
        switch (e.which){
            case 1:
                switch (mapEditor_map.shiftState){
                    case 17:

                        if (mapEditor_map.mode!="squares") return;
                        if (EL.downed && mapEditor_map.selection.length>0){
                            EL.moveTo(x,y);
                           /* var dX = (x-EL.downX)/mapEditor_map.scaleCoeff;
                            var dY = (y-EL.downY)/mapEditor_map.scaleCoeff;
                                for (var k in group){
                                    var sq = mapEditor_map.squares[group[k]];
                                    var Xnew = mapEditor_map.squares[group[k]].x + dX;
                                    var Ynew = mapEditor_map.squares[group[k]].y + dY;
                                    mapEditor_map.squares[group[k]].x = Xnew;
                                    mapEditor_map.squares[group[k]].y = Ynew;
                                }
                            EL.downX = x;
                            EL.downY = y;
                            if (EL.renderCount%EL.renderCounter==0)
                                mapEditor_map.render();
                            EL.renderCount++;*/

                        }

                    break;
                }
                break;



        }


    });
    mapEditor_map.box.mouseup(function(e){
        var x = e.offsetX;
        var y = e.offsetY;

        //log(mapEditor_map.squares[0].x);

        EL.downed = 0;
        //mapEditor_map.render();



    });

    $("body").keydown(function(e){
        switch (e.which){
            case 39:
                switch (mapEditor_map.shiftState){
                    case 16:
                        EL.xScale(5);
                        break;
                    case 17:
                        EL.moveTo(+EL.downX+1,EL.downY);
                        break;
                }
                break;
            case 37:
                switch (mapEditor_map.shiftState){
                    case 16:
                        EL.xScale(-5);
                        break;
                    case 17:
                        EL.moveTo(+EL.downX-1,EL.downY);
                        break;
                }
                break;
            case 38:
                switch (mapEditor_map.shiftState){
                    case 16:
                        EL.yScale(-5);
                        break;
                    case 17:
                        EL.moveTo(EL.downX,+EL.downY-1);
                        break;
                }
                break;
            case 40:
                switch (mapEditor_map.shiftState){
                    case 16:
                        EL.yScale(5);
                        break;
                    case 17:
                        EL.moveTo(EL.downX,+EL.downY+1);
                        break;
                }
                break;
        }

    });





    $("#create_group").click(function(){
        EL.func1();
    });
    $("#copy_selection").click(function(){
       mapEditor_map.copySelection();
    });

    $(".one_group").live("click",function(){
        var id = this.id.replace(/[^0-9]/ig,'');
        mapEditor_map.clearSelection();
        for (var k in mapEditor_map.squares){
            if (mapEditor_map.squares[k].group==id){
                mapEditor_map.addToSelection(mapEditor_map.squares[k].id);
            }
        }
    });

    $("#unite_group").click(function(){
        var last_group = EL.get_last_group();
        var gr_name = ($("#group_name").val()!='') ? ($("#group_name").val()=='Автогруппа') ? 'Автогруппа '+last_group : $("#group_name").val() : 'Группа '+last_group;
        for (var k in mapEditor_map.selection){
            mapEditor_map.squares[mapEditor_map.selection[k]].group = last_group;
            mapEditor_map.squares[mapEditor_map.selection[k]].group_name = gr_name;
            mapEditor_map.squares[mapEditor_map.selection[k]].color1 = $("#COLOR").val();
            if (mapEditor_map.squares[mapEditor_map.selection[k]].status==1)
                mapEditor_map.squares[mapEditor_map.selection[k]].status = 2;
        }
        $("#for_groups").append('<div class="one_group" id="one_group'+last_group+'"><span>'+gr_name+'</span></div>');
        EL.reLoadGroups();

    });

    $("#save_scheme_item").click(function(){
        var info = toastr["info"]("Идет процесс сохранения", "Подождите...",{
            timeOut:1000000
        });
        var sqCount = 0;
        for (var k0 in mapEditor_map.squares){
            //if (mapEditor_map.squares[k0].status==0) sqCount++;
            sqCount++;
        }
        var counter = 0;
        mapEditor_map.loading = true;
        //var old_squares = [];
        for (var k in mapEditor_map.squares){

            switch (mapEditor_map.squares[k].status){
                case 0:   //// NEW
                    MB.Core.sendQuery({command:"new",object:"hall_scheme_item",sid:sid,params:
                    {
                        old_id:mapEditor_map.squares[k].id,
                        hall_scheme_id:environment.hall_scheme_id,
                        place:mapEditor_map.squares[k].place,
                        line:mapEditor_map.squares[k].line,
                        x:mapEditor_map.squares[k].x,
                        y:mapEditor_map.squares[k].y,
                        w:mapEditor_map.squares[k].w,
                        h:mapEditor_map.squares[k].h,
                        group_id:mapEditor_map.squares[k].group,
                        group_name:mapEditor_map.squares[k].group_name,
                        color:mapEditor_map.squares[k].color1
                    }},function(data){
                        if(data.RC==0){
                            counter++;
                            var id = data.ID;
                            var old_id = data.OLD_ID;
                            //old_squares.push(old_id);
                            mapEditor_map.squares[old_id].id = id;
                            mapEditor_map.squares[old_id].status = 1;
                            mapEditor_map.squares[id] = mapEditor_map.squares[old_id];
                            delete mapEditor_map.squares[old_id];
                            if (counter==sqCount) {
                                mapEditor_map.loading = false;
                                mapEditor_map.reLoad();
                                //mapEditor_map.reLoadLayout();
                                mapEditor_map.selection = [];

                                mapEditor_map.reLoadLayout();
                                info.fadeOut(600);
                                toastr["success"]("Изменения успешно сохранены", "");
                            }

                        }else{
                            log(data.message);
                        }
                    });
                    break;
                case 2:    //// EDIT
                    if (mapEditor_map.squares[k].group==undefined) mapEditor_map.squares[k].group = 1;
                    MB.Core.sendQuery({command:"modify",object:"hall_scheme_item",sid:sid,params:
                    {
                        hall_scheme_item_id:mapEditor_map.squares[k].id,
                        hall_scheme_id:environment.hall_scheme_id,
                        place:mapEditor_map.squares[k].place,
                        line:mapEditor_map.squares[k].line,
                        x:mapEditor_map.squares[k].x,
                        y:mapEditor_map.squares[k].y,
                        w:mapEditor_map.squares[k].w,
                        h:mapEditor_map.squares[k].h,
                        group_id:mapEditor_map.squares[k].group,
                        group_name:mapEditor_map.squares[k].group_name,
                        color:mapEditor_map.squares[k].color1
                    }},function(data){
                        counter++;
                        if(data.RC==0){
                            var id = data.ID;
                            mapEditor_map.squares[k].status = 1;
                            if (counter==sqCount) {
                                mapEditor_map.loading = false;
                                mapEditor_map.reLoad();
                                mapEditor_map.selection = [];
                                mapEditor_map.reLoadLayout();
                                info.fadeOut(600);
                                toastr["success"]("Изменения успешно сохранены", "");
                            }
                        }
                    });
                    break;
                default:
                    counter++;
                    if (counter==sqCount) {
                        mapEditor_map.loading = false;
                        mapEditor_map.reLoad();
                        mapEditor_map.selection = [];
                        mapEditor_map.reLoadLayout();
                    }
                    break;
            }

        }

    });

    $("#del_scheme_item").click(function(){
        bootbox.dialog({
            message: "Удалить все?",
            title: "Удаление",
            buttons: {
                yes: {
                    label: "Да",
                    className: "red",
                    callback:function(){
                        bootbox.dialog({
                            message: "Все элементы будут удалены!",
                            title: "<span style='color: #ff0000; font-weight: bold;'>Уверены?</span>",
                            buttons: {
                                yes: {
                                    label: "Да",
                                    className: "red",
                                    callback:function(){
                                        MB.Core.sendQuery({command:"operation",object:"remove_all_scheme_items",sid:sid,params:{hall_scheme_id:environment.hall_scheme_id}},function(data){
                                            if (data.RC==0){
                                                mapEditor_map.squares = [];
                                                mapEditor_map.render();
                                            }else{
                                                bootbox.dialog({
                                                    message: data.MESSAGE,
                                                    title: "Ошибка",
                                                    buttons: {
                                                        error: {
                                                            label: "Ок",
                                                            className: "red"

                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    }
                                },
                                no: {
                                    label: "Отмена",
                                    className: "green",
                                    callback:function(){}
                                }
                            }
                        });

                    }
                },
                no: {
                    label: "Нет",
                    className: "green",
                    callback:function(){}
                }
            }
        });



    });

    $("#fillNumLT").click(function(){
        EL.fillNumbers();
    });
    $("#fillNumRT").click(function(){
        EL.fillNumbers(1);
    });
    $("#fillNumRB").click(function(){
        EL.fillNumbers(1,1);
    });
    $("#fillNumLB").click(function(){
        EL.fillNumbers(0,1);
    });

    
    environment.mapEditorSelectArea = {};
    $("#select_area_group").click(function(){
        if (mapEditor_map.countSelection()==0) return;
        for(var s in mapEditor_map.selection){
            if (mapEditor_map.squares[mapEditor_map.selection[s]].status==0)   {
                bootbox.dialog({
                    message: "Выделенные элементы еще не сохранены.",
                    title: "Ошибка",
                    buttons: {
                        error: {
                            label: "Ок",
                            className: "blue"
                        }
                    }
                });


                return;
                //delete mapEditor_map.selection[s];
            }


        }



        MB.Core.switchModal({
            type: "form",
            ids: [environment.hall_id],
            name: "form_area_group",
            params:{
                /*tblselectedrow:environment.area_group_id,*/
                tblcallbacks:{
                    custom1:{
                        name: "Выбрать",
                        callback: function (key, options) {
                            MB.Modal.close("form_area_group");
                            environment.area_group_id =  options.$trigger.data("row");


                            MB.Core.sendQuery({
                                command:"operation",
                                object:"change_hall_scheme_item_area_group",
                                sid:sid,
                                params:{
                                    area_group_id:environment.area_group_id,
                                    hall_scheme_item_id:mapEditor_map.selection.join(',').replace(/,+[^0-9]/ig,',').replace(/,$/ig,'').replace(/^,/ig,'')
                                }},function(data){
                                    if (data.RC==0){
                                        mapEditor_map.reLoad();
                                        mapEditor_map.clearSelection();
                                    }else{
                                        log(data.MESSAGE);
                                    }

                            });
                        }
                    }
                }
            }
        });


        /*MB.Core.switchModal({type: "table", name: "table_area_group", params: {
            hall_id: environment.hall_id,
            callback: function (area_group_id) {
                if (mapEditor_map.countSelection()==0) return;
                MB.Core.sendQuery({
                    command:"operation",
                    object:"change_hall_scheme_item_area_group",
                    sid:sid,
                    params:{
                        area_group_id:area_group_id,
                        hall_scheme_item_id:mapEditor_map.selection.join(',').replace(/,+[^0-9]/ig,',').replace(/,$/ig,'').replace(/^,/ig,'')
                    }},function(data){
                        if (data.RC==0){
                            mapEditor_map.reLoad();
                            mapEditor_map.clearSelection();
                        }else{
                            log(data.MESSAGE);
                        }

                    });
            }
        }
        });*/
    });

    $("#clear_selection").click(function(){
        mapEditor_map.clearSelection();
    });
    $("#delete_selection").click(function(){
        bootbox.dialog({
            message: "Удалить выделеные места?",
            title: "",
            buttons: {
                yes: {
                    label: "Да",
                    className: "green",
                    callback:function(){
                        EL.deleteSelection();
                    }
                },
                no: {
                    label: "Нет",
                    className: "blue"
                }
            }
        });

    });
    $("#show_hide_background").click(function(){
            mapEditor_map.loadBackgroundFlag = !mapEditor_map.loadBackgroundFlag;
        mapEditor_map.render();
    });
    /// Переключение правого столбца
    $(".rcsc_btn").click(function(){
        $(".rcsc_btn").removeClass("selected");
        $(this).addClass("selected");
        var id = this.id.replace(/[^0-9]/ig,'');
        $(".right_column_block:visible").fadeOut(150,function(){
            $("#right_column_block"+id).fadeIn(150);
            mapEditor_map.mode = mapEditor_map.modes[id];
        });

    });


    $("#add_stroke").click(function(){
        mapEditor_map.strokes.add();
    });

    $(".one_stroke").live("click",function(){
        $(".one_stroke").removeClass("selected");
        $(this).addClass("selected");
        var id = this.id.replace(/[^0-9]/ig,'');
        $("#stroke_name").val($("#one_stroke"+id+" span").text());
        mapEditor_map.strokes.selected = id;
        mapEditor_map.strokes.loadPoints();
        mapEditor_map.strokes.loadLines();
    });
    $("#add_point").click(function(){
        mapEditor_map.strokes.addPoint({
            x:+$("#X").val(),
            y:$("#Y").val(),
            item:mapEditor_map.strokes.selected,
            selected:false
        });
        mapEditor_map.strokes.loadPoints();
    });

    $(".one_point").live("click",function(){
        var id = this.id.replace(/[^0-9]/ig,'');
        mapEditor_map.strokes.items[mapEditor_map.strokes.selected].points[id].selected = !mapEditor_map.strokes.items[mapEditor_map.strokes.selected].points[id].selected;
        mapEditor_map.strokes.drawPoint(mapEditor_map.strokes.items[mapEditor_map.strokes.selected].points[id]);
    });


    $(".point_edit_btn").click(function(){
        $(".point_edit_btn").removeClass("selected");
        $(this).addClass("selected");
        var id = this.id.replace(/[^0-9]/ig,'');
        mapEditor_map.strokes.point_mode = id;
    });


    $("#add_line").click(function(){
        mapEditor_map.strokes.createLine();
    });
    $("#create_Stroke").click(function(){
        mapEditor_map.strokes.createStrokes(mapEditor_map.strokes.selected);
    });


    $("#save_strokes").click(function(){
        mapEditor_map.strokes.save();
    });

    $(".one_strokes_del").die("click").live("click",function(){
        var id = this.id.replace(/[^0-9]/ig,'');
        mapEditor_map.strokes.remove(id);
    });


    $(".one_labels").live("click",function(){
        var id = this.id.replace(/[^0-9]/ig,'');
        mapEditor_map.labels[id].selected = !mapEditor_map.labels[id].selected;
        mapEditor_map.render();
    });

    $("#add_label").click(function(){
        mapEditor_map.addLabel();
    });
    $("#save_label").click(function(){
        mapEditor_map.saveLabels();
    });

    $(".one_labels_del").die("click").live("click",function(){
        var self = this;

        bootbox.dialog({
            message: "Удалить надпись?",
            title: "",
            buttons: {
                yes: {
                    label: "Да",
                    className: "green",
                    callback:function(){
                        var id = self.id.replace(/[^0-9]/ig,'');
                        mapEditor_map.deleteLabels(id);
                    }
                },
                no: {
                    label: "Нет",
                    className: "blue"
                }
            }
        });




    });

    $("#show_background").on("click",function(){
        var flag = !!($("#show_background:checked").length);
        var o = {
            command:"modify",
            object:"hall_scheme",
            sid:MB.User.sid,
            params:{
                hall_scheme_id:environment.hall_scheme_id,
                BACKGROUND_SHOW:(flag)?"TRUE":"FALSE",
                objversion:mapEditor_map.objversion
            }
        };
        MB.Core.socketQuery(o,function(result){
            if (result.RC==0){
                mapEditor_map.objversion = result.OBJVERSION;
                mapEditor_map.toggleBackgroundImage(flag);
                /*mapEditor_map.render();*/
            }
        });
        return false;
        //mapEditor_map.toggleBackgroundImage();

    });
    $("#load_background").on("click",function(){
        MB.Core.imageLoader.load({
            success:function(fileUID){
                var o = {
                    command:"modify",
                    object:"hall_scheme",
                    sid:MB.User.sid,
                    params:{
                        hall_scheme_id:environment.hall_scheme_id,
                        BACKGROUND_IMAGE_URL:fileUID.name,
                        BACKGROUND_SHOW:"TRUE",
                        objversion:mapEditor_map.objversion
                    }
                };
                MB.Core.socketQuery(o,function(result){
                    if (result.RC==0){
                        mapEditor_map.objversion = result.OBJVERSION;
                        mapEditor_map.backgroundImage.image.src = fileUID.base64Data;
                        mapEditor_map.toggleBackgroundImage(true);
                        /*mapEditor_map.render();*/
                    }
                });
            }

        });
    });
    $("#clear_background").on("click",function(){
        bootbox.dialog({
            message: "Удалить фон?",
            title: "",
            buttons: {
                yes: {
                    label: "Да",
                    className: "green",
                    callback:function(){
                        var o = {
                            command:"modify",
                            object:"hall_scheme",
                            sid:MB.User.sid,
                            params:{
                                hall_scheme_id:environment.hall_scheme_id,
                                BACKGROUND_IMAGE_URL:"",
                                BACKGROUND_SHOW:"FALSE",
                                objversion:mapEditor_map.objversion
                            }
                        };
                        MB.Core.socketQuery(o,function(result){
                            if (result.RC==0){
                                mapEditor_map.objversion = result.OBJVERSION;
                                mapEditor_map.backgroundImage.image.src = "";
                                mapEditor_map.toggleBackgroundImage(false);
                                /*mapEditor_map.render();*/
                            }
                        });
                    }
                },
                no: {
                    label: "Нет",
                    className: "blue"
                }
            }
        });


    });



}

$(document).ready(function(){

   /* $("#right_column input").keydown(function(e){
        if (e.which==13){
            var event = $.Event("keydown", { keyCode: 9 });
            $(this).trigger(event);
        }
    });*/
    /*$("#count_lines").keypress(function(e){
        if (e.whick==13){

        }
    });*/
});



























