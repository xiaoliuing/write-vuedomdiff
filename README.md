# 实现一个简单的vue 虚拟Dom Diff

`Virtual  Dom`，就是一个js对象，具体点就是一个使用**javascript**模拟了**DOM结构**的树形结构对象，这个树结构包含整个`DOM`结构的信息。

真实`dom`的开销是很大的，在我们改变页面的某个元素的状态时，浏览器会重新绘制整个`render Dom tree`，比如用js同时改变十处节点的状态时，浏览器就会有十次的重绘操作，效率是非常低下的。而`virtual Dom`不会重新构建整个`dom tree`，它只会去更新改变的节点。大体就是在`Vdom`挂载到页面后，会将真实的`dom`存放在`old virtual dom`的一个属性中，这样在`newVnode`与`oldVnode Diff`（打补丁）时，若发生了改变，就只去更新当前`vNode`的`Dom`的状态，而不是重新去构建整个`Dom Tree`，这样大大提高了性能。

该篇文章只是简单手写一个vue的dom diff，跟源码不太一样，基本思想差不多[源码链接](https://github.com/vuejs/vue/tree/dev/src/core/vdom)。

## 构建虚拟dom

源码很复杂，这里就简单的给构建方法传三个参数：节点类型，配置属性，内容

举个例子，下面我们要构建一个简单的`dom`

```html
<div id="wrap" style="color: red">
    <h1>Virtual</h1>
    Dom
</div>
```

可以分解为

```javascript
{
    tag: 'div',
    config: {
       id: 'wrap',
       style: {color: 'red'}
    },
    children: [
        {
            tag: 'h1',
            config: {},
            children: ['Virtual']
        },
        'Dom'
    ]
}
```

然后通过调用`createVDom`来创建`Vnode`（虚拟Dom节点），具体解释可以看看如下代码:

```javascript
const hasOwnProperty = Object.prototype.hasOwnProperty;
function createVDom(tag, config, ...children) {
  let props = {};  // 存放dom属性
  let key;
  if(config) { // 保存节点的key
    if(config.key) {
      key = config.key;
    }
  }

  for(let prop in config) { // 遍历config，将属性存放在props对象中
    if (hasOwnProperty.call(config, prop) && prop !== 'key') {
      props[prop] = config[prop];
    }
  }
  
  // 调用createVNode创建Vnode的树结构对象，并返回
  return createVNode(tag, key, props, children.map((child, index) => (
    typeof child ==='number' || typeof child === 'string' ? createVNode(
      undefined, undefined, undefined, undefined, child
    ) : child
  )))
}

function createVNode (tag, key, props={}, children, text, domElement) {
  // 创建基本的Vnode的对象结构
  return {
    _tag: VIRTUAL_NODE, tag, key, props, children, text, domElement
  }
}
```

用户通过调用上述默认导出的方法（命名为`createVDom`），就能创建`Vnode`

```javascript
const vNode = createVDom(
   'div',
   { style: { color: 'red' }, id: 'wrap'},
   createVDom('h1', {}, ''}, 'Virtual')),
   'Dom'
)
```

具体结构如下

<img src="https://www.xiaoliua.com/images/vue/vnode_tree.png" width="500" align=center />

## 挂载Vnode

### 创建一个`render`方法，用来将`Vnode`渲染到页面上

```javascript
function render(vNode, container) {
  let newDomElement = createNewDomElement(vNode);
  container.appendChild(newDomElement)
}
```

### 再创建两个方法（后面diff会用到，所以要抽出来，单独声明）

* `createNewDomElement` 用来创建`dom`，分两种情况
  * 文本节点，出字符串或数字
  * 普通`html`标签节点（若该节点存在儿子节点，则接着递归遍历`children`创建）
* `updateDomProperties` 用来更新`dom`的属性（新、老节点比较），后面diff会用到，先说明一下：
  * 首先更新样式（首次创建的直接略过）
    * 老有新无，要删除老的
    * 老无新有，要添加新的
  * 删除新中没有老的属性
  * 将配置属性添加到`dom` 上

```javascript
// 更新dom的属性
// oldProps设默认值是因为首次没有oldVnode
const updateDomProperties = function(vNode, oldProps={}) {
  const { props, domElement } = vNode;
  let oldStytle = oldProps.style || {};
  let newStyle = props.style;
  // 更新样式
  // 老有新无，要删除；老无新有，要添加
  for(let oldStyleAttr in oldStytle) {
    if(!newStyle[oldStyleAttr]) {
      domElement.style[oldStyleAttr] = '';
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
      let newStyleObj = props.style;
      for(let newStyleName in newStyleObj) {
        domElement.style[newStyleName] = newStyleObj[newStyleName];
      }
    } else {
      domElement[newPropName] = props[newPropName];
    }
  }
}

const createNewDomElement = function(vNode) { // 创建real dom
  const { tag, children } = vNode;
  // 判断是否是文本节点
  if (tag) {
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
```

### 调用render方法生成real dom（真实dom）

```javascript
const root = document.getElementById('root');
render(vNode, root);
```

挂载后结果，如下图

<img src="https://www.xiaoliua.com/images/vue/vnode_dom.png" width="500" align=center />


## diff算法
采用的的同级比较，不会跨级，用到算法是深度优先遍历，具体看看图：

<img src="https://www.xiaoliua.com/images/vue/vnode_diff.png" width="600" align=center />

和源码不同的是，我是自己调用`patch`方法进行下面的操作的，不是组件`data`状态发生改变而引起的`diff`，重点在算法上，这点就不纠结了。

首先，需要手动去触发`patch`方法

```javascript
patch(oldVnode, newVnode);
```

### 实现patch方法

patch方法接收俩参数，老的节点（`oldVNode`）和新的节点（`newVNode`），当然，这两个节点是位置对应的。

patch时分两种情况：

* 节点类型不一样，直接重建替换`oldVNode`
* 节点类型一样
  * 判断类型是否为文本节点（类型都为`undefined`， 所以会判断类型相同）
  * 节点类型存在且相同, 只需要更新真实dom元素上的属性，和children
    * 先比较属性是否更新，调用`updateDomProperties`方法
    * 比较`children`节点（三种情况）
      * a、新的节点没有，老的节点有，直接删除老的
      * b、新的节点有，老节点的没有，直接添加新的
      * c、新的节点、老的节点均有儿子，需要调用`updateChildrenNode`比较（**核心内容**）

代码实现：

```javascript
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
  let newChildren = newVNode.children;
  let oldChildren = oldVNode.children;
  let newCLen = newChildren.length;
  let oldCLen = oldChildren.length;
  if(newCLen > 0 && oldCLen > 0) { //(最复杂的情况)
    updateChildrenNode(domElement, newChildren, oldChildren);
  }else if(newCLen > 0) {
    for(let newChild in newChildren) {
      domElement.appendChild(createNewDomElement(newChild));
    }
  } else if(oldCLen > 0) {
    domElement.innerHTML = '';
  }
}
```

### 实现updateChildrenNode方法（核心）

1、首先定义`oldChildren`和`newChildren`的开始、结束节点和开始、结束索引

```javascript
// 新、老的开始索引和开始节点
let oldStartIndex = 0, oldStartVNode = oldChildren[0];
let newStartIndex = 0, newStartVNode = newChildren[0];
// 新、老的结束索引和结束节点
let oldEndIndex = oldChildren.length - 1, oldEndVNode = oldChildren[oldEndIndex];
let newEndIndex = newChildren.length - 1, newEndVNode = newChildren[newEndIndex];
```

2、接着循环比较新、老节点所有儿子节点，若儿子还有儿子，就接着patch，这就是深度优先遍历，先从上到下，再从左到右。儿子的儿子先不管，原理都一样，我们就看当前新、老节点所有儿子节点，就是儿子节点的所有兄弟节点。跳出循环的条件是`oldChildren`或者`newChildren`的开始索引大于结束索引:

```javascript
 while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
	......
 }
```

>循环结束后，又分两种情况
>
>- 老的儿子队列处理完了，新的还没有, 则添加到老的儿子队列中，并创建新的儿子节点的`real dom`
>- 新的儿子队列处理完了，老的还没有, 则删除老的节点
>
>```javascript
>// 循环结束。
>  if (oldStartIndex >= oldEndIndex) { // 老的儿子队列处理完了，新的还没有, 则添加
>    // 若 newEndIndex+1 的节点存在的话，说明该节点已经被更新为了真实dom（因为尾索引前移了），把其他的兄弟节点按顺序插到该节点前面就ok了
>    // 若不存在，则说明最后节点和索引从定义开始就没改变过，值为null则插入到父节点下，兄弟节点的末尾
>    let beforeDOMElement = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].domElement;
>      for (let i = newStartIndex; i <= newEndIndex; i++) {
>        parentElement.insertBefore(createNewDomElement(newChildren[i]), beforeDOMElement);
>      }
>  }
>
>
>  if(newStartIndex >= newEndIndex) { //新的儿子队列处理完了，老的还没有, 则删除
>    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
>      parentElement.removeChild(oldChildren[i].domElement);
>    }
>  }
>```

**节点比较分五种情况：**

> 判断的调用的`oldSameNewNode` 是判断两节点的类型`tag`和`key`是否都相同，相同则执行if里的操作
>
> 下面说到的`dom`节点均为`real  dom`节点

** ①、**新、老儿子对列，头节点和头节点类型相同

* `patch`新、老队列的开始节点
* 两队列的开始、结束索引和节点，都后移一位

<img src="https://www.xiaoliua.com/images/vue/type1.png" width="600" align=center />

具体代码实现

```javascript
if (oldSameNewNode(oldStartVNode, newStartVNode)) { // 新、老儿子对列，头节点和头节点比较
  patch(oldStartVNode, newStartVNode); // patch新老队列的开始节点
  oldStartVNode = oldChildren[++oldStartIndex];
  newStartVNode = newChildren[++newStartIndex];
}
```

** ②、**新、老儿子对列，尾节点和尾节点类型相同

* `patch`新、老队列的结束节点
* 两队列的开始、结束索引和节点，都前移移一位

<img src="https://www.xiaoliua.com/images/vue/type2.png" width="600" align=center />

具体代码实现

```javascript
if(oldSameNewNode(oldEndVNode, newEndVNode)){ // 新、老儿子对列，尾节点和尾节点比较
  patch(oldEndVNode, newEndVNode);
  oldEndVNode = oldChildren[--oldEndIndex];
  newEndVNode = newChildren[--newEndIndex];
}
```

** ③、**新的儿子对列结束节点，与老的儿子对列开始节点类型相同，

* `patch`老队列的开始节点、新的结束节点
* 将更新后的`dom`节点，插到老的队列结束`dom`节点的后面
* 老儿子队列的开始索引和开始节点后移一位，新儿子队列的开始索引和开始节点前移一位

<img src="https://www.xiaoliua.com/images/vue/type3.png" width="600" align=center />

具体代码实现

```javascript
if(oldSameNewNode(oldStartVNode, newEndVNode)) { // 新的儿子对列尾节点，与老的儿子对列头节点比较
  patch(oldStartVNode, newEndVNode);
  parentElement.insertBefore(oldStartVNode.domElement,oldEndVNode.domElement.nextSibling);
  oldStartVNode = oldChildren[++oldStartIndex];
  newEndVNode = newChildren[--newEndIndex];
}
```

** ④、**新的儿子对列开始节点，与老的儿子对列结束节点类型相同

* `patch`老队列的结束节点、新的开始节点
* 将更新后的`dom`节点，插到老的队列开始节点的前面
* 老儿子队列的开始索引和开始节点前移一位，新儿子队列的开始索引和开始节点后移一位。

<img src="https://www.xiaoliua.com/images/vue/type4.png" width="600" align=center />

具体代码实现

```javascript
if (oldSameNewNode(oldEndVNode, newStartVNode)) {// 新的儿子对列头节点，与老的儿子对列尾节点比较
  patch(oldEndVNode, newStartVNode);
  parentElement.insertBefore(oldEndVNode.domElement, oldStartVNode.domElement);
  oldEndVNode = oldChildren[--oldEndIndex];
  newStartVNode = newChildren[++newStartIndex];
}
```

** ⑤、**该种毫无规律可言，若前四种优化选择项均不满足，就要`key`值来处理节点的比较，首先需要取得老的儿子队列每个节点的`key`存到一个对象里，键为`key`，键值为索引。然后新的儿子队列从开始索引的节点，用key在老队列key组成的对象检索该key是否存在。

* `key`不存在，直接将该节点，插到老的儿子队列的开始节点的前面，并创建该`Vnode`的`real dom`
* `key`存在，就要判断`tag`类型是否相同
  * `tag`类型不同，视为新节点，直接创建该`Vnode`的`real dom`，并插入到老的儿子队列的开始节点的前面
  * `tag`类型也相同，就要`patch`这俩相同节点，然后用结合`key`值（索引）找到该节点在`oldChildren`的索引位置，然后将该节点的`dom`，移动到老的队列开始节点的前面，最后将节点置为`undefined`.

新的儿子队列，开始索引和开始节点后移一位。

具体代码实现

```javascript
else {
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
```

注意：因老的节点`dom`，发生了移动，移动前的`Vnode`被置为了`undefined`，所以需在这五种判断前再加两层判断

```javascript
if(!oldEndVNode) {
  oldEndVNode = oldChildren[--oldEndIndex];  // 该索引处节点被移动了，改为上一个索引节点
}else if(!oldStartVNode){
  oldStartVNode = oldChildren[++oldStartIndex]; // 该索引处节点被移动了，改为下一个索引节点
}
```

### 下面举个复杂的例子，熟悉一下整个过程

<img src="https://www.xiaoliua.com/images/vue/type5.png" width="600" align=center />

a、先前四种情况均不满足，则进行判断五，发现`key`也不存在，则将新`E`插到老`A`前，新的队列箭头后移（开始节点、索引后移）（1过程）

b、新`B`也满足判断五，则更新老`B`，并将老`B`插到老`A`之前，原老`B`置为`undefined`，新儿子队列箭头后移（2、3过程）

c、新`A`满足判断一，更新老`A`，两队列的开始索引和节点，都后移一位，此时新队列的开始箭头在新`D`，老队列的开始箭头在老`B`，而老`B`为`undefined`，开始箭头又移动到了老C上（4过程）

d、新`D`和b过程一样，更新`D`，插到老`C`之前，移动前老`D Vnode`置为`undefined`，新儿子队列箭头后移

e、新``F同a过程，将创建`F`的`real dom`，插到老`C`前，新队列箭头后移，`while`循环结束（7）

f、删除老`C`

### 总结

一个简单的dom diff就实现了，可能讲的不太明白，可以看看[vue源码的实现](https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js)。
