/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) return "";
  if (!size) return string;

  let result = "";
  let count = 1;
  let previousChar = "";

  for (const char of string) {
    if (char === previousChar) {
      if (count < size) {
        result += char;
        count++;
      }
    } else {
      result += char;
      previousChar = char;
      count = 1;
    }
  }
  return result;
}
