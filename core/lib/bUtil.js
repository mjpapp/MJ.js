import {Base} from "@BASE/Base";
class bUtil extends Base{
	constructor(config){
		super(config);
		this.con = window.console || {};
		this.config = config;
		this.OP = Object.prototype;
		this.AP = Array.prototype;
		this.UD;//undefined
		this.ENCODE = encodeURIComponent;
	}
	/*
	自定义log方法
	 */
	init(config){
		config = config.bUtil;
		return new bUtil(config);
	}
	// 变量类型判断
	isFunc(func) {
		return (func instanceof Function);
	}

	isString(str) {
		return (typeof(str) === 'string');
	}

	isArray(val) {
		return (val instanceof Array);
	}

	isFakeArray(val) {
		let key;
		for (key in val) {
			if (key === 'length') {
				if (isNaN(+val[key])) {
					return false;
				}
			} else if (this.has(val, key) && isNaN(+key)) {
				return false;
			}
		}
		return true;
	}

	isObject(val) {
		return (val instanceof Object);
	}

	isEmptyObject(val) {
		return $.isEmptyObject(val);
	}

	isPlainObject(val) {
		if (!val || this.OP.toString.call(val).slice(8, -1) !== 'Object' || val.nodeType || val === window) {
			return false;
		}
		try {
			if (val.constructor && !this.has(val.constructor.prototype, 'isPrototypeOf')) {
				return false;
			}
		} catch (e) {
			return false;
		}

		return true;
	}

	isNumber(val) {
		return !(val === null || isNaN(+val));
	}

	isPositiveNumber(val) {
		return !(!isNumber(val) || val <= 0);
	}

	isInt64(val) {
		return isObject(val) && val instanceof Int64;//val.constructor.toString().indexOf("Int64")> -1;
	}

	typeOfObject(val) {
		return (val && typeof(val) === 'object');
	}

	starRegExp(str) {
		str = str.replace(/([\$\.\^\(\)\[\]\{\}])/g, '\\$1');
		str = str.replace(/\*/g, '(?:.+)');
		return new RegExp(str);
	}

	getCssValue(el, name) {
		let val = $(el).css(name).replace(/[a-z]+/i, '');
		return parseInt(val, 10) || 0;
	}

	caseFirst(str) {
		if (isString(str)) {
			let c = str.charAt(0).toUpperCase();
			return c + str.substr(1);
		}
		return str;
	}
	has(obj, key){
		if (key === this.UD) {return false;}
		return  this.OP.hasOwnProperty.call(obj, key);
	}
	toHex(num, len) {
		let hex = '0123456789ABCDEF';
		let c = '';
		num = parseInt(num, 10);
		while (num > 15) {
			c = hex.charAt(num % 16) + c;
			num = num >> 4;
		}
		c = hex.charAt(num % 16) + c;

		while (len && c.length < len) {
			c = '0' + c;
		}
		return c;
	}
	/**
	 * 扩展合并函数
	 * @param  {Number} deep   <可选> 递归合并层数
	 * @param  {Object} target 接受合并内容的目标对象
	 * @param  {Object} ...    需要合并到目标对象的扩展对象(1个或多个)
	 * @return {Object}        返回合并后的对象内容
	 */
	extend(){
		var args = arguments;
		var len = args.length;
		var deep = args[0];
		var target = args[1];
		var i = 2;
		if (!this.isNumber(deep)){
			target = deep;
			deep = -1;
			i = 1;
		}
		if (!target){
			target = {};
		}
		while (i<len){
			if (this.typeOfObject(args[i])){
				target = this.ExtendObject(target, args[i], deep);
			}
			i++;
		}
		return target;
	}
	ExtendObject(dst, src, deep){
		if (dst === src){ return dst; }
		let i, type = (dst instanceof Array ? 0 : 1) + (src instanceof Array ? 0 : 2);
		switch (type){
			case 0:
				// 都是数组, 合并有值的, 忽略undefined的
				for (i=src.length-1; i>=0;i--){
					this.ExtendItem(dst, i, src[i], 0, deep);
				}
				break;
			case 1:
				// 目标是对象, 新值是数组
				dst = Clone(src);
				break;
			case 2:
				// 目标是数组, 新值是对象
				if (!this.isFakeArray(src)){
					dst = Clone(src);
					break;
				}
			/* falls through */
			case 3:
				// 都是对象
				if (!dst){ dst = {}; }
				for (i in src){
					if (this.has(src, i)){
						this.ExtendItem(dst, i, src[i], 1, deep);
					}
				}
				break;
		}
		return dst;
	}
	ExtendItem(dst, key, value, remove, deep){
		if (value === this.UD){
			// undefined 时删除值
			if (remove){ delete dst[key]; }
		}else if (value && (this.isArray(value) || this.isPlainObject(value))){
			// 新值为对象
			let old = dst[key];
			if (old === value){ return; }
			if (deep !== 0 && (this.isArray(old) || this.isPlainObject(old))){
				// 继续合并数组和简答对象
				dst[key] = this.ExtendObject(old, value, --deep);
			}else {
				// 克隆新对象赋值
				dst[key] = this.Clone(value);
			}
		}else {
			// 直接赋值
			dst[key] = value;
		}
	}
	Clone(value){
		if (this.isPlainObject(value) || this.isArray(value)){
			var cloneKey = '___deep_clone___';
			
			// 已经被克隆过, 返回新克隆对象
			if (value[cloneKey]){
				return value[cloneKey];
			}
			
			var objClone = value[cloneKey] = (value instanceof Array ? [] : {});
			for (var key in value){
				if (key !== cloneKey && value.hasOwnProperty(key)){
					objClone[key] = (this.typeOfObject(value[key]) ? this.Clone(value[key]) : value[key]);
				}
			}
			delete value[cloneKey];
			return objClone;
		}
		return value;
	}
	isPlainObject(val){
		if (!val || this.OP.toString.call(val).slice(8,-1) !== 'Object' || val.nodeType || val === window){
			return false;
		}
		try {
			if (val.constructor && !this.has(val.constructor.prototype, 'isPrototypeOf')){
				return false;
			}
		} catch (e){
			return false;
		}
		
		return true;
	}
	ucFirst(str){
		if (this.isString(str)){
			let c = str.charAt(0).toUpperCase();
			return c + str.substr(1);
		}
		return str;
	}
}

exports.bUtil = new bUtil();