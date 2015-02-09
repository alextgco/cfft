(function () {

    var tableNId = $('.page-content-wrapper .classicTableWrap').data('id');
    var tableInstance = MB.Tables.getTable(tableNId);

    tableInstance.ct_instance.ctxMenuData = [
        {
            name: 'option1',
            title: 'Открыть в форме',
            disabled: function(){
                return false;
            },
            callback: function(){
                tableInstance.openRowInModal();
            }
        },
        {
            name: 'option3',
            title: 'История заказа',
            disabled: function(){
                return false;
            },
            callback: function(){
                var row = tableInstance.ct_instance.selectedColIndex;
                var activeId = tableInstance.data.DATA[row][tableInstance.data.NAMES.indexOf(tableInstance.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')[0])];
                var orderHistoryId = MB.Core.guid();
                var history = new MB.ContentNew({
                    id:         orderHistoryId,
                    filename:   'order_history',
                    params:{
                        activeId:   activeId,
                        label:      'История заказа',
                        title:      'История заказа № '+ activeId
                    }
                });
                history.create(function(){

                });
            }
        }
    ];

}());




