(function () {
    var instance = MB.O.forms["form_action"];
    instance.custom = function (callback) {

        var id = MB.O.forms.form_action.activeId;
        var CustomButtons = {
            create_action_scheme: {
                name: "Создать схему мероприятия",
                id: "createActionScheme",
                style: "blue", 
                disabled:function(){
                    var obj = MB.O.forms.form_action.data;
                    var obj_true = {};
                    var objIndex = {};
                    for (i in obj['data']){
                        for(var index in obj['names']){
                            if(obj_true[i] == undefined){obj_true[i] = {};}
                            obj_true[i][obj['names'][index]] = obj['data'][i][index];
                        }
                    }
                    if(obj_true[0]['ACTION_SCHEME_CREATED']=="TRUE"){
                        return true;
                    }
                    else {
                        return false;
                    }
                    //var table = MB.O.tables["table_action"];

                    /*
                    var id = options.$trigger.data("row");
                    var field_num = instance.data.names.indexOf('ACTION_SCHEME_CREATED');
                    var row_num;
                    for (var i in instance.data.data){
                        if (instance.data.data[i][0]==id){
                            row_num = i;
                            break;
                        }
                    }
                    if (row_num==undefined) return true;
                    var is_created = !!(instance.data.data[row_num][field_num]=="TRUE");
                    if (is_created) return true;
                    return false;
                    */
                },
                callback: function (key, options) {
                    bootbox.dialog({
                        message:"Подтвердите создание схемы мероприятия.",
                        title:"Создание схемы мероприятия",
                        buttons:{
                            ok:{
                                label:"Создать схему",
                                className:"yellow",
                                callback:function(){
                                    MB.Core.sendQuery({command:"operation",object:"create_action_scheme",sid:MB.User.sid,params:{action_id:id}},function(data){
                                        if (data.RC==0){
                                            bootbox.dialog({
                                                message:"Схема успешно создана",
                                                title:"Создание схемы мероприятия",
                                                buttons:{
                                                    ok:{
                                                        label:"Ок",
                                                        className:"green",
                                                        callback:function(){
                                                            instance.reload("data");
                                                        }
                                                    }
                                                }
                                            });
                                        }else{
                                            bootbox.dialog({
                                                message:data.MESSAGE,
                                                title:"Ошибка создания схемы мероприятия",
                                                buttons:{
                                                    ok:{
                                                        label:"Ок",
                                                        className:"red",
                                                        callback:function(){
                                                            instance.reload("data");
                                                        }
                                                    }
                                                }
                                            });

                                        }
                                        instance.reload("data");
                                    });

                                }
                            },
                            cancel:{
                                label:"Отмена",
                                className:"blue",
                                callback:function(){

                                }
                            }
                        }
                    });
                    //instance.data
                }
            },
            delete_action_scheme:{
                name: "Удалить схему мероприятия",
                id: "deleteActionScheme", 
                style: "red",
                disabled:function(key, options){
                    var obj = MB.O.forms.form_action.data;
                    var obj_true = {};
                    var objIndex = {};
                    for (i in obj['data']){
                        for(var index in obj['names']){
                            if(obj_true[i] == undefined){obj_true[i] = {};}
                            obj_true[i][obj['names'][index]] = obj['data'][i][index];
                        }
                    }
                    if(obj_true[0]['ACTION_SCHEME_CREATED']=="TRUE"){
                        return false;
                    }
                    else {
                        return true;
                    }
                    /*
                    var id = options.$trigger.data("row");
                    var field_num = instance.data.names.indexOf('ACTION_SCHEME_CREATED');
                    var row_num;
                    for (var i in instance.data.data){
                        if (instance.data.data[i][0]==id){
                            row_num = i;
                            break;
                        }
                    }
                    if (row_num==undefined) return true;
                    var is_created = !!(instance.data.data[row_num][field_num]=="TRUE");
                    if (!is_created) return true;
                    return false;
                    */
                },
                callback: function (key, options) {
                    bootbox.dialog({
                        message:"Вы уверены что хотите удалить схему мероприятия?",
                        title:"Предупреждение",
                        buttons:{
                            ok:{
                                label:"Да, уверен",
                                className:"yellow",
                                callback:function(){
                                    MB.Core.sendQuery({command:"operation",object:"delete_action_scheme",sid:MB.User.sid,params:{action_id:id}},function(data){
                                        if (data.RC==0){
                                            bootbox.dialog({
                                                message:"Схема мероприятия успешно удалена.",
                                                title:"",
                                                buttons:{
                                                    ok:{
                                                        label:"Ок",
                                                        className:"green",
                                                        callback:function(){
                                                            instance.reload("data");
                                                        }
                                                    }
                                                }
                                            });
                                        }else{
                                            bootbox.dialog({
                                                message:data.MESSAGE,
                                                title:"Ошибка",
                                                buttons:{
                                                    ok:{
                                                        label:"Ок",
                                                        className:"blue",
                                                        callback:function(){
                                                            instance.reload("data");
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                    });

                                }
                            },
                            cancel:{
                                label:"Отменить",
                                className:"blue",
                                callback:function(){

                                }
                            }
                        }
                    });
                }
            }
        }
        var div = instance.$container;
        if(div.find(".buttons").html()==""){
            for (var key in CustomButtons){
                var html = '<button id="formAction_'+key+'" type="button" class="btn '+CustomButtons[key]['style']+' form-create-button '+key+'"><i class="fa fa-copy"></i> '+CustomButtons[key]['name']+'</button>';
                div.find(".buttons").append(html);
                if(CustomButtons[key].disabled()){
                    div.find(".buttons").find("."+key).attr("disabled","true");
                }
                else {
                    div.find(".buttons").find("."+key).removeAttr("disabled");
                }
            }
            div.find(".buttons").click(function(e){
                if($(e.target).attr("class") != "buttons"){
                    var key = $(e.target).attr("id").replace("formAction_","");
                    CustomButtons[key].callback();
                }
            })
        }
        for (var key in CustomButtons){
            if(CustomButtons[key].disabled()){
                div.find(".buttons").find("."+key).attr("disabled","true");
            }
            else {
                div.find(".buttons").find("."+key).removeAttr("disabled");
            }
        }
        // Табы 
        
        // Таб Доступ агентов
        $("#TAB_action_agent_access").click(function(){
            var MultiplySelect_user_access = new MultiplySelectClass({
                selector:"#action_agent_access",
                thisId:id,
                subcommandEx:"action_access",
                subcommandAll:"customer_agent",
                pKey:"ACTION_ID",
                pKeyEx:"CUSTOMER_ID",
                pKeyAll:"ACTION_ACCESS_ID",
                name: "NAME",
                type: "all"
            });
            MultiplySelect_user_access.init(function(){});
        });
        
        callback();
    };
})();