LIMO.namespace('LIMO.ui')(function(ns){

    ns.withPx = function(prop){
        if (LIMO.isNumber(prop)) {
            return prop + 'px';
        }
        
        if (LIMO.isString(prop)) {
            if (prop.substr(-2) == 'px') 
                return prop;
            return prop + 'px';
        }
        
        throw new Error('文字列もしくは数値でなければなりません');
    }
    
    ns.withoutPx = function(prop){
        if (LIMO.isNumber(prop)) 
            return prop;
        
        if (LIMO.isString(prop)) {
            if (prop.substr(-2) == 'px') 
                return parseInt(prop.substr(0, prop.length - 2));
            return prop;
        }
        
        throw new Error('文字列もしくは数値でなければなりません');
    }
    
    
    ns.transform = function(element, script){
        if (script == null) {
            throw new Error('スクリプトがnullです');
        }
        
        var scriptStr;
        if (!LIMO.isString(script)) {
            var part = [];
			var sc = script.scale; 
            if (sc) {
                part.push('scale(' + sc.x + ',' + sc.y + ')');
            }
            
            var t = script.translate;
            if (t) {
				var z = t.z | 0; 
                part.push('translate3d(' + t.x + 'px,' + t.y + 'px, ' + z + 'px)');
            }
            
            if (script.rotate) {
                part.push('rotate(' + script.rotate + ')');
            }
            
            var sk = script.skew;
            if (sk) {
                part.push('skew(' + sk.x + ',' + sk.y + ')');
            }
            
            scriptStr = part.join(' ');
        }
        else {
            scriptStr = script;
        }
        
        element.style.webkitTransform = scriptStr;
    }
    
    /**
     * addEventListener's wrapper
     * @param {HTMLElement} target
     * @param {String} name
     * @param {Function} listener
     * @param {boolean} useCapture
     * @return {Object} object for switch status. has setEnabled.
     */
    ns.addEventListener = function(target, name, listener, useCapture){
    
        var switcher = {
            setEnabled: function(value){
                if (value) {
                    target.addEventListener(name, listener, useCapture);
                }
                else {
                    target.removeEventListener(name, listener, useCapture);
                }
            }
        };
        switcher.setEnabled(true);
        return switcher;
    }
    
    
    ns.TouchPanelTouchEventAppender = LIMO.extend(Object, {
    
        addTouchStart: function(target, listener, useCapture){
            return ns.addEventListener(target, 'touchstart', listener, useCapture);
        },
        addTouchEnd: function(target, listener, useCapture){
            return ns.addEventListener(target, 'touchend', listener, useCapture);
        },
        addTouchMove: function(target, listener, useCapture){
            return ns.addEventListener(target, 'touchmove', listener, useCapture);
        },
        addTouchCancel: function(target, listener, useCapture){
            return ns.addEventListener(target, 'touchcancel', listener, useCapture);
        },
        addGestureStart: function(target, listener, useCapture){
            return ns.addEventListener(target, 'gesturestart', listener, useCapture);
        },
        addGestureChange: function(target, listener, useCapture){
            return ns.addEventListener(target, 'gesturechange', listener, useCapture);
        },
        addGestureEnd: function(target, listener, useCapture){
            return ns.addEventListener(target, 'gestureend', listener, useCapture);
        }
    });
    
    
    //http://adomas.org/javascript-mouse-wheel/
    function onWheel(handle){
        /** Event handler for mouse wheel event.
         */
        function wheel(event){
            var delta = 0;
            if (!event) /* For IE. */ 
                event = window.event;
				
			console.log('event.wheelDelta:' + event.wheelDelta);	
				
            if (event.wheelDelta) { /* IE/Opera. */
                //                delta = event.wheelDelta / 120;
                delta = event.wheelDelta / 90; //by ms2
                /** In Opera 9, delta differs in sign as compared to IE.
                 */
                if (window.opera) 
                    delta = -delta;
            }
            else 
                if (event.detail) { /** Mozilla case. */
                    /** In Mozilla, sign of delta is different than in IE.
                 * Also, delta is multiple of 3.
                 */
                    delta = -event.detail / 3;
                }
            /** If delta is nonzero, handle it.
             * Basically, delta is now positive if wheel was scrolled up,
             * and negative, if wheel was scrolled down.
             */
            if (delta) 
                handle(delta, event);
        }
        
        /** Initialization code. 
         * If you use your own event management code, change it as required.
         */
        if (window.addEventListener) 
            /** DOMMouseScroll is for mozilla. */
            window.addEventListener('DOMMouseScroll', wheel, false);
        /** IE/Opera. */
        window.onmousewheel = document.onmousewheel = wheel;
    }
    
    
    function wrapTouch(listener){
        return function(e){
            e.touches = [e];
            listener(e);
        };
    }
    
    ns.PcTouchEventAppender = LIMO.extend(Object, {
    
        addTouchStart: function(target, listener, useCapture){
            return ns.addEventListener(target, 'mousedown', wrapTouch(listener), useCapture);
        },
        addTouchEnd: function(target, listener, useCapture){
            return ns.addEventListener(target, 'mouseup', wrapTouch(listener), useCapture);
        },
        addTouchMove: function(target, listener, useCapture){
            return ns.addEventListener(target, 'mousemove', wrapTouch(listener), useCapture);
        },
        addTouchCancel: function(target, listener, useCapture){
            //return ns.addEventListener(target, 'touchcancel', listener, useCapture);
        },
        addGestureStart: function(target, listener, useCapture){
        
        },
        addGestureChange: function(target, listener, useCapture){
        
            onWheel(function(delta, event){
                event.scale = delta;
                var def = event.preventDefault;
                event.preventDefault = function(){
                    if (def) {
                        def.apply(this);
                    }
                    this.returnValue = false;
                }
                
                listener(event);
            });
        },
        addGestureEnd: function(target, listener, useCapture){
        
        }
    });
    
    var widgetIdName = 'widgets';
    var widgetId = 1;
    
    ns.Widget = LIMO.extend(LIMO.util.Observable, {});
    
    
    ns.CssPropertyAppender = function(){
    }
    
    LIMO.extend(ns.CssPropertyAppender, LIMO.util.PropertyAppender, {
        createGetter: function(target, name){
            return function(){
                return $(this.getElement()).css(name);
            };
        },
        createSetter: function(target, name){
            return function(value){
                $(this.getElement()).css(name, value);
            };
        }
    });
    
    
    ///////////////////////////////////////////////////
    
    var prop = LIMO.util.createPropertyFunc(new ns.CssPropertyAppender());
	/**
	 * 
	 * @param {Object} config id,element
	 */
    ns.ElementWidget = function(config){
		
        if (!this.$base) {
            throw new Error('$base undefined. usualy not used "new".');
        }
        
        this.$base(ns.ElementWidget, 'constructor');
		var id;
		var element;
		
        if (config.id == null && config.element == null) {
            throw new Error('config.id か config.element が必須です');
        }
        
        if (config.id) {
            id = config.id;
            element = document.getElementById(config.id);
            if (element == null) {
                throw new Error('存在しないIDです:' + config.id);
            }
        }
        else 
            if (config.element) {
                element = config.element;
                id = $(element).attr('id') || widgetIdName + widgetId++;
            }
        
        LIMO.puts(this, {
			
            getElement: function(){
                return element;
            },
            css: function(css){
                $(element).css(css);
            },
            transform: function(script){
                ns.transform(element, script);
            },
            add: function(widget){
            
                //widgetの型を見て判断するか？
                element.appendChild(widget.getElement());
                
            }
        });
        
        prop(this).add(['left', 'top', 'right', 'bottom']).add('height', function(){
            return $(element).height();
        }, function(value){
            $(element).height(value);
        }).add('width', function(){
            return $(element).width();
        }, function(value){
            $(element).width(value);
        });
    }
    
    LIMO.extend(ns.ElementWidget, ns.Widget);
    
    ///////////////////////////////////////////////////

});
