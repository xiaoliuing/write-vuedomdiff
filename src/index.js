import { h, mount, patch } from './vnode';

const root = document.getElementById('root');
// const vNode = h(
//   'div',
//   { style: { color: 'red' }, key: 'div1' },
//   'hello',
//   h('h1', { style: {color: 'blue'} }, h('h2', { style:{ background: 'blue' } }, 'hello'))
// )

// const oldVnode = h('ul', { id: 'container' },
//     h('li', { style: { backgroundColor: '#110000' }, key: 'A' }, 'A'),
//     h('li', { style: { backgroundColor: '#440000' }, key: 'B' }, 'B'),
//     h('li', { style: { backgroundColor: '#770000' }, key: 'C' }, 'C'),
//     h('li', { style: { backgroundColor: '#AA0000' }, key: 'D' }, 'D'),
// );
// const newVnode = h('ul', { id: 'container' },
//     h('li', { style: { backgroundColor: '#110000' }, key: 'A' }, 'A1'),
//     h('li', { style: { backgroundColor: '#440000' }, key: 'B' }, 'B1'),
//     h('li', { style: { backgroundColor: '#770000' }, key: 'C' }, 'C1'),
//     h('li', { style: { backgroundColor: '#AA0000' }, key: 'D' }, 'D1'),
//     h('li', { style: { backgroundColor: '#AA0000' }, key: 'E' }, 'E1'),
//     h('li', { style: { backgroundColor: '#AA0000' }, key: 'F' }, 'F1'),
// );

// const oldVnode = h('ul', { id: 'container' },
//     h('li', { style: { backgroundColor: '#110000' } }, 'A'),
//     h('li', { style: { backgroundColor: '#440000' } }, 'B'),
//     h('li', { style: { backgroundColor: '#770000' } }, 'C'),
//     h('li', { style: { backgroundColor: '#AA0000' } }, 'D'),
// );
// const newVnode = h('ul', { id: 'container' },
//     h('li', { style: { backgroundColor: '#110000' } }, 'A1'),
//     h('li', { style: { backgroundColor: '#440000' } }, 'B1'),
//     h('li', { style: { backgroundColor: '#770000' } }, 'C1'),
//     h('li', { style: { backgroundColor: '#AA0000' } }, 'D1'),
// );

 const oldVnode = h('ul', { id: 'container' },
    h('li', { style: { backgroundColor: '#110000' }, key: 'A' }, 'A'),
    h('li', { style: { backgroundColor: '#440000' }, key: 'B' }, 'B'),
    h('li', { style: { backgroundColor: '#770000' }, key: 'C' }, 'C'),
    h('li', { style: { backgroundColor: '#AA0000' }, key: 'D' }, 'D'),
);
const newVnode = h('ul', { id: 'container' },
    h('li', { style: { backgroundColor: '#AA0000' }, key: 'E' }, 'E'),
    h('li', { style: { backgroundColor: '#440000' }, key: 'B' }, 'B1'),
    h('li', { style: { backgroundColor: '#110000' }, key: 'A' }, 'A1'),
    h('li', { style: { backgroundColor: '#AA0000' }, key: 'D' }, 'D1'),
    h('li', { style: { backgroundColor: '#770000' }, key: 'F' }, 'F'),
);

mount(oldVnode, root);
setTimeout(() => {
  console.log(oldVnode, newVnode);
  patch(oldVnode, newVnode);
}, 3000)
