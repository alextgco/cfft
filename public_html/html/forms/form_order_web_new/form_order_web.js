(function () {
	var modal = $('.mw-wrap').last();
	var formID = modal.attr('id').substr(3);
	var formInstance = MB.Forms.getForm('form_order_web', formID);
	var formWrapper = $('#mw-' + formInstance.id);

	formWrapper.find('.mw-save-form').hide(0);

	var ticketStatus = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf('STATUS')];

	formInstance.lowerButtons = [
		{
			name: 'option2',
			title: 'Печать',
			icon: 'fa-print',
			color: 'blue',
			className: '',
			disabled: function () {
				return false;
			},
			callback: function () {
				console.log(formInstance);
				var get = "?sid=" + MB.User.sid + "&ACTIVE_ID=" + formInstance.activeId + "&name=" + formInstance.name;
				get += "&subcommand=delivery_note_order";
				var iframe = $('<iframe style="width:0; height:0; overflow: hidden;" class="printIframe" src="html/forms/print_form.html' + get + '"></iframe>');
				iframe.appendTo('body');
			}
		},
		{
			name: 'option3',
			title: 'Отменить заказ',
			icon: 'fa-times',
			color: 'red',
			className: '',
			disabled: function () {
				return ticketStatus !== 'PAID';
			},
			callback: function () {
				formInstance.makeOperation('cancel_order');
			}
		}
	];

}());
