(function () {

	var formID = MB.Forms.justLoadedId;
	var formInstance = MB.Forms.getForm('form_action', formID);
	var formWrapper = $('#mw-' + formInstance.id);

	var modalInstance = MB.Core.modalWindows.windows.getWindow(formID);
	modalInstance.stick = 'top';
	modalInstance.stickModal();


	var defaultImagePath = 'assets/img/default-action-image.png';
	var posterImageWrapper = formWrapper.find('.posterImageWrapper');
	var imageUrl = (posterImageWrapper.find('input.fn-control').attr('value') == '') ? defaultImagePath : 'upload/' + posterImageWrapper.find('input.fn-control').attr('value');
	var imageName = (posterImageWrapper.find('input.fn-control').attr('value') == '') ? 'Постер мероприятия' : posterImageWrapper.find('input.fn-control').attr('value');

	posterImageWrapper.find('img').attr('src', imageUrl);
	posterImageWrapper.find('.fn-field-image-name').html(imageName);

	var il = new ImageLoader({delivery: delivery});

	formWrapper.find('.fn-field-image-change').off('click').on('click', function () {
		il.start({
			success: function (fileUID) {
				var tmpObj = {
					data: fileUID.base64Data,
					name: fileUID.name,
					id: fileUID.uid
				};
				formWrapper.find('.fn-field-image-input').val(tmpObj.name).trigger('input');
				formWrapper.find('.fn-filed-image-image img').attr('src', tmpObj.data);
				formWrapper.find('.fn-field-image-name').html(tmpObj.name);
			}
		});
	});

	formWrapper.find('.fn-field-image-delete').off('click').on('click', function () {
		formWrapper.find('.fn-field-image-input').val('').trigger('input');
		formWrapper.find('.fn-filed-image-image img').attr('src', defaultImagePath);
		formWrapper.find('.fn-field-image-name').html('Постер мероприятия');
	});


//	var hallSelectWrapper = formWrapper.find('.hall-Select');
//	var hallSchemeSelectWrapper = formWrapper.find('.hall-scheme-Select');
//
//	var hallSelect = MB.Core.select3.list.getSelect(hallSelectWrapper.find('.select3-wrapper').attr('id'));
//	var hallSchemeSelect = MB.Core.select3.list.getSelect(hallSchemeSelectWrapper.find('.select3-wrapper').attr('id'));
//
//	$(hallSelect).on('changeVal', function (e, was, now) {
//		var strWhere = '';
//		if (now.id != '') {
//			strWhere = 'HALL_ID = ' + now.id;
//			hallSchemeSelect.whereString = strWhere;
//		} else {
//			strWhere = '';
//			hallSchemeSelect.whereString = strWhere;
//		}
//	});

	var goToRePrice = formWrapper.find('.go-to-re-price');
	var goToReFund = formWrapper.find('.go-to-re-fund');
	var goToEditor = formWrapper.find('.go-to-editor');
	var goToPrint = formWrapper.find('.go-to-print');
	var createActionScheme = formWrapper.find('.create-action-scheme');

	if (formInstance.data.DATA[0][formInstance.data.NAMES.indexOf('ACTION_SCHEME_CREATED')] == 'TRUE') {
		createActionScheme.addClass('disabled');
	}
	if (formInstance.data.DATA[0][formInstance.data.NAMES.indexOf('ACTION_SCHEME_CREATED')] == 'FALSE' || formInstance.data.DATA[0][formInstance.data.NAMES.indexOf('ACTION_TYPE')] == 'ACTION_WO_PLACES') {
		goToRePrice.addClass('disabled');
		goToReFund.addClass('disabled');
	}
	if (formInstance.data.DATA[0][formInstance.data.NAMES.indexOf('ACTION_SCHEME_CREATED')] == 'FALSE' || formInstance.data.DATA[0][formInstance.data.NAMES.indexOf('HALL_SCHEME')] == '' || formInstance.data.DATA[0][formInstance.data.NAMES.indexOf('ACTION_TYPE')] == 'ACTION_WO_PLACES') {
		goToEditor.addClass('disabled');
	}

	goToRePrice.off('click').on('click', function () {
		if ($(this).hasClass('disabled')) return;
		modalInstance.collapse();
		var title = formInstance.profile['OBJECT_PROFILE']['CLIENT_OBJECT_NAME'] + ' ' + formInstance.activeId;
		MB.Core.switchModal({
			type: "content",
			filename: "action_priceZones",
			params: {action_id: formInstance.activeId, title: title, label: 'Схема переоценки'}
		});
	});

	goToReFund.off('click').on('click', function () {
		if ($(this).hasClass('disabled')) return;
		modalInstance.collapse();
		var title = formInstance.profile['OBJECT_PROFILE']['CLIENT_OBJECT_NAME'] + ' ' + formInstance.activeId;
		MB.Core.switchModal({
			type: "content",
			filename: "action_fundZones",
			params: {action_id: formInstance.activeId, title: title, label: 'Схема перераспределения'}
		});
	});

	goToEditor.off('click').on('click', function () {
		if ($(this).hasClass('disabled')) return;
		modalInstance.collapse();
		var hall_scheme_id = formInstance.data.DATA[formInstance.data.NAMES.indexOf('HALL_SCHEME_ID')];
		var hall_id = formInstance.data.DATA[formInstance.data.NAMES.indexOf('HALL_ID')];

		MB.Core.switchModal({
			type: "content",
			filename: "action_mapEditor",
			params: {
				hall_scheme_id: hall_scheme_id,
				action_id: formInstance.activeId,
				hall_id: hall_id,
				title: 'Редактор схемы мероприятия, схема зала:' + hall_scheme_id,
				label: 'Редактор схемы мероприятия '
			}
		});
	});

	goToPrint.off('click').on('click', function () {
		if ($(this).hasClass('disabled')) return;
		var get = "?sid=" + MB.User.sid + "&ACTIVE_ID=" + formInstance.activeId + "&name=" + formInstance.name;
		get += "&subcommand=delivery_note_order";
		var iframe = $('<iframe style="width:0; height:0; overflow: hidden;" class="printIframe" src="html/forms/print_form.html' + get + '"></iframe>');
		iframe.appendTo('body');
	});

	createActionScheme.off('click').on('click', function () {
		if ($(this).hasClass('disabled')) return;
		bootbox.dialog({
			message: "Подтвердите создание схемы мероприятия. Это может занять некоторое время",
			title: "Создание схемы мероприятия",
			buttons: {
				ok: {
					label: "Создать схему",
					className: "yellow",
					callback: function () {
						var o = {
							command: 'operation',
							object: 'create_action_scheme',
							params: {
								action_id: formInstance.activeId
							}
						};
						//tableInstance.ct_instance.notify({type: true, text: 'Идет процесс создания схемы мероприятия...'});
						socketQuery(o, function (res) {
							res = JSON.parse(res);
							res = res['results'][0];
							toastr[res['toastr']['type']](res['toastr']['message']);
							//tableInstance.ct_instance.notify({type: false});
							formInstance.reload();
						});
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
	});

})();