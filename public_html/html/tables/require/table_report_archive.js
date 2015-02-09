(function(){

    var tableNId = $('.page-content-wrapper .classicTableWrap').data('id');
    var tableInstance = MB.Tables.getTable(tableNId);
    tableInstance.ct_instance.ctxMenuData = [
        {
            name: 'option1',
            title: 'Посмотреть отчет',
            disabled: function(){
                return false;
            },
            callback: function(){
                var o = {
                    command: "get",
                    object: "report_from_report_archive",
                    report_archive_id: tableInstance.data.DATA[tableInstance.ct_instance.selection[0]][tableInstance.data.NAMES.indexOf(tableInstance.profile['OBJECT_PROFILE']['PRIMARY_KEY'])]
                };

                socketQuery(o, function(res){
                    res = JSON.parse(res);
                    res = res['results'][0];

                    var myWindow = window.open("","MsgWindow","width=" + $(window).outerWidth() + ",height=" + $(window).outerHeight());
                    myWindow.document.write("<html><head><link rel='stylesheet' href='html/report/report.css'></head><body><div id='report'>" + res.data + "</div></body></html>");
                    myWindow.print();
                });
            }
        }
    ];
}());
