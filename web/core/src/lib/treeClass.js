const Base           = require('conf/base');
const Util           = require('lib/util');
const Message        = require('lib/message');

const childrenArr    = 'childrenArr';
const childrenMap    = 'childrenMap';
const childrenLen    = 'childrenLen';

let caches = exports.caches = {cid: 1000, length: 0};
let messager = exports.messager = new Message();

class TreeClass extends Base {
	/**
	 * @api {} TreeClass
	 * @apiName 家族类
	 * @apiGroup base
	 * @apiDescription 家族类模块构建的最基础定义，实现基础公用功能模块
	 * @apiVersion 0.1.0
	 * @apiSuccess TreeClass require"TreeClass"
	 */
	constructor(config) {
		super(config);
		// todo 结构应该重构。
		// this.caches = { cid: 1000 , childrenArr:{} , parent:""};、
		this.caches = caches;
		this.guid = this.caches.cid++;
		this.Tree = {
			uri: '', // 当前模块路径
			name: 'TreeClass', // 当前模块名称
			pid: 0, //父级模块 id
			guid: this.guid //当前模块id
		};
		if (config) {
			if (config.name) {
				this.Tree.name = config.name
			}
			if (config.uri) {
				this.Tree.uri = config.uri
			}
		}
		Util.extend(this, config);
		this.caches[this.guid] = this;
		this.caches.length++;
	}
	
	/**
	 * @api {} create
	 * @apiName  create(name,type,config)
	 * @apiGroup TreeClass
	 * @apiDescription 同步创建模块名称。
	 * @apiParam {String} [name] 模块名称 可选
	 * @apiParam {Function} type 子模块定义函数, 用于生成模块实例的函数
	 * @apiParam {Object} config 模块配置
	 * @apiSuccess {String}    childrenObject模块实例
	 * @apiVersion 0.1.0
	 * @apiPrivate
	 */
	create(name, type, config) {
		if (!this.isTreeClass(this)) {
			exports.error('模块已存在缓存里面')
		}
		// 判断是否存在子模块
		if (!this.Tree.hasOwnProperty(childrenArr)) {
			this.Tree[childrenArr] = []; // 子模块缓存列表
			this.Tree[childrenMap] = this.childrenArr = {}; // 子模块命名索引
			this.Tree[childrenLen] = 0; // 子模块计数ID
		}
		// 当name没填的时候
		if (Util.isFunc(name)) {
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
		let child = {
			'uri': this.Tree.uri + '/' + name,	// 模块实例路径
			'name': name,					// 模块实例名称
			'pid': this.Tree.guid,				// 模块父模块实例ID
			// 'guid': caches.cid++				// 当前子实例ID
		};
		let childrenObject = new type(config, this, child);
		Util.extend(childrenObject.Tree, child);
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
		if (Util.isFunc(childrenObject.init)) {
			childrenObject.init(childrenObject, this);
		}
		//System.import('zoo').then异步加载模块
		return childrenObject;
	}
	
	/**
	 * @api {} getParent
	 * @apiName  getParent
	 * @apiGroup TreeClass
	 * @apiDescription 获取当前模块的父模块对象。
	 * @apiSuccess {Object} mod 父模块对象
	 * @apiVersion 0.1.0
	 * @apiPrivate
	 */
	getParent() {
		if (!this.isTreeClass(this) || this.Tree.pid === 0) {
			return null;
		}
		return (caches[this.Tree.pid] || null);
	}
	
	/**
	 * @api {} getChild
	 * @apiName  getChild
	 * @apiGroup TreeClass
	 * @apiDescription 获取指定名称或者索引的子模块实例(仅限于该模块的子模块)。
	 * @apiSuccess {Object} mod 返回子对象实例 / 没有找到对象时返回NULL
	 * @apiParam {String} [name] 子对象名称或数字索引
	 * @apiVersion 0.1.0
	 * @apiPrivate
	 */
	getChild(name) {
		if (!this.isTreeClass(this) || !this.Tree[childrenArr]) {
			return null;
		}
		let id = +name;
		if (isNaN(id)) {
			return (this.Tree[childrenMap][name] || null);
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
	 * @apiGroup TreeClass
	 * @apiDescription 获取当前对象的所有子对象。
	 * @apiParam {Boolean} [name] 是否返回名字索引的对象列表
	 * @apiSuccess {Object} mod 无子对象时, 返回一个空数组或NULL, 否则返回一个数组或者命名对象
	 * @apiVersion 0.1.0
	 * @apiPrivate
	 */
	getChilds(name) {
		if (!this.isTreeClass(this) || !this.Tree[childrenArr]) {
			return (name ? null : []);
		}
		return (name ? this.Tree[childrenMap] : this.Tree[childrenArr]);
	}
	
	/**
	 * @api {} fire
	 * @apiName  fire
	 * @apiGroup TreeClass
	 * @apiDescription 冒泡方式发送消息。
	 * @apiParam {String} type 消息事件类型
	 * @apiParam {Object} [param]    <可选> 消息事件参数, 附加在事件变量的param
	 * @apiParam {Function} [callback] <可选> 消息发送完成回调函数, 不填默认触发模块的onEventSent事件
	 * @apiParam {Object}   [context]  <可选> 回调函数运行域
	 * @apiSuccess {Boolean} true 返回消息是否被立即发送
	 * @apiVersion 0.1.0
	 * @apiPrivate
	 */
	fire(type, param, callback, context) {
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
	 * @apiGroup TreeClass
	 * @apiDescription 向下层子模块实例广播消息。
	 * @apiParam {String} type 消息事件类型
	 * @apiParam {Object} [param]    <可选> 消息事件参数, 附加在事件变量的param
	 * @apiParam {Function} [callback] <可选> 消息发送完成回调函数, 不填默认触发模块的onEventSent事件
	 * @apiParam {Object}   [context]  <可选> 回调函数运行域
	 * @apiSuccess {Boolean} true 返回消息是否被立即发送
	 * @apiVersion 0.1.0
	 * @apiPrivate
	 */
	cast(type, param, callback, context) {
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
	 * @apiGroup TreeClass
	 * @apiDescription 清空缓存。
	 * @apiParam {String} name 模块名称 可选"all","字段名"
	 * @apiPrivate
	 */
	clearCaches(name) {
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
	 * @api {} isTreeClass
	 * @apiName  isTreeClass(obj)
	 * @apiGroup TreeClass
	 * @apiDescription 是否已经构建了模块。
	 * @apiParam {Object} boj 模块实例
	 * @apiPrivate
	 */
	isTreeClass(obj) {
		if (obj instanceof Object) {
			var id = obj.Tree && obj.Tree.guid || 0;
			return (id && caches[id] === obj);
		}
		return false;
	}
}

module.exports = TreeClass;