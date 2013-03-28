LIMO.namespace('LIMO')(function(ns){

    ns.Device = LIMO.extend(Object, {
		
        isIPhone: function(){
            return navigator.userAgent.indexOf('(iPhone;') != -1;
        },
		
        isIPad: function(){
            return navigator.userAgent.indexOf('(iPad;') != -1;
        },
		
        isIPod: function(){
            return navigator.userAgent.indexOf('(iPod;') != -1;
        },
		
        isAndroid: function(){
            return navigator.userAgent.indexOf('Android') != -1;
        },
		
        isPc: function(){
            if (!this.isMobileSize() && !this.isIPad() && !this.isAndroid()) {
                return true;
            }
            return false;
        },
		
        getWidth: function(){
            return screen.width;
        },
		
        getHeight: function(){
            return screen.height;
        },
		
        isLandscape: function(){
            return Math.abs(window.orientation) === 90;
        },
		
        isMobileSize: function(){
            return this.getWidth() <= 640 && this.getHeight() <= 1136;
        }
    });
    
    
    ns.device = new ns.Device();
});
