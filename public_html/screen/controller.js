/**
 * Обект отвечает за единакратную обработку события resize, когда resize завершен, испускается событие screen_resize_end
 * @type {{counter: number, checkEnd: Function, resize: Function, resizeEnd: Function}}
 */
var resizeController = {
    counter : 0,
    checkEnd : function(){
        var current = this.counter;
        var self = this;
        if (typeof this.timer){
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(function(){
            if (current === self.counter){
                self.resizeEnd();
            }
        },500);
    },
    resize: function(){
        this.counter++;
        this.checkEnd();
    },
    resizeEnd:function(){
        this.counter = 0;
        $.event.trigger('screen_resize_end');
        /*blocks.inner.css('height',$(window).height()-40+'px');
        blocks.content.css('height',$(window).height()-108+'px');
        setSquares();*/

    }
};

