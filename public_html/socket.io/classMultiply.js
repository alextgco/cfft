
if(MBOOKER.UserData.sid == undefined){
    log("No session")
    MBOOKER.UserData.sid = "MrrYSJaKlJnOhdUIveUzteYcxyZuLMaR";
}
var MultiplySelectClass = function(obj){
    this.selector =         obj.selector;
    this.subcommandEx =     obj.subcommandEx;
    this.subcommandAll =    obj.subcommandAll;
    
    this.pKey =             obj.pKey;
    this.thisId =           obj.thisId;
    this.pKeyEx =           obj.pKeyEx;
    this.pKeyAll =          obj.pKeyAll;
    
    this.whereEx =          this.pKey+" = "+this.thisId;
    this.whereAll =         this.pKey+" is null or "+this.pKey+" = "+this.thisId;
}

MultiplySelectClass.prototype.getInitData = function(callback){
    var ex = {
        "sid":          MBOOKER.UserData.sid,
        "command":      "get",
        "subcommand":   this.subcommandEx,
        "where":        this.whereEx
    };
    var all = {
        "sid":          MBOOKER.UserData.sid,
        "command":      "get",
        "subcommand":   this.subcommandAll,
        "where":        this.whereAll
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
    var _this = this;
    this.getInitData(function (response) {
        _this.responseobj = response;
        _this.render();
        _this.handleEvents();
        //$(_this.selector).multiSelect();
        callback();
        log(_this.responseobj)
    });
};

MultiplySelectClass.prototype.render = function(){
    var _this = this;
    var html = ''+
    '<form action="index.html" class="form-horizontal form-row-seperated">'+
        '<div class="form-body">'+
            '<div class="form-group">'+
                '<label class="control-label col-md-3"></label>'+
                '<div class="col-md-9">'+
                    '<select name="country" class="multi-select MultiplySelectAll" multiple=""></select>'+
                '</div>'+
            '</div>'+
        '</div>'+
        '<div class="form-actions fluid">'+
            '<div class="row">'+
                '<div class="col-md-12">'+
                    '<div class="col-md-offset-3 col-md-9">'+
                        '<button id="MultyPlySave" type="button" class="btn green"><i class="fa fa-check"></i> Submit </button>'+
                        '<button id="MultyPlyCancel" type="button" class="btn default">Cancel </button>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</form>';
    $(_this.selector).html(html);
    var divSelect = $(_this.selector).find("select.MultiplySelectAll");
    var htmlSelect = '';
    for(var i in _this.responseobj['allResponse']){
        var obj = _this.responseobj['allResponse'][i];
        htmlSelect+= ''+
        '<option value="'+obj[_this.pKeyEx]+'">'+
        ''+obj['FULLNAME']+
        '</option>';
    }
    divSelect.html(htmlSelect);
    divSelect.multiSelect();
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

    // SAVE 
    $("#MultyPlySave").click(function(){
        // REMOVE
        for (var id in objAction["remove"]){
            var index = objAction["remove"][id];
            var val =_this.responseobj['exResponse'][index][_this.pKeyAll];
            var params = {};
            params[_this.pKeyAll] = val;
            params['objversion'] = _this.responseobj['exResponse'][index]['OBJVERSION'];
            MBOOKER.Fn.sendQuery({command:"remove",subcommand:_this.subcommandEx,sid:MBOOKER.UserData.sid,params:params},function(result){
                delete objAction["remove"][id];
                SaveComplite(result,objAction);
            });
        }
        // ADD
        for (var id in objAction["add"]){
            var val = objAction["add"][id];
            var params = {};
            params[_this.pKey] = _this.thisId;
            params[_this.pKeyEx] = val;
            MBOOKER.Fn.sendQuery({command:"new",subcommand:_this.subcommandEx,sid:MBOOKER.UserData.sid,params:params},function(result){
                delete objAction["add"][id];
                SaveComplite(result,objAction);
            });
        }
        function SaveComplite(result,obj){
            if(result['RC'] == 0){
                if(countObj(obj["remove"]) == 0 && countObj(obj['add']) == 0){
                    _this.refresh();
                }
            }
            else {
                if (confirm("Произошла ошибка")) {
                     alert("Обновить!")
                } 
                else {
                     alert("Вы нажали кнопку отмена")
               }
            }
            // $("#MultyPlySave").attr("disabled","true");
            // $(".form-actions button")
        }
    })
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
        ++count;
    }
    return count;
}




var MultiplySelect = new MultiplySelectClass({selector:"#my_test",thisId:"3",subcommandEx:"customer_user",subcommandAll:"user_for_customer_user",pKey:"customer_id",pKeyEx:"USER_ID",pKeyAll:"CUSTOMER_USER_ID"});
MultiplySelect.init(function(){});