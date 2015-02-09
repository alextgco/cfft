/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'collections/Order',
    'text!templates/BasketView.ejs'
],
    function ($, _, Backbone, OrderCollection ,BasketView)
{
    var BacketviewView = Backbone.View.extend({
        template: _.template(BasketView),
        tagName: 'div',
        id: '',
        className: 'basket-container',
        listContainerSelector : ".basketListContainer",
        panelContainerSelector : ".panelContainer",
        /**
         * @param Boolean
         * @deprecated
         */
        alreadyBindings : false,
        /**
         * @type OrderCollection
         */
        orderCollection : null,
        events: {
            'click #clearBasket p' : 'clearBasket',
            'click #goToPay p' : 'goToPay',
            'click .removeItem' : 'removeBasketItem',
            'click .left_layout' : 'showHideList',
            'click .returnButton' : 'returnTrigger',
            'click .titleBasket .close' : 'showHideList'
        },

        showOrder : false,
        _listElement : null,
        _panelElement : null,

        /**
         * Возвращение к отрисовке зон
         */
        returnTrigger : function () {
            this.trigger("return");
        },
        getList : function () {
            return this._listElement = this.$el.find(this.listContainerSelector);
        },
        getPanel : function () {
            return this.$el.find(this.panelContainerSelector);
        },
        calculateListPosition : function () {
            var pHeight = this.getPanel().height();
            var cHeight = this.getCanvas().$el.height();
            var lHeight = this.getFrame().listActionView.$el.height();
            var fHeight = this.getCanvas().$el.parent().height();
            var LHeight = this.getList().height();
            var per = fHeight/100;
            var offsetAll = pHeight+LHeight;
//            console.log("pHeight",pHeight,",cHeight.",cHeight,",lHeight.",lHeight,"fHeight."+fHeight,",LHeight."+LHeight,",p",per);
//            console.log((this.$el.find(".basketListContainer").height()+this.$el.find(".returnButton").height()));
            return "-"+(this.$el.find(".basketListContainer").height()+this.$el.find(".returnButton").height())+"px";
        },
        showHideList : function () {
            if (this.getCollection().length>0) {
                if (!this.showOrder) {
                    this.showOrder = true;
                    this.getList().animate({top: this.calculateListPosition()},"slow")
                } else {
                    this.showOrder = false;
                    this.getList().animate({top: "0px"},"slow")
                }
            }
        },
        /**
         * @param jQuery.Event
         */
        removeBasketItem : function (e) {
            var $element = $(e.currentTarget);
            var itemId = $element.parent().data("id");
            this.orderCollection.remove( { id : itemId });
            this.orderCollection.save();
            if (!this.getCanvas().showZones) {
                this.getMap().removeFromSelection([itemId]);
            }
        },
        /**
         * @return CanvasView
         */
        getCanvas : function () {
            return this.options.canvasView;
        },
        /**
         *
         * @returns FrameView
         */
        getFrame : function () {
            return this.options.frameView;
        },
        /**
         * @return Map1
         */
        getMap : function () {
            return this.getCanvas().action_web;
        },
        /**
         * @return OrderCollection
         */
        getCollection : function () {
            return this.orderCollection;
        },
        refreshSquares : function () {
            if (!this.getCanvas().showZones) {
                this.getMap().removeFromSelection(this.getCollection().getIds());
            }
        },
        clearBasket : function (e) {
            this.refreshSquares();
            this.orderCollection.clear();
            this.render();
        },
        /**
         * Оплатить
         * @param e
         */
        goToPay : function (e) {
            this.orderCollection.sendOrder();
        },
        /**
         * Update collection from server
         * @param event
         * @param data
         */
        updateCollection : function (event,data) {
            this.orderCollection.updateCollection(data, this.options.containerModel.get("ACTION_ID"), this.options.containerModel.get("frame"));
        },
        initialize: function (options) {
            this.options = options;
            this.orderCollection = (new OrderCollection()).setOptions(this.options);
            this.on("removeBasketItem",this.updateCollection,this);
            this.on("addToSelection",this.updateCollection,this);
            this.orderCollection.on("save",this.render.bind(this));
        },
        render: function () {
            var renderObject = {
                orders      : this.getCollection().toArray(),
                lang :this.getFrame().getLang(),
                totalAmount : this.getCollection().getTotalAmount(),
                saleSiteFee : this.getCollection().getServiceFee(this.options.containerModel.get("SERVICE_FEE"))
            };
            this.$el.html(this.template(renderObject));
            this.$el.find(".basketListContainer").css("max-height",(this.getCanvas().$el.height()/100)*80);

            if(!this.options.frameView.getContainer().get("isZones")) {
                this.$el.find(".returnButton").hide();
            }

            return this.options.canvasView;
        },
        toAcquiropay : function (result) {
            var values = {};

            var merchant_id = result['MERCHANT_ID'];
            var product_id = result['PRODUCT_ID'];

            values['merchant_id'] = merchant_id;
            values['product_id'] = product_id;
            values['amount'] = result['AMOUNT'];
            values['cf'] = result['ID'];
            values['cf2'] = result['CF2'];
            values['cf3'] = result['CF3'];

            values['cb_url'] = result['CB_URL']; //"http://81.200.5.254:888/cgi-bin/acqp_callback";
            values['ok_url'] = doc_root + "iFrame/payment_ok.php?back=" + document.location.href;
            values['ko_url '] = doc_root + "iFrame/payment_ko.html";

            //var t = merchant_id + product_id + values['amount'] + values['cf'] + secret_word;
            values['token'] = result['TOKEN'];

            var html = "";
            for (key in values) {
                html += key + '<input type="text" name="' + key + '" value="' + values[key] + '" />';
            }
            this.$el.find("#FormPay").html(html);
            this.$el.find("#FormPay").submit();
            this.orderCollection.reset();
            this.orderCollection.save();
            this.getCanvas().action_web.clearSelection();
            this.render();
            action_web.reLoad();

        }
    });
    return BacketviewView;
});