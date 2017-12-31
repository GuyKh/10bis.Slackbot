export function deepCopy (o : Object) {
  return JSON.parse(JSON.stringify( o ));
}