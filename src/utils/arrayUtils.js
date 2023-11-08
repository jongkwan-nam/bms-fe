export function remove(array, item) {
  let idx = array.indexOf(item);
  if (idx > -1) {
    array.splice(idx, 1);
  }
}

export function add(array, item) {
  let idx = array.indexOf(item);
  if (idx < 0) {
    array.push(item);
  }
}

export function toggle(array, item, force) {
  let idx = array.indexOf(item);
  if (force) {
    add(array, item);
  } else {
    remove(array, item);
  }
}
