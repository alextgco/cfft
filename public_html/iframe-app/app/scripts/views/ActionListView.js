/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/ActionListView.ejs'
], function ($, _, Backbone, ActionListViewTemplate) {
    var ActionlistviewView = Backbone.View.extend({
        template: _.template(ActionListViewTemplate),
        events: {
            'click .list-expand' : 'showList',
            'click .action_in' : 'activeAction'
        },
        className : "actions-list",
        actions : null,
        listShow : false ,
        activeAction : function (e) {
            var action_id = $(e.currentTarget).data('action_id');
            var model = this.actions.filter(function(e){
                if (e.get("ACTION_ID")==action_id)
                    return e;
            });
            this.trigger("reload",model[0]);
        },
        getList : function () {
            return this.$el.find('.list-container');
        },
        showList : function () {
            if (!this.listShow) {
                this.listShow = true;
                this.getList().animate({top: "100%"},"slow")
            } else {
                this.listShow = false;
                this.getList().animate({top: "-100%"},"slow")
            }
        },
        initialize: function (actions,viewFrame) {
            this.actions = actions;
            this.viewFrame = viewFrame;
        },
        render: function () {
            this.$el.html(this.template({
                    collection : this.actions,
                    lang : this.viewFrame.getLang()
                }));
        }
    });
    return ActionlistviewView;
});
