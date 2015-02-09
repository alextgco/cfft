/**
 * Виджет для отображения списка зон в зале
 * @param zones массив зоне для мероприятия
 * @param id идантификатор мероприятия
 * @param mapObject объект обработки и отрисовки данных по зонам
 * @param params параметры для инициализации Map1 (в частности для правильного определения идантификатора фрейма)
 */
var listZoneWidget = function (zones, id, mapObject, params, canvasView) {
    var $this = this;
    window.t = this;
    $('#listZonesWrapper').remove();
    $('#listZonesExpand').remove();
    $('#container').remove();
    $('#listZonesWrapper .title').remove();
    this.currentZones = zones;
    /**
     * Зоны в по id
     * */
    this.currentZonesObject = {};
    if (zones) {
        $.each(zones, function (idx, zone) {
            $this.currentZonesObject[zone.AREA_GROUP_ID] = zone;
        });
    }
    this.activeZones = [];
    this.canvasView  = canvasView;
    this.bWrapper = $('#listZonesWrapper');
    this.bExpColl = $('#listZonesExpand');
    this.bContainer = $('#container');
    this.mapObject = mapObject;
    this.mapObject.listZoneWidget = this;
    this.inMove = false;
    this.id = id;
    this.params = params;
    this.zoneBg = "#ededed";
    this.zoneBgShadow = "#c6c6c6";
    this.zoneBgActive = "#80acee";
    this.zoneBgActiveShadow = "#4e7590";
    this.canvasBg = "#e1e1e1";
    this.activeZone = 0;

    this.actualWidth = function () {
        $this.width = $(window).width();
        $this.height = $(window).height();
        $this.bWrapper.css("top", ($this.height - $this.bWrapper.height() - 20) + "px");
        $this.bWrapper.css("left", ($this.width - $this.bWrapper.width() - 20) + "px");
        if ($this.listZoneContainer) {
            $this.$basket = $("#basketWrapper");
            if ($this.$basket.length == 1) {
                // Максимальная верхнаяя позиция блока со списком зон
                $this.max_top_position = $this.$basket.height() + $this.$basket.offset().top + 20;
                // Высота контейнера со списком зон
                $this.container_height = $this.listZoneContainer.height();
                // Максимальная высота виджета с зонами
                $this.max_height_wrapper = $(window).height() - $this.max_top_position;
                $this.listZoneContainer.height($this.max_height_wrapper - 160);
                $this.current_top = $this.max_top_position;
                $this.bWrapper.offset({ top: $this.max_top_position });
                $this.bExpColl.offset({ top: $this.max_top_position + 3 });
            }
        }
    };
    this.beginCanvas();
    if (this.currentZones) {
        $($this.mapObject.ctx.canvas).on("mouseout", function () {
            $this.init();
        });
    }
};
/**
 * Начальная отрисовка всех зон зала
 */
listZoneWidget.prototype.beginCanvas = function () {
    var $this = this;
    /**
     * если не включен показ зон
     */
    if (!this.currentZones) {
        this.initAction();
        return;
    }
    /**
     *  Обработчик нажатия по карте зала
     * @param e
     */
    $this.onClickCanvas = function (e) {
        var object = { x: e.offsetX, y: e.offsetY };
        var zone_id = $this.testZonePoint(object);
        $($this.mapObject.ctx.canvas).off("mousemove", $this.onMouseMove);
        if (zone_id || $this.activeZone !== 0) {
            var zone = $this.currentZonesObject[zone_id];
            // Если была предыдущая активная зона была , то при клике открываем её
            if (!zone_id && $this.activeZone !== 0) {
                zone_id = $this.activeZone;
            }
            if ($this.activeZones.indexOf(zone_id) == -1) {
                $this.activeZones.push(zone_id);
            } else {
                $this.activeZones.splice($.inArray(zone_id, $this.activeZones), 1);
            }

            $this.mapObject.ctx.clearRect(0, 0, t.mapObject.ctx.canvas.width, t.mapObject.ctx.canvas.height);

            $($this.mapObject.ctx.canvas).off("click", $this.onClickCanvas);
            $($this.mapObject.ctx.canvas).off("mousemove", $this.onMouseMove);
            $($this.mapObject.ctx.canvas).off("mouseout");

            $this.initAction(zone_id);
        }
    };
    /**
     * Обработка движения над картой зала
     * @param e
     */
    $this.onMouseMove = function (e) {
        var object = { x: e.offsetX, y: e.offsetY };
        var zone_id = $this.testZonePoint(object);
        if (zone_id && zone_id !== $this.activeZone) {
            $this.activeZone = zone_id;
            $this.init([zone_id]);
        }
    };
    this.actualWidth();
    // начальная отрисовка всех зон зала
    this.initCoeffCalculate();
    this.init();
    // выбор зон на рисунке
    $(this.mapObject.ctx.canvas).click($this.onClickCanvas);
    $(this.mapObject.ctx.canvas).mousemove($this.onMouseMove);
}
listZoneWidget.prototype.initAction = function (zone_id) {
    var $this = this;
    if (zone_id) {
        $this.setMinMaxForZone(zone_id);
    }

    if (zone_id) {
        var o = {
            command: "get_action_scheme",
            params: {
                action_id: $this.id,
                area_group_id: zone_id,
                frame: $this.params.frame
            }
        };
    } else {
        var o = {
            command: "get_action_scheme",
            params: {
                action_id: $this.id,
                frame: $this.params.frame
            }
        };
    }

    var callback = function (empty) {
        if (!empty) {
            $this.mapObject.loadObj.params.area_group_id = zone_id;
        }
        $this.mapObject.loadSquares(o, function () {
            $this.mapObject.setLayout(function () {
                $this.mapObject.setMinMax(function () {
                    $this.mapObject.setScaleCoff(function () {
                        $this.mapObject.render(function () {
                            $this.mapObject.reLoadLayout(function () {});
                            if (!$this.mapObject.binds) {
                                $this.mapObject.binds = true;
                                $this.mapObject.bindListeners();
                            }
                            if (empty) {
                                $this.mapObject.setEvents();
                            } else {
                                $this.mapObject.container.on("mousewheel",$this.mapObject.wheelEvent.bind($this.mapObject));
                            }
                            $this.canvasView.trigger("loadSquares");
                        });
                    });
                });
            });
        });
    };
    if ($.isEmptyObject($this.mapObject.loadObj)) {
        callback(true);
    } else {
        callback(false);
    }
}
/**
 * Возвращает false или идантификатор группы
 * @param point
 * @returns {boolean|Number}
 */
listZoneWidget.prototype.testZonePoint = function (point) {
    var intercept = false;
    var $this = this;
    //point = $this.getMap().transformPoint(point);

//    console.log(point,$this.getMap().transformPoint(point));
    $.each($this.currentZones, function (idx, zone) {
//        var polygon = $this.mapObject.makeArrayPolygon(zone.AREA_GROUP_STROKE);
        var polygon = $this.currentZones[idx].array;
        if ($this.pointPolygonInterception(point, polygon)) {
            intercept = zone.AREA_GROUP_ID;
            return false;
        }
    });
    return intercept;
}
/**
 *  Установка маштаба для начальной отрисовки карты зала
 */
listZoneWidget.prototype.initCoeffCalculate = function (onlyZone) {
    var $this = this;
    // установка минимальных максимальных значений
    var Xs = [] , Ys = [];
    $.each(this.currentZones, function (idx, zone) {
        var zonePolygon = $this.mapObject.makeArrayPolygonWithoutCoef(zone.AREA_GROUP_STROKE);
        $this.currentZones[idx].array = $this.mapObject.makeArrayPolygon(zone.AREA_GROUP_STROKE);

        $.each(zonePolygon, function (idx, point) {
            Xs.push(point[0]);
            Ys.push(point[1]);
        });
    });
    $this.mapObject.minX = Math.min.apply(Math, Xs);
    $this.mapObject.maxX = Math.max.apply(Math, Xs);
    $this.mapObject.minY = Math.min.apply(Math, Ys);
    $this.mapObject.maxY = Math.max.apply(Math, Ys);
    $this.mapObject.squareWH = 0;
    $this.mapObject.setScaleCoff();
}
/**
 * Назначить мин.максы для текущей зоны
 * @param zone_id
 */
listZoneWidget.prototype.setMinMaxForZone = function (zone_id) {
    var $this = this;
    var zone = this.currentZonesObject[zone_id];
    var Xs = [] , Ys = [];
    var zonePolygon = $this.mapObject.makeArrayPolygonWithoutCoef(zone.AREA_GROUP_STROKE);
    $.each(zonePolygon, function (idx, point) {
        Xs.push(point[0]);
        Ys.push(point[1]);
    });
    $this.mapObject.minX = Math.min.apply(Math, Xs);
    $this.mapObject.maxX = Math.max.apply(Math, Xs);
    $this.mapObject.minY = Math.min.apply(Math, Ys);
    $this.mapObject.maxY = Math.max.apply(Math, Ys);
    $this.mapObject.squareWH = 0;
    $this.mapObject.setScaleCoff();
}
listZoneWidget.prototype.returnToAllZones = function () {
    var $this = this;
    $($this.mapObject.ctx.canvas).off("mousemove", $this.onMouseMove);
    $($this.mapObject.ctx.canvas).off("click", $this.onClickCanvas);
    $this.mapObject.container.off("mousewheel");
    $this.mapObject.ctx.clearRect(0, 0, $($this.mapObject.ctx.canvas).width(), $($this.mapObject.ctx.canvas).height());
    /*$this.mapObject.ctx2.clearRect(0, 0, $($this.mapObject.ctx2.canvas).width(), $($this.mapObject.ctx2.canvas).height());*/
    $this.beginCanvas();
    $($this.mapObject.ctx.canvas).on("mouseout",function () {
        $this.init();
    });
}
/**
 * Определяем
 * @param point
 * @param polygon
 * @returns {*}
 */
listZoneWidget.prototype.pointPolygonInterception = function (point, polygon) {
    var i, j, intercept = false;
    for (i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        if (((polygon[i][1] > point.y) != (polygon[j][1] > point.y)) &&
            (point.x < (polygon[j][0] - polygon[i][0]) * (point.y - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0]))
            intercept = !intercept;
    }
    return intercept;
}
/**
 *
 */
listZoneWidget.prototype.getMinMaxFromPolygon = function (polygonArray) {
    var Xs = [];
    var Ys = [];
    var returnObject = {};
    $.each(polygonArray, function (idx, point) {
        Xs.push(point[0]);
        Ys.push(point[1]);
    });
    returnObject.minX = Math.min.apply(Math, Xs);
    returnObject.minY = Math.min.apply(Math, Ys);
    returnObject.maxX = Math.max.apply(Math, Xs);
    returnObject.maxY = Math.max.apply(Math, Ys);
    return returnObject;
}
/**
 * @return Map1
 */
listZoneWidget.prototype.getMap = function () {
   return this.mapObject;
};
/**
 * Нарисуем зону с кэшированием
 *
 * @param zone
 */
listZoneWidget.prototype.drawPoligonWithShadow = function (zone) {
    var $this = this;
    var strokeArray = zone.AREA_GROUP_STROKE.split(",");
    var render = function (idx1, strokeString) {
        var polygonArray = $this.mapObject.makeArrayPolygonWithoutCoef(strokeString);
        var minMaxObject = $this.getMinMaxFromPolygon(polygonArray);
        $this.mapObject.draw({
            value : strokeString ,
            imageCache : true ,
            useStroke : false ,
            minMax : minMaxObject,
            bg : $this.zoneBg ,
            bgShadow : $this.zoneBgShadow ,
            bgActive : $this.zoneBgActive ,
            bgActiveShadow : $this.zoneBgActiveShadow ,
            active: zone.active
        });
    }
    if (strokeArray.length > 0) {
        $.each(strokeArray, render);
        return;
    }
    render(0,zone.AREA_GROUP_STROKE);
}
/**
 * При наличии зон необходимо отрисовать их обводку
 * @param activeZone Array
 */
listZoneWidget.prototype.init = function (activeZone) {
    var $this = this;
    if (activeZone == undefined && !$.isArray(activeZone)) {
        var activeZone = [];
    }
    $(".loader_box").remove();
    $this.mapObject.ctx.clearRect(0, 0, t.mapObject.ctx.canvas.width, t.mapObject.ctx.canvas.height);
    $this.mapObject.ctx.rect(0, 0, t.mapObject.ctx.canvas.width, t.mapObject.ctx.canvas.height);
    $this.mapObject.ctx.fillStyle = $this.canvasBg;
    $this.mapObject.ctx.strokeStyle = $this.canvasBg;
    $this.mapObject.ctx.fill();
    $this.mapObject.ctx.stroke();
    // отрисовка всех зон
    activeZone = $.map(activeZone, function (value, idx) {
        return parseInt(value);
    });
    $.each(this.currentZones, function (idx, zone) {
        zone.active = (activeZone.indexOf(parseInt(zone.AREA_GROUP_ID)) != -1);
        $this.drawPoligonWithShadow(zone);
    });
}
/**
 * Обработка данных по зонам и построение DOM элементов
 */
listZoneWidget.prototype.render = function () {
    this.actualWidth();
};
listZoneWidget.prototype.collapse = function () {
    var _t = this;
    _t.inMove = true;
    var end = function () {
        _t.inMove = false;
    };
    _t.bWrapper.animate({
        height: 39 + 'px'
    }, 300, function () {
        _t.bExpColl.animate({
            top: (_t.max_top_position + 3) + 'px'
        }, 200, end);
        _t.bWrapper.animate({
            width: 114 + 'px',
            left: (_t.width - 130) + 'px',
            top: _t.max_top_position + 'px'
        }, 200, end);
    });
};
listZoneWidget.prototype.expand = function () {
    var _t = this;
    _t.inMove = true;

    _t.bExpColl.animate({
        top: (_t.current_top + 3) + 'px'
    }, 200, function () {
        _t.inMove = false;
    });
    _t.bWrapper.animate({
        left: (_t.width - 400 - 20) + "px",
        width: 400 + 'px',
        top: _t.current_top + 'px'
    }, 300, function () {


        _t.bWrapper.animate({
            height: ((_t.bWrapper.find('li').length * 59) + 44 + 41 > 485) ? 485 + 'px' : (_t.bWrapper.find('li').length * 59) + 44 + 41 + 'px'

        }, 200, function () {
            _t.bWrapper.css('height', 'auto');
            _t.inMove = false;
        });
    });

    _t.bWrapper.trigger("endAnimation");
};