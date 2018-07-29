apidoc 字段
----
```$xslt
@api {method} path [title]
  只有使用@api标注的注释块才会在解析之后生成文档，title会被解析为导航菜单(@apiGroup)下的小菜单
  method可以有空格，如{POST GET}
@apiGroup name
  分组名称，被解析为导航栏菜单
@apiName name
  接口名称，在同一个@apiGroup下，名称相同的@api通过@apiVersion区分，否者后面@api会覆盖前面定义的@api
@apiDescription text
  接口描述，支持html语法
@apiVersion verison
  接口版本，major.minor.patch的形式
  
@apiIgnore [hint]
  apidoc会忽略使用@apiIgnore标注的接口，hint为描述
@apiSampleRequest url
  接口测试地址以供测试，发送请求时，@api method必须为POST/GET等其中一种
 
@apiDefine name [title] [description]
  定义一个注释块(不包含@api)，配合@apiUse使用可以引入注释块
  在@apiDefine内部不可以使用@apiUse
@apiUse name
  引入一个@apiDefine的注释块
 
@apiParam [(group)] [{type}] [field=defaultValue] [description]
@apiHeader [(group)] [{type}] [field=defaultValue] [description]
@apiError [(group)] [{type}] field [description]
@apiSuccess [(group)] [{type}] field [description]
  用法基本类似，分别描述请求参数、头部，响应错误和成功
  group表示参数的分组，type表示类型(不能有空格)，入参可以定义默认值(不能有空格)
@apiParamExample [{type}] [title] example
@apiHeaderExample [{type}] [title] example
@apiErrorExample [{type}] [title] example
@apiSuccessExample [{type}] [title] example
  用法完全一致，但是type表示的是example的语言类型
  example书写成什么样就会解析成什么样，所以最好是书写的时候注意格式化，(许多编辑器都有列模式，可以使用列模式快速对代码添加*号)
  
@apiPermission name
  name必须独一无二，描述@api的访问权限，如admin/anyone

```
配置
----
```$xslt
{
  "name" : "mysails",
  "version": "1.0.0",
  "title": "mysails", // 浏览器标题
  "description": "xun's test project"

}
可以写在package.json里面apidoc
```
命令行
---
```$xslt
// 典型用法
apidoc -i api/ -o doc/api [-c ./] -f ".*\.js$"
 
-i 表示输入，后面是文件夹路径
-o 表示输出，后面是文件夹路径
默认会带上-c，在当前路径下寻找配置文件(apidoc.json)，如果找不到则会在package.json中寻找 "apidoc": { }
-f 为文件过滤，后面是正则表达式，示例为只选着js文件
  与-f类似，还有一个 -e 的选项，表示要排除的文件/文件夹，也是使用正则表达式

```