/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'map',
    'socketio',
    'core',
    'views/ActionListView',
    'views/CanvasView',
    'views/BasketView',
    'views/ErrorView',
    'collections/Actions',
    'collections/Zones',
    'models/Container',
    'models/Zone',
    'models/Action'
], function (
    $,
    _,
    Backbone,
    map,
    socketio,
    core,
    /*Mustache,*/
    ActionListView,
    CanvasView,
    BasketView,
    ErrorView,
    ActionsCollection,
    ZonesCollection,
    ContainerModel,
    ZoneModel,
    ActionModel) {
    var FrameviewView = Backbone.View.extend({
        /*template: _.template(template),*/
        events: {},
        /**
         * ContainerModel
         */
        containerModel: null,
        actionModel: null,
        zonesCollection: null,
        actionsCollection: null,
        socket: null,
        langActive : 'ru',
        currentAction : null,

        getContainer : function () {
            return this.containerModel;
        },
        _setContainerOptions: function () {
            this.containerModel = new ContainerModel({
                actions: this.$el.data('actions'),
                isBasket: this.$el.data('isbasket'),
                ip: this.$el.data('ip'),
                ticketPass: this.$el.data('ticketpass'),
                isTerminal: (this.$el.data('isterminal') != "") ? !!this.$el.data('isterminal') : false,
                isZones: (this.$el.data('iszones') != "") ? !!this.$el.data('iszones') : false,
                frame: this.$el.data('frame'),
                host: this.$el.data('host'),
                lang: this.$el.data('lang')
            });
            window.doc_root = this.containerModel.get('host');
        },
        _initEvents : function() {
            this.listActionView.on("reload",function (data) {
                this.$el.html("");
                socketQuery({
                    command: 'get_action_area_group',
                    action_id: data.get('ACTION_ID'),
                    frame: this.containerModel.get('frame')
                }, this._parseOneAction.bind(this));
            }.bind(this));
        },
        _initElementOptions: function () {
            if (this.options && this.options.selector) {
                this.$el = $(this.options.selector);
            }
            window.box = this.$el;
            this._setContainerOptions();
        },
        _initSocket: function () {
            window.socket = this.socket = io.connect('//' + this.containerModel.get("ip") + ':' + this.containerModel.get("port"));
            window.socketQuery_stack = {
                items: [],
                getItem: function (id) {
                    for (var k in this.items) {
                        if (this.items[k].id == id) return this.items[k];
                    }
                    return false;
                },
                getItemIndex: function (id) {
                    for (var k in this.items) {
                        if (this.items[k].id == id) return k;
                    }
                    return false;
                },
                addItem: function (item) {
                    this.items.push({
                        callback: item,
                        id: this.items.length
                    });
                    return this.items.length - 1;
                },
                clearEmpty: function () {
                    for (var i = 0; i < this.items.length; i++) {
                        if (this.items[i] === undefined) {
                            this.items.splice(i, 1);
                            this.clearEmpty();
                        }
                    }
                },
                removeItem: function (id) {
                    delete this.items[this.getItemIndex(id)];
                    this.clearEmpty();
                }
            };
            socket.on('socketQueryCallback', function (callback_id, result) {
                var item = socketQuery_stack.getItem(callback_id);
                if (typeof item !== "object") return;
                if (typeof item.callback === "function") {
                    item.callback(result);
                }
                socketQuery_stack.removeItem(callback_id);
            });
        },
        _initCollections: function () {
            this.actionsCollection  = new ActionsCollection();
            if (this.getContainer().get("isZones")) {
                this.zonesCollection = new ZonesCollection();
            }
        },
        /**
         * Обработать запрос по нескольким мероприятиям
         * @param res
         * @private
         */
        _parseActions : function (res) {
            var result = JSON.parse(res);
            var obj = result.results[0];
            if (obj.code && obj.code!=="0") {
                var w = (new ErrorView({
                    message : obj.toastr.message,
                    blocker : true
                }));
                w.render();
            } else {
                console.log(obj.data);
                var actionsObjectArray = [];
                this.actionsCollection.reset();
                $.each(obj.data,function (i,v) {
                    var action = {};
                    $.each(v,function (i1,v1){
                        action[obj.data_columns[i1]]=v1;
                    });
                    actionsObjectArray.push(action);
                    var actionModel = new ActionModel(action);
                    this.actionsCollection.add(actionModel);
                }.bind(this));

                socketQuery({
                    command: 'get_action_area_group',
                    action_id: this.actionsCollection.at(0).get('ACTION_ID'),
                    frame: this.containerModel.get('frame')
                }, this._parseOneAction.bind(this));
            }
        },
        /**
         * Обработать результат с сервера
         * @param res
         * @private
         */
        _parseOneAction: function (res) {
            var result = JSON.parse(res);
            /**
             * Обработать ошибку
             */
            if (result.results[0] && result.results[0].toastr && result.results[0].toastr.type=="error") {
                this.$el.append((new ErrorView(_.extend({blocker:true},result.results[0].toastr))).render());
                return;
            }
            /**
             * Объект для связки
             */
            var initObject = {
                containerModel : this.containerModel,
                actionsCollection : this.actionsCollection,
                zonesCollection : this.zonesCollection,
                container : this.$el,
                frameView : this
            };
            $actionModel = new ActionModel(result.results[0].extra_data);

            var find = this.actionsCollection.where({
                "ACTION_ID":$actionModel.get("ACTION_ID")
            });
            this.getContainer().set("currentAction",$actionModel.get("ACTION_ID"));

            if (find.length>0) {
                this.actionsCollection.remove(find);
            }
            this.actionsCollection.unshift($actionModel,{at:0});

            if (this.zonesCollection) {
                this.zonesCollection.parseData(result);
            }
            this.containerModel.set(result.results[0].extra_data);

            $.each([this.listActionView,this.basketView,this.canvasView],function(idx,view){
                if (view instanceof Backbone.View) {
                    view.remove();
                    delete view;
                }
            });
            this.listActionView  = new ActionListView(this.actionsCollection,this);
            if (this.getContainer().get("isBasket")) {
                this.basketView = new BasketView(_.extend(initObject, {
                    data_columns: result.results[0].data_columns
                }));
            }
            this.canvasView = new CanvasView(_.extend(initObject, { basketView : this.basketView }));
            if (this.basketView)
                this.basketView.options.canvasView = this.canvasView;

            this.renderInit();
            this._initEvents();
        },
        /**
         * Начальная обработка параметров.
         * @private
         */
        _initFunction : function () {
            var actions = (""+this.containerModel.get('actions')).split(",");
            if (actions.length>1) {
                socketQuery({
                    command: 'get_actions',
                    action_id: this.containerModel.get('actions'),
                    frame : this.containerModel.get('frame')
                }, this._parseActions.bind(this));
            } else {
                socketQuery({
                    command: 'get_action_area_group',
                    action_id: this.containerModel.get('actions'),
                    frame: this.containerModel.get('frame')
                }, this._parseOneAction.bind(this));
            }
        },
        renderInit : function () {
            this.$el.html('');
            this.listActionView.render();
            this.$el.append(this.listActionView.$el);
            this.canvasView.render(this.$el.width(),this.$el.height() -
                this.listActionView.$el.outerHeight() -
                ((this.basketView)? this.options.panelHeight:0));
            this.$el.append(this.canvasView.$el);
            this.canvasView.renderControls();
            if (this.basketView) {
                this.basketView.render();
                this.$el.append(this.basketView.$el);
            }
        },
        getLang : function () {
            return this.lang[this.langActive];
        },
        setLang : function (lang) {
          this.langActive = lang;
        },
        initialize: function (options) {
            this.options = _.extend({
                panelHeight : 78
            },options);
            this.lang = options.lang;
            this._initElementOptions();
            this._initSocket();
            this._initCollections();
            this._initFunction();
        },
        render: function () {
            if (this.listActionView) {
                this.renderInit();
            }
        }
    });
    return FrameviewView;
});
