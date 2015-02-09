function initSendObject(options) {
    var sending_obj = {};
    sending_obj.isWithBasket = options.containerModel.get("isBasket");
    sending_obj.box = options.container;
    sending_obj.host = options.containerModel.get("host");
    sending_obj.frame = options.containerModel.get("frame");
    sending_obj.container = options.container;
    obj = options.containerModel.attributes;
    sending_obj.warning = obj.WARNING_CONTENT || '';
    sending_obj.agent_percent = obj.SERVICE_FEE || 0;
    var iFrameLegend_position = obj.INFOBOX_POSITION || obj.SOCKET_HOST || "left";
    sending_obj.iFrameLegend_position = iFrameLegend_position.toLocaleLowerCase();
    sending_obj.rules_path = obj.RULES_PDF_PATH || "rules.pdf";
    sending_obj.bgColor = obj.BG_COLOR || options.container.data('bgColor') || "#f7f7f7";
    sending_obj.nav_height = (obj.NAVIGATOR_HEIGHT != '') ? obj.NAVIGATOR_HEIGHT : undefined;
    sending_obj.nav_width = (obj.NAVIGATOR_WIDTH != '') ? obj.NAVIGATOR_WIDTH : undefined;
    return sending_obj;
}