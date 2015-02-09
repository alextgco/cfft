
ButtonsClass = (instance,CustomButtons) ->
    div = instance.$container;
    if div.find(".buttons").html()==""
        for key, value of CustomButtons
            html = '<button
            id="formAction_'+key+'"
            type="button"
            class="btn '+CustomButtons[key]['style']+' form-create-button '+key+'">
            <i class="fa fa-copy"></i> '+CustomButtons[key]['name']+'
            </button>'
            div.find(".buttons").append html
            if CustomButtons[key].disabled()
                div.find(".buttons").find("."+key).attr "disabled","true"
            else 
                div.find(".buttons").find("."+key).removeAttr "disabled"
        div.find(".buttons").click (e) ->
            if $(e.target).attr("class") != "buttons"
                key = $(e.target).attr("id").replace("formAction_","")
                CustomButtons[key].callback()
    for key, value of CustomButtons
        if CustomButtons[key].disabled()
            div.find(".buttons").find("."+key).attr "disabled","true"
        else 
            div.find(".buttons").find("."+key).removeAttr "disabled" 
    return true

MB.Core.CreateButtonsInForm = (instance,buttons) -> 
    buttons = new ButtonsClass(instance,buttons)