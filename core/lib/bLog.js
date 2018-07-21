/**
 * 系统日志函数
 */
import {Base} from "@Bone/../../../core/base/Base"
class BLog extends Base {
	constructor(config) {
		super();
		this.con = window.console || {};
		this.config = config;
		this.style = {
			"send": "background: #222; color: #bada55",
			"green": "background: #18A488; color: white"
		}
	}

	/*
	自定义log方法
	 */
	init(config) {
		config = config.Log;
		return new BLog(config);
	}

	log() {
		// 输出调用栈 和 对象
		console.log("======调试Log.config=====\n")
		console.log('textLog.config:' + JSON.stringify(BLog.config) + "\n");
		console.log("======结束Log.config=====\n");

		let con = this.con || window.console;
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

	error() {
		// 输出对象和错误点
		let con = this.con || window.console;
		if (con.error && this.getConfigByName('debug') > 1) {
			if (con.error.apply) {
				con.trace();
				con.error.apply(con, arguments);
			} else {
				con.error(arguments[0]);
			}
		}
	}

	debug(data) {
		//各种类型有不同的输出
		let con = this.con || window.console;
		switch (data) {

		}
		con.debug(data)
	}

	group(title, dataObject, css) {
		let con = this.con || window.console;
		let first = "%c " + title
		con.group(first, this.style[css] || css);
		if (dataObject instanceof Object) {
			for (let j in dataObject) {
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
	dir() {
		let con = this.con || window.console;
		con.dir(arguments);
	}

	// 检验html节点
	dirxml() {
		let con = this.con || window.console;
		con.dirxml(arguments);
	}

	// 时间计时
	startTime() {
		let con = this.con || window.console;
		let dateName = new Date().toISOString()
		this.log(dateName)
		con.time(dateName);
	}

	endTime() {
		let con = this.con || window.console;
		con.timeEnd();
	}

	// 性能分析开始
	startProfile() {
		let con = this.con || window.console;
		con.profile()
	}

	// 性能分析结束
	endProfile() {
		let con = this.con || window.console;
		con.profileEnd()
	}
}

exports.bLog = new BLog();