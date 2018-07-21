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

/**
 * @apiName 最原始的函数
 * @apiGroup Base
 * @apiDescription 所有类都是继承这个的。
 * @apiParam {object} config 配置
 * @apiVersion 0.1.0
 * @apiSuccess true
 */
var Base = function () {
	function Base(config) {
		_classCallCheck(this, Base);

		this.config = config;
		this.errorQueue = [];
	}

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
	}, {
		key: "checkNew",
		value: function checkNew(name) {
			// if (new.target === name) {
			// } else {
			//     throw new Error('必须使用 new 命令生成实例');
			// }
		}
	}, {
		key: "config",
		value: function config(name, value) {
			//配置名称， 可覆盖
			if (name instanceof Object) {
				value = name;
				name = null;
			}
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

		var _this = _possibleConstructorReturn(this, (bUtil.__proto__ || Object.getPrototypeOf(bUtil)).call(this));

		_this.con = window.console || {};
		_this.config = config;
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
		key: 'ucFirst',
		value: function ucFirst(str) {
			if (isString(str)) {
				var c = str.charAt(0).toUpperCase();
				return c + str.substr(1);
			}
			return str;
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
	}]);

	return bUtil;
}(_Base2.Base);

exports.bUtil = new bUtil();

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(3);
module.exports = __webpack_require__(8);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _Bone = __webpack_require__(4);

_Bone.Bone.init({
    Log: {
        debug: 2
    }
});
console.log(_Bone.Bone.blog.error(_Bone.Bone.blog));
console.log(_Bone.Bone.blog.getConfigByName("debug"));
console.log("======调试Bone.log.config=====\n");
console.log('textBone.log.config:' + JSON.stringify(_Bone.Bone.blog.config) + "\n");
console.log("======结束Bone.log.config=====\n");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Core = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Base2 = __webpack_require__(0);

var _bLog = __webpack_require__(5);

var _bUtil = __webpack_require__(1);

var _eProxy = __webpack_require__(6);

var _Module = __webpack_require__(7);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 骨架，最底层的核心方法 , 最基本的框架
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var BoneModule = function (_Base) {
    _inherits(BoneModule, _Base);

    function BoneModule(config) {
        _classCallCheck(this, BoneModule);

        return _possibleConstructorReturn(this, (BoneModule.__proto__ || Object.getPrototypeOf(BoneModule)).call(this, config));
    }
    // 测试模块


    _createClass(BoneModule, [{
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
        //使用工厂模式加载插件

    }]);

    return BoneModule;
}(_Base2.Base);

var Bone = new BoneModule();
// 代理
exports.Core = Bone = new _eProxy.eProxy(Bone, {
    get: function get(target, key, receiver) {
        console.log('getting ' + key + '!');
        // console.log(target, key, receiver)
        return Reflect.get(target, key, receiver);
    },
    set: function set(target, key, value, receiver) {
        console.log('setting ' + key + '!');
        // console.log('set',target, key, receiver)
        return Reflect.set(target, key, value, receiver);
    }
});
exports.Core = Bone;

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

		var _this = _possibleConstructorReturn(this, (BLog.__proto__ || Object.getPrototypeOf(BLog)).call(this));

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
			console.log("======调试Log.config=====\n");
			console.log('textLog.config:' + JSON.stringify(BLog.config) + "\n");
			console.log("======结束Log.config=====\n");

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


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Base2 = __webpack_require__(0);

var _bUtil = __webpack_require__(1);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// 模块只加载一次就可以重复用了。
// var caches = exports.caches = {id: 10, length: 0};

/**
 * @apiName 模块名称
 * @apiGroup Module
 * @apiDescription 模块构建的最基础定义，实现基础公用功能模块。
 * @apiExample {js} 例子:
 *     例子no
 * @apiVersion 0.1.0
 * @apiPrivate
 */
var Module = function (_Base) {
	_inherits(Module, _Base);

	function Module() {
		_classCallCheck(this, Module);

		var _this = _possibleConstructorReturn(this, (Module.__proto__ || Object.getPrototypeOf(Module)).call(this));

		_this._ = {
			uri: '',
			name: 'CORE',
			parent: 0,
			guid: 1
		};
		_this.caches = { id: 10, length: 0 };
		_this.caches['1'] = _this;
		_this.caches.length++;
		return _this;
	}

	/**
  * @apiName 同步创建模块名称
  * @apiGroup Module
  * @apiDescription 方法的详细描述。
  * @apiParam {String} [name] 模块名称 可选
  * @apiParam {Function} type 子模块定义函数, 用于生成模块实例的函数
  * @apiParam {Object} config 模块配置
  * @apiExample {js} 例子:
  *     例子no
  * @apiSuccess 模块实例，错误返回false
  */


	_createClass(Module, [{
		key: 'create',
		value: function create(name, type, config) {
			var children = 'children';
			var childrenName = 'childrenName';
			var childrenId = 'childrenId';
			if (!this.isModule(this)) {
				exports.error('模块已存在缓存里面');
			}
			// 判断是否存在子模块
			if (!this._.hasOwnProperty(children)) {
				this._[children] = []; // 子模块缓存列表
				this._[childrenName] = this.children = {}; // 子模块命名索引
				this._[childrenId] = 0; // 子模块计数ID
			}
			// 当name没填的时候
			if (_bUtil.bUtil.isFunc(name)) {
				if (isFunc(type)) {
					name = name(this._);
				} else {
					config = type;
					type = name;
					name = null;
				}
			}
			// 检查名字
			if (!name) {
				name = 'children_' + this._[childrenId];
			} else if (this._[childrenName][name]) {
				exports.error('模块名称已存在：', this._.uri + '/' + name);
				return false;
			}
			// 子模块计数增加
			this._[childrenId]++;
			var id = {
				'uri': this._.uri + '/' + name, // 模块实例路径
				'name': name, // 模块实例名称
				'pid': this._.guid, // 模块父模块实例ID
				'guid': this.caches.id++ // 当前子实例ID
			};
			var childrenObject = new type(config, this, id);
			childrenObject._ = id;
			// 存入全局Cache队列
			childrenObject[id.guid] = children;
			childrenObject.length++;
			// 存入子模块到父模块关系记录中
			this._[children].push(childrenObject);
			this._[childrenName][name] = childrenObject;

			// 调用初始化方法
			if (_bUtil.bUtil.isFunc(childrenObject.init)) {
				childrenObject.init(childrenObject, this);
			}
			return childrenObject;
		}

		/**
   * @apiName 清楚缓存
   * @apiGroup Module
   * @apiDescription 方法的详细描述。
   * @apiParam {String} name [all,其他缓存]
   */

	}, {
		key: 'clearCaches',
		value: function clearCaches(name) {
			switch (name) {
				case 'all':
					this.caches = {};
					break;
				default:
					if (this.caches[name]) {
						delete this.caches[name];
					}
			}
		}

		/**
   * @apiName 是否是模块
   * @apiGroup Module
   * @apiDescription 是否存在模块缓存之内。
   */

	}, {
		key: 'isModule',
		value: function isModule(obj) {
			if (obj instanceof Object) {
				var id = obj._ && obj._.guid || 0;
				return id && this.caches[id] === obj;
			}
			return false;
		}
	}]);

	return Module;
}(_Base2.Base);

var mod = new Module();
mod.create('test', function () {}, {
	page: 1
});

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// import {Bone} from '@Bone/Bone';
// let bone = new Bone({
//     Log: {
//         debug : 2
//     }
// })
// console.log(bone.log);
// console.log(bone.log.getConfigByName("debug"));


/***/ })
/******/ ]);