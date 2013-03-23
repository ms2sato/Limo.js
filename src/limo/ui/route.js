LIMO.namespace('LIMO.ui')(function (ns) {

    /**
     * light weight route.
     *  var route = new LIMO.ui.Route();
     *  route.hash('#home', function(){
     *      //for #home's loogic
     *  });
     *
     *  route.hash(/#\w+/, function(option){
     *      // for #xxx's logic
     *  });
     *
     *  route.all(function(){
     *      // all access;
     *  });
     *
     */
    ns.Route = function () {
        var self = this;

        this.handlers = []

        $(window).bind('hashchange', function (e) {
            self.forward();
        });
    };

    ns.Route.prototype = {

        forward:function () {
            LIMO.each(this.handlers, function (handler) {
                if (handler()) return false;
            });
        },

        /**
         * hash
         * @param hashstr has string or RegEx
         * @param callback
         */
        hash:function (hashstr, callback) {
            var route = this;

            var condition;
            if (hashstr.constructor != RegExp) {
                condition = function () {
                    return location.hash == hashstr
                }
            } else {
                condition = function () {
                    var m = location.hash.match(hashstr);
                    if (!m) {
                        return false;
                    }

                    return m;
                }
            }
            this.handle(condition, callback);
        },

        /**
         * handle all
         */
        all:function (callback) {
            this.handle(function () {
                return true;
            }, callback);
        },

        handle:function (condition, callback) {
            var route = this;
            this.handlers.push(function () {
                var res = condition();
                if (res !== false) {
                    var ret = callback.call(route, res);
                    if(ret === false) return false;
                    return true;
                }
                return false;
            });
        }
    }
});

