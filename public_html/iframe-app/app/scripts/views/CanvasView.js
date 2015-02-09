/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'libs/basket',
    'libs/zones',
    'libs/utils',
    'views/ZoomInOutView',
    'views/LegendView',
    'text!templates/CanvasView.ejs'
], function ($, _, Backbone, BasketFile, ZonesFile, Utils ,ZoomInOutView , LegendView ,CanvasView) {
    var CanvasviewView = Backbone.View.extend({
        template: _.template(CanvasView),
        tagName: 'div',
        className: 'canvas-view',
        initObject: {},
        allZones: null,
        /**
         * @type Map1
         */
        action_web: null,
        listZones: null,
        /**
         * Текущее содержимое канваса
         * @type Boolean
         */
        showZones : true,
        initCanvas : function () {
            this.listZones.returnToAllZones();
            this.showZones = true;
            this.ZoomInOutView.hide();
        },
        renderControls : function () {

        },
        initialize: function (options) {
            this.options = options;
            if (this.options.basketView) {
                this.options.basketView.on("return", this.initCanvas.bind(this));
            }
            if (options.zonesCollection) {
                this.allZones = _.map(options.zonesCollection.toArray(), function (value) {
                    return value.attributes;
                });
            }
            this.ZoomInOutView = new ZoomInOutView({canvasView : this});
            this.legendView  = new LegendView ({canvasView : this});

            if (this.options.basketView) {
                this.bindBasketEvent();
            }
        },
        /**
         * проброс события на корзину
         */
        bindBasketEvent : function () {
            var removeEvent = "removeBasketItem";
            this.on(removeEvent, function (context,data) {
                this.options.basketView.trigger(removeEvent,this,data);
            }.bind(this));
            var addEvent = "addToSelection";
            this.$el.on(addEvent,function (event, data) {
                this.options.basketView.trigger(addEvent,this,data);
            }.bind(this));
            this.on("loadSquares",function () {
                var ids = _.map(this.options.basketView.orderCollection.getIds(),
                    function(e){
                        return parseInt(e)
                    });

                this.showZones = false;
                _.each(this.options.basketView.orderCollection.getIds(),function (id) {
                    if (this.squares[id])
                        this.squares[id].lighted = true;
                },this.action_web);

                this.action_web.addToSelection(ids);
                this.action_web.render();
                this.ZoomInOutView.show();
                this.ZoomInOutView.$el.offset({top:this.$el.height()-30,left:13})
            },this);
        },
        remove: function () {
            this.action_web.clearCanvas();
            delete this.action_web;
            delete this.listZones;
            CanvasviewView.__super__.remove.apply(this, arguments);
        },
        initArea : function () {
            var map = this.action_web;
            var $this = this;
            var o = {
                command: "get_action_scheme",
                params: {
                    action_id: this.options.frameView.getContainer().get('currentAction'),
                    frame: this.options.frameView.getContainer().get('frame')
                }
            };

            var callback = function (empty) {
                map.loadSquares(o, function () {
                    map.setLayout(function () {
                        map.setMinMax(function () {
                            map.setScaleCoff(function () {
                                map.render(function () {
                                    map.reLoadLayout(function () {});
                                    if (!map.binds) {
                                        map.binds = true;
                                        map.bindListeners();
                                    }
                                    if (empty) {
                                        map.setEvents();
                                    } else {
                                        map.container.on("mousewheel",map.wheelEvent.bind(map));
                                    }
                                    $this.canvasView.trigger("loadSquares");
                                });
                            });
                        });
                    });
                });
            };
            if ($.isEmptyObject(map.loadObj)) {
                callback(true);
            } else {
                callback(false);
            }
        },
        render: function (canvasWidth, canvasHeight) {
            this.initObject = _.extend(initSendObject(this.options), {cHeight: canvasHeight,cWidth: canvasWidth,container: this.$el,canvasView: this,legendView: this.legendView});
            this.ZoomInOutView.render();
            this.ZoomInOutView.hide();
            this.action_web = iFrame_init(this.initObject);
            this.listZones = new listZoneWidget(this.allZones,this.options.containerModel.get("ACTION_ID"),this.action_web,this.options.containerModel.attributes,this);
            if (this.allZones) {
                this.listZones.render();
                this.$el.append(this.ZoomInOutView.$el);
            } else {
                this.action_web.render();
            }
            window.l = this.action_web;
        }
    });
    return CanvasviewView;
});
