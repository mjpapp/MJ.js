// 唯一出口
// 加载底层模块
import {Bone} from '@Bone/Bone';
let bone = new Bone({
    Log: {
        debug : 2
    }
})
class Body {
    constructor(){
        //todo 单例模式
        this.modole = {
            'Bone': bone
        }
    }
    static init(){
        // 配置bone
        // 把需要的模块加载在Body上
    }
    static use(name){
        return this.modole[name]
    }
    get Bone(){
        return bone
    }
}
export {Body}