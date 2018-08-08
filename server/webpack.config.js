const path = require('path');
//代码打包 和 检查代码规范
module.exports = {
	/* 指明编译方式为 node */
	target: 'async-node',
	//插件项
	plugins: [
	],
	entry: {
		index 		: path.resolve(__dirname, ''),
	},
	output: {
		path        : path.resolve(__dirname, ''),
		filename    : "[name].js",
	},
	devtool: "cheap-module-eval-source-map", // 开发环境
	module: {
		loaders: [
			{test: /\.js$/, loader: 'babel-loader'}
		]
	},
	resolve: {
		// 路径别名
		alias: {
		
		}
	}
};
