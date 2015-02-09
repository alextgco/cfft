/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/ZoomInOutView.ejs'
], function ($, _, Backbone, ZoomInOutView) {
    'use strict';

    var ZoominoutView = Backbone.View.extend({
        template: _.template(ZoomInOutView),
        tagName: 'div',
        id: '',
        className: 'zoom',
        events: {
            'click .plus' : 'zoomIn',
            'click .minus' : 'zoomOut'
        },
        zoomOut : function () {
            this.options.canvasView.$el.trigger("scale_map",[
                this.options.canvasView.$el.height()/2,
                this.options.canvasView.$el.width()/2,
                -100
            ]);
        },
        zoomIn : function () {
            this.options.canvasView.$el.trigger("scale_map",[
                    this.options.canvasView.$el.height()/2,
                    this.options.canvasView.$el.width()/2,
                100
            ]);
        },
        initialize: function (options) {
            this.options = options;
        },
        show : function () {
            this.$el.show();
        },
        hide : function () {
            this.$el.hide();
        },
        render: function () {
            this.$el.html(this.template());
        }
    });
    return ZoominoutView;
});
