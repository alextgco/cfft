var classicTable = function(){

    function fixEvent(e) {
        e = e || window.event;

        if (!e.target) e.target = e.srcElement;

        if (e.pageX == null && e.clientX != null ) { // если нет pageX..
            var html = document.documentElement;
            var body = document.body;

            e.pageX = e.clientX + (html.scrollLeft || body && body.scrollLeft || 0);
            e.pageX -= html.clientLeft || 0;

            e.pageY = e.clientY + (html.scrollTop || body && body.scrollTop || 0);
            e.pageY -= html.clientTop || 0;
        }

        if (!e.which && e.button) {
            e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) )
        }

        return e;
    }
    var mouse = {
        isDown: false,
        mouseBtn: 0,
        pageX: 0,
        pageY: 0,
        screenX: 0,
        screenY: 0
    };
    $(document).on('mousedown', function(e){
        e = fixEvent(e);
        mouse.isDown = true;
        mouse.mouseBtn = e.button;
        mouse.pageX = e.pageX;
        mouse.pageY = e.pageY;
        mouse.screenX = e.screenX;
        mouse.screenY = e.screenY;
    });
    $(document).on('mouseup', function(e){
        e = fixEvent(e);
        mouse.isDown = false;
        mouse.mouseBtn = e.button;
        mouse.pageX = e.pageX;
        mouse.pageY = e.pageY;
        mouse.screenX = e.screenX;
        mouse.screenY = e.screenY;
    });
    $(document).on('mousemove', function(e){
        e = fixEvent(e);
        mouse.pageX = e.pageX;
        mouse.pageY = e.pageY;
        mouse.screenX = e.screenX;
        mouse.screenY = e.screenY;
    });

    var TemplateParser = function(tpl, data){
        var result;
        function reParse(tpl,data){
            for(var i in data){
                var key = i;
                var val = data[i];
                var keyWord = '{'+key+'}';
                if(tpl.indexOf(keyWord) != -1){
                    result = tpl.replace(keyWord, val);
                    delete data[i];
                    reParse(result, data);
                }
            }
        }

        reParse(tpl, data);
        return result;
    };
    var CTables = function(){
        this.tables = [];
    };
    var CTable = function(params){
        this.id = params.id || MB.Core.guid();
        this.data = params.data || {};
        this.profile = params.profile || {};
        this.wrapper = params.wrapper || undefined;
        this.isInfoOpened = false;
        this.selectedRowIndex = undefined;
        this.selectedColIndex = undefined;
        this.infoBlock = undefined;
        this.tableWrapper = undefined;
        this.tds = undefined;
        this.infoBlockColumnsTab = undefined;
        this.infoBlockOptionsTab = undefined;
        this.options = params.options || undefined;
        this.selection = [];
        this.parent_id = params.parent_id || undefined;
        this.changes = [];
        this.filterWhere = [];
    };

    CTables.prototype.addItem = function(item){
        this.tables.push(item);
    };

    CTables.prototype.removeItem = function(id){
        for(var i in this.tables){
            var item = this.tables[i];
            if(item.id == id){
                this.tables.splice(i,1);
            }
        }
    };

    CTables.prototype.getTableById = function(id){
        for(var i in this.tables){
            var table = this.tables[i];
            if(table.id == id){
                return table;
            }
        }
    };

    CTable.prototype.getRowDataByIndex = function(index){
        var _t = this;
        return _t.data.DATA[index];
    };

    CTable.prototype.getCurrentRow = function(){
        var _t = this;
        return _t.data.data[_t.selectedRowIndex];
    };

    CTable.prototype.getTypeHtml = function(type, value, editable, name, selId, isTd){
        var _t = this;
        var res = '';

        var quoteSign = (value.indexOf('"') != -1)? "'":'"';

        if(isTd && _t.profile['OBJECT_PROFILE']['MODIFY_COMMAND'] == 'FALSE'){
            editable = 'FALSE';
        }

        if(editable == 'FALSE'){
                if(type == 'checkbox'){
                    var valStr = (value == 'TRUE')? '<i class="fa fa-check"></i>':'<i class="fa fa-times"></i>';
                    res = '<div class="readonlyCell checkboxReadOnly">'+valStr+'</div>';
                }else{
                    if(name == 'BARCODE'){
                        res = '<div class="barCodeCell">'+value+'</div>';
                    }else{
                        res = '<div class="readonlyCell">'+value+'</div>';
                    }
                }
            }else{
                switch (type){
                    case 'text':
                        res = '<input type="text" value='+quoteSign+value+quoteSign+' />';
                        break;
                    case 'like_text':
                        res = '<input class="ct-filter-like-text-wrapper" data-name="'+name+'" type="text" value="" />';
                        break;
                    case 'checkbox':
                        if(isTd){
                            var isChecked = (value == 'TRUE')? 'checked': '';
                            res = '<div class="ct-checkbox-wrapper '+isChecked+'" data-type="inTable" data-id="'+MB.Core.guid()+'" data-name="'+name+'" data-value="'+value+'"></div>';
                        }else{
                            res = '<div class="ct-filter-checkbox-wrapper" data-type="filter" data-id="'+MB.Core.guid()+'" data-name="'+name+'"></div>';
                        }
                        break;
                    case 'number':
                        res = '<input type="number" value='+quoteSign+value+quoteSign+' />';
                        break;
                    case 'datetime':
                        res = '<div class="absoluteWhiteText">'+value+'</div><input type="text" class="datetimepicker" value="'+value+'" />';
                        break;
                    case 'daysweek':
                        res = '<input type="text" data-name="'+name+'" data-id="'+MB.Core.guid()+'" class="ct-daysweek-select3-wrapper daysweekpicker" />';
                        break;
                    case 'daterange':
                        res = '<div data-name="'+name+'" class="input-daterange input-group ct-daterange-wrapper">'+
                                    '<input type="text" class="" name="start" />'+
                                    '<span class="input-group-addon">-</span>'+
                                    '<input type="text" class="" name="end" />'+
                                '</div>';1
                        break;
                    case 'timerange':
                        res = '<div data-name="'+name+'" class="input-daterange input-group ct-timerange-wrapper">'+
                                '<input type="text" class="" name="start" />'+
                                    '<span class="input-group-addon">-</span>'+
                                '<input type="text" class="" name="end" />'+
                            '</div>';
                        break;
                    case 'select2withEmptyValue':
                    res = '<div data-with_empty="true" data-val="'+selId+'" data-title="'+value+'" data-name="'+name+'" class="ct-select3-wrapper preInit">'+value+'<i class="fa fa-angle-down"></i></div>';
                    break;
                case 'select2':
                    res = '<div data-with_empty="false" data-val="'+selId+'" data-title="'+value+'" data-name="'+name+'" class="ct-select3-wrapper preInit">'+value+'<i class="fa fa-angle-down"></i></div>';
                    break;
                case 'colorpicker':
                    res = '<input type="text" class="ct-colorpicker-wrapper" value="'+value+'" /><div  class="ct-colorpicker-state" style="background-color: '+value+'"></div>';
                    break;
                default :
                    res = '<div>type: '+type+' - '+value+'</div>';
                    break;
//            case 'datepicker' :
//                res = '<input type="text" class="datepicker" value="'+value+'"/>';
//                break;
//            case 'colorpicker':
//                res = '<input type="text" class="colorpicker" value="'+value+'" />';
//                break;
//            case 'textarea':
//                res = '<textarea class="ct-textarea">'+value+'</textarea>';
//                break;
//            case 'checkbox':
//                var isChecked = (value)? 'checked="checked"': '';
//                res = '<input type="checkbox" '+isChecked+'/>';
//                break;
//            case 'select':
//                res = '<select class="select3"><option valuelue+'</option></select>';
//                break;
//            case 'input':
//                res = '<input type="text" value="'+value+'" />';
//                break;
            }
        }
        return res;
    };

    CTable.prototype.setHeaderWidth = function(){
//        var _t = this;
//        var table = $('.classicTableWrap[data-id="'+_t.id+'"] table');

//        for(var i=0; i<_t.places.tableFixHeader.find('div').length; i++){
//            var item = _t.places.tableFixHeader.find('div').eq(i);
//            var firstRow = _t.places.tbody.find('tr').eq(0);
//            var tds = firstRow.find('td');
//            var tdW = tds.eq(i)[0].getBoundingClientRect().width;
//            if (i == 0){
//                item.width(tdW+'px');
//            }else{
//                item.width(tdW-1+'px');
//            }
//        }
    };

    CTable.prototype.addChange = function(change){
        var _t = this;
        var formInstance = MB.Tables.getTable(_t.id)['parentObject'];

        var incPKN = change['PRIMARY_KEY_NAMES'];
        var incPKV = change['PRIMARY_KEY_VALUES'];
        var incCCN = change['CHANGED_COLUMN_NAMES'];
        var incCCV = change['CHANGED_COLUMN_VALUES'];
        var incCOM = change['COMMAND'];

        function isEqualArrays(arr1, arr2){
            var isEqual = 0;
            if(arr1.length != arr2.length){
                return false;
            }
            for(var i in arr1){
                var aVal1 = arr1[i];
                var aVal2 = arr2[i];
                if(aVal1 !== aVal2){
                    isEqual+=1;
                }
            }
            return isEqual === 0;
        }

        var added = false;
        for(var i in _t.changes){
            var ch = _t.changes[i];

            if(isEqualArrays(incPKN, ch['PRIMARY_KEY_NAMES']) && isEqualArrays(incPKV, ch['PRIMARY_KEY_VALUES']) && incCOM == ch['COMMAND']){

                if(typeof ch['CHANGED_COLUMN_NAMES'] == 'object' && typeof ch['CHANGED_COLUMN_VALUES'] == 'object'){
                    var inANamesIdx = $.inArray(incCCN, ch['CHANGED_COLUMN_NAMES']);
                    if(inANamesIdx > -1){
                        _t.changes[i]['CHANGED_COLUMN_VALUES'][inANamesIdx] = incCCV;
                        added = true;
                    }else{
                        _t.changes[i]['CHANGED_COLUMN_NAMES'].push(incCCN);
                        _t.changes[i]['CHANGED_COLUMN_VALUES'].push(incCCV);
                        added = true;
                    }
                }else{
                    if(incCCN == ch['CHANGED_COLUMN_NAMES']){
                        _t.changes[i]['CHANGED_COLUMN_VALUES'] = incCCV;
                        added = true;
                    }else{
                        _t.changes[i]['CHANGED_COLUMN_NAMES'] = [_t.changes[i]['CHANGED_COLUMN_NAMES']];
                        _t.changes[i]['CHANGED_COLUMN_VALUES'] = [_t.changes[i]['CHANGED_COLUMN_VALUES']];
                        _t.changes[i]['CHANGED_COLUMN_NAMES'].push(incCCN);
                        _t.changes[i]['CHANGED_COLUMN_VALUES'].push(incCCV);
                        added = true;
                    }
                }
            }
        }
        if(!added){
            _t.changes.push(change);
        }

        if(formInstance){
            formInstance.enableSaveButton();
        }
    };

    CTable.prototype.getSelect3InsertData = function(name){
        var _t = this;
        var result = {};

        function removeSpaces(str){
            if(typeof str == 'string'){
                return str.replace(/\s+/g, '');
            }else{
                return str;
            }
        }

        for(var i in _t.profile.DATA){
            var item = _t.profile.DATA[i];
            if(item[_t.profile.NAMES.indexOf('COLUMN_NAME')] == name){
                result.getString =              item[_t.profile.NAMES.indexOf('LOV_COMMAND')];
                result.column_name =            removeSpaces(item[_t.profile.NAMES.indexOf('LOV_COLUMNS')].split(',')[0]);
                result.view_name =              item[_t.profile.NAMES.indexOf('REFERENCE_CLIENT_OBJECT')];
                result.fromServerIdString =     removeSpaces(item[_t.profile.NAMES.indexOf('LOV_COLUMNS')].split(',')[0]);
                result.fromServerNameString =   removeSpaces(item[_t.profile.NAMES.indexOf('LOV_COLUMNS')].split(',')[1]);
                result.searchKeyword =          removeSpaces(item[_t.profile.NAMES.indexOf('LOV_COLUMNS')].split(',')[1]);
            }
        }
        return result;
    };

    CTable.prototype.update = function(callback){
        var _t = this;

        _t.selection = [];
        var paginationBlock = (+_t.data['INFO']['ROWS_COUNT'] <=  +_t.profile['OBJECT_PROFILE']['ROWS_MAX_NUM'])? 'invisible': '';
        var pagesCount = Math.ceil(+_t.data['INFO']['ROWS_COUNT'] / +_t.profile['OBJECT_PROFILE']['ROWS_MAX_NUM']);
        var result = '';

        for(var i2 in _t.data.DATA){
            var row = _t.data.DATA[i2];
            result += '<tr><td class="frst"><div class="markRow" data-checked="false"><div class="rIdx">'+(+i2+1)+'</div><i class="fa fa-check"></i></div></td>';
            for(var k2 in row){
                var cellName = _t.data.NAMES[k2];
                var cell = row[k2];
                var type =          _t.profile.DATA[k2][_t.profile.NAMES.indexOf('TYPE_OF_EDITOR')];
                var isEditable =    _t.profile.DATA[k2][_t.profile.NAMES.indexOf('EDITABLE')];
                var selId =         row[_t.data.NAMES.indexOf(_t.profile.DATA[k2][_t.profile.NAMES.indexOf('LOV_RETURN_TO_COLUMN')])];
                var isTd =          true;
                if(_t.visibleArray[k2]){
                    result += '<td><div class="tdW">'+_t.getTypeHtml(type, cell, isEditable, cellName, selId, isTd)+'</div></td>';
                }
            }
            result += '</tr>';
        }
        _t.places.tbody.html(result);
        result = '';

        if(paginationBlock == 'invisible'){
            _t.wrapper.find('.ct-pagination-wrapper').addClass(paginationBlock);
        }else{
            _t.wrapper.find('.ct-pagination-wrapper').removeClass('invisible');
            _t.wrapper.find('.ct-pagination-current-input').val(_t.tempPage);
            _t.wrapper.find('.ct-pagination-pagesCount').html('страниц: '+pagesCount);
        }

        _t.setHandlers();
        _t.populateTotalSumms();

        if(typeof callback == 'function'){
            callback();
        }
    };

    CTable.prototype.addWhere = function(where){
        var _t = this;
        var updated = 0;
        for(var i in _t.filterWhere){
            var w = _t.filterWhere[i];
            if(w.name == where.name){
                if(where.value === ''){
                    _t.filterWhere.splice(i,1);
                }else{
                    w.value = where.value;
                }
                updated++;
            }
        }
        if(updated == 0){
            if(where.value != ''){
                _t.filterWhere.push(where);
            }
        }

        //console.log(_t.filterWhere);

    };

    CTable.prototype.renderEnvironment = function(callback){
        var _t = this;
        var tpl = undefined;
        var btnTpl = undefined;
        var btnsMusObj = undefined;
        var btnObj = undefined;

        if(MB.Tables.getTable(_t.id).parent_id == undefined){
            tpl = '<div class="ct-environment-wrapper" data-id="'+_t.id+'">' +
                        '<div class="ct-environment-header">{{tableName}} <span class="ct-total-values-wrapper"></span></div>' +
                        '<div class="ct-environment-buttons"><ul>{{{buttons}}}</ul></div>' +
                        '</div>';

            btnTpl = '{{#btns}}<li class="ct-environment-btn {{className}}">' +
                                    '<div class="nb btn btnDouble {{colorClass}}">'+
                                    '<i class="fa {{iconClass}}"></i><div class="btnDoubleInner">{{title}}</div>'+
                                '</div></li>{{/btns}}';

            btnsMusObj = {btns: []};
            btnObj = undefined;
            if(_t.profile['OBJECT_PROFILE']['NEW_COMMAND'] == 'TRUE'){
                btnObj = {
                    title: 'Создать',
                    colorClass: 'green',
                    iconClass: 'fa-plus',
                    className: 'ct-btn-create-inline'
                };
                btnsMusObj.btns.push(btnObj);
                if(_t.profile['OBJECT_PROFILE']['OPEN_FORM_CLIENT_OBJECT'] != ''){
                    btnObj = {
                        title: 'Создать в форме',
                        colorClass: 'green',
                        iconClass: 'fa-plus',
                        className: 'ct-btn-create-in-form'
                    };
                    btnsMusObj.btns.push(btnObj);
                }

            }
            if(_t.profile['OBJECT_PROFILE']['NEW_COMMAND'] == 'TRUE' && _t.profile['OBJECT_PROFILE']['DUPLICATION_FUNCTION'] == 'TRUE'){
                btnObj = {
                    title: 'Дублировать',
                    colorClass: 'blue',
                    iconClass: 'fa-copy',
                    className: 'ct-btn-duplicate'
                };
                btnsMusObj.btns.push(btnObj);
            }
            if(_t.profile['OBJECT_PROFILE']['REMOVE_COMMAND'] == 'TRUE'){
                btnObj = {
                    title: 'Удалить',
                    colorClass: 'red',
                    iconClass: 'fa-trash-o',
                    className: 'ct-btn-remove'
                };
                btnsMusObj.btns.push(btnObj);
            }

            var data = {
                tableName: _t.profile['OBJECT_PROFILE']['CLIENT_OBJECT_NAME'],
                buttons: Mustache.to_html(btnTpl, btnsMusObj)
            };
            _t.wrapper.prepend(Mustache.to_html(tpl, data));
        }else{
            var tpl = '<div class="ct-environment-wrapper" data-id="'+_t.id+'">' +
                '<div class="ct-environment-header">{{{tableName}}} <span class="ct-total-values-wrapper"></span></div>' +
                '<div class="ct-environment-buttons"><ul>{{{buttons}}}</ul></div>' +
                '</div>';

            var btnTpl = '{{#btns}}<li class="ct-environment-btn {{className}}">' +
                '<div class="nb btn btnDouble {{colorClass}}">'+
                '<i class="fa {{iconClass}}"></i><div class="btnDoubleInner">{{title}}</div>'+
                '</div></li>{{/btns}}';

            var btnsMusObj = {btns: []};
            var btnObj = undefined;
            if(_t.profile['OBJECT_PROFILE']['NEW_COMMAND'] == 'TRUE'){
                btnObj = {
                    title: 'Создать',
                    colorClass: 'green',
                    iconClass: 'fa-plus',
                    className: 'ct-btn-create-inline'
                };
                btnsMusObj.btns.push(btnObj);
            }
            if(_t.profile['OBJECT_PROFILE']['NEW_COMMAND'] == 'TRUE' && _t.profile['OBJECT_PROFILE']['DUPLICATION_FUNCTION'] == 'TRUE'){
                btnObj = {
                    title: 'Дублировать',
                    colorClass: 'blue',
                    iconClass: 'fa-copy',
                    className: 'ct-btn-duplicate'
                };
                btnsMusObj.btns.push(btnObj);
            }
            if(_t.profile['OBJECT_PROFILE']['REMOVE_COMMAND'] == 'TRUE'){
                btnObj = {
                    title: 'Удалить',
                    colorClass: 'red',
                    iconClass: 'fa-trash-o',
                    className: 'ct-btn-remove'
                };
                btnsMusObj.btns.push(btnObj);
            }

            var data = {
                tableName: (btnsMusObj.btns.length > 0)? '&nbsp;':'', //_t.profile['OBJECT_PROFILE']['CLIENT_OBJECT_NAME']
                buttons: Mustache.to_html(btnTpl, btnsMusObj)
            };
            _t.wrapper.prepend(Mustache.to_html(tpl, data));
        }

        if(typeof callback == 'function'){
            callback();
        }
    };

    CTable.prototype.render = function(callback){
        var _t = this;

        _t.tempPage = _t.tempPage || 1;
        _t.visibleArray = [];
        _t.selection = [];
        var isFastSearch = false;
        for(var v in _t.profile.DATA){
            var vItem = _t.profile.DATA[v];
            var isVisible = vItem[_t.profile.NAMES.indexOf('VISIBLE')] == 'TRUE';
            var isQuer = vItem[_t.profile.NAMES.indexOf('QUERABLE')] == 'TRUE';
            _t.visibleArray.push(isVisible);
            if(isQuer){
                isFastSearch = true;
            }

        }

        var result = '';
        var filterHtml = '';
        var fh_res = '';
        var container = _t.wrapper;
        var paginationBlock = (+_t.data['INFO']['ROWS_COUNT'] <=  +_t.profile['OBJECT_PROFILE']['ROWS_MAX_NUM'])? 'invisible': '';
        var pagesCount = Math.ceil(+_t.data['INFO']['ROWS_COUNT'] / +_t.profile['OBJECT_PROFILE']['ROWS_MAX_NUM']);
        var inlineSaveBtn = (_t.profile['OBJECT_PROFILE']['NEW_COMMAND'] == 'TRUE' || _t.profile['OBJECT_PROFILE']['MODIFY_COMMAND'] == 'TRUE')? (MB.Tables.getTable(_t.id).parent_id == undefined)? '<div class="ct-options-item ct-options-save"><i class="fa fa-save"></i>&nbsp;&nbsp;Сохранить</div>': '': '';
        var fastSearchHtml = (isFastSearch)? '<div class="ct-fast-search-wrapper"><input class="ct-fast-search" type="text" placeholder="Быстрый поиск..."/></div>' : '' ;
        var isFilters = false;
        for(var isF in _t.profile.DATA){
            var fItem = _t.profile.DATA[isF];
            var filterType = fItem[_t.profile.NAMES.indexOf('FILTER_TYPE')];
            if(filterType != ''){
                isFilters = true;
                break;
            }
        }

        var filterContainer = (isFilters)? '<ul class="ct-filter-list row"></ul><div class="ct-clear-filter"><i class="fa fa-ban"></i></div><div class="ct-confirm-filter"><i class="fa fa-check"></i></div>': '';
        var filterInvisible = (isFilters)? '':'hidden';

        var html = '<div class="classicTableWrap" data-id="'+_t.id+'">' +
                    '<div class="ct-filter">' + filterContainer + '</div>' +
                    '<div class="classicTableFunctional">' +
                        '<div class="ct-pagination-wrapper '+paginationBlock+'">' +
                            '<div class="ct-pagination-item ct-pagination-prev"><i class="fa fa-angle-left"></i></div>' +
                            '<div class="ct-pagination-current"><input type="text" class="ct-pagination-current-input" value="'+_t.tempPage+'"/></div>' +
                            '<div class="ct-pagination-item ct-pagination-next"><i class="fa fa-angle-right"></i></div>' +
                            '<div class="ct-pagination-pagesCount">Страниц: ' + pagesCount + '</div>'+
                        '</div>' +

                        fastSearchHtml +

                        '<div class="ct-notify-wrapper"></div>' +
                        '<div class="ct-options-wrapper">' +
                            inlineSaveBtn +
                            '<div class="ct-options-item ct-options-filter '+filterInvisible+'"><i class="fa fa-filter"></i>&nbsp;Фильтры</div>' +
                            '<div class="ct-options-item ct-options-excel"><i class="fa fa-cogs"></i></div>' +
                            '<div class="ct-options-item ct-options-reload"><i class="fa fa-refresh"></i></div>' +
                        '</div>' +
                        '<div class="ct-functional-dd">' +
                            '<ul class="ct-functional-list">' +
                                '<li class="exportToExcel"><i class="fa fa-download"></i>&nbsp;Выгрузить в excel</li>' +
                                '<li class="sendExcelToEmail"><i class="fa fa-envelope-o"></i>&nbsp;Отправить excel на почту</li>' +
                            '</ul>' +
                            '<div class="ct-functional-close"><i class="fa fa-times"></i></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="ct-fader"></div>' +
                    '<div class="tableWrapper"><div class="tableFixHeader"></div><table class="classicTable"><thead><tr></tr></thead><tbody></tbody></table></div>' +
                    '<div class="classicTableInfo" data-id="'+_t.id+'">' +
                        '<div class="closeTableInfo"></div>'+
                        '<div class="tabs-wrapper">' +
                            '<div class="tabs-row">' +
                                '<div class="tab-btn active" data-id="columns">Колонки</div>'+
                                '<div class="tab-btn" data-id="options">Опции</div>'+
                            '</div>'+
                            '<div class="tabs-contents">' +
                                '<div class="tab active" data-id="columns"></div>' +
                                '<div class="tab" data-id="options"></div>' +
                            '</div>'+
                        '</div>'+
                    '</div></div>';

        container.html(html);

        var table = $('.classicTableWrap[data-id="'+_t.id+'"] table');
        _t.classicTableWrap = $('.classicTableWrap[data-id="'+_t.id+'"]');

        _t.places = {
            theadRow: table.find('thead tr'),
            tbody: table.find('tbody'),
            tableFixHeader: table.parents('.classicTableWrap').find('.tableFixHeader'),
            filterList: $('.classicTableWrap[data-id="'+_t.id+'"] .ct-filter-list'),
            fastSearch: $('.classicTableWrap[data-id="'+_t.id+'"] input.ct-fast-search')
        };


        result += '<th>+</th>';
        fh_res += '<div>+</div>';

        for(var i in _t.profile.DATA){
            var name = _t.profile.DATA[i][_t.profile.NAMES.indexOf("NAME")];

            if(_t.visibleArray[i]){
                result += '<th><div class="thInner"><div class="wSet">'+name+'</div><i class="fa sortIcon desc fa-caret-up"></i><i class="fa sortIcon asc fa-caret-down"></i><div class="swr"></div></div></th>';
                fh_res += '<div>'+name+'</div>';
            }
        }
        _t.places.theadRow.html(result);
        _t.places.tableFixHeader.html(fh_res);
        result = '';
        fh_res = '';

        for(var i2 in _t.data.DATA){
            var row = _t.data.DATA[i2];
            result += '<tr><td class="frst"><div class="markRow" data-checked="false"><div class="rIdx">'+(+i2+1)+'</div><i class="fa fa-check"></i></div></td>';
            for(var k2 in row){
                var cellName = _t.data.NAMES[k2];
                var cell = row[k2];
                var type =          _t.profile.DATA[k2][_t.profile.NAMES.indexOf('TYPE_OF_EDITOR')];
                var isEditable =    _t.profile.DATA[k2][_t.profile.NAMES.indexOf('EDITABLE')];
                var selId =         row[_t.data.NAMES.indexOf(_t.profile.DATA[k2][_t.profile.NAMES.indexOf('LOV_RETURN_TO_COLUMN')])];
                var isTd  =         true;
                if(_t.visibleArray[k2]){
                    result += '<td><div class="tdW">'+_t.getTypeHtml(type, cell, isEditable, cellName, selId, isTd)+'</div></td>';
                }
            }
            result += '</tr>';
        }
        _t.places.tbody.html(result);

        console.log('data inserted', new Date(), new Date().getMilliseconds());

        if(isFilters){
            var checkboxesFilterHtml = '';
            for(var f in _t.profile.DATA){
                var fItem = _t.profile.DATA[f];
                var filterType = fItem[_t.profile.NAMES.indexOf('FILTER_TYPE')];
                if(filterType != ''){
                    var fName = fItem[_t.profile.NAMES.indexOf('COLUMN_NAME')];
                    var fNameRu = (fItem[_t.profile.NAMES.indexOf('FILTER_LABEL')] != '')? fItem[_t.profile.NAMES.indexOf('FILTER_LABEL')] : fItem[_t.profile.NAMES.indexOf('NAME')];
                    var fSelId = fItem[_t.profile.NAMES.indexOf('COLUMN_NAME')];
                    if(filterType == 'checkbox'){
                        checkboxesFilterHtml += '<li data-name="'+fName+'" class="filterItem col-md-3" data-filterType="'+filterType+'" ><div class="filterTitle">'+fNameRu+':</div>'+_t.getTypeHtml(filterType, '', true, fName, fSelId, false)+'</li>';
                    }else{
                        filterHtml += '<li data-name="'+fName+'" class="filterItem col-md-3" data-filterType="'+filterType+'" ><div class="filterTitle">'+fNameRu+':</div>'+_t.getTypeHtml(filterType, '', true, fName, fSelId, false)+'</li>';
                    }

                }
            }
            _t.places.filterList.html(filterHtml + checkboxesFilterHtml);
        }



        _t.wrapper.find('.ct-filter div.ct-select3-wrapper').each(function(index, elem){
            var sVal = $(elem).data('val');
            var sName = $(elem).data('title');
            var select3Data = _t.getSelect3InsertData($(elem).attr('data-name'));

            var selInstance = MB.Core.select3.init({
                id: MB.Core.guid(),
                wrapper: $(elem),
                getString: select3Data.getString,
                column_name: select3Data.column_name,
                view_name: select3Data.view_name,
                value: {
                    id: sVal,
                    name: sName
                },
                data: [],
                fromServerIdString: select3Data.fromServerIdString,
                fromServerNameString: select3Data.fromServerNameString,
                searchKeyword: select3Data.searchKeyword,
                withEmptyValue: true,
                absolutePosition: false,
                isFilter: true,
                filterColumnName: $(elem).attr('data-name'),
                filterClientObject: _t.profile['OBJECT_PROFILE']['CLIENT_OBJECT']
            });

            $(selInstance).on('changeVal', function(e, was, now){
                var filterType = selInstance.wrapper.parents('li.filterItem').eq(0).attr('data-filterType');
                var filterName = selInstance.wrapper.data('name');
                var filterValue = selInstance.wrapper.data('val');

                var wObj = {
                    name: (filterValue == '')? filterName : filterValue,
                    value: now.id,
                    type: filterType
                };
                _t.addWhere(wObj);
            });
        });

        _t.wrapper.find('.ct-filter input.ct-daysweek-select3-wrapper').each(function(index, elem){
            var daysweekpickerInstance = $(elem).daysweekpicker();
            $(daysweekpickerInstance).on('changeDays', function(){
                var wObj = {
                    name: $(elem).data('name'),
                    value: this.value,
                    type: 'daysweek'
                };
                _t.addWhere(wObj);
            });
        });

        _t.wrapper.find('.ct-filter div.ct-daterange-wrapper').each(function(index, elem){
            var fromInp = $(elem).find('input[name="start"]');
            var toInp = $(elem).find('input[name="end"]');
            var columnName = $(elem).attr('data-name');
            var columnProfile = [];

            for(var i in _t.profile.DATA){
                var pI = _t.profile.DATA[i];
                if(pI[_t.profile.NAMES.indexOf('COLUMN_NAME')] == columnName){
                    columnProfile = pI;
                }
            }

            var filterColumnName = (columnProfile[_t.profile.NAMES.indexOf('TABLE_COLUMN_NAME')] != '')? columnProfile[_t.profile.NAMES.indexOf('TABLE_COLUMN_NAME')] : columnName;

            fromInp.datetimepicker({
                format: "dd.mm.yyyy hh:ii",
                autoclose: true,
                todayHighlight: true,
                //startDate: new Date,
                minuteStep: 10,
                keyboardNavigation: true,
                todayBtn: true,
                firstDay: 1,
                weekStart: 1,
                language: "ru"
            }).off('changeDate').on('changeDate', function(){

                var wValue = (fromInp.val() == '' && toInp.val() == '')? '': {from: fromInp.val(), to: toInp.val()} ;
                var wObj = {
                    name: filterColumnName,
                    value: wValue,
                    type: 'daterange'
                };
                _t.addWhere(wObj);
            });
            toInp.datetimepicker({
                format: "dd.mm.yyyy hh:ii",
                autoclose: true,
                todayHighlight: true,
                //startDate: new Date,
                minuteStep: 10,
                keyboardNavigation: true,
                todayBtn: true,
                firstDay: 1,
                weekStart: 1,
                language: "ru"
            }).off('changeDate').on('changeDate', function(){

                var wValue = (fromInp.val() == '' && toInp.val() == '')? '': {from: fromInp.val(), to: toInp.val()} ;

                var wObj = {
                    name: filterColumnName,
                    value: wValue,
                    type: 'daterange'
                };
                _t.addWhere(wObj);
            });

        });

        _t.wrapper.find('.ct-filter div.ct-timerange-wrapper').each(function(index, elem){
            var fromInp = $(elem).find('input[name="start"]');
            var toInp = $(elem).find('input[name="end"]');
            var columnName = $(elem).attr('data-name');

            fromInp.clockpicker({
                align: 'left',
                donetext: 'Выбрать',
                autoclose: true,
                afterDone: function(){
                    fromInp.removeClass('invalid');
                    var wValue = (fromInp.val() == '' && toInp.val() == '')? '': {from: fromInp.val(), to: toInp.val()} ;
                    var wObj = {
                        name: columnName,
                        value: wValue,
                        type: 'timerange'
                    };
                    _t.addWhere(wObj);
                }
            });

            toInp.clockpicker({
                align: 'left',
                donetext: 'Выбрать',
                autoclose: true,
                afterDone: function(){
                    toInp.removeClass('invalid');
                    var wValue = (fromInp.val() == '' && toInp.val() == '')? '': {from: fromInp.val(), to: toInp.val()} ;
                    var wObj = {
                        name: columnName,
                        value: wValue,
                        type: 'timerange'
                    };
                    _t.addWhere(wObj);
                }
            });
        });

        _t.wrapper.find('.ct-filter-checkbox-wrapper').each(function(index,elem){
            var checkboxInstance = $(elem).checkboxIt();
            $(checkboxInstance).off('toggleCheckbox').on('toggleCheckbox', function(){
                var wObj = {
                    name: $(elem).data('name'),
                    value: this.value,
                    type: 'checkbox'
                };
                _t.addWhere(wObj);
            });
        });

        _t.wrapper.find('.ct-filter input.ct-filter-like-text-wrapper').each(function(index, elem){
            var columnName = $(elem).attr('data-name');
            var wObj = {
                name: columnName,
                value: $(elem).val(),
                type: 'like_text'
            };
            _t.addWhere(wObj);
        });


        console.log('filters inserted and inited', new Date(), new Date().getMilliseconds());

        result = '';
        if(_t.wrapper.find('.ct-filter .filterItem').length == 0){
            _t.wrapper.find('.classicTableFunctional').css('marginTop', -15+'px');
        }else{
            _t.wrapper.find('.classicTableFunctional').css('marginTop', '-'+(Math.ceil(_t.wrapper.find('.ct-filter .filterItem').length / 4) * 65+7)+'px');
        }


        _t.renderEnvironment();
        _t.populateTotalSumms();
        _t.setHandlers();



        console.log('handlers setted', new Date(), new Date().getMilliseconds());
        if(typeof callback == 'function'){
            callback();
        }

    };

    CTable.prototype.notify = function(params){
        var _t = this;
        var container = _t.wrapper.find('.ct-notify-wrapper');
        /**
         * params
         * type: bool show / hide
         * text: string
         */
        if(params.type){
            container.html(params.text).show(0).animate({
                opacity: 1
            },150);
        }else{
            container.html('').animate({
                opacity: 0
            }, 150, function(){
                container.hide(150);
            });
        }
    };

    CTable.prototype.renderSelection = function(){
        var _t = this;

        _t.wrapper.find('tbody tr').removeClass('selectedRow');
        _t.wrapper.find('tbody tr div.markRow').attr('data-checked', 'false');

        for(var i in _t.selection){
            _t.wrapper.find('tbody tr').eq(_t.selection[i]).addClass('selectedRow');
            _t.wrapper.find('tbody tr').eq(_t.selection[i]).find('div.markRow').attr('data-checked', 'true');
        }
    };

    CTable.prototype.setHandlers = function(){
        var _t = this;
        var visArr = [];

        for(var i in _t.profile.DATA){
            var pI = _t.profile.DATA[i];
            if(pI[_t.profile.NAMES.indexOf('VISIBLE')] == 'TRUE'){
                visArr.push(pI);
            }
        }

        _t.places.tbody.find('.barCodeCell').each(function(index, elem){
            $(elem).append('<div class="showBarcode">'+DrawCode39Barcode($(elem).html(),0)+'</div>');
        });

        _t.places.tbody.find('div.ct-select3-wrapper').each(function(index, elem){

            $(elem).off('click').on('click', function(){
                if(!$(elem).attr('inited')){
                    var sVal = $(elem).data('val');
                    var sName = $(elem).data('title');

                    var select3Data = _t.getSelect3InsertData($(elem).attr('data-name'));
                    var selInstance = MB.Core.select3.init({
                        id: MB.Core.guid(),
                        wrapper: $(elem),
                        getString: select3Data.getString,
                        column_name: select3Data.column_name,
                        view_name: select3Data.view_name,
                        value: {
                            id: sVal,
                            name: sName
                        },
                        data: [],
                        fromServerIdString: select3Data.fromServerIdString,
                        fromServerNameString: select3Data.fromServerNameString,
                        searchKeyword: select3Data.searchKeyword,
                        withEmptyValue: ($(elem).attr('data-with_empty') == 'true'),
                        absolutePosition: true
                    });

                    $(selInstance).on('changeVal', function(e, was, now){
                        var rowIndex = $(elem).parents('tr').index();
                        var colIndex = $(elem).parents('td').index();
                        var isNew = $(elem).parents('tr').hasClass('new_row');
                        var newRowId = $(elem).parents('tr').data('id');

                        function getPKValues(){
                            var res = [];
                            for(var i in _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')){
                                var item = _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')[i];
                                if(isNew){
                                    res.push('NEW_ROW_'+newRowId);
                                }else{
                                    res.push(_t.data.DATA[rowIndex][_t.data.NAMES.indexOf(item)]);
                                }
                            }
                            return res;
                        }

                        function getColumnNameByIndex(idx){
                            var tempArr = [];

                            for(var i in _t.visibleArray){
                                var isVis = _t.visibleArray[i];
                                if(isVis){
                                    tempArr.push(_t.profile.DATA[i]);
                                }
                            }

                            return tempArr[idx][_t.profile.NAMES.indexOf('LOV_RETURN_TO_COLUMN')];
                        }

                        var chObj = {
                            PRIMARY_KEY_NAMES: _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(','),
                            PRIMARY_KEY_VALUES: getPKValues(),
                            CHANGED_COLUMN_NAMES: getColumnNameByIndex(colIndex-1),
                            CHANGED_COLUMN_VALUES: now.id
                        };

                        chObj['COMMAND'] = ($(elem).parents('tr').hasClass('new_row'))? 'NEW': 'MODIFY';

                        selInstance.wrapper.parents('tr').addClass('edited');
                        _t.addChange(chObj);
                    });

                    $(elem).attr('inited', 'true');
                    $(elem).removeClass('preInit');
                    $(elem).addClass('transparent');
                    selInstance.byClickSelect();
                }
            });


        });

        _t.places.tbody.find('div.ct-checkbox-wrapper').each(function(index, elem){

            var checkboxInstance = $(elem).checkboxIt();
            var rowIndex = $(this).parents('tr').index();
            var colIndex = $(this).parents('td').index();
            var isNew = $(this).parents('tr').hasClass('new_row');                         
            var newRowId = $(this).parents('tr').data('id');

            $(checkboxInstance).off('toggleCheckbox').on('toggleCheckbox', function(){


                function getPKValues(){
                    var res = [];
                    for(var i in _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')){
                        var item = _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')[i];
                        if(isNew){
                            res.push('NEW_ROW_'+newRowId);
                        }else{
                            res.push(_t.data.DATA[rowIndex][_t.data.NAMES.indexOf(item)]);
                        }
                    }
                    return res;
                }

                function getColumnNameByIndex(idx){
                    var tempArr = [];

                    for(var i in _t.visibleArray){
                        var isVis = _t.visibleArray[i];
                        if(isVis){
                            tempArr.push(_t.profile.DATA[i]);
                        }
                    }

                    return tempArr[idx][_t.profile.NAMES.indexOf('COLUMN_NAME')];
                }

                var chObj = {
                    PRIMARY_KEY_NAMES: _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(','),
                    PRIMARY_KEY_VALUES: getPKValues(),
                    CHANGED_COLUMN_NAMES: getColumnNameByIndex(colIndex-1),
                    CHANGED_COLUMN_VALUES: (checkboxInstance.value)? 'TRUE': 'FALSE'
                };

                chObj['COMMAND'] = ($(this).parents('tr').hasClass('new_row'))? 'NEW': 'MODIFY';

                _t.tableWrapper.find('tr').eq(rowIndex+1).addClass('edited');
                _t.addChange(chObj);
            });
        });

        _t.places.tbody.find('input.ct-colorpicker-wrapper').each(function(index, elem){

            var rowIndex = $(this).parents('tr').index();
            var colIndex = $(this).parents('td').index();
            var colorPickerInstance = $(elem).colorpicker();
            var stateView = $(elem).parents('td').eq(0).find('.ct-colorpicker-state');
            var isNew = $(this).parents('tr').hasClass('new_row');                         
            var newRowId = $(this).parents('tr').data('id');

            colorPickerInstance.off('changeColor').on('changeColor', function(e){

                stateView.css('backgroundColor', e.color.toHex());

                function getPKValues(){
                    var res = [];
                    for(var i in _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')){
                        var item = _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')[i];
                        if(isNew){
                            res.push('NEW_ROW_'+newRowId);
                        }else{
                            res.push(_t.data.DATA[rowIndex][_t.data.NAMES.indexOf(item)]);
                        }
                    }
                    return res;
                }

                function getColumnNameByIndex(idx){
                    var tempArr = [];

                    for(var i in _t.visibleArray){
                        var isVis = _t.visibleArray[i];
                        if(isVis){
                            tempArr.push(_t.profile.DATA[i]);
                        }
                    }

                    return tempArr[idx][_t.profile.NAMES.indexOf('COLUMN_NAME')];
                }

                var chObj = {
                    PRIMARY_KEY_NAMES: _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(','),
                    PRIMARY_KEY_VALUES: getPKValues(),
                    CHANGED_COLUMN_NAMES: getColumnNameByIndex(colIndex-1),
                    CHANGED_COLUMN_VALUES: e.color.toHex()
                };

                chObj['COMMAND'] = ($(this).parents('tr').hasClass('new_row'))? 'NEW': 'MODIFY';

                _t.tableWrapper.find('tr').eq(rowIndex+1).addClass('edited');
                _t.addChange(chObj);
            });
        });

        _t.places.tbody.find('input.datetimepicker').each(function(index, elem){
            $(elem).on('click', function(){

                $('.datetimepicker.dropdown-menu').hide(0);

                if(!$(elem).attr('inited')){
                    $(elem).datetimepicker({
                        format: "dd.mm.yyyy hh:ii",
                        autoclose: true,
                        todayHighlight: true,
                        minuteStep: 10,
                        keyboardNavigation: false,
                        todayBtn: true,
                        firstDay: 1,
                        weekStart: 1,
                        language: "ru"
                    }).datetimepicker('show');
                }
            });

        });

        _t.places.theadRow.find('th').each(function(index, elem){
            var th = $(elem);
            th.off('click').on('click', function(e){
                if(!$(e.target).hasClass('swr') && !$(e.target).parents('.swr').length > 0){
                    _t.places.theadRow.find('th').not($(this)).removeClass('asc').removeClass('desc');
                    var colIndex = $(this).index();

                    var colName = (visArr[colIndex-1][_t.profile.NAMES.indexOf('TABLE_COLUMN_NAME')] != '')? visArr[colIndex-1][_t.profile.NAMES.indexOf('TABLE_COLUMN_NAME')] : visArr[colIndex-1][_t.profile.NAMES.indexOf('COLUMN_NAME')];

                    if($(this).hasClass('desc') || $(this).hasClass('asc')){

                        if($(this).hasClass('desc')){

                            _t.order_by = colName;

                            $(this).removeClass('desc');
                            $(this).addClass('asc');
                        }else{

                            _t.order_by = colName+ ' desc';

                            $(this).removeClass('asc');
                            $(this).addClass('desc');
                        }
                    }else{

                        $(this).addClass('asc');
                        _t.order_by = colName;
                    }
                    console.log(_t.order_by);

                    MB.Tables.getTable(_t.id).reload();
                }
            });
        });

        _t.infoBlock = _t.wrapper.find('.classicTableInfo');
        _t.infoBlockColumnsTab = _t.infoBlock.find('.tab[data-id="columns"]');
        _t.infoBlockOptionsTab = _t.infoBlock.find('.tab[data-id="options"]');
        _t.tableWrapper = _t.wrapper.find('.tableWrapper');
        _t.tds = _t.wrapper.find('tbody td');
        _t.markRow = _t.wrapper.find('.markRow');


        _t.places.fastSearch.off('input').on('input', function(){
            var value = $(this).val();
            var whereStr = '( ';
            var queryColls = [];
            if(value.length > 1){
                for(var i in _t.profile.DATA){
                    var col = _t.profile.DATA[i];
                    var isQuer = col[_t.profile.NAMES.indexOf('QUERABLE')] == 'TRUE';
                    if(isQuer){
                        queryColls.push(col[_t.profile.NAMES.indexOf('COLUMN_NAME')]);
                    }
                }
                for(var k in queryColls){
                    var collName = queryColls[k];
                    var orStr = (k == queryColls.length-1)? '' : ' or ';
                    whereStr += "upper("+collName+") like '%"+value.toUpperCase()+"%'"+orStr;
                }
                whereStr += ' )';

                MB.Tables.getTable(_t.id).fastSearchWhere = whereStr;
                MB.Tables.getTable(_t.id).tempPage = 1;
                MB.Tables.getTable(_t.id).reload();
            }else{
                if(value == ''){
                    MB.Tables.getTable(_t.id).fastSearchWhere = '';
                    MB.Tables.getTable(_t.id).tempPage = 1;
                    MB.Tables.getTable(_t.id).reload();
                }
            }

        });

        _t.markRow.off('click').on('click', function(e){
            var isChecked = $(this).attr('data-checked') == 'true';

            _t.selectedRowIndex = $(this).parents('tr').eq(0).index();
            _t.selectedColIndex = $(this).index();

            var inArr = _t.selection.indexOf(_t.selectedRowIndex);
            var lastSelected = _t.selection[_t.selection.length-1];

            if(!isChecked){

                if(MB.keys['16'] === true){
                    if(lastSelected <= _t.selectedRowIndex){
                        for(var i = +lastSelected; i<= +_t.selectedRowIndex; i++){
                            if(_t.selection.indexOf(i) != -1){
                                continue;
                            }
                            _t.selection.push(i);
                        }
                    }else{
                        for(var k = +lastSelected; k >= +_t.selectedRowIndex; k--){
                            if(_t.selection.indexOf(k) != -1){
                                continue;
                            }
                            _t.selection.push(k);
                        }
                    }
                }else{
                    _t.selection.push(_t.selectedRowIndex);
                }
            }else{
                _t.selection.splice(inArr,1);
            }
            _t.renderSelection();
        });

        _t.tds.off('contextmneu').on('contextmenu', function(e, other, tEvent){
            e = e || window.event;
            e.preventDefault();
            if(!_t.ctxMenuData){
                return;
            }

            if(other == 'triggered'){
                e.clientX = tEvent.clientX;
                e.clientY = tEvent.clientY;
            }

            _t.selectedRowIndex = $(this).parents('tr').eq(0).index();

            if(_t.selection.length > 0){
                if(_t.selection.length > 1){
                    if(_t.selection.indexOf(_t.selectedRowIndex) == -1){
                        $(this).click();
                    }
                }else{
                    $(this).click();
                }
            }else{
                $(this).click();
            }

            var wrapperPosition = _t.wrapper[0].getBoundingClientRect();
            var top = e.clientY - wrapperPosition.top +4;
            var left = e.clientX - wrapperPosition.left +4;



            var ctxMenuTpl = '<div class="ctxMenu-wrapper"><ul class="ctxMenu-list">{{#items}}<li class="ctxMenu-item {{#disabled}}disabled{{/disabled}}" data-name="{{name}}">{{{title}}}</li>{{/items}}</ul></div>';
            var mObj = {};
            mObj.items = [];
            for(var i in _t.ctxMenuData){
                var item = _t.ctxMenuData[i];
                mObj.items.push({
                    name: item.name,
                    title: item.title,
                    disabled: item.disabled()
                });
            }
            _t.wrapper.find('.ctxMenu-wrapper').remove();
            _t.wrapper.append(Mustache.to_html(ctxMenuTpl, mObj));


            function runCtxCallback(name){
                for(var c in _t.ctxMenuData){
                    if(_t.ctxMenuData[c].name == name){
                        _t.ctxMenuData[c].callback();
                    }
                }
            }

            _t.wrapper.find('.ctxMenu-item').each(function(idx, elem){
                $(elem).off('click').on('click', function(){
                    if($(elem).hasClass('disabled')){
                        return;
                    }
                    var name = $(elem).attr('data-name');
                    runCtxCallback(name);
                    _t.wrapper.find('.ctxMenu-wrapper').remove();
                });
            });
            _t.wrapper.find('.ctxMenu-wrapper').css('top', top+'px').css('left', left+'px');
        });

        _t.tds.off('dblclick').on('dblclick', function(){
            //$(this).addClass('selectedTd');
            console.log($(this).text());
        });

        _t.tds.on('click', function(e){
            e = e || window.event;
            _t.wrapper.find('.tableWrapper').removeClass('preventSelection');
            if($(e.target).parents('.frst').length > 0 || $(e.target).hasClass('frst')){
                return;
            }
            var isShift = (MB.keys['16'] === true);
            var isCtrl = (MB.keys['17'] === true);
            var lastSelected = _t.selection[_t.selection.length-1];

            _t.selectedRowIndex = $(this).parent('tr').index();
            _t.selectedColIndex = $(this).index();

            if(isCtrl || isShift){
                if(isCtrl){

                    var inSel = _t.selection.indexOf(_t.selectedRowIndex);

                    if(inSel == -1){
                        _t.selection.push(_t.selectedRowIndex);
                    }else{
                        _t.selection.splice(inSel, 1);
                    }

                }else if(isShift){
                    _t.wrapper.find('.tableWrapper').addClass('preventSelection');
                    if(lastSelected <= _t.selectedRowIndex){
                        for(var i = +lastSelected; i<= +_t.selectedRowIndex; i++){
                            if(_t.selection.indexOf(i) != -1){
                                continue;
                            }
                            _t.selection.push(i);
                        }
                    }else{
                        for(var k = +lastSelected; k >= +_t.selectedRowIndex; k--){
                            if(_t.selection.indexOf(k) != -1){
                                continue;
                            }
                            _t.selection.push(k);
                        }
                    }

                }
            }else{
                _t.selection = [_t.selectedRowIndex];
            }
            _t.renderSelection();
            //_t.wrapper.find('.tableWrapper').removeClass('preventSelection');
        });

        _t.tds.find('input[type="text"]').off('input').on('input', function(){
            _t.selectedRowIndex = $(this).parents('tr').index();
            _t.selectedColIndex = $(this).parents('td').index();

            var rowIndex = $(this).parents('tr').index();
            var colIndex = $(this).parents('td').index();
            var isNew = $(this).parents('tr').hasClass('new_row');                         
            var newRowId = $(this).parents('tr').data('id');

            function getPKValues(){
                var res = [];
                for(var i in _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')){
                    var item = _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')[i];
                    if(isNew){
                        res.push('NEW_ROW_'+newRowId);
                    }else{
                        res.push(_t.data.DATA[rowIndex][_t.data.NAMES.indexOf(item)]);
                    }
                }
                return res;
            }

            function getColumnNameByIndex(idx){
                var tempArr = [];

                for(var i in _t.visibleArray){
                    var isVis = _t.visibleArray[i];
                    if(isVis){
                        tempArr.push(_t.profile.DATA[i]);
                    }
                }

                return tempArr[idx][_t.profile.NAMES.indexOf('COLUMN_NAME')];
            }

            var chObj = {
                PRIMARY_KEY_NAMES: _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(','),
                PRIMARY_KEY_VALUES: getPKValues(),
                CHANGED_COLUMN_NAMES: getColumnNameByIndex(colIndex-1),
                CHANGED_COLUMN_VALUES: $(this).val()
            };

            chObj['COMMAND'] = ($(this).parents('tr').hasClass('new_row'))? 'NEW': 'MODIFY';

            _t.tableWrapper.find('tr').eq(rowIndex+1).addClass('edited');
            _t.addChange(chObj);
        });

        _t.tds.find('input[type="checkbox"]').off('change').on('change', function(){
            var rowIndex = $(this).parents('tr').index();
            var colIndex = $(this).parents('td').index();
            var isNew = $(this).parents('tr').hasClass('new_row');                         
            var newRowId = $(this).parents('tr').data('id');

            function getPKValues(){
                var res = [];
                for(var i in _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')){
                    var item = _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')[i];
                    if(isNew){
                        res.push('NEW_ROW_'+newRowId);
                    }else{
                        res.push(_t.data.DATA[rowIndex][_t.data.NAMES.indexOf(item)]);
                    }
                }
                return res;
            }

            function getColumnNameByIndex(idx){
                var tempArr = [];

                for(var i in _t.visibleArray){
                    var isVis = _t.visibleArray[i];
                    if(isVis){
                        tempArr.push(_t.profile.DATA[i]);
                    }
                }

                return tempArr[idx][_t.profile.NAMES.indexOf('COLUMN_NAME')];
            }

            var chObj = {
                PRIMARY_KEY_NAMES: _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(','),
                PRIMARY_KEY_VALUES: getPKValues(),
                CHANGED_COLUMN_NAMES: getColumnNameByIndex(colIndex-1),
                CHANGED_COLUMN_VALUES: ($(this)[0].checked)? 'TRUE':'FALSE'
            };

            chObj['COMMAND'] = ($(this).parents('tr').hasClass('new_row'))? 'NEW': 'MODIFY';

            _t.tableWrapper.find('tr').eq(rowIndex+1).addClass('edited');
            _t.addChange(chObj);
        });

        _t.tds.find('input[type="number"]').off('input').on('input', function(){
            var rowIndex = $(this).parents('tr').index();
            var colIndex = $(this).parents('td').index();
            var isNew = $(this).parents('tr').hasClass('new_row');                         
            var newRowId = $(this).parents('tr').data('id');

            function getPKValues(){
                var res = [];
                for(var i in _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')){
                    var item = _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')[i];
                    if(isNew){
                        res.push('NEW_ROW_'+newRowId);
                    }else{
                        res.push(_t.data.DATA[rowIndex][_t.data.NAMES.indexOf(item)]);
                    }
                }
                return res;
            }

            function getColumnNameByIndex(idx){
                var tempArr = [];

                for(var i in _t.visibleArray){
                    var isVis = _t.visibleArray[i];
                    if(isVis){
                        tempArr.push(_t.profile.DATA[i]);
                    }
                }

                return tempArr[idx][_t.profile.NAMES.indexOf('COLUMN_NAME')];
            }

            var chObj = {
                PRIMARY_KEY_NAMES: _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(','),
                PRIMARY_KEY_VALUES: getPKValues(),
                CHANGED_COLUMN_NAMES: getColumnNameByIndex(colIndex-1),
                CHANGED_COLUMN_VALUES: $(this).val()
            };

            chObj['COMMAND'] = ($(this).parents('tr').hasClass('new_row'))? 'NEW': 'MODIFY';

            _t.tableWrapper.find('tr').eq(rowIndex+1).addClass('edited');
            _t.addChange(chObj);
        });

        _t.infoBlock.find('.tab-btn').on('click', function(){
            var dataId = $(this).data('id');

            if(!$(this).hasClass('active')){
                _t.infoBlock.find('.tab-btn').removeClass('active');
                $(this).addClass('active');
                _t.infoBlock.find('.tab').removeClass('active').hide(0, function(){
                    _t.infoBlock.find('.tab[data-id="'+dataId+'"]').addClass('active').show(0);
                });
            }
        });

        _t.wrapper.find('input.datetimepicker').off('change').on('change', function(){
            var rowIndex = $(this).parents('tr').index();
            var colIndex = $(this).parents('td').index();
            var isNew = $(this).parents('tr').hasClass('new_row');                         
            var newRowId = $(this).parents('tr').data('id');

            function getPKValues(){
                var res = [];
                for(var i in _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')){
                    var item = _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')[i];
                    if(isNew){
                        res.push('NEW_ROW_'+newRowId);
                    }else{
                        res.push(_t.data.DATA[rowIndex][_t.data.NAMES.indexOf(item)]);
                    }
                }
                return res;
            }

            function getColumnNameByIndex(idx){
                var tempArr = [];

                for(var i in _t.visibleArray){
                    var isVis = _t.visibleArray[i];
                    if(isVis){
                        tempArr.push(_t.profile.DATA[i]);
                    }
                }

                return tempArr[idx][_t.profile.NAMES.indexOf('COLUMN_NAME')];
            }

            var chObj = {
                PRIMARY_KEY_NAMES: _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(','),
                PRIMARY_KEY_VALUES: getPKValues(),
                CHANGED_COLUMN_NAMES: getColumnNameByIndex(colIndex-1),
                CHANGED_COLUMN_VALUES: $(this).val()
            };

            chObj['COMMAND'] = ($(this).parents('tr').hasClass('new_row'))? 'NEW': 'MODIFY';

            _t.tableWrapper.find('tr').eq(rowIndex+1).addClass('edited');
            _t.addChange(chObj);
        });

        _t.wrapper.find('input.colorpicker').off('changeColor').on('changeColor', function(){
            _t.highLightCross($(this).parents('td'));
            _t.selectedRowIndex = $(this).parents('tr').index();
            _t.selectedColIndex = $(this).parents('td').index();
            if(!_t.isInfoOpened){
                //_t.openInfo();
                _t.populateInfoBlock();
            }else{
                _t.populateInfoBlock();
            }

            _t.data.data[_t.selectedRowIndex][_t.selectedColIndex] = $(this).val();
            _t.populateInfoBlock();
        });

        _t.places.tableFixHeader.find('div').on('click', function(){
        });

        _t.tableWrapper.on('scroll', function(){
            $('.colorpicker-visible').removeClass('colorpicker-visible').addClass('colorpicker-hidden');
        });

        _t.wrapper.find('.ct-functional-close').off('click').on('click', function(){
            if(_t.wrapper.find('.ct-options-excel').hasClass('opened')){
                _t.tableWrapper.animate({marginTop: 0+'px'}, 300, 'easeOutQuint', function(){
                    _t.wrapper.find('.ct-options-excel').removeClass('opened');
                    _t.wrapper.find('.ct-functional-dd').removeClass('opened');
                });
            }
        });

        _t.wrapper.find('.ct-options-filter').off('click').on('click', function(){
            var innerThis = this;



            if($(innerThis).hasClass('opened')){
                _t.wrapper.find('.ct-filter').css('zIndex', '98');
                _t.wrapper.find('.classicTableFunctional').animate({marginTop: '-'+(_t.wrapper.find('.ct-filter').outerHeight()-7)+'px'}, 180, function(){
                    $(innerThis).removeClass('opened');
                });
            }else{
                $(innerThis).addClass('opened');
                _t.wrapper.find('.classicTableFunctional').animate({marginTop: '4px'}, 180, function(){
                    _t.wrapper.find('.ct-filter').css('zIndex', '101');
                });
            }
        });

        _t.wrapper.find('.ct-confirm-filter').off('click').on('click', function(){
            MB.Tables.getTable(_t.id).tempPage = 1;
            MB.Tables.getTable(_t.id).reload();
        });

        _t.wrapper.find('.ct-clear-filter').off('click').on('click', function(){
            var listOfFilters = _t.wrapper.find('.ct-filter-list');
            for(var i = 0; i< listOfFilters.find('li.filterItem').length; i++){
                var filter = listOfFilters.find('li.filterItem').eq(i);
                filter.find('.invalid').removeClass('invalid');
                var type = filter.attr('data-filterType');
                var control = undefined;

                switch(type){
                    case 'text':
                        control = filter.find('input[type="text"]');
                        control.val('');
                        break;
                    case 'like_text':
                        control = filter.find('input[type="text"]');
                        control.val('');
                        break;
                    case 'select2':
                        control = MB.Core.select3.list.getSelect(filter.find('.select3-wrapper').attr('id'));
                        control.value.id = '';
                        control.value.name = '';
                        control.setValue();
                        break;
                    case 'daysweek':
                        control = MB.Core.daysweekpickers.getItem(filter.find('.daysweekpicker').attr('data-id'));
                        control.clear();
                        break;
                    case 'daterange':
                        control = filter.find('input[type="text"]');
                        control.val('');
                        break;
                    case 'timerange':
                        control = filter.find('input[type="text"]');
                        control.val('');
                        break;
                    case 'checkbox':
                        break;
                    default:
                        break;
                }
            }

            _t.filterWhere = [];
            MB.Tables.getTable(_t.id).reload();
        });

        _t.wrapper.find('.ct-options-excel').off('click').on('click', function(){
            var innerThis = this;
            if($(innerThis).hasClass('opened')){
                _t.tableWrapper.animate({marginTop: 0+'px'}, 300, 'easeOutQuint', function(){
                    $(innerThis).removeClass('opened');
                    _t.wrapper.find('.ct-functional-dd').removeClass('opened');
                });
            }else{
                _t.wrapper.find('.ct-functional-dd').addClass('opened');
                $(innerThis).addClass('opened');
                _t.tableWrapper.animate({marginTop: 31+'px'}, 300, 'easeOutQuint', function(){
                });
            }
        });

        _t.wrapper.find('.exportToExcel').off('click').on('click', function(){
            window.open("data:application/vnd.ms-excel," + "﻿" + encodeURIComponent('<table>'+_t.wrapper.find('table.classicTable').html()+'</table>'), "_self");
        });

        _t.wrapper.find('.sendExcelToEmail').off('click').on('click', function(){
            var tableNewInstance = MB.Tables.getTable(_t.id);
            var o = {
                command: 'operation',
                object: 'send_excel_to_email',
                params: {
                    where: tableNewInstance['where'],
                    CLIENT_OBJECT: tableNewInstance.name,
                    VIEW_NAME: tableNewInstance.data.INFO.VIEW_NAME,
                    getObject: tableNewInstance.profile['OBJECT_PROFILE']['OBJECT_COMMAND']
                }
            }

            socketQuery(o, function(res){
                res = JSON.parse(res);
                var toastrO = res.results[0].toastr;
                toastr[toastrO['type']](toastrO['message']);
            });
        });

        _t.wrapper.find('.ct-filter .filterItem input[type="text"]').off('input').on('input', function(){
            var parent = $(this).parents('.filterItem');
            var type = $(this).parents('.filterItem').eq(0).attr('data-filterType');
            switch(type){
                case 'number':
                    console.log(MB.Core.validator.int($(this).val()));
                    break;
                case 'datetime':
                    console.log(MB.Core.validator.datetime($(this).val()));
                    break;
                case 'daysweek':
                    break;
                case 'daterange':

                    break;
                case 'timerange':
                    var fromInp = parent.find('input[name="start"]');
                    var toInp = parent.find('input[name="end"]');
                    var columnName = parent.attr('data-name');
                    var wValue;

                    if(fromInp.val() == '' && toInp.val() == ''){
                        wValue = '';
                    }else{
                        if(MB.Core.validator.time($(this).val())){
                            $(this).removeClass('invalid');
                            wValue = {from: fromInp.val(), to: toInp.val()};
                            var wObj = {
                                name: columnName,
                                value: wValue,
                                type: 'daterange'
                            };
                            _t.addWhere(wObj);
                        }else{
                            $(this).addClass('invalid');
                        }
                    }
                    console.log(MB.Core.validator.time($(this).val()));
                    break;
                case 'like_text':
                    var columnName = parent.attr('data-name');
                    var wValue;

                    var wObj = {
                        name: columnName,
                        value: $(this).val(),
                        type: 'like_text'
                    };
                    _t.addWhere(wObj);
                    break;
                default:
                    break;
            }
        });


        _t.places.theadRow.find('.swr').off('mousedown').on('mousedown', function(e){
            var th = $(this).parents('th').eq(0);
            var thIdx = th.index();
            var wSet = th.find('.wSet');
            var tds = [];

            $(this).addClass('inMove');
            th.addClass('hovered');
            _t.wrapper.addClass('colResize');

            for(var i = 0; i < _t.places.tbody.find('tr').length; i++){
                var row = _t.places.tbody.find('tr').eq(i);
                tds.push(row.find('td').eq(thIdx).find('.tdW'));
            }


            _t.th = th;
            _t.swr = $(this);
            _t.pressX = mouse.pageX;
            _t.colInResize = true;
            _t.tdsToResize = tds;
            _t.wSet = wSet;
            _t.wSetW = _t.wSet.outerWidth();

        });

        $(document).on('mousemove', function(){
            if(mouse.isDown){
                if(_t.colInResize){

                    var margin = mouse.pageX - _t.pressX;

                    for(var i in _t.tdsToResize){
                        var td = _t.tdsToResize[i];
                        td.width(_t.wSetW + margin);
                    }
                    _t.wSet.width((_t.wSetW-10) + margin);
                }
            }
        });
        $(document).on('mouseup', function(){

            if(_t.wrapper.hasClass('colResize')){
                _t.wrapper.removeClass('colResize');
            }
            if(_t.colInResize && _t.swr && _t.th){
                _t.swr.removeClass('inMove');
                _t.th.removeClass('hovered')


                _t.th = undefined;
                _t.swr = undefined;
                _t.colInResize =    false;
                _t.tdsToResize =    undefined;
                _t.wSet =           undefined;
                _t.wSetW =          undefined;
            }
        });
    };

    CTable.prototype.highLightCross = function(cell){

        var _t = this,
            tr = cell.parent('tr'),
            horCells = tr.find('td').not(cell),
            verCells = [];
        for(var i=0; i<_t.wrapper.find('tbody tr').length; i++){
            var trItem = _t.wrapper.find('tbody tr').eq(i);
            verCells.push(trItem.find('td').eq(cell.index()));
        }

        _t.wrapper.find('td').removeClass('horHightLight').removeClass('verHightLight').removeClass('active');

        cell.addClass('active');
        horCells.addClass('horHightLight');
        for(var i=0; i<verCells.length; i++){
            verCells[i].addClass('verHightLight');
        }

    };

    CTable.prototype.openInfo = function(){
        var _t = this;

        _t.infoBlock.animate({
            width: 17+'%'
        },{
            duration: 250,
            easing: "easeOutQuint"
        });

        _t.tableWrapper.animate({
            width: 83+'%'
        },{
            duration: 250,
            easing: "easeOutQuint",
            step: function(){
                //_t.setHeaderWidth();
            },
            complete: function(){
                //_t.setHeaderWidth();
                _t.isInfoOpened = true;
            }
        });

    };

    CTable.prototype.closeInfo = function(){
        var _t = this;

        _t.infoBlock.css('position','absolute');

        _t.infoBlock.animate({
            width: 0
        },{
            duration: 250,
            easing: "easeOutQuint",
            complete: function(){
                _t.infoBlock.css('position','relative');
            }
        });

        _t.tableWrapper.animate({
            width: 100+'%'
        },{
            duration: 250,
            easing: "easeOutQuint",
            step: function(){
                //_t.setHeaderWidth();
            },
            complete: function(){
                //_t.setHeaderWidth();
                _t.isInfoOpened = false;
            }
        });

        /*-------------*/
//        _t.infoBlock.css('position','absolute').animate({
//            width: 0
//        },250, 'easeOutQuint', function(){
//            _t.infoBlock.css('position','relative');
//        });
//
//        _t.tableWrapper.animate({
//            width: 100+'%'
//        },250, 'easeOutQuint', function(){
//            _t.isInfoOpened = false;
//            _t.setHeaderWidth();
//        });


    };

    CTable.prototype.populateInfoBlock = function(){
        return;

    };

    CTable.prototype.setInfoBlockOptionHandler = function(btn, handler){
        var _t = this;
        btn.on('click', function(){
           if(typeof handler == 'function'){
               handler();
           }
        });
        _t.infoBlockColumnsTab.find('select.select3').each(function(index, elem){
            $(elem).select3();
        });
    };

    CTable.prototype.setInfoBlockHandlers = function(){
        var _t = this;
        _t.infoBlock.find('input[type="text"]').off('input');
        _t.infoBlock.find('input[type="checkbox"]').off('change');
        _t.infoBlock.find('select').off('change');
        _t.infoBlock.find('.closeTableInfo').off('click');
        _t.infoBlock.find('input.datepicker').off('change');

        _t.infoBlock.find('input[type="text"]').on('input', function(){
            var cellIndex = $(this).parents('.ct-editCell-wrapper').data('cellindex');
            _t.data.data[_t.selectedRowIndex][cellIndex] = $(this).val();
            _t.updateTableData();
        });
        _t.infoBlock.find('input[type="checkbox"]').on('change', function(){
            var cellIndex = $(this).parents('.ct-editCell-wrapper').data('cellindex');
            _t.data.data[_t.selectedRowIndex][cellIndex] = $(this)[0].checked;
            _t.updateTableData();
        });
        _t.infoBlock.find('select').on('change', function(){
            var cellIndex = $(this).parents('.ct-editCell-wrapper').data('cellindex');
            _t.data.data[_t.selectedRowIndex][cellIndex] = $(this).find('option[value="'+$(this).val()+'"]').html();
            _t.updateTableData();
        });
        _t.infoBlock.find('.ct-editCell-collapse').on('click', function(){
            var content = $(this).parents('.ct-editCell-wrapper').find('.ct-editCell-content');
            if($(this).hasClass('collapsed')){
                $(this).removeClass('collapsed');
                content.slideDown(150, 'easeOutQuint');
            }else{
                $(this).addClass('collapsed');
                content.slideUp(150, 'easeOutQuint');
            }
        });
        _t.infoBlock.find('.closeTableInfo').on('click', function(){
            _t.closeInfo();
        });
        _t.infoBlock.find('input.colorpicker').on('mousedown', function(){
            $(this).colorpicker();
        });
        _t.infoBlock.find('input.datepicker').on('mousedown', function(){
            $(this).datepicker({
                todayBtn: "linked",
                language: "ru",
                autoclose: true,
                todayHighlight: true
            });
        });
        _t.infoBlock.find('input.datepicker').on('change', function(){
            var cellIndex = $(this).parents('.ct-editCell-wrapper').data('cellindex');
            _t.data.data[_t.selectedRowIndex][cellIndex] = $(this).val();
            _t.updateTableData();
        });
        _t.infoBlock.find('input.colorpicker').on('changeColor', function(){
            var cellIndex = $(this).parents('.ct-editCell-wrapper').data('cellindex');
            _t.data.data[_t.selectedRowIndex][cellIndex] = $(this).val();
            _t.updateTableData();
        });
    };

    CTable.prototype.updateTableData = function(){
        var _t = this;

        for(var i in _t.data.data){
            var row = _t.data.data[i];
            for(var k in row){
                var cell = row[k];
                var htmlCell = _t.wrapper.find('tbody tr').eq(i).find('td').eq(k);
                var type = _t.data.types[k];
                switch (type){
                    case "datepicker":
                        htmlCell.find('input.datepicker').val(cell);
                        break;
                    case "colorpicker":
                        htmlCell.find('input.colorpicker').val(cell);
                        break;
                    case "checkbox":
                        if(cell){
                            htmlCell.find('input[type="checkbox"]')[0].checked = true;
                        }else{
                            htmlCell.find('input[type="checkbox"]')[0].checked = false;
                        }
                        break;
                    case "select":
                        var optionVal = '';
                        for(var j=0; j<htmlCell.find('select option').length; j++){
                            var option = htmlCell.find('select option').eq(j);
                            var optionHtml = option.html();
                            if(optionHtml == cell){
                                optionVal = option.attr('value');
                            }
                        }
                        htmlCell.find('select').val(optionVal);
                        break;
                    case "input":
                        htmlCell.find('input[type="text"]').val(cell);
                        break;
                    case "text":
                        htmlCell.children('div').html(cell);
                        break;
                    default:
                        htmlCell.children('div').html(cell);
                        break;
                }

            }
        }
    };

    CTable.prototype.reload = function(data, callback){

        if(typeof callback == 'function'){
            callback();
        }
    };

    CTable.prototype.populateTotalSumms = function(){
        var _t = this;
        var clientObject = _t.profile['OBJECT_PROFILE']['CLIENT_OBJECT'];
        var useInTables = ['table_order_web_overview', 'table_order_ticket_web', 'table_order', 'table_order_ticket'];
        if(useInTables.indexOf(clientObject) > -1){

            var columns = {
                table_order_web_overview: {
                    columns: 'total_order_amount,tickets_count',
                    back:['TOTAL_ORDER_AMOUNT','TICKETS_COUNT']
                },
                table_order_ticket_web: {
                    columns: 'price',
                    back: ['PRICE']
                },
                table_order: {
                    columns: 'total_order_amount,tickets_count',
                    back: ['TOTAL_ORDER_AMOUNT','TICKETS_COUNT']
                },
                table_order_ticket: {
                    columns: 'price',
                    back: ['PRICE']
                }
            }

            var o = {
                command: 'get',
                object: 'Sum_For_Fields',
                params: {
                    columns: columns[clientObject].columns,
                    client_object: clientObject,
                    where: MB.Tables.getTable(_t.id).where
                }
            };

            socketQuery(o, function(res){

                console.log('FFAAAAA', res);

                res = jsonToObj(JSON.parse(res)['results'][0]);
                //jsonToObj(

                console.log('FFAAAAA2', res);

                _t.totalValues = [
                    {
                        key: 'Билетов',
                        value: (columns[clientObject].back.length > 1)? res[0][columns[clientObject].back[1]] : res[0]['ROWS_COUNT']
                    },
                    {
                        key: 'На сумму',
                        value: res[0][columns[clientObject].back[0]] + ' руб.'
                    }
                ];

                var totalValues = '';

                if(_t.totalValues){
                    totalValues += '( ';
                    for(var i in _t.totalValues){
                        var k = _t.totalValues[i]['key'];
                        var v = _t.totalValues[i]['value'];
                        totalValues += k + ': '+ v + ((i == _t.totalValues.length -1)? ' ':'; ');
                    }
                    totalValues += ')';
                }

                _t.wrapper.find('.ct-total-values-wrapper').html(totalValues);
            });
        }
    };

    var tables = new CTables();
    var addTable = function(params, callback){
        var instace = new CTable(params);
        tables.addItem(instace);
        instace.render();
        if(typeof callback == 'function'){
            callback(instace);
        }
        return instace;
    };
    var initTable = function(tableElem){
        tableElem.css('border', '5px solid red');
    };

    MB.Core.classicTable = {
        tables: tables,
        createTable: addTable,
        initTable: initTable
    };
};
