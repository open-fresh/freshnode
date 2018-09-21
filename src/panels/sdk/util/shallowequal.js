export function shallowequal(a, b) {
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  const keys = Object.keys(a);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}
