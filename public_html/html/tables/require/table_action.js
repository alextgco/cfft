(function () {
//По каждому пункту меню:
	//- Доступно если:
	// А) Все выбранные строки соответсвуют условиям
	// Б) Некоторые из выбранных строк соответствуют уловиям
	// В) Игнорировать выделение, смотреть соответствие только для выбранного пункта
	// Г) ... что-то еще
	//- Выполняется для:
	// А) всех доступных к выполнению
	// Б) Выбранный пункт
	// В) ... что-то еще
	// Г) описание происходящего если оно "необычное"

	var tableNId = $('.page-content-wrapper .classicTableWrap').data('id');
	console.log(tableNId);
	var tableInstance = MB.Tables.getTable(tableNId);
	tableInstance.ct_instance.ctxMenuData = [
		{
			name: 'option1',
			title: 'Открыть в форме', // a,a
			disabled: function () {
				return false;
			},
			callback: function () {
				tableInstance.openRowInModal();
			}
		},
		{
			name: 'option2',
			title: 'Создать схему мероприятия',//б,а
			disabled: function () {

				var c = tableInstance.ct_instance.isDisabledCtx({
					col_names: ['ACTION_SCHEME_CREATED', 'ACTION_TYPE'],
					matching: ['equal', 'not_equal'],
					col_values: ['FALSE', 'ACTION_WO_PLACES']
				});

				return !~c.indexOf(true);
			},
			callback: function () {

				var c = tableInstance.ct_instance.isDisabledCtx({
						col_names: ['ACTION_SCHEME_CREATED', 'ACTION_TYPE'],
						matching: ['equal', 'not_equal'],
						col_values: ['FALSE', 'ACTION_WO_PLACES']
					}),
					d = tableInstance.ct_instance.getFlatSelectionArray(),
					rows = [];

				for (var i in c) if (c[i]) rows.push(d[i]);

				if (rows.length) createScheme(rows);

				function createScheme(rows) {
					var el = rows.splice(0, 1)[0];

					bootbox.dialog({
						message: "Подтвердите создание схемы мероприятия " + el[tableInstance.data.NAMES.indexOf('NAME')],
						title: "Создание схемы мероприятия",
						buttons: {
							ok: {
								label: "Создать схему",
								className: "yellow",
								callback: function () {
									var id = el[tableInstance.data.NAMES.indexOf('ACTION_ID')];
									var o = {
										command: 'operation',
										object: 'create_action_scheme',
										params: {
											action_id: id
										}
									};
									tableInstance.ct_instance.notify({
										type: true,
										text: 'Идет процесс создания схемы мероприятия...'
									});
									socketQuery(o, function (res) {
										res = JSON.parse(res);
										res = res['results'][0];
										toastr[res['toastr']['type']](res['toastr']['message']);
										tableInstance.ct_instance.notify({type: false});
										if (rows.length) createScheme(rows);
										else tableInstance.reload();
									});
								}
							},
							cancel: {
								label: "Отмена",
								className: "blue",
								callback: function () {
									if (rows.length) createScheme(rows);
									else tableInstance.reload();
								}
							}
						}
					});
				}
			}
		},
		{
			name: 'option3',
			title: 'Создать / редактирвать входные билеты без мест',//б,а
			disabled: function () {

				var c1 = tableInstance.ct_instance.isDisabledCtx({
						col_names: ['ACTION_TYPE'],
						matching: ['equal'],
						col_values: ['ACTION_WO_PLACES']
					}),
					c2 = tableInstance.ct_instance.isDisabledCtx({
						col_names: ['ACTION_SCHEME_CREATED'],
						matching: ['equal'],
						col_values: ['FALSE']
					}),
					c = [];

				for (var i in c1) c.push(c1[i] || c2[i]);
				console.log(c2, tableInstance.ct_instance.getFlatSelectionArray(), tableInstance.data.NAMES)

				return !~c.indexOf(true);
			},
			callback: function () {

				var c1 = tableInstance.ct_instance.isDisabledCtx({
						col_names: ['ACTION_TYPE'],
						matching: ['equal'],
						col_values: ['ACTION_WO_PLACES']
					}),
					c2 = tableInstance.ct_instance.isDisabledCtx({
						col_names: ['ACTION_SCHEME_CREATED'],
						matching: ['equal'],
						col_values: ['FALSE']
					}),
					c = [],
					d = tableInstance.ct_instance.getFlatSelectionArray(),
					rows = [];

				for (var i in c1) c.push(c1[i] || c2[i]);
				for (var i in c) if (c[i]) rows.push(d[i]);

				if (rows.length) createSchemeWOPlaces(rows);

				function createSchemeWOPlaces(rows) {
					var el = rows.splice(0, 1)[0];

					var id = el[tableInstance.data.NAMES.indexOf('ACTION_ID')];
					var formId = MB.Core.guid();
					var form = new MB.FormN({
						id: formId,
						name: 'form_action_scheme_ticket_zone',
						type: 'form',
						ids: [id]
					});

					form.create(function () {
						var modal = MB.Core.modalWindows.windows.getWindow(formId);
						$(modal).on('close', function () {
							if (rows.length) createSchemeWOPlaces(rows);
							else tableInstance.reload();
						});
					});
				}
			}
		},
		{
			name: 'option4',
			title: 'Удалить схему мероприятия',//б,а
			disabled: function () {
				var c = tableInstance.ct_instance.isDisabledCtx({
					col_names: ['ACTION_SCHEME_CREATED'],
					matching: ['equal'],
					col_values: ['TRUE']
				});

				return !~c.indexOf(true);
			},
			callback: function () {

				var c = tableInstance.ct_instance.isDisabledCtx({
						col_names: ['ACTION_SCHEME_CREATED'],
						matching: ['equal'],
						col_values: ['TRUE']
					}),
					d = tableInstance.ct_instance.getFlatSelectionArray(),
					rows = [];

				for (var i in c) if (c[i]) rows.push(d[i]);

				var mess = (rows.length > 1) ? "Вы уверены что хотите удалить схемы выбранных мероприятий?" : "Вы уверены что хотите удалить схему мероприятия?";

				bootbox.dialog({
					message: mess,
					title: "Подтверждение",
					buttons: {
						ok: {
							label: "Удалить",
							className: "yellow",
							callback: function () {
								var count = 1;
								tableInstance.ct_instance.notify({
									type: true,
									text: 'Идет процесс удаления схемы мероприятия...'
								});
								for (var i in rows) {
									var id = rows[i][tableInstance.data.NAMES.indexOf('ACTION_ID')];

									var o = {
										command: 'operation',
										object: 'delete_action_scheme',
										params: {
											action_id: id
										}
									};

									socketQuery(o, function (res) {
										res = JSON.parse(res);
										res = res['results'][0];
										toastr[res['toastr']['type']](res['toastr']['message']);
										if (count == rows.length) {
											tableInstance.ct_instance.notify({type: false});
											tableInstance.reload();
										}
										count++;
									});
								}
							}
						},
						cancel: {
							label: "Отмена",
							className: "blue",
							callback: function () {

							}
						}
					}
				});
			}
		},
		{
			name: 'option5',
			title: 'Перейти к перераспределению',//в,б
			disabled: function () {
				var row = tableInstance.data.DATA[tableInstance.ct_instance.selectedRowIndex];
				return row[tableInstance.data.NAMES.indexOf('ACTION_SCHEME_CREATED')] == 'FALSE' || row[tableInstance.data.NAMES.indexOf('ACTION_TYPE')] == 'ACTION_WO_PLACES';
			},
			callback: function () {
				var row = tableInstance.data.DATA[tableInstance.ct_instance.selectedRowIndex];
				var id = row[tableInstance.data.NAMES.indexOf('ACTION_ID')];
				var title = row[tableInstance.data.NAMES.indexOf('NAME')] + ' | ' + row[tableInstance.data.NAMES.indexOf('HALL')];

				MB.Core.switchModal({
					type: "content",
					filename: "action_fundZones",
					params: {
						action_id: id,
						title: title,
						label: 'Схема перераспределения'
					}
				});
			}
		},
		{
			name: 'option10',
			title: 'Перейти к перераспределению2',//в,б
			disabled: function () {
				var row = tableInstance.data.DATA[tableInstance.ct_instance.selectedRowIndex];
				return row[tableInstance.data.NAMES.indexOf('ACTION_SCHEME_CREATED')] == 'FALSE' || row[tableInstance.data.NAMES.indexOf('ACTION_TYPE')] == 'ACTION_WO_PLACES';
			},
			callback: function () {
				var row = tableInstance.data.DATA[tableInstance.ct_instance.selectedRowIndex];
				var id = row[tableInstance.data.NAMES.indexOf('ACTION_ID')];
				var title = row[tableInstance.data.NAMES.indexOf('NAME')] + ' | ' + row[tableInstance.data.NAMES.indexOf('HALL')];

				socketQuery({
					command: "get",
					object: "action_scheme",
					params: {
						action_id: id
					}
				}, function(res){
					MB.Core.switchModal({
						type: "content",
						filename: "action_fundZones",
						isNew: true,
						params: {
							action_id: id,
							title: title,
							label: 'Схема перераспределения',
							action_scheme_res: JSON.parse(res)['results'][0]
						}
					});
				});

			}
		},
		{
			name: 'option6',
			title: 'Перейти к переоценке',//в,б
			disabled: function () {
				var row = tableInstance.data.DATA[tableInstance.ct_instance.selectedRowIndex];
				return row[tableInstance.data.NAMES.indexOf('ACTION_SCHEME_CREATED')] == 'FALSE' || row[tableInstance.data.NAMES.indexOf('ACTION_TYPE')] == 'ACTION_WO_PLACES';
			},
			callback: function () {
				var row = tableInstance.data.DATA[tableInstance.ct_instance.selectedRowIndex];
				var id = row[tableInstance.data.NAMES.indexOf('ACTION_ID')];
				var title = row[tableInstance.data.NAMES.indexOf('NAME')] + ' | ' + row[tableInstance.data.NAMES.indexOf('HALL')];

				MB.Core.switchModal({
					type: "content",
					filename: "action_priceZones",
					params: {
						action_id: id,
						title: title,
						label: 'Схема переоценки'
					}
				});
			}
		},
		{
			name: 'option11',
			title: 'Перейти к переоценке2',//в,б
			disabled: function () {
				var row = tableInstance.data.DATA[tableInstance.ct_instance.selectedRowIndex];
				return row[tableInstance.data.NAMES.indexOf('ACTION_SCHEME_CREATED')] == 'FALSE' || row[tableInstance.data.NAMES.indexOf('ACTION_TYPE')] == 'ACTION_WO_PLACES';
			},
			callback: function () {
				var row = tableInstance.data.DATA[tableInstance.ct_instance.selectedRowIndex];
				var id = row[tableInstance.data.NAMES.indexOf('ACTION_ID')];
				var title = row[tableInstance.data.NAMES.indexOf('NAME')] + ' | ' + row[tableInstance.data.NAMES.indexOf('HALL')];

				MB.Core.switchModal({
					type: "content",
					filename: "action_priceZones",
					isNew: true,
					params: {
						action_id: id,
						title: title,
						label: 'Схема переоценки'
					}
				});
			}
		},
		{
			name: 'option7',
			title: 'Перейти к редактору',//в,б
			disabled: function () {
				var row = tableInstance.data.DATA[tableInstance.ct_instance.selectedRowIndex];
				return row[tableInstance.data.NAMES.indexOf('ACTION_SCHEME_CREATED')] == 'FALSE' || row[tableInstance.data.NAMES.indexOf('HALL_SCHEME')] == '' || row[tableInstance.data.NAMES.indexOf('ACTION_TYPE')] == 'ACTION_WO_PLACES';
			},
			callback: function () {
				var dataNames = tableInstance.data.NAMES;
				var row = tableInstance.data.DATA[tableInstance.ct_instance.selectedRowIndex];

				var hall_scheme_id = row[dataNames.indexOf('HALL_SCHEME_ID')];
				var action_id = row[dataNames.indexOf('ACTION_ID')];
				var hall_id = row[dataNames.indexOf('HALL_ID')];

				MB.Core.switchModal({
					type: "content",
					filename: "action_mapEditor",
					params: {
						hall_scheme_id: hall_scheme_id,
						action_id: action_id,
						hall_id: hall_id,
						title: 'Редактор схемы мероприятия, схема зала:' + hall_scheme_id,
						label: 'Редактор схемы мероприятия '
					}
				});
			}
		}
	];

}());

