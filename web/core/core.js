/**
 * 骨架，最底层的核心方法 , 最基本的框架
 */
const Base        = require('conf/base');
const log         = require('lib/log');
const util        = require('lib/util');
const tree        = require('lib/treeClass');
class Core extends Base{
    constructor(config){
        super(config)
    }
    // 系统日志函数
    get log() {
        return new log().init(this.config);
    }
    // 工具函数导出
    get util() {
        return util;
    }
    // 家族类导出
    get tree() {
        return tree;
    }
}
let CoreMod       = new Core();
module.exports    = CoreMod;