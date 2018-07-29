/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Base = function () {
	/**
  * @api {} @BASE/Base
  * @apiName 最原始的函数
  * @apiGroup base
  * @apiDescription 所有类都是继承这个的。
  * @apiParam {object} config 配置
  * @apiVersion 0.1.0
  * @apiSuccess Base import {Base} from "@BASE/Base"
  */
	function Base(config) {
		_classCallCheck(this, Base);

		this.config = config;
	}
	//初始化应用对象, 可设置系统初始配置, 创建系统唯一对象实例


	_createClass(Base, [{
		key: "init",
		value: function init(config) {
			this.config = config;
		}
	}, {
		key: "getConfig",
		value: function getConfig() {
			return this.config;
		}
	}, {
		key: "getConfigByName",
		value: function getConfigByName(key) {
			if (!this.config) {
				throw new Error('配置无法加载');
			}
			return this.config[key] || "该配置无法加载";
		}
	}]);

	return Base;
}();

exports.Base = Base;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Base2 = __webpack_require__(0);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var bUtil = function (_Base) {
	_inherits(bUtil, _Base);

	function bUtil(config) {
		_classCallCheck(this, bUtil);

		var _this = _possibleConstructorReturn(this, (bUtil.__proto__ || Object.getPrototypeOf(bUtil)).call(this, config));

		_this.con = window.console || {};
		_this.config = config;
		_this.OP = Object.prototype;
		_this.AP = Array.prototype;
		_this.UD; //undefined
		_this.ENCODE = encodeURIComponent;
		return _this;
	}
	/*
 自定义log方法
  */


	_createClass(bUtil, [{
		key: 'init',
		value: function init(config) {
			config = config.bUtil;
			return new bUtil(config);
		}
		// 变量类型判断

	}, {
		key: 'isFunc',
		value: function isFunc(func) {
			return func instanceof Function;
		}
	}, {
		key: 'isString',
		value: function isString(str) {
			return typeof str === 'string';
		}
	}, {
		key: 'isArray',
		value: function isArray(val) {
			return val instanceof Array;
		}
	}, {
		key: 'isFakeArray',
		value: function isFakeArray(val) {
			var key = void 0;
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
	}, {
		key: 'isObject',
		value: function isObject(val) {
			return val instanceof Object;
		}
	}, {
		key: 'isEmptyObject',
		value: function isEmptyObject(val) {
			return $.isEmptyObject(val);
		}
	}, {
		key: 'isPlainObject',
		value: function isPlainObject(val) {
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
	}, {
		key: 'isNumber',
		value: function isNumber(val) {
			return !(val === null || isNaN(+val));
		}
	}, {
		key: 'isPositiveNumber',
		value: function isPositiveNumber(val) {
			return !(!isNumber(val) || val <= 0);
		}
	}, {
		key: 'isInt64',
		value: function isInt64(val) {
			return isObject(val) && val instanceof Int64; //val.constructor.toString().indexOf("Int64")> -1;
		}
	}, {
		key: 'typeOfObject',
		value: function typeOfObject(val) {
			return val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object';
		}
	}, {
		key: 'starRegExp',
		value: function starRegExp(str) {
			str = str.replace(/([\$\.\^\(\)\[\]\{\}])/g, '\\$1');
			str = str.replace(/\*/g, '(?:.+)');
			return new RegExp(str);
		}
	}, {
		key: 'getCssValue',
		value: function getCssValue(el, name) {
			var val = $(el).css(name).replace(/[a-z]+/i, '');
			return parseInt(val, 10) || 0;
		}
	}, {
		key: 'caseFirst',
		value: function caseFirst(str) {
			if (isString(str)) {
				var c = str.charAt(0).toUpperCase();
				return c + str.substr(1);
			}
			return str;
		}
	}, {
		key: 'has',
		value: function has(obj, key) {
			if (key === this.UD) {
				return false;
			}
			return this.OP.hasOwnProperty.call(obj, key);
		}
	}, {
		key: 'toHex',
		value: function toHex(num, len) {
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
		/**
   * 扩展合并函数
   * @param  {Number} deep   <可选> 递归合并层数
   * @param  {Object} target 接受合并内容的目标对象
   * @param  {Object} ...    需要合并到目标对象的扩展对象(1个或多个)
   * @return {Object}        返回合并后的对象内容
   */

	}, {
		key: 'extend',
		value: function extend() {
			var args = arguments;
			var len = args.length;
			var deep = args[0];
			var target = args[1];
			var i = 2;
			if (!this.isNumber(deep)) {
				target = deep;
				deep = -1;
				i = 1;
			}
			if (!target) {
				target = {};
			}
			while (i < len) {
				if (this.typeOfObject(args[i])) {
					target = this.ExtendObject(target, args[i], deep);
				}
				i++;
			}
			return target;
		}
	}, {
		key: 'ExtendObject',
		value: function ExtendObject(dst, src, deep) {
			if (dst === src) {
				return dst;
			}
			var i = void 0,
			    type = (dst instanceof Array ? 0 : 1) + (src instanceof Array ? 0 : 2);
			switch (type) {
				case 0:
					// 都是数组, 合并有值的, 忽略undefined的
					for (i = src.length - 1; i >= 0; i--) {
						this.ExtendItem(dst, i, src[i], 0, deep);
					}
					break;
				case 1:
					// 目标是对象, 新值是数组
					dst = Clone(src);
					break;
				case 2:
					// 目标是数组, 新值是对象
					if (!this.isFakeArray(src)) {
						dst = Clone(src);
						break;
					}
				/* falls through */
				case 3:
					// 都是对象
					if (!dst) {
						dst = {};
					}
					for (i in src) {
						if (this.has(src, i)) {
							this.ExtendItem(dst, i, src[i], 1, deep);
						}
					}
					break;
			}
			return dst;
		}
	}, {
		key: 'ExtendItem',
		value: function ExtendItem(dst, key, value, remove, deep) {
			if (value === this.UD) {
				// undefined 时删除值
				if (remove) {
					delete dst[key];
				}
			} else if (value && (this.isArray(value) || this.isPlainObject(value))) {
				// 新值为对象
				var old = dst[key];
				if (old === value) {
					return;
				}
				if (deep !== 0 && (this.isArray(old) || this.isPlainObject(old))) {
					// 继续合并数组和简答对象
					dst[key] = this.ExtendObject(old, value, --deep);
				} else {
					// 克隆新对象赋值
					dst[key] = this.Clone(value);
				}
			} else {
				// 直接赋值
				dst[key] = value;
			}
		}
	}, {
		key: 'Clone',
		value: function Clone(value) {
			if (this.isPlainObject(value) || this.isArray(value)) {
				var cloneKey = '___deep_clone___';

				// 已经被克隆过, 返回新克隆对象
				if (value[cloneKey]) {
					return value[cloneKey];
				}

				var objClone = value[cloneKey] = value instanceof Array ? [] : {};
				for (var key in value) {
					if (key !== cloneKey && value.hasOwnProperty(key)) {
						objClone[key] = this.typeOfObject(value[key]) ? this.Clone(value[key]) : value[key];
					}
				}
				delete value[cloneKey];
				return objClone;
			}
			return value;
		}
	}, {
		key: 'isPlainObject',
		value: function isPlainObject(val) {
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
	}, {
		key: 'ucFirst',
		value: function ucFirst(str) {
			if (this.isString(str)) {
				var c = str.charAt(0).toUpperCase();
				return c + str.substr(1);
			}
			return str;
		}
	}]);

	return bUtil;
}(_Base2.Base);

exports.bUtil = new bUtil();

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(3);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _core = __webpack_require__(4);

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.init({
	Log: {
		debug: 2
	}
});

console.log(_core2.default);
//测试创建模块
var Tree = new _core2.default.Module({
	name: 'parent',
	castChild: function castChild() {
		this.cast('kk', { p: 1 });
	},

	// eventBreak(ev){
	//     debugger
	//     if(ev.returnValue){
	// 		console.log('eventBreak','Tree',ev);
	// 	}
	// },
	fireEvent: function fireEvent(ev) {
		console.log('fireEvent', 'parent', ev);
		return true;
	}
});
//测试创建子模块
Tree.create('test1', function () {
	var test = new _core2.default.Module({
		name: 'test',
		init: function init(config, parent) {
			console.log("======调试parent=====\n");
			console.log('textparent:' + config + "\n");
			console.log("======结束parent=====\n");
		},
		log: function log() {
			console.log("======调试log=====\n");
			console.log('textlog:' + JSON.stringify(this) + "\n");
			console.log("======结束log=====\n");
		},
		fireEvent: function fireEvent(ev) {
			console.log('fireEvent test', ev);
		},
		castKk: function castKk(ev) {
			console.log('castKk test', ev);
			ev.returnValue = 'test1';
			return true;
		},
		fireKk: function fireKk(ev) {
			console.log('test1', ev);
			return true;
		}
	});
	// 测试创建多个模块
	test.create('testChild', function () {
		return new _core2.default.Module({
			name: 'testChild',
			init: function init(config, parent) {
				console.log("======调试testChild=====\n");
				console.log('textparent:' + config + "\n");
				console.log("======结束testChild=====\n");
			},
			log: function log() {
				console.log("======调试logtestChild====\n");
				console.log('textlog:' + JSON.stringify(this) + "\n");
				console.log("======结束logtestChild=====\n");
			},
			fireEvent: function fireEvent(ev) {
				console.log('fireEvent testChild', ev);
			},
			castKk: function castKk(ev) {
				console.log('castKk testChild', ev);
				return true;
			},
			fireParent: function fireParent() {
				this.fire('kk', { name: 'testChild' });
			}
		});
	});
	test.create('testChild2', function () {
		return new _core2.default.Module({
			name: 'testChild2',
			init: function init(config, parent) {
				console.log("======调试testChild2=====\n");
				console.log('textparent:' + config + "\n");
				console.log("======结束testChild2=====\n");
			},
			fireEvent: function fireEvent(ev) {
				console.log('fireEvent testChild2', ev);
			},
			castKk: function castKk(ev) {
				console.log('castKk testChild2', ev);
				return true;
			},
			fireParent: function fireParent() {
				this.fire('kk', { name: 'testChild2' });
			}
		});
	});
	return test;
}, {
	page: 1
});
console.log(Tree);
console.log(Tree.castChild());
// 获取子模块
var test = Tree.getChild('test1');
var testChild = test.getChild('testChild');
var testChild2 = test.getChild('testChild2');
console.log(test, testChild, testChild2);
testChild2.fireParent();
testChild.fireParent();

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Base2 = __webpack_require__(0);

var _bLog = __webpack_require__(5);

var _bUtil = __webpack_require__(1);

var _eProxy = __webpack_require__(6);

var _Module = __webpack_require__(7);

var _Message = __webpack_require__(8);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 骨架，最底层的核心方法 , 最基本的框架
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Core = function (_Base) {
    _inherits(Core, _Base);

    function Core(config) {
        _classCallCheck(this, Core);

        return _possibleConstructorReturn(this, (Core.__proto__ || Object.getPrototypeOf(Core)).call(this, config));
    }
    // 测试模块


    _createClass(Core, [{
        key: 'testLog',
        value: function testLog() {}
        // 系统日志函数

    }, {
        key: 'blog',
        get: function get() {
            return _bLog.bLog.init(this.config);
        }
        // 工具函数导出

    }, {
        key: 'butil',
        get: function get() {
            return _bUtil.bUtil.init(this.config);
        }
    }, {
        key: 'Module',
        get: function get() {
            return _Module.Module;
        }
        //使用工厂模式加载插件

    }]);

    return Core;
}(_Base2.Base);

var CoreMod = new Core();
// 代理
// CoreMod = new eProxy(CoreMod, {
//     get: function (target, key, receiver) {
//         // console.log(`getting ${key}!`);
//         // console.log(target, key, receiver)
//         return Reflect.get(target, key, receiver);
//     },
//     set: function (target, key, value, receiver) {
//         // console.log(`setting ${key}!`);
//         // console.log('set',target, key, receiver)
//         return Reflect.set(target, key, value, receiver);
//     }
// });


exports.default = CoreMod;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Base2 = __webpack_require__(0);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 系统日志函数
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var BLog = function (_Base) {
	_inherits(BLog, _Base);

	function BLog(config) {
		_classCallCheck(this, BLog);

		var _this = _possibleConstructorReturn(this, (BLog.__proto__ || Object.getPrototypeOf(BLog)).call(this, config));

		_this.con = window.console || {};
		_this.config = config;
		_this.style = {
			"send": "background: #222; color: #bada55",
			"green": "background: #18A488; color: white"
		};
		return _this;
	}

	/*
 自定义log方法
  */


	_createClass(BLog, [{
		key: "init",
		value: function init(config) {
			config = config.Log;
			return new BLog(config);
		}
	}, {
		key: "log",
		value: function log() {
			// 输出调用栈 和 对象
			var con = this.con || window.console;
			if (con.log && this.getConfigByName('debug') > 0) {
				if (con.groupCollapsed) {
					con.groupCollapsed.apply(con, arguments);
					con.trace();
					con.groupEnd();
				} else {
					if (con.log.apply) {
						con.log.apply(con, arguments);
					} else {
						con.log(arguments[0]);
					}
				}
			}
		}
	}, {
		key: "error",
		value: function error() {
			// 输出对象和错误点
			var con = this.con || window.console;
			if (con.error && this.getConfigByName('debug') > 1) {
				if (con.error.apply) {
					con.trace();
					con.error.apply(con, arguments);
				} else {
					con.error(arguments[0]);
				}
			}
		}
	}, {
		key: "debug",
		value: function debug(data) {
			//各种类型有不同的输出
			var con = this.con || window.console;
			switch (data) {}
			con.debug(data);
		}
	}, {
		key: "group",
		value: function group(title, dataObject, css) {
			var con = this.con || window.console;
			var first = "%c " + title;
			con.group(first, this.style[css] || css);
			if (dataObject instanceof Object) {
				for (var j in dataObject) {
					this.debug(j);
				}
			}
			con.groupEnd();
		}

		/*
  console常用api
  let s = {
  		name: 1,
  		age: [1,2],
  		sex: function (ex) {
  			this.name  = ex;
  			}
  	}
  	Log.startTime()
  	Log.startProfile()
  	Log.log(s);
  	Log.error(s);
  	Log.dir(s);
  	Log.group("send user/add",["1","1122"],"green")
  	Log.endProfile()
  	Log.endTime()
   */

		// 查看对象

	}, {
		key: "dir",
		value: function dir() {
			var con = this.con || window.console;
			con.dir(arguments);
		}

		// 检验html节点

	}, {
		key: "dirxml",
		value: function dirxml() {
			var con = this.con || window.console;
			con.dirxml(arguments);
		}

		// 时间计时

	}, {
		key: "startTime",
		value: function startTime() {
			var con = this.con || window.console;
			var dateName = new Date().toISOString();
			this.log(dateName);
			con.time(dateName);
		}
	}, {
		key: "endTime",
		value: function endTime() {
			var con = this.con || window.console;
			con.timeEnd();
		}

		// 性能分析开始

	}, {
		key: "startProfile",
		value: function startProfile() {
			var con = this.con || window.console;
			con.profile();
		}

		// 性能分析结束

	}, {
		key: "endProfile",
		value: function endProfile() {
			var con = this.con || window.console;
			con.profileEnd();
		}
	}]);

	return BLog;
}(_Base2.Base);

exports.bLog = new BLog();

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 代理，事件拦截
 */
var eProxy = function eProxy() {
  _classCallCheck(this, eProxy);

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(Proxy, [null].concat(args)))();
  //对config进行拦截
};

exports.eProxy = eProxy;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Module = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Base2 = __webpack_require__(0);

var _bUtil = __webpack_require__(1);

var _Message = __webpack_require__(8);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var childrenArr = 'childrenArr';
var childrenMap = 'childrenMap';
var childrenLen = 'childrenLen';
var caches = exports.caches = { cid: 1000, length: 0 };
var messager = exports.messager = new _Message.Message();

var Module = function (_Base) {
	_inherits(Module, _Base);

	/**
  * @api {} @BASE/Module
  * @apiName 模块名称
  * @apiGroup base
  * @apiDescription 模块构建的最基础定义，实现基础公用功能模块
  * @apiVersion 0.1.0
  * @apiSuccess Module import {Message} from "@BASE/Module"
  */
	function Module(config) {
		_classCallCheck(this, Module);

		// todo 结构应该重构。
		// this.caches = { cid: 1000 , childrenArr:{} , parent:""};、
		var _this = _possibleConstructorReturn(this, (Module.__proto__ || Object.getPrototypeOf(Module)).call(this, config));

		_this.caches = caches;
		_this.guid = _this.caches.cid++;
		_this.Tree = {
			uri: '', // 当前模块路径
			name: 'Module', // 当前模块名称
			pid: 0, //父级模块 id
			guid: _this.guid //当前模块id
		};
		if (config) {
			if (config.name) {
				_this.Tree.name = config.name;
			}
			if (config.uri) {
				_this.Tree.uri = config.uri;
			}
		}
		_bUtil.bUtil.extend(_this, config);
		_this.caches[_this.guid] = _this;
		_this.caches.length++;
		return _this;
	}
	/**
  * @api {} create
  * @apiName  create(name,type,config)
  * @apiGroup Module
  * @apiDescription 同步创建模块名称。
  * @apiParam {String} [name] 模块名称 可选
  * @apiParam {Function} type 子模块定义函数, 用于生成模块实例的函数
  * @apiParam {Object} config 模块配置
  * @apiSuccess {String}	childrenObject模块实例
  * @apiVersion 0.1.0
  * @apiPrivate
  */


	_createClass(Module, [{
		key: "create",
		value: function create(name, type, config) {
			if (!this.isModule(this)) {
				exports.error('模块已存在缓存里面');
			}
			// 判断是否存在子模块
			if (!this.Tree.hasOwnProperty(childrenArr)) {
				this.Tree[childrenArr] = []; // 子模块缓存列表
				this.Tree[childrenMap] = this.childrenArr = {}; // 子模块命名索引
				this.Tree[childrenLen] = 0; // 子模块计数ID
			}
			// 当name没填的时候
			if (_bUtil.bUtil.isFunc(name)) {
				if (isFunc(type)) {
					name = name(this.Tree);
				} else {
					config = type;
					type = name;
					name = null;
				}
			}
			// 检查名字
			if (!name) {
				name = 'children_' + this.Tree[childrenLen];
			} else if (this.Tree[childrenMap][name]) {
				exports.error('模块名称已存在：', this.Tree.uri + '/' + name);
				return false;
			}
			// 子模块计数增加
			this.Tree[childrenLen]++;
			var child = {
				'uri': this.Tree.uri + '/' + name, // 模块实例路径
				'name': name, // 模块实例名称
				'pid': this.Tree.guid // 模块父模块实例ID
				// 'guid': caches.cid++				// 当前子实例ID
			};
			var childrenObject = new type(config, this, child);
			_bUtil.bUtil.extend(childrenObject.Tree, child);
			// 存入全局Cache队列
			childrenObject[child.guid] = childrenArr;
			if (!childrenObject.length) {
				childrenObject.length = 0;
			}
			childrenObject.length++;
			// 存入子模块到父模块关系记录中
			this.Tree[childrenArr].push(childrenObject);
			this.Tree[childrenMap][name] = childrenObject;

			// 调用初始化方法
			if (_bUtil.bUtil.isFunc(childrenObject.init)) {
				childrenObject.init(childrenObject, this);
			}
			//System.import('zoo').then异步加载模块
			return childrenObject;
		}
		/**
  * @api {} getParent
  * @apiName  getParent
  * @apiGroup Module
  * @apiDescription 获取当前模块的父模块对象。
  * @apiSuccess {Object} mod 父模块对象
  * @apiVersion 0.1.0
  * @apiPrivate
   */

	}, {
		key: "getParent",
		value: function getParent() {
			if (!this.isModule(this) || this.Tree.pid === 0) {
				return null;
			}
			return caches[this.Tree.pid] || null;
		}
		/**
   * @api {} getChild
   * @apiName  getChild
   * @apiGroup Module
   * @apiDescription 获取指定名称或者索引的子模块实例(仅限于该模块的子模块)。
   * @apiSuccess {Object} mod 返回子对象实例 / 没有找到对象时返回NULL
   * @apiParam {String} [name] 子对象名称或数字索引
   * @apiVersion 0.1.0
   * @apiPrivate
   */

	}, {
		key: "getChild",
		value: function getChild(name) {
			if (!this.isModule(this) || !this.Tree[childrenArr]) {
				return null;
			}
			var id = +name;
			if (isNaN(id)) {
				return this.Tree[childrenMap][name] || null;
			} else {
				if (id < 0 || id >= this.Tree[childrenArr].length) {
					return null;
				}
				return this.Tree[childrenArr][id];
			}
		}
		/**
  * @api {} getChilds
  * @apiName  getChilds
  * @apiGroup Module
  * @apiDescription 获取当前对象的所有子对象。
  * @apiParam {Boolean} [name] 是否返回名字索引的对象列表
  * @apiSuccess {Object} mod 无子对象时, 返回一个空数组或NULL, 否则返回一个数组或者命名对象
  * @apiVersion 0.1.0
  * @apiPrivate
   */

	}, {
		key: "getChilds",
		value: function getChilds(name) {
			if (!this.isModule(this) || !this.Tree[childrenArr]) {
				return name ? null : [];
			}
			return name ? this.Tree[childrenMap] : this.Tree[childrenArr];
		}
		/**
  * @api {} fire
  * @apiName  fire
  * @apiGroup Module
  * @apiDescription 冒泡方式发送消息。
  * @apiParam {String} type 消息事件类型
  * @apiParam {Object} [param]    <可选> 消息事件参数, 附加在事件变量的param
  * @apiParam {Function} [callback] <可选> 消息发送完成回调函数, 不填默认触发模块的onEventSent事件
  * @apiParam {Object}   [context]  <可选> 回调函数运行域
  * @apiSuccess {Boolean} true 返回消息是否被立即发送
  * @apiVersion 0.1.0
  * @apiPrivate
   */

	}, {
		key: "fire",
		value: function fire(type, param, callback, context) {
			if (param instanceof Function) {
				context = callback;
				callback = param;
				param = null;
			}
			return messager.fire(this, type, param, callback, context);
		}
		/**
   * @api {} cast
   * @apiName  cast
   * @apiGroup Module
   * @apiDescription 向下层子模块实例广播消息。
   * @apiParam {String} type 消息事件类型
   * @apiParam {Object} [param]    <可选> 消息事件参数, 附加在事件变量的param
   * @apiParam {Function} [callback] <可选> 消息发送完成回调函数, 不填默认触发模块的onEventSent事件
   * @apiParam {Object}   [context]  <可选> 回调函数运行域
   * @apiSuccess {Boolean} true 返回消息是否被立即发送
   * @apiVersion 0.1.0
   * @apiPrivate
   */

	}, {
		key: "cast",
		value: function cast(type, param, callback, context) {
			if (param instanceof Function) {
				context = callback;
				callback = param;
				param = null;
			}
			return messager.cast(this, type, param, callback, context);
		}
		/**
   * @api {} clearCaches
   * @apiName  clearCaches(name)
   * @apiGroup Module
   * @apiDescription 清空缓存。
   * @apiParam {String} name 模块名称 可选"all","字段名"
   * @apiPrivate
   */

	}, {
		key: "clearCaches",
		value: function clearCaches(name) {
			switch (name) {
				case 'all':
					caches = {};
					break;
				default:
					if (caches[name]) {
						delete caches[name];
					}
			}
		}
		/**
   * @api {} isModule
   * @apiName  isModule(obj)
   * @apiGroup Module
   * @apiDescription 是否已经构建了模块。
   * @apiParam {Object} boj 模块实例
   * @apiPrivate
   */

	}, {
		key: "isModule",
		value: function isModule(obj) {
			if (obj instanceof Object) {
				var id = obj.Tree && obj.Tree.guid || 0;
				return id && caches[id] === obj;
			}
			return false;
		}
	}]);

	return Module;
}(_Base2.Base);

exports.Module = Module;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Message = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Base2 = __webpack_require__(0);

var _bUtil = __webpack_require__(1);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by mac on 2018/7/23
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Message = function (_Base) {
	_inherits(Message, _Base);

	/**
  * @api {} @BASE/Message
  * @apiName 信息事件处理模块
  * @apiGroup base
  * @apiDescription 信息事件处理模块
  * @apiVersion 0.1.0
  * @apiSuccess Message import {Message} from "@BASE/Message"
  */
	function Message(config) {
		_classCallCheck(this, Message);

		return _possibleConstructorReturn(this, (Message.__proto__ || Object.getPrototypeOf(Message)).call(this, config));
	}

	/**
  * @api {} fire
  * @apiName  fire
  * @apiGroup Message
  * @apiDescription 触发冒泡事件, 优先触发监听的处理, 再进行冒泡过程。
  * @apiParam  {Object}   sender   发送事件的模块实例
  * @apiParam  {String}   sendName     发送的事件名称
  * @apiParam  {Object}   [param]    <可选> 附加在事件变量param中的事件参数
  * @apiParam  {Function} [callback] <可选> 事件完成回调函数, 参数为事件变量对象, 可让事件处理函数返回值给触发函数
  * @apiParam  {Object}   [context]  <可选> 回调函数的运行域
  * @apiSuccess {Boolean} true 返回消息是否被立即发送
  * @apiVersion 0.1.0
  * @apiPrivate
  */


	_createClass(Message, [{
		key: 'fire',
		value: function fire(sender, sendName, param, callback, context) {
			// 创建事件消息变量对象
			var evt = this.createEvent(sender, sendName, param, 'fire');
			// 事件冒泡
			var listener = sender.getParent(); // 改为不再出发自身模块
			while (listener) {
				// 触发父级事件
				if (this.doEvent(listener, evt)) {
					evt.source = listener;
					evt.sourceName = listener.name;
					// 通知原始模块事件已发送
					this.notifySentBreak(evt, callback, context);
					listener = listener.getParent();
				} else {
					listener = null;
				}
			}
		}
		/**
   * @api {} cast
   * @apiName  cast
   * @apiGroup Message
   * @apiDescription 下发事件。
   * @apiParam  {Object}   sender   发送事件的模块实例
   * @apiParam  {String}   sendName     发送的事件名称
   * @apiParam  {Object}   [param]    <可选> 附加在事件变量param中的事件参数
   * @apiParam  {Function} [callback] <可选> 事件完成回调函数, 参数为事件变量对象, 可让事件处理函数返回值给触发函数
   * @apiParam  {Object}   [context]  <可选> 回调函数的运行域
   * @apiSuccess {Boolean} true 返回消息是否被立即发送
   * @apiVersion 0.1.0
   * @apiPrivate
   */

	}, {
		key: 'cast',
		value: function cast(sender, sendName, param, callback, context) {
			// 创建事件消息变量对象
			var evt = this.createEvent(sender, sendName, param, 'cast');
			// 事件下发
			var childs = sender.getChilds().slice() || []; // 改为不再出发自身模块
			while (childs.length) {
				var target = childs.shift();
				// 触发父级事件
				var def = this.doEvent(target, evt);
				if (def) {
					evt.source = target;
					evt.sourceName = target.name;
					// 通知原始模块事件已发送
					this.notifySentBreak(evt, callback, context);
					var child = target.getChilds();
					//
					if (_bUtil.bUtil.isArray(child)) {
						childs = childs.concat(child);
					} else {
						childs.push(child);
					}
				}
			}
		}

		/**
   * @api {} createEvent
   * @apiName  createEvent
   * @apiGroup Message
   * @apiDescription 创建事件消息变量对象.
   * @apiParam  {Object}   sender   发送事件的模块实例
   * @apiParam  {String}   sendName     发送的事件名称
   * @apiParam  {Object}   param    <可选> 附加在事件变量param中的事件参数
   * @apiSuccess {Boolean} true 事件消息变量对象
   * @apiVersion 0.1.0
   * @apiPrivate
   */

	}, {
		key: 'createEvent',
		value: function createEvent(sender, sendName, param) {
			var event = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'fire';

			// todo 接口描述这些字段的意思
			return {
				'from': sender, // 发送者
				'name': sender.Tree.name, // 发送名称
				'type': sendName,
				'param': param,
				'data': null,
				'target': null,
				'source': sender, //上一级来源
				'sourceName': sender.Tree.name, // 上一级来源名称
				'count': 0,
				'method': event + _bUtil.bUtil.ucFirst(sendName),
				'returnValue': null
			};
		}

		/**
   * @api {} doEvent
   * @apiName  doEvent
   * @apiGroup Message
   * @apiDescription 触发模块事件。
   * @apiParam {Object} mod 模块对象
   * @apiParam {Object} evt 事件对象 默认执行方法fireEvent
   * @apiSuccess {String}  re  返回模块调用结果
   * @apiVersion 0.1.0
   * @apiPrivate
   */

	}, {
		key: 'doEvent',
		value: function doEvent(sender, evt) {
			if (!sender || !evt) {
				return false;
			}
			var method = sender[evt.method];
			var re = null;
			if (method && method instanceof Function) {
				re = method.call(sender, evt);
				evt.count++;
			} else if (sender.fireEvent) {
				re = sender.fireEvent.call(sender, evt);
			}
			return re;
		}

		/**
   * @api {} notifySentBreak
   * @apiName  notifySentBreak
   * @apiGroup Message
   * @apiDescription 通知发送事件的模块给谁处理了。
   * @apiParam {Object} evt 事件实体
   * @apiParam {Function} callback 默认执行eventBreak，可以是方法名也可以是函数
   * @apiParam {Object} this 模块作用域
   * @apiSuccess {Boolean}  true
   * @apiVersion 0.1.0
   * @apiPrivate
   */

	}, {
		key: 'notifySentBreak',
		value: function notifySentBreak(evt, callback, context) {
			// 默认执行eventBreak
			if (!callback) {
				callback = evt.from.eventBreak;
			} else if (isString(callback)) {
				callback = evt.from[callback];
			} else if (!isFunc(callback)) {
				callback = null;
			}
			if (callback) {
				callback.call(context || evt.from, evt);
			}
			return true;
		}
	}]);

	return Message;
}(_Base2.Base);

exports.Message = Message;

/***/ })
/******/ ]);