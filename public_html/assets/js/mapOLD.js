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
    this.setSize = function () {
        this.containerWidth = params.cWidth || this.container.width();
        this.containercHeight = params.cHeight || this.container.height();
        this.cWidth = params.cWidth - (params.minusWidth || 0) || this.container.width() - (params.minusWidth || 0);
        this.cHeight = params.cHeight - (params.minusHeight || 0) || this.container.height() - (params.minusHeight || 0);
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
    this.layoutVCount = 20;
    this.layoutHCount = 20;
    this.squares = {};
    this.sectors = [];
    this.subSectors = [];
    this.squaresTrash = {};
    this.renderList = {
        items: [],
        findItem: function (id) {
            var items = this.items;
            for (var k in items) {
                if (items[k].object.object_id == id) return items[k];
            }
            return false;
        },
        removeItem: function (id) {
            var self = this;
            var items = this.items;
            for (var k in items) {
                if (items[k].object.object_id == id) delete items[k];
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

    var s = this.mode + '_';
    for (var i2 in this.loadObj.params) {
        s += '_' + i2 + this.loadObj.params[i2];
    }


    map.container.css({width: map.containerWidth + "px", height: map.containercHeight + "px"}).html('' +
        '<div class="loader_box" style="width: ' + map.containerWidth + 'px; height:' + map.containercHeight + 'px; display:none;"><div class="loader"></div></div> ' +
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
    if (map.navWideSide == 0 || map.navNarrowSide == 0)
        map.zoom_container.css("display", "none");

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

    // })();


};

Map1.prototype.draw = function () {
    var s = 'M670 775' +
        'Q690 775 690 795' +
        'L690 845' +
        'L690 895' +
        'L690 945' +
        'L690 995' +
        'L690 1045' +
        'L690 1095L690 1145Q690 1165 670 1165L640 1165L640 1195Q640 1215 620 1215L540 1215L540 1245Q540 1265 520 1265L440 1265L440 1295L440 1325L520 1325Q540 1325 540 1345L540 1395L540 1425L570 1425Q590 1425 590 1445L590 1495L590 1545L590 1575L620 1575Q640 1575 640 1595L640 1645L640 1695L640 1725L670 1725Q690 1725 690 1745L690 1795L690 1825L720 1825Q740 1825 740 1845L740 1895L740 1945L740 1995L740 2045L740 2095L740 2145L740 2195L740 2245L740 2295L740 2325L770 2325Q790 2325 790 2345L790 2375L920 2375Q940 2375 940 2395L940 2445L940 2495L940 2545L940 2595Q940 2615 920 2615L840 2615L840 2670L840 2720L840 2770L840 2820L840 2870L840 2920L840 2950L2420 2950Q2440 2950 2440 2970Q2440 2990 2420 2990L520 2990Q500 2990 500 2970L540 2920L500 2890L470 2890Q450 2890 450 2870L490 2820L450 2790L420 2790Q400 2790 400 2770L400 2740L370 2740Q350 2740 350 2720Q390 2740 370 2740L440 2740L440 2670L440 2595L440 2545L440 2495L400 2465L270 2465Q250 2465 250 2445L290 2395L290 2345L290 2295L290 2245L290 2195L290 2145L290 2095L290 2045L290 1995L290 1945L290 1895L290 1845L250 1815L220 1815Q200 1815 200 1795L240 1745L200 1715L170 1715Q150 1715 150 1695L190 1645L190 1595L150 1565L120 1565Q100 1565 100 1545L140 1495L140 1445L100 1415L70 1415Q50 1415 50 1395L90 1345L90 1295Q90 1315 70 1315L140 1315L140 1245Q140 1265 120 1265L190 1265L190 1195Q190 1215 170 1215L240 1215L240 1145L240 1095L240 1045L240 995Q240 1015 220 1015L290 1015L290 945L290 895L290 845L300 825L300 775';

    var s2 = 'M3870 50L4120 50Q4140 50 4140 70L4140 120L4140 170L4140 200L4170 200Q4190 200 4190 220L4190 250L4220 250Q4240 250 4240 270L4240 300L4320 300Q4340 300 4340 320L4340 370L4340 420L4340 470L4340 520L4340 570L4340 620L4340 670L4340 700L4370 700Q4390 700 4390 720L4390 770L4390 820L4390 870L4390 920L4390 970L4390 1020Q4390 1040 4370 1040L4020 1040L4020 1040Q4000 1040 4000 1020L4000 970L4000 920L4000 870L4000 820L4000 770L4000 720L4000 670L4000 620L4000 570L4000 520L4000 470L4000 420L4000 370L4000 320L4000 290L3970 290Q3950 290 3950 270L3950 240L3920 240Q3900 240 3900 220L3900 190L3870 190Q3850 190 3850 170L3850 120L3850 70Q3850 50 3870 50,M4320 50L4570 50Q4590 50 4590 70L4590 100L4620 100Q4640 100 4640 120L4640 150L4670 150Q4690 150 4690 170L4690 200L4720 200Q4740 200 4740 220L4740 250L4770 250Q4790 250 4790 270L4790 300L4870 300Q4890 300 4890 320L4890 370L4890 420L4890 470L4890 520L4890 570L4890 620L4890 670L4890 700L4920 700Q4940 700 4940 720L4940 770L4940 820L4940 870L4940 920L4940 970L4940 1020Q4940 1040 4920 1040L4520 1040L4520 1040Q4500 1040 4500 1020L4500 970L4500 920L4500 870L4500 820L4500 770L4500 720L4500 670L4500 620L4500 570L4500 520L4500 470L4500 420L4500 370L4500 320L4500 290L4470 290Q4450 290 4450 270L4450 240L4420 240Q4400 240 4400 220L4400 190L4370 190Q4350 190 4350 170L4350 140L4320 140Q4300 140 4300 120L4300 70Q4300 50 4320 50,M4670 1125L4870 1125Q4890 1125 4890 1145L4890 1175L4920 1175Q4940 1175 4940 1195L4940 1225L4970 1225Q4990 1225 4990 1245L4990 1275L5020 1275Q5040 1275 5040 1295L5040 1345L5040 1395Q5040 1415 5020 1415L4990 1415L4990 1445L4990 1495L4990 1545Q4990 1565 4970 1565L4940 1565L4940 1595L4940 1645L4940 1695Q4940 1715 4920 1715L4890 1715L4890 1745L4890 1795Q4890 1815 4870 1815L4840 1815L4840 1845L4840 1895L4840 1945Q4840 1965 4820 1965L4790 1965L4790 1995L4790 2045Q4790 2065 4770 2065L4740 2065L4740 2095Q4740 2115 4720 2115L4670 2115L4670 2115Q4650 2115 4650 2095L4650 2045L4650 1995L4650 1945L4650 1895L4650 1845L4650 1795L4650 1745L4650 1695L4650 1645L4650 1595L4650 1545L4650 1495L4650 1445L4650 1395L4650 1345L4650 1295L4650 1245L4650 1195L4650 1145Q4650 1125 4670 1125,M4120 1125L4470 1125Q4490 1125 4490 1145L4490 1195L4490 1245L4490 1275L4520 1275Q4540 1275 4540 1295L4540 1345L4540 1395L4540 1445L4540 1495L4540 1545L4540 1595L4540 1645L4540 1695L4540 1745L4540 1795L4540 1845L4540 1895L4540 1945L4540 1995L4540 2045L4540 2095L4540 2145L4540 2195Q4540 2215 4520 2215L4490 2215L4490 2245Q4490 2265 4470 2265L4120 2265L4120 2265Q4100 2265 4100 2245L4100 2195L4100 2145L4100 2095L4100 2045L4100 1995L4100 1945L4100 1895L4100 1845L4100 1795L4100 1745L4100 1695L4100 1645L4100 1595L4100 1545L4100 1495L4100 1445L4100 1395L4100 1345L4100 1295L4100 1245L4100 1195L4100 1145Q4100 1125 4120 1125\"],[\"616\",\"616\",\"Партер середина\",\"2000\",\"6000\",\"1227\",\"M2170 50L2420 50Q2440 50 2440 70L2440 120L2440 170Q2440 190 2420 190L2390 190L2390 220L2390 270L2390 320L2390 370L2390 420L2390 470L2390 520L2390 570L2390 620L2390 670L2390 720L2390 770L2390 820L2390 870L2390 920L2390 970L2390 1020Q2390 1040 2370 1040L2020 1040L2020 1040Q2000 1040 2000 1020L2000 970L2000 920L2000 870L2000 820L2000 770L2000 720Q2000 700 2020 700L2050 700L2050 670L2050 620L2050 570L2050 520L2050 470L2050 420L2050 370L2050 320Q2050 300 2070 300L2100 300L2100 270L2100 220Q2100 200 2120 200L2150 200L2150 170L2150 120L2150 70Q2150 50 2170 50,M2519 1125L2869 1125Q2889 1125 2889 1145L2889 1175L2870 1175Q2890 1175 2890 1195L2890 1245L2890 1295L2890 1345L2890 1395L2890 1445L2890 1495L2890 1545L2890 1595L2890 1645L2890 1695L2890 1745L2890 1795L2890 1845L2890 1895L2890 1945L2890 1995L2890 2045L2890 2095L2890 2145L2890 2195Q2890 2215 2870 2215L2840 2215L2840 2245Q2840 2265 2820 2265L2470 2265L2470 2265Q2450 2265 2450 2245L2450 2195L2450 2145L2450 2095L2450 2045L2450 1995L2450 1945L2450 1895L2450 1845L2450 1795L2450 1745L2450 1695L2450 1645L2450 1595L2450 1545L2450 1495L2450 1445L2450 1395L2450 1345L2450 1295Q2450 1275 2470 1275L2500 1275L2500 1245L2500 1195L2500 1165L2519 1165Q2499 1165 2499 1145Q2499 1125 2519 1125,M2620 51L2870 51Q2890 51 2890 71L2890 121L2890 171L2890 221L2890 271L2890 320L2890 370L2890 420L2890 470L2890 520L2890 570L2890 620L2890 670L2890 720L2890 770L2890 820L2890 870L2890 920L2890 970L2890 1020Q2890 1040 2870 1040L2520 1040L2520 1040Q2500 1040 2500 1020L2500 970L2500 920L2500 870L2500 820L2500 770L2500 720Q2500 700 2520 700L2550 700L2550 670L2550 620L2550 570L2550 520L2550 470L2550 420L2550 370L2550 320Q2550 300 2570 300L2600 300L2600 271L2600 221L2600 171L2600 121L2600 71Q2600 51 2620 51,M3470 50L3720 50Q3740 50 3740 70L3740 120L3740 170L3740 200L3770 200Q3790 200 3790 220L3790 270L3790 300L3820 300Q3840 300 3840 320L3840 370L3840 420L3840 470L3840 520L3840 570L3840 620L3840 670L3840 700L3870 700Q3890 700 3890 720L3890 770L3890 820L3890 870L3890 920L3890 970L3890 1020Q3890 1040 3870 1040L3520 1040L3520 1040Q3500 1040 3500 1020L3500 970L3500 920L3500 870L3500 820L3500 770L3500 720L3500 670L3500 620L3500 570L3500 520L3500 470L3500 420L3500 370L3500 320L3500 270L3500 220L3500 190L3470 190Q3450 190 3450 170L3450 120L3450 70Q3450 50 3470 50,M1970 1125L2320 1125Q2340 1125 2340 1145L2340 1195L2340 1245L2340 1295L2340 1345L2340 1395L2340 1445L2340 1495L2340 1545L2340 1595L2340 1645L2340 1695L2340 1745L2340 1795L2340 1845L2340 1895L2340 1945L2340 1995L2340 2045L2340 2095L2340 2145L2340 2195L2340 2245Q2340 2265 2320 2265L1970 2265L1970 2265Q1950 2265 1950 2245L1950 2215L1920 2215Q1900 2215 1900 2195L1900 2145L1900 2095L1900 2045L1900 1995L1900 1945L1900 1895L1900 1845L1900 1795L1900 1745L1900 1695L1900 1645L1900 1595L1900 1545L1900 1495L1900 1445L1900 1395L1900 1345L1900 1295Q1900 1275 1920 1275L1950 1275L1950 1245L1950 1195L1950 1145Q1950 1125 1970 1125,M3570 1125L3920 1125Q3940 1125 3940 1145L3940 1195L3940 1245L3940 1275L3970 1275Q3990 1275 3990 1295L3990 1345L3990 1395L3990 1445L3990 1495L3990 1545L3990 1595L3990 1645L3990 1695L3990 1745L3990 1795L3990 1845L3990 1895L3990 1945L3990 1995L3990 2045L3990 2095L3990 2145L3990 2195Q3990 2215 3970 2215L3940 2215L3940 2245Q3940 2265 3920 2265L3570 2265L3570 2265Q3550 2265 3550 2245L3550 2195L3550 2145L3550 2095L3550 2045L3550 1995L3550 1945L3550 1895L3550 1845L3550 1795L3550 1745L3550 1695L3550 1645L3550 1595L3550 1545L3550 1495L3550 1445L3550 1395L3550 1345L3550 1295L3550 1245L3550 1195L3550 1145Q3550 1125 3570 1125,M3020 50L3270 50Q3290 50 3290 70L3290 120L3290 170L3290 220L3290 270L3290 300L3320 300Q3340 300 3340 320L3340 370L3340 420L3340 470L3340 520L3340 570L3340 620L3340 670L3340 700L3370 700Q3390 700 3390 720L3390 770L3390 820L3390 870L3390 920L3390 970L3390 1020Q3390 1040 3370 1040L3020 1040L3020 1040Q3000 1040 3000 1020L3000 970L3000 920L3000 870L3000 820L3000 770L3000 720L3000 670L3000 620L3000 570L3000 520L3000 470L3000 420L3000 370L3000 320L3000 270L3000 220L3000 170L3000 120L3000 70Q3000 50 3020 50,M3020 1125L3370 1125Q3390 1125 3390 1145L3390 1195L3390 1245L3390 1275L3420 1275Q3440 1275 3440 1295L3440 1345L3440 1395L3440 1445L3440 1495L3440 1545L3440 1595L3440 1645L3440 1695L3440 1745L3440 1795L3440 1845L3440 1895L3440 1945L3440 1995L3440 2045L3440 2095L3440 2145L3440 2195Q3440 2215 3420 2215L3390 2215L3390 2245Q3390 2265 3370 2265L3070 2265L3070 2265Q3050 2265 3050 2245L3050 2215L3020 2215Q3000 2215 3000 2195L3000 2145L3000 2095L3000 2045L3000 1995L3000 1945L3000 1895L3000 1845L3000 1795L3000 1745L3000 1695L3000 1645L3000 1595L3000 1545L3000 1495L3000 1445L3000 1395L3000 1345L3000 1295L3000 1245L3000 1195L3000 1145Q3000 1125 3020 1125'

    var o = {
        value: s2,
        colorSelected: "#327692",
        /*colorSelected:"#327692",*/
        color1: "#327692",
        color2: "#327692"
    };
    /*for (var i = 5; i>0; i--){
     for (var j = 2; j>0; j--){

     this.drawSVG(o,function(){},i,j);
     }
     }*/


    this.drawSVG(o, function () {
    }, -1, -1);
    this.drawSVG(o, function () {
    }, -1, 20);
    this.drawSVG(o, function () {
    }, 10, 20);
    //this.drawSVG(o,function(){},-1,5);


    o.colorSelected = "#68aef1";
    o.color2 = "#68aef1";
    o.color2 = "#68aef1";

    this.drawSVG(o, function () {
    }, 3, 4);
    this.drawSVG(o, function () {
    }, 2, 4);
    this.drawSVG(o, function () {
    }, 1, 4);
    this.drawSVG(o, function () {
    }, 0, 4);

    //this.drawSVG(o,function(){},1,4);

    this.drawSVG(o, function () {
    }, 1, 3);
    this.drawSVG(o, function () {
    }, 1, 2);
    this.drawSVG(o, function () {
    }, 1, 1);
    this.drawSVG(o, function () {
    }, 1, 0);

    this.drawSVG(o, function () {
    }, 1, 1);

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

        var alias = obj.alias;

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
            this.preload.stack.push(obj);
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
                var t2 = new Date().getTime();
                console.log('preLoad end: ', t2 - instance.t1);
                console.log('Занято');
                return;
            }
            this.timer = setTimeout(function () {
                //console.log('preload_WORK');
                var o = preload.stack.shift();
                instance.pictures.get(o);
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

    /**
     *
     * @param square
     * @param options
     * @returns {boolean}
     */
    renderSquareImage: function (square, options) {
        /*color1, color2, context, scaleCoeff, status, blocked, lighted*/
        if (typeof square !== "object") {
            return false;
        }
        if (typeof options !== "object") {
            options = {};
        }
        var map = this.instance;
        var mode = options.mode || map.mode;
        var ctx = options.ctx || map.ctx;
        var cache = (options.cache !== false);
        /* --- Если это персональный контекст, то координаты будут относительно нуля, иначе реальные кординаты расположения на canvas---*/
        var personalContext = (options.personalContext !== undefined) ? (options.personalContext !== false) : cache;

        var scale = options.scale || map.scaleCoeff * 2;
        var status = square.status || 0;
        var color1 = square.color0 || "#FFF";
        var color2 = "#FFF" || square.colorShadow || "#000";


        /* var status = obj.status || 0;
         var blocked = obj.blocked || 0;
         var lighted = obj.lighted || 0;*/
        var x, y, w, h, tl, tr, br, bl;
        x = 100;
        y = 100;
        w = 100;//|| map.roundPlus(100 * scale, 0);
        h = 100;//|| map.roundPlus(100 * scale, 0);
        tl = 10;// || map.roundPlus(10 * scale, 0);
        tr = 10;// || map.roundPlus(10 * scale, 0);
        br = 10;// || map.roundPlus(10 * scale, 0);
        bl = 10;// || map.roundPlus(10 * scale, 0);
//;//


        var alias = 'square' + square.id;
        if (this.items[alias]) {
            //drawIMG
            x = square.x * map.scaleCoeff;
            y = square.y * map.scaleCoeff;
            ctx.drawImage(this.items[alias], x, y, 100, 100);

            return;
        }
        this.items[alias] = document.createElement('canvas');
        var newCanvas = this.items[alias];
        newCanvas.width = w;
        newCanvas.height = h;
        ctx = newCanvas.getContext('2d');
        /*ctx2.fillStyle = "#F00";
         ctx2.fillRect(0,0,100,100);
         ctx2.fill();*/

        if (personalContext) { /// Заготовка
            // Отрисуем прямоугольник
            x = 0;
            y = 0;
            /* w = map.roundPlus(100 * scale,0);
             h = map.roundPlus(100 * scale,0);
             tl =map.roundPlus( 10 * scale,0);
             tr =map.roundPlus( 10 * scale,0);
             br =map.roundPlus( 10 * scale,0);
             bl =map.roundPlus( 10 * scale,0);*/
            switch (mode) {
                case "casher":
                case "iFrame":
                case "client_screen":


                    this.canvasRadiusFill(x, y, w, h,
                        tl,
                        tr,
                        br,
                        bl,
                        color1,
                        ctx
                    );
                    if (status !== 0) {
                        this.canvasRadiusFill(x + w / 10, y + h / 10, w - w / 5, h - h / 5,
                            tl,
                            tr,
                            br,
                            bl,
                            color2,
                            ctx
                        );
                        /*this.canvasRadiusFill(5 * scale, 5 * scale, 90 * scale, 90 * scale,
                         5 * scale,
                         5 * scale,
                         5 * scale,
                         5 * scale,
                         color2,
                         ctx
                         ); //changed by aig    was "#FFFFFF"*/
                    }

                    var fnt = "normal " + Math.round((w * 0.7) * scale) + "px 'Open Sans'";
                    if (ctx.font != fnt) {
                        ctx.font = fnt;
                    }
                    if (ctx.fillStyle != square.textColor)
                        ctx.fillStyle = square.textColor;
                    var pCount = square.place.length;
                    ctx.fillText(square.place, x + ((w / (w / 10) + 10 - pCount * 8) * scale), y + ((h / 1.25) * scale));
                    ctx.fillText(square.line, x + ((w / (w / 4)) * scale), y + ((h / 2.1) * scale));

                    break;
                default :
                    break;
            }
        } else {

        }

        //ctx.drawImage(this.items[alias],100,100);
        return;
        switch (mode) {
            case "casher":
                break;
            default :
                break;
        }


        context.clearRect(0, 0, 100 * scaleCoeff, 100 * scaleCoeff);
        /* if (context.fillStyle !== this.instance.bgColor) {
         context.fillStyle = this.instance.bgColor;
         }
         context.fillRect(0, 0, 100 * scaleCoeff, 100 * scaleCoeff);
         context.fill();*/
        this.canvasRadiusFill(0, 0, 100 * scaleCoeff, 100 * scaleCoeff,
            10 * scaleCoeff,
            10 * scaleCoeff,
            10 * scaleCoeff,
            10 * scaleCoeff,
            color1,
            context
        );
        if ((map.mode == "casher" || map.mode == "client_screen" || map.mode == "iFrame") && status !== 0) {
            this.canvasRadiusFill(5 * scaleCoeff, 5 * scaleCoeff, 90 * scaleCoeff, 90 * scaleCoeff,
                5 * scaleCoeff,
                5 * scaleCoeff,
                5 * scaleCoeff,
                5 * scaleCoeff,
                color2,
                context
            ); //changed by aig    was "#FFFFFF"
        }
        if (typeof callback === "function") {
            callback(context);
        }

    },
    renderSquareImageOLD: function (color1, color2, context, scaleCoeff, status, blocked, lighted) {
        context.clearRect(0, 0, 100 * scaleCoeff, 100 * scaleCoeff);
        /* if (context.fillStyle !== this.instance.bgColor) {
         context.fillStyle = this.instance.bgColor;
         }
         context.fillRect(0, 0, 100 * scaleCoeff, 100 * scaleCoeff);
         context.fill();*/
        this.canvasRadiusFill(0, 0, 100 * scaleCoeff, 100 * scaleCoeff,
            10 * scaleCoeff,
            10 * scaleCoeff,
            10 * scaleCoeff,
            10 * scaleCoeff,
            color1,
            context
        );

        if ((this.instance.mode == "casher" || this.instance.mode == "client_screen" || this.instance.mode == "iFrame") && status !== 0) {
            this.canvasRadiusFill(5 * scaleCoeff, 5 * scaleCoeff, 90 * scaleCoeff, 90 * scaleCoeff,
                5 * scaleCoeff,
                5 * scaleCoeff,
                5 * scaleCoeff,
                5 * scaleCoeff,
                color2,
                context
            ); //changed by aig    was "#FFFFFF"
        }
        if (typeof callback === "function") {
            callback(context);
        }

    },
    convertCanvasToImage: function (canvas, params) {
        return;
        if (typeof params !== "object") {
            params = {};
        }
        if (params.cache === false) {
            return canvas;
        }
        var newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        var newCtx = newCanvas.getContext('2d');
        newCtx.drawImage(canvas, 0, 0);
        return newCanvas;
        //var image = new Image(canvas.width, canvas.height);

        //image.src = canvas.toDataURL("image/png");
        var quality = params.quality || 1;
        var imgType = params.imgType || "image/png";
        image.src = canvas.toDataURL(imgType, quality);
        //console.log('IMAGE_GENERATED');
        return image;
    },
    convertCanvasToImageOLD: function (canvas, params) {
        if (typeof params !== "object") {
            params = {};
        }
        if (params.cache === false) {
            return canvas;
        }
        var image = new Image(canvas.width, canvas.height);

        //image.src = canvas.toDataURL("image/png");
        var quality = params.quality || 1;
        var imgType = params.imgType || "image/png";
        image.src = canvas.toDataURL(imgType, quality);
        //console.log('IMAGE_GENERATED');
        return image;
    },
    renderPlaceOnly: function (x, scaleCoeff, y, place, size, ctx, textColor, w, h) {
        x = 30 * scaleCoeff;
        y = 72 * scaleCoeff;
        if (place.length === 2) {
            x = 15 * scaleCoeff;
        } else if (place.length === 3) {
            x = 8 * scaleCoeff;
            size = 50 * scaleCoeff;
        } else if (place.length === 4) {
            y = 66 * scaleCoeff;
            x = 6 * scaleCoeff;
            size = 40 * scaleCoeff;
        }
        ctx.fillStyle = textColor;
        ctx.font = "normal " + size + "px 'Arial'";
        ctx.clearRect(0, 0, w, h);
        ctx.fillText(place, x, y);
        return {x: x, y: y, size: size};
    }, renderPlace: function (ctx, textColor, w, h, size, scaleCoeff, x, place, y) {
        ctx.fillStyle = textColor;
        ctx.clearRect(0, 0, w, h);
        size = 45 * scaleCoeff;
        ctx.font = "normal " + size + "px 'Arial'";
        x = w - 10 * scaleCoeff - size * place.length / 2;
        y = 90 * scaleCoeff;
        ctx.fillText(place, x, y);
        if (place.length === 2) {
            x = 0;
        } else if (place.length === 3) {
            x = 5 * scaleCoeff;
        }
        return {size: size, x: x, y: y};
    }, renderLine: function (ctx, textColor, w, h, size, scaleCoeff, x, y, line) {
        ctx.fillStyle = textColor;
        ctx.clearRect(0, 0, w, h);
        size = 45 * scaleCoeff;
        x = 8 * scaleCoeff;
        y = 45 * scaleCoeff;
        ctx.font = "normal " + size + "px 'Arial'";
        ctx.fillText(line, x, y);
        return {size: size, x: x, y: y};
    }, generate: function (obj, scaleCoeff) {
        //scaleCoeff += 0.1;
        var instance = this.instance;
        var w = Math.round(100 * scaleCoeff);
        var h = Math.round(100 * scaleCoeff);
        //console.log(w, ', ',h);
        /*this.tmpCanvas.width = w;
         this.tmpCanvas.height = h;
         var ctx = this.tmpCanvas.getContext('2d');*/
        this.items[obj.alias] = document.createElement('canvas');
        var newCanvas = this.items[obj.alias];
        newCanvas.width = w;
        newCanvas.height = h;
        var ctx = newCanvas.getContext('2d');


        if (typeof obj !== 'object') {
            //ctx.fillStyle = "#000";
            ctx.fillStyle = instance.bgColor;
            //ctx.clearRect(0, 0, w, h);
            ctx.fillRect(0, 0, w, h);
            ctx.fill();
            return newCanvas;
            //return this.convertCanvasToImage(this.tmpCanvas, {cache: false});
        }


        var cache = (obj.cache !== undefined) ? obj.cache : true;
        var mode = obj.mode || "square";
        var color1 = obj.color1 || "#000";
        var color2 = obj.color2 || "#FFF";
        var textMode = obj.textMode || "placeLine";
        var place = obj.place || "";
        var line = obj.line || "";
        var textColor = obj.textColor || "#000";
        var status = obj.status || 0;
        var blocked = obj.blocked || 0;
        var lighted = obj.lighted;

        //placeOnly


        var img;







        switch (mode) {
            case "square":
                this.renderSquareImage(color1, color2, ctx, scaleCoeff, status, blocked, lighted);

                img = this.convertCanvasToImage(this.tmpCanvas, {cache: cache, quality: 1, imgType: "image/png"});
                break;
            case "label":
                var size = 60 * scaleCoeff;
                var x = 30 * scaleCoeff;
                var y = 40 * scaleCoeff;
                switch (textMode) {
                    case "placeOnly":
                        var __ret = this.renderPlaceOnly(x, scaleCoeff, y, place, size, ctx, textColor, w, h);
                        x = __ret.x;
                        y = __ret.y;
                        size = __ret.size;
                        img = this.convertCanvasToImage(this.tmpCanvas, {
                            cache: cache,
                            quality: 1,
                            imgType: "image/png"
                        });
                        break;
                    case "place":
                        var __ret = this.renderPlace(ctx, textColor, w, h, size, scaleCoeff, x, place, y);
                        size = __ret.size;
                        x = __ret.x;
                        y = __ret.y;
                        img = this.convertCanvasToImage(this.tmpCanvas, {
                            cache: cache,
                            quality: 1,
                            imgType: "image/png"
                        });
                        break;
                    case "line":
                        var __ret = this.renderLine(ctx, textColor, w, h, size, scaleCoeff, x, y, line);
                        size = __ret.size;
                        x = __ret.x;
                        y = __ret.y;
                        img = this.convertCanvasToImage(this.tmpCanvas, {
                            cache: cache,
                            quality: 1,
                            imgType: "image/png"
                        });
                        break;
                    default:

                        break;
                }
                break;
            case "canvas":
                //debugger;

                var t1 = new Date().getTime();
                var scale = obj.scale || instance.scaleCoeff;
                var canvas = instance.screenCanvas;
                //- instance.startXCoeff*2
                /*var tmpW = (instance.maxX - instance.minX + instance.squareWH + instance.startXCoeff*2) * scale;
                 var tmpH = (instance.maxY - instance.minY + instance.squareWH + instance.startYCoeff*2) * scale;*/
                var tmpW = (instance.maxX - instance.minX + instance.squareWH) * scale;
                var tmpH = (instance.maxY - instance.minY + instance.squareWH) * scale;
                canvas.width = tmpW;
                canvas.height = tmpH;
                //var ctx2 = canvas.getContext('2d');
                var oldCWidth = instance.cWidth;
                var oldHeight = instance.cHeight;
                var oldXCoeff = instance.XCoeff;
                var oldYCoeff = instance.YCoeff;
                var oldCtx = instance.ctx;
                var oldMoving = instance.moving;
                var oldScale = instance.scaleCoeff;
                instance.cWidth = tmpW;
                instance.cHeight = tmpH;
                newCanvas.width = tmpW;
                newCanvas.height = tmpH;
                instance.XCoeff = -instance.minX * scale;
                instance.YCoeff = -instance.minY * scale;
                instance.ctx = ctx;
                instance.moving = false;
                instance.scaleCoeff = scale;
                instance.render(function () {
                }, 'generate_screen');
                instance.scaleCoeff = oldScale;
                instance.moving = oldMoving;
                instance.cWidth = oldCWidth;
                instance.cHeight = oldHeight;
                instance.XCoeff = oldXCoeff;
                instance.YCoeff = oldYCoeff;
                instance.ctx = oldCtx;
                //img = this.convertCanvasToImage($('#canvas1')[0]);
                img = this.convertCanvasToImage(canvas, {cache: cache, quality: 1, imgType: "image/jpeg"});
                var t2 = new Date().getTime();
                //console.log(t2-t1);
                break;
            default:
                break;
        }
        return newCanvas;
        //return img;
    },
    getAlias: function (obj) {
        var self = this;
        return alias = obj.alias || (function () {
            var al = '';
            if (!obj.scale) {
                obj.scale = self.instance.roundPlus(self.instance.scaleCoeff, 2);
            }
            for (var i in obj) {
                if (i === "cache") {
                    continue;
                }
                al += obj[i];
            }
            return al;
        })();
    }, /**
     * Возаращает изображение для соответствуещего места в зале, в зависимости от режима.
     * Если изображение отсутствует в наборе (items), генерирует изображение
     * @param square объект, описывает место на схеме
     * @param square_mode режим отображениия (только обводка цветом/полностью залитый цветом квадрат)
     * @param text_mode режим отображение ряд/место (показывать ряд/ не показывать)
     */
    get: function (obj) {
        if (typeof obj !== 'object') {
            // Возвращать черный квадрат
            if (!this.items['000']) {
                this.items['000'] = this.generate();
            }
            return this.items['000'];
        }
        var cache = (obj.cache !== undefined) ? obj.cache : true;
        var mode = obj.mode || "square";
        var color1 = obj.color1 || "#000";
        var color2 = obj.color2 || "#FFF";
        var status = obj.status || 0;
        var blocked = obj.blocked || 0;
        var lighted = obj.lighted;
        var scaleCoeff = obj.scale || this.instance.scaleCoeff;
        //var scale = String(Math.round(this.instance.scaleCoeff * 10) / 10);
        var scale = this.instance.roundPlus(this.instance.scaleCoeff, 2);

        var alias = this.getAlias(obj);
        //debugger;


        if (!this.items[alias]) {
            var img = this.generate(obj, scaleCoeff);
            if (cache) {
                this.items[alias] = img;
            }

        }
        return img || this.items[alias];
    }
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
            this.ctx.strokeRect(this.layoutSquares[count].x, this.layoutSquares[count].y, this.layoutSquares[count].w, this.layoutSquares[count].h);
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
    image.src = this.doc_root + path + name;
    //console.log(this.doc_root+path+name);
};


var tmpCount = 0;
/*Map1.prototype.createSquareImage = function (square, callback) {
 var self = this;
 var wh = this.squareWH;
 var cw = this.cWidth;
 var ch = this.cHeight;
 var x = Math.round((square.x) * this.scaleCoeff + this.XCoeff);
 var y = Math.round((square.y) * this.scaleCoeff + this.YCoeff);
 var w = +square.w;
 var h = +square.h;
 var scaledW = Math.round(w * this.scaleCoeff);
 var scaledH = Math.round(h * this.scaleCoeff);
 if ($("#tmpCanvas").length == 0) {
 self.container.append('<canvas id="tmpCanvas" width="100" height="100" style="display:block; position: absolute; z-index: 2000000;"></canvas>');

 }
 var tmpCanvas = $("#tmpCanvas")[0];
 var ctx = tmpCanvas.getContext('2d');
 tmpCount++;

 //self.tmpCtx.fillRect(10,10,60,60);
 var color = square.color0;
 var innerFill = square.color0 || '#CCC';
 var textColor = '#FFF';

 //console.log(square.color0);
 // Converts canvas to an image
 function convertCanvasToImage(canvas) {
 var image = new Image();
 image.src = canvas.toDataURL("image/png");
 return image;
 }


 switch (self.mode) {
 case 'casher0000':
 break;
 default:
 self.renderSquareImage(color, "#ccc", textColor, ctx, function () {
 //square.imageData1 = ctx.createImageData(100,100);
 square.image1 = convertCanvasToImage(tmpCanvas);
 //square.image1 = tmpCanvas;
 //self.ctx.drawImage(square.image1,100,100+20*tmpCount);
 });
 break;
 }


 return;


 *//*   var color = squere.color0;
 if (squere.lighted!=undefined)
 color = squere.colorSelected;
 var textColor = squere.textColor;
 var innerFill = (squere.lighted_now)? color : '#FFFFFF'; //changed by aig*//*


 if ((this.mode == "casher" && this.squares[key].status == 1 && this.squares[key].blocked == 0) || (this.mode == "client_screen") && !this.squares[key].lighted && this.squares[key].status == 1) {

 *//*if(this.squares[key].lighted_now){         //changed by aig
 color = '#b5ec21';                     //changed by aig
 }  *//*
 //changed by aig


 this.canvasRadiusFill(x + (scaledW / 60), y + (scaledH / 40), scaledW, scaledH,
 Math.round(w / 10 * this.scaleCoeff),
 Math.round(w / 10 * this.scaleCoeff),
 Math.round(w / 10 * this.scaleCoeff),
 Math.round(w / 10 * this.scaleCoeff),
 color);
 //if (!this.moving)
 this.canvasRadiusFill(x + (scaledW / 10), y + (scaledH / 10), scaledW - (scaledW / 5), scaledH - (scaledH / 5),
 Math.round(w / 10 * this.scaleCoeff),
 Math.round(w / 10 * this.scaleCoeff),
 Math.round(w / 10 * this.scaleCoeff),
 Math.round(w / 10 * this.scaleCoeff),
 innerFill);//changed by aig    was "#FFFFFF"
 textColor = "#000";
 //textColor = (this.squares[key].lighted_now)? '#000000': '#000000';

 } else {

 var innerFill2 = color;

 //if(!this.squares[key].lighted && this.squares[key].status==1 && this.squares[key].blocked==0){
 if (!this.squares[key].lighted && this.squares[key].status == 1 && this.squares[key].blocked == 0) {
 innerFill2 = (!this.squares[key].lighted_now) ? color : '#FFFFFF'; //changed by aig;
 }

 if (!this.moving)
 this.canvasRadiusFill(x + (scaledW / 60), y + (scaledH / 40), scaledW, scaledH,
 Math.round(w / 10 * this.scaleCoeff),
 Math.round(w / 10 * this.scaleCoeff),
 Math.round(w / 10 * this.scaleCoeff),
 Math.round(w / 10 * this.scaleCoeff),
 this.squares[key].colorShadow);

 this.canvasRadiusFill(x, y, scaledW, scaledH,
 Math.round(w / 10 * this.scaleCoeff),
 Math.round(w / 10 * this.scaleCoeff),
 Math.round(w / 10 * this.scaleCoeff),
 Math.round(w / 10 * this.scaleCoeff),
 innerFill2);
 }


 if (!this.moving) {

 if (this.ctx.font != "normal " + Math.round((w / 2) * this.scaleCoeff) + "px 'Open Sans'") {

 if (this.mode == "casher" || this.mode == "client_screen") {
 this.ctx.font = "normal " + Math.round((w * 0.7) * this.scaleCoeff) + "px 'Open Sans'";
 } else {
 this.ctx.font = "normal " + Math.round((w / 2) * this.scaleCoeff) + "px 'Open Sans'";
 }
 }


 if (this.ctx.fillStyle != textColor)
 this.ctx.fillStyle = textColor;


 if (document.all && !document.addEventListener) {
 if (typeof callback == 'function') {
 this.ctx.fillText(this.squares[key].place, x + ((w - 1.5 * (w / 2.3 * 0.9)) * this.scaleCoeff), y + ((h - h / 15) * this.scaleCoeff));
 return callback();
 }
 }
 if (this.mode == "casher" || this.mode == "client_screen") {
 var pCount = this.squares[key].place.length;
 this.ctx.fillText(this.squares[key].place, x + ((w / (w / 10) + 10 - pCount * 8) * this.scaleCoeff), y + ((h / 1.25) * this.scaleCoeff));
 return callback();
 }

 this.ctx.fillText(this.squares[key].line, x + ((w / (w / 4)) * this.scaleCoeff), y + ((h / 2.1) * this.scaleCoeff));
 if (this.squares[key].place.length == 1) {
 this.ctx.fillText(this.squares[key].place, x + ((w - (w / 3 * 0.9)) * this.scaleCoeff), y + ((h - h / 10) * this.scaleCoeff));
 } else if (this.squares[key].place.length == 2) {
 this.ctx.fillText(this.squares[key].place, x + ((w - 1.5 * (w / 2.3 * 0.9)) * this.scaleCoeff), y + ((h - h / 15) * this.scaleCoeff));
 } else if (this.squares[key].place.length == 3) {
 this.ctx.fillText(this.squares[key].place, x + ((w - 2.5 * (w / 2 * 0.9)) * this.scaleCoeff), y + ((h - h / 10) * this.scaleCoeff));
 }

 *//* this.ctx.fillText(this.squares[key].line,x+((w/(w/4))*this.scaleCoeff),y+((h/3)*this.scaleCoeff));
 if (this.squares[key].place.length == 1){
 this.ctx.fillText(this.squares[key].place,x+((w-(w/3*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
 }else if (this.squares[key].place.length == 2){
 this.ctx.fillText(this.squares[key].place,x+((w-1.5*(w/3*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
 }else if (this.squares[key].place.length == 3){
 this.ctx.fillText(this.squares[key].place,x+((w-2.5*(w/3*0.9))*this.scaleCoeff),y+((h-h/10)*this.scaleCoeff));
 }*//*
 }

 square.image1 = self.tmpCanvas;
 *//*square.image1 = new Image();
 square.image1*//*


 };*/


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
            self.squares[index].colorShadow = "#c6c2c2";
            self.squares[index].colorSelected = "#FF0000";
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
        self.container.trigger("squaresLoaded", [self.squares]);

        //self.loader_box.fadeOut(650);

       /* var superAlert = $("superAlert");
        if (!superAlert.length) {
            self.container.prepend('<div id="superAlert" style="border: 1px solid #1e2c8e; border-radius: 4px; background-color: #02050f; color:#F00;opacity: 0.8; position: absolute;z-index: 500000; width: 250px; height: 20px; padding: 10px; text-align: center; top:10px; left:10px; box-sizing:content-box;">Схема временно не работает, Sorry.</div>')
        }
*/
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
        if (self.mode == "sectors"){
            for (var i in self.selector) {
                self.selector[i].selected = false;
            }
            self.loading = false;
            return;
        }
        //self.loader_box.fadeIn(250);
        self.loadSquares(self.loadObj, function () {
            self.setLayout(function () {
                self.reLoadLayout(function () {
                    self.render(function () {
                    });
                    self.loading = false;
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
Map1.prototype.optimizeSectors = function (params, callback) {
    if (typeof callback !== "function") {
        callback = function () {
        };
    }

    var sectorObj = this.sectors;

    for (var i in sectorObj) {
        var sub_groups = sectorObj[i].sub_groups;

        var readySubSectors = [];
        for (var j in sub_groups) {
            var group = sub_groups[j];
            //group.ready_points = [];
            var subGroupLines = [];
            var ids = [];
            var points = {};
            for (var m in group) {
                ids.push(m);
                points[m] = group[m];
            }
            this.splitSelection(ids, points);
            var lines = this.xSelection;
            var line = [];
            for (var n in lines) {
                var oneLine = lines[n];
                if (points[oneLine[0]].x === points[oneLine[oneLine.length - 1]].x) {
                    /// Если одно место в строке, Lj,добавим точку
                    line.push([points[oneLine[0]], {x: points[oneLine[0]].x + 40, y: points[oneLine[0]].y}]);
                    line.push([{x: points[oneLine[0]].x, y: points[oneLine[0]].y + 40}, {
                        x: points[oneLine[0]].x + 40,
                        y: points[oneLine[0]].y + 40
                    }]);
                    continue;
                    //line.push([{x:points[oneLine[0]].x+40,y:points[oneLine[0]].y+40}],[{x:points[oneLine[0]].x,y:points[oneLine[0]].y+40}]]);
                }
                line.push([points[oneLine[0]], points[oneLine[oneLine.length - 1]]]);
            }
            var leftArr = [];
            var rightArr = [];

            for (var i3 in line) {
                if (+i3 == line.length - 1) {
                    break;
                }

                var currentPoint = line[i3][0];
                var nextPoint = line[+i3 + 1][0];
                var num = +i3 + 2;
                var next2Point = (num < line.length - 1) ? line[num][0] : undefined;
                var angle = this.get_angle(currentPoint, nextPoint);
                leftArr.push(currentPoint);
                if (+i3 == line.length - 2) {
                    leftArr.push({x: currentPoint.x, y: nextPoint.y});
                } else {
                    if (angle < 170 || angle > 190) {
                        if (typeof next2Point == "object") {  /// Если можно проверить еще одну точку, чтобы удостовериться что это не случайное отклонение.
                            angle = this.get_angle(currentPoint, next2Point);
                            if (angle < 170 || angle > 190) {
                                leftArr.push({x: currentPoint.x, y: nextPoint.y});
                            }
                        } else {
                            leftArr.push({x: currentPoint.x, y: nextPoint.y});
                        }
                    }
                }

                /// Справо
                currentPoint = line[i3][1];
                nextPoint = line[+i3 + 1][1];
                next2Point = (num < line.length - 1) ? line[num][1] : undefined;
                angle = this.get_angle(currentPoint, nextPoint);
                rightArr.push(currentPoint);
                if (+i3 == line.length - 2) {
                    //rightArr.push(nextPoint);
                    rightArr.push({x: currentPoint.x, y: nextPoint.y});
                } else {
                    if (angle < 170 || angle > 190) {
                        if (typeof next2Point == "object") {  /// Если можно проверить еще одну точку, чтобы удостовериться что это не случайное отклонение.
                            angle = this.get_angle(currentPoint, next2Point);
                            if (angle < 170 || angle > 190) {
                                rightArr.push({x: currentPoint.x, y: nextPoint.y});
                            }
                        } else {
                            rightArr.push({x: currentPoint.x, y: nextPoint.y});
                        }
                    }
                }
            }
            this.sectors[i].sub_groups[j] = readySubSectors.concat(rightArr.concat(leftArr.reverse()));

        }

    }

    var self = this;
    self.sectorMinMax();
    this.setScaleCoff(function () {
        //self.setLayout();
        self.setEvents();

    });
    var t2 = new Date().getTime();
    console.log('ready to Render', t2 - this.t1);
    self.drawSectors();
    callback();


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
    //self.loadSectorsParams = params;
    self.socketObject = params.socketObject;
    self.squareO = params.squareO;
    self.layerO = params.layerO;
    self.objectO = params.objectO;
    self.oldMode = self.mode;
    self.mode = 'sectors';
    self.theme = params.theme || "light";
    //self.zonesBgColor = params.zonesBgColor || "#423c30";
    /*switch (self.theme){
        case "light":
            self.zonesBgColor = params.zonesBgColor || "#ebe5d8";
            self.zonesFill = params.zonesFill || "#ccbfa9";
            self.zonesStroke = params.zonesStroke || "#ccbfa9";
            self.zonesHover = params.zonesHover || "#d7be94";
            self.zonesSelected = params.zonesSelected || "#547e9c";
            self.zonesDisabled = params.zonesDisabled || "#ebe5d8";
            self.zonesShadow = params.zonesShadow || "#928165";
            break;
        case "dark":
            self.zonesBgColor = params.zonesBgColor || "#423c30";
            self.zonesFill = params.zonesFill || "#9c8554";
            self.zonesStroke = params.zonesStroke || "#9c8554";
            self.zonesHover = params.zonesHover || "#a39578";
            self.zonesSelected = params.zonesSelected || "#547e9c";
            self.zonesDisabled = params.zonesDisabled || "#ebe5d8";
            self.zonesShadow = params.zonesShadow || "#2a2417";
            break;
    }*/
    switch (self.theme){
        case "light":
            self.zonesBgColor = params.zonesBgColor || "#fff";
            self.zonesFill = params.zonesFill || "#82c0e3";
            self.zonesStroke = params.zonesStroke || "#82c0e3";
            self.zonesHover = params.zonesHover || "#3789b8";
            self.zonesSelected = params.zonesSelected || "#547e9c";
            self.zonesDisabled = params.zonesDisabled || "#e5e5e5";
            self.zonesDisabledShadow = params.zonesDisabled || "#e5e5e5";
            self.zonesShadow = params.zonesShadow || "#418ab3";
            break;
        case "dark":
            self.zonesBgColor = params.zonesBgColor || "#282828";
            self.zonesFill = params.zonesFill || "#5887a3";
            self.zonesStroke = params.zonesStroke || "#5887a3";
            self.zonesHover = params.zonesHover || "#95c8e6";
            self.zonesSelected = params.zonesSelected || "#547e9c";
            self.zonesDisabled = params.zonesDisabled || "#3c3c3c";
            self.zonesDisabledShadow = params.zonesDisabled || "#F00";
            self.zonesShadow = params.zonesShadow || "#2c536b";
            break;
    }
    self.zoneFillColorRGB = [self.hexToRgb(self.zonesFill).r,self.hexToRgb(self.zonesFill).g,self.hexToRgb(self.zonesFill).b];
    self.zoneHoverColorRGB = [self.hexToRgb(self.zonesHover).r,self.hexToRgb(self.zonesHover).g,self.hexToRgb(self.zonesHover).b];
    self.zoneSelectColorRGB = [self.hexToRgb(self.zonesSelected).r,self.hexToRgb(self.zonesSelected).g,self.hexToRgb(self.zonesSelected).b];

    self.setBgColor(self.zonesBgColor, 1000);

    var action_id = params.action_id;
    var frame = params.frame;
    if (!action_id || !frame){
        console.log('Не переданы необходимые параметры');
        return;
    }


    var o = {command: "get_action_sectors", params: {action_id: action_id, frame: frame}};
    //var o = {command: "get_action_sectors", params: {action_id: 2, frame: "0_N5KxAQXUzWGY"}};
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
                sub_groups: []
            };
            var subGroupsSTR = DATA[i].AREA_GROUP_PLACE_COORD.split('|');
            for (var j in subGroupsSTR) {
                var XYSTR = subGroupsSTR[j].split(';');
                var subGroup = [];
                for (var m in XYSTR) {
                    var coors = {};
                    var XY = XYSTR[m].split(',');
                    coors.x = +XY[0];
                    coors.y = +XY[1];
                    subGroup.push(coors);
                    //self.ctx.lineTo(coors.x * self.scaleCoeff + self.XCoeff, coors.y * self.scaleCoeff + self.YCoeff);
                }
                o.sub_groups.push(subGroup);

            }
            self.sectors.push(o);
        }
        //self.ctx.fill();
        self.loading = false;
        //self.setLayout();
        self.optimizeSectors({}, function () {

            callback();
        });

        //return callback();
    });

};
Map1.prototype.backToSectors = function(callback){
    this.mode = "sectors";
    this.sectorMinMax();
    this.setScaleCoff();


    for (var i in this.sectors) {
        delete this.sectors[i].selected;
    }
    this.ctx.lineWidth = 0;
    this.ctx.beginPath();
    this.ctx.closePath();
    this.ctx.stroke();
    this.container.trigger("move_hint", [0, 0]);
    this.setBgColor(this.zonesBgColor);
    this.drawSectors();
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
    self.loadSquares(self.squareO, function () {


        self.loadRenderItems({
            layerO: self.layerO,
            objectO: self.objectO
        }, function () {
            //map.render();
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
                    //self.setEvents();
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
                self.loadImage({
                    path: "",
                    name: OBJECT.image,
                    id: counter1 - 1
                }, function (image, index) {
                    objects[index].value = image;
                    objects[index].loaded = true;
                    counter2++;
                });
                break;
            case 2:  //  IMAGE
                self.loadImage({
                    path: "",
                    name: OBJECT.image,
                    id: counter1 - 1
                }, function (image, index) {
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
            object_type: OBJECT.type,
            object: OBJECT
        });
        self.renderList.items.push(item);

    }
    var t1 = setInterval(function () {

        if (counter1 == counter2) {
            if (typeof callback == "function")
                callback();

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
        var objectList = [];
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
                    objectList.push({
                        object_id: obj.HALL_SCHEME_OBJECT_ID || obj.ACTION_SCHEME_OBJECT_ID || undefined,
                        type: OBJECT_TYPE[obj.OBJECT_TYPE].type,
                        value: obj.VALUE || obj.value || "",
                        color: obj.COLOR || "#000",
                        object_title: obj.NAME || OBJECT_TYPE[obj.OBJECT_TYPE].object_title,
                        image: obj.BACKGROUND_URL_SCALE || obj.BACKGROUND_URL_ORIGINAL || undefined,
                        scaleCoef: +obj.SCALE || 1,
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
                    });

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

    var tmX, tmY;
    var squares = this.squares;
    if (typeof squares[squares.length - 1] === 'object') {
        this.squareWH = squares[squares.length - 1].w || 40;
    }
    if (typeof squares === 'object') {
        for (var k in squares) {
            tmX = +squares[k].x;
            tmY = +squares[k].y;
            if (this.maxX < tmX) this.maxX = tmX;
            if (this.maxY < tmY) this.maxY = tmY;
            if (this.minX > tmX) this.minX = tmX;
            if (this.minY > tmY) this.minY = tmY;
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
        if (bw < w) {
            this.scaleCoeff = bw / w;
        } else {
            this.scaleCoeff = w / bw;
        }

        //this.scaleCoeff = bw / w;


        minusScale = 4 * this.squareWH / w;

    } else {
        if (bh < h) {
            this.scaleCoeff = bh / h;
        } else {
            this.scaleCoeff = h / bh;
        }


        //this.scaleCoeff = bh / h;

        minusScale = 4 * this.squareWH / h;
    }
    //minusScale = 0.05;
    minusScale = 0.04;

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
    console.log('deletedIds',deletedIds);
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
    /*color1, color2, context, scaleCoeff, status, blocked, lighted*/
    if (typeof square !== "object") {
        return false;
    }
    if (typeof options !== "object") {
        options = {};
    }
    var map = this;
    var mode = options.mode || map.mode;
    var ctx = options.ctx || map.ctx;
    var cache = (options.cache !== false);
    /* --- Если это персональный контекст, то координаты будут относительно нуля, иначе реальные кординаты расположения на canvas---*/
    var personalContext = (options.personalContext !== undefined) ? (options.personalContext !== false) : cache;

    /*var scale = options.scale || map.scaleCoeff*2;*/
    var status = square.status || 0;
    var lighted = square.lighted || false;
    var lighted_now = square.lighted_now || false;
    var color1 = (square.lighted) ? square.colorSelected : square.color0;
    var color2 = (square.lighted_now) ? color1 : '#FFFFFF';
    var textColor = "#FFF";


    var scale = options.scale || map.round(map.scaleCoeff, 10);

    /* var status = obj.status || 0;
     var blocked = obj.blocked || 0;
     var lighted = obj.lighted || 0;*/
    var x, y, w, h, roundR;
    var size, fX, fY;
    h = options.h || map.round(square.h * map.scaleCoeff, 100);//|| map.roundPlus(100 * scale, 0);
    w = options.w || map.round(square.w * map.scaleCoeff, 100);//|| map.roundPlus(100 * scale, 0);
    x = options.x || map.round(square.x * map.scaleCoeff + map.XCoeff, 100) + w / 2;
    y = options.y || map.round(square.y * map.scaleCoeff + map.YCoeff, 100) + h / 2;
    roundR = w / 2;//|| map.roundPlus(100 * scale, 0);


    if (personalContext) { /// Заготовка
        switch (mode) {
            case "casher":
                /*case "iFrame"*/
            case "client_screen":

                if (lighted) {
                    color1 = "#000";
                    color2 = "#F00";
                    textColor = "#FFF";
                }

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
                    if (!lighted) {
                        textColor = "#000";
                    }

                }

                //var fnt = "normal " + Math.round((w * 0.7) * scale) + "px 'Open Sans'";
                var pCount = square.place.length;

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
                if (this.fontSize != size) {
                    this.fontSize = size;
                    ctx.font = "normal " + size + "px 'Open Sans'";
                }
                if (ctx.fillStyle != textColor) {
                    ctx.fillStyle = textColor;
                }
                ctx.fillText(square.place, fX, fY);
                break;
            case "iFrame":
                if (lighted) {
                    color1 = "#F00";
                    color2 = "#F00";
                    textColor = "#FFF";
                }
                if (lighted_now){
                    color1 = "#FFF";
                    textColor = "#000";
                }

                if (ctx.fillStyle != color1) ctx.fillStyle = color1;
                ctx.beginPath();
                ctx.arc(x, y, roundR, 0, 360, false);
                ctx.fill();
                ctx.closePath();
                if (status !== 0) {
                    if (ctx.fillStyle != color1) ctx.fillStyle = color1;
                    ctx.beginPath();
                    //ctx.arc(x + w / 15, y + h / 15, roundR - w / 8, 0, 360, false);
                    ctx.arc(x + w / 100, y + h / 100, roundR - w / 8, 0, 360, false);
                    ctx.fill();
                    ctx.closePath();
                    if (!lighted && !lighted_now) {
                       /* //textColor = "#FFF";
                        textColor = square.textColor;*/
                        if (color1 > +"0x8b5742"){
                            textColor = "#000";
                        } else{
                            textColor = "#fff";
                        }

                    }

                }

                //var fnt = "normal " + Math.round((w * 0.7) * scale) + "px 'Open Sans'";
                var pCount = square.place.length;

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
                if (this.fontSize != size) {
                    this.fontSize = size;
                    ctx.font = "normal " + size + "px 'Open Sans'";
                }
                if (ctx.fillStyle != textColor) {
                    ctx.fillStyle = textColor;
                }
                ctx.fillText(square.place, fX, fY);
                break;
                break;

            default :
                if (ctx.fillStyle != color1) ctx.fillStyle = color1;
                ctx.beginPath();
                ctx.arc(x, y, roundR, 0, 360, false);
                ctx.fill();
                ctx.closePath();
                if (status !== 0) {
                    if (ctx.fillStyle != color2) ctx.fillStyle = color2;
                    ctx.beginPath();
                    ctx.arc(x + w / 15, y + h / 15, roundR - w / 8, 0, 360, false);
                    ctx.fill();
                    ctx.closePath();
                }
                break;
        }
    } else {

    }
};
Map1.prototype.drawOneSquare = function (key, callback, alternativeCtx) {
    if (typeof callback !== "function") callback = function () {
    };

    this.renderSquareImage(this.squares[key], {});


    return;
    var ctx = alternativeCtx || this.ctx;
    var wh = this.squareWH;
    var cw = this.cWidth;
    var ch = this.cHeight;
    var x = Math.round((this.squares[key].x) * this.scaleCoeff + this.XCoeff);
    var y = Math.round((this.squares[key].y) * this.scaleCoeff + this.YCoeff);
    var w = +this.squares[key].w;
    var h = +this.squares[key].h;
    var scaledW = Math.round(w * this.scaleCoeff);
    var scaledH = Math.round(h * this.scaleCoeff);
    var img, imgText, imgText2, font;

    //if (x < 0 || y < 0 || x > cw - (cw * 2 / 100) || y > ch - (ch * 2 / 100))
    //if (x < 0 || y < 0 || x > cw - wh*this.scaleCoeff || y > ch - wh*this.scaleCoeff)
    if (x < 0 || y < 0 || x > cw || y > ch)
        return;

    var color = this.squares[key].color0;
    if (this.squares[key].lighted != undefined)
        color = this.squares[key].colorSelected;
    var textColor = this.squares[key].textColor;
    var innerFill = (this.squares[key].lighted_now) ? color : '#FFFFFF'; //changed by aig
    if (this.scaleCoeff < 0.15) { // Очень мелкий скейл, рамочки не прорисовываются. Поэтому рисуем заливку
        innerFill = (!this.squares[key].lighted_now) ? color : "#FFFFFF";
    }
    var cache = true;


    /// Если изображение места еще не закешировано, то отрисуем его так, и поставим в очередь загрузки (генерации)
    var scale = +this.roundPlus(this.scaleCoeff, 1);
    var alias = this.pictures.getAlias({
        mode: "square",
        color1: color,
        color2: innerFill,
        scale: scale
    });


    /**
     * Выводит прямоугольник в заданных координатах на том или ином канвасе
     * @param ctx Можно указать альтернативный канвас
     */
    function renderSquare(ctx) {
        var myCtx = ctx || this.ctx;
        this.pictures.canvasRadiusFill(x + (scaledW / 60), y + (scaledH / 40), scaledW, scaledH,
            Math.round(w / 10 * this.scaleCoeff),
            Math.round(w / 10 * this.scaleCoeff),
            Math.round(w / 10 * this.scaleCoeff),
            Math.round(w / 10 * this.scaleCoeff),
            color, myCtx);
        //if (!this.moving)

        if ((this.mode == "casher" || this.mode == "client_screen" || this.mode == "iFrame") && this.squares[key].status !== 0) {
            this.pictures.canvasRadiusFill(x + (scaledW / 10), y + (scaledH / 10), scaledW - (scaledW / 5), scaledH - (scaledH / 5),
                Math.round(w / 10 * this.scaleCoeff),
                Math.round(w / 10 * this.scaleCoeff),
                Math.round(w / 10 * this.scaleCoeff),
                Math.round(w / 10 * this.scaleCoeff),
                innerFill, myCtx); //changed by aig    was "#FFFFFF"
        }
    }

// Если такого изображения еще нету, рисуем непосредственно на канвасе и ставим в очередь для подзагрузки
    function prepareFont(ctx) {
        var myCtx = ctx || this.ctx;
        textColor = "#000";
        if (myCtx.font != "normal " + Math.round((w / 2) * this.scaleCoeff) + "px 'Open Sans'") {

            if (this.mode == "casher" || this.mode == "client_screen" || this.mode == "iFrame") {
                myCtx.font = "normal " + Math.round((w * 0.7) * this.scaleCoeff) + "px 'Open Sans'";
            } else {
                myCtx.font = "normal " + Math.round((w / 2) * this.scaleCoeff) + "px 'Open Sans'";
            }
        }
        if (myCtx.fillStyle != textColor)
            myCtx.fillStyle = textColor;
    }

    function fillText(ctx) {
        var myCtx = ctx || this.ctx;
        if (document.all && !document.addEventListener) {
            myCtx.fillText(this.squares[key].place, x + ((w - 1.5 * (w / 2.3 * 0.9)) * this.scaleCoeff), y + ((h - h / 15) * this.scaleCoeff));
            return;
        }
        if (this.mode == "casher" || this.mode == "client_screen" || this.mode == "iFrame") {
            var pCount = this.squares[key].place.length;
            myCtx.fillText(this.squares[key].place, x + ((w / (w / 10) + 10 - pCount * 8) * this.scaleCoeff), y + ((h / 1.25) * this.scaleCoeff));
            return;
        }
        myCtx.fillText(this.squares[key].line, x + ((w / (w / 4)) * this.scaleCoeff), y + ((h / 2.1) * this.scaleCoeff));
        if (this.squares[key].place.length == 1) {
            myCtx.fillText(this.squares[key].place, x + ((w - (w / 3 * 0.9)) * this.scaleCoeff), y + ((h - h / 10) * this.scaleCoeff));
        } else if (this.squares[key].place.length == 2) {
            myCtx.fillText(this.squares[key].place, x + ((w - 1.5 * (w / 2.3 * 0.9)) * this.scaleCoeff), y + ((h - h / 15) * this.scaleCoeff));
        } else if (this.squares[key].place.length == 3) {
            myCtx.fillText(this.squares[key].place, x + ((w - 2.5 * (w / 2 * 0.9)) * this.scaleCoeff), y + ((h - h / 10) * this.scaleCoeff));
        }
    }

    function addToPreload() {
        this.pictures.toPreload({
            mode: "square",
            color1: color,
            color2: innerFill,
            scale: scale,
            alias: alias,
            status: this.squares[key].status,
            blocked: this.squares[key].blocked,
            lighted: this.squares[key].lighted
        });
        this.pictures.toPreload({
            cache: cache,
            mode: "label",
            textMode: "placeOnly",
            /*textColor:this.squares[key].textColor,*/
            textColor: "#000",
            place: this.squares[key].place,
            scale: scale
        });
    }

    if (!this.pictures.items[alias]) {
        /// Добавим в прелоад
        addToPreload.call(this);
        // Отрисуем
        renderSquare.call(this);
        prepareFont.call(this);
        fillText.call(this);
        return callback;
    }
    /// Если есть закешированное изображение
    if ((this.mode == "casher" && this.squares[key].status == 1 && this.squares[key].blocked == 0) || (this.mode == "client_screen") && !this.squares[key].lighted && this.squares[key].status == 1) {
        img = this.pictures.get(
            {
                cache: cache,
                mode: "square",
                color1: color,
                color2: innerFill,
                status: this.squares[key].status,
                blocked: this.squares[key].blocked,
                lighted: this.squares[key].lighted
            }
        );
        if (typeof img === "object") {
            ctx.drawImage(img, x, y, scaledW, scaledH);
        }
        imgText = this.pictures.get(
            {
                cache: cache,
                mode: "label",
                textMode: "placeOnly",
                /*textColor:this.squares[key].textColor,*/
                textColor: "#000",
                place: this.squares[key].place
            }
        );
        if (typeof imgText === "object") {
            ctx.drawImage(imgText, x, y, scaledW, scaledH);
        }
    } else {
        var innerFill2 = color;
        if (!this.squares[key].lighted && this.squares[key].status == 1 && this.squares[key].blocked == 0) {
            innerFill2 = (!this.squares[key].lighted_now) ? color : '#FFFFFF'; //changed by aig;
        }
        img = this.pictures.get(
            {
                cache: cache,
                mode: "square",
                color1: color,
                color2: innerFill2,
                status: this.squares[key].status,
                blocked: this.squares[key].blocked,
                lighted: this.squares[key].lighted
            }
        );
        if (typeof img === "object") {
            ctx.drawImage(img, x, y, scaledW, scaledH);
        }
        var o = {
            cache: cache,
            mode: "label",
            textMode: "placeOnly",
            textColor: this.squares[key].textColor,
            place: this.squares[key].place
        };
        if (this.mode != "casher" && this.mode != "client_screen" && this.mode != "iFrame") {
            o.textMode = "line";
            o.line = this.squares[key].line;
            imgText = this.pictures.get(o);
            o.textMode = "place";
            imgText2 = this.pictures.get(o);
            //o.line = this.squares[key].line;
        } else {
            o.textMode = "placeOnly";
            imgText = this.pictures.get(o);
        }
        if (typeof imgText === "object") {
            ctx.drawImage(imgText, x, y, scaledW, scaledH);
        }
        if (typeof imgText2 === "object") {
            ctx.drawImage(imgText2, x, y, scaledW, scaledH);
        }
    }
    return callback();
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
    var from = params.from || [255, 0, 0];
    var to = params.to || [255, 255, 255];
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
    var animate = function () {
        self.animate({
            delay: delay,
            duration: duration,
            /*delta: linear,*/
            delta: delta,
            elem: elem,
            step: function (delta) {
                if (typeof func == "function") {
                    func(elem, 'rgb(' +
                    Math.max(Math.min(parseInt((delta * (+to[0] - +from[0])) + +from[0], 10), 255), 0) + ',' +
                    Math.max(Math.min(parseInt((delta * (+to[1] - +from[1])) + +from[1], 10), 255), 0) + ',' +
                    Math.max(Math.min(parseInt((delta * (+to[2] - +from[2])) + +from[2], 10), 255), 0) + ')');
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
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        ctx.stroke();
    }
    return one_group;
};
Map1.prototype.drawSectors = function (params) {
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
    var lineWidth = params.lineWidth || 8;
    var lineJoin = params.lineJoin || 'round';
    var shadowOffsetX = params.shadowOffsetX || 3;
    var shadowOffsetY = params.shadowOffsetY || 3;
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
Map1.prototype.drawSquares = function (callback, alternativeCtx) {
    if (typeof callback !== "function") callback = function () {
    };
    var t1 = new Date().getTime();
    for (var key in this.squares) {
        this.drawOneSquare(key, alternativeCtx);
    }
    var t2 = new Date().getTime();
    console.log('Изображения отрисовались за: ', t2 - t1);
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

        /*for (var k in coors) {
         if (k % 2 == 0) {
         coors[k] = +coors[k] * self.scaleCoeff + self.XCoeff;
         } else {
         coors[k] = +coors[k] * self.scaleCoeff + self.YCoeff;
         }
         }
         for (var k2 in coors2) {
         //coors[k] = +coors[k]*this.scaleCoeff;
         if (k2 % 2 == 0) {
         coors2[k2] = +coors2[k2] * self.scaleCoeff2 + self.XCoeff2;
         } else {
         coors2[k2] = +coors2[k2] * self.scaleCoeff2 + self.YCoeff2;
         }
         }*/
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
        var obj = items[k].object;
        switch (obj.type) {
            case 1: // BACKGROUND
                if (obj.loaded && obj.visibility['visible_' + mode]) {
                    var x = +obj.x * this.scaleCoeff + this.XCoeff;
                    var y = +obj.y * this.scaleCoeff + this.YCoeff;
                    if (!obj.rotation) {
                        this.ctx.drawImage(obj.value, x, y, obj.value.width * this.scaleCoeff * obj.scaleCoef, obj.value.height * this.scaleCoeff * obj.scaleCoef);
                    } else {
                        this.ctx.save();
                        //this.ctx.translate(x+obj.value.width*this.scaleCoeff*obj.scaleCoef/2,y+obj.value.height*this.scaleCoeff*obj.scaleCoef/2);
                        this.ctx.translate(x + obj.value.width * this.scaleCoeff * obj.scaleCoef / 2, y + obj.value.height * this.scaleCoeff * obj.scaleCoef / 2);
                        this.ctx.rotate(obj.rotation);
                        this.ctx.drawImage(obj.value, -obj.value.width * this.scaleCoeff * obj.scaleCoef / 2, -obj.value.height * this.scaleCoeff * obj.scaleCoef / 2, obj.value.width * this.scaleCoeff * obj.scaleCoef, obj.value.height * this.scaleCoeff * obj.scaleCoef);
                        this.ctx.restore();
                    }
                }
                break;
            case 2: // IMAGE
                if (obj.loaded && obj.visibility['visible_' + mode]) {
                    var x = +obj.x * this.scaleCoeff + this.XCoeff;
                    var y = +obj.y * this.scaleCoeff + this.YCoeff;
                    if (!obj.rotation) {
                        this.ctx.drawImage(obj.value, x, y, obj.value.width * this.scaleCoeff * obj.scaleCoef, obj.value.height * this.scaleCoeff * obj.scaleCoef);
                    } else {
                        this.ctx.save();
                        //this.ctx.translate(x+obj.value.width*this.scaleCoeff*obj.scaleCoef/2,y+obj.value.height*this.scaleCoeff*obj.scaleCoef/2);
                        this.ctx.translate(x + obj.value.width * this.scaleCoeff * obj.scaleCoef / 2, y + obj.value.height * this.scaleCoeff * obj.scaleCoef / 2);
                        this.ctx.rotate(obj.rotation);
                        this.ctx.drawImage(obj.value, -obj.value.width * this.scaleCoeff * obj.scaleCoef / 2, -obj.value.height * this.scaleCoeff * obj.scaleCoef / 2, obj.value.width * this.scaleCoeff * obj.scaleCoef, obj.value.height * this.scaleCoeff * obj.scaleCoef);
                        this.ctx.restore();
                    }
                }
                break;
            case 4: // LABELS
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


Map1.prototype.render = function (callback, mode) {
    if (typeof callback !== "function") callback = function () {
    };
    if (this.mode == "sectors"){
        return;
    }
    this.t1 = new Date().getTime();
    //var t1 = new Date().getTime();
    var mX = this.x * this.scaleCoeff;
    var mY = this.y * this.scaleCoeff;

    var cw = this.cWidth;
    var ch = this.cHeight;
    /*if (this.ctx.fillStyle !== this.bgColor) {
     this.ctx.fillStyle = this.bgColor;
     }*/
    this.ctx.clearRect(0, 0, cw, ch);
    //this.ctx.fillRect(0, 0, cw, ch);
    if (!this.moving)
        this.ctx2.clearRect(0, 0, cw, ch);

    var self = this;
    this.drawZoom();

    //var alias = this.mode + this.load_alias + this.scaleCoeff;
    var scale = this.roundPlus(this.scaleCoeff, 1);
    var alias = this.pictures.getAlias({
        mapMode: this.mode,
        load_alias: this.load_alias,
        mode: "canvas",
        scale: scale
    });

    var img = this.pictures.items[alias];
    if (!img || !this.moving) {

        this.drawObjects(function () {
            self.drawSquares(function () {
                //self.pictures.toPreload({mode: "canvas", alias: alias, scale: scale});

                return callback();
            });
        });

        if (mode !== "generate_screen") {

        }
    } else {
        var w = img.width;
        var h = img.height;
        //var dScale = 1+Math.abs(this.scaleCoeff - scale);
        var dScale = ((self.maxX - self.minX) * self.scaleCoeff) / w;
        //var dScale = 1+this.scaleCoeff - scale;
        var newW = (self.maxX - self.minX + self.squareWH) * self.scaleCoeff;
        var newH = (self.maxY - self.minY + self.squareWH) * self.scaleCoeff;


        /* var tmpX = self.XCoeff;
         var tmpY = self.YCoeff;
         self.XCoeff = self.startXCoeff;
         self.YCoeff = self.startYCoeff;
         self.XCoeff = tmpX;
         self.YCoeff = tmpY;*/
        /*console.log('sW');
         console.log(Math.round(w * this.scaleCoeff));*/
        //self.ctx.drawImage(img, self.XCoeff-self.startXCoeff, self.YCoeff-self.startYCoeff, Math.round(w * dScale), Math.round(h * dScale));
        //self.ctx.drawImage(img, self.XCoeff, self.YCoeff, Math.round(w * dScale), Math.round(h * dScale));
        self.ctx.drawImage(img, self.XCoeff + self.minX * self.scaleCoeff, self.YCoeff + self.minY * self.scaleCoeff, newW, newH);
        //self.ctx.drawImage(img, self.XCoeff + self.minX*scale, self.YCoeff + self.minY*scale, Math.round(w * dScale), Math.round(h * dScale));


    }
    if (!this.moving) {

    } else {

    }

    if (self.mode === "editor") {
        if (typeof self.specialObjects === 'object') {
            self.drawSpecialObjects();
        }
    }
    var t2 = new Date().getTime();
    console.log('Rendered за: ', t2 - this.t1);
    /*var t2 = new Date().getTime();
     console.log('Время отрисовки: ', t2-t1);*/
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
                var wh = this.squareWH * this.scaleCoeff;
                if (x >= x2 && x <= +(x2 + wh) && y >= +y2 && y <= +(y2 + wh)) {
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
        self.shiftState = 0;
        if (self.moving) {
            window.setTimeout(function () {
                self.moving = false;
                self.render();
                self.reLoadLayout();
            }, 50);
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
                self.render();
                self.reLoadLayout();
            }
            self.mouseWheelFlag = false;
        }, 500);
    };
    var tmpArray = [];
    Map1.prototype.getNextScale = function (delta) {
        //var cCoef = self.scaleCoeff.toFixed(3);
        var cCoef = self.roundPlus(self.scaleCoeff, 3);
        step = 0.025;
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
        if (self.mode == "sectors") {
            return;
        }
        self.scrollControl();
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

    this.container.on("squares_select", function (e, x, y, onlyOne) {
        /*if (self.moving) return;*/
        self.selecting = 1;
        var square = self.mouseOnElement(x, y);
        if (square) {
            if (+self.squares[square].status == 0 && self.mode !== "editor") return;
            if (onlyOne) {

                if ($.inArray(+square, self.selection) != -1)
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
    this.container.on("light_sector", function (e, x, y) {
        /*action_group_id: "2547"
         action_id: "932"
         free_places: "16"
         max_price: true
         min_price: true
         name: "Партер середина"
         status: true
         sub_groups: Array[8]
         __proto__: Object*/

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
        if (self.mode!=="sectors"){
            var square_id = self.mouseOnElement(x, y);
            if (square_id)
                console.log(self.squares[square_id]);
        }else{

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

        //self.mouseKey = e.which;

        switch (e.which) {
            case 1:    /// левая кнопка мыши
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
                                break;
                            case "iFrame":
                                self.container.trigger("squares_select", [x, y, true]);
                                self.container.trigger("sendSelection");

                                break;
                            case "client_screen":
                                break;
                            case "sectors":
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
                            case "sectors":
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
    this.container.on("mouseout", function (e) {
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
    });
    $(document).on('keyup', function (e) {
        if (e.which >= 37 && e.which <= 40) {
            return;
        }
        self.shiftState = 0;
    });


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
            case "sectors":
                //self.container.trigger("select_sector", [x, y]);
                self.container.trigger("go_to_sector", [x, y]);
                break;
            default:
                self.container.trigger("squares_select", [x, y, true]);
                self.container.trigger("sendSelection");
                break;
        }
    });
    touchEvents.on('pan', function (ev) {
        self.container.trigger("move_map", [ev.pointers[0].pageX, ev.pointers[0].pageY]);
        self.zoom_container.html('pageX: ' + ev.pointers[0].pageX);//.css({width:"100px",height:"40px"});
        //self.zoom_container.html('angle: '+ev.center.x).css({width:"100px",height:"40px"});
    });
    touchEvents.on('pinch', function (ev) {
        //self.zoom_container.html('angle: '+JSON.stringify(ev.center)).css({width:"100px",height:"40px"});
        self.container.trigger("scale_map", [ev.center.x, ev.center.y, ev.scale - 1]);
    });


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

/*
if (typeof MB === "object") {
    toggleLog();
    setTimeout(function () {
        if (MB.User.username == 'igoptarev') {
            MB.Core.switchModal({type: "content", filename: "one_action", params: {action_id: 801}});
            //MB.Core.switchModal({type: "content", filename: "one_action", params: {action_id: 932}});
            //MB.Core.switchModal({type: "content", filename: "one_action", params: {action_id: 2}});
        }

    }, 1000);
}
*/


/**** КОНЕЦ  Controller   *****/

