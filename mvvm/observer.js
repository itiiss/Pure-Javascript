function Observer(data) {
  this.data = data;
  this.walk(data);
}

Observer.prototype = {
  walk: function(data) {
    let that = this;
    Object.keys(data).forEach(key => {
      this.convert(key,data[key])
    })
  },
  convert: function(key, val) {
    this.defineReactive(this.data, key, val)
  },
  defineReactive: function(data, key ,val) {
    let dep = new Dep();
    let childObj = observe(val);
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get: function() {
        if(Dep.target) {
          dep.depend();
        }
        return val;
      },
      set: function(newVal) {
        if(newVal === val) {
          return
        }
        val = newVal;
        childObj = observe(newVal);
        dep.notify();
      }
    })
  }

}

function observe(data) {
  if(!data || typeof data !== 'object') {
    return
  }
  return new Observer(data)
};

let uid = 0;

function Dep() {
  this.id = uid++;
  this.subs = [];
}

Dep.prototype = {
  addSub: function(sub) {
    this.subs.push(sub)
  },
  depend: function() {
    Dep.target.addDep(this)
  },
  removeSub: function(sub) {
    let index = this.subs.indexOf(sub);
    if (index != -1) {
      this.subs.splice(index, 1);
    }
  },
  notify: function() {
    this.subs.forEach(sub => sub.update())
  }
};

Dep.target = null;