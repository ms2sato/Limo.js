LIMO.namespace('LIMO.backbone')(function (ns) {

    /**
     * Backbone.Collection which can find item by key defined by user(no cid).
     */
    ns.IndexedCollection = Backbone.Collection.extend({

        initialize:function () {
            this.index = {} // {uid to user}
        },
        getKey:function (model) {
            throw new Error('shoud define getKey() as return model.get("key")');
        },

        add:function (models, options) {

            var self = this;
            var ret = Backbone.Collection.prototype.add.call(this, models, options);
            if (ret.at) {
                //is collection
                ret.forEach(function (model) {
                    self.index[self.getKey(model)] = model;
                });
            } else {
                // is model
                self.index[self.getKey(ret)] = ret;
            }

            return ret;
        },
        remove:function (models, options) {
            var self = this;
            if (_.isArray(models)) {
                //is collection
                _.forEach(models, function (model) {
                    delete self.index[self.getKey(model)];
                });
            } else {
                // is model
                delete self.index[self.getKey(models)];
            }

            return Backbone.Collection.prototype.remove.call(this, models, options);
        },
        reset:function (models, options) {
            this.index = {};
            return Backbone.Collection.prototype.reset.call(this, models, options);
        },
        findById:function (uid) {
            return this.index[uid];
        }

    });

});