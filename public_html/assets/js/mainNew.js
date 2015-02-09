(function(){

    MB = MB || {};
    MB.Core = MB.Core || {};

    MB.Core.spinner = {
        start: function(container){
            container.append('<div class="preloader"></div>');
        },
        stop: function(container){
            container.find('.preloader').remove();
        }
    };

}());
