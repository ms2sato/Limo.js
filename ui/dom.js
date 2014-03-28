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


    ns.escapeHTML = function (val) {
        return $('<pre>').text(val).html();
    }

    ns.unescapeHTML = function (val) {
        return $('<pre>').html(val).text();
    }

    /**
     * 文字列の中に入っている不安要素をエスケープして、URL等は装飾する
     * @param text
     */
    ns.safeHtml = function(text){
        text = ns.escapeHTML(text);
        text = text.replace(/\r?\n/g, ' <br>'); //半角スペースは次の処理でaタグを改行で区切ってやる為

        //@see http://www.openspc2.org/JavaScript/Ajax/jQuery_plugin/chapter8/
        text = text.replace(/(https?:\/\/[\x21-\x7e]+)/gi, '<a target="_blank" href="$1">$1</a>');
        return text;
    }

});
