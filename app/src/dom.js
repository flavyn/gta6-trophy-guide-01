// A very small element builder. Views describe their markup as data; nothing is ever parsed from HTML
// strings, so trophy text (which carries asterisks and curly quotes) can never break the layout.

export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key === 'on') for (const [name, fn] of Object.entries(value)) node.addEventListener(name, fn);
    else if (key === 'style') Object.assign(node.style, value);
    else if (key === 'attrs') for (const [name, v] of Object.entries(value)) node.setAttribute(name, v);
    else node.setAttribute(key, value === true ? '' : String(value));
  }
  append(node, children);
  return node;
}

function append(node, children) {
  for (const child of children.flat(4)) {
    if (child === null || child === undefined || child === false) continue;
    node.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export function group(tag, props, children) {
  return el(tag, props, ...children);
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export function paint(node, ...children) {
  clear(node);
  append(node, children);
  return node;
}

export function countLabel(n) {
  return new Intl.NumberFormat('en-US').format(n);
}

export function percent(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export function plural(n, one, many = one + 's') {
  return n === 1 ? one : many;
}
