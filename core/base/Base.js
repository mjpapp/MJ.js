/**
 * @apiName 最原始的函数
 * @apiGroup Base
 * @apiDescription 所有类都是继承这个的。
 * @apiParam {object} config 配置
 * @apiVersion 0.1.0
 * @apiSuccess true
 */
class Base {
	constructor(config) {
		this.config = config;
		this.errorQueue = [];
	}

	init(config) {
		this.config = config;
	}

	getConfig() {
		return this.config
	}

	getConfigByName(key) {
		if (!this.config) {
			throw new Error('配置无法加载');
		}
		return this.config[key] || "该配置无法加载";
	}

	// checkNew(name) {
	// 	if (new.target === name) {
	// 	} else {
	// 	    throw new Error('必须使用 new 命令生成实例');
	// 	}
	// }

	config(name, value) {
		//配置名称， 可覆盖
		if (name instanceof Object) {
			value = name;
			name = null
		}
	}
}

export {Base}