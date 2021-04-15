// @flow

/**
 * Replaces all occurences of "search" with "replace" in "text"
 * 
 * @param {*} text 
 * @param {*} search 
 * @param {*} replace 
 */
function replaceAll (text: string, search: string, replace: string): string {
  return text.split(search).join(replace);
}
module.exports = replaceAll;