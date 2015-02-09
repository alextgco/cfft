var TabsClass = function(obj){
    log("TabsClass connection")
    var _this = this;
    if(obj!=undefined){
        if(obj.type!=undefined){_this.type = obj.type;}else {_this.type = "";}
    }
    else {_this.type = "";}
    setTimeout(function(){
        _this.activeForm    = MB.Modal.activemodal;
        _this.form          = MB.O.forms[_this.activeForm];
        _this.parentForm    = $("#modal_"+_this.activeForm+"_wrapper");
        _this.parentButtons = _this.parentForm.find(".actions");
        _this.tabContent    = _this.parentForm.find(".tab-content");
        _this.init();
    },300);
}

TabsClass.prototype.init = function(){
    var _this = this;
    _this.modalTabs = _this.parentForm.find("ul.nav-tabs");
    _this.modalTabs.show();
    _this.tabContent.show();
    _this.modalTabs.find("li").show();
    var tabs = _this.modalTabs;
    if(tabs.html()!=""){
        _this.handlerAction();
    }
}

TabsClass.prototype.handlerAction = function(){
    var _this = this;
    // Создать кнопка
    this.parentButtons.find(".form-create-button").click(function(){
        if(_this.type == ""){
            _this.modalTabs.find("li").hide();
            $(_this.modalTabs.find("li")[0]).show();
        }
        else if(_this.type == "disAll"){
            _this.modalTabs.hide();
            _this.tabContent.hide();
        }
        
    })
}

//var Tabs = new TabsClass();