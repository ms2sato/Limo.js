if (typeof(LIMO) == 'undefined')
	LIMO = {};

// 軽量テンプレートsimplate
LIMO.simplate = {};

/**
 * 元ネタは以下です。これのバグ修正と改造を施しました。
 * とても良い気付きをいただきました。ありがとうございました。
 * RND
 * http://amix.dk/blog/post/163#RND-template-redux
 */
(function() {

	var valueRegex = /#\{([^(?:\s\})]+)\}/gm;
	var forRegex = /\<!--[\s]+#for[\s]+([\S]+)[\s]+in[\s]+([\S]+)[\s]*([\S])[\s]*-->[\s]*([^\3]+?)<!--[\s]*\3[\s]*-->/gm;
	var scopeRegex = /\<!--[\s]+#scope[\s]+([\S]+)[\s]+([\S])[\s]*-->[\s]*([^\2]+?)<!--[\s]*\2[\s]*-->/gm;
	var includeRegex = /\<!--[\s]+#include[\s]+([\S]+)[\s]*-->/gm;

	/**
	 * 改造版テンプレート。
	 * <ul>
	 * <li>#{a}のような表現の置換</li>
	 * <li>#{a|func}のようなaに対するfunc関数の適用結果の出力（scope.funcで呼ばれる。デフォルトのscopeはwindow）</li>
	 * </ul>
	 * に加えて
	 * <pre>
	 *			<!-- #scope item.costs % -->
	 *				<td><input class="input-promo" type="text" value="#{value1}"></td>
	 *			<!-- % -->
	 * </pre>
	 * のようなスコープを区切った値の取り出しができる。
	 * この時"%"の文字は好きな一文字で指定ができる。
	 * 囲まれた部分で利用していない文字に変更すること。これにより、エスケープ文字により内部表現が見づらくなることを防げる。
	 * コメントにするのはHTML内に埋め込んだ場合、Chromeで無視されてしまうのを回避するため。
	 * （オプションでコメントしない版を作ると良いかもしれない。）
	 * <ul>
	 * <li>item.costsが通常のObjectの場合、item.costs.value1の値が#{value1}と置き換わる。</li>
	 * <li>item.costsが配列の場合、スコープ内の表現を繰り返し、item.costs[N].value1（Nは整数）の値が#{value1}と置き換わる。</li>
	 * </ul>
	 * <pre>
	 *			<!-- #for a in promotioncosts % -->
	 *				<td>#{a_index}<input class="input-promo" type="text" value="#{a}"></td>
	 *			<!-- % -->
	 * </pre>
	 * のような表記でインデクスを利用した繰り返し置換が行える。
	 * @param {String} tmpl テンプレート
	 * @param {Object} ns ネームスペース（各置き換え値の格納されたハッシュ）
	 * @param {Object} scope 関数の存在するスコープオブジェクト。省略するとwindow
	 * @param {Object} option {el, _index, funcChain} オブジェクトのパス表現, インデクス, 適用する関数リストを格納する内部変数,
	 * @return {String} ネームスペースの値適用後の文字列
	 * @author ms2
	 */
	LIMO.simplate.eval = function(tmpl, ns, scope, option) {

		if(tmpl == null) {
			throw new Error('tmpl == null');
		}

		if (ns == null) {
			ns = {};
		}

		if(option == null) {
			option = {
				ns: ns,
				el: ''
			};
		}

		scope = scope || window;

		if (isArray(ns)) {
			return LIMO.simplate.eval_to_array(tmpl, ns, scope, option);
		}

		//include
		var includeFun = function(w, id) {

			var elm = document.getElementById(id);
			var src = elm.innerHTML;
			return src;
		}
		tmpl = tmpl.replace(includeRegex, includeFun);

		//forの置き換え関数
		var forFun = function(w, itemName, el, delim, template) {
			var opt = {
				ns: ns,
				el: el,
				'_parent' : option
			};
			var items = access(ns, opt);
			if (items === undefined) {
				throw new Error(el + " is undefined");
			}

			var res = '';
			for (var i = 0; i < items.length; ++i) {
				var item = items[i];
				if (item === undefined) {
					throw new Error(el + '[' + i + ']' + ' is undefined');
				}

				ns[itemName] = item;
				ns[itemName + '_index'] = i;
				opt['_index'] = i;
				res = res + LIMO.simplate.eval(template, ns, scope, opt);
			};
			return res;
		};
		tmpl = tmpl.replace(forRegex, forFun);

		//scopeの置き換え
		var scopeFun = function(w, elFun, delim, template) {

			var params = elFun.split('|');
			var val = params[0];
			var opt = {
				ns: ns,
				el: val,
				_index:option._index,
				'_parent' : option
			};
			var item = access(ns, opt);
			if (item === undefined) {
				throw new Error(el + " is undefined");
			}
			if (item === null) {
				throw new Error(el + " is null");
			}

			if(isArray(item)) {
				opt.funcChain = params;
				return LIMO.simplate.eval_to_array(template, item, scope, opt);
			} else {
				return LIMO.simplate.eval(template, applyFuncChain(item, params), scope, opt);
			}
		};
		tmpl = tmpl.replace(scopeRegex, scopeFun);

		function access(ns, option) {
			if(option.el == '_index') {
				return option['_index'];
			}

			//thisは特別。自身をそのまま返す。
			if (option.el == 'this') {
				return ns;
			}

			if(ns === null || ns === undefined) {
				throw new Error('ns is nothing: ' + option.el);
			}

			var el = option.el;

			//''で囲まれると文字列扱い
			if (wrappedWith(el, "'")) {
				return el.substring(1, el.length - 1);
			}

			var props = el.split('.');
			var val = ns;
			var opt = option;
			for (var i = 0; i < props.length; ++i) {
				var propName = props[i];
				val = val[propName];

				if (val === undefined) {

					function getParentValue() {

						for(;;) {
							opt = opt['_parent'];
							if(opt === undefined)
								return null;

							if(opt.ns !== undefined) {
								val = opt.ns[propName];
								if(val !== undefined)
									return val;
							}
						}

					}

					val = getParentValue();
					if(val === null) {
						throw new Error(el + '(' + propName + ') is undefined ' + i);
					}
				}
			}
			return val;
		}

		var fn = function(w, g) {
			g = g.split("|");
			var opt = {
				el:g[0],
				_index: option._index,
				'_parent': option
			};
			var cnt = access(ns, opt);
			cnt = applyFuncChain(cnt, g, scope);
			if (cnt == 0 || cnt == -1)
				cnt += '';
			//return cnt || w;
			return escapeHtml(cnt.toString());
		};
		return tmpl.replace(valueRegex, fn);
	}
	LIMO.simplate.eval_to_array = function(tmpl, ns, scope, option) {
		var res = '';
		for (var i = 0; i < ns.length; ++i) {
			var ite = ns[i];
			if (ite === undefined) {
				throw new Error(option.el + '[' + i + ']' + ' is undefined');
			}

			if(option.funcChain) {
				//TODO: iteの値が無い場合は例外でもいい
				ite = applyFuncChain(ite, option.funcChain, scope);
			}

			ite['_parent'] = ns;
			option['_index'] = i;
			res = res + LIMO.simplate.eval(tmpl, ite, scope, option);
		};
		return res;
	}
	var applyFuncChain = function(cnt, g, scope) {
		for (var i = 1; i < g.length; i++) {
			var funcName = g[i];
			var func = scope[funcName];
			if(func == null) {
				throw new Error(funcName + ' is not found in scope');
			}
			cnt = func(cnt);
		}
		return cnt;
	}
	function isArray(x) {
		return ((typeof x == "object") && (x.constructor == Array));
	}

	function startsWith(str, starts) {
		if(str == null) throw new Error('str == null');
		if(starts == null) throw new Error('starts == null');

		return starts == str.substring(0, starts.length);
	}

	function endsWith(str, ends) {
		if(str == null) throw new Error('str == null');
		if(ends == null) throw new Error('ends == null');

		return ends == str.substring(str.length - ends.length);
	}

	function wrappedWith(str, token) {
		return startsWith(str, token) && endsWith(str, token);
	}

	function escapeHtml(string) {
		return string.replace(/[&<>"']/g, function(match) {
			return {
				'&' : '&amp;',
				'<' : '&lt;',
				'>' : '&gt;',
				'"' : '&quot;',
				"'" : '&#39;'
			}[match]
		});
	}

})();