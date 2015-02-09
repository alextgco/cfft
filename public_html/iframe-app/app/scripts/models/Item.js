define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var ItemModel = Backbone.Model.extend({
        initialize: function(object) {

        },
        defaults: {},
        validate: function(attrs, options) {},
        parse: function(response, options)  {
            return response;
        }
    });

    return ItemModel;
});
