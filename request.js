LIMO.namespace('LIMO')(function (ns) {

    function createError(jqXHR) {
        var header = jqXHR.getResponseHeader('Content-type');
        var err = new Error('Request Error');
        if (header.indexOf('json') != -1) {
            err.cause = JSON.parse(jqXHR.responseText);
        } else {
            err.message = jqXHR.responseText;
        }
        err.jqXHR = jqXHR;
        return err;
    }

    /**
     * @param process promiseを返すFunction
     * @returns {*}
     */
    ns.doRequest = function(process){
        var d = $.Deferred();
        var err;
        function doReq(process, count) {

            return process().then(function (ret) {
                d.resolve(ret);
            }, function (jqXHR, textStatus) {

                var statusCode = jqXHR.status;
                // null response is apply success
                if (statusCode == 200 && jqXHR.responseText == '') {
                    d.resolve('');
                    return;
                }

                if (400 <= statusCode && statusCode < 500) {
                    d.reject(createError(jqXHR));
                    return;
                }

                count += 1;
                if (count >= 3) {
                    console.log('retry failed rejected');
                    if (!err) {
                        err = createError(jqXHR);
                    }
                    d.reject(err);
                    return;
                }

                setTimeout(function () {
                    console.log('retry:' + count);
                    doReq(process, count);
                }, 1000);
            });
        }

        doReq(process, 0);

        return d.promise();
    };

    ns.request = function (options) {

        if (options.cache === undefined) {
            options.cache = false;
        }

        var process = function(){
            return $.ajax(options);
        };

        return ns.doRequest(process);
    };

});