(function () {
    var instance = MB.O.tables["tbl_hall_scheme_price_zone"];
    instance.custom = function (callback) {
        var form =  MB.O.forms["form_hall_scheme_price_zone"];

        var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
        handsontableInstance.updateSettings({contextMenu: false});

        handsontableInstance.updateSettings({
            contextMenu: {
                callback: function(key, options) {
                    var arr, data, handsontableInstance, i, value, _i, _len;
                    var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                    var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                    var i = selectedRows[0];
                    var id = instance.data.data[i][instance.data.names.indexOf(instance.profile.general.primarykey)];
                    switch(key){
                        case "select":

                            form.tblcallbacks.select.callback(id);

                            break;
                        case "setAsDefault":
                            var  o = {
                                command: "operation",
                                object: "set_price_zone_default",
                                sid: MB.User.sid
                            };
                            o[instance.profile.general.primarykey] = id;
                            MB.Core.sendQuery(o, function (res) {
                                toastr.success("Схема распределения #" + id + " установлена по умолчанию для схемы зала #" + instance.parentkeyvalue + " успешно!", "custom func");
                                instance.reload("data");
                            });

                            break;
                    }

                },
                items: {
                    select: {
                        name: "Выбрать"
                    },
                    setAsDefault: {
                        name: "Установить по умолчанию"
                    }
                }
            }
        });
        callback();
    };
}());

/*(function () {
    var instance = MB.O.tables["tbl_hall_scheme_price_zone"];
    var parent = MB.O[instance.parentobjecttype + "s"][instance.parentobject];
    instance.custom = function (callback) {
        console.log($("#" + instance.name).find("tbody tr[data-row='" + parent.tblselectedrow + "']"));
        if (parent.tblcallbacks) {
            for (var key in parent.tblcallbacks) {
                instance.contextmenu[key] = {
                    name: parent.tblcallbacks[key]["name"],
                    callback: parent.tblcallbacks[key]["callback"]
                };
            }
        }
        instance.contextmenu["custom777"] = {
            name: "Установить схему распоясовки по умолчанию",
            callback: function (key, options) {
                var id = options.$trigger.data("row");
                var  o = {
                    command: "operation",
                    object: "set_price_zone_default",
                    sid: MB.User.sid
                };
                o[instance.profile.general.primarykey] = id;
                MB.Core.sendQuery(o, function (res) {
                    toastr.success("Схема распоясовки #" + id + " установлена по умолчанию для схемы зала #" + instance.parentkeyvalue + " успешно!", "custom func");
                    instance.reload("data");
                });
            }
        };
        var query = "#" + instance.world + "_" + instance.name + "_wrapper table tbody tr";
        $.contextMenu("destroy", query);
        $.contextMenu({
            selector: query,
            items: instance.contextmenu
        });
        if (parent.tblselectedrow) {
            $("#" + instance.name).find("tbody tr[data-row='" + parent.tblselectedrow + "']").removeClass("justrow").addClass("selectedrow");
            console.log($("#" + instance.name).find("tbody tr[data-row='" + parent.tblselectedrow + "']"));
            callback();
        } else {
            callback();
        }
    };
}());*/
