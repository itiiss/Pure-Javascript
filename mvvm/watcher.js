function Watcher(vm, expOrFn, cb) {
  this.cb = cb;
  this.vm = vm;
  this.expOrFn = expOrFn;
  this.depIds = {};

  if(typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = this.parseGetter(expOrFn.trim());
  }
  this.value = this.get();
}

Watcher.prototype = {
  update: function() {
    this.run();
  },
  run: function() {
    let value = this.get();
    let oldVal = this.value;
    if (value !== oldVal) {
      this.value = value;
      this.cb.call(this.vm, value, oldVal)
    }
  },
  addDep: function(dep) {
    if (!this.depIds.hasOwnPropertt(dep.id)) {
      dep.addSub(this);
      this.depIds[dep.id] = dep;
    }
  },
  get: function() {
    Dep.target = this;
    let value = this.getter.call(this.vm, this.vm);
    Dep.target = null;
    return value;
  },
  parseGetter: function(exp) {
    if (/[^\w.$]/.test(exp)) return;
    let exps = exp.split('.');
    return function(obj) {
      for (let i = 0, len = exps.length; i < len; i++) {
        if(!obj) return;
        obj = obj[exps[i]];
      }
      return obj;
    }
  }
}