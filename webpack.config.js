const path = require('path');
module.exports = {
    //插件项
    plugins: [],
    entry: [
        "./textMjp.js",
    ],
    output: {
        path: __dirname,
        filename: "index.js"
    },
    module: {
        loaders: [
            {test: /\.js$/, loader: 'babel-loader'}
        ]
    },
    resolve: {
        // 路径别名
        alias: {
			'@CORE' : path.resolve(__dirname, 'core'),
            '@BASE' : path.resolve(__dirname, 'core/base'),
            '@LIB' : path.resolve(__dirname, 'core/lib'),
            '@PLUG' : path.resolve(__dirname, 'core/plug'),
        }
    }
    // { test:/\.html$/,loader:'raw'},
    // { test: /\.css$/, loader: 'style!css'},
    // { test: /\.js$/, loader: 'jsx-loader?harmony' },
    // { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
    // { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192&name=images/[name].[ext]'},
    // { test: /\.(eot|svg|ttf|woff)/, loader: 'file?name=fonts/[hash].[ext]'}
};
//开始ctrl+s编译 webpack --watch
//服务器 webpack-dev-server --progress --colors
