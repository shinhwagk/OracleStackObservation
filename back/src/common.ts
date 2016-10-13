export function flatten(array: any[]) {
  return [].concat.apply([], array)
}