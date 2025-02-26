/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
function replaceAll (text, search, replace) {
  return text.split(search).join(replace);
}
module.exports = replaceAll;
