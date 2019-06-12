let uid = 0;

function vNode(tag, props, children) {
  return {
    tag,
    props: {
      ...props,
      'uid': uid++
    },
    chilren: children.map(child => {
      if(typeof child === 'string') {
        return {
          tag: 'textNode',
          props: {'uid': uid++},
          children: [],
          text: child
        }
      }
      return child;
    })
  }
}

function isSameVnode(vNode1, vNode2) {
  return vNode1.props.uid === vNode2.props.uid;
}

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

function mount($parent, vNode) {
  return $parent.appendChild(render(vNode))
}

function createKey2Index(children, begin, end) {
  let index,key,child;
  let map = {};
  for(i = begin; i<end; i++) {
    child = children[i];
    if(child!=null) {
      key = child.props.uid;
      if(key !== undefined) {
        map[key] = i
      }
    }
  }
  return map;
}

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

function isEventProp(name) {
  return /^on/.test(name);
}

function getEvent(name) {
  return name.slice(2).toLowerCase();
}

function removeProp($dom, key, value) {
  if (key === 'classname') {
    return $dom.removeAttribute('class');
  } else if (isEventProp(key)) {
    return $dom.removeEventListener(getEvent(key), value);
  } else if (typeof value === 'boolean') {
    $dom.removeAttribute(key);
    $dom.key = false;
  } else {
    $dom.removeAttribute(key);
  }
}

function setProp($dom, key, value) {
  if (key === 'classname') {
    return $dom.setAttribute('class');
  } else if (isEventProp(key)) {
    return $dom.addEventListener(getEvent(key), value)
  } else if (typeof value === 'boolean') {
    $dom.setAttribute(key, value);
    return $dom.key = value;
  } else {
    return $dom.setAttribute(key, value);
  }
}


// 测试

const app = document.getElementById('app')

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

const newVnode = {
  tag : 'div',
  props,
  children: [{
    tag : 'span',
    props: {
      class: 'new-node',
    },
    children: ['new-node']
  }, {
    tag: 'span',
    props,
    children: ['next-node'],
  }]
}

mount(app, oldVnode);

updateDom(app, oldVnode, newVnode)