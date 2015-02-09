
//var sid = "";



/*________________________________________________________________________________**/

function clientScreen_init(id){
    var clientScreenMap;
    var sid = MB.User.sid;
    var environment = MB.Content.find(id) || {};

    var tickets_stack,action_price_info;
    var interval;

    environment.date_time = '23.02.2015 19:00';
    environment.title = 'Новогодняя вечеринка у Деда мороза';
    environment.age_category = '12';
    environment.hall = 'ММДМ Камерный зал';

    var Modaltitle = '';
    environment.action_id = 380;

    Modaltitle = 'Сеанс: '+environment.date_time +' "'+ environment.title+'" ('+environment.age_category+'+)'+' | '+environment.hall;

    $('#clientScreenTitle').html(Modaltitle);
    $('#clientScreenFooter').show(200);
    $('#clientScreen').css('position','inherit');
    $('#clientScreenContent').css('overflow','inherit');

    var w = $(window).width()-40;
    var h = $(window).height()-180;
    var w70 = w -17 - w*3/10;

    clientScreenMap = new Map1({
        container: $("#clientScreenContent"),
        cWidth:w,
        cHeight:h,
        doc_root: "/multibooker/clientscreenview/",
        mode:"iFrame"
    });
    var socketObject = {
        sid:sid,
        type:"action_scheme",
        param:"action_id",
        id:environment.action_id,
        portion:30,
        save:{
            command:"operation",
            object:"block_place_list",
            field_name:"action_scheme_id"
        },
        load:{
            command:"get",
            object:"action_scheme",
            params:{
                action_id:environment.action_id
            },
            columns:"ACTION_SCHEME_ID,PRICE,STATUS,STATUS_TEXT,FUND_GROUP_NAME,PRICE_GROUP_NAME,BLOCK_COLOR,COLOR",
            field_name:"action_scheme_id"
        }
    };

    var o = {
        command:"get",
        object:"action_scheme",
        sid:sid,
        params:{
            action_id:environment.action_id
        }
    };
    var o2 = {
        command:"get",
        object:"action_scheme_object",
        sid:sid,
        params:{
            where:"ACTION_ID = "+environment.action_id
        }
    };

    var squareO = {
        command:"get",
        object:"action_scheme",
        sid:sid,
        params:{
            action_id:environment.action_id
        }
    };
    var layerO = {
        command:"get",
        object:"action_scheme_layer",
        sid:sid,
        params:{
            where:"ACTION_ID = "+environment.action_id+" and VISIBLE_CASHER='TRUE'",
            columns:"ACTION_SCHEME_LAYER_ID",
            order_by:"SORT_NO"
        }
    };
    var objectO = {
        command:"get",
        object:"action_scheme_object",
        sid:sid,
        where_field:"ACTION_SCHEME_LAYER_ID",
        params:{

            /*columns:"ACTION_SCHEME_OBJECT_ID,OBJECT_TYPE,OBJECT_TYPE,ROTATION,FONT_FAMILY,FONT_SIZE,FONT_STYLE,FONT_WIEGH,COLOR,X,Y,BACKGROUND_URL_SCALE,BACKGROUND_URL_ORIGINAL,BACKGROUND_COLOR",*/
            order_by:"SORT_NO"
        }
    };
    clientScreenMap.openSocket(socketObject);

    clientScreenMap.loadSquares(squareO,function(){
        clientScreenMap.loadRenderItems({
            layerO:layerO,
            objectO:objectO
        },function(){
            clientScreenMap.render();
        });

        //clientScreenMap.loadObjects(o2,function(){
        clientScreenMap.setLayout(function(){
            clientScreenMap.setMinMax(function(){
                clientScreenMap.setScaleCoff(function(){
                    clientScreenMap.render(function(){
                        clientScreenMap.reLoadLayout(function(){
                            action_price_info.load();
                        });
                    });

                    clientScreenMap.setEvents();
                });

            });
        });
        //});

        uiTabs();
        uiUl();

    });

    action_price_info = {
        box:"placesInfo",
        load:function(){
            var squares = clientScreenMap.squares;
            var obj = {};
            var total_free_count = 0;
            var html = '';
            var container = $("#"+this.box);
            for (var i1 in squares){
                var square = squares[i1];
                if (square.status==0 || +square.price<=0) continue;
                if (obj[square.priceGroup]===undefined){
                    obj[square.priceGroup] = {
                        price:square.salePrice,
                        count:1,
                        color:square.color0,
                        priceGroup: square.priceGroup
                    };
                }else{
                    obj[square.priceGroup].count++;
                }
                total_free_count++;

            }

            var o2 = [];
            for (var k in obj){
                o2.push(obj[k]);
            }


            o2.sort(function(a,b){
                if (+a.price< +b.price) return -1;
                else if (+a.price>+b.price) return 1;
                return 0;
            });


            for(var i in o2){
                html += '<li data-squares="'+o2[i].priceGroup+'" class="">' +
                    '<div class="colorCircle" style="background-color:'+o2[i].color +'"></div>' +
                    '<div class="info">'+o2[i].price+' руб.'+
                    '<span class="placeCountBar">'+o2[i].count+'</span>' +
                    '</div>'+
                    '</li>';
            }

            html += '<li data-squares="busy" class="noPadding">' +
                    '<div class="colorCircle" style="background-color:#000000"></div>' +
                    '<div class="info">Заблокировано</div>'+
                    '</li>'+

                    '<li data-squares="busy" class="noPadding">' +
                    '<div class="colorCircle" style="background-color:grey"></div>' +
                    '<div class="info">Бронь</div>'+
                    '</li>';


            container.html(html);
            container.find('li').on('click', function(){
                clearInterval(interval);
                var squaresInPrice = [], tmpPriceGrp = $(this).data('squares');

                for(var lig in clientScreenMap.squares){
                    if(! clientScreenMap.squares[lig].lighted_now) clientScreenMap.squares[lig].lighted_now = false;
                    clientScreenMap.squares[lig].lighted_now = false;
                }

                for(var sq in clientScreenMap.squares){
                    var sqItem = clientScreenMap.squares[sq];
                    if(sqItem.priceGroup == tmpPriceGrp){
                        if(sqItem.status != 0){
                            squaresInPrice.push(sqItem.id);

                        }
                    }
                }


                var inter = 0;
                interval = window.setInterval(function(){

                    for(var ligInt in squaresInPrice){
                        var ligItem = squaresInPrice[ligInt];
                        if(! clientScreenMap.squares[ligItem].lighted_now) clientScreenMap.squares[ligItem].lighted_now = false;

                        if(inter%2 == 0){
                            clientScreenMap.squares[ligItem].lighted_now = true;
                        }else{
                            clientScreenMap.squares[ligItem].lighted_now = false;
                        }
                    }
                    inter ++;
                    clientScreenMap.render();
                },400);


            });
        }
    };



}




