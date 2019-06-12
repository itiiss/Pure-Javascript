## Virtual dom的简易实现

Virtual Dom是javascript对象，通过render方法映射成为真正的dom。

当Virtual Dom发生变化，会产生新的Virtual Dom，可以通过diff算法比较新旧两个Virtual Dom，用尽量少的Dom操作来更新真实的Dom。

用公式表示Dom和VirtualDom的关系如下

```
Dom = Render(VirtualDom)
Dom = updateDom(oldVirtualDom, newVirtualDom)
```

一个VirtualDom和Dom转化的例子：



```js
const oldVnode = {
  tag : 'div',
  props,
  children: [{
    tag : 'span',
    props: {
      class: 'old-node',
    },
    children: ['old-node']
  }, {
    tag: 'input',
    props: {
      disabled: true
    },
    children: [],
  }]
}
```

Dom

```html
<div>
    <span className="old-node">old-node</span>
    <input disabled={true} />
</div>
```

### Virtual Dom 转换成 Dom

需要分别处理VirtualDom的各个字段，对于VritualDom里的子解构，需要递归转换

```Js
function render(vNode) {
  let $dom;
  if(vNode.tag === 'textNode') {
    $dom = document.createTextNode(vNode.text)
  } else {
    $dom = document.createElement(vNode.tag);
  }
  if(vNode.props) {
    Object.keys(vNode.props).forEach(key => {
      if(vNode.tag !== 'textNode') [
        setProp($dom, key, vNode.props[key])
      ]
    })
  }
  if(vNode.children) {
    vNode.children.forEach(child => {
      const childDom = render(childDom);
      $dom.appendChild(childDom)
    })
  }
  vNode.$el = $dom;
  return $dom;
}

function mount($dom, vdom) {
    return $dom.appendChild(render(vdom))
}
```



### diff算法

#### 先比较根结点的各个字段

```js
function isPropsChanged(oldProps, newProps) {
  if(typeof oldProps !== typeof newProps) {
    return true;
  }
  const oldKeys = Object.keys(oldProps);
  const newkeys = Object.keys(newProps)
  if (oldKeys.length !== newkeys.length) {
    return true;
  }
  for(let i = 0;i < oldKeys; i++) {
    if(oldProps[oldKeys[i]] !== newProps[newkeys[i]]){
      return true;
    }
  }
  return false;
}

function isNodeChanged(oldVnode, newVnode) {
  if(typeof oldVnode !== typeof newVnode) {
    return true
  } else {
    return oldVnode.tag !== newVnode.tag || oldVnode.text !== newVnode.text
  }
}
```

#### 如果根节点完全相同，在递归比较子节点

采用双向遍历的方式提高速度

```js
function updateDom($parent, oldVnode, newVnode) {
  if(!oldVnode) {
    return $parent.appendChild(render(newVnode))
  }
  if(!newVnode) {
    return $parent.removeChild(oldVnode.$el)
  }
  if(oldVnode.tag === newVnode.tag && oldVnode.text === newVnode.tag) {
    return
  }

  const oldProps = oldVnode.props;
  const newProps = newVnode.props;
  if(isPropsChanged(oldProps, newProps)) {
    const oldKeys = Object.keys(oldProps);
    const newkeys = Object.keys(newProps);
    const allKeys = new Set([...oldKeys, ...newkeys]);
    allKeys.forEach(key => {
      if(!newkeys[key]) {
        return removeProp(oldVnode.$el, key, oldProps[key])
      }
      if(newProps[key] !== oldProps[key] && oldVnode.tag !== 'textNode') {
        return setProp(oldVnode.$el, key, oldProps[key])
      }
    })
  }

  //递归对比子节点
  if(
    (oldVnode.children && oldVnode.children.length) ||
    (newVnode.children && newVnode.children.length)
  ) {
    let oldStartIndex = 0;
    let oldEndIndex = oldVnode.children.length - 1;
    let oldStartNode = oldVnode.children[oldStartIndex];
    let oldEndNode = oldVnode.children[oldEndIndex];

    let newStartIndex = 0;
    let newEndIndex = newVnode.children.length - 1;
    let newStartNode = newVnode.children[newStartIndex];
    let newEndNode = newVnode.children[newEndIndex]

    while(oldEndIndex <= oldEndIndex && newStartIndex <newEndIndex) {
      if(!oldStartNode) {
        oldStartNode = oldVnode.children[++oldStartIndex]
      } else if (!oldEndNode) {
        oldEndNode = oldEndNode.children[--oldEndIndex]
      } else if (!newStartNode) {
        newStartNode = newVnode.children[++newStartIndex]
      } else if (!newEndNode) {
        oldEndNode = oldVnode.children[--oldEndIndex];
      } else if (isSameVnode(oldStartNode, newStartNode)) {
        // 如果两个头节点仍然相同，递归更新其子节点，然后继续向后遍历
        updateDom(oldVnode.$el, oldStartNode, newStartNode);
        oldStartNode = oldVnode.children[++oldStartIndex];
        newStartNode = newVnode.children[++newStartIndex];
      } else if (isSameVnode (oldEndNode, newEndNode)) {
        //双向遍历，原理同上
        updateDom(oldVnode.$el, oldEndNode, newEndNode);
        oldEndNode = oldVnode.children[--oldEndIndex];
        newEndIndex = newVnode.children[--newEndIndex];
      } else {
        let oldKey2Index = createKey2Index(oldVnode.children, oldStartIndex, oldEndIndex);
        let indexInOld = oldKey2Index[newStartNode.props.uid]
        if (indexInOld === undefined) {
          //需要新增一个节点
          oldVnode.$el.insertBefore( render(newStartNode), oldStartNode.$el);
          newStartNode = newVnode.children[++newStartIndex];
        } else {
          // 需用移动原来的dom
          let element = oldVnode.children[indexInOld];
          updateDom(oldVnode.$el, element, newStartNode);
          //  将旧节点设置为undefiend，避免重复遍历
          oldVnode.children[indexInOld] = undefined;
          oldVnode.$el.insertBefore(element.$el, oldStartNode.$el);
          newStartNode = newStartNode[++newStartIndex]
        }
      }
      // 类似于归并排序
      if (oldStartIndex > oldEndIndex) {
        //old节点已经遍历完，将剩余的新节点全部加上
        for(let i = newStartIndex; i<= newEndIndex; i++) {
          if(newVnode.children[i]) {
            oldVnode.$el.insertBefore(render(newVnode.children[i]), newVnode.children[newEndIndex +1].$el || null)
          }
        }
      } else if (newStartIndex > newEndIndex) {
        // new节点组先遍历完，删除旧的多余的节点
        for(let i = oldStartIndex; i <= oldEndIndex; i++) {
          if (oldVnode.children[i]) {
            oldVnode.$el.removeChild(oldVnode.children[i].$el)
          }
        }
      }
    }
  }

}
```

### todos：

提高dom的复用性，通过移动dom的方式避免一下情况的五个li的全部重新渲染

```js
<!-- old -->
<ul>
    <li>1</li>
    <li>2</li>
    <li>3</li>
    <li>4</li>
    <li>5</li>
</ul>
<!-- new -->
<ul>
    <li>5</li>
    <li>1</li>
    <li>2</li>
    <li>3</li>
    <li>4</li>
</ul>
```

