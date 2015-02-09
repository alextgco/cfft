/*global define*/

define([
    'underscore',
    'backbone',
    'models/Zone'
], function (_, Backbone, ZonesModel) {
    'use strict';

    var ZonesCollection = Backbone.Collection.extend({
       model: ZonesModel,
       parseData : function (data) {
           this.reset();
           var result = data.results[0];
           _.each(result.data,function (value,index) {
               var zone = new ZonesModel();
               _.each(result.data_columns,function (value1,index1) {
                   zone.set(value1,value[index1]);
               });
               this.add(zone);
           },this);
       }
    });
    return ZonesCollection;
});
