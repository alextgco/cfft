(function() {
  var ButtonsClass;

  ButtonsClass = function(instance, CustomButtons, idName) {
    var div, html, key, state, value;
    state = instance.mode;
    div = instance.$container;
    this.obj = div.find(".buttons");
    if (div.find(".buttons").html() === "") {
      for (key in CustomButtons) {
        value = CustomButtons[key];
        html = '<button id="' + idName + '_' + key + '" type="button" class="btn ' + CustomButtons[key]['style'] + ' ' + key + '"> <i class="fa fa-copy"></i> ' + CustomButtons[key]['name'] + '</button>';
        div.find(".buttons").append(html);
        if (CustomButtons[key].disabled()) {
          div.find(".buttons").find("." + key).attr("disabled", "true");
        } else {
          div.find(".buttons").find("." + key).removeAttr("disabled");
        }
      }
      div.find(".buttons").click(function(e) {
        if ($(e.target).attr("class") !== "buttons") {
          key = $(e.target).attr("id").replace(idName + "_", "");
          return CustomButtons[key].callback();
        }
      });
    }
    for (key in CustomButtons) {
      value = CustomButtons[key];
      if (CustomButtons[key].disabled()) {
        div.find(".buttons").find("." + key).attr("disabled", "true");
      } else {
        div.find(".buttons").find("." + key).removeAttr("disabled");
      }
    }
    this.trigger(instance);
    return true;
  };

  ButtonsClass.prototype.trigger = function(instance) {
    var state, _this;
    _this = this;
    state = instance.mode;
    switch (state) {
      case "edit":
        return _this.obj.show();
      case "add":
        console.log(_this.obj);
        return _this.obj.hide();
      case "addinit":
        console.log(_this.obj);
        return _this.obj.hide();
    }
  };

  MB.Core.CreateButtonsInForm = ButtonsClass;

}).call(this);
