/**
 * 系统视图，最底层的核心方法 , 最基本的框架
 */
import {Log} from '@Bone/lib/Log'
class View {
    constructor(config){
        if (new.target === View) {
        } else {
            throw new Error('必须使用 new 命令生成实例');
        }
    }
    init(){

    }
    //渲染
    render(){

    }
    onData(){

    }
    onLoad(){

    }
    //使用工厂模式加载插件
}
export {View};