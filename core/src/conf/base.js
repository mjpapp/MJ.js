class Base {
	/**
	 * @api {} Base
	 * @apiName 最原始的函数
	 * @apiGroup base
	 * @apiDescription 所有类都是继承这个的。
	 * @apiParam {object} config 配置
	 * @apiVersion 0.1.0
	 * @apiSuccess Base import {Base} from "@BASE/Base"
	 */
	constructor(config) {
		this.config = config;
	}
	
	//初始化应用对象, 可设置系统初始配置, 创建系统唯一对象实例
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
}

module.exports = Base;