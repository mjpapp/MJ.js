const OP        = Object.prototype;
let UD;//undefined
class Util {
	// 变量类型判断
	static isFunc(func) {
		return (func instanceof Function);
	}
	
	static isString(str) {
		return (typeof(str) === 'string');
	}
	
	static isArray(val) {
		return (val instanceof Array);
	}
	
	static isFakeArray(val) {
		let key;
		for (key in val) {
			if (key === 'length') {
				if (isNaN(+val[key])) {
					return false;
				}
			} else if (Util.has(val, key) && isNaN(+key)) {
				return false;
			}
		}
		return true;
	}
	
	static isObject(val) {
		return (val instanceof Object);
	}
	
	static isEmptyObject(val) {
		return $.isEmptyObject(val);
	}
	
	static isPlainObject(val) {
		if (!val || OP.toString.call(val).slice(8, -1) !== 'Object' || val.nodeType || val === window) {
			return false;
		}
		try {
			if (val.constructor && !Util.has(val.constructor.prototype, 'isPrototypeOf')) {
				return false;
			}
		} catch (e) {
			return false;
		}
		
		return true;
	}
	
	static isNumber(val) {
		return !(val === null || isNaN(+val));
	}
	
	
	static typeOfObject(val) {
		return (val && typeof(val) === 'object');
	}
	
	static has(obj, key) {
		if (key === UD) {
			return false;
		}
		return OP.hasOwnProperty.call(obj, key);
	}
	
	/**
	 * 扩展合并函数
	 * @param  {Number} deep   <可选> 递归合并层数
	 * @param  {Object} target 接受合并内容的目标对象
	 * @param  {Object} ...    需要合并到目标对象的扩展对象(1个或多个)
	 * @return {Object}        返回合并后的对象内容
	 */
	static extend() {
		var args      = arguments;
		var len       = args.length;
		var deep      = args[0];
		var target    = args[1];
		var i = 2;
		if (!Util.isNumber(deep)) {
			target = deep;
			deep = -1;
			i = 1;
		}
		if (!target) {
			target = {};
		}
		while (i < len) {
			if (Util.typeOfObject(args[i])) {
				target = Util.ExtendObject(target, args[i], deep);
			}
			i++;
		}
		return target;
	}
	
	static ExtendObject(dst, src, deep) {
		if (dst === src) {
			return dst;
		}
		let i, type = (dst instanceof Array ? 0 : 1) + (src instanceof Array ? 0 : 2);
		switch (type) {
			case 0:
				// 都是数组, 合并有值的, 忽略undefined的
				for (i = src.length - 1; i >= 0; i--) {
					Util.ExtendItem(dst, i, src[i], 0, deep);
				}
				break;
			case 1:
				// 目标是对象, 新值是数组
				dst = Clone(src);
				break;
			case 2:
				// 目标是数组, 新值是对象
				if (!Util.isFakeArray(src)) {
					dst = Util.Clone(src);
					break;
				}
			/* falls through */
			case 3:
				// 都是对象
				if (!dst) {
					dst = {};
				}
				for (i in src) {
					if (Util.has(src, i)) {
						Util.ExtendItem(dst, i, src[i], 1, deep);
					}
				}
				break;
		}
		return dst;
	}
	
	static ExtendItem(dst, key, value, remove, deep) {
		if (value === UD) {
			// undefined 时删除值
			if (remove) {
				delete dst[key];
			}
		} else if (value && (Util.isArray(value) || Util.isPlainObject(value))) {
			// 新值为对象
			let old = dst[key];
			if (old === value) {
				return;
			}
			if (deep !== 0 && (Util.isArray(old) || Util.isPlainObject(old))) {
				// 继续合并数组和简答对象
				dst[key] = Util.ExtendObject(old, value, --deep);
			} else {
				// 克隆新对象赋值
				dst[key] = Util.Clone(value);
			}
		} else {
			// 直接赋值
			dst[key] = value;
		}
	}
	
	static Clone(value) {
		if (Util.isPlainObject(value) || Util.isArray(value)) {
			var cloneKey = '___deep_clone___';
			
			// 已经被克隆过, 返回新克隆对象
			if (value[cloneKey]) {
				return value[cloneKey];
			}
			
			var objClone = value[cloneKey] = (value instanceof Array ? [] : {});
			for (var key in value) {
				if (key !== cloneKey && value.hasOwnProperty(key)) {
					objClone[key] = (Util.typeOfObject(value[key]) ? Util.Clone(value[key]) : value[key]);
				}
			}
			delete value[cloneKey];
			return objClone;
		}
		return value;
	}
	
	static ucFirst(str) {
		if (Util.isString(str)) {
			let c = str.charAt(0).toUpperCase();
			return c + str.substr(1);
		}
		return str;
	}
}
module.exports = Util;