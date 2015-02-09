(function () {

	var tableInstance = MB.Tables.getTable(MB.Tables.justLoadedId);

	tableInstance.ct_instance.ctxMenuData = [
		{
			name: 'option1',
			title: 'Открыть в форме',
			disabled: function () {
				return false;
			},
			callback: function () {
				tableInstance.openRowInModal();
			}
		},
		{
			name: 'option2',
			title: function () {
				return (tableInstance.ct_instance.getFlatSelectionArray().length > 1) ? 'Билеты к оплате' : 'Билет к оплате';
			},
			disabled: function () {
				var c = tableInstance.ct_instance.isDisabledCtx({
					col_names: ['STATUS'],
					matching: ['equal'],
					col_values: ['RESERVED']
				});

				return !~c.indexOf(true);
			},
			callback: function () {
				tableInstance.makeOperation({
					operationName: 'to_pay_ticket',
					params: {
						col_names: ['STATUS'],
						matching: ['equal'],
						col_values: ['RESERVED']
					},
					revert: true
				});
			}
		},
		{
			name: 'option3',
			title: function () {
				return (tableInstance.ct_instance.getFlatSelectionArray().length > 1) ? 'Отменить билеты' : 'Отменить билет';
			},
			disabled: function () {
				var c1 = tableInstance.ct_instance.isDisabledCtx({
					col_names: ['STATUS'],
					matching: ['equal'],
					col_values: ['RESERVED']
				});
				var c2 = tableInstance.ct_instance.isDisabledCtx({
					col_names: ['STATUS'],
					matching: ['equal'],
					col_values: ['TO_PAY']
				});
				var c = [];
				for (var i in c1) c.push(c1[i] || c2[i]);

				return !~c.indexOf(true);
			},
			callback: function () {
				tableInstance.makeOperation({
					operationName: 'cancel_ticket',
					params: [
						{
							col_names: ['STATUS'],
							matching: ['equal'],
							col_values: ['RESERVED']
						},
						{
							col_names: ['STATUS'],
							matching: ['equal'],
							col_values: ['TO_PAY']
						}
					],
					revert: true
				});
			}
		},
		{
			name: 'option4',
			title: function () {
				return (tableInstance.ct_instance.getFlatSelectionArray().length > 1) ? 'Вернуть билеты' : 'Вернуть билет';
			},
			disabled: function () {
				var c1 = tableInstance.ct_instance.isDisabledCtx({
					col_names: ['STATUS'],
					matching: ['equal'],
					col_values: ['CLOSED']
				});
				var c2 = tableInstance.ct_instance.isDisabledCtx({
					col_names: ['STATUS'],
					matching: ['equal'],
					col_values: ['ON_REALIZATION']
				});
				var c3 = tableInstance.ct_instance.isDisabledCtx({
					col_names: ['STATUS'],
					matching: ['equal'],
					col_values: ['CLOSED_REALIZATION']
				});
				var c = [];
				for (var i in c1) c.push(c1[i] || c2[i] || c3[i]);

				return !~c.indexOf(true);
			},
			callback: function () {
				tableInstance.makeOperation({
					operationName: 'return_ticket',
					params: [{
						col_names: ['STATUS'],
						matching: ['equal'],
						col_values: ['CLOSED']
					},{
						col_names: ['STATUS'],
						matching: ['equal'],
						col_values: ['ON_REALIZATION']
					},{
						col_names: ['STATUS'],
						matching: ['equal'],
						col_values: ['CLOSED_REALIZATION']
					}],
					revert: true
				});
			}
		},
		{
			name: 'option5',
			title: function () {
				return (tableInstance.ct_instance.getFlatSelectionArray().length > 1) ? 'Напечатать билеты' : 'Напечатать билет';
			},
			disabled: function () {
				var c = tableInstance.ct_instance.isDisabledCtx({
					col_names: ['PRINT_STATUS', 'STATUS'],
					matching: ['equal', 'equal'],
					col_values: ['NOT_PRINTED', 'TO_PAY']
				});

				return !~c.indexOf(true);
			},
			callback: function () {
				var d = tableInstance.ct_instance.getFlatSelectionArray(),
					c = tableInstance.ct_instance.isDisabledCtx({
						col_names: ['PRINT_STATUS', 'STATUS'],
						matching: ['equal', 'equal'],
						col_values: ['NOT_PRINTED', 'TO_PAY']
					});

				var selArr = [];
				for (var i in c) if (c[i]) selArr.push(d[i]);


				for (var i in selArr) {
					var item = selArr[i];
					send('print_ticket', {
						guid: MB.Core.getUserGuid(),
						ticket_id: item[tableInstance.data.NAMES.indexOf('ORDER_TICKET_ID')]
					}, function (res) {
						console.log('print_ticket', res);
						tableInstance.reload();
					});
				}
			}
		},
		{
			name: 'option6',
			title: function () {
				return (tableInstance.ct_instance.getFlatSelectionArray().length > 1) ? 'Забраковать бланки' : 'Забраковать бланк';
			},
			disabled: function () {
				var c1 = tableInstance.ct_instance.isDisabledCtx({
					col_names: ['STATUS', 'PRINT_STATUS'],
					matching: ['equal', 'equal'],
					col_values: ['CLOSED', 'PRINTED']
				});
				var c2 = tableInstance.ct_instance.isDisabledCtx({
					col_names: ['STATUS', 'PRINT_STATUS'],
					matching: ['equal', 'equal'],
					col_values: ['CLOSED_REALIZATION', 'PRINTED']
				});
				var c = [];
				for (var i in c1) c.push(c1[i] || c2[i]);

				return !~c.indexOf(true);
			},
			callback: function () {
				tableInstance.makeOperation({
					operationName: 'defect_blank',
					params: [{
						col_names: ['STATUS', 'PRINT_STATUS'],
						matching: ['equal', 'equal'],
						col_values: ['CLOSED', 'PRINTED']
					}, {
						col_names: ['STATUS', 'PRINT_STATUS'],
						matching: ['equal', 'equal'],
						col_values: ['CLOSED_REALIZATION', 'PRINTED']
					}],
					revert: true
				});
			}
		},
		{
			name: 'option7',
			title: function () {
				return (tableInstance.ct_instance.getFlatSelectionArray().length > 1) ? 'Забраковать билеты' : 'Забраковать билет';
			},
			disabled: function () {
				var c1 = tableInstance.ct_instance.isDisabledCtx({
					col_names: ['STATUS'],
					matching: ['equal'],
					col_values: ['CLOSED']
				});
				var c2 = tableInstance.ct_instance.isDisabledCtx({
					col_names: ['STATUS'],
					matching: ['equal'],
					col_values: ['PAID']
				});

				var c = [];
				for (var i in c1) c.push(c1[i] || c2[i]);

				return !~c.indexOf(true);
			},
			callback: function () {
				tableInstance.makeOperation({
					operationName: 'defect_blank',
					params: [{
						col_names: ['STATUS'],
						matching: ['equal'],
						col_values: ['CLOSED']
					},{
						col_names: ['STATUS'],
						matching: ['equal'],
						col_values: ['PAID']
					}],
					revert: true
				});
			}
		}
	];

}());
