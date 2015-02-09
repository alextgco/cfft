/*global require*/
'use strict';

require.config({
    shim: {

    },
    paths: {
        requirejs: '../bower_components/requirejs/require',
        jquery: '../bower_components/jquery/dist/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/lodash/dist/lodash',
        text : '../bower_components/requirejs-text/text',
        core : 'libs/core',
        iFrame : 'libs/iFrame',
        mousewheel : 'libs/jquery.mousewheel.min',
        map : 'libs/map',
        no_select : 'libs/no_select',
        selector : 'libs/selector',
        socketio : 'libs/socket.io'
    }
});



require([
    'requirejs',
    'iFrame',
    'backbone',
    'jquery',
    'views/FrameView'
], function (r , iFrame ,Backbone, $, FrameView) {
    window.$ = $;
    var FrameView = new FrameView({
        selector : "#box-for-multibooker-widget",
        events : {
            'change #action' : 'changeAction'
        },
        lang : {
            'ru' : {
                pay : "Оплатить",
                ret : "Вернуться",
                basket : "Корзина",
                service_fee : "Сервисный сбор",
                currency : "руб",
                clear_basket : "Очистить <br> корзину",
                summ : "Итого",
                line : "ряд",
                place : "место",
                actions : "Мероприятияш",
                freePlaces : "Свободных мест",
                empty_basket : "Корзина пуста , ничего купить не возможно"

            },
            'en' : {
                pay : "Pay",
                ret : "Return",
                basket : "Basket",
                service_fee : "Service Fee",
                currency : "rub",
                clear_basket : "Clear <br> basket",
                summ : "Summ",
                line : "line",
                place : "place",
                actions : "Actions",
                freePlaces : "Free",
                empty_basket : "Empty basket , nothing to sending"
            }
        }
    });
    FrameView.render();
});
