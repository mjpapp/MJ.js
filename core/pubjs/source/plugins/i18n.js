/**
 * 多语言功能模块
 * 自动在window域上导出两个函数, LANG() 和 _T()
 * LANG() - 实际翻译方法, 支持参数替换
 * _T()   - 语言定义方法, 为让LANG支持变量方式, 原语言先通过该函数定义为语言字符串
 *
 * @param  {Function} cb 加载完毕回调函数
 * @return {Object}      返回语言管理对象
 */
define(function(require, exports){
	var util = require('../core/util');
	var Cookie = util.cookie;
	var pubjs, config;

	var lang_fix_reg = /:<\d+>$/g;
	var fnCallback = null;
	var translate = null;
	var loading_lang = null;
	var current_lang = null;
	var default_lang = 'zhCN';
	var style_base   = 'i18n/';
	var cookie_name  = 'lang';
	var cookie_param = {expires: 9999, path:'/'};
	var ajaxId = 0;
	var subAjaxId = 0;

	/**
	 * 加载语言包
	 * @return {None} 无返回
	 */
	function load(lang, callback){
		if (typeof(lang) == 'function'){
			callback = lang;
			lang = null;
		}
		var cookie_lang = Cookie(cookie_name);

		if (!lang){
			lang = cookie_lang || config('language/default') || default_lang;
		}
		if (lang != cookie_lang){
			Cookie(cookie_name, lang, cookie_param);
		}

		// 语言与当前语言一致, 无需加载
		if (lang == current_lang){
			return true;
		}

		// 默认语言, 也无需加载, 清空语言记录
		fnCallback   = callback;
		loading_lang = lang;
		if (lang == default_lang){
			translate = null;
			runCallback(null);
			return;
		}

		// 开始加载语言包
		if (pubjs && pubjs.data && pubjs.data.get){
			if (ajaxId){
				pubjs.data.abort(ajaxId);
			}
			ajaxId = pubjs.data.get('/i18n/'+lang+'/translate.json', onLoad);
		}
	}
	exports.load = load;
	function onLoad(err, data){
		ajaxId = 0;
		if (!err){
			translate = data;
		}
		var path = translate && translate._path_;
		var func = translate && translate._func_;
		var files = translate && translate._files_;

		if(files && files.length){
			// 如果有files配置，加载files配置的翻译
			util.each(files, function(item){
				subAjaxId++;
				pubjs.data.get(item, onSubLoad);
			});
		}else{
			if (path && func) {
				require.async(path, function(m) {
					if (m && m[func]) {
						translate.func = m[func]
						runCallback(false);
					} else {
						runCallback(true);
					}
				});
			} else {
				runCallback(err);
			}
		}
	}
	function onSubLoad(err, data){
		subAjaxId--;
		if (!err){
			util.extend(translate, data);
		}
		if(!subAjaxId){
			runCallback(err);
		}
	}
	function runCallback(err){
		var lang = loading_lang;
		loading_lang = null;

		if (!err){
			// 加载成功, 设置语言名称和附加CSS
			var D = document;
			var cn = D.body.className.replace(/(\s*)i18n_\w+(\s*)/g, ' ');
			D.body.className = (cn + ' i18n_'+lang).replace(/[ ]+/g, ' ');

			// 移除旧CSS标记
			var css = D.getElementById('LANGUAGE_STYLE');
			if (css){
				css.parentElement.removeChild(css);
			}

			// 引入语言包CSS文件
			if (translate){
				css = D.createElement('link');
				css.id   = 'LANGUAGE_STYLE';
				css.type = 'text/css';
				css.charset = 'utf-8';
				css.rel  = 'stylesheet';
				css.href = style_base + lang + '/style.css';
				D.getElementsByTagName('head')[0].appendChild(css);
			}
			current_lang = lang;
			pubjs.core.cast('switchLanguage', current_lang);
		}

		if (fnCallback){
			fnCallback(!err);
			fnCallback = null;
		}
	}

	// 返回当前语言是否已经加载完成
	exports.isLoaded = function(){
		return (!loading_lang);
	}


	/**
	 * 多语言替换函数
	 * @param  {String} text   语言文字
	 * @param  {Mix}    params <可选多个> 替换语言中文字中的%1,%2..等标记的参数
	 * @return {String}        返回翻译后的文字
	 */
	function LANG(text){
		if (translate && translate.hasOwnProperty(text)){
			text = translate[text];
		}else if (text) {
			text = text.replace(lang_fix_reg, '');
			var transFunc = translate && translate.func;
			if ((default_lang !== loading_lang) && transFunc) {
				text = window.unescape(text.replace(/\\u/g, '%u'));
				text = transFunc(text);
			}
		}
		if (arguments.length > 1){
			return util.formatIndex.apply(this, arguments);
		}
		return text;
	}


	window.LANG = exports.LANG = LANG;

	/**
	 * 多语言标记功能函数
	 * @param  {String} text 多语言替换的文字字符串
	 * @return {String}      原字符串返回
	 */
	window._T = function(text){
		return text;
	}

	/**
	 * 翻译JSON对象
	 * @param   {Object}  json  [翻译的对象]
	 * @return  {Object}        [翻译结果]
	 */
	exports.translateJSON = function(json) {
		var self = this;
		if (!util.isObject(json)) {
			return json;
		}

		util.each(json, function(value, key) {
			// 字段值类型为字符串，直接翻译
			if (util.isString(value)) {
				json[key] = self.LANG(value);
			}
			// 字段值类型为数组
			else if (util.isArray(value)) {
				json[key] = self.translateArrary(value);
			}
			// 字段值类型为对象
			else if (util.isObject(value)) {
				json[key] = self.translateJSON(value);
			}
		});

		return json;
	}

	/**
	 * 翻译数组元素
	 * @param   {Array}  array  [数组]
	 * @return  {Array}         [翻译结果]
	 */
	exports.translateArrary = function(array) {
		var self = this, rets = [];

		util.each(array, function(item) {
			// 字段为字符串，直接翻译
			if (util.isString(item)) {
				rets.push(self.LANG(item));
			}
			// 字段为数组
			else if (util.isArray(item)) {
				rets.push(self.translateArrary(item));
			}
			else if (util.isObject(item)) {
				rets.push(self.translateJSON(item));
			}
			// 其他类型
			else {
				rets.push(item);
			}
		});

		return rets;
	}


	exports.plugin_init = function(context, callback){
		pubjs = context;
		config = pubjs.config;
		cookie_name = config('language/cookie') || cookie_name;
		style_base  = config('language/style') || style_base;

		pubjs.i18n = this;
		load(callback);
	}
});