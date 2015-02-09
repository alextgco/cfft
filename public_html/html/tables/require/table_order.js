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

    tableInstance.ct_instance.totalValues = [
        {
            key: 'Заказов',
            value: totalOrders
        },
        {
            key: 'На сумму',
            value: totalAmount + ' руб.'
        }
    ];

    var totalValues = '';
    if(tableInstance.ct_instance.totalValues){
        totalValues += '(';
        for(var i in tableInstance.ct_instance.totalValues){
            var k = tableInstance.ct_instance.totalValues[i]['key'];
            var v = tableInstance.ct_instance.totalValues[i]['value'];
            totalValues += k + ': '+ v + ((i == tableInstance.ct_instance.totalValues.length -1)? '':';');
        }
        totalValues += ')';
    }

    tableInstance.wrapper.find('.ct-total-values-wrapper').html(totalValues);


    return;

	var instance = MB.O.tables["table_order"];
	instance.custom = function (callback) {

        var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
        handsontableInstance.updateSettings({contextMenu: false});
        handsontableInstance.updateSettings({
            contextMenu: {
                callback: function(key, options) {
                    var arr, data, handsontableInstance, i, value, _i, _len;
                    if (key === "openInModal") {
                        MB.Table.createOpenInModalContextMenuItem(instance, key, options);
                    }else if(key === "openNewOrder"){
                        var params = {
                            className: 'orderModal'
                        };
                        MB.Table.createOpenInModalContextMenuItem2(instance, key, options, params);

                        return;

                        var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                        data = handsontableInstance.getData();
                        var row_num = handsontableInstance.getSelected()[0];
                        var orderId = instance.data.data[row_num][instance.data.names.indexOf('ORDER_ID')];



                        MB.Core.modalWindows.init({
                            wrapper :          undefined,
                            className :        'orderModal',
                            wrapId :           MB.Core.guid(),
                            resizable :        true,
                            title :            'Заказ № '+orderId,
                            status :           'Зарезервирован',
                            content :          'empty content',
                            bottomButtons :    undefined,
                            startPosition :    'fullscreen',
                            draggable :        false,
                            top :              0,
                            left :             0,
                            waitForPosition :  undefined,
                            active :           true,
                            inMove :           false,
                            activeHeaderElem : undefined,
                            footerButton :     undefined,
                            contentHeight :    0
                        }).render();
                    }else if('resentEmail'){
//                        var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
//                        data = handsontableInstance.getData();
//                        var row_num = handsontableInstance.getSelected()[0];
//                        var orderId = instance.data.data[row_num][instance.data.names.indexOf('ORDER_ID')];
//
//                        MB.Core.sendQuery({
//                            command: 'operation',
//                            object: 'resend_tickets_for_customer',
//                            sid: MB.User.sid,
//                            order_id: orderId
//                        }, function(res){
//                            console.log(res);
//                        });
                    }


//                    $('.spinner .btn:first-of-type').on('click', function() {
//                        var val = parseInt($('.spinner input').val(), 10) + 1;
//                        $('.spinner input').val(val);
//                    });
//                    $('.spinner .btn:last-of-type').on('click', function() {
//                        if($('.spinner input').val() != 1){
//                            var val = parseInt($('.spinner input').val(), 10) - 1;
//                            $('.spinner input').val(val);
//                        }
//
//                    });
//                    $('.spinner input').on('blur', function(){
//                        if($('.spinner input').val()<=0){
//                            $('.spinner input').val(1);
//                        }
//                    })
                },
                items: {
                    openInModal: {
                        name: "Открыть в форме..."
                    },
                    openNewOrder: {
                        name: "Открыть новую форму"
                    }
//                    resentEmail: {
//                        name: "Переотправить электронный билет"
//                    }
                }
            }
        });


		if (instance.profile.general.filterWhere["STATUS2"] == null) {
			instance.profile.general.filterWhere["STATUS2"] = {
				type: "notIn",
				value: "('CANCELED', 'RETURNED', 'RETURNED_REALIZATION', 'DEFECTIVE')"
			};
			var title = "Не показывать  отмененные,возвращенные и забракованные";
			instance.$container.find(".top-panel > .row").append("<div class='col-md-1' title='"+title+"'><input type='checkbox' class='statusToggler' checked> Скрыть</div>");
			instance.$container.find(".top-panel .statusToggler").on("click", function (e) {
				var checked = $(e.target).prop("checked");
				if (checked) {
					instance.profile.general.filterWhere["STATUS2"] = {
						type: "notIn",
						value: "('CANCELED', 'RETURNED', 'RETURNED_REALIZATION', 'DEFECTIVE')"
					};
					instance.reload("data");
				} else {
					delete instance.profile.general.filterWhere["STATUS2"];
					instance.reload("data");
				}
			});
			instance.reload("data");
		}
		callback();
	};
}());


