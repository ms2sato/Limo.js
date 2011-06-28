(function(global){

    LIMO = {};
    
    ///////////////////////////////////////////////////////////
    // ECMAScript5 func
    if (typeof Array.isArray === "undefined") {
        Array.isArray = function(arg){
            return Object.prototype.toString.call(arg) === "[object Array]";
        }
    }
    
    
    ///////////////////////////////////////////////////////////
    //console
    if (global['console'] === undefined) {
        console = {};
    }
    
    if (console.log === undefined) {
        console.log = function(){
        }
    }
    
    
    LIMO.console = {}
    
    LIMO.console.log = function(str){
        console.log(str);
    }
    
    ///////////////////////////////////////////////////////////
    // namespace
    LIMO.namespace = function(){
    
        var ctx = {
            global: global,
        };
        
        var ns = global;
        var nsarray = [];
        LIMO.each(arguments, function(nsname){
            var nodes = nsname.split('.');
            LIMO.each(nodes, function(node){
                if (ns[node] === undefined) {
                    ns[node] = {}
                }
                ns = ns[node];
            });
            
            nsarray.push(nsname);
        });
        
        var fullname = nsarray.join('.');
        return function(callback){
            console.log('begin scope: ' + fullname);
            callback(ns, ctx);
        }
    }
    
    LIMO.isObject = function(o){
        return (typeof o == 'object');
    }
    
    LIMO.isString = function(o){
        return typeof o == 'string';
    }
    
    LIMO.isNumber = function(o){
        return typeof o == 'number';
    }
    
    LIMO.isFunction = function(o){
        return typeof o == 'function';
    }
    
    function isEmpty(s){
        return (s == null) || (s.length == 0);
    }
    
    LIMO.getFuncName = function(f){
        var s = ('' + f).match(/function (\w*)/)[1];
        return isEmpty(s) ? '[anonymous]' : s;
    }
    
    // stacktrace
    LIMO.stackTrace = function(a){
        if (a === (void 0)) 
            a = arguments.callee.caller;
        return (a == null) ? '' : LIMO.stackTrace(a.caller) + ' > ' + LIMO.getFuncName(a);
    }
    
    
    /**
     * apply src object to override's properties
     * @param {Object} src
     * @param {Object} override
     */
    LIMO.puts = function(src, override){
        if (src == null) {
            throw new Error('src == null');
        }
        if (override == null) {
            return;
        }
        
        if (!LIMO.isObject(override)) {
            throw new Error('override is not object');
        }
        
        for (var key in override) {
            if (!override.hasOwnProperty(key)) 
                continue;
            src[key] = override[key];
        }
        return src;
    }
    
    /**
     * override src class's prototype
     * @param {Object} src target function(Class)
     * @param {Object} override
     */
    LIMO.overwrites = function(src, override){
        LIMO.puts(src.prototype, override);
    }
    
    /**
     * override a method
     * @param {Object} body
     * @param {Object} name
     * @param {Object} func
     */
    LIMO.override = function(body, name, func){
        var oldFunc = body[name];
        if (!oldFunc) {
            throw new Error("Not found overridable value: " + name);
        }
        
        if (!func) {
            delete body[name];
            return;
        }
        
        body[name] = func;
    }
    
    /**
     * define instance properties.<br>
     * override attribute can define below.
     *
     * {
     * 		funcName: {
     * 			override: true,
     * 			value: function(){
     *          }
     * 		}
     * }
     *
     *
     * @param {Object} body
     * @param {Object} overrides
     */
    LIMO.define = function(body, overrides, func){
    
        if (overrides == null) {
            throw new Error('overrides == null');
        }
        
        if (LIMO.isString(overrides) && LIMO.isFunction(func)) {
            //single method override
            LIMO.override(body, overrides, func);
            return;
        }
        
        if (!LIMO.isObject(overrides)) {
            throw new Error('overrides is not object');
        }
        
        for (var key in overrides) {
            var attribute = overrides[key];
            
            // override			
            if (attribute.override) {
                LIMO.override(body, key, attribute.value);
                continue;
            }
            
            var oldFunc = body[key];
            if (oldFunc) {
                throw new Error("Can't override without attribute override=true: " + key);
            }
            else {
				// the first 
                body[key] = attribute;
            }
        }
    }
    
    
    LIMO.each = function(array, callback){
        for (var i = 0; i < array.length; ++i) {
            var res = callback(array[i], i);
            if (res === false) {
                return res;
            }
        }
        return null;
    }
    
    /**
     * same as Array.slice. for arguments.
     * takes between begin and (end - 1).
     * end is optional to last of array.
     * @param {Object} array
     * @param {Object} begin
     * @param {Object} end
     */
    LIMO.slice = function(array, begin, end){
        var res = [];
        if (end === undefined) {
            end = array.length;
        }
        for (var i = begin; i < end; ++i) {
            res.push(array[i]);
        }
        return res;
    }
    
    /**
     * extend subc from superc and appendmethods from overrides
     * <p>constructor, constructor, object</p> // sub, super, override
     * <p>constructor, constructor</p> // sub, super
     * <p>constructor, object</p> //super, override(return sub)
     * <p>constructor</p> //super(return sub)
     *
     * subc is optional.
     * @param {Object} subc
     * @param {Object} superc
     * @param {Object} override
     * @return {Object} extended class(usualy subc)
     */
    LIMO.extend = function(subc, superc, override){
    
        if (arguments.length == 1) {
            superc = {}; //superc = override berow
        }
        
        if (LIMO.isObject(superc)) {
            override = superc;
            superc = subc;
            subc = (override.constructor != Object.prototype.constructor) ? override.constructor : function(){
                superc.apply(this, arguments);
            };
        }
        
        override = override || {}; //override is optional
        var superproto = superc.prototype;
        var F = function(){
        };
        F.prototype = superproto;
        var subproto = new F();
        subc.prototype = subproto
        subproto.constructor = subc;
        
        //subc.superclass access for superclass's methods 
        subc.superclass = superproto;
        
        // subclass's methods
        LIMO.overwrites(subc, override);
        subproto.superclass = superproto;
        
        //private
        var basiccall = function(type, func, instance, args){
            var fun = type[func];
            if (fun == null) {
                throw new Error('type.' + func + ' is not found');
            }
            fun.apply(instance, args);
        }

		function doBasiccall(sp, func, instance, args){
            if (sp == null) {
                throw new Error('type.superclass not defined. type may be not created by "LIMO.extend"');
            }
            
            var fun = sp[func];
            if (fun == null) {
                throw new Error('type.superclass.' + func + ' is not found');
            }
            
            basiccall(sp, func, instance, args);
		}
		
        
        /**
         * call other type's method
         * @param {Function} type Constructor
         * @param {String} func function's name
         * @param {...} params to func
         */
        subproto.$call = function(){
            var type = arguments[0];
            var func = arguments[1];
            var args = LIMO.slice(arguments, 2);
            basiccall(type.prototype, func, this, args);
        }

        /**
         * call parent type's method
         * @param {Function} subtype subtype's Constructor
         * @param {String} func function's name
         * @param {...} params to func
         */
        subproto.$base = function(){
            var type = arguments[0];
            var func = arguments[1];
            var args = LIMO.slice(arguments, 2);
            var sp = type.superclass;
            doBasiccall(sp, func, this, args);
        };
		
		/**
		 * call parent type's constuctor
         * @param {Function} subtype subtype's Constructor
         * @param {...} params to func
		 */
		subproto.$super = function(){
			var type = arguments[0];
            var args = LIMO.slice(arguments, 1);
			doBasiccall(type.superclass, 'constructor', this, args);
		}
        
        return subc;
    };
    
    /**
     * mixin. the first arguments is trunk. //TODO: 後ろが順々にオーバーライドと記す
     */
    LIMO.mixin = function(){
        var prop, child;
        for (var i = 0, end = arguments.length; i < end; i += 1) {
            var arg = arguments[i];
            if (arg === undefined || arg === null) {
                throw new Error('arguments[' + i + '] nil. cannot mixin.');
            }
            
            if (i == 0) {
                child = arg;
                continue;
            }
            
            LIMO.puts(child, arg);
        }
        return child;
    }
    
    
    ///////////////////////////////////////////////////////////
    LIMO.namespace('LIMO.util')(function(ns){
    
        /**
         *
         * @param {Object} events eventname:option
         */
        ns.Observable = LIMO.extend(function(events){
        
            //private
            var events = events || {};
            var listeners = {};
            var self = this;
            
            function checkEvent(eventName){
                if (!self.hasEvent(eventName)) {
                    throw new Error('eventName is not registered: ' + eventName);
                }
            }
            
            var methods = {
            
                hasEvent: function(eventName){
                    var ev = events[eventName];
                    return (ev !== undefined);
                },
                
                /**
                 * @param {Object} eventName
                 * @param {Object} option
                 */
                addEvent: function(eventName, option){
                    events[eventName] = option || true;
                },
                
                /**
                 *
                 * @param {Object} eventName
                 */
                fireEvent: function(eventName){
                    checkEvent(eventName);
                    
                    var ls = listeners[eventName];
                    if (ls == null) {
                        return;
                    }
                    
                    var args = LIMO.slice(arguments, 1);
					
					//FIXME: リストはコピーしてから使う
                    LIMO.each(ls, function(listener, index){
                        listener.apply(listener, args);
                    })
                },
                
                
                addListener: function(eventName, func){
                    checkEvent(eventName);
                    
                    var ls = listeners[eventName];
                    if (ls == null) {
                        listeners[eventName] = [func];
                    }
                    else {
                        ls.push(func);
                    }
                },
                
                clearListeners: function(){
                    listeners = {};
                }
            };
            
            methods['on'] = methods.addListener;
            
            LIMO.puts(this, methods);
        });
        
    });
    
    ///////////////////////////////////////////////////////////
    LIMO.namespace('LIMO.util')(function(ns){
    
        /**
         * definition property class.
         */
        ns.PropertyAppender = function(){
        };
        
        LIMO.extend(ns.PropertyAppender, Object, {
        
            /**
             * add property. getterFunc and setterFunc is optional.
             * Then createGetter and createSetter create a function to create accessor;
             * @param {Object} target target object
             * @param {Object} propName property name or property name's array
             * @param {Object} getterFunc getter(optional)
             * @param {Object} setterFunc setter(optional)
             */
            add: function(target, propName, getterFunc, setterFunc){
                var self = this;
                target = target || {};
                
                if (propName !== undefined) {
                    function prop(target, name, getterFunc, setterFunc){
                    
                        var Name = name.substr(0, 1).toUpperCase() + name.substr(1);
                        
                        target['get' + Name] = getterFunc || self.createGetter(target, name);
                        target['set' + Name] = setterFunc || self.createSetter(target, name);
                    }
                    
                    if (Array.isArray(propName)) {
                        LIMO.each(propName, function(name){
                            prop(target, name, getterFunc, setterFunc);
                        })
                    }
                    else {
                        prop(target, propName, getterFunc, setterFunc);
                    }
                }
                
                return this;
            },
            
            createGetter: function(target, name){
                return function(){
                    return target[name];
                };
            },
            createSetter: function(target, name){
                return function(value){
                    target[name] = value;
                };
            }
        });
        
        
        /**
         * to create property create function.
         * @param {Object} appender ns.PropertyAppender
         */
        ns.createPropertyFunc = function(appender){
            return function(target, propName, getterFunc, setterFunc){
                appender.add(target, propName, getterFunc, setterFunc);
                var handler = {
                    add: function(pName, gFunc, sFunc){
                        appender.add(target, pName, gFunc, sFunc);
                        return handler;
                    }
                }
                return handler;
            }
        }
        
        /**
         * @param {Object} target target object
         * @param {Object} propName property name or property name array
         * @param {Object} getterFunc getter(optional)
         * @param {Object} setterFunc setter(optional)
         */
        ns.property = ns.createPropertyFunc(new ns.PropertyAppender());
        
    });
    
    
    
})(this);










