### Promise

##### promise的含义

promise是一种容器，保存着某个未来才会结束的事件（通常是一个异步事件）的结果。从语法上，Promise是一个对象，从它可以获取一步操作的信息，promise对象有两个特点

1. 对象的状态不被外界影响，promise对象有三种状态，pending进行中，fulfiled已成功，rejected已失败，只有异步操作的结果可以决定当前是哪一种状态
2. 一旦状态改变，就不会再变化，任何时候都能得到这个结果，状态的改变方向只有两种，pending到fulfiled和pending到rejeced，只要这两种发生，会一直保持这个结果，此时成为resolved已定型。如果改变发生，你再对promise添加回调函数也会得到这个结果

**promise缺点：**无法取消promise，一旦新建就会立即执行，无法中途取消；如果不设置回调函数，promise内部发生的错误不会反应到外部；当处于pending状态时，无法得知进展到哪一个阶段

```js
var promoise = new Promise(function (resolve, reject){
    // some code
    
 	if(/*异步操作成功*/) {
       	resolve(value)
	} else {
    	reject( error)
}
});
//resolve 和reject由js提供，不用自己部署
//resolve的作用是将promise的状态从pending到resolved
//reject将promise从pending到reject，并将异步操作报出的错作为参数传递出去

//promise实例生成后，可以用then指定resolved和rejected状态的回调函数
promise.then(function(value){
    //success
}, function(error) {
    //failure
})

//example: timeout返回一个promise实例，表示一段时间后才会发生结果
//过了ms指定时间后，promise对象变成resolved，就会触发then方法的回调函数
function timeout(ms) {
    return new Promise((resolve, reject) => {
        setTimeOut(resolve, ms, 'done');
    });
}
timeout(100).then((value) => {
    console.log(value);
})
```

##### promise的执行属性

```js
let promise = new Promise(function(resolve, reject) {
    console.log('promise')
    resolve();
})

promise.then(function() {
    console.log('resolved');
})

console.log('hi')

//promise
//hi
//resolved promise新建后马上执行，then方法的回调函数在所有同步脚本执行完后才会执行
```

异步加载图片的例子

```js
function loadImageAsync (url) {
    return new Promise(function(resolve, reject) {
        var image = new Image();
        
        image.onload = function() {
            resolve(image);
        };
        
        image.onerror = function() {
            reject(new Error('can not load image at' + url))
        }
        
        img.src = url;
    })
}
```

##### promise实现Ajax的例子

```js
var getJSON = function (url) {
    var promise = new Promise(function(resolve, reject) {
        var client = new XMLHttpRequest();
        client.open("GET", url);
        client.onreadystatechange = handler;
        client.responseType = "json";
        client.setRequestHeader("Accept", "application/json");
        client.send();
        
        fucntion handler() {
            if(this.readyState !== 4){
                return
            }
            if(this.status === 200) {
                resolve(this.response);
            } else {
                reject(new Error(this.statusText));
            }
        }
    })
    return promise
}

getJSON ("/posts.json").then(function(json){
    console.log('Contents: ' + json);
}, function(error) {
    console.log('error', error);
})

//getJSON是对XMLHttpRequest的封装，用于发出一个JSON数据的HTTP请求
//在getJSON内部，resolve和reject都带有参数，那么这个参数会被传递给回调函数
//reject一般是error，resolve除了正常值以外，还可能是另一个promise实例
```

##### 连续/嵌套promise

```js
var p1 = new Promise(function(resolve, reject) {
    setTimeout(()=> reject(new Error('fail')), 3000)
})

var p2 = new Promise(function(resolve, reject) {
    setTimeout(() => resovle(p1), 1000)
})

p2.then(result => console.log(result)).catch(error => consloe.log(error)) // Error: fail

//p1是一个三秒后reject的promise，p2的状态在一秒后改变，resolve返回的是p1
//由于p1是promise，导致p2自己的状态无效，由p1决定p2的状态，then语句都变成对应后者的了

new Promise((resolve, reject) => {
    resolve(1);
    console.log(2);
}).then(r => {
    console.log(r)
})
//2
//1 调用resolve和reject并不会终结Promise的参数函数执行
//但是一般调用resolve和reject之后，promise就完成了，剩下的操作最好放到then里
new Promise((resolve, reject) => {
    return resolve(1);
    console.log(2);  //可以return resolve/reject 使后面语句不在执行
}).then(r => {
    console.log(r)
})
```

##### Promise.prototype.then()

promise实例具有then方法，也就是说then 方法定义在Promise.prototype上的，它的作用是为promise实例添加状态改变时的回调函数。then返回的是一个新的promise实例，所以可以采用链式写法

```Js
getJSON("/posts.json").then(function(json){
    return json.post;
}).then(function(post) {
    // ...
})
//第一个回调函数完成后，会将返回结果做参数传入第二个

getJSON("/post/1.json").then(function(post) {
    return getJSON(post.commentURL)
}).then(function funcA(comments) {
    console.log('resolved', comments)
}, function funcB(err) {
    console.log('rejected', err)
})

//es6
getJSON('/post/1.json').then(
	post => getJSON(post.commentURL)
).then(
    comments => console.log("resolved", comments),
    err => console.log("rejected" ,err),
)

```

##### Promise.prototype.catch()

是.then(null, reject)的别名，可用于发生错误时的回调函数

```js
getJSON('/post.json').then(function(post) {
    //...
}).catch(function(error){
    //..处理错误
    console.log('error', error),
})

//3 equaled example
var promise = new Promise(function(resolve, reject) {
    try {
        throw new Error('test')
    } catch(e) {
        reject(e);
    }
})

var promise = new Promise(function (resolve, reject) {
    reject(new Erroe('test'));
})


var promise = new Promise(function(resolve, reject){
    throw new Error('error');
})
promise.catch(function(error) {
    console.log(error);
})
// Error: test
```

如果promise已经变成resovled再抛出错误不会被捕获，错误对象有冒泡性质，会一直向后传递直到被捕获

```js
getJson('/post/1.json').then(function(post) {
    return getJSON(post.commentURL)
}).then(function(comment) {
    // some code
}).catch (function(error) {
    // 处理前三个promise的错误
})

//一般避免在then的第二个参数定义reject的回调函数，而是使用catch方法
promise.then(function(data) {
    // success
}, function(err) {
    // error
});  // bad

promise.then(function(data) {
    // success
}).catch(function (err) {
    // error
})
```



##### Promise.all()

promise.all()用于将多个promise实例包装成一个新的Promise实例

```Js
var p = Promise.all([p1, p2 , p3]);
// p的状态由三个相与决定，全部fulfiled则fulfiled，一个reject则rejected
```

promise.all方法接收一个数组作为参数，p1，p2，p3都是Promise实例，如果不是则用resolve方法转成。参数不一定必须是数组但必须具有itertor接口，且返回的每个成员都是promise实例

##### Promise.race()

```js
var p = Promise.all([p1, p2 , p3]);
// 只要1，2，3之中有一个实例先改变，p的状态就跟着改变
//率先改变的Promise实例的返回值，就传递给p的回调函数
```

##### Promise.resolve()

将现有对象转为promise对象，参数分为四种情况

1. 参数是一个promise对象，那么就原封不动返回该参数
2. 参数是具有then方法的对象
3. 参数不具有then方法，或者不是对象
4. 不带有任何参数

```js
var jsPromise = Promise.resovle($.ajax('/whatever.json'));

//参数 1的情况
Promise.resolve('foo')
//equals
new Promise(resolve => resolve('foo'))

//参数 2的情况,会将这个对象转化成promise对象，然后立即执行then方法
let thenable = {
    then: function(resolve, reject) {
        resolve(42)
    }
};
let p1 = Promise.resolve(thenable);
p1.then(function(value) {
    console.log(value) //42
})
```



##### promise.reject()返回一个promise实例，状态是rejected

```js
var p = Promoise.reject('error')
// equals
var p  = new Promise((resolve, reject) => reject('error'));
p.then(null, function(s){
    console.log(s)
});

//promise.reject的参数，变成reject的状态，然后传入后面的参数
const thenable = {
    then(resolve, reject) {
        reject('error');
    }
}

Promise.reject(thenable).catch(e => {
    console.log(e === thenable) // true
})
```



##### Done & finally

promise对象的回调链，不管以then结尾还是catch犯法结尾，要是最后一个方法跑出错误，就无法接受到，可以写一个done方法，总是位于回调链尾端

```js
//done用法
asyncFunc()
	.then(f1)
	.catch(f1)
	.then(f2)
	.done();
// done实现
Promise.prototype.done = function(onFulfiled, onRejected) {
    this.then(onFulfiled, onRejected)
        .catch(function (reason){
        setTimeout(() => {throw reason}, 0)
    })
}
//finnaly用于指定Promise对象最后任何状态都会执行的操作，他接受一个普通回调函数做参数，并且一定执行
server.listen(0)
    .then(function() {
    // run tets
})
.finally(server.stop)
//实现

Promise.prototype.finally = function (callback) {
    let P = this.constructor;
    return this.then(
        value => P.resolve(callback()).then(() => value),
        reason => P.resolve(callback()).then(()=> {throw reason})
    )
}
```





### Generator和Promise结合

使用Generator函数管理流程，遇到异步操作时，通常返回一个promise对象

```js
function getFoo() {
    return new Promise(function (resolve, reejct) {
        resolve('foo')
    });
}

var g = function* () {
    try {
        var foo = yield getFoo();
        console.log(foo);
    } catch (e) {
        console.log(e)
    }
};

function run (generator) {
    var it = generator();
    
    function go(result) {
        if(result.done) return result.value;
        
        return result.value.then(function (value) {
            return go(it.next(value));
        }, function (error) {
            return go(it.throw(error))
        })
    }
    go(it.next())
}

run(g)
//Generator函数g中，有一个异步操作getFoo，返回的是一个promise对象，函数run用来处理这个promise对象，并调用下一个next方法
```



##### Promise.try()

实际开发中，不知道f是同步或者异步情况下，全使用promise来处理，都用then方法指定下一步流程，用catch来处理抛出的错误，就采用下面的写法

```Js
Promise.resolve().then(f)

const f = () => console.log('now');
Promise.resolve().then(f);
console.log('next');
//next
//now 但是同步的f被promise包装后变成异步执行了
```

使用async达到效果

```js
const f = () => console.log('now')
(async () => f()) (); //立即执行的匿名函数，如果f同步则得到同步结果
console.log('next')
//now
//next

//如果f是异步的，就可以用then指定下一步
(async() => f())().then().catch()
//async () => f() 会吃掉f()抛出的错误, 需要后接catch
                        
```

使用new Promise() 达到效果

```js
const f = () => console.log('now')
(
    ()=> new Promise(
        resolve => resolve(f())
    )
)()
console.log('next')
//now
//next
```

### 实现promise

```Js
//构造函数
function Promise(resolver) {}

//原型方法
Promise.prototype.then = function() {}
Promise.prototype.catch = function() {}

//静态方法
Promise.resolve = function () {}
Promise.reject = function () {}
Promise.all = function () {}
Promise.race = function () {}


//构造函数初步实现
//executor函数作为参数传入Promise构造函数
//resolve和reject作为参数传入executor函数
//value作为参数传入resove和reject函数
function Promise(executor) {
  let self = this;
  self.status = 'pending';
  self.data = undefined;
  self.onResolveCallback = []; //promise状态变成resolver时的回调函数集
  self.onRejectCallback = [];

  function resolve(value) {
    if(self.status === 'pending') {
      self.status = 'resolved';
      self.data = value;
      for(let i =0; i<self.onResolveCallback.length; i++) {
        self.onResolveCallback[i](value);
      }
    }
  }

  function reject(reason) {
    if(self.status === 'pending') {
      self.status = 'rejected';
      self.data = reason;
      for(let i =0; i<self.onRejectCallback.length; i++) {
        self.onRejectCallback[i](value);
      }
    }
  }

  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e)
  }
};

Promise.prototype.then = function (onResolve, onReject) {
  this.onRejectCallback.push(onResolve);
  this.onRejectCallback.push(onReject);
};

//如果executor的resolve函数立即触发时，发现promise失效
const promise = newPromise ((resolve) => {
  resolve(1);
})
promise.then((s) => console.log(s));

// 解决办法：将promise的resolve和reject异步执行
function Promise(executor) {
  let self = this;
  self.status = 'pending';
  self.data = undefined;
  self.onResolveCallback = []; //promise状态变成resolver时的回调函数集
  self.onRejectCallback = [];

  function resolve(value) {
    setTimeout(() => {
      if(self.status === 'pending') {
        self.status = 'resolved';
        self.data = value;
        for(let i =0; i<self.onResolveCallback.length; i++) {
          self.onResolveCallback[i](value);
        }
      }
    })
  }

  function reject(reason) {
    setTimeout( () => {
      if(self.status === 'pending') {
        self.status = 'rejected';
        self.data = reason;
        for(let i =0; i<self.onRejectCallback.length; i++) {
          self.onRejectCallback[i](value);
        }
      }
    })
  }
  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e)
  }
};


//使then方法返回promise对象
Promise.prototype.then = function (onResolve, onReject) {
  let self = this;
  let nextPromise;
  onResolve = typeof onResolve === 'function' ? onResolve : function (value) {return value};
  onReject = typeof onReject === 'function' ? onReject : function(reason) {throw reason};

  if(self.status === 'resolved') {
    return nextPromise = new Promise (function (resolve, reject) {
      try {
        let x = onResolve(self.data);
        if(x instanceof Promise) {
          x.then(resolve, reject);
        } else {
          resolve(x);
        }
      } catch (e) {
        reject(e);
      }
    })
  }

  if(self.status === 'rejected') {
    return nextPromise = new Promise(function (resolve, reject) {
      try {
        let x = onReject(self.data);
        if(x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      } catch (e) {
        reject(e);
      }
    })
  }

  if(self.status === 'pending') {
    return nextPromise = new Promise (function (resolve, reject) {
      self.onResolveCallback.push (function (value) {
        try {
          let x = onResolve (self.data);
          if( x instanceof Promise) {
            x.then(resolve, reject);
          } else {
            resolve(x);
          }
        } catch(e) {
          reject(e);
        }
      })
      self.onRejectCallback.push(function(reason) {
        try {
          let x = onReject(self.data);
          if(x instanceof Promise) {
            x.then(resolve, reject)
          } else {
            resolve(e)
          }
        } catch (e) {
          reject(e)
        }
      })
    })
  }
}
```

完整代码

```Js


var promise = (function() {
  function promise(resolver) {
    if (typeof resolver !== 'function') {
      throw new TypeError(resolver + 'is not a function')
    }
    if(!(this instanceof Promise)) {
      return new Promise(resolver);
    }

    let self = this;
    self.callbacks = [];
    self.status = 'pending';

    function resolve(value) {
      setTimeout(() => {
        if(self.status !== 'pending') {
          return
        }
        self.status = 'resolved'
        self.data = value

        for(let i =0; i < self.callbacks.length; i++) {
          self.callbacks[i].onResolve(value)
        }
      })
    }

    function reject(reason) {
      setTimeout(() => {
        if(self.status !== 'pending'){
          return
        }
        self.status = 'rejected';
        self.data = reason

        for(let i = 0; i< callbacks.length; i++) {
          self.callbacks[i].onReject(reason)
        }
      })
    }

    try{
      resolver(resolve, reject)
    } catch(e) {
      reject(e)
    }

    function resolvePromise(promise, x, resolve, reject) {
      let then;
      let throwed = false;

      if(promise === x) {
        return reject(new TypeError('Chaining cycle detected'))
      }

      if((x!== null) && ((typeof x === 'object') || (typeof x === 'function'))){
        try {
          then = x.then;
          if(typeof then === 'function') {
            then.call(x, function rs(y){
              if(throwed) return;
              throwed = true
              return resolvePromise(promise, y ,resolve, reject)
            }, function rj(r) {
              if(throwed) return;
              throwed = true
              return reject(r);
            })
          } else {
            return resolve(x)
          }
        } catch(e) {
          if(throwed) return;
          throwed = true;
          return reject(e)
        }
      } else {
        return resolve(x)
      }
    }

    Promise.prototype.then = function(onResolve, onReject) {
      //处理点击传统
      onResolve = typeof onResolve === 'function' ? onResolve : function(v){return v};
      onReject = typeof onReject === 'function' ? onReject : function(r) {throw r};

      let self = this;
      let nextPromise

      if(self.status === 'resolved') {
        return nextPromise = new Promise(function (resolve, reject) {
          setTimeout(() => {
            try {
              //调用then的onResolve回调
              let x = onResolve(self.data)
              //根据x的值修改nextPromsise
              resolvePromise(nextPromise, x, resolve, reject)
            } catch(e) {
              //nextPromise变成rejected状态
              return reject(e)
            }
          });
        })
      }

      if(self.status === 'rejected') {
        return nextPromise = new Promise(function(resolve, reject) {
          setTimeout(() => {
            try {
              let x = onReject(self.data)
              resolvePromise(nextPromise, x, resolve, reject)
            } catch(e) {
              return reject(e);
            }
          })
        })
      }

      if(self.status === 'pending') {
        return nextPromise = new Promise(function(resolve, reject) {
          self.callbacks.push({
            onResolve: (value) => {
              try {
                let x = onResolve(value);
                resolvePromise(nextPromise, x, resolve, reject)
              } catch (e) {
                return reject(e)
              }
            },
            onReject: function(reason) {
              try {
                let x = onReject(reason)
                resolvePromise(nextPromise, x, resolve, reject)
              } catch(e) {
                return reject(e);
              }
            }
          })
        })
      }}

    Promise.prototype.valueOf = () => this.data;

    Promise.prototype.catch = (onReject) => {
      return this.then(null, onReject);
    }


    Promise.prototype.finally = (fn) => {
      return this.then((v) => {
        setTimeout(fn)
        return v;
      }, (r) => {
        setTimeout(fn)
        throw r
      })
    }

    Promise.all = (promises) => {
      return new Promise(function(resolve, reject) {
        let resolvedCounter = 0;
        let promiseNum = promises.length;
        let resolvedValues = new Array(promiseNum);
        for(let i =0; i<promiseNum ; i++) {
          (function(i){
            Promise.resolve(promise[i]).then((value) => {
              resolvedCounter++;
              resolvedValues[i] = value;
              if(resolvedCounter == promiseNum) {
                return resolve(resolvedValues)
              }
            } , (reason) => {
              return reject(reason)
            })
          })(i)
        }
      })
    }

    Promise.race = function(promise) {
      return new Promise(function( resolve, reject) {
        for(let i=0; i< promises.length;i++) {
          promise.resolve(promise[i]).then((value) => {
            return resolve(value)
          }, (reason) => {
            return reject(reason)
          }
        )}
      })
    }

    Promise.resolve = (value) => {
      return new Promise(function(resolve ,reject) {
        resolvePromise(promise, value, resolve, reject)
      })
    }

    Promise.reject = (reason) => {
      return new Promise(function(resolve, reject) {
        reject(reason);
      })
    }

    Promise.done = () => {
      return new Promise(function() {})
    }




  
}
})
```

