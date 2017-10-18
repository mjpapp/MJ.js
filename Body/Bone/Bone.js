/**
 * 骨架，最底层的核心方法 , 最基本的框架
 */
import {Log} from '@Bone/lib/Log'
class Bone {
    constructor(config){
        if (new.target === Bone) {
        } else {
            throw new Error('必须使用 new 命令生成实例');
        }
        Log.config = config.Log;
    }
    // 测试模块
    testLog() {
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
    }
    //使用工厂模式加载插件
}
export {Bone};