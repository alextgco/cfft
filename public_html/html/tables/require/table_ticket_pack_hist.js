(function (){
    var tableNId = $('.page-content-wrapper .classicTableWrap').data('id');
    var tableInstance = MB.Tables.getTable(tableNId);

    tableInstance.ct_instance.ctxMenuData = [
        {
            name: 'option1',
            title: 'Напечатать накладную',
            disabled: function(){
                return false;
            },
            callback: function(){
                $('.iFrameForPrint').remove();
                var delivery_note = tableInstance.data.DATA[tableInstance.ct_instance.selection[0]][tableInstance.data.NAMES.indexOf("DELIVERY_NOTE")];
                var getStr = "?sid=" + MB.User.sid+"&delivery_note="+delivery_note+"&object=report_delnote_ticket_pack";
                var iFrame = "<iframe class=\"iFrameForPrint\" src=\"" + "html/report/print_report.html" + getStr + "\" width=\"0\" height=\"0\" align=\"left\"></iframe>";
                $("body").append(iFrame);
            }
        }
    ];
}());
