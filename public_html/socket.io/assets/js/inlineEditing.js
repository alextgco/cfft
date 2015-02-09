var inlineEditing = function(){

    function confirmInlineEditing(inpElem){

        function setValue(inpElem){
            var val = inpElem.val(),
                regExp = new RegExp(/^\s+$/),
                container = inpElem.parents('.inlineEditing');

            if(regExp.test(val) || !val){
                val = 'Нет значения';
            }
            container.html(val).removeClass('inEditing');
        }

        $(document).on('change', inpElem, function(){
            setValue(inpElem);
        });

        inpElem.blur(function(){
            setValue(inpElem);
        });
    }

    $(document).on('dblclick', '.inlineEditing', function(event){
        event = event || window.event;
        var container = $(this),
            val = $(this).html(),
            input = '<input type="text" class="form-control inp_inlineEditing" placeholder="'+val+'">';

        if(container.hasClass('inEditing')){
            return false;
        }else{
            container.html(input).addClass('inEditing');
            var inputElem = container.find('input');
            inputElem.focus();

            confirmInlineEditing(inputElem);
        }
    });
};
