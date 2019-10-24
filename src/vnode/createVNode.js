import { V_NODE } from './utils';
const hasOwnProperty = Object.prototype.hasOwnProperty;
export default function(tag, config, ...children) {
  let props = {};  // 存放dom属性
  let key;
  if(config) {
    if(config.key) {
      key = config.key;
    }
  }

  for(let prop in config) {
    if (hasOwnProperty.call(config, prop) && prop !== 'key') {
      props[prop] = config[prop];
    }
  }

  return createVNode(tag, key, props, children.map((child, index) => (
    typeof child ==='number' || typeof child === 'string' ? createVNode(
      undefined, undefined, undefined, undefined, child
    ) : child
  )))
}

function createVNode (tag, key, props={}, children, text, domElement) {
  return {
    _tag: V_NODE, tag, key, props, children, text, domElement
  }
}