/*global define*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var ActionModel = Backbone.Model.extend({
        url: '',
        initialize: function(data) {
            this.clear();
            function parseDateTime(str) {
                return {
                    day: function(){
                        return str.substr(0,2);
                    },
                    mth: function(){
                        var mths = ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'];
                        var mthIndex = (str.substr(3,1) == '0')? str.substr(4,1): str.substr(3,2);
                        return mths[+mthIndex-1];
                    },
                    time: function(){
                        return str.substr(11);
                    }
                };
            }
            this.set(data);
            _.each(parseDateTime(this.get("ACTION_DATE_TIME")),function (func,key) {
               this.set(key,func());
            },this);
            this.set("current",true);
        },

        defaults: {
        },

        validate: function(attrs, options) { },
        parse: function(response, options)  {
            return response;
        }
    });
    return ActionModel;
});
