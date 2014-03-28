LIMO.namespace('LIMO.util')(function (ns) {

    ns.parseDate = function (str) {

        if (str === undefined || str === null) {
            return null;
        }

        var d = new Date(str);
        if (d == "Invalid Date") {
            var s = str;
            s = s.replace(/\.\d\d\d+/, "").replace(/-/, "/").replace(/-/, "/").replace(/T/, " ").replace(/Z/, " UTC").replace(/([\+\-]\d\d)\:?(\d\d)/, "$1$2");
            d = new Date(s);
            //for safari
            if (d == "Invalid Date") {
                d = new Date(s.replace(/UTC /, "UTC"));
            }
        }
        return d;
    };

});