import { createVDom, render, patch } from './vnode';

const root = document.getElementById('root');
const vNode = createVDom(
  'div',
   { style: { color: 'red' }, id: 'wrap'},
   createVDom('h1', {}, 'Virtual'),
   'Dom'
)
render(vNode, root);

// const oldVnode = createVDom('ul', { id: 'container' },
//     createVDom('li', { style: { backgroundColor: '#110000' }, key: 'A' }, 'A'),
//     createVDom('li', { style: { backgroundColor: '#440000' }, key: 'B' }, 'B'),
//     createVDom('li', { style: { backgroundColor: '#770000' }, key: 'C' }, 'C'),
//     createVDom('li', { style: { backgroundColor: '#AA0000' }, key: 'D' }, 'D'),
// );
// const newVnode = createVDom('ul', { id: 'container' },
//     createVDom('li', { style: { backgroundColor: '#110000' }, key: 'A' }, 'A1'),
//     createVDom('li', { style: { backgroundColor: '#440000' }, key: 'B' }, 'B1'),
//     createVDom('li', { style: { backgroundColor: '#770000' }, key: 'C' }, 'C1'),
//     createVDom('li', { style: { backgroundColor: '#AA0000' }, key: 'D' }, 'D1'),
//     createVDom('li', { style: { backgroundColor: '#AA0000' }, key: 'E' }, 'E1'),
//     createVDom('li', { style: { backgroundColor: '#AA0000' }, key: 'F' }, 'F1'),
// );

// const oldVnode = createVDom('ul', { id: 'container' },
//     createVDom('li', { style: { backgroundColor: '#110000' } }, 'A'),
//     createVDom('li', { style: { backgroundColor: '#440000' } }, 'B'),
//     createVDom('li', { style: { backgroundColor: '#770000' } }, 'C'),
//     createVDom('li', { style: { backgroundColor: '#AA0000' } }, 'D'),
// );
// const newVnode = createVDom('ul', { id: 'container' },
//     createVDom('li', { style: { backgroundColor: '#110000' } }, 'A1'),
//     createVDom('li', { style: { backgroundColor: '#440000' } }, 'B1'),
//     createVDom('li', { style: { backgroundColor: '#770000' } }, 'C1'),
//     createVDom('li', { style: { backgroundColor: '#AA0000' } }, 'D1'),
// );

 const oldVnode = createVDom('ul', { id: 'container' },
    createVDom('li', { style: { backgroundColor: '#110000' }, key: 'A' }, 'A'),
    createVDom('li', { style: { backgroundColor: '#440000' }, key: 'B' }, 'B'),
    createVDom('li', { style: { backgroundColor: '#770000' }, key: 'C' }, 'C'),
    createVDom('li', { style: { backgroundColor: '#AA0000' }, key: 'D' }, 'D'),
);
const newVnode = createVDom('ul', { id: 'container' },
    createVDom('li', { style: { backgroundColor: '#AA0000' }, key: 'E' }, 'E'),
    createVDom('li', { style: { backgroundColor: '#440000' }, key: 'B' }, 'B1'),
    createVDom('li', { style: { backgroundColor: '#110000' }, key: 'A' }, 'A1'),
    createVDom('li', { style: { backgroundColor: '#AA0000' }, key: 'D' }, 'D1'),
    createVDom('li', { style: { backgroundColor: '#770000' }, key: 'F' }, 'F'),
);
render(oldVnode, root);
setTimeout(() => {
  console.log(oldVnode, newVnode);
  patch(oldVnode, newVnode);
}, 3000)
