(function () {
    var instance = MB.O.tables["tbl_hall_scheme_fund_zone"];
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
            name: "Установить схему распределения по умолчанию",
            callback: function (key, options) {
                var id = options.$trigger.data("row");
                var  o = {
                    command: "operation",
                    object: "set_fund_zone_default",
                    sid: MB.User.sid
                };
                o[instance.profile.general.primarykey] = id;
                MB.Core.sendQuery(o, function (res) {
                    toastr.success("Схема распределения #" + id + " установлена по умолчанию для схемы зала #" + instance.parentkeyvalue + " успешно!", "custom func");
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
}());
