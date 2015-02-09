(function () {
    var instance = MB.O.tables["table_hall_scheme"];
    instance.custom = function (callback) {


        var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
        handsontableInstance.updateSettings({contextMenu: false});
        
        handsontableInstance.updateSettings({
            contextMenu: {
                callback: function(key, options) {
                    var arr, data, handsontableInstance, i, value, _i, _len;
                    var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                    var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                    var i = selectedRows[0];
                    var id = instance.data.data[i][instance.data.names.indexOf(instance.profile.general.primarykey)]
                    switch(key){
                        case "openInModal":
                            MB.Table.createOpenInModalContextMenuItem(instance, key, options);
                        break;
                        case "goTofundZones":
                            MB.Core.switchModal({type:"content", filename:"fundZones", params:{hall_scheme_id:id}});
                        break;
                        case "goTopriceZones":
                            MB.Core.switchModal({type:"content", filename:"priceZones", params:{hall_scheme_id:id}});
                        break;
                        case "goTomapEditor":
                            MB.Core.sendQuery({command:"get",object:"hall_scheme",sid:sid,params:{where:"hall_scheme_id = "+id}},function(data){
                                var obj = MB.Core.jsonToObj(data);
                                var hall_id = obj[0].HALL_ID;
                                MB.Core.switchModal({type:"content", filename:"mapEditor", params:{hall_scheme_id:id,hall_id:hall_id}});
                            });
                        break;
                    }

                },
                items: {
                    openInModal: {
                        name: "Открыть в форме..."
                    },
                    goTofundZones: {
                        name: "Перейти к схемам распределения...",
                        disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            if(selectedRows[0] != selectedRows[1]){
                                return true
                            }
                        }
                    },
                    goTopriceZones: {
                        name: "Перейти к схемам распоясовки...",
                        disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            if(selectedRows[0] != selectedRows[1]){
                                return true
                            }
                        }
                    },
                    goTomapEditor: {
                        name: "Перейти к редактору...",
                        disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            if(selectedRows[0] != selectedRows[1]){
                                return true
                            }
                        }
                    }
                }
            }
        });



        /*
        instance.contextmenu["custom1"] = {
            name: "Перейти к схемам распределения",
            callback: function (key, options) {
                var id = options.$trigger.data("row");
                MB.Core.switchModal({type:"content", filename:"fundZones", params:{hall_scheme_id:id}});
            }
        };
        instance.contextmenu["custom2"] = {
            name: "Перейти к схемам распоясовки",
            callback: function (key, options) {
                var id = options.$trigger.data("row");
                MB.Core.switchModal({type:"content", filename:"priceZones", params:{hall_scheme_id:id}});
            }
        };
        instance.contextmenu["custom3"] = {
            name: "<span style='color: #f00;'>Перейти к редактору</span>",
            callback: function (key, options) {
                var id = options.$trigger.data("row");
                MB.Core.sendQuery({command:"get",object:"hall_scheme",sid:sid,params:{where:"hall_scheme_id = "+id}},function(data){
                    var obj = MB.Core.jsonToObj(data);
                    var hall_id = obj[0].HALL_ID;
                    MB.Core.switchModal({type:"content", filename:"mapEditor", params:{hall_scheme_id:id,hall_id:hall_id}});
                });
            }
        };
        var query = "#" + instance.world + "_" + instance.name + "_wrapper table tbody tr";
        $.contextMenu("destroy", query);
        $.contextMenu({
            selector: query,
            items: instance.contextmenu
        });
        */
        callback();
    };
}());

