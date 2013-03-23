LIMO.namespace('LIMO.collection')(function(ns){

    ///////////////////////////////////////////////////////////////////
    //
    var ArrayMap = function () {
        this.array = [];
        this.map = {};
    }

    ArrayMap.prototype = {

        size:function () {
            return this.array.length;
        },

        push:function (key, value) {
            this.array.push(value);
            this.appendValueIfNotExist(key, value);
        },

        pop:function () {
            return this.removeAt(this.array.length - 1);
        },

        shift:function () {
            return this.removeAt(0);
        },

        unshift:function (key, value) {

            this.array.unshift(value);
            this.appendValueIfNotExist(key, value);
        },

        //@private
        appendValueIfNotExist:function (key, value) {
            if (!this.map[key]) {
                this.map[key] = value;
            }
        },

        at:function (index) {
            return this.array[index];
        },

        existsKey:function (key) {
            return this.map[key];
        },

        get:function (key) {
            return this.map[key];
        },

        insertAt:function (index, key, value) {
            this.array.splice(index, 0, value);
            this.appendValueIfNotExist(key, value);
        },

        removeAt:function (index) {
            var obj = this.array[index];
            this.array.splice(index, 1);

            var count = 0;
            _.each(this.array, function (item) {
                if (item == obj) count++;
            });

            if (count == 0) {
                for (var key in this.map) {
                    var val = this.map[key];
                    if (val === obj) {
                        delete this.map[key];
                    }
                }
            }

            return obj;
        }

    }


    ns.ArrayMap = ArrayMap;
});