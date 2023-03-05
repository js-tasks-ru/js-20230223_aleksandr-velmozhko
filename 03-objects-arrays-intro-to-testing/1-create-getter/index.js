/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function (obj) {
    const pathArray = path.split(".");
    return pathArray.reduce((acc, currentValue) => acc?.[currentValue], obj);
  };
}
