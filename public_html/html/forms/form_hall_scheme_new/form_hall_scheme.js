(function () {
    var modal = $('.mw-wrap').last();
    var formID = MB.Forms.justLoadedId;
    var formInstance = MB.Forms.getForm('form_hall_scheme', formID);
    var formWrapper = $('#mw-'+formInstance.id);
    var modalInstance = MB.Core.modalWindows.windows.getWindow(formInstance.id);

    formInstance.lowerButtons = [
        {
            name: 'option3',
            title: 'Перейти к редактору',
            icon: 'fa-edit',
            color: 'blue',
            className: '',
            disabled: function(){
                return formInstance.activeId == 'new';
            },
            callback: function(){
                socketQuery({
                    command:"get",
                    object:"hall_scheme",
                    params:{
                        where:"hall_scheme_id = "+formInstance.activeId}
                },function(res){

                    res = JSON.parse(res);
                    res = res['results'][0];
                    res = jsonToObj(res);

                    var hall_id = res[0].HALL_ID;
                    var title = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf('HALL_NAME')];

                    modalInstance.collapse();

                    MB.Core.switchModal({
                        type:"content",
                        filename:"mapEditor",
                        params:{
                            hall_scheme_id: formInstance.activeId,
                            hall_id: hall_id,
                            title: title,
                            label: 'Редактор зала'
                        }
                    });
                });
            }
        },
        {
            name: 'option4',
            title: 'Создать копию',
            icon: 'fa-copy',
            color: 'blue',
            className: '',
            disabled: function(){
                return formInstance.activeId == 'new';
            },
            callback: function(){
                var hallName = formInstance.data.DATA[0][formInstance.data.NAMES.indexOf("NAME")]+" (Копия)";
                bootbox.dialog({
                    //selector: "#portlet-config",
                    title: "Копирование схемы зала.",
                    message: "Схему зала можно скопировать в двух режимах. В первом будет скопирована только физическая модель зала (расположения мест, надписей, изображений), а во втором, также, будут скопированы все схемы распределения/распоясовки/расценки.<input type='text' class='copySchemeName' value='"+hallName+"' size='60'/>",
                    buttons: {
                        success: {
                            label:"Скопировать только места",
                            //color:"blue",
                            //dopAttr:"",
                            callback: function(){
                                var info = toastr["info"]("Идет процесс копирования", "Подождите...",{
                                    timeOut:1000000
                                });
                                var copySchemeName = $(".copySchemeName").val();
                                MB.Core.sendQuery({command:"operation",object:"copy_hall_scheme",sid:MB.User.sid,params:{hall_scheme_id:formInstance.activeId,all:0,name:copySchemeName}},function(data){
                                    info.fadeOut(600);
                                    if (data.RC==0){ //code
                                        formInstance.reload();
                                        toastr[data.TOAST_TYPE](data.MESSAGE, data.TITLE);
                                        $(modalObj.selector).modal("hide");
                                    }else{
                                        toastr[data.TOAST_TYPE](data.MESSAGE, data.TITLE);
                                    }
                                });
                            }
                        },
                        success2: {
                            label:"Полная копия",
                            //color:"yellow",
                            //dopAttr:"",
                            callback: function(){
                                var info = toastr["info"]("Идет процесс копирования", "Подождите...",{
                                    timeOut:1000000
                                });
                                var copySchemeName = $(".copySchemeName").val();
                                MB.Core.sendQuery({command:"operation",object:"copy_hall_scheme",sid:MB.User.sid,params:{hall_scheme_id:formInstance.activeId,name:copySchemeName,all:1}},function(data){
                                    info.fadeOut(600);
                                    if (data.RC==0){ //code
                                        formInstance.reload();
                                        toastr[data.TOAST_TYPE](data.MESSAGE, data.TITLE);
                                        $(modalObj.selector).modal("hide");
                                    }else{
                                        toastr[data.TOAST_TYPE](data.MESSAGE, data.TITLE);
                                    }
                                });
                            }
                        },
                        cancel: {
                            label:"Закрыть",
                            //color:"default",
                            //dopAttr:'data-dismiss="modal"',
                            callback: function(){

                            }
                        }
                    }
                });
                //MB.Core.ModalMiniContent(modalObj);
            }
        }
    ];

})();
