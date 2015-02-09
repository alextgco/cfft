

(function () {
	var instance = MB.O.tables["tbl_order_ticket"];
	var parent = MB.O.forms["form_order"];
	instance.custom = function (callback) {
		var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
		handsontableInstance.updateSettings({contextMenu: false});
		handsontableInstance.updateSettings({
			contextMenu: {
				callback: function(key, options) {
					var arr, data, handsontableInstance, i, value, _i, _len;
					switch (key){
						case "openInModal":
							MB.Table.createOpenInModalContextMenuItem(instance, key, options);
						break;
						case "goToPay":
							var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                var o = {
									command: "operation",
									object: "to_pay_ticket",
									sid: MB.User.sid
								}
								o["ORDER_TICKET_ID"] = ticketId;
								sendQueryForObj(o);
                            }
						break;
						case "goToCancel":
							var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                var o = {
			                        command: "operation",
			                        object: "cancel_ticket",
			                        sid: MB.User.sid
			                    };
								o["ORDER_TICKET_ID"] = ticketId;
								sendQueryForObj(o);
                            }
						break;
						case "goToReturn":
							var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                var o = {
									command: "operation",
									object: "return_ticket",
									sid: MB.User.sid
								};
								o["ORDER_TICKET_ID"] = ticketId;
								sendQueryForObj(o);
                            }
						break;
						case "goToPrint":
							var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                var o = {
									command: "operation",
									object: "print_ticket",
									sid: MB.User.sid
								};
								o["ORDER_TICKET_ID"] = ticketId;
								sendQueryForObj(o);
                            }
						break;
						case "goToDefectBlank":
							var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                var o = {
									command: "operation",
									object: "defect_blank",
									sid: MB.User.sid
								};
								o["ORDER_TICKET_ID"] = ticketId;
								sendQueryForObj(o);
                            }
						break;
						case "goToDefectTicket":
							var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                var o = {
									command: "operation",
									object: "defect_ticket",
									sid: MB.User.sid
								};			
								o["ORDER_TICKET_ID"] = ticketId;
								sendQueryForObj(o);
                            }
						break;
						case "goToRealization":
							var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                var o = {
									command: "operation",
									object: "on_realization_ticket",
									sid: MB.User.sid
								};		
								o["ORDER_TICKET_ID"] = ticketId;
								sendQueryForObj(o);
                            }
						break;
						case "goToRealizationPrint":
							var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                var o = {
									command: "operation",
									object: "on_realization_print_ticket",
									sid: MB.User.sid
								};	
								o["ORDER_TICKET_ID"] = ticketId;
								sendQueryForObj(o);
                            }
						break;
						case "goToCloseRealization":
							var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
							var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                var o = {
									command: "operation",
									object: "close_realization_ticket",
									sid: MB.User.sid
								};	
								o["ORDER_TICKET_ID"] = ticketId;
								sendQueryForObj(o);
                            }
						break;
					}
				},
				items: {
					openInModal: {
						name: "Открыть в форме"
					},
					goToPay: {
						name: "Перейти к оплате",
						disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var disableStatus = false;
                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                    var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    if (ticketStatus !== "RESERVED") {
                                        disableStatus = true
                                    }
                                    
                                }
                            } else {
                                var i = selectedRows[0];
                                ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                if (ticketStatus !== "RESERVED") {
                                    disableStatus = true
                                }
                            }
                            return disableStatus;
						}
					},
					goToCancel: {
						name: "Отменить билет",
						disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var disableStatus = false;
							if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                    var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    if (!(ticketStatus === "RESERVED" || ticketStatus === "TO_PAY")) {
										disableStatus = true;
									}
                                    
                                }
                            } else {
                                var i = selectedRows[0];
                                var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                if (!(ticketStatus === "RESERVED" || ticketStatus === "TO_PAY")) {
									disableStatus =  true;
								}
                            }
                            return disableStatus;
						}
					},
					goToReturn: {
						name: "Вернуть билет",
						disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var disableStatus = false;
							if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                    var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    if (!(ticketStatus === "RESERVED" || ticketStatus === "TO_PAY")) {
										disableStatus = true;
									}
                                    
                                }
                            } else {
                                var i = selectedRows[0];
                                ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                if (!(ticketStatus === "RESERVED" || ticketStatus === "TO_PAY")) {
									disableStatus =  true;
								}
                            }
                            return disableStatus;
						}
					},
					goToPrint: {
						name: "Напечатать билет",
						disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var disableStatus = false;
                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                   	var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                    if(!(ticketStatus == "TO_PAY" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "NOT_PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "FALSE"))){
					                    disableStatus = true;
					                }
                                    
                                }
                            } else {
                                var i = selectedRows[0];
                                var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                if(!(ticketStatus == "TO_PAY" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "NOT_PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "FALSE"))){
				                    disableStatus = true;
				                }
                            }
                            return disableStatus;
						}
					},
					goToDefectBlank: {
						name: "Забраковать бланк",
						disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var disableStatus = false;
                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                   	var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                    if(!(ticketStatus == "CLOSED" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "PRINTED"))){
					                    disableStatus = true;
					                }
                                    
                                }
                            } else {
                                var i = selectedRows[0];
                                var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                if(!(ticketStatus == "CLOSED" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "PRINTED"))){
				                    disableStatus = true;
				                }
                            }
                            return disableStatus;
						}
					},
					goToDefectTicket: {
						name: "Забраковать билет",
						disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var disableStatus = false;
                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                   	var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                    if(!(ticketStatus == "CLOSED" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "PRINTED"))){
					                    disableStatus = true;
					                }
                                    
                                }
                            } else {
                                var i = selectedRows[0];
                                var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                if(!(ticketStatus == "CLOSED" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "PRINTED"))){
				                    disableStatus = true;
				                }
                            }
                            return disableStatus;
						}
					},
					goToRealization: {
						name: "Выдать по квоте",
						disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var parent = MB.O[instance.parentobjecttype + "s"][instance.parentobject];
                            var agentrealizationaccess = parent.data.data[0][parent.data.names.indexOf("AGENT_REALIZATION_ACCESS")].bool();
                            var disableStatus = false;
                            if (!agentrealizationaccess) {
				                return true;
				            }
                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                   	var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                    if(!(ticketStatus == "TO_PAY")){
					                    disableStatus = true;
					                }
                                    
                                }
                            } else {
                                var i = selectedRows[0];
                                var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                if(!(ticketStatus == "TO_PAY")){
				                    disableStatus = true;
				                }
                            }
                            return disableStatus;
						}
					},
					goToRealizationPrint: {
						name: "Выдать по квоте и распечатать",
						disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var parent = MB.O[instance.parentobjecttype + "s"][instance.parentobject];
                            var agentrealizationaccess = parent.data.data[0][parent.data.names.indexOf("AGENT_REALIZATION_ACCESS")].bool();
                            var disableStatus = false;
                            if (!agentrealizationaccess) {
				                return true;
				            }
                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                   	var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                    if(!(ticketStatus == "TO_PAY")){
					                    disableStatus = true;
					                }
                                    
                                }
                            } else {
                                var i = selectedRows[0];
                                var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                if(!(ticketStatus == "TO_PAY")){
				                    disableStatus = true;
				                }
                            }
                            return disableStatus;
						}
					},
					goToCloseRealization: {
						name: "Закрыть квоту",
						disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var parent = MB.O[instance.parentobjecttype + "s"][instance.parentobject];
                            var agentrealizationaccess = parent.data.data[0][parent.data.names.indexOf("AGENT_REALIZATION_ACCESS")].bool();
                            var disableStatus = false;
                            if (!agentrealizationaccess) {
				                return true;
				            }
                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for(var i = selectedRows[0];i<=selectedRows[1];++i){
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                   	var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                    if(!(ticketStatus === "ON_REALIZATION")){
					                    disableStatus = true;
					                }
                                    
                                }
                            } else {
                                var i = selectedRows[0];
                                var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                if(!(ticketStatus === "ON_REALIZATION")){
				                    disableStatus = true;
				                }
                            }
                            return disableStatus;
						}
					}
				}
			}
		});


		function sendQueryForObj(o){
	        MB.Core.sendQuery(o, function (res) {
	            if (parseInt(res.RC) === 0) {
	                toastr.success(res.MESSAGE, "Ок");
	                MB.O.forms["form_order"].reload("data");
	            }
	            else {
	                toastr.error(res.MESSAGE, "");
	            }
	        });
	    }









							// var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
							// var row = handsontableInstance.getSelected()[0]
							// var selectedRows = []
							// var data = handsontableInstance.getData();
							// for (var i = 0, l = data.length; i < l; i++) {
							// 	if (data[i].rowStatus === "selectedRow") {
							// 		selectedRows.push(i);
							// 	} 
							// }
							// if (selectedRows.length > 0) {
							// 	var countCallbacks = 0;
							// 	selectedRows.forEach(function (val, i, arr) {
							// 		var ticketId = instance.data.data[val][instance.data.names.indexOf("ORDER_TICKET_ID")];
							// 		var o = {
							// 			command: "operation",
							// 			object: "to_pay_ticket",
							// 			sid: MB.User.sid
							// 		}
							// 		o["ORDER_TICKET_ID"] = ticketId
							// 		MB.Core.sendQuery(o, function (res) {
							// 			toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
							// 			countCallbacks++;
							// 			if (countCallbacks === selectedRows.length) {
							// 				instance.reload("data");
							// 			}
							// 		});
							// 	});
							// } else {
							// 	var ticketId = instance.data.data[row][instance.data.names.indexOf("ORDER_TICKET_ID")];
							// 	var o = {
							// 		command: "operation",
							// 		object: "to_pay_ticket",
							// 		sid: MB.User.sid
							// 	}
							// 	o["ORDER_TICKET_ID"] = ticketId
							// 	MB.Core.sendQuery(o, function (res) {
							// 		toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
							// 		instance.reload("data");
							// 	});
							// }



	// 	instance.contextmenu["goToPay"] = {
	// 		name: "К оплате",
	// 	instance.contextmenu["goToCancel"] = {
	// 		name: "Отменить билет", 
	// 	instance.contextmenu["goToReturn"] = {
	// 		name: "Вернуть билет", 
	// 	instance.contextmenu["goToPrint"] = {
	// 		name: "Напечатать билет", 
	// 	instance.contextmenu["goToDefectBlank"] = {
	// 		name: "Забраковать бланк", 
	// 	instance.contextmenu["goToDefectTicket"] = {
	// 		name: "Забраковать билет", 
	// 	instance.contextmenu["goToRealization"] = {
	// 		name: "Выдать по квоте",
	// 	instance.contextmenu["goToRealizationPrint"] = {
	// 		name: "Выдать по квоте и распечатать", 
	// 	instance.contextmenu["goToCloseRealization"] = {
	// 		name: "Закрыть квоту", 
	// 	instance.contextmenu["goToChangeReservDate"] = {
	// 	    name: "Продли ть резерв (так назвать?)",
	// 	instance.contextmenu["custom1"] = {
	// 	    name: "Перейти к перераспределению",
	// 	instance.contextmenu["custom2"] = {
	// 	    name: "Перейти к переоценке",













		// handsontableInstance.updateSettings({
		// 	contextMenu: {
		// 		callback: function (key, options) {
		// 			alert(7)
		// 		},
		// 		items: {
		// 			openInModal: {
		// 				name: "Открыть в модалке..."
		// 			},
		// 			goToPay: {
		// 				name: "К оплате"
		// 			}
		// 		}
		// 	}
		// });
		// handsontableInstance.updateSettings({
		// 	contextMenu: (function () {
		// 		console.log(777)
		// 		return {
		// 			items: {
		// 				openInModal: {
		// 					name: "Открыть в модалке..."
		// 				},
		// 				goToPay: {
		// 					name: "К оплате"
		// 				}
		// 			}
		// 		}
		// 	}
		// }()));
		// instance.$container.find(".handsontable").handsontable("updateSettings", {
		// 	contextMenu: {
		// 		callback: function (key, options) {
		// 			alert(7)
		// 		},
		// 		items: {
		// 			openInModal: {
		// 				name: "Открыть в модалке..."
		// 			},
		// 			goToPay: {
		// 				name: "К оплате"
		// 			}
		// 		}
		// 	}
		// });
		// handsontableInstance.updateSettings({
		// 	contextMenu: {
		// 		callback: function (key, options) {
		// 			alert(7)
		// 		},
		// 		items: {
		// 			openInModal: {
		// 				name: "Открыть в модалке..."
		// 			},
		// 			goToPay: {
		// 				name: "К оплате"
		// 			}
		// 		}
		// 	}
		// });
		// handsontableInstance.render();



	// 	instance.contextmenu["goToCancel"] = {
	// 		name: "Отменить билет", 
	// 	instance.contextmenu["goToReturn"] = {
	// 		name: "Вернуть билет", 


	// 	console.log(8888888888888888);
	// 	var parent = MB.O[instance.parentobjecttype + "s"][instance.parentobject];
	// 	var agentrealizationaccess = parent.data.data[0][parent.data.names.indexOf("AGENT_REALIZATION_ACCESS")].bool();

	// 	instance.contextmenu["goToPay"] = {
	// 		name: "К оплате",
	// 		disabled: function (key, options) {
	// 			instance.contextmenu["goToPay"]['name'] = "test";
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			var check=false;
	// 			var ticketStatus = ($(options.$trigger[0]).find("td[data-column='STATUS'] a").length > 0) ? $(options.$trigger[0]).find("td[data-column='STATUS'] a").text() : $(options.$trigger[0]).find("td[data-column='STATUS']").text();

	// 			if(selectedrow.length == 0){
	// 				if (!(ticketStatus === "RESERVED")) {
	// 					return true;
	// 				}
	// 			}
	// 			else {
	// 				selectedrow.each(function(i,el){
	// 					ticketStatus = $(el).find("td[data-column='STATUS']").text();
	// 					ticketPrinted = $(el).find("td[data-column='PRINTED']").text();
	// 					if (!(ticketStatus === "RESERVED")) {
	// 						check =  true;
	// 					}
	// 				});
	// 			}
	// 			return check;  
	// 		},
	// 		callback: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			if(selectedrow.length > 0){
	// 				selectedrow.each(function(){
	// 					var ticketid = $(this).find("td[data-column='ORDER_TICKET_ID']").text();
	// 					var o = {
	// 						command: "operation",
	// 						object: "to_pay_ticket",
	// 						sid: MB.User.sid
	// 					};
	// 					o["ORDER_TICKET_ID"] = ticketid;
	// 					sendQueryForObj(o);
	// 				})
					
	// 			}
	// 			else {
	// 				var ticketid = $(options.$trigger[0]).data("row");
	// 				var o = {
	// 					command: "operation",
	// 					object: "to_pay_ticket",
	// 					sid: MB.User.sid
	// 				};
	// 				o["ORDER_TICKET_ID"] = ticketid;
	// 				sendQueryForObj(o);
	// 			}
				
	// 		}
	// 	};

	// 	instance.contextmenu["goToCancel"] = {
	// 		name: "Отменить билет", 
	// 		  disabled: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			var check=false;
	// 			var ticketStatus = ($(options.$trigger[0]).find("td[data-column='STATUS'] a").length > 0) ? $(options.$trigger[0]).find("td[data-column='STATUS'] a").text() : $(options.$trigger[0]).find("td[data-column='STATUS']").text();
				
	// 			if(selectedrow.length == 0){
	// 				if (!(ticketStatus === "RESERVED" || ticketStatus === "TO_PAY")) {
	// 					return true;
	// 				}
	// 			}
	// 			else {
	// 				selectedrow.each(function(i,el){
	// 					ticketStatus = $(el).find("td[data-column='STATUS']").text();
	// 					ticketPrinted = $(el).find("td[data-column='PRINTED']").text();
	// 					if (!(ticketStatus === "RESERVED" || ticketStatus === "TO_PAY")) {
	// 						check =  true;
	// 					}
	// 				});
	// 			}
	// 			return check;  
	// 		},      
	// 		callback: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			if(selectedrow.length > 0){
	// 				selectedrow.each(function(){
	// 					var ticketid = $(this).find("td[data-column='ORDER_TICKET_ID']").text();
	// 					var o = {
	// 						command: "operation",
	// 						object: "cancel_ticket",
	// 						sid: MB.User.sid
	// 					};
	// 					o["ORDER_TICKET_ID"] = ticketid;
	// 					sendQueryForObj(o);
	// 				})
	// 			}
	// 			else {
	// 				var ticketid = $(options.$trigger[0]).data("row");
	// 				var o = {
	// 					command: "operation",
	// 					object: "cancel_ticket",
	// 					sid: MB.User.sid
	// 				};
	// 				o["ORDER_TICKET_ID"] = ticketid;
	// 				sendQueryForObj(o);
	// 			}
	// 	   }
	// 	};
	// 	instance.contextmenu["goToReturn"] = {
	// 		name: "Вернуть билет", 
	// 		disabled: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			var check=false;
	// 			var ticketStatus = ($(options.$trigger[0]).find("td[data-column='STATUS'] a").length > 0) ? $(options.$trigger[0]).find("td[data-column='STATUS'] a").text() : $(options.$trigger[0]).find("td[data-column='STATUS']").text();
				
	// 			if(selectedrow.length == 0){
	// 				if (!(ticketStatus === "CLOSED" || ticketStatus === "CLOSED_REALIZATION" || ticketStatus === "ON_REALIZATION")) {
	// 					return true;
	// 				}
	// 			}
	// 			else {
	// 				selectedrow.each(function(i,el){
	// 					ticketStatus = $(el).find("td[data-column='STATUS']").text();
	// 					ticketPrinted = $(el).find("td[data-column='PRINTED']").text();
	// 					if (!(ticketStatus === "CLOSED" || ticketStatus === "CLOSED_REALIZATION" || ticketStatus === "ON_REALIZATION")) {
	// 						check = true;
	// 					}
	// 				});
	// 			}
	// 			return check;
	// 		},
	// 		callback: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			if(selectedrow.length > 0){
	// 				selectedrow.each(function(){
	// 					var ticketid = $(this).find("td[data-column='ORDER_TICKET_ID']").text();
	// 					var o = {
	// 						command: "operation",
	// 						object: "return_ticket",
	// 						sid: MB.User.sid
	// 					};
	// 					o["ORDER_TICKET_ID"] = ticketid;
	// 					sendQueryForObj(o);
	// 				})
	// 			}else {
	// 				var ticketid = $(options.$trigger[0]).data("row");
	// 				var o = {
	// 					command: "operation",
	// 					object: "return_ticket",
	// 					sid: MB.User.sid
	// 				};
	// 				o["ORDER_TICKET_ID"] = ticketid;
	// 				sendQueryForObj(o);
	// 			}
	// 		}
	// 	};
	// 	instance.contextmenu["goToPrint"] = {
	// 		name: "Напечатать билет", 
	// 		disabled: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			var check=false;
	// 			var ticketStatus = ($(options.$trigger[0]).find("td[data-column='STATUS'] a").length > 0) ? $(options.$trigger[0]).find("td[data-column='STATUS'] a").text() : $(options.$trigger[0]).find("td[data-column='STATUS']").text();
	// 			var ticketPrinted = ($(options.$trigger[0]).find("td[data-column='PRINTED'] a").length > 0) ? $(options.$trigger[0]).find("td[data-column='PRINTED'] a").text() : $(options.$trigger[0]).find("td[data-column='PRINTED']").text();

	// 			if(selectedrow.length == 0){
	// 				if(!(ticketStatus == "TO_PAY" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "NOT_PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "FALSE"))){
	// 					return true;
	// 				}
	// 			}
	// 			else {
	// 				selectedrow.each(function(i,el){
	// 					ticketStatus = $(el).find("td[data-column='STATUS']").text();
	// 					ticketPrinted = $(el).find("td[data-column='PRINTED']").text();
	// 					if(!(ticketStatus == "TO_PAY" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "NOT_PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "FALSE"))){
	// 						check = true;
	// 					}
	// 				});
	// 			}
	// 			return check;
	// 		},
	// 		callback: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			if(selectedrow.length > 0){
	// 				selectedrow.each(function(){
	// 					var ticketid = $(this).find("td[data-column='ORDER_TICKET_ID']").text();
	// 					var o = {
	// 						command: "operation",
	// 						object: "print_ticket",
	// 						sid: MB.User.sid
	// 					};
	// 					o["ORDER_TICKET_ID"] = ticketid;
	// 					sendQueryForObj(o);
	// 				})
	// 			} else {
	// 			   var ticketid = $(options.$trigger[0]).data("row");
	// 				var o = {
	// 					command: "operation",
	// 					object: "print_ticket",
	// 					sid: MB.User.sid
	// 				};
	// 				o["ORDER_TICKET_ID"] = ticketid;
	// 				sendQueryForObj(o); 
	// 			}
				
	// 		}
	// 	};
	// 	instance.contextmenu["goToDefectBlank"] = {
	// 		name: "Забраковать бланк", 
	// 		disabled: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			var check=false;
	// 			var ticketStatus = ($(options.$trigger[0]).find("td[data-column='STATUS'] a").length > 0) ? $(options.$trigger[0]).find("td[data-column='STATUS'] a").text() : $(options.$trigger[0]).find("td[data-column='STATUS']").text();
	// 			var ticketPrinted = ($(options.$trigger[0]).find("td[data-column='PRINTED'] a").length > 0) ? $(options.$trigger[0]).find("td[data-column='PRINTED'] a").text() : $(options.$trigger[0]).find("td[data-column='PRINTED']").text();

	// 			if(selectedrow.length == 0){
	// 				if(!(ticketStatus == "CLOSED" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "PRINTED"))){
	// 					return true;
	// 				}
	// 			}
	// 			else {
	// 				selectedrow.each(function(i,el){
	// 					ticketStatus = $(el).find("td[data-column='STATUS']").text();
	// 					ticketPrinted = $(el).find("td[data-column='PRINTED']").text();
	// 					if(!(ticketStatus == "CLOSED" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "PRINTED"))){
	// 						check = true;
	// 					}
	// 				});
	// 			}
	// 			return check;
	// 		},
	// 		callback: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			if(selectedrow.length > 0){
	// 				selectedrow.each(function(){
	// 					var ticketid = $(this).find("td[data-column='ORDER_TICKET_ID']").text();
	// 					var o = {
	// 						command: "operation",
	// 						object: "defect_blank",
	// 						sid: MB.User.sid
	// 					};
	// 					o["ORDER_TICKET_ID"] = ticketid;
	// 					sendQueryForObj(o);
	// 				})
	// 			}
	// 			else {
	// 				var ticketid = $(options.$trigger[0]).data("row");
	// 				var o = {
	// 					command: "operation",
	// 					object: "defect_blank",
	// 					sid: MB.User.sid
	// 				};
	// 				o["ORDER_TICKET_ID"] = ticketid;
	// 				sendQueryForObj(o);
	// 			}
				
	// 		}
	// 	};
	// 	instance.contextmenu["goToDefectTicket"] = {
	// 		name: "Забраковать билет", 
	// 		disabled: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			var check=false;
	// 			var ticketStatus = ($(options.$trigger[0]).find("td[data-column='STATUS'] a").length > 0) ? $(options.$trigger[0]).find("td[data-column='STATUS'] a").text() : $(options.$trigger[0]).find("td[data-column='STATUS']").text();
	// 			var ticketPrinted = ($(options.$trigger[0]).find("td[data-column='PRINTED'] a").length > 0) ? $(options.$trigger[0]).find("td[data-column='PRINTED'] a").text() : $(options.$trigger[0]).find("td[data-column='PRINTED']").text();

	// 			if(selectedrow.length == 0){
	// 				if(!(ticketStatus == "CLOSED" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "PRINTED"))){
	// 					return true;
	// 				}
	// 			}
	// 			else {
	// 				selectedrow.each(function(i,el){
	// 					ticketStatus = $(el).find("td[data-column='STATUS']").text();
	// 					ticketPrinted = $(el).find("td[data-column='PRINTED']").text();
	// 					if(!(ticketStatus == "CLOSED" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "PRINTED"))){
	// 						check = true;
	// 					}
	// 				});
	// 			}
	// 			return check;
	// 		},
	// 		callback: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			if(selectedrow.length > 0){
	// 				selectedrow.each(function(){
	// 					var ticketid = $(this).find("td[data-column='ORDER_TICKET_ID']").text();
	// 					var o = {
	// 						command: "operation",
	// 						object: "defect_ticket",
	// 						sid: MB.User.sid
	// 					};
	// 					o["ORDER_TICKET_ID"] = ticketid;
	// 					sendQueryForObj(o);
	// 				})
	// 			}
	// 			else {
	// 				var ticketid = $(options.$trigger[0]).data("row");
	// 				var o = {
	// 					command: "operation",
	// 					object: "defect_blank",
	// 					sid: MB.User.sid
	// 				};
	// 				o["ORDER_TICKET_ID"] = ticketid;
	// 				sendQueryForObj(o);
	// 			}
	// 		}
	// 	};
	// 	instance.contextmenu["goToRealization"] = {
	// 		name: "Выдать по квоте", 
	// 		disabled: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			var check=false;
	// 			var ticketStatus = ($(options.$trigger[0]).find("td[data-column='STATUS'] a").length > 0) ? $(options.$trigger[0]).find("td[data-column='STATUS'] a").text() : $(options.$trigger[0]).find("td[data-column='STATUS']").text();

	// 			if (!agentrealizationaccess) {
	// 				return true;
	// 			}

	// 			if(selectedrow.length == 0){
	// 				if(!(ticketStatus == "TO_PAY")){
	// 					return true;
	// 				}
	// 			}
	// 			else {
	// 				selectedrow.each(function(i,el){
	// 					ticketStatus = $(el).find("td[data-column='STATUS']").text();
	// 					ticketPrinted = $(el).find("td[data-column='PRINTED']").text();
	// 					if(!(ticketStatus == "TO_PAY")){
	// 						check = true;
	// 					}
	// 				});
	// 			}
	// 			return check;
	// 		},
	// 		callback: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			if(selectedrow.length > 0){
	// 				selectedrow.each(function(){
	// 					var ticketid = $(this).find("td[data-column='ORDER_TICKET_ID']").text();
	// 					var o = {
	// 						command: "operation",
	// 						object: "on_realization_ticket",
	// 						sid: MB.User.sid
	// 					};
	// 					o["ORDER_TICKET_ID"] = ticketid;
	// 					sendQueryForObj(o);
	// 				})
	// 			} else {
	// 				var ticketid = $(options.$trigger[0]).data("row");
	// 				var o = {
	// 					command: "operation",
	// 					object: "on_realization_ticket",
	// 					sid: MB.User.sid
	// 				};
	// 				o["ORDER_TICKET_ID"] = ticketid;
	// 				sendQueryForObj(o);
	// 			}
				
	// 		}
	// 	};

	// 	instance.contextmenu["goToRealizationPrint"] = {
	// 		name: "Выдать по квоте и распечатать", 
	// 		disabled: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			var check=false;
	// 			var ticketStatus = ($(options.$trigger[0]).find("td[data-column='STATUS'] a").length > 0) ? $(options.$trigger[0]).find("td[data-column='STATUS'] a").text() : $(options.$trigger[0]).find("td[data-column='STATUS']").text();
	// 			var ticketPrinted = ($(options.$trigger[0]).find("td[data-column='PRINTED'] a").length > 0) ? $(options.$trigger[0]).find("td[data-column='PRINTED'] a").text() : $(options.$trigger[0]).find("td[data-column='PRINTED']").text();
				
	// 			if (!agentrealizationaccess) {
	// 				return true;
	// 			}
	// 			if(selectedrow.length == 0){
	// 				// if(!(ticketStatus == "TO_PAY" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "TRUE"))){
	// 				//     return true;
	// 				// }
	// 				if(!(ticketStatus === "TO_PAY")){
	// 					return true;
	// 				}
	// 			}
	// 			else {
	// 				selectedrow.each(function(i,el){
	// 					ticketStatus = $(el).find("td[data-column='STATUS']").text();
	// 					ticketPrinted = $(el).find("td[data-column='PRINTED']").text();
	// 					if (!(ticketStatus === "TO_PAY")){
	// 						check = true;
	// 					}
	// 				});
	// 			}
	// 			return check;
	// 		},
	// 		callback: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			if(selectedrow.length > 0){
	// 				selectedrow.each(function(){
	// 					var ticketid = $(this).find("td[data-column='ORDER_TICKET_ID']").text();
	// 					var o = {
	// 						command: "operation",
	// 						object: "on_realization_print_ticket",
	// 						sid: MB.User.sid
	// 					};
	// 					o["ORDER_TICKET_ID"] = ticketid;
	// 					sendQueryForObj(o);
	// 				})
	// 			} else {
	// 				var ticketid = $(options.$trigger[0]).data("row");
	// 				var o = {
	// 					command: "operation",
	// 					object: "on_realization_print_ticket",
	// 					sid: MB.User.sid
	// 				};
	// 				o["ORDER_TICKET_ID"] = ticketid;
	// 				sendQueryForObj(o);
	// 			}
				
	// 		}
	// 	};

	// 	instance.contextmenu["goToCloseRealization"] = {
	// 		name: "Закрыть квоту", 
	// 		disabled: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			var check=false;
	// 			var ticketStatus = ($(options.$trigger[0]).find("td[data-column='STATUS'] a").length > 0) ? $(options.$trigger[0]).find("td[data-column='STATUS'] a").text() : $(options.$trigger[0]).find("td[data-column='STATUS']").text();
				
	// 			if (!agentrealizationaccess) {
	// 				return true;
	// 			}

	// 			if(selectedrow.length == 0){
	// 				// if(!(ticketStatus == "TO_PAY" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "TRUE"))){
	// 				//     return true;
	// 				// }
	// 				if(!(ticketStatus === "ON_REALIZATION")){
	// 					return true;
	// 				}
	// 			}
	// 			else {
	// 				selectedrow.each(function(i,el){
	// 					ticketStatus = $(el).find("td[data-column='STATUS']").text();
	// 					ticketPrinted = $(el).find("td[data-column='PRINTED']").text();
	// 					if (!(ticketStatus === "ON_REALIZATION")){
	// 						check = true;
	// 					}
	// 				});
	// 			}

	// 			return check;
	// 		},
	// 		callback: function (key, options) {
	// 			var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
	// 			if(selectedrow.length > 0){
	// 				selectedrow.each(function(){
	// 					var ticketid = $(this).find("td[data-column='ORDER_TICKET_ID']").text();
	// 					var o = {
	// 						command: "operation",
	// 						object: "close_realization_ticket",
	// 						sid: MB.User.sid
	// 					};
	// 					o["ORDER_TICKET_ID"] = ticketid;
	// 					sendQueryForObj(o);
	// 				})
	// 			} else {
	// 				var ticketid = $(options.$trigger[0]).data("row");
	// 				var o = {
	// 					command: "operation",
	// 					object: "close_realization_ticket",
	// 					sid: MB.User.sid
	// 				};
	// 				o["ORDER_TICKET_ID"] = ticketid;
	// 				sendQueryForObj(o);
	// 			}
				
	// 		}
	// 	};

	// 	function sendQueryForObj(o){
	// 		MB.Core.sendQuery(o, function (res) {
	// 			if (parseInt(res.RC) === 0) {
	// 				toastr.success(res.MESSAGE, "Ок");
	// 				parent.reload("data");
	// 			}
	// 			else {
	// 				toastr.error(res.MESSAGE, "");
	// 			}
	// 		});
	// 	}

	// 	var query = "#" + instance.world + "_" + instance.name + "_wrapper table tbody tr";
	// 	$.contextMenu("destroy", query);
	// 	$.contextMenu({
	// 		selector: query,
	// 		items: instance.contextmenu
	// 	});  





	// 	instance.contextmenu["goToChangeReservDate"] = {
	// 	    name: "Продли ть резерв (так назвать?)",
	// 	    callback: function() {
	// 	        var html = "<input type='text' id='reservedToDateInput'></input>";
	// 	        if ($("#reservedToDateInput")[0] === undefined ) {
	// 	            $("#one_order").setCell(Orders.orderTicketId, "RESERVED_TO_DATE", html);
	// 	            $("#reservedToDateInput").focus();
	// 	            $("#reservedToDateInput").on("keyup", function() {
						
	// 	            });
	// 	            $("#reservedToDateInput").mask("99-99-9999 99:99:99");
	// 	            $("#reservedToDateInput").on("blur", function() {
	// 	                var params = {};
	// 	                var valOf = $("#reservedToDateInput").val();
	// 	                params["ORDER_TICKET_ID"] = Orders.orderTicketId;
	// 	                params["OBJVERSION"] = $("#one_order").getCell(Orders.orderTicketId, "OBJVERSION");
	// 	                params["RESERVED_TO_DATE"] = valOf;
	// 	                send_query({command:"edit", subcommand:"order_ticket", sid:sid, params:params}, function(data) {
	// 	                    console.log($(data).find("result").find("message").text());
	// 	                    if ($(data).find("result").find("rc").text() === "0") {
	// 	                        $("#one_order").trigger("reloadGrid");
	// 	                        Orders.loadOrderForm(Orders.orderId);
	// 	                    } else {
	// 	                        alert_yesno("<span style='color:#f00;'>Ошибка.</span>","<center>"+$(data).find("result").find("message").text()+"</center>","Ок","",function(){},0);
	// 	                        $("#one_order").trigger("reloadGrid");
	// 	                    }
							
	// 	                });                 
	// 	            });
	// 	        } else {

	// 	        }
	// 	    }
	// 	}; 




	// 	instance.contextmenu["custom1"] = {
	// 	    name: "Перейти к перераспределению",
	// 	    callback: function (key, options) {
	// 	        var id = options.$trigger.data("row");
	// 	        MB.Core.switchModal({type:"content", filename:"action_fundZones", params:{action_id:id}});
	// 	    }
	// 	};
	// 	instance.contextmenu["custom2"] = {
	// 	    name: "Перейти к переоценке",
	// 	    callback: function (key, options) {
	// 	        var id = options.$trigger.data("row");
	// 	        MB.Core.switchModal({type:"content", filename:"action_priceZones", params:{action_id:id}});
	// 	    }
	// 	};

	// 	var query = "#" + instance.world + "_" + instance.name + "_wrapper table tbody tr";
	// 	$.contextMenu("destroy", query);
	// 	$.contextMenu({
	// 	    selector: query,
	// 	    items: instance.contextmenu
	// 	});
		callback();
	}
})();














		// console.log(agentrealizationaccess);
		// handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
		// var config = {
		// 	contextMenu: {
		// 		callback: function (key, options) {
		// 			alert(7)
				// var arr, data, handsontableInstance, i, value, _i, _len;
				// console.log(arguments);
				// var cases = {
				// 	openInModal: function () {
				// 		alert(6)
				// 		// handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
				// 		// data = handsontableInstance.getData();
				// 		// console.log(data);
				// 		// arr = [];
				// 		// for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
				// 		// 	value = data[i];
				// 		// 	if (value.rowStatus === "selectedRow") {
				// 		// 		arr.push(value[instance.profile.general.primarykey]);
				// 		// 	}
				// 		// }
				// 		// if (arr.length > 0) {
				// 		// 	return MB.Core.switchModal({
				// 		// 		type: "form",
				// 		// 		ids: arr,
				// 		// 		name: instance.profile.general.juniorobject,
				// 		// 		params: {
				// 		// 			parentobject: instance.name
				// 		// 		}
				// 		// 	});
				// 		// } else {
				// 		// 	arr = [];
				// 		// 	console.log(options.start._row);
				// 		// 	console.log(data[options.start._row]);
				// 		// 	arr.push(data[options.start._row][instance.profile.general.primarykey]);
				// 		// 	return MB.Core.switchModal({
				// 		// 		type: "form",
				// 		// 		ids: arr,
				// 		// 		name: instance.profile.general.juniorobject
				// 		// 	});
				// 		// }
				// 	},
				// 	goToPay: function () {
				// 		// var selectedrow = $("#tbl_order_ticket").find(".selectedrow");
				// 		// if(selectedrow.length > 0){
				// 		// 	selectedrow.each(function(){
				// 		// 		var ticketid = $(this).find("td[data-column='ORDER_TICKET_ID']").text();
				// 		// 		var o = {
				// 		// 			command: "operation",
				// 		// 			object: "to_pay_ticket",
				// 		// 			sid: MB.User.sid
				// 		// 		};
				// 		// 		o["ORDER_TICKET_ID"] = ticketid;
				// 		// 		sendQueryForObj(o);
				// 		// 	})
							
				// 		// }
				// 		// else {
				// 		// 	var ticketid = $(options.$trigger[0]).data("row");
				// 		// 	var o = {
				// 		// 		command: "operation",
				// 		// 		object: "to_pay_ticket",
				// 		// 		sid: MB.User.sid
				// 		// 	};
				// 		// 	o["ORDER_TICKET_ID"] = ticketid;
				// 		// 	sendQueryForObj(o);
				// 		// }
				// 	}
				// };
				// console.log(cases)
				// cases[key]()
		// 		},
		// 		items: {
		// 			openInModal: {
		// 				name: "Открыть в модалке..."
		// 			},
		// 			goToPay: {
		// 				name: "К оплате"
		// 			}
		// 		}
		// 	}
		// };
		// console.log(config)
		// console.log(handsontableInstance)
		// handsontableInstance.updateSettings(config);
		// console.log(handsontableInstance.)




		// onSelectRow: function(rowid){
//     var key;
//     Orders.orderticketStatus = $("#" + table.name).getCell(rowid, "STATUS");
//     Orders.orderTicketId = rowid;
//     for (key in Orders.contextMenu) {
//         Orders.contextMenu[key].disabled = true;
//     } 
//     if (Orders.orderticketStatus === "RESERVED") {
//         Orders.contextMenu.goToPay.disabled = false;
//         Orders.contextMenu.goToCancel.disabled = false;
//         Orders.contextMenu.goToChangeReservDate.disabled = false;
//     } else if (Orders.orderticketStatus === "TO_PAY") {
//         Orders.contextMenu.goToCancel.disabled = false;
//         Orders.contextMenu.goToPrint.disabled = false;
//     } else if (Orders.orderticketStatus === "CLOSED" || Orders.orderticketStatus === "CLOSED_REALIZATION") {
//         Orders.contextMenu.goToDefectBlank.disabled = false;
//         Orders.contextMenu.goToDefectTicket.disabled = false;
//         Orders.contextMenu.goToReturn.disabled = false;                    
//     } else if (Orders.orderticketStatus === "ON_REALIZATION") {
//         Orders.contextMenu.goToDefectTicket.disabled = false;
//         Orders.contextMenu.goToDefectBlank.disabled = false;
//         Orders.contextMenu.goToReturn.disabled = false;
//     } else if (Orders.orderticketStatus === "IN_PRINT") {
//         Orders.contextMenu.goToPrint.disabled = false;
//     }

//     if (Orders.agentRealizationAccess === "TRUE" && Orders.orderticketStatus === "TO_PAY") {
//         Orders.contextMenu.goToRealization.disabled = false;
//     } else if (Orders.agentRealizationAccess === "TRUE" && Orders.orderticketStatus === "ON_REALIZATION") {
//         Orders.contextMenu.goToCloseRealization.disabled = false;
//     }

//     $.contextMenu("destroy", "#one_order tr");
//     $.contextMenu({
//         selector: "#one_order tr",
//         zIndex:1100,
//         items: Orders.contextMenu
//     });
// }  


	// 	instance.contextmenu["goToRealizationPrint"] = {
	// 		name: "Выдать по квоте и распечатать", 
	// 	instance.contextmenu["goToCloseRealization"] = {
	// 		name: "Закрыть квоту", 
	// 	instance.contextmenu["custom1"] = {
	// 	    name: "Перейти к перераспределению",
	// 	instance.contextmenu["goToChangeReservDate"] = {
	// 	    name: "Продли ть резерв (так назвать?)",