(function(){
    var tableInstance = MB.Tables.getTable(MB.Tables.justLoadedId);
    var formInstance = tableInstance.parentObject;
    var formWrapper = $('#mw-'+formInstance.id);
    var formTrain = formWrapper.find('.fn-train-overflow').fn_train();
    var linesTableWrapper = formWrapper.find('.linesTblWrapper');

    console.log('scr loaded and started', tableInstance);

    tableInstance.ct_instance.ctxMenuData = [
        {
            name: 'option1',
            title: 'Распечатать накладную',
            disabled: function(){
                return false;
            },
            callback: function(){

                var sel = tableInstance.ct_instance.selection[0];
                var rowid = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('ORDER_DELIVERY_NOTE_ID')];

                var name = 'report_quota_delivery_note';
                var subcommand = '?sid='+MB.User.sid+'&object='+name+'&ORDER_DELIVERY_NOTE_ID='+rowid ;

                var urlString = '<iframe class="iFrameForPrint" src="html/report/print_report.html' + subcommand + '" width="" height"" align"left"></iframe>';
                $("body").append(urlString);
            }
        },
        {
            name: 'option3',
            title: 'Накладная на выдачу квоты без штрихкодов',
            disabled: function(){
                return false;
            },
            callback: function(){

                var sel = tableInstance.ct_instance.selection[0];
                var rowid = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('ORDER_DELIVERY_NOTE_ID')];

                var name = 'report_quota_delivery_noteno_barcodes';
                var subcommand = '?sid='+MB.User.sid+'&object='+name+'&ORDER_DELIVERY_NOTE_ID='+rowid ;

                var urlString = '<iframe class="iFrameForPrint" src="html/report/print_report.html' + subcommand + '" width="" height"" align"left"></iframe>';
                $("body").append(urlString);
            }
        },
        {
            name: 'option2',
            title: 'Посмотреть билеты по накладной',
            disabled: function(){
                return false;
            },
            callback: function(){

                var sel = tableInstance.ct_instance.selection[0];
                var rowid = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('ORDER_DELIVERY_NOTE_ID')];

                formTrain.slideLeft(function(){
                    MB.Core.spinner.start(formWrapper.find('.fn-vagon').eq(1));
                    var tblId = MB.Core.guid();
                    var tbl = new MB.TableN({
                        id: tblId,
                        name: 'tbl_order_delivery_note_line',
                        parent_id: formInstance.id,
                        parent_object: formInstance,
                        externalWhere: 'ORDER_DELIVERY_NOTE_ID='+rowid
                    });
                    tbl.create(linesTableWrapper, function(){
                        MB.Core.spinner.stop(formWrapper.find('.fn-vagon').eq(1));
                        formWrapper.find('.to_reports').removeClass('hidden').addClass('back').html('<i class="fa fa-arrow-left"></i>&nbsp;&nbsp;Назад');
                    });
                });
            }
        }
    ];

}());