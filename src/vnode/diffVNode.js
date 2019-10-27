import { createNewDomElement, updateDomProperties, oldSameNewNode, oldKeyMapIndex } from "./utils";


function updateChildrenNode(parentElement, newChildren, oldChildren) {
  // 新、老的开始索引和开始节点
  let oldStartIndex = 0, oldStartVNode = oldChildren[0];
  let newStartIndex = 0, newStartVNode = newChildren[0];
  // 新、老的结束索引和结束节点
  let oldEndIndex = oldChildren.length - 1, oldEndVNode = oldChildren[oldEndIndex];
  let newEndIndex = newChildren.length - 1, newEndVNode = newChildren[newEndIndex];
  const oldKeyIndexMap = oldKeyMapIndex(oldChildren);
  
  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    debugger
    if(!oldEndVNode) {
      oldEndVNode = oldChildren[--oldEndIndex];  // 该索引处节点被移动了，改为上一个索引节点
    }else if(!oldStartVNode){
      oldStartVNode = oldChildren[++oldStartIndex]; // 该索引处节点被移动了，改为下一个索引节点
    }else if (oldSameNewNode(oldStartVNode, newStartVNode)) { // 新、老儿子对列，头节点和头节点比较
      patch(oldStartVNode, newStartVNode);
      oldStartVNode = oldChildren[++oldStartIndex];
      newStartVNode = newChildren[++newStartIndex];
    } else if(oldSameNewNode(oldEndVNode, newEndVNode)){ // 新、老儿子对列，尾节点和尾节点比较
      patch(oldEndVNode, newEndVNode);
      oldEndVNode = oldChildren[--oldEndIndex];
      newEndVNode = newChildren[--newEndIndex];
    } else if(oldSameNewNode(oldStartVNode, newEndVNode)) { // 新的儿子对列尾节点，与老的儿子对列头节点比较
      patch(oldStartVNode, newEndVNode);
      parentElement.insertBefore(oldStartVNode.domElement, oldEndVNode.domElement.nextSibling);
      oldStartVNode = oldChildren[++oldStartIndex];
      newEndVNode = newChildren[--newEndIndex];
    } else if (oldSameNewNode(oldEndVNode, newStartVNode)) {// 新的儿子对列头节点，与老的儿子对列尾节点比较
      patch(oldEndVNode, newStartVNode);
      parentElement.insertBefore(oldEndVNode.domElement, oldStartVNode.domElement);
      oldEndVNode = oldChildren[--oldEndIndex];
      newStartVNode = newChildren[++newStartIndex];
    } else {
      // 判断新的Vnode的key是否存在老的Vnode的兄弟节点上
      let newVnodekeyInOld = oldKeyIndexMap[newStartVNode.key];
      if(newVnodekeyInOld == undefined) { // key不存在，直接将该Vnode更新为真实的dom
        parentElement.insertBefore(createNewDomElement(newStartVNode), oldStartVNode.domElement);
      } else { // key存在
        let needToMoveOldVnode = oldChildren[newVnodekeyInOld];
        if(needToMoveOldVnode.tag !== newStartVNode.tag){ // key同，类型不同，视为新节点，需插入
          parentElement.insertBefore(createNewDomElement(newStartVNode), oldStartVNode.domElement);
        } else { // key同，类型同，视为相同节点，先diff该节点和其儿子节点，在移动该节点，最后将该索引位置置为undefined
          patch(needToMoveOldVnode, newStartVNode);
          oldChildren[newVnodekeyInOld] = undefined;
          parentElement.insertBefore(needToMoveOldVnode.domElement, oldStartVNode.domElement);
        }
      }
      newStartVNode = newChildren[++newStartIndex];
    }
  }

  // 循环结束。
  if (oldStartIndex >= oldEndIndex) { // 老的儿子队列处理完了，新的还没有, 则添加
    // 若 newEndIndex+1 的节点存在的话，说明该节点已经被更新为了真实dom（因为尾索引前移了），把其他的兄弟节点按顺序插到该节点前面就ok了
    // 若不存在，则说明最后节点和索引从定义开始就没改变过，值为null则插入到父节点下，兄弟节点的末尾
    let beforeDOMElement = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].domElement;
      for (let i = newStartIndex; i <= newEndIndex; i++) {
        parentElement.insertBefore(createNewDomElement(newChildren[i]), beforeDOMElement);
      }
  }
  if(newStartIndex >= newEndIndex) { //新的儿子队列处理完了，老的还没有, 则删除
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      parentElement.removeChild(oldChildren[i].domElement);
    }
  }
}




function patch(oldVNode, newVNode) {
  // 1、节点类型不一样, 直接重建（替换节点）
  if(oldVNode.tag !== newVNode.tag) {
    return oldVNode.domElement.parentNode.replaceChild(createNewDomElement(newVNode), oldVNode.domElement);
  }
  // 2、判断是否为文本节点,直接更新
  if(typeof newVNode.text !== 'undefined') {
    return oldVNode.domElement.textContent = newVNode.text;
  }
  // 3、节点类型相同, 只需要更新真实dom（oldVNode.domElement）元素上的属性，和children Dom
  // 3.1、先比较属性
  let domElement = newVNode.domElement = oldVNode.domElement;
  updateDomProperties(newVNode, oldVNode.props);
  // 3.2、比较更新children节点
  // 三种情况：a、新的、旧的均有儿子
  //          b、新的有，旧的没有
  //          c、新的没有，旧的有
  let newChildren = newVNode.children;
  let oldChildren = oldVNode.children;
  let newCLen = newChildren.length;
  let oldCLen = oldChildren.length;
  if(newCLen > 0 && oldCLen > 0) { //3.2-a (最复杂的情况)
    updateChildrenNode(domElement, newChildren, oldChildren);
  }else if(newCLen > 0) { // 3.2-b
    for(let newChild in newChildren) {
      domElement.appendChild(createNewDomElement(newChild));
    }
  } else if(oldCLen > 0) { // 3.2-c
    domElement.innerHTML = '';
  }
}

export default patch;