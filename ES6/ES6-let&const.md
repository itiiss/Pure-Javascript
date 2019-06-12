### let命令

##### 作用域：

```js
{
    let a =10;
    var b = 1;
}
a // undefined
b //1
```



```Js
for(let i-0; i<10; ++i) {
    //... 适合用于作循环变量
}
```

```Js
var a= []
for(var i =0;i<10;i++) {
    a[i] = function() {
        console.log(i);
    };
}
a[6]() // 10 i是var声明的，全局都是这个变量i，不管a[x]()，x是几都是10
```

```js
for(let i=0; i<3; i++) {
    let i ='abc';
    console.log(i);
}
//abc *3  用于循环的i和内部的i不是同一个作用域
```

##### 变量提升：

```js
console.log(foo) //undefined，变量提升，脚本运行时foo就存在了
var foo = 2
console.log(bar) // 报错
let bar = 3;
```

##### 死区

```js
var temp = 123;
if(true) {
    typeof temp；//ReferenceError
    temp = 'abc'; //RefernceError 
    let temp;
}
// 块级作用域里let temp优先级高于全局的temp
//在let temp之前属于temp的死区，在这里typeof不再是安全的操作


function bar(x=y, y=2) {
    return [x,y];
}
bar(); //参数x的默认值是y，而y还没有声明，属于死区

var x = x;// ok
let x = x; //ReferenceError

```

##### 不允许重复声明

```Js
//报错
function() {
    let a = 10;
    var a = 1;
}
function fun(arg) {
    let arg; //error
}
function func(arg) {
    {
        let arg; //ok
    }
}
```

##### 为什么需要块级作用域

1. 内层变量可能覆盖外层变量

   ```Js
   var temp = new Date()
   function f() {
       console.log(temp);
       if(false) {
           var temp = 'hello';
       }
   }
   f(); //undefined 后面的temp覆盖了前面的，但是if false导致没执行，temp又变成undefined
   ```

   ​

2. 用于计数的循环变量泄露为全局变量

```Js
var s = 'hello';
for(var i =0; i < s.length; i++) {
    console.log(s[i])
}
console.log(i) // 5
```

### const命令

```Js
const PI = 3.1415;
PI = 3; //TypeError
const foo. // missing initializer 声明同时要初始化

if(true) {
	console.log(MAX); //Reference Error
    const MAX = 5;
    const MAX = 10 //error 同样不能重复声明
}
MAX  //Refernce Error 作用域和死区和let相同
```

##### 本质

const实际保证的是变量指向的那个内存地址不得变动（类似于clang的const 修饰指针），对于简单类型的数据，值保存在那个地址中。但是对于对象和数组，那个地址保存的只是对象的指针，但是对象本身是可变的。

```Js
const foo = {};

foo.prop = 123;
foo.prop; //123 foo对象本身是可变的

foo = {} //Error

const a = []
a.push('hello')  // ok
a.length = 0;   // ok
a = ['233'] //error
```

如果真的想把对象冻结，应该使用Object.freeze方法

```Js
const foo = Object.freeze({})

foo.prop = 123; //常规模式下不起作用，严格模式下报错

var constantize = (obj) => {
    Object.freeze(obj);
    Object.keys(obj).foreach((key, i) => {
        if( typeof obj[key] === 'object') {
            constanize(obj[key])
        }
    })
} // 递归深冻结
```

#### ES6 声明变量的的六种方法

**var,  function, let  , const , import , class**

##### 顶层对象的属性

```Js
windosw.a = 1
a //1
a = 2
window.a  //2 es5中顶层对象和全局对象是等价的，带来问题有不能编译时知道变量未声明，全局变量泛滥

var a = 1;
window.a //1
let b = 1
window.b //undefined
```

##### global对象(提案)

```Js
var global = require('system.global')() //CommonJS

import getGlobal from 'system.global'
const global = getGlobal(); // ES6 module 引入global作为顶层对象

//区分出浏览器的window，webworker的self和node中的global
var getGlobal = function() {
    if(typeof self !== 'undefined') {return self}
    if(typeof window !== 'undefined') {return window}
    if(typeof global !== 'undefined'){return global}
    throw new Error ('unable to locate global object')
} //获得global的具体实现
```

