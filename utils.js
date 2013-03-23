LIMO.namespace('LIMO.utils')(function(ns){

	ns.Extension = LIMO.extend(Object, {
		
		constructor: function(obj){
			this.obj = obj;
		},

		/**
		 * 必ず配列で取得できる
		 */		
		asArray: function(){
			if(Array.isArray(this.obj)){
				return this.obj;
			}else{
				return [this.obj];
			}			
		},
		
		
		isExtended: function(){
			return true;
		}
	});


	LIMO._ = function(obj){
		
		return new ns.Extension(obj);
	}
});