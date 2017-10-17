const path = require('path');
module.exports = {
    //插件项
    plugins: [],
    entry: "./harns/main.js",
    output: {
        path: __dirname,
        filename: "open.js"
    },
    module: {
        loaders: [
            {test: /\.js$/, loader: 'babel-loader'}
        ]
    },
    resolve: {
        // 路径别名
        alias: {
            '@Body' : path.resolve(__dirname, 'body/Body'),
            '@Bone' : path.resolve(__dirname, 'body/Bone'),
            '@Cell' : path.resolve(__dirname, 'body/Cell'),
            '@Derma' : path.resolve(__dirname, 'body/Derma'),
            '@Organ' : path.resolve(__dirname, 'body/Organ'),
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
