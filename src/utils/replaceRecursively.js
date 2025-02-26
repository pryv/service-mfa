/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
function replaceRecursively (object, search, replace) {
  if (object == null) return {};
  Object.keys(object).forEach((key) => {
    if (typeof object[key] === 'string') { return (object[key] = object[key].replace(search, replace)); }
    if (Object.prototype.toString.call(object[key])) { return replaceRecursively(object[key], search, replace); }
  });
  return object;
}
module.exports = replaceRecursively;
