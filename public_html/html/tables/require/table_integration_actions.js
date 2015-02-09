(function(){

    var tableNId = $('.page-content-wrapper .classicTableWrap').data('id');
    var tableInstance = MB.Tables.getTable(tableNId);
    tableInstance.ct_instance.ctxMenuData = [
        {
            name: 'option1',
            title: 'Импортировать мероприятие',
            disabled: function(){
                return false;
            },
            callback: function(){
                tableInstance.ct_instance.notify({
                    type: true,
                    text: 'Идет процесс импорта...'
                });
                tableInstance.makeOperation('integration_import_action',function(){
                    tableInstance.ct_instance.notify({
                        type: false,
                        text: 'Идет процесс импорта...'
                    });
                });
            }
        }

    ];

    $('.page-content-wrapper .classicTableWrap').append('<div class="btn integration_load_all_actions">Загрузить мерприятия из шлюза</div><div class="btn  integration_delete_unused_actions">Удалить неиспользуемые</div>');

    $('.integration_load_all_actions').on('click', function(){
        tableInstance.makeOperation('integration_load_all_actions');
    });

    $('.integration_delete_unused_actions').on('click', function(){
        tableInstance.makeOperation('integration_delete_unused_actions');
    });
}());

