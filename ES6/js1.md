```Js
//inherites
function Animal(name) {
  this.name= name || 'Animal';
  this.sleep = function() {
    console.log(this.name + 'is sleeping')
  }
}

Animal.prototype.eat = function(food) {
  console.log(this.name + 'is eating' + food);
}

//prototype inherite
function Cat() {}
Cat.prototype = new Animal();
Cat.prototype.name = 'cat';
//test code
let cat = new Cat();
console.log(cat.name)
console.log(cat.eat('fish'))
console.log(cat.sleep())
console.log(cat instanceof Animal) // true
console.log(cat instanceof Cat) // true

//constructor inherite
function Cat(name) {
  Animal.call(this);
  this.name = name || 'Tom'
}
//test code
let cat = new Cat()
console.log(cat.name)
console.log(cat.sleep())
console.log(cat instanceof Animal) // false
console.log(cat instanceof Cat) // true

//comnination inherite
function Cat(name) {
  this.name = name || 'Tom'
}
Cat.prototype = new Animal()
Cat.prototype.constructor = Cat;
//test code
let cat = new Cat();
console.log(cat.name);
console.log(cat.sleep())
console.log(cat instanceof Animal) // true
console.log(cat instanceof Cat) //true

//寄生组合inherite
function Cat(name) {
  Animal.call(this);
  this.name = name || 'Tom'
}
(function(){
  var Super = function(){};
  Super.prototype = Animal.prototype;
  Cat.prototype = new Super()
})();
// test code
let cat = new Cat();
console.log(cat.name);
console.log(cat.sleep());
console.log(cat instanceof Animal) //true
console.log(cat instanceof Cat) //true

//Deep Copy
function deepCopy(obj) {
  let newObj = obj instanceof Array ? []:{};
  for(let key in obj) {
    let value = typeof obj[key] == 'object' ? deepCopy(obj[key]):obj[key];
    newObj[key] = value;
  }
  return newObj;
}

//实现once函数，传入函数参数只执行一次
function once(func) {
  let flag = true;
  return function(){
    if(flag == true) {
      func.apply(null, arguments);
      tag = false
    }
    return undefined;
  }
}

//原生ajax封装成promise
let myNewAjax = function(url) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('get', url);
    xhr.send(data);
    xhr.onreadystatechange = ()=>{
      if(xhr.status==200 && xhr.readyState==4) {
        let json = JSON.parse(xhr.responseText);
        resolve(json)
      } else if(xhr.status!=200 && xhr.readyState!=4) {
        reject('error')
      }
    }
  })
}

//js监听对象属性的改变
Object.defineProperty(user, 'name', {
  set: function(key, value) {
    // do something
  }
})
let user = new Proxy({}, {
  set: function(target, key, value, receiver) {
    // do something
  }
})

//模拟私有变量 1,defineProperty 2,closure
obj = {
  name: '233',
  getName: ()=> {
    return this.name
  }
}
obj.defineProperty(obj, "name", {
  // do sth
})

function func(){
  let name = '233'
  this.getName = ()=>{
    return name
  }
}
let obj = new func()

//实现bing函数
Function.prototype.bind = (obj, arg) => {
  let = arg = Array.prototype.slice.call(arguments, 1);
  let context = this;
  return (newArg) => {
    arg = arg.concat(Array.prototype.slice.call(newArg));
    return context.apply(obj, arg);
  }
}
//考虑到原型链 因为new一个bind过生成的新函数的时候，必须要继承原函数的原型
Function.prototype.bind = (obj, arg) => {
  let arg = Array.prototype.slice.call(arguments, 1);
  let context = this;
  let bound = (newArg) => {
    arg = arg.concat(Array.prototype.slice.call(newArg));
    return context.apply(obj, arg)
  }
  let func = () => {}
  func.prototype = context.prototype;
  bound.prototype = new F();
  return bound;
}

//用setTimeout实现setInsterval
function fun() {
  console.log("1");
  setTimeout(fun,200);
}
setTimeout(fun,200)

setTimeout(()=>{
  //do something
  setTimeout(arguments.callee, 200);
})

// js控制一次只加载一张图片
let obj = new Image();
obj.src = "http://www.phpernote.com/uploadfiles/editor/201107240502201179.jpg"
obj.onload = function() {
  document.getElementById("mypic").innerHTML = "<img src='"+this.src+"' />"
}

obj.onreadystatechange = function() {
  if(this.readyState=="complete") {
    document.getElementById("mypic").innnerHTML="<img src='"+this.src+"' />";
  }
}

//实现sleep的效果
function sleep(ms) {
  let start = Date.now(), expire = start+ms;
  while(Date.now() < expire);
  // do something
  return;
}

function sleep(ms) {
  let temp = new Promise((resolve)=>{
    console.log('111')
    setTimeout(resolve, ms)
  })
  return temp
}
sleep(500).then(()=>{
  console.log('222')
}) // 先输出111，500ms后输出222

// 通过async封装
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function test() {
  let temp = await sleep(1000);
  console.log(111)
  return temp;
}
test() //延迟1000ms后输出1111

// 通过generate实现
function* sleep(ms) {
  yield new Promise((resolve, reject) => {
    console.log(111);
    setTimeout(resolve,ms);
  })
}
sleep(500).next().value.then(()=>{console.log(2222)})

//promsie

//valueOf 
function baseClone(base) {
  return base.valueOf();
}
//Number
var num=new Number(1);
var newNum=baseClone(num);
//newNum->1
//String
var str=new String('hello');
var newStr=baseClone(str);
// newStr->"hello"
//Boolean
var bol=new Boolean(true);
var newBol=baseClone(bol);
//newBol-> true


//JS 全排列 误
function permutate(str) {
  var res = [];
  if(str.length > 1) {
    let left = str[0];
    let rest = str.slice(1, str.length)
    let preResult = permutate(rest);
    for(let i=0;i<preResult.length;i++) {
      for(let j=0;j<preResult[i].length;j++) {
        let tmp = preResult[i].slice(0, j) + left + preResult[i].slice(j, preResult[i].length);
        res.push(tmp)
      }
    }
  } else if(str.length ==1) {
    return [str]
  }
  return res
}

//debounce
function debounce(func, wait ,immediate) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(func ,wait)
  }
}


```

