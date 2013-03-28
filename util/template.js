LIMO.namespace('LIMO.util')(function(ns){

    ns.template = function(templateId){

        var templateStr = $(templateId).html();
        if(!templateStr){
            throw new Error('template not found: ' + templateId);
        }
        var tpl = _.template(templateStr);
        if(!tpl){
            throw new Error('template load failed: ' + templateId);
        }

        tpl.$ = function(param){
            return $($.parseHTML(tpl(param)));
        };

        return tpl;
    }

});