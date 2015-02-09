(function () {
    var instance = MB.O.tables["table_action"];
    instance.custom = function (callback) {

        var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
        handsontableInstance.updateSettings({contextMenu: false});
        handsontableInstance.updateSettings({
            contextMenu: {
                callback: function(key, options) {
                    var arr, data, handsontableInstance, i, value, _i, _len;
                    switch(key){
                        case "openInModal":
                            MB.Table.createOpenInModalContextMenuItem(instance, key, options);
                        break;
                        case "goToCreateAction":
                            var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var row_num = selectedRows[0];
                            var id = instance.data.data[row_num][0];

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
                        break;
                        case "goToDelAction":
                            var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var row_num = selectedRows[0];
                            var id = instance.data.data[row_num][0];

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
                        break;
                        case "goToFundAction":
                            var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var row_num = selectedRows[0];
                            var id = instance.data.data[row_num][0];
                            MB.Core.switchModal({type:"content", filename:"action_fundZones", params:{action_id:id}});
                        break;
                        case "goToPriceAction":
                            var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var row_num = selectedRows[0];
                            var id = instance.data.data[row_num][0];
                            MB.Core.switchModal({type:"content", filename:"action_priceZones", params:{action_id:id}});
                        break;
                    }
                },
                items: {
                    openInModal: {
                        name: "Открыть в форме..."
                    },
                    goToCreateAction: {
                        name: "Создать схему мероприятия...",
                        disabled: function(){
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            if(selectedRows[0] != selectedRows[1]){
                                return true
                            }
                            var field_num = instance.data.names.indexOf('ACTION_SCHEME_CREATED');
                            var row_num = selectedRows[0];
                            var id = instance.data.data[row_num][0];
                            if (row_num==undefined) return true;
                            var is_created = !!(instance.data.data[row_num][field_num]=="TRUE");
                            if (is_created) return true;
                            return false;
                        }
                    },
                    goToDelAction: {
                        name: "Удалить схему мероприятия",
                        disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            if(selectedRows[0] != selectedRows[1]){
                                return true
                            }
                            var field_num = instance.data.names.indexOf('ACTION_SCHEME_CREATED');
                            var row_num = selectedRows[0];
                            var id = instance.data.data[row_num][0];
                            if (row_num==undefined) return true;
                            var is_created = !!(instance.data.data[row_num][field_num]=="TRUE");
                            if (!is_created) return true;
                            return false;
                        }
                    },
                    goToFundAction: {
                        name: "Перейти к перераспределению",
                        disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            if(selectedRows[0] != selectedRows[1]){
                                return true
                            }
                            var field_num = instance.data.names.indexOf('ACTION_SCHEME_CREATED');
                            var row_num = selectedRows[0];
                            var id = instance.data.data[row_num][0];
                            if (row_num==undefined) return true;
                            var is_created = !!(instance.data.data[row_num][field_num]=="TRUE");
                            if (!is_created) return true;
                            return false;
                        }
                    },
                    goToPriceAction: {
                        name: "Перейти к переоценке",
                        disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            if(selectedRows[0] != selectedRows[1]){
                                return true
                            }
                            var field_num = instance.data.names.indexOf('ACTION_SCHEME_CREATED');
                            var row_num = selectedRows[0];
                            var id = instance.data.data[row_num][0];
                            var field_num = instance.data.names.indexOf('ACTION_SCHEME_CREATED');
                            if (row_num==undefined) return true;
                            var is_created = !!(instance.data.data[row_num][field_num]=="TRUE");
                            if (!is_created) return true;
                            return false;
                        }
                    }
                }
            }
        });
        
        callback();
    };
}());

