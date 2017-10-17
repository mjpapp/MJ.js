/**
 * 系统日志函数
 */
import {Base} from "@Bone/base/Base"
const style = {
    "send" : "background: #222; color: #bada55",
    "gradient" : "'background-image:-webkit-gradient( linear, left top, right top, color-stop(0, #f22), color-stop(0.15, #f2f), color-stop(0.3, #22f), color-stop(0.45, #2ff), color-stop(0.6, #2f2),color-stop(0.75, #2f2), color-stop(0.9, #ff2), color-stop(1, #f22) );color:transparent;-webkit-background-clip: text;font-size:5em;'",
    "green" : "background: #18A488; color: white"
}
class Log extends Base{
    constructor(){
        super(arguments);
        this.con = window.console || {};
    }
    static log(){
        let con = this.con || window.console ;
        if (con.log && this.getConfigByName('debug') > 0){
            if (con.groupCollapsed){
                con.groupCollapsed.apply(con, arguments);
                con.trace();
                con.groupEnd();
            }else {
                if (con.log.apply){
                    con.log.apply(con, arguments);
                }else {
                    con.log(arguments[0]);
                }
            }
        }
    }
    static error (){
        let con = this.con || window.console ;
        if (con.error && this.getConfigByName('debug') > 1){
            if (con.error.apply){
                con.trace();
                con.error.apply(con, arguments);
            }else {
                con.error(arguments[0]);
            }
        }
    }
    static group (title,array,css){
        let con = this.con || window.console ;
        let first = "%c " + title
        con.group(first, style[css] || css);
        for(let i of array){
            console.log(i)
        }
        con.groupEnd();
    }
    // 查看对象
    static dir (){
        let con = this.con || window.console ;
        con.dir(arguments);
    }
    // 检验html节点
    static dirxml(){
        let con = this.con || window.console ;
        con.dirxml(arguments);
    }
    // 时间计时
    static startTime(){
        let con = this.con || window.console ;
        let dateName = new Date().toISOString()
        this.log(dateName)
        con.time(dateName);
    }
    static endTime(){
        let con = this.con || window.console ;
        con.timeEnd();
    }
    // 性能分析开始
    static startProfile(){
        let con = this.con || window.console ;
        con.profile()
    }
    // 性能分析结束
    static endProfile(){
        let con = this.con || window.console ;
        con.profileEnd()
    }
}
export {Log};