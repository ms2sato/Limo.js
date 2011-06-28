LIMO.namespace('LIMO.FRAME')(function(ns){

    /**
     * Simple Application.
     * with one model, controller, view class.
     */
    ns.SimpleApplication = function(){
    
        var _modelType;
        var _viewType;
        var _controllerType;
        
        LIMO.define(this, {
        
            /**
             * initialize.
             * @param {Object} model
             * @param {Object} view
             * @param {Object} controller
             */
            _initialize: function(model, view, controller){
            
            },
            
            setModelType: function(constructor){
                _modelType = constructor;
            },
            setViewType: function(constructor){
                _viewType = constructor;
            },
            setControllerType: function(constructor){
                _controllerType = constructor;
            },
            
            /**
             * entry point
             */
            start: function(){
                var model = new _modelType();
                var controller = new _controllerType(model);
                var view = new _viewType(model, controller);
                controller.setView(view);
                this.controller = controller;
                
                this._initialize(model, view, controller);
                
                if (!controller.onStart) {
                    throw new Error('controller.onStart must be defined.');
                }
                
                controller.onStart();
                
            }
            
        });
        
    }
    
    /**
     * define simple entry point. by define appns.SimpleApplication.
     * appns.Model, appns.View, appns.Controller must be defined.
     * @param {String} appns namepace name
     */
    ns.defineSimpleEntryPoint = function(appns, initializer){
    
        LIMO.namespace(appns)(function(ns){
        
            ns.start = function(){
                var app = new LIMO.FRAME.SimpleApplication();
                ns.app = app;
                app._initialize = initializer;
                app.setModelType(ns.Model);
                app.setViewType(ns.View);
                app.setControllerType(ns.Controller);
                app.start();
            }
        });
    }
    
    //////////////////////////////////////////////////
    // SimpleObserver
    
    ns.toPropertyChanged = function(name){
        //		return LIMO.util.capitalize(name) + 'PropertyChanged';
        return name + 'PropertyChanged';
    };
    
    ns.Fireble = LIMO.extend(function(){
    
        LIMO.define(this, {
        
            createGetter: {
                override: true,
                value: function(target, name){
                    return function(){
                        return target[name];
                    };
                }
            },
            
            createSetter: {
                override: true,
                value: function(target, name){
                    return function(value){
                        target[name] = value;
                        this.fireEvent(ns.toPropertyChanged(name), value);
                    };
                }
            }
        });
        
    }, LIMO.util.PropertyAppender);
    
    var fireble = new ns.Fireble();
    
	/**
	 * create objserver type.
	 * has getter, and setter.
	 * setter fire Event.
	 * 
	 * if "test" is property name,
	 * getter: getTest
	 * setter: setTest
	 * eventName: testPropertyChanged 
	 * 
	 * @param {Object} properties
	 */
    ns.createSimpleObserverType = function(properties){
    
        return LIMO.extend(function(){

            var events = {};
            var methods = {};
            
            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    fireble.add(methods, key);
                    events[ns.toPropertyChanged(key)] = true;
                }
            }
            
            //this.$super(constructor, events);
			LIMO.util.Observable.call(this, events);
            LIMO.define(this, methods);
            
        }, LIMO.util.Observable);
    };
    
});

