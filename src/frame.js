LIMO.namespace('LIMO.FRAME')(function(ns) {

	/**
	 * Simple Application.
	 * with one model, controller, view class.
	 */
	ns.SimpleApplication = function() {

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
			_initialize : function(model, view, controller) {

			},
			setModelType : function(constructor) {
				_modelType = constructor;
			},
			setViewType : function(constructor) {
				_viewType = constructor;
			},
			setControllerType : function(constructor) {
				_controllerType = constructor;
			},
			/**
			 * entry point
			 */
			start : function() {
				var model = new _modelType();
				var controller = new _controllerType(model);
				var view = new _viewType(model, controller);
				controller.setView(view);
				this.controller = controller;
				this.model = model;
				this.view = view;

				this._initialize(model, view, controller);

				if(!controller.onStart) {
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
	ns.defineSimpleEntryPoint = function(appns, initializer) {
		initializer = initializer ||
		function() {
		};

		LIMO.namespace(appns)(function(ans) {

			ans.start = function() {
				var app = new ns.SimpleApplication();
				ans.app = app;
				app._initialize = initializer;
				app.setModelType(ans.Model);
				app.setViewType(ans.View);
				app.setControllerType(ans.Controller);
				app.start();
			}
		});
	}
	//////////////////////////////////////////////////
	// SimpleObserver

	ns.toPropertyChanged = function(name) {
		//		return LIMO.util.capitalize(name) + 'PropertyChanged';
		return 'change:' + name;
	};

	ns.Fireble = LIMO.extend(function() {

		LIMO.define(this, {

			createGetter : {
				override : true,
				value : function(target, name) {
					return function() {
						return target[name];
					};
				}
			},

			/**
			 * create setter
			 * setSomething(value, [option]), option.silent（not fire）
			 */
			createSetter : {
				override : true,
				value : function(target, name) {
					return function(value, option) {
						target[name] = value;

						if(!option || option.silent !== true) {
							this.fireEvent(ns.toPropertyChanged(name), value);
						}
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
	ns.createSimpleObserverType = function(properties) {

		return LIMO.extend(function(option) {

			if(option) {
				LIMO.puts(this, option);
			}

			var events = {};
			var methods = {};

			for(var key in properties) {
				if(properties.hasOwnProperty(key)) {
					fireble.add(methods, key);
					events[ns.toPropertyChanged(key)] = true;
				}
			}

			var self = this;
			methods['toJSON'] = function() {
				return self;
			};
			//this.$super(constructor, events);
			LIMO.util.Observable.call(this, events);
			LIMO.define(this, methods);

		}, LIMO.util.Observable);
	};

	ns.Collection = LIMO.extend(function() {
		this.$super(ns.Collection, {
			add : true,
			remove : true
		});

		var self = this;
		this.items = [];
		//public for read only

		function fire(name, option, param) {
			if(!option || option.silent !== true) {
				self.fireEvent(name, param);
			}
		}

		function seacher(callback, filter) {
			var res = false;

			if(LIMO.isObject(filter)) {
				var kv = filter
				filter = function(item) {

					for(var key in kv) {
						if(!kv.hasOwnProperty(key))
							continue;
						if(item[key] != kv[key]) return false; 
					}
					return true;
				}
			}

			if(LIMO.isFunction(filter)) {
				LIMO.each(self.items, function(item) {
					if(filter(item)) {
						res = true;
						if(callback(item) === false)
							return false;
					}
				});
			}

			return res;
		}


		LIMO.define(this, {
			
			get: function(index){
				return self.items[index];
			},

			add : function(item, option) {
				if(Array.isArray(item)){
					[].push.apply(self.items, item);
				}
				else{
					self.items.push(item);
				}
				
				fire('add', option, item);
			},
			remove : function(item, option) {
				var index = self.items.indexOf(item);
				self.removeAt(index, option);
			},
			removeAt : function(index, option) {
				if(index < 0 || self.items.length <= index)
					return;
				var item = self.items[index];
				self.items.splice(index, 1);
				if(!option || option.silent !== true) {
					self.fireEvent('remove', item, index);
				}
			},
			toJSON : function() {
				return self.items;
			},
			find : function(filter) {
				var res = null;
				seacher(function(item) {
					res = item;
					return false;
				}, filter);
				return res;
			},
			select : function(filter) {
				var res = [];
				seacher(function(item) {
					res.push(item);
					return true;
				}, filter);
				return res;
			}
		});

	}, LIMO.util.Observable);

});
