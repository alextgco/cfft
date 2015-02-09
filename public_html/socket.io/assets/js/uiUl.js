var uiUl = function(){

    $(document).on('click', 'ul.newUl.selectable li', function(){
        var parent = $(this).parents('ul'),
            liCollection = parent.find('li'),
            isWasSelected = $(this).hasClass('selected');

        if(isWasSelected){
            return false;
        }else{
            liCollection.removeClass('selected');
            $(this).addClass('selected');
        }
    });
};
