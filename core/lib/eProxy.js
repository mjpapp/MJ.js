/**
 * 代理，事件拦截
 */
class eProxy {
    constructor(...args){
       return new Proxy(...args)
        //对config进行拦截
    }
}
export {eProxy};