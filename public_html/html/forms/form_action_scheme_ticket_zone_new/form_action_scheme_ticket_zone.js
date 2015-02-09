(function () {

	var formID = MB.Forms.justLoadedId;
	var formInstance = MB.Forms.getForm('form_action_scheme_ticket_zone', formID);
	formInstance.lowerButtons = [
		{
			name: 'option1',
			title: 'Удалить всю схему мероприятия',
			icon: 'fa-trash-o',
			color: 'red',
			className: 'deleteScheme',
			disabled: function(){
				return formInstance.data.DATA[0][formInstance.data.NAMES.indexOf('ACTION_SCHEME_CREATED')] == 'FALSE';
			},
			callback: function(){
				bootbox.dialog({
					message: "Вы уверены что хотите удалить схему мероприятия?",
					title: "Предупреждение",
					buttons: {
						ok: {
							label: "Да, уверен",
							className: "yellow",
							callback: function () {
								socketQuery({
										command: "operation",
										object: "delete_action_scheme",
										params: {
											action_id: formInstance.activeId
										}
									},
									function (data) {
										data = JSON.parse(data).results[0];
										console.log(data);
										if (data.code == 0) {
											toastr[data.toastr.type](data.toastr.message, data.toastr.title);
											formInstance.reload("data");
										} else {
											toastr[data.toastr.type](data.toastr.message, data.toastr.title);
											formInstance.reload("data");
										}
									});

							}
						},
						cancel: {
							label: "Отменить",
							className: "blue",
							callback: function () {

							}
						}
					}
				});
			}
		}
	];
}());