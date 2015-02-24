(function () {
	MB = MB || {};
	MB.TablesConstructor = function () {
		this.tables = [];
	};
	MB.Tables = new MB.TablesConstructor();
	MB.TableN = function (params) {
		this.name = params.name || 'unnamed';
		this.id = params.id || MB.Core.guid();
		this.parent_id = params.parent_id || undefined;
		this.parentObject = params.parentObject || undefined;
		this.externalWhere = params.externalWhere || "";
	};

	MB.TablesConstructor.prototype.addTable = function (table) {
		this.tables.push(table);
	};
	MB.TablesConstructor.prototype.getTable = function (id) {
		for (var i in this.tables) {
			var table = this.tables[i];
			if (table.id == id) {
				return table;
			}
		}
	};
	MB.TablesConstructor.prototype.removeTable = function (id) {
		for (var i in this.tables) {
			var table = this.tables[i];
			if (table.id == id) {
				this.tables.splice(i, 1);
			}
		}
	};

	MB.TableN.prototype.create = function (wrapper, callback) {
		var _t = this;
		_t.wrapper = wrapper;
		if (wrapper.is(MB.Core.$pageswrap)) {
			var tempTable = wrapper.find('.classicTableWrap');
			if (tempTable.length > 0) {
				var tempTableId = tempTable.data('id');
				var tempTableInstance = MB.Tables.getTable(tempTableId);
				if (_t.name == tempTableInstance.name) {
					tempTableInstance.reload();
					return;
				} else {
					MB.Tables.removeTable(tempTableId);
				}
			}
		}
		_t.tempPage = 1;
		_t.getProfile(_t.name, function () {
			_t.getData(function () {
				console.log('data getted', new Date(), new Date().getMilliseconds());
				MB.Tables.addTable(_t);
				_t.render(function () {
					_t.getScript(function () {
						MB.Core.spinner.stop(wrapper);
						if (typeof callback == 'function') {

							callback(_t);

						}
					});
				});
			});
		});
	};

	MB.TableN.prototype.createServerRMB = function () {
		var _t = this;
		var result = [];
		var names = _t.profile['OBJECT_PROFILE']['RMB_MENU'].NAMES;

		for (var i in _t.profile['OBJECT_PROFILE']['RMB_MENU'].DATA) {
			var item = _t.profile['OBJECT_PROFILE']['RMB_MENU'].DATA[i];
			var disCol = item[names.indexOf('IS_DISABLED_COLUMN')];
			var disVal = item[names.indexOf('IS_DISABLED_COLUMN_VALUE')];
			var type = item[names.indexOf('RMB_MENU_TYPE')];
			var whereCols = item[names.indexOf('WHERE_COLUMNS')];

			console.log(disCol, disVal);

			result.push({
				name: item[names.indexOf('RMB_MENU_ITEM_ID')],
				title: item[names.indexOf('RMB_MENU_LABEL')],
				disabled: function () {
					var row = _t.ct_instance.selectedRowIndex;
					if (disCol == '') {
						return false;
					} else {
						if (_t.data.DATA[row][_t.data.NAMES.indexOf(disCol)] == disVal) {
							return false;
						}
					}
					return true;
				},
				callback: function () {
					var theRmb = _t.profile['OBJECT_PROFILE']['RMB_MENU'];
					var rmbName = $(this)[0].name;
					var row = _t.ct_instance.selectedRowIndex;
					var clientObject;
					for (var t in theRmb.DATA) {
						if (theRmb.DATA[t][names.indexOf('RMB_MENU_ITEM_ID')] == rmbName) {
							type = theRmb.DATA[t][names.indexOf('RMB_MENU_TYPE')];
							clientObject = theRmb.DATA[t][names.indexOf('OPEN_CLIENT_OBJECT')];
							whereCols = theRmb.DATA[t][names.indexOf('WHERE_COLUMNS')].split(',');
						}
					}
					if (type == 'OPEN_CLIENT_OBJECT') {
						var whereStr = '';
						for (var w in whereCols) {
							var wColumnName = whereCols[w];
							whereStr += wColumnName + ' = ' + _t.data.DATA[row][_t.data.NAMES.indexOf(wColumnName)];
							if (w < whereCols.length - 1) {
								whereStr += ' and ';
							}
						}

						MB.Core.switchPage({
							type: "table",
							name: clientObject,
							isNewTable: true,
							externalWhere: whereStr
						});

					} else if (type == 'SEND_COMMAND') {
						var isWAlert;
						var message;
						var sendOperation;
						var sendObject;
						var sendAttr;

						for (var r in theRmb.DATA) {
							if (theRmb.DATA[r][names.indexOf('RMB_MENU_ITEM_ID')] == rmbName) {
								isWAlert = theRmb.DATA[r][names.indexOf('SEND_WITH_ALERT')];

								message = theRmb.DATA[r][names.indexOf('SEND_ALERT')];
								sendOperation = theRmb.DATA[r][names.indexOf('SEND_OPERATION')];
								sendObject = theRmb.DATA[r][names.indexOf('SEND_OBJECT')];
								sendAttr = theRmb.DATA[r][names.indexOf('SEND_ATTRIBUTE')];
							}
						}
						if (isWAlert == 'TRUE') {
							bootbox.dialog({
								title: 'Внимание',
								message: message,
								buttons: {
									success: {
										label: 'Да',
										className: '',
										callback: function () {
											var o = {
												command: sendOperation,
												object: sendObject,
												params: {}
											};

											for (var k in sendAttr.split(',')) {
												var colName = sendAttr.split(',')[k];
												o.params[colName] = _t.data.DATA[row][_t.data.NAMES.indexOf(colName)];
											}

											socketQuery(o, function (res) {
												res = JSON.parse(res);
												res = res['results'][0];
												console.log(res);
											});
										}
									},
									cancel: {
										label: 'Отмена',
										className: '',
										callback: function () {

										}
									}
								}
							})
						} else {
							var o = {
								command: sendOperation,
								object: sendObject,
								params: {}
							};

							for (var k in sendAttr.split(',')) {
								var colName = sendAttr.split(',')[k];
								o.params[colName] = _t.data.DATA[row][_t.data.NAMES.indexOf(colName)];
							}

							socketQuery(o, function (res) {
								res = JSON.parse(res);
								res = res['results'][0];
								console.log(res);
							});
						}
					}
				}
			});
		}
		return result;
	};

	MB.TableN.prototype.getScript = function (callback) {
		var _t = this;
		var serverRMB = _t.createServerRMB();
		//console.log('Looks like',_t.name,  _t.profile['OBJECT_PROFILE']);
		MB.Tables.justLoadedId = _t.id;
		if (_t.profile['OBJECT_PROFILE']['ADDITIONAL_FUNCTIONALITY'] == 'TRUE') {
			$.getScript("html/tables/require/" + _t.name + ".js", function () {
				if (!_t.ct_instance.ctxMenuData) {
					_t.ct_instance.ctxMenuData = [];
				}
				for (var i in serverRMB) {
					_t.ct_instance.ctxMenuData.push(serverRMB[i]);
				}

				console.log('asdasd', _t.ct_instance.ctxMenuData);

				if (typeof callback == 'function') {
					callback();
				}
			});
		} else {
			if (_t.profile['OBJECT_PROFILE']['OPEN_FORM_CLIENT_OBJECT'] != '') {
				_t.ct_instance.ctxMenuData = [{
					name: 'option1',
					title: 'Открыть в форме',
					disabled: function () {
						return false;
					},
					callback: function () {
						_t.openRowInModal();
					}
				}];
			}

			for (var i in serverRMB) {
				if (!_t.ct_instance.ctxMenuData) {
					_t.ct_instance.ctxMenuData = [];
				}
				_t.ct_instance.ctxMenuData.push(serverRMB[i]);
			}

			if (typeof callback == 'function') {
				callback();
			}
		}

	};

	MB.TableN.prototype.render = function (callback) {
		var _t = this;

		MB.Core.classicTable.createTable({
			id: _t.id,
			data: _t.data,
			profile: _t.profile,
			wrapper: _t.wrapper,
			isInfoOpened: false
		}, function (instace) {
			_t.ct_instance = instace;
			_t.setHandlers();

			if (typeof callback == 'function') {
				callback();
			}
		});
	};

	MB.TableN.prototype.getProfile = function (name, callback) {
		var _t = this;
		if (this.name === 'unnamed') {
			console.warn('form without name');
			return false;
		} else {
			if (localStorage.getItem('tableN_' + name) !== null) {
				_t.profile = JSON.parse(localStorage.getItem('tableN_' + name));
				if (typeof callback == 'function') {
					callback();
				}
			} else {
				var o = {
					command: 'get',
					object: 'user_profile',
					client_object: name
				};
				MB.Core.sendQuery(o, function (r) {
					_t.profile = r;
					localStorage.setItem('tableN_' + name, JSON.stringify(r));
					if (typeof callback == 'function') {
						callback();
					}
				});
			}
		}
	};

	MB.TableN.prototype.parseWhereArray = function () {
		var _t = this;
		var result = '';
		var strOrArr = undefined;
		if (_t.ct_instance) {
			for (var i in _t.ct_instance.filterWhere) {
				var whereItem = _t.ct_instance.filterWhere[i];
				if (i > 0) {
					result += ' and ';
				}
				switch (whereItem.type) {
					case 'text':
						result += whereItem.name + " = '" + whereItem.value + "'";
						break;
					case 'like_text':
						result += whereItem.name + " like '%" + whereItem.value + "%'";
						break;
					case 'select2':
						if (whereItem.value == 'isNull') {
							result += whereItem.name + " is Null";
                        }else if(whereItem.value == 'isNotNull'){
                            result += whereItem.name + " is Not Null";
                        } else {
							strOrArr = (typeof whereItem.value == 'object') ? whereItem.value.join('\',\'') : whereItem.value;
							result += whereItem.name + " in ('" + strOrArr + "')";
						}
						break;
					case 'daysweek':
						strOrArr = whereItem.value.join('\',\'');
						result += "to_char(" + whereItem.name + ",'d') in ('" + strOrArr + "')";
						break;
					case 'daterange':
						if (!MB.Core.validator.datetime(whereItem.value.from)) {
							whereItem.value.from = '';
						}
						if (!MB.Core.validator.datetime(whereItem.value.to)) {
							whereItem.value.to = '';
						}

						if (whereItem.value.from != '' && whereItem.value.to != '') {
							result += whereItem.name + " >= to_date('" + whereItem.value.from + ":00', 'DD.MM.YYYY hh24:mi:ss')" +
							" and " +
							whereItem.name + " <= to_date('" + whereItem.value.to + ":00', 'DD.MM.YYYY hh24:mi:ss')";
						} else if (whereItem.value.from != '') {
							result += whereItem.name + " >= to_date('" + whereItem.value.from + ":00', 'DD.MM.YYYY hh24:mi:ss')";
						} else if (whereItem.value.to != '') {
							result += whereItem.name + " <= to_date('" + whereItem.value.to + ":00', 'DD.MM.YYYY hh24:mi:ss')";
						}
						break;
					case 'timerange':
						if (!MB.Core.validator.time(whereItem.value.from)) {
							whereItem.value.from = '';
						}
						if (!MB.Core.validator.time(whereItem.value.to)) {
							whereItem.value.to = '';
						}
						if (whereItem.value.from != '' && whereItem.value.to != '') {
							result += whereItem.name + " >= to_date('" + whereItem.value.from + ":00', 'hh24:mi:ss')" +
							" and " +
							whereItem.name + " <= to_date('" + whereItem.value.to + ":00', 'hh24:mi:ss')";
						} else if (whereItem.value.from != '') {
							result += whereItem.name + " >= to_date('" + whereItem.value.from + ":00', 'hh24:mi:ss')";
						} else if (whereItem.value.to != '') {
							result += whereItem.name + " <= to_date('" + whereItem.value.to + ":00', 'hh24:mi:ss')";
						}
						break;
					case 'checkbox':
						var val = (whereItem.value) ? "TRUE" : "FALSE";
						result += whereItem.name + " = '" + val + "'";
						break;
					default:
						break;
				}
			}
		}
		console.log('RESULT WHERE: ', result);
		return result;
	};

	MB.TableN.prototype.getData = function (callback) {
		var _t = this;

		var enableWhere = (_t.ct_instance) ? (_t.ct_instance.filterWhere.length > 0) : false;
		var enableFastSearch = (_t.fastSearchWhere && _t.fastSearchWhere != '');
		var whereString = '';
		var orderByStr = (_t.ct_instance) ? (_t.ct_instance.order_by) ? (_t.ct_instance.order_by.length > 0) ? _t.ct_instance.order_by : _t.profile['OBJECT_PROFILE']['DEFAULT_ORDER_BY'] : _t.profile['OBJECT_PROFILE']['DEFAULT_ORDER_BY'] : _t.profile['OBJECT_PROFILE']['DEFAULT_ORDER_BY'];
		if (enableWhere || _t.profile['OBJECT_PROFILE']['PARENT_KEY'] != '') {

			if (enableWhere && _t.profile['OBJECT_PROFILE']['PARENT_KEY'] == '') {
				whereString = _t.parseWhereArray();
			} else if (!enableWhere && _t.profile['OBJECT_PROFILE']['PARENT_KEY'] != '') {
				whereString = _t.profile['OBJECT_PROFILE']['PARENT_KEY'] + ' = ' + _t.parent_id;
			} else {
				whereString = _t.profile['OBJECT_PROFILE']['PARENT_KEY'] + ' = ' + _t.parent_id + ' and ' + _t.parseWhereArray();
			}
		}

		if (_t.externalWhere != '') {
			whereString = (whereString == '') ? _t.externalWhere : whereString + ' and ' + _t.externalWhere;
		}
		if (enableFastSearch) {
			whereString += (whereString.length > 0) ? ' and ' + _t.fastSearchWhere : _t.fastSearchWhere;
		}

		console.log(whereString);

		var o = {
			command: 'get',
			object: _t.profile['OBJECT_PROFILE']['GET_OBJECT_COMMAND'],
			sid: MB.User.sid,
			where: whereString,//(enableWhere)? _t.parseWhereArray() : (_t.profile['OBJECT_PROFILE']['PARENT_KEY'] == '')?'':_t.profile['OBJECT_PROFILE']['PARENT_KEY'] +' = '+ _t.parent_id +andStr+ _t.parseWhereArray(),
			order_by: orderByStr,
			client_object: _t.name,
			page_no: _t.tempPage,
			rows_max_num: _t.profile['OBJECT_PROFILE']['ROWS_MAX_NUM']
		};
		MB.Core.sendQuery(o, function (r) {
			_t.data = r;
			_t.where = o.where;

			//if (!_t.fulldata) _t.fulldata = [];
			//if (!_t.fulldata[_t.tempPage - 1]) {
			//	_t.fulldata[_t.tempPage - 1] = [];
			//	for (var i in _t.data.DATA) {
			//		var tempRow = {};
			//		for (var j in _t.data.NAMES) {
			//			tempRow[_t.data.NAMES[j]] = _t.data.DATA[i][j];
			//		}
			//		_t.fulldata[_t.tempPage - 1].push(tempRow);
			//	}
			//}

			console.log('oWhere', o.where);

			if (typeof callback == 'function') {
				callback();
			}
		});
	};

	MB.TableN.prototype.spin = function (stage) {
		var _t = this;
		var loader = _t.wrapper.find('.preLoader');
		if (stage == 'start') {
			loader.show(0);
		} else {
			loader.hide(0);
		}
		return;
		var opts = {
			lines: 17, // The number of lines to draw
			length: 18, // The length of each line
			width: 2, // The line thickness
			radius: 28, // The radius of the inner circle
			corners: 1, // Corner roundness (0..1)
			rotate: 12, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: '#000', // #rgb or #rrggbb or array of colors
			speed: 1.8, // Rounds per second
			trail: 44, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: false, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: '50%', // Top position relative to parent
			left: '50%' // Left position relative to parent
		};
		var target = undefined;
		var fader = undefined;

		if (stage === 'first') {
			target = _t.wrapper[0];
		} else {
			target = _t.ct_instance.wrapper[0];
			fader = _t.ct_instance.wrapper.find('.ct-fader');
		}

		if (stage === 'start') {

			fader.show(0);
			fader.css('opacity', '0');
			fader.show(0, function () {
				fader.animate({
					opacity: 0.7
				}, 100, function () {
					var spinner = new Spinner(opts).spin(target);
				})
			});
		} else if (stage === 'stop') {
			$('.spinner').remove();
			$(target).find('.spinner').fadeOut(100, function () {
				$('.spinner').remove();
			});
			fader.animate({
				opacity: 0
			}, 200, function () {
				fader.hide(0);
			});
		} else if (stage === 'first') {
			var spinner = new Spinner(opts).spin(target);
		} else {
			$(target).find('.spinner').fadeOut(100, function () {
				$('.spinner').remove();
				fader.animate({
					opacity: '0'
				}, 200);
			});
		}
	};

	MB.TableN.prototype.reload = function (callback) {
		var _t = this;
		var fader = _t.ct_instance.wrapper.find('.ct-fader');

		fader.css({
			opacity: 0.7,
			display: 'block'
		});

		MB.Core.spinner.start(_t.ct_instance.wrapper);

		_t.getData(function () {
			_t.ct_instance.data = _t.data;
			_t.ct_instance.tempPage = _t.tempPage;
			fader.css({
				opacity: 0,
				display: 'none'
			});
			MB.Core.spinner.stop(_t.ct_instance.wrapper);
			_t.ct_instance.update(function () {
				_t.setHandlers();
				_t.ct_instance.populateTotalSumms();
				//console.log('END RELOAD', new Date(), new Date().getMilliseconds());
			});


			if (typeof callback == 'function') {
				callback();
			}
		});
	};

	MB.TableN.prototype.setHandlers = function (callback) {
		var _t = this;
		var bs = {
			reload: _t.ct_instance.wrapper.find('.ct-options-reload'),
			pageInp: _t.ct_instance.wrapper.find('.ct-pagination-current-input'),
			prevPage: _t.ct_instance.wrapper.find('.ct-pagination-prev'),
			nextPage: _t.ct_instance.wrapper.find('.ct-pagination-next'),
			filter: _t.ct_instance.wrapper.find('.ct-options-filter'),
			save: _t.ct_instance.wrapper.find('.ct-options-save'),
			createInline: _t.ct_instance.wrapper.find('.ct-btn-create-inline'),
			createInForm: _t.ct_instance.wrapper.find('.ct-btn-create-in-form'),
			duplicate: _t.ct_instance.wrapper.find('.ct-btn-duplicate'),
			remove: _t.ct_instance.wrapper.find('.ct-btn-remove')
		};
		var wasPage = bs.pageInp.val();

		function validateNumber(val) {
			var numReg = new RegExp('^[0-9]+$');
			return numReg.test(val);
		}

		bs.pageInp.off('change').on('change', function () {
			var val = $(this).val();

			if (val != '') {
				if (validateNumber(val)) {
					if (val <= Math.ceil(+(_t.data.INFO['ROWS_COUNT']) / +(_t.profile['OBJECT_PROFILE']['ROWS_MAX_NUM']))) {
						if (val != wasPage) {
							_t.tempPage = val;
							_t.reload();
						}
					} else {
						bs.pageInp.val(wasPage);
					}
				} else {
					bs.pageInp.val(wasPage);
				}
			}
		});

		var checkForChanges = function (fff) {
			if (!localStorage.getItem('neverAskIfChangesOnPaginator'))
				toastrLock({
					message: '<p>При переходе на другую страницу все несохранённые изменения будут потеряны!</p><p>Подтверждаете переход?</p>',
					title: 'ВНИМАНИЕ!',
					buttons: [
						{name: 'ОК', class: 'danger', callback: fff},
						{name: 'Всегда переходить', class: 'danger', callback: function(){
							localStorage.setItem('neverAskIfChangesOnPaginator', true);
							fff();
						}},
						{name: 'Отмена', class: 'primary'}
					]
				});
			else fff();
		};

		bs.prevPage.off('click').on('click', function () {
			var _this = this;
			if ($(_this).hasClass('disabled')) {
				return
			}
			var fff = function() {
				if (_t.tempPage != 1) {
					_t.ct_instance.changes = [];
					$(_this).addClass('disabled');
					_t.tempPage = +_t.tempPage - 1;
					_t.reload(function () {
						$(_this).removeClass('disabled');
					});
				}
			};

			if (_t.ct_instance.changes.length) checkForChanges(fff);
			else fff();


		});

		bs.nextPage.off('click').on('click', function () {
			var _this = this;
			if ($(_this).hasClass('disabled')) {
				return
			}
			var fff = function () {
				if (_t.tempPage < Math.ceil(+(_t.data.INFO['ROWS_COUNT']) / +(_t.profile['OBJECT_PROFILE']['ROWS_MAX_NUM']))) {
					_t.ct_instance.changes = [];
					$(_this).addClass('disabled');
					_t.tempPage = +_t.tempPage + 1;
					_t.reload(function () {
						$(_this).removeClass('disabled');
					});
				}
			}


			if (_t.ct_instance.changes.length) checkForChanges(fff);
			else fff();


		});

		bs.reload.off('click').on('click', function () {
			//console.log('START RELOAD', new Date(), new Date().getMilliseconds());
			_t.ct_instance.order_by = '';
			_t.ct_instance.tableWrapper.find('th').removeClass('asc').removeClass('desc');
			_t.reload();
		});

		bs.save.off('click').on('click', function () {
			_t.save(function () {
				_t.ct_instance.clearAllSelection();
				_t.reload(function () {
					console.log('Saved!');
				});
			});
		});

		bs.createInline.off('click').on('click', function () {
			var firstRow = _t.ct_instance.wrapper.find('table tbody tr').eq(0);
			var newRowId = MB.Core.guid();
			var html = '<tr class="new_row" data-id="' + newRowId + '"><td class="frst"><div class="markRow" data-checked="false"><div class="rIdx">-</div><i class="fa fa-check"></i></div></td>';

			function getCellProfile(cellName) {
				for (var i in _t.profile.DATA) {
					var pItem = _t.profile.DATA[i];
					if (pItem[_t.profile.NAMES.indexOf('COLUMN_NAME')] == cellName) {
						return pItem;
					}
				}
			}

			var pkValuesArray = [];
			for (var pkv = 0; pkv < _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',').length; pkv++) {
				pkValuesArray.push('NEW_ROW_' + newRowId);
			}
			var chaColNames = [];
			var chaColValues = [];

			for (var i in _t.data.NAMES) {
				var cell = _t.data.NAMES[i];
				var cellProfile = getCellProfile(cell);
				if (cellProfile[_t.profile.NAMES.indexOf('VISIBLE')] == 'TRUE') {
					var type = cellProfile[_t.profile.NAMES.indexOf('TYPE_OF_EDITOR')];
					var editable = cellProfile[_t.profile.NAMES.indexOf('EDITABLE')];
					var insertable = (cellProfile[_t.profile.NAMES.indexOf('INSERTABLE')] == "TRUE") ? 'insertable' : '';
					var reqiured = (cellProfile[_t.profile.NAMES.indexOf('REQUIRED')] == "TRUE") ? 'required' : '';
					var selId = undefined;
					if (_t.data.DATA.length > 0) {
						selId = _t.data.DATA[0][_t.data.NAMES.indexOf(cellProfile[_t.profile.NAMES.indexOf('LOV_RETURN_TO_COLUMN')])];
					} else {
						selId = '';
					}

					var showRequiredStar = (editable == "TRUE" && reqiured == 'required') ? 'showRequired' : '';

					var returnToColumnValue = cellProfile[_t.profile.NAMES.indexOf('LOV_RETURN_TO_COLUMN')];
					if (returnToColumnValue != "") {
						for (var k in _t.data.NAMES) {
							var rtcCell = _t.data.NAMES[k];
							if (returnToColumnValue == rtcCell) {
								var rtcCellProfile = getCellProfile(rtcCell);
								if (rtcCellProfile[_t.profile.NAMES.indexOf('REQUIRED')] == 'TRUE') {
									showRequiredStar = 'showRequired';
								}
							}
						}
					}

					if (cell == 'ACTION_DATE_TIME' && type == 'datetime' && _t.name == 'table_action') { // HARDCODE!!!
						showRequiredStar = 'showRequired';
					}

					//var prepInsertIndex = _t.profile['OBJECT_PROFILE']['PREPARE_INSERT'].NAMES.indexOf(cell);
					//var cellValue = (~prepInsertIndex) ? _t.returnStringWithoutSpaces(_t.profile['OBJECT_PROFILE']['PREPARE_INSERT'].DATA[prepInsertIndex]) : '';

					html += '<td class="' + insertable + ' ' + reqiured + ' ' + showRequiredStar + '"><div class="requiredStar"><i class="fa fa-star"></i></div>' + _t.getTypeHtml(type, editable, cell, selId, '', false) + '</td>';

					var newValue = undefined;

					if (type == 'checkbox') {
						_t.ct_instance.addChange({
							COMMAND: 'NEW',
							PRIMARY_KEY_NAMES: _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(','),
							PRIMARY_KEY_VALUES: pkValuesArray,
							CHANGED_COLUMN_NAMES: cell,
							CHANGED_COLUMN_VALUES: 'FALSE'
						});
					}
				}
			}

			html += '</tr>';
			if (firstRow.length > 0) {
				firstRow.before(html);
			} else {
				_t.ct_instance.wrapper.find('table tbody').append(html);
			}
			_t.ct_instance.setHandlers();


		});

		bs.createInForm.off('click').on('click', function () {
			var formId = MB.Core.guid();
			var form = new MB.FormN({
				id: formId,
				name: _t.profile['OBJECT_PROFILE']['OPEN_FORM_CLIENT_OBJECT'],
				type: 'form',
				ids: ['new'],
				position: 'center'
			});
			form.create(function () {
				var modal = MB.Core.modalWindows.windows.getWindow(formId);

				$(modal).on('close', function () {
					console.log('modal closing trigger');
					_t.reload();
				});

				$(form).on('update', function () {
					console.log('form update trigger');
					_t.reload();
				});

			});
		});

		bs.duplicate.off('click').on('click', function () {


			if (_t.ct_instance.selection.length == 0) {
				toastr['info']('Выберите строку таблицы для дублирования');
				return;
			}

			var firstRow = _t.ct_instance.wrapper.find('table tbody tr').eq(0);
			var newRowId = MB.Core.guid();
			var html = '<tr class="new_row edited" data-id="' + newRowId + '"><td class="frst"><div class="markRow" data-checked="false"><div class="rIdx">-</div><i class="fa fa-check"></i></div></td>';


			var toAddChangeObj = [];
			var prototypeRow = _t.data.DATA[_t.ct_instance.selection[0]];

			function getCellProfile(cellName) {
				for (var i in _t.profile.DATA) {
					var pItem = _t.profile.DATA[i];
					if (pItem[_t.profile.NAMES.indexOf('COLUMN_NAME')] == cellName) {
						return pItem;
					}
				}
			}

			var pkValuesArray = [];
			for (var pkv = 0; pkv < _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',').length; pkv++) {
				pkValuesArray.push('NEW_ROW_' + newRowId);
			}
			for (var i in _t.data.NAMES) {
				var cell = _t.data.NAMES[i];
				var cellProfile = getCellProfile(cell);
				var selCell = cellProfile[_t.profile.NAMES.indexOf('LOV_RETURN_TO_COLUMN')];
				var type = cellProfile[_t.profile.NAMES.indexOf('TYPE_OF_EDITOR')];
				var editable = cellProfile[_t.profile.NAMES.indexOf('EDITABLE')];
				var insertable = (cellProfile[_t.profile.NAMES.indexOf('INSERTABLE')] == "TRUE") ? 'insertable' : '';
				var reqiured = (cellProfile[_t.profile.NAMES.indexOf('REQUIRED')] == "TRUE") ? 'required' : '';
				var selId = undefined;
				if (_t.data.DATA.length > 0) {
					selId = _t.data.DATA[0][_t.data.NAMES.indexOf(cellProfile[_t.profile.NAMES.indexOf('LOV_RETURN_TO_COLUMN')])];
				} else {
					selId = '';
				}

				var cellValue = prototypeRow[_t.data.NAMES.indexOf(cell)];

				if (cellProfile[_t.profile.NAMES.indexOf('VISIBLE')] == 'TRUE') {
					var showRequiredStar = (editable == "TRUE" && reqiured == 'required') ? 'showRequired' : '';
					var pks = _t.profile.OBJECT_PROFILE['PRIMARY_KEY'].split(',');
					cellValue = ($.inArray(cell, pks) > -1) ? '' : cellValue;
					html += '<td class="' + insertable + ' ' + reqiured + ' ' + showRequiredStar + '"><div class="requiredStar"><i class="fa fa-star"></i></div>' + _t.getTypeHtml(type, editable, cell, selId, cellValue, false) + '</td>';
				}

				if (cellProfile[_t.profile.NAMES.indexOf('VISIBLE')] == "TRUE" || cellProfile[_t.profile.NAMES.indexOf('REQUIRED')] == "TRUE" || cellValue != '') {
					if (type.indexOf('select2') > -1) {
						toAddChangeObj.push({
							PRIMARY_KEY_NAMES: _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(','),
							PRIMARY_KEY_VALUES: pkValuesArray,
							COMMAND: 'NEW',
							CHANGED_COLUMN_NAMES: selCell,
							CHANGED_COLUMN_VALUES: selId
						});
					} else {
						toAddChangeObj.push({
							PRIMARY_KEY_NAMES: _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(','),
							PRIMARY_KEY_VALUES: pkValuesArray,
							COMMAND: 'NEW',
							CHANGED_COLUMN_NAMES: cell,
							CHANGED_COLUMN_VALUES: cellValue
						});
					}
				}
			}
			html += '</tr>';

			if (firstRow.length > 0) {
				firstRow.before(html);
			} else {
				_t.ct_instance.wrapper.find('table tbody').append(html);
			}
			_t.ct_instance.setHandlers();
			for (var chs in toAddChangeObj) {
				_t.ct_instance.addChange(toAddChangeObj[chs]);
			}
			_t.ct_instance.clearAllSelection();
			$(_t.wrapper).find('tr.selectedRow').each(function(){
				$(this).removeClass('selectedRow').find('td.frst .markRow').attr('data-checked', 'false');
			});


//            console.log(_t.ct_instance.changes);
//            console.log('duplicate');
		});

		bs.remove.off('click').on('click', function () {
			var selection = _t.ct_instance.selection;
			var pks = _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'];

			function removeSpaces(str) {
				if (typeof str == 'string') {
					return str.replace(/\s+/g, '');
				} else {
					return str;
				}
			}

			pks = removeSpaces(pks).split(',');

			bootbox.dialog({
				title: 'Внимание',
				message: 'Вы уверены, что хотите удалить эти записи?',
				buttons: {
					success: {
						label: "Подтвердить",
						className: '',
						callback: function () {
							var sended = 0;
							for (var i in selection) {
								var rowData = _t.ct_instance.getRowDataByIndex(selection[i]);
								var rowPKs = {};
								for (var pk in pks) {
									rowPKs[pks[pk]] = rowData[_t.data.NAMES.indexOf(pks[pk])];
								}

								var sObj = {
									command: 'remove',
									object: _t.profile['OBJECT_PROFILE']['OBJECT_COMMAND'],
									sid: MB.User.sid,
									params: rowPKs
								};
								MB.Core.sendQuery(sObj, function (res) {
									toastr[res['TOAST_TYPE']](res['MESSAGE']);
									sended++;
									if (sended == selection.length) {
										_t.ct_instance.clearAllSelection();
										_t.reload();
									}
								});
							}
						}
					},
					error: {
						label: "Нет",
						className: '',
						callback: function () {

						}
					}
				}
			});
		});


		if (typeof callback == 'function') {
			callback();
		}
	};

	MB.TableN.prototype.getTypeHtml = function (type, editable, name, selId, cellValue, isFilter) {
		var _t = this;
		var res = '';
		var value = cellValue;

		if (editable == 'FALSE') {
			if (type == 'checkbox') {
				var valStr = (value == 'TRUE') ? '<i class="fa fa-check"></i>' : '';
				res = '<div class="readonlyCell checkboxReadOnly">' + valStr + '</div>';
			} else {
				if (name == 'BARCODE') {
					res = '<div class="barCodeCell">' + value + '</div>';
				} else {
					if (name == 'ACTION_DATE_TIME' && type == 'datetime' && _t.name == 'table_action') { // HARDCODE!!!
						res = '<div class="absoluteWhiteText">' + value + '</div><input type="text" class="datetimepicker" value="' + value + '" />';
					} else {
						res = '<div class="readonlyCell">' + value + '</div>';
					}
				}
			}
		} else {
			switch (type) {
				case 'text':
					res = '<input type="text" value="' + value + '" />';
					break;
				case 'like_text':
					res = '<input class="ct-filter-like-text-wrapper" data-name="' + name + '" type="text" value="' + value + '" />';
					break;
				case 'phone':
					res = '<input type="text" class="phoneNumber" value="' + value + '" />';
					break;
				case 'checkbox':

					if (isFilter) {
						res = '<div class="ct-filter-checkbox-wrapper" data-id="' + MB.Core.guid() + '" data-name="' + name + '"></div>';
					} else {
						res = '<div class="ct-checkbox-wrapper" data-type="inTable" data-id="' + MB.Core.guid() + '" data-name="' + name + '" data-value="' + value + '"></div>';
					}
					break;
				case 'number':
					res = '<input type="number" value="' + value + '" />';
					break;
				case 'datetime':
					res = '<div class="absoluteWhiteText">' + value + '</div><input type="text" class="datetimepicker" value="' + value + '" />';
					break;
				case 'daysweek':
					res = '<input type="text" data-name="' + name + '" data-id="' + MB.Core.guid() + '" class="ct-daysweek-select3-wrapper daysweekpicker" value"' + value + '"/>';
					break;
				case 'daterange':
					res = '<div data-name="' + name + '" class="input-daterange input-group ct-daterange-wrapper">' +
					'<input type="text" class="" name="start" />' +
					'<span class="input-group-addon">-</span>' +
					'<input type="text" class="" name="end" />' +
					'</div>';
					break;
				case 'timerange':
					res = '<div data-name="' + name + '" class="input-daterange input-group ct-timerange-wrapper">' +
					'<input type="text" class="" name="start" />' +
					'<span class="input-group-addon">-</span>' +
					'<input type="text" class="" name="end" />' +
					'</div>';
					break;
				case 'select2withEmptyValue':
					res = '<div data-with_empty="true" data-val="' + selId + '" data-title="' + value + '" data-name="' + name + '" class="ct-select3-wrapper preInit">' + value + '<i class="fa fa-angle-down"></i></div>';
					break;
				case 'select2':
					res = '<div data-with_empty="false" data-val="' + selId + '" data-title="' + value + '" data-name="' + name + '" class="ct-select3-wrapper preInit">' + value + '<i class="fa fa-angle-down"></i></div>';
					break;
				case 'colorpicker' :
					res = '<input class="ct-colorpicker-wrapper" data-name="' + name + '" type="text" value="' + value + '" /><div class="ct-colorpicker-state" style="background-color: ' + value + '"></div>';
					break;
				default :
					res = '<div>type: ' + type + ' - ' + value + '</div>';
					break;
			}
		}
		return res;
	};

	MB.TableN.prototype.validateNewCommand = function (sObj) {
		var _t = this;
		var isValid = 0;
		var requiredColumns = [];
		for (var i in _t.profile.DATA) {
			var item = _t.profile.DATA[i];
			var isReq = item[_t.profile.NAMES.indexOf('REQUIRED')];
			var isVis = item[_t.profile.NAMES.indexOf('VISIBLE')];
			var isEdi = item[_t.profile.NAMES.indexOf('EDITABLE')];
			var isIns = item[_t.profile.NAMES.indexOf('INSERTABLE')];
			var typeOfEditor = item[_t.profile.NAMES.indexOf('TYPE_OF_EDITOR')];
			if (isReq == 'TRUE' && isVis == 'TRUE' && isEdi == 'TRUE') {
				if (typeOfEditor == 'select2' || typeOfEditor == 'select2WithEmptyValue' || typeOfEditor == 'select2FreeType') {
					if (item[_t.profile.NAMES.indexOf('LOV_RETURN_TO_COLUMN')].length == 0) {
						requiredColumns.push(item[_t.profile.NAMES.indexOf('COLUMN_NAME')]);
					} else {
						requiredColumns.push(item[_t.profile.NAMES.indexOf('LOV_RETURN_TO_COLUMN')]);
					}
				} else {
					requiredColumns.push(item[_t.profile.NAMES.indexOf('COLUMN_NAME')]);
				}
			}
		}

		for (var k in requiredColumns) {
			var rCol = requiredColumns[k];
			if ($.inArray(rCol, sObj['CHANGED_COLUMN_NAMES']) > -1) {

			} else {
				isValid++;
				//console.log(sObj['CHANGED_COLUMN_NAMES'], requiredColumns);

				//ВЫВОДИТЬ КОНКРЕТНЫЕ ПОЛЯ
				toastr['error']('Заполните все обязательные поля (*)');
			}
		}
		return isValid == 0;
	};

	MB.TableN.prototype.returnStringWithoutSpaces = function (str) {
		str = str || '';
		return str.replace(/(^\s*)|(\s*)$/g, '');
	};

	MB.TableN.prototype.save = function (callback) {
		var _t = this;
		var chs = _t.ct_instance.changes;
		var totalSaved = 0;
		var totalError = 0;

		function finishSave() {
			if (totalError + totalSaved == chs.length) {
				_t.ct_instance.changes = [];
				if (_t.parentObject) {
					_t.parentObject.enableSaveButton();
				}
				if (typeof callback == 'function') {
					callback();
				}
			}
		}

		for (var i in chs) {
			var ch = chs[i];
			for (var c in ch) {
				if (typeof ch[c] != 'object') {
					ch[c] = [ch[c]];
				}
			}

			function populateParams(o) {
				var res = {};

				if (o['COMMAND'][0] != 'NEW') {
					for (var i in o['PRIMARY_KEY_NAMES']) {
						var idsArr = o['PRIMARY_KEY_NAMES'];
//                        if(o['PRIMARY_KEY_VALUES'].indexOf('NEW_ROW_')){
//                            continue;
//                        }
						var namesArr = o['PRIMARY_KEY_VALUES'];
						res[idsArr[i]] = _t.returnStringWithoutSpaces(namesArr[i]);
					}
				}

				for (var k in o['CHANGED_COLUMN_NAMES']) {
					var idsArr2 = o['CHANGED_COLUMN_NAMES'];
					var namesArr2 = o['CHANGED_COLUMN_VALUES'];

					console.log(namesArr2[k]);

					res[idsArr2[k]] = _t.returnStringWithoutSpaces(namesArr2[k]);
				}

				if (o['COMMAND'][0] == 'NEW') {
					for (var p in _t.profile['OBJECT_PROFILE']['PREPARE_INSERT'].NAMES) {
						var pName = _t.profile['OBJECT_PROFILE']['PREPARE_INSERT'].NAMES[p];
						var pVal = _t.profile['OBJECT_PROFILE']['PREPARE_INSERT'].DATA[p];

						res[pName] = _t.returnStringWithoutSpaces(pVal);
					}

					res[_t.profile['OBJECT_PROFILE']['PARENT_KEY']] = _t.parent_id;

				}

				return res;
			}

			var sObj = {};
			if (ch['COMMAND'][0] == 'NEW') {
				if (_t.validateNewCommand(ch)) {

					sObj = {
						command: ch['COMMAND'][0].toLowerCase(),
						object: _t.profile['OBJECT_PROFILE']['OBJECT_COMMAND'],
						sid: MB.User.sid,
						params: populateParams(ch)
					};

					MB.Core.sendQuery(sObj, function (res) {
						if (res["code"] == 0) {
							totalSaved += 1;
						} else {
							totalError += 1;
						}

						toastr[res['TOAST_TYPE']](res['MESSAGE']);
						finishSave();
					});

				}
			} else {
				sObj = {
					command: ch['COMMAND'][0].toLowerCase(),
					object: _t.profile['OBJECT_PROFILE']['OBJECT_COMMAND'],
					sid: MB.User.sid,
					params: populateParams(ch)
				};

				MB.Core.sendQuery(sObj, function (res) {
					if (res["code"] == 0) {
						totalSaved += 1;
					} else {
						totalError += 1;
					}

					toastr[res['TOAST_TYPE']](res['MESSAGE']);
					finishSave();
				});
			}
		}

	};

	MB.TableN.prototype.makeOperation = function (operation, callback) {
		var _t = this;
		var operationName, params;
		var preArr = _t.ct_instance.getFlatSelectionArray(), selArr = [];

		if (typeof operation == 'object') {
			operationName = operation.operationName;
			if (operation.params instanceof Array) {
				params = _t.ct_instance.isDisabledCtx(operation.params[0]);
				for (var i = 1; i < operation.params.length; i++) {
					for (var j in params) {
						params[j] = params[j] || _t.ct_instance.isDisabledCtx(operation.params[i])[j];
					}
				}
			} else params = _t.ct_instance.isDisabledCtx(operation.params);
			for (var i in params) if (params[i] == !!operation.revert) selArr.push(preArr[i]);
		} else {
			operationName = operation;
			selArr = preArr;
		}


		var totalOk = 0;
		var totalErr = 0;
		var primaryKeys = _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',');

		if (selArr.length == 0) {
			var o = {
				command: 'operation',
				object: operationName
			};
//            for(var k in primaryKeys){
//                o[primaryKeys[k]] = item[_t.ct_instance.data.NAMES.indexOf(primaryKeys[k])];
//            }
			socketQuery(o, function (res) {
				res = JSON.parse(res);
				var toastrInfo = res.results[0]['toastr'];
				if (res['code'] == 0) {
					totalOk++;
				} else {
					totalErr++;
				}
				toastr[toastrInfo['type']](toastrInfo['message']);
				finished();
			});
		}

		for (var i in selArr) {
			var item = selArr[i];
			var o = {
				command: 'operation',
				object: operationName
			};

			for (var k in primaryKeys) {
				o[primaryKeys[k]] = item[_t.ct_instance.data.NAMES.indexOf(primaryKeys[k])];
			}
			socketQuery(o, function (res) {
				res = JSON.parse(res);
				var toastrInfo = res.results[0]['toastr'];
				if (res['code'] == 0) {
					totalOk++;
				} else {
					totalErr++;
				}
				toastr[toastrInfo['type']](toastrInfo['message']);
				finished();
			});
		}

		function finished() {
			if ((totalOk + totalErr) == selArr.length) {
				if (typeof callback == "function") {
					callback();
				}
				_t.reload();
			}
		}
	};

	MB.TableN.prototype.openRowInModal = function () {
		var _t = this;

		var flatSelection = _t.ct_instance.getFlatSelectionArray();
		for (var i in flatSelection) {
			var sel = flatSelection[i];
			var formId = MB.Core.guid();

			var openInModalO = {
				id: formId,
				name: _t.profile['OBJECT_PROFILE']['OPEN_FORM_CLIENT_OBJECT'],
				type: 'form',
				ids: [sel[_t.ct_instance.data.NAMES.indexOf(_t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')[0])]],
				position: (flatSelection.length == 1) ? 'center' : 'shift'
			};

			var form = new MB.FormN(openInModalO);
			form.create(function () {
				var modal = MB.Core.modalWindows.windows.getWindow(formId);
				$(modal).on('close', function () {
					console.log('modal closing trigger');
					_t.reload();
				});

				$(form).on('update', function () {
					console.log('form update trigger');
					_t.reload();
				});
			});
		}

//        var formId = MB.Core.guid();
//        var openInModalO = {
//            id : formId,
//            name : _t.profile['OBJECT_PROFILE']['OPEN_FORM_CLIENT_OBJECT'],
//            type : 'form',
//            ids : [_t.ct_instance.data.DATA[_t.ct_instance.selectedRowIndex][_t.ct_instance.data.NAMES.indexOf(_t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')[0])]],
//            position: 'center'
//        };
//
//        console.log('IDS', _t);
//
//        var form = new MB.FormN(openInModalO);
//        form.create(function(){
//            var modal = MB.Core.modalWindows.windows.getWindow(formId);
//            $(modal).on('close', function(){
//                console.log('modal closing trigger');
//                _t.reload();
//            });
//
//            $(form).on('update', function(){
//                console.log('form update trigger');
//                _t.reload();
//            });
//        });
	};
}());
