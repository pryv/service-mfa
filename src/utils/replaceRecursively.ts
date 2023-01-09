/**
 * @license
 * Copyright (C) 2019–2022 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
/**
 * in objects, replaces "search" by "replace" in all string values, recursively
 * 
 * @param {*} object 
 * @param {*} search 
 * @param {*} replace 
 */
function replaceRecursively(object: unknown, search: string, replace: string): {} {
  if (object == null) return {};
  Object.keys(object).forEach(key => {
    if (typeof object[key] === 'string') return object[key] = object[key].replace(search, replace); 
    if (Object.prototype.toString.call(object[key])) return replaceRecursively(object[key], search, replace); 
  });
  return object;
}
module.exports = replaceRecursively;