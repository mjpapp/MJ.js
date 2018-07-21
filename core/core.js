/**
 * 骨架，最底层的核心方法 , 最基本的框架
 */
import {Base} from "@BASE/Base"
import {bLog} from '@LIB/bLog'
import {bUtil} from '@LIB/bUtil'
import {eProxy} from "@LIB/eProxy";
import {Module} from "@LIB/Module";
class Core extends Base{
    constructor(config){
        super(config)
    }
    // 测试模块
    testLog() {
    }
    // 系统日志函数
    get blog() {
        return bLog.init(this.config);
    }
    // 工具函数导出
    get butil() {
        return bUtil.init(this.config);
    }
    //使用工厂模式加载插件
}
let Core = new Core();
// 代理
Core = new eProxy(Core, {
    get: function (target, key, receiver) {
        console.log(`getting ${key}!`);
        // console.log(target, key, receiver)
        return Reflect.get(target, key, receiver);
    },
    set: function (target, key, value, receiver) {
        console.log(`setting ${key}!`);
        // console.log('set',target, key, receiver)
        return Reflect.set(target, key, value, receiver);
    }
})
export {Core};