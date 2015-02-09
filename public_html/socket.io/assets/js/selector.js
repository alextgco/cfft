var Selector = function(params){
    this.xStart = 0;
    this.yStart = 0;
    this.selecting = false;
    var self = this;
    /*debugger;
    (function(){*/
    var box_parent = (params.parentBox!=undefined) ? params.parentBox : $("body");
    var zIndex = (params.zIndex!=undefined) ? params.zIndex : 2;
    if ($("#select_rect").length==0){
        box_parent.prepend('<div id="select_rect"></div>');
    }
    $("#select_rect").css("zIndex",zIndex);
    this.el = $("#select_rect");
    /*})();*/
};

Selector.prototype.selectStart = function(x,y){
    this.selecting = true;
    this.xStart = x;
    this.yStart = y;
    this.el.css({width:0,height:0,top:y+"px",left:x+"px"}).fadeIn(150);
};
Selector.prototype.selectMove = function(x,y,callback){
    var w = (x-this.xStart-10);
    var h = (y-this.yStart-10);
    this.el.css({width:w+"px",height:h+"px"});
    if (typeof callback=="function"){
        callback(this.xStart,this.yStart,w,h);
    }
};
Selector.prototype.selectStop = function(x,y,callback){
    if (!this.selecting) {
        if (typeof callback=="function")
            callback(this.xStart,this.yStart,w,h);
        return;
    }
    this.selecting = false;
    var w = (x-this.xStart-10);
    var h = (y-this.yStart-10);
    this.el.fadeOut(250);
    if (typeof callback=="function")
        callback(this.xStart,this.yStart,w,h);

};

