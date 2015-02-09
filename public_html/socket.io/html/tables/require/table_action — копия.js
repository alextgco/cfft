(function () {
    var instance = MB.O.tables["table_action"];
    var field_num = instance.data.names.indexOf('ACTION_SCHEME_CREATED');
    var row_num;
    for (var i in instance.data.data){
        if (instance.data.data[i][0]==id){
            row_num = i;
            break;
        }
    }

    if (row_num==undefined) return;
    var is_created = !!(instance.data.data[row_num][field_num]=="TRUE");



    instance.custom = function (callback) {
        /*instance.contextmenu["custom01"] = {
            name: "Создать в форме",
            callback: function (key, options) {



                var form = new MB.Form({
                    name:"form_action",
                    ids:[1]
                });

                //form.create(function(){log("form_action_created")});

                form.makedir(function () {
                    form.makecontainer(function () {
                        form.makeportletcontainer(function () {
                            form.loadhtml(function () {
                                form.getprofile(function (res) {
                                    debugger;
                                    form.updatemodel("profile", res, function () {
                                        form.updateview("add", function () {
                                            form.updatecontroller("add", function () {
                                                callback();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });


                form.getprofile(function(res){
                    form.updatemodel("profile",res,function(){
                        form.addingStorage = {
                            command: "new",
                            object: instance2.profile.general.object,
                            sid: MB.User.sid
                        };
                        form.updateview("add", function () {
                            form.updatecontroller("add", function () {
                                if (typeof callback=="function")
                                    callback();
                            });
                        });

                    });
                });

                //MB.Core.switchModal({type:"form", filename:"form_action"});




            }
        };*/
        if (!is_created) {
            instance.contextmenu["custom02"] = {
                name: "Создать комплект",
                callback: function (key, options) {
                    var id = options.$trigger.data("row");

                    bootbox.dialog({
                        message:"Подтвердите формирование мероприятия.",
                        title:"Формирование мероприятия.",
                        buttons:{
                            ok:{
                                label:"Сформировать",
                                className:"yellow",
                                callback:function(){
                                    MB.Core.sendQuery({command:"operation",object:"create_action_scheme",sid:MB.User.sid,params:{action_id:id}},function(data){
                                        if (data.RC==0){
                                            bootbox.dialog({
                                                message:"Мероприятие успешно сформированно",
                                                title:"Формирование мероприятия.",
                                                buttons:{
                                                    ok:{
                                                        label:"Ок",
                                                        className:"green",
                                                        callback:function(){


                                                        }
                                                    }
                                                }
                                            });
                                        }else{
                                            bootbox.dialog({
                                                message:data.MESSAGE,
                                                title:"Ошибка формирование мероприятия.",
                                                buttons:{
                                                    ok:{
                                                        label:"Ок",
                                                        className:"red",
                                                        callback:function(){

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

                }
            };
        }else{
            instance.contextmenu["custom02"] = {
                name: "<span style='color:#F9814D;'>Расформировать мероприятие</span>",
                callback: function (key, options) {
                    var id = options.$trigger.data("row");
                    bootbox.dialog({
                        message:"Вы уверены что хотите расформировать мероприятие?",
                        title:"Предупреждение",
                        buttons:{
                            ok:{
                                label:"Да, уверен",
                                className:"yellow",
                                callback:function(){
                                    MB.Core.sendQuery({command:"operation",object:"delete_action_scheme",sid:MB.User.sid,params:{action_id:id}},function(data){
                                        if (data.RC==0){
                                            bootbox.dialog({
                                                message:"Мерорприятие успешно расформированно.",
                                                title:"",
                                                buttons:{
                                                    ok:{
                                                        label:"Ок",
                                                        className:"green",
                                                        callback:function(){

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
            };
        }


        instance.contextmenu["custom1"] = {
            name: "Перейти к перераспределению",
            callback: function (key, options) {
                var id = options.$trigger.data("row");
                MB.Core.switchModal({type:"content", filename:"action_fundZones", params:{action_id:id}});
            }
        };
        instance.contextmenu["custom2"] = {
            name: "Перейти к переоценке",
            callback: function (key, options) {
                var id = options.$trigger.data("row");
                MB.Core.switchModal({type:"content", filename:"action_priceZones", params:{action_id:id}});
            }
        };

        var query = "#" + instance.world + "_" + instance.name + "_wrapper table tbody tr";
        $.contextMenu("destroy", query);
        $.contextMenu({
            selector: query,
            items: instance.contextmenu
        });
        callback();
    };
}());

