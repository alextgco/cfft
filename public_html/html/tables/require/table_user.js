(function () {

    var tableNId = $('.page-content-wrapper .classicTableWrap').data('id');
    var tableInstance = MB.Tables.getTable(tableNId);

    var totalOrders = tableInstance.data.DATA.length;
    var totalAmount = 0;
    for(var i in tableInstance.data.DATA){
        var item = tableInstance.data.DATA[i];
        var price = item[tableInstance.data.NAMES.indexOf('CASH_AMOUNT')];
        totalAmount += +price;
    }

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
            name: 'option2',
            title: 'Отправить пользователям',
            disabled: function(){
                return false;
            },
            callback: function(){
                var logins = [];
                var selection = tableInstance.ct_instance.selection;
                for (var i in selection) {
                    var login = tableInstance.data.DATA[selection[i]][tableInstance.data.NAMES.indexOf('LOGIN')];
                    logins.push(login);
                }
/*
                var activeId = tableInstance.data.DATA[row][tableInstance.data.NAMES.indexOf(tableInstance.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')[0])];
                var logins = tableInstance.data.DATA[row][tableInstance.data.NAMES.indexOf('LOGIN')];*/
                bootbox.prompt("Введите сообщение:", function(result) {
                    if (result != null) {
                        sendToAll({message:result,users:logins});
                    }
                });
                /*var msg = prompt('Введите сообщение:');
                if (msg==''){
                    return;
                }
                sendToAll({message:msg,users:logins});*/
            }
        },
        {
            name: 'option3',
            title: 'Отправить всем пользователям',
            disabled: function(){
                return false;
            },
            callback: function(){
                bootbox.prompt("Введите сообщение:", function(result) {
                    if (result !== null) {
                        sendToAll({message:result});
                    }
                });
               /* var msg = prompt('Введите сообщение:');
                if (msg==''){
                    return;
                }
                sendToAll({message:msg});*/
            }
        }
    ];

}());


