``````
严格模式
都写在模块里面。严格模式，恩，不错
Class.name
new.target 属性
let 和 const


set 对对象无效
Set 实例的属性和方法
Set 结构的实例有以下属性。
Set.prototype.constructor：构造函数，默认就是Set函数。
Set.prototype.size：返回Set实例的成员总数。
Set 实例的方法分为两大类：操作方法（用于操作数据）和遍历方法（用于遍历成员）。下面先介绍四个操作方法。
add(value)：添加某个值，返回Set结构本身。
delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。
has(value)：返回一个布尔值，表示该值是否为Set的成员。
clear()：清除所有成员，没有返回值。


WeakSet 只能是对象 不适合引用

Map
    const map = new Map([
     ['name', '张三'],
     ['title', 'Author']
   ]);
   map.size // 2
   map.has('name') // true
   map.get('name') // "张三"
   map.has('title') // true
   map.get('title') // "Author"

语法
模糊匹配   
        let [head, ...tail] = [1, 2, 3, 4];
       head // 1
       tail // [2, 3, 4]
``````````

##Mixin 模式的实现
###Mixin 模式指的是，将多个类的接口“混入”（mix in）另一个类。它在 ES6 的实现如下。

```
function mix(...mixins) {
  class Mix {}

  for (let mixin of mixins) {
    copyProperties(Mix, mixin);
    copyProperties(Mix.prototype, mixin.prototype);
  }

  return Mix;
}

function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if ( key !== "constructor"  key !== "prototype"&& key !== "name"
    ) {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}

```


###上面代码的mix函数，可以将多个对象合成为一个类。使用的时候，只要继承这个类即可。

`````
class DistributedEdit extends mix(Loggable, Serializable) {
  // ...
}
`````


##原生构造函数的继承
```
    Boolean()
    Number()
    String()
    Array()
    Date()
    Function()
    RegExp()
    Error()
    Object()
```
######上面这个例子也说明，extends关键字不仅可以用来继承类，还可以用来继承原生的构造函数。因此可以在原生数据结构的基础上，定义自己的数据结构。下面就是定义了一个带版本功能的数组。