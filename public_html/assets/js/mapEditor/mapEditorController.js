
var mapEditorController = function(mapEditor_map, ediorId){

    var editor = new ME();

    var clickButton = $('.clickButton');
    var spaceRegExp = new RegExp(/^\s+$/);


    var populator = {
        renderLayers: function(templateId, draggable, containerId){
            var container = $('#'+containerId); //layersUl
            var tpl = $('#'+templateId).html();  //layerItemTpl
            var resultData = [];
            var dragClass = (draggable)? "draggable": "";

            for(var i=0; i<editor.layers.length; i++){
                var layer = editor.layers[i];
                var selected = (layer.selected == true)? 'selected': '';
                var objects = [];

                function getObjects(){
                    for(var i=0; i<layer.objects.length; i++){
                        var item = layer.objects[i];
                        var tmpObj = {
                            isVisible: (item.isVisible)? "fa-eye on":"fa-eye-slash",
                            isVisibleCheckbox: (item.isVisible)? 'checked="checked"':'',
                            isObjectSettingsOpened: (item.isObjectSettingsOpened)?"expanded":"",
                            object_id: item.object_id,
                            object_img: item.image,
                            object_title: item.object_title,
                            objSelectedClass: (item.selected)? "selected":""
                        };

                        objects.push(tmpObj);
                    }
                }
                getObjects();

                var layersHtml = {
                    layer_id: layer.id,
                    isVisible: (layer.isVisible)? "fa-eye on":"fa-eye-slash",
                    isVisibleCheckbox: (layer.isVisible)? 'checked="checked"':'',
                    isVisibleFader: (layer.isVisible)? '':'faded',
                    isLayerExpanded: (layer.isOpened == true)? "expanded": "",
                    isLayerExpandedIcon: (layer.isOpened == true)? "fa-angle-down expand": "fa-angle-left",
                    isLayerSettingsOpened: (layer.isSettingsOpened == true)? "expanded": "",
                    isLayerSettingsOpenedIcon: (layer.isSettingsOpened == true)? "on": "",
                    isntFixedTop: !layer.isFixedTop,
                    layer_title: layer.title,
                    selected_class: selected,
                    isObjects: layer.objects.length > 0,
                    layer_objects: objects,
                    layerSelectedClass: (layer.selected)? "selected": ""
                };
                resultData.push(layersHtml);
            }

            var data = {
                "isLayers": editor.layers.length>0,
                "layers": resultData
            };

            container.html(Mustache.to_html(tpl, data));
            mapEditor_map.container.trigger('layersRendered');
        }
    };

    var dialog = {
        open: function(params){
            // params:
                // html - (inner html of modal dialog) {string}
                // title - (title of dialog) {string}
                // success - (callback function, fires on confirm click) {function}
                // error - (callback function, fires on cancel click) {function}
                // yesTitle - (text of success button) {string}
                // noTitle - (text of error button) {string}
                // yesClass - (class of success button) {string}
                // noClass- (class of success button) {string}
            bootbox.dialog({
                message: params.html,
                title: params.title,
                buttons: {
                    success: {
                        label: params.yesTitle || 'Подтвердить',
                        className: params.yesClass || 'blue',
                        callback: params.success
                    },
                    error: {
                        label: params.noTitle || 'Отмена',
                        className: params.noClass || 'red',
                        callback: params.error
                    }
                }

            });
        }
    };

    var getter = {

    };

    var numeration = {

    };

    var ui = {

    };

    mapEditor_map.container.on('clickButton', function(e, params){

        switch(params.id){
            case 'addLayer':

                var dialogParams = {
                    html: '<input type="text" class="bigInput form-control" id="newLayerName"/>',
                    title: 'Введите имя слоя',
                    success: function(){
                        var newLayerParams = {
                            id: MB.Core.guid(),
                            selected: false,
                            title: ''
                        };

                        var name = $('#newLayerName').val(), layersCount = editor.layers.length;
                        (spaceRegExp.test(name) || !name || name == "")? newLayerParams.title = 'Новый слой '+(layersCount+1) : newLayerParams.title = name;

                        var layer = new MELayer(newLayerParams);
                        editor.addLayer(layer);

                        mapEditor_map.container.trigger('addLayer',[layer]);

                    },
                    error: function(){},
                    yesTitle: "Подтвердить",
                    noTitle: "Отмена",
                    yesClass: "blue",
                    noClass: "red"
                };

                dialog.open(dialogParams);

                break;
            case 'addObject':
                break;
            case 'fileUpload':
                break;
            case undefined:
                console.warn('undefined id of clickButton');
                break;
            default:
                break;
        }

    });

    clickButton.on('click', function(e){
        e = e || window.event;
        var data = {
            id: $(this).attr('id') || undefined,
            event: e
        };
        mapEditor_map.container.trigger('clickButton', [data]);
    });

    mapEditor_map.container.on('addLayer_callback',function(e,obj){
        populator.renderLayers('layerItemTpl', false ,'layersUl');
    });

    mapEditor_map.container.on('layersRendered', function(e, obj){
        var liCollection = document.getElementById('layersUl').children;
        for(var i=0; i<liCollection.length; i++){
            var layer = liCollection[i],
                layerId = layer.getAttribute('data-id'),
                rect = layer.getBoundingClientRect();

            var objLayer = editor.findLayer(layerId);
            objLayer.rect = {
                top: rect.top, // dirty
                left: rect.left,
                height: rect.height,
                width: rect.width
            };
        }

        $(".opacitySlider").ionRangeSlider({
            min: 0,
            max: 100,
            type: 'single',
            step: 1,
            postfix: " %",
            prettify: false,
            hasGrid: false
        });
        $('input[type="checkbox"]:not(".noUniform")').uniform();
    });
};


/*
СТРАСБУРГ, 18 апреля. /Корр. ИТАР-ТАСС Илья Баранов/. Совет Европы издал руководство для пользователей интернета, в
котором говорится о правах человека в сети и возможных действиях в случае их нарушения. По словам авторов, создание
документа «вызвано необходимостью предоставить людям возможность реализовывать свои права».


Зачастую права пользователей, «излагаемые в договорах о предоставлении услуг интернет-компаний, представляют длинный
список юридических условий, которые редко кто читает и еще реже полностью понимает».

В связи с этим основное внимание в руководстве уделено таким вопросам, как «доступ к глобальной сети и недискриминация,
    свобода слова и информации, свобода собраний и объединений, право на участие в жизни общества, защита частной жизни
и персональных данных, образование и обучение, защита детей и молодежи, право на эффективные средства защиты при
нарушениях прав человека».

Одобренный Комитетом министров СЕ документ «основан на правах и свободах, закрепленных в Европейской конвенции о
правах человека и истолкованных Европейским судом по правам человека».

«Правительства, частные компании и другие субъекты правовых отношений обязаны соблюдать права человека в интернете и
вне его. Мы будем сотрудничать с ними в вопросах применения руководства с тем, чтобы пользователи интернета имели доступ
к эффективным средствам правовой защиты в ситуациях, когда они считают, что их права были ограничены или нарушены», —
отметил генеральный секретарь СЕ Турбьёрн Ягланд.

    Во время разработки документа СЕ провел многосторонние консультации с правительствами, частными компаниями, в
частности, с провайдерами и телекоммуникационными компаниями, с правозащитниками, представителями технических и
научных кругов.*/
