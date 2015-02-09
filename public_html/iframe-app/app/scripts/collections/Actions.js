/*global define*/

define([
    'underscore',
    'backbone',
    'models/Action'
], function (_, Backbone, ActionsModel) {
    'use strict';

    var ActionsCollection = Backbone.Collection.extend({
        model: ActionsModel
    });

    return ActionsCollection;
});
