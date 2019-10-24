const VIRTUAL_NODE = 'VIRTUAL_NODE';

// 更新dom的属性
const updateDomProperties = function(vNode, oldProps={}) {
  const { props, domElement } = vNode;

  let oldStytle = oldProps.style || {};
  let newStyle = props.style;

  // 更新样式
  // 老有新无，要删除；老无新有，要添加
  for(let oldStyoleAttr in oldStytle) {
    if(!newStyle[oldStyoleAttr]) {
      domElement.style[oldStyoleAttr] = '';
    }
  }

  // 更新属性
  //删除新中没有老的属性
  for(let oldPropName in oldProps) {
    if(!props[oldPropName]) {
      delete domElement[oldPropName];
    }
  }

  // 把新属性添加和更新到真实dom上
  for(let newPropName in props) {
    if(newPropName === 'style') {
      let newStyleObj = newPropName.style;
      for(let newStyleName in newStyleObj) {
        domElement.style[newStyleName] = newStyleObj[newStyleName];
      }
    } else {
      domElement[newPropName] = props[newPropName];
    }
  }
}

const createNewDomElement = function(vNode) {
  const { tag, children } = vNode;
  // 判断是否是文本节点
  if (tag) {
    // 创建真实的dom
    let domElement = vNode.domElement = document.createElement(tag);
    updateDomProperties(vNode);
    if(Array.isArray(children)) {
      children.map(child => domElement.appendChild(createNewDomElement(child)));
    }
  } else {
    vNode.domElement = document.createTextNode(vNode.text);
  }
  return vNode.domElement;
}

const oldSameNewNode = function(oldVnode, newVnode) {
  return oldVnode.key === newVnode.key && oldVnode.tag === newVnode.tag;
}

// 得到老Vnode的儿子的存在key值，value为当前key值得索引
const oldKeyMapIndex = function(oldChildren) {
  const map = {}, len = oldChildren.length;
  for (let i = 0; i < len; i++) {
    let key = oldChildren[i].key;
    if(key) {
      map[key] = i;
    }
  }
  return map;
}

export {
  VIRTUAL_NODE,
  updateDomProperties,
  createNewDomElement,
  oldSameNewNode,
  oldKeyMapIndex
}