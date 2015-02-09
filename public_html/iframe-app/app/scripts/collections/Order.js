define([
    'underscore',
    'backbone',
    'models/Item',
    'views/ErrorView'
], function (_, Backbone, Item,ErrorView) {
    var OrderCollection = Backbone.Collection.extend({
        model: Item ,
        dataColumns : ["ACTION_ID", "ACTION_NAME", "ACTION_SCHEME_ID", "PLACE", "LINE", "AREA_GROUP_NAME", "PRICE", "ACTION_DATE_TIME"],
        localBasket : {},
        errorViewConstructor : ErrorView ,
        /**
         * @returns BasketView
         */
        getBasket : function () {
            return this.options.basketView;
        },
        getCanvas : function () {
            return this.options.canvasView;
        },
        getFrame : function () {
            return this.options.frameView;
        },
        getTotalAmount : function () {
            var sum = 0;
            this.each(function (item) {
                sum += parseInt(item.get("price"));
            });
            return sum;
        },
        init : function () {
            if (this.localBasket.length > 0 ) {
                _.each(this.localBasket,function (array) {
                    this.add(new Item(array));
                },this);
            }
        },
        loadLocalStorage : function () {
            this.localBasket = JSON.parse(localStorage.getItem("basket"));
            if (this.localBasket==null || this.localBasket.length==0) {
                localStorage.setItem("basket",JSON.stringify([]));
                this.localBasket = [];
            } else {
                this.localBasket = _.filter(this.localBasket,function (value) {
                    return value!==null;
                },this);
            }
        },
        getServiceFee : function (fee) {
            return  (this.getTotalAmount()/100)*parseInt(fee);
        },
        /**
         * Создание заказа на сервере
         */
        sendOrder : function () {
            var ids = _.map(this.toArray(),function (item) {return parseInt(item.get("id"))});
            var action_id = _.map(this.toArray(),function (item) {return parseInt(item.get("action_id"))});
            var frame = this.options.containerModel.get("frame");
            if (ids.length==0) {
                (new this.errorViewConstructor({
                    message: this.getFrame().getLang().empty_basket
                })).render();
            } else {
                var o = {
                    command: "create_order",
                    object: "",
                    params: {
                        id: ids.join(','),
                        action_id: action_id.join(','),
                        frame: frame
                    }
                };
                socketQuery(o, this.parseResponse.bind(this));
            }
        },
        parseResponse : function (res) {
            var result = JSON.parse(res);
            var obj = result.results[0];
            console.log(obj);
            if (obj.code && obj.code!=="0") {
                if (obj.Invalid_id) {
                    var errorPlaces = _.unique(obj.Invalid_id.split(","));
                    var w = (new this.errorViewConstructor({
                        message: obj.toastr.message
                    }));
                } else {
                    var w = (new this.errorViewConstructor({
                        message: obj.toastr.message
                    }));
                }
                w.render();
            } else {
                this.getBasket().toAcquiropay(obj);
            }
        },
        setOptions : function (options) {
            this.options = options;
            return this;
        },
        save : function () {
            var tmp = _.map(this.toArray(),function (value) {
                return value.toJSON();
            },this);
            localStorage.setItem("basket",JSON.stringify(tmp));
            this.trigger("save");
        },
        /**
         * Удалить всё из коллекции и локального хранилища
         */
        clear : function () {
            this.reset();
            this.save();
        },
        /**
         * Добавление актуальной информации по месту , в локальную корзину
         * @param ids
         * @param action_id
         * @param frame
         */
        updateCollection : function (ids,action_id,frame) {
            this.actionModel = this.options.actionsCollection.findWhere({current:true});
            if (ids.length>0) {
                _.each(ids,function (id) {
                    this.add(this.createModel(this.getCanvas().action_web.squares[id]));
                },this);
                this.save();
            }
        },
        createModel : function (element) {
            var newItem = {
                action_id : this.actionModel.get("ACTION_ID"),
                id: element.id,
                name: this.actionModel.get("ACTION"),
                short_date : "",
                price: element.salePrice,
                line: element.line,
                zone: element.areaGroup,
                place: element.place
            };
            return new Item(newItem);
        },
        getIds : function () {
            return _.map(this.toArray(),function (item) { return item.id});
        },
        initialize : function () {
            this.loadLocalStorage();
            this.reset();
            this.init();
        }
    });
    return OrderCollection;
});
