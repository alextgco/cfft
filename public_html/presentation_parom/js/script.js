$(document).ready(function(){

    var inSlide = false;

    $(document).on('click', '.openInfo', function(){
        var parent = $(this).parents('.sItem'),
            pId = parent.attr('data-id'),
            infoBlock = parent.find('.infoPlace');

        $(this).fadeOut(100);
        infoBlock.animate({right: 0}, 100, function(){

        });

    });

    $(document).on('click', '.closeInfo', function(){
        var parent = $(this).parents('.sItem'),
            pId = parent.attr('data-id'),
            infoBlock = parent.find('.infoPlace'),
            openInfo = parent.find('.openInfo');

        infoBlock.animate({right: '-50%'}, 100, function(){});
        openInfo.fadeIn(100);
    });

    $(document).on('click', '.prev', function(){
        var tempPage = $('.sItem.active'),
            tempPageId = parseInt($('.sItem.active').attr('data-id'));

        if(inSlide){
            return;
        }

        if(tempPageId == 1){
            return;
        }

        $('.tempPage').html(tempPageId-1);

        var prevPage = $('.sItem[data-id="'+(tempPageId-1)+'"]');

        inSlide = true;

        prevPage.css('right','100%');

        tempPage.animate({right: '-100%'}, 500);

        prevPage.animate({right: 0}, 300, function(){
            tempPage.removeClass('active');
            prevPage.addClass('active');
            inSlide = false;
        });
    });

    $(document).on('click', '.next', function(){

        var tempPage = $('.sItem.active'),
            tempPageId = parseInt($('.sItem.active').attr('data-id')),
            lastIndex = $('.sItem').length;

        if(inSlide){
            return;
        }

        if(tempPageId == lastIndex){
            return;
        }

        $('.tempPage').html(tempPageId+1);

        var nextPage = $('.sItem[data-id="'+(tempPageId+1)+'"]');

        inSlide = true;

        nextPage.css('right','-100%');
        tempPage.animate({'right': '100%'}, 500);
        nextPage.animate({'right': 0}, 300, function(){
            nextPage.addClass('active');
            tempPage.removeClass('active');
            inSlide = false;
        });
    });

});