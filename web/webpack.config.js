const path = require('path');
//代码打包 和 检查代码规范
module.exports = {
	/* 指明编译方式为 node */
	target: 'async-node',
	//插件项
	plugins: [
	],
	entry: {
		// index 		: path.resolve(__dirname, 'core/test/test.js'),
		index 		: path.resolve(__dirname, 'core/test/web.js'),
	},
	output: {
		path        : path.resolve(__dirname, 'build/'),
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
			'core'        : path.resolve(__dirname, 'core'),
			'conf'        : path.resolve(__dirname, 'core/src/conf'),
			'lib'         : path.resolve(__dirname, 'core/src/lib'),
			'script'      : path.resolve(__dirname, 'core/src/script'),
			'template'    : path.resolve(__dirname, 'core/src/template'),
		}
	}
};
// { test:/\.html$/,loader:'raw'},
// { test: /\.css$/, loader: 'style!css'},
// { test: /\.js$/, loader: 'jsx-loader?harmony' },
// { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
// { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192&name=images/[name].[ext]'},
// { test: /\.(eot|svg|ttf|woff)/, loader: 'file?name=fonts/[hash].[ext]'}
//开始ctrl+s编译 webpack --watch
//服务器 webpack-dev-server --progress --colors
