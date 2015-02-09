(function(){

    MB = MB || {};
    MB.Core = MB.Core || {};

    MB.ContentsNew = function(){
        this.items = [];
    };
    MB.Contents = new MB.ContentsNew();

    MB.ContentNew = function(params){
        this.id = params.id || MB.Core.guid();
        this.name = params.filename || 'unnamed';
        this.activeId = params['params']['hall_scheme_id'] || params['params']['action_id'] || params['params']['activeId'] || undefined;
        this.label = params['params']['label'] || undefined;
        this.title = params['params']['title'] || undefined;
        this.params = params['params'];
    };

    MB.ContentsNew.prototype.addItem = function(item){
        this.items.push(item);
    };

    MB.ContentsNew.prototype.getItem = function(id){
        for(var i in this.items){
            if(this.items[i].id == id){
                return this.items[i];
            }
        }
    };

    MB.ContentsNew.prototype.removeItem = function(id){
        for(var i in this.items){
            if(this.items[i].id == id){
                this.items.splice(i, 1);
            }
        }
    };


    MB.ContentNew.prototype.create = function(callback){
        var _t = this;

        _t.getTemplate(function(){
            MB.Contents.addItem(_t);
            _t.render(function(){
                _t.getScript(function(){
                    _t.setHandlers(function(){
                        if(typeof callback == 'function'){
                            callback(_t);
                        }
                    });
                });
            });
        });
    };

    MB.ContentNew.prototype.getTemplate = function(callback){
        var _t = this;
        var url = "html/contents/" + _t.name + "_new/" + _t.name + ".html";

        $.ajax({
            url:url,
            success: function(res, status, xhr){
                _t.template = res;
                if(typeof callback == 'function'){
                    callback();
                }
            }
        });
    };

    MB.ContentNew.prototype.getScript = function(callback){
        var _t = this;
        MB.Contents.justAddedId = _t.id;
        $.getScript( "html/contents/" + _t.name + "_new/" + _t.name + ".js", function() {
            if(typeof callback == 'function'){
                callback();
            }
        });
    };

    MB.ContentNew.prototype.reload = function(callback){

    };

    MB.ContentNew.prototype.render = function(callback){
        var _t = this;

        var modalWindow = MB.Core.modalWindows.init({
            className :        'contentModal',
            wrapId :           _t.id,
            resizable :        true,
            title :            (_t.title)? _t.title : _t.name,
            content :          _t.template,
            startPosition :    'fullscreen',
            hideSaveButton:    true,
            draggable :        true,
            top :              0,
            left :             0,
            waitForPosition :  undefined,
            active :           true,
            inMove :           false,
            minHeight :        700,
            minWidth :         1300,
            activeHeaderElem : undefined,
            footerButton :     undefined,
            contentHeight :    0
        }).render(function(){
            if(typeof callback == 'function'){
                callback();
            }
        });
    };

    MB.ContentNew.prototype.setHandlers = function(callback){
        var _t = this;
        var modalWindow = MB.Core.modalWindows.windows.getWindow(_t.id);

        $(modalWindow).off('close').on('close', function(){
            MB.Contents.removeItem(_t.id);
        });

        if(typeof callback == 'function'){
            callback();
        }
    };

}());
