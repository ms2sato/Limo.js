LIMO.namespace('LIMO.ui.path')(function(ns){

    /**
     * URLパラメータの分解。
     */
    ns.getUrlParams = function(){
        var pairs = window.location.search.substr(1).split('&');
        var params = {};
        LIMO.each(pairs, function(obj){
            var keyValue = obj.split('=');
            
            var key = keyValue[0];
            var value = keyValue[1];
            if (params[key]) {
                params[key] = [params[key]];
                params[key].push(value);
            }
            else {
                params[key] = value;
            }
        })
        return params;
    }
    
    /**
     * @see http://d.hatena.ne.jp/Climber/20070711/1184115807
     */
    ns.getMyPath = function(){
        var f = function(e){
            var name = e.tagName;
            if (!!name && name.toUpperCase() == 'SCRIPT') 
                return e;
            var c = e.lastChild;
            return (!!c) ? f(c) : null;
        };
        var es = f(document);
        if (!es) 
            return window.location;
        return es.getAttribute('src') || window.location;
    };
    
    /**
     * 
     * @param {Object} path
     * @see http://d.hatena.ne.jp/brazil/20070103/1167788352
     */
    ns.getAbsolutePath = function (path){
        var e = document.createElement('span');
        e.innerHTML = '<a href="' + path + '" />';
        return e.firstChild.href;
    }
    
});
