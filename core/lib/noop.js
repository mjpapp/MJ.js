
// 类式继承功能函数
function argv_run(proto, scope, func, args){
    if (func==='' || !(func in proto)) {return UDF;}
    func = proto[func];
    if (typeof(func) != 'function') {return func;}
    if ((args instanceof arguments.constructor || args instanceof Array) && args.length){
        return func.apply(scope, args);
    }else {
        return func.call(scope);
    }
}
// 模块自有公共属性和方法调用
function mine_run(scope, func, args){
    return argv_run(this.prototype, scope, func, args);
}
// 私有对象属性设置
function self_run(scope, func, args){
    return argv_run(this.priv, scope, func, args);
}

var super_regx = /\b\.Super\b/;
function fix_super(Super, method){
    if (method instanceof Function && super_regx.test(method.toString())){
        return function(){
            if (this !== window){
                this.Super = Super;
            }
            return method.apply(this, arguments);
        };
    }else {
        return method;
    }
}
function bind_super(scope, proto){
    return function(func, args){
        if (!func || typeof(func) !== 'string'){
            args = func;
            func = 'CONSTRUCTOR';
        }
        return argv_run(proto, scope, func, args);
    };
}

// 空函数
function noop(){}
noop.extend = function(proto, priv){
    var _parent = this.prototype;
    function StaticSuper(scope, func, args){
        return argv_run(_parent, scope, func, args);
    }
    function Super(func, args){
        if (func === -31826) {return this;}
        if (arguments.length === 0){
            return bind_super(this, _parent);
        }
        if (!func || typeof(func) !== 'string'){
            args = func;
            func = 'CONSTRUCTOR';
        }
        return argv_run(_parent, this, func, args);
    }
    Super.prototype = _parent;

    function Class(){
        var ct = this.CONSTRUCTOR;
        if (ct && ct instanceof Function){
            ct.apply(this, arguments);
        }
        return this;
    }
    var c = Class.prototype = new Super(-31826);
    if (typeof(proto) == 'object'){
        for (var n in proto){
            if (proto.hasOwnProperty(n)){
                c[n] = fix_super(Super, proto[n]);
            }
        }
    }
    c.constructor = Class;
    Class.Super = StaticSuper;
    Class.self = self_run;
    Class.mine = mine_run;
    Class.priv = priv;
    Class.version = version;
    Class.extend = this.extend;
    proto = priv = null;
    return Class;
}
exports.noop = noop;
exports.Class = noop;