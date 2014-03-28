LIMO.namespace('LIMO.ui.utils')(function(ns){

    var touchEventAppender;
    if (LIMO.device.isTouch()) {
        touchEventAppender = new LIMO.ui.TouchPanelTouchEventAppender();
    }
    else {
        touchEventAppender = new LIMO.ui.PcTouchEventAppender();
    }
    
    ns.getTouchEventAppender = function(){
        return touchEventAppender;
    }

    ns.removeStyle = function(node, name){
        if (node.style.removeProperty) {
            node.style.removeProperty(name);
        }
        if (node.style.removeAttribute) {
            node.style.removeAttribute(name);
        }
    }
});
