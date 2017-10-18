class Base {
    constructor(config){
        this.config = config;
    }
    get config(){
        return this.config
    }
    set config(value){
        this.config = value;
    }
    static getConfig(){
        return this.config
    }
    static getConfigByName(key){
        return this.config[key] || "";
    }


}
export {Base}