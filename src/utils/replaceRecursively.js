// @flow

/**
 * in objects, replaces "token" by "code" in all string values, recursively
 * 
 * @param {*} object 
 * @param {*} token 
 * @param {*} code 
 */
function replaceRecursively(object: mixed, token: string, code: string): {} {
  if (object == null) return {};
  Object.keys(object).forEach(key => {
    if (typeof object[key] === 'string') return object[key] = object[key].replace(token, code); 
    if (Object.prototype.toString.call(object[key])) return replaceRecursively(object[key], token, code); 
  });
  return object;
}
module.exports = replaceRecursively;