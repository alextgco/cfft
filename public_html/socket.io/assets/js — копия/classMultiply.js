
if(MBOOKER.UserData.sid == undefined){
    MBOOKER.UserData.sid = "TQuOYLVySrrXrqtTDGmdOxyHemJChcbS";
}
var MultiplySelectClass = function(obj){
    log("test")
    this.selector =         obj.selector;

    if(obj.titleEx){
        this.titleEx = obj.titleEx;
    }
    else {
        this.titleEx = "";
    }
    if(obj.titleAll){
        this.titleAll = obj.titleAll;
    }
    else {
        this.titleAll = "";
    }

    this.subcommandEx =     obj.subcommandEx;
    this.subcommandAll =    obj.subcommandAll;
    
    this.pKey =             obj.pKey;
    this.thisId =           obj.thisId;
    this.pKeyEx =           obj.pKeyEx;
    this.pKeyAll =          obj.pKeyAll;
    if(obj.name!=undefined){
        this.Name =         obj.name;
    }
    else {
        this.Name =         "NAME";
    }
    if(obj.whereEx != undefined){
        this.whereEx =      obj.whereEx;
    }
    else {
        this.whereEx =       this.pKey+" = "+this.thisId;
    }
    if(obj.whereAll != undefined){
        this.whereAll =      obj.whereAll;
    }
    else {
        this.whereAll =       "";
    }
    if(obj.type != undefined){
        this.type =      obj.type;
    }
    else {
        this.type =     "concat";
    }

    if(obj.paramsEx != undefined){
        this.paramsEx = obj.paramsEx;
    }
    else {
         this.paramsEx = {};
    }
    if(obj.paramsAll != undefined){
        this.paramsAll = obj.paramsAll;
    }
    else {
         this.paramsAll = {};
    }
    log("this")
    log(this)
}

MultiplySelectClass.prototype.getInitData = function(callback){
    var ex = {
        "sid":          MBOOKER.UserData.sid,
        "command":      "get",
        "subcommand":   this.subcommandEx,
        "where":        this.whereEx,
        "params":       this.paramsEx
    };
    var all = {
        "sid":          MBOOKER.UserData.sid,
        "command":      "get",
        "subcommand":   this.subcommandAll,
        "where":        this.whereAll,
        "params":       this.paramsAll
    };
    MBOOKER.Fn.sendQuery(ex, function (exResponse) {
        MBOOKER.Fn.sendQuery(all, function (allResponse) {
            var response = {};
            response['exResponse'] = MBOOKER.Fn.jsonToObj(exResponse);
            response['allResponse'] = MBOOKER.Fn.jsonToObj(allResponse);
            callback(response);
        }); 
    }); 
}


MultiplySelectClass.prototype.init = function (callback) {
    log("MultiplySelect init run")
    var _this = this;
    this.getInitData(function (response) {
        _this.responseobj = response;
        _this.render();
        _this.handleEvents();
        //$(_this.selector).multiSelect();
        callback();
    });
};

MultiplySelectClass.prototype.render = function(){
    log("renderStart")
    var _this = this;
    var html = ''+
    '<form action="index.html" class="form-horizontal form-row-seperated">'+
        '<div class="form-body">'+
            '<div class="form-group">'+
                '<div class="col-md-12 ">'+
                    '<select name="country" class="multi-select MultiplySelectAll" multiple=""></select>'+
                '</div>'+
            '</div>'+
        '</div>'+
        '<div class="form-actions fluid">'+
            '<div class="row">'+
                '<div class="col-md-12">'+
                    '<button id="MultyPlySave" type="button" class="btn green"><i class="fa fa-check"></i> Сохранить </button>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</form>';
    $(_this.selector).html(html);

    var divSelect = $(_this.selector).find("select.MultiplySelectAll");
    var htmlSelect = '';
    var All = {};
    if(_this.type == "concat"){
        var count = 0;
        if(countObj(_this.responseobj['allResponse'])>0){
            for(i in _this.responseobj['allResponse']){
                All[count] = _this.responseobj['allResponse'][i];
                count++;
            }
        }
        if(countObj(_this.responseobj['exResponse'])>0){
            for(i in _this.responseobj['exResponse']){
                All[count] = _this.responseobj['exResponse'][i];
                count++;
            }
        }
    }
    else if (_this.type == "all"){
        All = _this.responseobj['allResponse'];
        log(All)
    }

    /*
    var count = 0;
    if(countObj(_this.responseobj['allResponse'])>0){
        for(i in _this.responseobj['allResponse']){
            All[count] = _this.responseobj['allResponse'][i];
            count++;
        }
    }
    if(countObj(_this.responseobj['exResponse'])>0){
        for(i in _this.responseobj['exResponse']){
            All[count] = _this.responseobj['exResponse'][i];
            count++;
        }
    }
    */

    for(var i in All){
        var obj = All[i];
        htmlSelect+= ''+
        '<option value="'+obj[_this.pKeyEx]+'">'+
        ''+obj[_this.Name]+
        '</option>';
    }
    divSelect.html(htmlSelect);
    divSelect.multiSelect();
    html = "";
    html+=  '<div class="MultyPlyButtons">'+
                '<div class="MultyPlyAddAll"><i class="fa fa-backward"></i></div>'+
                '<div class="MultyPlyDellAll"><i class="fa fa-forward"></i></div>'+
            '</div>';
    $(_this.selector).find(".ms-container").append(html);
    var divAll = $(".ms-selectable");
    var divEx = $(".ms-selection");
    var ulEx    = divEx.find("ul");
    var ulAll   = divAll.find("ul");
    for(var i in _this.responseobj['exResponse']){
        var obj = _this.responseobj['exResponse'][i];
        var liAll = ulAll.find("li#"+obj[_this.pKeyEx]+"-selectable");
        liAll.css("display","none");
        liAll.addClass("ms-selected");
        var liEx = ulEx.find("li#"+obj[_this.pKeyEx]+"-selection");
        liEx.addClass("ms-selected");
        liEx.css("display","list-item");
    }
    SwitchButtons("dis");
    divAll.append("<div>test</div>");
    log("RenderEnd")
    //divEx.html("<li><span>Test</span></li>")
}
MultiplySelectClass.prototype.handleEvents = function(){
    var _this = this;
    var objAction = {};
    objAction['add'] = {};
    objAction['remove'] = {};

    var objversion = {};
    // REMOVE
    $(".ms-selection").find("li").click(function(){
        var id = $(this).attr("id").replace("-selection","");
        if(SearchInObj(_this.responseobj['exResponse'],id,_this.pKeyEx)){
            var index = SearchInObj(_this.responseobj['exResponse'],id,_this.pKeyEx);
            objAction['remove'][id] = index;
            //objversion[id] = _this.responseobj['exResponse'][index]['OBJVERSION'];
        }
        else {
            if(objAction['add'][id] != undefined){
                delete objAction['add'][id];
            }
        }
        SwitchButtons("not");
    });
    // ADD
    $(".ms-selectable").find("li").click(function(){
        var id = $(this).attr("id").replace("-selectable","");
        if(!SearchInObj(_this.responseobj['exResponse'],id,_this.pKeyEx)){
            objAction['add'][id] = id;
        }
        else {
            if(objAction['remove'][id] != undefined){
                delete objAction['remove'][id];
                delete objversion[id];
            }
        }
        SwitchButtons("not");
    });
    // ADD ALL
    $(".MultyPlyAddAll").click(function(){
        var parent = $(this).parents("form.form-row-seperated");
        parent.find(".ms-selectable").find("li").each(function(){
            var id = $(this).attr("id").replace("-selectable","");
            if(!SearchInObj(_this.responseobj['exResponse'],id,_this.pKeyEx)){
                objAction['add'][id] = id;
            }
            else {
                if(objAction['remove'][id] != undefined){
                    delete objAction['remove'][id];
                    delete objversion[id];
                }
            }
            SwitchButtons("not");
            $(this).click();
        })
    })
    // DELL ALL
    $(".MultyPlyDellAll").click(function(){
        var parent = $(this).parents("form.form-row-seperated");
        parent.find(".ms-selection").find("li").each(function(){
            var id = $(this).attr("id").replace("-selection","");
            if(SearchInObj(_this.responseobj['exResponse'],id,_this.pKeyEx)){
                var index = SearchInObj(_this.responseobj['exResponse'],id,_this.pKeyEx);
                objAction['remove'][id] = index;
                //objversion[id] = _this.responseobj['exResponse'][index]['OBJVERSION'];
            }
            else {
                if(objAction['add'][id] != undefined){
                    delete objAction['add'][id];
                }
            }
            SwitchButtons("not");
            $(this).click();
        })
    })

    // SAVE 
    $("#MultyPlySave").click(function(){
        var counterCallback = 0;
        _this.refreshIcon("refresh");
        // REMOVE
        for (var id in objAction["remove"]){
            var index = objAction["remove"][id];
            var val =_this.responseobj['exResponse'][index][_this.pKeyAll];
            var params = {};
            params[_this.pKeyAll] = val;
            params['objversion'] = _this.responseobj['exResponse'][index]['OBJVERSION'];
            MBOOKER.Fn.sendQuery({command:"remove",subcommand:_this.subcommandEx,sid:MBOOKER.UserData.sid,params:params},function(result){
                SaveComplite(result,objAction);
            });
            counterCallback++;
        }
        // ADD
        for (var id in objAction["add"]){
            var val = objAction["add"][id];
            var params = {};
            params[_this.pKey] = _this.thisId;
            params[_this.pKeyEx] = val;
            MBOOKER.Fn.sendQuery({command:"new",subcommand:_this.subcommandEx,sid:MBOOKER.UserData.sid,params:params},function(result){
                SaveComplite(result,objAction);
            });
            counterCallback++;
        }
        if(countObj(objAction["remove"]) == 0 && countObj(objAction["add"]) == 0){
            SwitchButtons("dis");
        }
        objAction['add'] = {};
        objAction['remove'] = {};
        function SaveComplite(result,obj){
            if(result['RC'] == 0){
                toastr.success(result.MESSAGE, "");
                if(counterCallback == 1){
                    counterCallback = 0;
                    _this.refresh();
                }
            }
            else {
                toastr.error(result.MESSAGE, "");
                _this.refresh();
            }
            counterCallback--;
            // $("#MultyPlySave").attr("disabled","true");
            // $(".form-actions button")
        }
    })
}

MultiplySelectClass.prototype.refreshIcon = function(act){
   var _this = this; 
   var selectionDiv = $(_this.selector).find(".ms-selection");
   var selectableDiv = $(_this.selector).find(".ms-selectable");
   if(act=="refresh"){
        var refreshDivHtml = '<li class="refreshDiv"><center><i class="fa fa-refresh fa-spin fa-4x"></center></i></li>';
        selectionDiv.find("ul").append(refreshDivHtml);
        selectableDiv.find("ul").append(refreshDivHtml);
        selectionDiv.find("ul li").hide();
        selectableDiv.find("ul li").hide();
        $(".refreshDiv").show();
   }
   else if(act=="success"){
        selectionDiv.find(".refreshDiv").remove();
        selectableDiv.find(".refreshDiv").remove();
   }
   //<i class="fa fa-refresh fa-spin"></i>
}
MultiplySelectClass.prototype.refresh = function(){
    this.init(function(){});
}


function SwitchButtons(act){
    switch(act){
        case "dis": $("#MultyPlySave").attr("disabled","true"); break;
        case "not": $("#MultyPlySave").removeAttr("disabled"); break;
    }
}

function SearchInObj(obj,id,pkey){
    for (var i in obj){
        if(obj[i][pkey] == id){
            return i;
        }
    }
    return false;
}

function countObj(obj){
    var count = 0;
    for (var i in obj){
        count++;
    }
    return count;
}



/*
var MultiplySelect = new MultiplySelectClass({selector:"#my_test",thisId:"3",subcommandEx:"customer_user",subcommandAll:"user_for_customer_user",pKey:"customer_id",pKeyEx:"USER_ID",pKeyAll:"CUSTOMER_USER_ID"});
MultiplySelect.init(function(){});
*/
