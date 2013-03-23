LIMO.namespace('LIMO.backbone')(function (ns) {

    ns.EventHandlerManager = function () {
        this.handlers = {};
    };

    ns.EventHandlerManager.prototype = {

        attach:function (model) {
            var self = this;
            return {
                on:function (event, handler, ctx) {
                    var list = self.handlers[model.cid];
                    if (!list) {
                        list = [];
                        self.handlers[model.cid] = list;
                    }

                    list.push(handler);
                    return model.on(event, handler, ctx);
                }
            }
        },

        clear:function (obj, event) {
            event = event || null;

            var list = this.handlers[obj.cid];
            _.each(list, function (handler) {
                obj.off(event, handler);
            });
        }
    };

});