LIMO.namespace('LIMO.ui.utils')(function(ns){

    var touchEventAppender;
    if (LIMO.device.isPc()) {
        touchEventAppender = new LIMO.ui.PcTouchEventAppender();
    }
    else {
        touchEventAppender = new LIMO.ui.TouchPanelTouchEventAppender();
    }
    
    ns.getTouchEventAppender = function(){
        return touchEventAppender;
    }
    
});
