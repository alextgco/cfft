/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/LegendView.ejs'
], function ($, _, Backbone) {
    'use strict';

    var LegendviewView = Backbone.View.extend({

        tagName: 'div',

        id: '',

        className: '',

        events: {},

        priceInfo: function (squares) {
            for (var is in squares) {
                var sqr = squares[is];
                if (sqr.status == 0 || +sqr.price <= 0) continue;
                if (sqr.priceGroup == "") {
                    sqr.priceGroup = sqr.color0 + " " + sqr.salePrice + 'руб.';
                }
            }
            var obj = [];
            var html = '';
            for (var i1 in squares) {
                var square = squares[i1];
                if (square.status == 0 || +square.price <= 0) continue;
                if (obj[square.priceGroup] === undefined) {
                    obj[square.priceGroup] = {
                        price: +square.salePrice,// + (+square.salePrice/100*hidden_fee),
                        count: 1,
                        color: square.color0
                    };
                } else {
                    obj[square.priceGroup].count++;
                }

            }
            var o2 = [];
            for (var k in obj) {
                o2.push(obj[k]);
            }
            o2.sort(function (a, b) {
                if (+a.price < +b.price) return -1;
                else if (+a.price > +b.price) return 1;
                return 0;
            });
        },

        initialize: function (options) {
            this.options = options;
            this.priceInfo(this.options);
        },

        render: function () {
            this.$el.html();
        }
    });

    return LegendviewView;
});
