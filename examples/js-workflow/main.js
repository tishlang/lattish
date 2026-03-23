/**
 * Lattish from vanilla JS — no Tish compiler required.
 * Uses h(tag, props, children) for elements; useState, createRoot from lattish.
 */
import { useState, createRoot, h } from 'lattish';

function App() {
  const [count, setCount] = useState(0);
  return h('div', null, [
    h('p', null, [`Count: ${count}`]),
    h('button', {
      onClick: () => setCount(count + 1),
    }, ['Increment']),
  ]);
}

createRoot(document.getElementById('root')).render(App);
