/**
 * Created by mac on 2018/7/23
 */
const Base       = require('conf/base');
const Util    = require('lib/util');

class Message extends Base {
	/**
	 * @api {} Message
	 * @apiName 信息事件处理模块
	 * @apiGroup base
	 * @apiDescription 信息事件处理模块
	 * @apiVersion 0.1.0
	 * @apiSuccess Message import {Message} from "Message"
	 */
	constructor(config) {
		super(config)
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
	fire(sender, sendName, param, callback, context) {
		// 创建事件消息变量对象
		let evt = this.createEvent(sender, sendName, param, 'fire');
		// 事件冒泡
		let listener = sender.getParent(); // 改为不再出发自身模块
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
	cast(sender, sendName, param, callback, context) {
		// 创建事件消息变量对象
		let evt = this.createEvent(sender, sendName, param, 'cast');
		// 事件下发
		let childs = sender.getChilds().slice() || []; // 改为不再出发自身模块
		while (childs.length) {
			let target = childs.shift();
			// 触发父级事件
			let def = this.doEvent(target, evt);
			if (def) {
				evt.source = target;
				evt.sourceName = target.name;
				// 通知原始模块事件已发送
				this.notifySentBreak(evt, callback, context);
				let child = target.getChilds()
				//
				if (Util.isArray(child)) {
					childs = childs.concat(child);
				} else {
					childs.push(child)
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
	createEvent(sender, sendName, param, event = 'fire') {
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
			'method': event + Util.ucFirst(sendName),
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
	doEvent(sender, evt) {
		if (!sender || !evt) {
			return false;
		}
		let method = sender[evt.method];
		let re = null;
		if (method && method instanceof Function) {
			re = method.call(sender, evt);
			evt.count++;
		} else if (sender.fireEvent) {
			re = sender.fireEvent.call(sender, evt);
		}
		return re
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
	notifySentBreak(evt, callback, context) {
		// 默认执行eventBreak
		if (!callback) {
			callback = evt.from.eventBreak;
		} else if (isString(callback)) {
			callback = evt.from[callback];
		} else if (!isFunc(callback)) {
			callback = null;
		}
		if (callback) {
			callback.call((context || evt.from), evt);
		}
		return true;
	}
}

module.exports = Message;