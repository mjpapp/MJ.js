import {Base} from "@Bone/../../../core/base/Base";
class bUtil extends Base{
	constructor(config){
		super();
		this.con = window.console || {};
		this.config = config;
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
		var key;
		for (key in val) {
			if (key === 'length') {
				if (isNaN(+val[key])) {
					return false;
				}
			} else if (has(val, key) && isNaN(+key)) {
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
		if (!val || OP.toString.call(val).slice(8, -1) !== 'Object' || val.nodeType || val === window) {
			return false;
		}
		try {
			if (val.constructor && !has(val.constructor.prototype, 'isPrototypeOf')) {
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
		var val = $(el).css(name).replace(/[a-z]+/i, '');
		return parseInt(val, 10) || 0;
	}

	ucFirst(str) {
		if (isString(str)) {
			var c = str.charAt(0).toUpperCase();
			return c + str.substr(1);
		}
		return str;
	}

	toHex(num, len) {
		var hex = '0123456789ABCDEF';
		var c = '';
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
}

exports.bUtil = new bUtil();