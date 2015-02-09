/*global define*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var ContainerModel = Backbone.Model.extend({
        url: '',

        initialize: function() {
        },

        defaults: {
            port : 8080
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options)  {
            return response;
        }
    });

    return ContainerModel;
});
