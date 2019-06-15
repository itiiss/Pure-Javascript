function Compile(el) {
  this.$el = this.isElementNode(el) ? el : document.querySelector(el)
  if(this.$el) {
    this.$fragment = this.node2Fragment(this.$el);
    this.init();
    this.$el.appendChild(this.$fragment);
  }
}

Compile.prototype = {
  init: function() {
    this.compileElement(this.$fragment)
  },
  node2Fragment: function() {
    let fragment = document.createDocumentFragment(), child;
    //将原生节点拷贝到fragment
    while(child = el.firstChild) {
      fragment.appendChild(child)
    }
    return fragment;
  },
  compileElement: function(el) {
    let childNodes = el.childNodes,
        that = this;
    [].slice.call(childNodes).forEach((node) => {
      let text = node.textContent;
      let reg = /\{\{(.*)\}\}/;
      if (that.isElementNode(node)) {
        that.compileElement(node)
      } else if (that.isTextNode(node) && reg.test(text)) {
        that.compileText(node,RegExp.$1.trim())
      }
      if (node.childNodes && node.childNodes.length) {
        that.compileElement(node)
      }
    })
  },
  compile: function(node) {
    let nodeAttrs = node.attributes,
        that = this;
    [].slice.call(nodeAttrs).forEach(attr => {
      let attrName = attr.name;
      if (that.isDirective(attrName)) {
        let exp = attr.value;
        let dir = attrName.substring(2);
        if(that.isEventDirective(dir)) {
          compileUtil.eventHandler(node, that.$vm, exp, dir);
        } else {
          compileUtil[dir] && compileUtil[dir](node, that.$vm, exp)
        }
        node.removeAttribute(attrName);
      } 
    })
  },
  compileText: function(node, exp) {
    compileUtil.text(node, this.$vm, exp);
  },
  isDirective: function(attr) {
    return attr.indexOf('v-') === 0;
  },
  isEventDirective: function(dir) {
    return attr.indexOf('on') === 0;
  },
  isElementNode: function(node) {
    return node.nodeType == 1;
  },
  isTextNode: function(node) {
    return node.nodeType == 3;
  }
}

// 指令处理集合
var compileUtil = {
    text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },

    html: function(node, vm, exp) {
        this.bind(node, vm, exp, 'html');
    },

    model: function(node, vm, exp) {
        this.bind(node, vm, exp, 'model');

        var me = this,
            val = this._getVMVal(vm, exp);
        node.addEventListener('input', function(e) {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }

            me._setVMVal(vm, exp, newValue);
            val = newValue;
        });
    },

    class: function(node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    },

    bind: function(node, vm, exp, dir) {
        var updaterFn = updater[dir + 'Updater'];

        updaterFn && updaterFn(node, this._getVMVal(vm, exp));

        new Watcher(vm, exp, function(value, oldValue) {
            updaterFn && updaterFn(node, value, oldValue);
        });
    },

    // 事件处理
    eventHandler: function(node, vm, exp, dir) {
        var eventType = dir.split(':')[1],
            fn = vm.$options.methods && vm.$options.methods[exp];

        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },

    _getVMVal: function(vm, exp) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k) {
            val = val[k];
        });
        return val;
    },

    _setVMVal: function(vm, exp, value) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k, i) {
            // 非最后一个key，更新val的值
            if (i < exp.length - 1) {
                val = val[k];
            } else {
                val[k] = value;
            }
        });
    }
};


var updater = {
    textUpdater: function(node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },

    htmlUpdater: function(node, value) {
        node.innerHTML = typeof value == 'undefined' ? '' : value;
    },

    classUpdater: function(node, value, oldValue) {
        var className = node.className;
        className = className.replace(oldValue, '').replace(/\s$/, '');

        var space = className && String(value) ? ' ' : '';

        node.className = className + space + value;
    },

    modelUpdater: function(node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value;
    }
};