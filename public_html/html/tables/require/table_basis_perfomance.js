(function () {
	
	var instance = MB.O.tables["table_basis_perfomance"];
	
	var actionsBlock = instance.$container.find('.actions');
	var beforeBlock = actionsBlock.find('.save_button');
	var loadActionsButtonHtml = '<a href="#" class="btn green" id="download_actions_from_basis"> <i class="fa fa-download"></i>&nbsp;Загрузить&nbsp;мероприятия</a>';
	var removeEmptyActionsHtml = '<a href="#" class="btn green" id="removeEmptyActions"> <i class="fa fa-trash-o"></i>&nbsp;Удалить&nbsp;неиспользуемые</a>';

	beforeBlock.before(loadActionsButtonHtml);
	beforeBlock.before(removeEmptyActionsHtml);

	var download_actions_from_basis = $('#download_actions_from_basis');
	var removeEmptyAction = $('#removeEmptyActions');

	download_actions_from_basis.on('click', function(){
		var o = {
			command: "operation",
			object: "basis_import_perfomances",
			sid: MB.User.sid
		}

		MB.Core.sendQuery(o, function(){			
			instance.reload('data');
		});

		//basis_import_perfomances
	});

	removeEmptyAction.on('click', function(){
		var o = {
			command: "operation",
			object: "basis_clear_unused",
			sid: MB.User.sid
		}

		MB.Core.sendQuery(o, function(){			
			instance.reload('data');
		});

		//basis_clear_unused
	});


	instance.custom = function (callback) {

		var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
		handsontableInstance.updateSettings({contextMenu: false});
		handsontableInstance.updateSettings({
			contextMenu: {
				callback: function(key, options) {
					var arr, data, handsontableInstance, i, value, _i, _len;
					switch (key){
						case "openInModal": 							
							var $handsontable, handsontableInstance, i, id, ids, selectedRowsInterval;
						    $handsontable = instance.$container.find(".handsontable");
						    handsontableInstance = $handsontable.handsontable("getInstance");
						    selectedRowsInterval = MB.Table.getSelectedRowsInterval(handsontableInstance);
						    ids = [];
						    i = selectedRowsInterval[0];
						    while (i <= selectedRowsInterval[1]) {
						      id = instance.data.data[i][instance.data.names.indexOf('ACTION_ID')];
						      ids.push(id);
						      ++i;
						    }
						    if (ids.length > 0) {
						      return MB.Core.switchModal({
						        type: "form",
						        ids: ids,
						        name: instance.profile.general.juniorobject,
						        params: {
						          parentobject: instance.name
						        }
						      });
						    }

						break;
						case "importPlaces":
							var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
							for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                var id_perfomance = instance.data.data[i][instance.data.names.indexOf("ID_PERFORMANCE")];
                                var o = {
									command: "operation",
									object: "basis_import_places",
									sid: MB.User.sid
								}
								o["ID_PERFORMANCE"] = id_perfomance;								

								MB.Core.sendQuery(o, function(response){
									instance.reload('data');
									toastr[response.TOAST_TYPE](response.MESSAGE);
								});
                            }
							//basis_import_places  (ID_PERFORMANCE)
						break;
						case "createHallScheme":
							var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
							for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                var id_perfomance = instance.data.data[i][instance.data.names.indexOf("ID_PERFORMANCE")];
                                var hall_id = instance.data.data[i][instance.data.names.indexOf("HALL_ID")];
                                var o = {
									command: "operation",
									object: "basis_create_hall_scheme",
									sid: MB.User.sid
								}
								o["ID_PERFORMANCE"] = id_perfomance;								
								o["HALL_ID"] = hall_id;								

								MB.Core.sendQuery(o, function(response){
									instance.reload('data');
									toastr[response.TOAST_TYPE](response.MESSAGE);
								});
                            }
							//basis_create_hall_scheme (ID_PERFORMANCE, HALL_ID)
						break;
						case "createAction":
							var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
							for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                var id_perfomance = instance.data.data[i][instance.data.names.indexOf("ID_PERFORMANCE")];
                                var hall_scheme_id = instance.data.data[i][instance.data.names.indexOf("HALL_SCHEME_ID")];
                                var o = {
									command: "operation",
									object: "basis_create_action",
									sid: MB.User.sid
								}
								o["ID_PERFORMANCE"] = id_perfomance;								
								o["HALL_SCHEME_ID"] = hall_scheme_id;								

								MB.Core.sendQuery(o, function(response){
									instance.reload('data');
									toastr[response.TOAST_TYPE](response.MESSAGE);
								});
                            }
							//basis_create_action (ID_PERFORMANCE, HALL_ID)
						break;
					}
				},
				items: {
					openInModal: {
						name: "Открыть в форме",
						disabled: function(){
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
							var disableStatus = false;
							if(selectedRows[0] == selectedRows[1]){
								if(instance.data.data[selectedRows[0]][instance.data.names.indexOf('ACTION_ID')] == ""){
									disableStatus = true;
								}
							}
							return disableStatus;
						}
					},	
					"hsep1": "---------",				
					importPlaces: {
						name: "Импортировать места",
						disabled: function(){
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
							var disableStatus = true;
							if(selectedRows[0] == selectedRows[1]){
								if(instance.data.data[selectedRows[0]][instance.data.names.indexOf('PLACES_IMPORTED')] == 'FALSE'){
									disableStatus = false;
								}
							}
							return disableStatus;
						}
					},
					createHallScheme: {
						name: "Создать схему зала",
						disabled: function () {
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
							var disableStatus = true;

							if(selectedRows[0] == selectedRows[1]){
								 
								if( instance.data.data[selectedRows[0]][instance.data.names.indexOf('PLACES_IMPORTED')] == 'TRUE' 
						         && instance.data.data[selectedRows[0]][instance.data.names.indexOf('HALL_ID')] != ""
								 && instance.data.data[selectedRows[0]][instance.data.names.indexOf('HALL_SCHEME_ID')] == "" ){

									disableStatus = false;
								}
							}  

							return disableStatus;
							//PLACES_IMPORTED=TRUE, HALL_ID заполнено HALL_SCHEME_ID - пусто
						}
					},
					createAction: {
						name: 'Создать мероприятие',
						disabled: function(){
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
							var disableStatus = true;

							if(selectedRows[0] == selectedRows[1]){
								 
								if( instance.data.data[selectedRows[0]][instance.data.names.indexOf('PLACES_IMPORTED')] == 'TRUE' 
						         && instance.data.data[selectedRows[0]][instance.data.names.indexOf('HALL_ID')] != ""
								 && instance.data.data[selectedRows[0]][instance.data.names.indexOf('HALL_SCHEME_ID')] != "" ){
								 	
									disableStatus = false;
								}
							}
							return disableStatus;
							//PLACES_IMPORTED=TRUE, HALL_ID и HALL_SCHEME_ID заполнены
						}
					}
				}
			}
		});
	callback();
	}
})();