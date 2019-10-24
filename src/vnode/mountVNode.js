import { createNewDomElement } from './utils';

export default function(vNode, container) {
  let newDomElement = createNewDomElement(vNode);
  container.appendChild(newDomElement)
}