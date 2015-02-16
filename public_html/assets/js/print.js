$(document).on('print',function(e,data){
    if (typeof data!=="object"){
        return false;
    }

    var getPrintInstance = function(callback){
        if (!MB.User.printInstance){
            MB.Core.switchModal({
                type:"content",
                filename:"printStack",
                isNew: true,
                params:{}
            },function(instanceContent){
                MB.User.printInstance = instanceContent;
                callback(MB.User.printInstance);
            });
        }else{
            callback(MB.User.printInstance);
        }
    };

    var type = data.type;
    switch (type){
        case 'PACK_INFO':
            var packs = [];
            for(var i in data.data){
                var obj = {};
                if(!data.data[i].TICKET_PACK_ID){
                    continue;
                }else{
                    obj.pack_id = data.data[i].TICKET_PACK_ID;
                    obj.pack_name = data.data[i].TICKET_PACK_NAME;
                    obj.printer_name = i;
                    obj.pack_start = data.data[i].START_NO;
                    obj.pack_end = data.data[i].FINISH_NO;
                    obj.pack_current = data.data[i].SCA_CURRENT_NO;
                }
                packs.push(obj);
            }
            MB.Core.packInfo.init({
                packs: packs
            });

            //MB.Core.packInfo.init(data.data);
            break;
        case 'NEED_CONFIRM':
            MB.Core.lockScreen.init({
                title: $.cookie().userfullname,
                content: MB.Core.getPrinterSettingsHtml(data),
                buttons: [
                    {
                        title: "Подтвердить",
                        className: "",
                        id: "",
                        callback: function(param){
                            param.command = "PACK_CONFIRM";
                            param.back = data.back;
                            console.log(param);
                            printQuery(param);
                            MB.Core.lockScreen.close();
                        }
                    }
                ]
            }, function(wrapper){
                wrapper.find('.select2').select2();
                $('#lockScreenWrapper select').on('change', function(){
                    var value = $(this).val();
                    var tpt = $(this).find('option:selected').attr('data-tpt');
                    for(var i =0; i< $('#lockScreenWrapper select').length; i++){
                        var sel = $('#lockScreenWrapper select').eq(i);
                        if(sel.find('option:selected').attr('data-tpt') == tpt){
                            if(!sel.is($(this))){
                                sel.select2('val', -1);
                            }
                        }
                    }
                });
            });
            //MB.Core.lockScreen.init({});

            break;
        case 'NEED_CHANGE_PACK':
            MB.Core.lockScreen.init({
                title: $.cookie().userfullname,
                content: MB.Core.getPrinterSettingsHtml(data),
                buttons: [
                    {
                        title: "Подтвердить",
                        className: "",
                        id: "",
                        callback: function(param){
                            param.command = "PACK_CONFIRM";
                            param.back = data.back;
                            console.log(param);
                            printQuery(param);
                            MB.Core.lockScreen.close();
                        }
                    },
                    {
                        title: "Отменить",
                        className: "",
                        id: "",
                        callback: function(param){
                            param.command = "CHANGE_PACK_CANCEL";
                            param.back = data.back;
                            console.log(param);
                            printQuery(param);
                            MB.Core.lockScreen.close();
                        }
                    }
                ]
            }, function(wrapper){
                wrapper.find('.select2').select2();
                $('#lockScreenWrapper select').on('change', function(){
                    var value = $(this).val();
                    var tpt = $(this).find('option:selected').attr('data-tpt');
                    for(var i =0; i< $('#lockScreenWrapper select').length; i++){
                        var sel = $('#lockScreenWrapper select').eq(i);
                        if(sel.find('option:selected').attr('data-tpt') == tpt){
                            if(!sel.is($(this))){
                                sel.select2('val', -1);
                            }
                        }
                    }
                });
            });
            break;
        case 'PRINT_START':
            getPrintInstance(function(printInstance){
                printInstance.addItems(data.ticket_stack, true);
                printInstance.setPortion(data.portion,true);
            });
            break;
        case 'PRINT_TICKET_RESPONSE':
            getPrintInstance(function(printInstance){
                printInstance.updateItem(data.ticket,data.where);
                printInstance.renderTicket(data.where.order_ticket_id);
            });
            break;
        case 'PRINT_WAIT_NEXT':
            getPrintInstance(function(printInstance){
                /*printInstance.updateItem(data.ticket,data.where);
                printInstance.renderTicket(data.where.order_ticket_id);*/
            });
            /*console.log('PRINT_WAIT_NEXT');
            setTimeout(function(){
                param = {
                    command:"PRINT_NEXT_PORTION"
                };
                printQuery(param);
            },2000);*/
            break;
        case 'OK':
            var type = 'success';
            var title = 'Ок!';
            toastr[type](data.message, title);
            break;
        case 'INFO':
            var type = 'info';
            var title = 'Внимание:';
            toastr[type](data.message, title);
            break;
        case 'ERROR':
            var type = 'error';
            var title = 'Ошибка!';
            toastr[type](data.message, title);
            break;
        default:
            break;
    }
    return true;
});
