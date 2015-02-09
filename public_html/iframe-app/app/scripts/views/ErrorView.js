define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/ErrorView.ejs'
], function ($, _, Backbone, BootBoxView) {
    'use strict';
    var ErrorView = Backbone.View.extend({
        template: _.template(BootBoxView),
        tagName: 'div',
        id: '',
        className: 'error-layout',
        options : {
            title : 'AAAA',
            ok_button : ''
        },
        events: {
            'click .close' : 'close',
            'click .ok_button' : 'ok',
            'click .window_body' : 'close'
        },
        ok : function () {
              debugger;
        },
        close : function () {
            if (!this.options.blocker) {
                this._remove();
            }
        },
        _remove : function () {
            $(document.body).find('.'+this.className).remove();
            $(document.body).find('.blocker').remove();
        },
        initialize: function (options) {
            this.options = _.extend(this.options,options);
            this._remove();
        },
        render: function () {
            this.$el.html(this.template(this.options));
            var blocker = $("<div class='blocker' />");

            blocker.width(window.document.body.offsetWidth);
            blocker.height(window.document.body.offsetHeight);

            blocker.offset({top:0,left:0});

            $(document.body).append(this.$el);
            $(document.body).append(blocker);
        }
    });
    return ErrorView;
});
