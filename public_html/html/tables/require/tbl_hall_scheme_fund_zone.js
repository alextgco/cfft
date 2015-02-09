(function () {

    var tableInstance = MB.Tables.getTable(MB.Tables.justLoadedId);
    tableInstance.ct_instance.ctxMenuData = [
        {
            name: 'option1',
            title: 'Выбрать',
            disabled: function(){
                return false;
            },
            callback: function(){
                var id = tableInstance.data.DATA[tableInstance.ct_instance.selectedRowIndex][tableInstance.data.NAMES.indexOf(tableInstance.profile['OBJECT_PROFILE']['PRIMARY_KEY'])];
                var title = tableInstance.data.DATA[tableInstance.ct_instance.selectedRowIndex][tableInstance.data.NAMES.indexOf('NAME')];
                tableInstance.parentObject.params.setFundZoneSchemeCb(id, title);
            }
        },
        {
            name: 'option2',
            title: 'Сделать схемой по умолчанию',
            disabled: function(){
                return false;
            },
            callback: function(){
                var row = tableInstance.ct_instance.selectedRowIndex;
                var  o = {
                    command: "operation",
                    object: "set_fund_zone_default",
                    params: {
                        FUND_ZONE_ID: tableInstance.data.DATA[row][tableInstance.data.NAMES.indexOf('FUND_ZONE_ID')]
                    }
                };
                socketQuery(o, function (res) {
                    res = JSON.parse(res)['results'][0];
                    var to = res['toastr'];
                    toastr[to['type']](to['message']);
                    tableInstance.reload();
                });
            }
        }
    ];

}());

