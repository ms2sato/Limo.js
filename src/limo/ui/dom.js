LIMO.namespace('LIMO.ui.dom')(function(ns){

    ns.getBody = function(){
        return document.body;
    }
    
    ns.createHidden = function(name){
        var elm = document.createElement(name);
        elm.style.display = 'none';
        ns.getBody().appendChild(elm);
        return elm;
    }
	
	ns.byId = function(id){
		return document.getElementById(id);
	}
	
	ns.remove = function(elm){
		elm.parentNode.removeChild(elm);
	}
    
});
