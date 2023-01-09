/**
 * @license
 * Copyright (C) 2019–2022 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
/**
 * Replaces all occurences of "search" with "replace" in "text"
 * 
 * This implementation is known to be slow, use regexp or future native .replaceAll instead
 * 
 * @param {*} text 
 * @param {*} search 
 * @param {*} replace 
 */
function replaceAll(text: string, search: string, replace: string): string {
  return text.split(search).join(replace);
}
module.exports = replaceAll;