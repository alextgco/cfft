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
            title: 'Открыть заказ',
            disabled: function(){
                return false;
            },
            callback: function(){
                var row = tableInstance.ct_instance.selectedRowIndex;
                console.log(row);
                var activeId = tableInstance.data.DATA[row][tableInstance.data.NAMES.indexOf('ORDER_ID')];

                MB.Core.switchModal({
                    type: 'form',
                    isNewModal: true,
                    name: 'form_order',
                    ids: [activeId]
                }, function(instance){
                    var formInstance = instance;
                    var formModalInstance = MB.Core.modalWindows.windows.getWindow(formInstance.id);
                    $(formModalInstance).off('close').on('close', function(){
                        tableInstance.reload();
                    });
                });
            }
        }
    ];

}());


