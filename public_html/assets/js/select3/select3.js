var select3init = function(){
    var start;
    var stop;
    var Select3List = function(){
        this.items = [];
    };
    var Select3 = function(params){
        this.id =                       params.id || MB.Core.guid();
        this.type =                     params.type || undefined;
        this.options =                  params.options || undefined;
        this.getString =                params.getString || undefined;
        this.wrapper =                  params.wrapper || undefined;
        this.value =                    params.value || {id: "-1", name: "Выбрать"};
        this.data =                     params.data || [];
        this.fromServerIdString =       params.fromServerIdString || '';
        this.fromServerNameString =     params.fromServerNameString || '';
        this.column_name =              params.column_name || '';
        this.view_name =                params.view_name || '';
        this.searchKeyword =            params.searchKeyword || '';
        this.withEmptyValue =           params.withEmptyValue || false;
        this.freeType =                 params.freeType || false;
        this.absolutePosition =         params.absolutePosition || false;
        this.isFilter =                 params.isFilter || false;
        this.filterColumnName =         params.filterColumnName || undefined;
        this.filterClientObject =       params.filterClientObject || undefined;
        this.whereString =              params.whereString || '';
        this.dependWhere =              params.dependWhere || '';
        this.parentObject =             params.parentObject || undefined;
        this.profile_column_name =      params.profile_column_name || undefined;
    };

    Select3List.prototype.addItem = function(item){
        this.items.push(item);
    };

    Select3List.prototype.getSelect = function(id){
        var _t = this;
        for(var i in _t.items){
            if(_t.items[i].id == id){
                return _t.items[i];
            }
        }
    };

    Select3.prototype.setAbsoluteLeft = function(callback){
        var _t = this;

        for(var a = 0; a < $('.select3-absolute-wrapper').length; a++){
            var aItem = $('.select3-absolute-wrapper').eq(a);
            var aId = aItem.attr('data-id');
            var parentRect = aItem.parents('.classicTableWrap')[0].getBoundingClientRect();
            var resLeft = $('.ct-select3-wrapper[data-absolute="'+aId+'"]').parent('td')[0].getBoundingClientRect().left - parentRect.left;
            aItem.css('left', (resLeft + 5) +'px');
            if((resLeft + 5) <= 0){
                aItem.css('display','none');
            }else{
                aItem.css('display','block');
            }
        }


        if(typeof callback == 'function'){
            callback();
        }
    };

    Select3.prototype.resizeAbsolutes = function(callback){



//        for(var a = 0; a < $('.select3-absolute-wrapper').length; a++){
//            var aItem = $('.select3-absolute-wrapper').eq(a);
//            var aId = aItem.attr('data-id');
//
//            var parentRect = aItem.parents('.classicTableWrap')[0].getBoundingClientRect();
//
//            var resTop =  $('.ct-select3-wrapper[data-absolute="'+aId+'"]').parent('td')[0].getBoundingClientRect().top - parentRect.top;
//            var resLeft = $('.ct-select3-wrapper[data-absolute="'+aId+'"]').parent('td')[0].getBoundingClientRect().left - parentRect.left;
//
//            aItem.css('top', (resTop + 6) +'px');
//            aItem.css('left', (resLeft + 5) +'px');
//            aItem.css('width', ($('.ct-select3-wrapper[data-absolute="'+aId+'"]').parent('td')[0].getBoundingClientRect().width + 1) +'px');
//            aItem.css('zIndex', (a+1)*100);
//
//        }
//
//        for(var zi = $('.select3-absolute-wrapper').length; zi >= 0; zi--){
//            var ziItem = $('.select3-absolute-wrapper').eq(zi);
//            var ziVal = (($('.select3-absolute-wrapper').length - zi)+1)*100 ;
//            ziItem.css('zIndex', ziVal);
//        }

        if(typeof callback == 'function'){
            callback();
        }
    };


    Select3.prototype.init = function(){
        var _t = this;
        var template = '<div class="select3-wrapper" id="{{id}}">' +

                            '<div class="select3-select">' +
                                '<div class="select3-output" data-id="{{value_id}}">{{value_name}}</div>'+
                                '<div class="select3-angle"><i class="fa fa-angle-down"></i></div>'+
                            '</div>'+

                            '<div class="select3-dd">' +
                                '<div class="select3-search">' +
                                    '<input type="text" class="select3-search"/>'+
                                    '<div class="confirmValue">Ок</div>'+
                                '</div>'+
                                '<div class="select3-results-wrapper">' +
                                    '<ul class="select3-results">' +
                                        '{{#data}}'+
                                            '<li data-value="{{id}}">{{name}}</li>' +
                                        '{{/data}}'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+

                        '</div>';

        var absTpl = '<div class="select3-wrapper" id="{{id}}">' +
                        '<div class="select3-select">' +
                            '<div class="select3-output" data-id="{{value_id}}">{{value_name}}</div>'+
                            '<div class="select3-angle"><i class="fa fa-angle-down"></i></div>'+
                        '</div>'+
                    '</div>';

        var absDD = '<div data-id="{{id}}" class="select3-dd absoluteDD">' +
                    '<div class="select3-corner"></div>' +
                    '<div class="select3-corner2"></div>' +
                    '<div class="select3-search">' +
                    '<input type="text" class="select3-search"/>'+
                    '<div class="confirmValue">Ок</div>'+
                    '</div>'+
                    '<div class="select3-results-wrapper">' +
                    '<ul class="select3-results">' +
                    '{{#data}}'+
                    '<li data-value="{{id}}">{{name}}</li>' +
                    '{{/data}}'+
                    '</ul>'+
                    '</div>'+
                    '</div>';

        var data = {
            id: _t.id,
            value_id: _t.value.id,
            value_name: _t.value.name,
            data: _t.data
        };



        if(_t.absolutePosition){
            if(_t.type == 'inited'){
                _t.wrapper.before('<div class="select3-inline-wrapper"></div>');
                _t.wrapper = _t.wrapper.prev();
                _t.wrapper.next().remove();
            }
            _t.wrapper.prepend(Mustache.to_html(absTpl, data));
            $('body').append(Mustache.to_html(absDD, data));
        }else{

            if(_t.type == 'inited'){
                _t.wrapper.before('<div class="select3-inline-wrapper"></div>');
                _t.wrapper = _t.wrapper.prev();
                _t.wrapper.next().remove();
            }
            _t.wrapper.prepend(Mustache.to_html(template, data));
        }

        _t.parent =         _t.wrapper.find('.select3-wrapper').eq(0);
        _t.resultsScroll =  (_t.absolutePosition)? $('.select3-dd[data-id="'+_t.id+'"]').eq(0).find('.select3-results-wrapper') : _t.wrapper.find('.select3-results-wrapper').eq(0);
        _t.resultWrapper =  (_t.absolutePosition)? $('.select3-dd[data-id="'+_t.id+'"]').eq(0).find('.select3-results') : _t.wrapper.find('.select3-results').eq(0);
        _t.output =         _t.wrapper.find('.select3-output').eq(0);
        _t.searchInput =    (_t.absolutePosition)? $('.select3-dd[data-id="'+_t.id+'"]').eq(0).find('input.select3-search') : _t.wrapper.find('input.select3-search').eq(0);
        _t.select =         _t.wrapper.find('.select3-select').eq(0);
        _t.dd =             (_t.absolutePosition)? $('.select3-dd[data-id="'+_t.id+'"]').eq(0) : _t.wrapper.find('.select3-dd').eq(0);
        _t.listOfResults =  _t.wrapper.find('.select3-results li');
        _t.confirmValBtn =  _t.wrapper.find('.confirmValue').eq(0);

        var select3FromLs = JSON.parse(localStorage.getItem('select3'));
        select3FromLs.push({name: _t.id, data: {}});
        localStorage.setItem('select3', JSON.stringify(select3FromLs));
        _t.setHandlers();
    };

    Select3.prototype.setValue = function(){
        var _t = this;
        var was = {
            id: _t.output.attr('data-id'),
            name: _t.output.html()
        };
        var now = {
            id: _t.value.id,
            name: _t.value.name
        };

        _t.output.attr('data-id', _t.value.id);
        _t.output.html(_t.value.name);

        $(_t).trigger('changeVal', [was, now]);
    };

    Select3.prototype.byClickSelect = function(){
        var _t = this;

        if(_t.dd.hasClass('opened')){
            _t.dd.removeClass('opened');
        }else{
            for(var i in select3List.items){
                var idd = select3List.items[i].dd;
                idd.removeClass('opened');
            }

            _t.getDataFormServer('', function(){

            });

            if(_t.absolutePosition){

                var isInTable = _t.wrapper.parents('.classicTableWrap').length > 0;
                var parentRect = undefined;
                var resTop = undefined;
                var resLeft = undefined;

                parentRect = _t.wrapper[0].getBoundingClientRect();
                resTop =  parentRect.top;
                resLeft = parentRect.left;

                if(isInTable){
                    _t.dd.css({
                        top: (resTop + 35)+'px',
                        left: (resLeft + 8)+'px'
                    });
                }else{
                    _t.dd.css({
                        top: (resTop + 35)+'px',
                        left: (resLeft)+'px',
                        width: parentRect.width + 'px'
                    });
                }
            }
            _t.dd.addClass('opened');

            setTimeout(function(){
                _t.searchInput.focus();
            }, 10);
        }
    };

    Select3.prototype.setHandlers = function(){
        var _t = this;

        _t.select.off('click').on('click', function(){
            _t.byClickSelect();
        });

        _t.searchInput.off('input').on('input', function(){
            var val = $(this).val();
            _t.getDataFormServer(val);
            if(_t.freeType){
                if(val.length > 0){
                    _t.confirmValBtn.show(0);
                }else{
                    _t.confirmValBtn.hide(0);
                }

                _t.confirmValBtn.off('click').on('click', function(){
                    _t.value = {
                        id: MB.Core.guid(),
                        name:val
                    };
                    _t.setValue();

                    if(_t.dd.hasClass('opened')){
                        _t.dd.removeClass('opened');
                    }
                });

                $(document).on('keydown', function(e){
                    if(e.keyCode == 13){

                        _t.value = {
                            id: MB.Core.guid(),
                            name:val
                        };
                        _t.setValue();

                        if(_t.dd.hasClass('opened')){
                            _t.dd.removeClass('opened');
                        }
                    }
                });
            }
        });

        _t.resultsScroll.on('scroll', function(){
            var height = $(this).height();
            var scrollH = $(this)[0].scrollHeight;
            var scTop = $(this).scrollTop();
            if(scTop >= scrollH-height){
                _t.loadNextPart();
            }
        });

        _t.listOfResults.off('click').on('click', function(){
            var id = $(this).attr('data-value');
            var name = $(this).html();
            _t.value = {
                id:id,
                name:name
            };
            _t.setValue();
            _t.searchInput.val('');//.trigger('input');
            if(_t.dd.hasClass('opened')){
                _t.dd.removeClass('opened');
            }
        });

        $(document).on('click', function(e){
            e = e || window.event;

            if(!$(e.target).hasClass('select3-wrapper') && !$(e.target).hasClass('ct-select3-wrapper') && $(e.target).parents('.select3-wrapper').length <= 0 && $(e.target).parents('.select3-dd').length <= 0){
                if(_t.dd.hasClass('opened')){
                    _t.dd.removeClass('opened');
                }
            }
        });

    };

    Select3.prototype.getDataFormServer = function(val, callback){
        var _t = this;

        if(_t.type == 'inited'){
            var inlineData = {
                DATA: [],
                NAMES: ['DB_VALUES', 'CLIENT_VALUES']
            };

            for(var i=0; i<_t.options.length; i++){
                var opt =  _t.options.eq(i);
                var value = opt.attr('value');
                var text = opt.html();
                if(val != ''){
                    if(text.indexOf(val) > -1){
                        inlineData.DATA.push([value, text]);
                    }
                }else{
                    inlineData.DATA.push([value, text]);
                }
            }

            _t.setDataToLocalStorage(inlineData);
            if(typeof callback == 'function'){
                callback(_t);
            }

        }else{
            var o = {};
            var dependWhereStr = '';
            if(_t.dependWhere.length > 0){
                dependWhereStr += _t.parentObject.getDependWhereForSelect(_t.profile_column_name, _t.wrapper.parents('tr').eq(0).index());
            }

            if(_t.isFilter){
                o = {
                    command: 'get',
                    object: 'select2_for_query',
                    sid: MB.User.sid,
                    params: {
                        where: (_t.filterColumnName == '' || val == '')? "" : "upper("+_t.filterColumnName+") like upper('|percent|"+val+"|percent|')",
                        column_name: _t.filterColumnName,
                        client_object: _t.filterClientObject
                    }
                }
            }else{

                var wStr = (_t.whereString != '')? _t.whereString : '';
                wStr += (_t.searchKeyword == '' || val == '')? "" : "upper("+_t.searchKeyword+") like upper('|percent|"+val+"|percent|')";
                wStr = (wStr.length > 0)? (dependWhereStr.length > 0)? dependWhereStr + ' and ' + wStr : wStr : dependWhereStr;

                o = {
                    command: 'get',
                    object: _t.getString,
                    sid: MB.User.sid,
                    params: {
                        where: wStr,
                        column_name: _t.column_name,
                        view_name: _t.view_name
                    }
                };
                console.log('select3 o ', o);
            }
            start = new Date();
            MB.Core.sendQuery(o, function(res){

                if(_t.column_name == ''){
                    _t.column_name = res.NAMES[0]+','+res.NAMES[1];
                }
                if(_t.searchKeyword == ''){
                    _t.searchKeyword = res.NAMES[1];
                }

                _t.setDataToLocalStorage(res);
                if(typeof callback == 'function'){
                    callback(_t);
                }
            });
        }
    };

    Select3.prototype.getItemFromLocalStorageById = function(id){
        var _t = this;
        var itemsFormLs = JSON.parse(localStorage.getItem('select3'));
        for(var i in itemsFormLs){
            if(itemsFormLs[i].name == id){
                return itemsFormLs[i];
            }
        }
    };

    Select3.prototype.setDataToLocalStorage = function(data){
        var _t = this;

        var lsItem = _t.getItemFromLocalStorageById(_t.id);
        lsItem.data = data;

        stop = new Date();
        //console.log(start, stop);
        start = new Date();

        var fullSelect3FromLs = JSON.parse(localStorage.getItem('select3'));
        for(var i in fullSelect3FromLs){
            var item = fullSelect3FromLs[i];
            if(item.name == lsItem.name){
                item.data = lsItem.data;
            }
        }
        localStorage.setItem('select3', JSON.stringify(fullSelect3FromLs));

        _t.populateDD();
    };

    Select3.prototype.populateDD = function(){
        var _t = this;


        var first20 = _t.getItemFromLocalStorageById(_t.id).data.DATA.splice(0, 20);
        var names = _t.getItemFromLocalStorageById(_t.id).data.NAMES;
        var template = '{{#list}}<li data-value="{{id}}">{{name}}</li>{{/list}}';
        var data = {
            list: []
        };
        if(_t.withEmptyValue == true){
            if(_t.isFilter){
                data.list.push({id: '', name: ' - Любой - '});
                data.list.push({id: 'isNull', name: ' - Пустой - '});
            }else{
                data.list.push({id: '', name: ''});
            }
        }
        for(var i in first20){
            var item = first20[i];
            var id = undefined;
            var name = undefined;

            if(_t.isFilter){
                id = item[0];
                name = item[1];
            }else{

                id = (_t.fromServerIdString == '')? item[0] : (item[names.indexOf(_t.fromServerIdString.toUpperCase())])? item[names.indexOf(_t.fromServerIdString.toUpperCase())]: item[names.indexOf('DB_VALUES')];
                name = (_t.fromServerNameString == '')? item[1] : (item[names.indexOf(_t.fromServerNameString.toUpperCase())])? item[names.indexOf(_t.fromServerNameString.toUpperCase())]: item[names.indexOf('CLIENT_VALUES')];

            }

            data.list.push({id: id, name: name});
        }

        _t.resultWrapper.html(Mustache.to_html(template, data));
        _t.listOfResults = _t.resultWrapper.find('li');
        _t.setHandlers();
        _t.resultsScroll.scrollTop(0);
        stop = new Date();
        //console.log(start, stop);
    };

    Select3.prototype.loadNextPart = function(){
        var _t = this;

        var lastIndex = _t.resultWrapper.find('li').length;
        var nextPart = _t.getItemFromLocalStorageById(_t.id).data.DATA.splice(lastIndex, 20);
        var names = _t.getItemFromLocalStorageById(_t.id).data.NAMES;
        var template = '{{#list}}<li data-value="{{id}}">{{name}}</li>{{/list}}';
        var data = {
            list: []
        };
        for(var i in nextPart){
            var item = nextPart[i];

            var id = undefined;
            var name = undefined;

            if(_t.isFilter){
                id = item[0];
                name = item[1];
            }else{
                id = (_t.fromServerIdString == '')? item[0] : item[names.indexOf(_t.fromServerIdString.toUpperCase())];
                name = (_t.fromServerNameString == '')? item[1] : item[names.indexOf(_t.fromServerNameString.toUpperCase())];
            }

            data.list.push({id: id, name: name});
        }
        _t.resultWrapper.append(Mustache.to_html(template, data));
        _t.listOfResults = _t.resultWrapper.find('li');
        _t.setHandlers();
    };

    var select3List = new Select3List();
    localStorage.setItem('select3', JSON.stringify([]));
    var initFunction = function(params, callback){
        var instance = new Select3(params);
        select3List.addItem(instance);
        instance.init();
        if(typeof callback == 'function'){
            callback()
        }
        return instance;
    };

    var select3object = {
        list: select3List,
        init: initFunction
    };

    MB.Core.select3 = select3object;

    $.fn.select3 = function(){
        var elem = this;
        var id = MB.Core.guid();
//        var dataObj = [];
//
//        var mO = {
//            id: id,
//            value_id: elem.find('option:selected').attr('value'),
//            value_name: elem.find('option:selected').html(),
//            data: dataObj
//        };

        var selInstance = MB.Core.select3.init({
            id: id,
            type: 'inited',
            wrapper: elem,
            options: elem.find('option'),
            absolutePosition: elem.data('absolute')
        });

        return selInstance;
    };

//    MB.Core.select3.init({
//        id: MB.Core.guid(),
//        wrapper: $('.content-static.main'),
//        getString: "select2_for_query",
//        column_name: "ORDER_TICKET_ID",
//        view_name: "ORDER_TICKET",
//        value: {
//            id: 10,
//            name: "Выбрать"
//        },
//        data: [],
//        fromServerIdString: 'DB_VALUES',
//        fromServerNameString: 'CLIENT_VALUES',
//        searchKeyword: "ORDER_TICKET_ID"
//    });

    //console.log("Select3`s", MB.Core.select3.list);

};

