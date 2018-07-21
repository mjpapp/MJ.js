import {Base} from "@Bone/Base"
import {bUtil} from '@Bone/../lib/bUtil'
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
class Module extends Base {
	constructor() {
		super();
		this._ = {
			uri: '',
			name: 'CORE',
			parent: 0,
			guid: 1
		};
		this.caches = {id: 10, length: 0};
		this.caches['1'] = this;
		this.caches.length++;
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
	create(name, type, config) {
		let children = 'children';
		let childrenName = 'childrenName';
		let childrenId = 'childrenId';
		if (!this.isModule(this)) {
			exports.error('模块已存在缓存里面')
		}
		// 判断是否存在子模块
		if (!this._.hasOwnProperty(children)) {
			this._[children] = []; // 子模块缓存列表
			this._[childrenName] = this.children = {}; // 子模块命名索引
			this._[childrenId] = 0; // 子模块计数ID
		}
		// 当name没填的时候
		if (bUtil.isFunc(name)) {
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
		let id = {
			'uri': this._.uri + '/' + name,	// 模块实例路径
			'name': name,					// 模块实例名称
			'pid': this._.guid,				// 模块父模块实例ID
			'guid': this.caches.id++				// 当前子实例ID
		};
		let childrenObject = new type(config, this, id);
		childrenObject._ = id;
		// 存入全局Cache队列
		childrenObject[id.guid] = children;
		childrenObject.length++;
		// 存入子模块到父模块关系记录中
		this._[children].push(childrenObject);
		this._[childrenName][name] = childrenObject;

		// 调用初始化方法
		if (bUtil.isFunc(childrenObject.init)){
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
	clearCaches(name) {
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
	isModule(obj) {
		if (obj instanceof Object) {
			var id = obj._ && obj._.guid || 0;
			return (id && this.caches[id] === obj);
		}
		return false;
	}
}

let mod = new Module();
mod.create('test',function () {
},{
	page:1
});
