/**
   * helper functions ..
   * @param str1 ..
   * @param str2 ..
   * @returns string
   */
export const levenshtein = function (str1: string, str2: string) {
  const current = Array<any>();
  let prev,
    value;

  for (let i = 0; i <= str2.length; i++)
    for (let j = 0; j <= str1.length; j++) {
      if (i && j)
        if (str1.charAt(j - 1) === str2.charAt(i - 1)) value = prev;
        else value = Math.min(current[j], current[j - 1], prev) + 1;
      else value = i + j;

      prev = current[j];
      current[j] = value;
    }

  return current.pop();
};

/**
   * return an edit distance from 0 to 1
   * @param str1 string
   * @param str2 string
   * @returns return an edit distance from 0 to 1
   */
export const _distance = function (str1: string, str2: string) {
  if (str1 === null && str2 === null)
    throw "Trying to compare two null values";
  if (str1 === null || str2 === null) return 0;
  str1 = String(str1);
  str2 = String(str2);

  const distance = levenshtein(str1, str2);
  if (str1.length > str2.length) {
    return 1 - distance / str1.length;
  } else {
    return 1 - distance / str2.length;
  }
};


/**
 * _iterateGrams ..
 * @param value string
 * @param gramSize number
 * @returns array
 */
export const _iterateGrams = function (value: string, gramSize: number): Array<string> {
  const _nonWordRe = /[^a-zA-Z0-9\u00C0-\u00FF, ]+/g;

  gramSize = gramSize || 2;
  let simplified = "-" + value.toLowerCase().replace(_nonWordRe, "") + "-";
  const lenDiff = gramSize - simplified.length;
  const results = [];
  if (lenDiff > 0) {
    for (let i = 0; i < lenDiff; ++i) {
      simplified += "-";
    }
  }
  for (let i = 0; i < simplified.length - gramSize + 1; ++i) {
    results.push(simplified.slice(i, i + gramSize));
  }
  return results;
};

/**
 * return an object where key=gram, value=number of occurrences
 * @param value string
 * @param gramSize number
 * @returns object
 */
export const _gramCounter = function (value: string, gramSize: number) {
  gramSize = gramSize || 2;
  const result = Array<number>();
  const grams = _iterateGrams(value, gramSize);
  let i = 0;
  for (i; i < grams.length; ++i) {
    if (grams[i] in result) {
      result[parseInt(grams[i])] += 1;
    } else {
      result[parseInt(grams[i])] = 1;
    }
  }
  return result;
};

/**
   * _normalizeStr ..
   * @param str ..
   * @returns string
   */
export const normalizeStr = function (str: string) {
  if (Object.prototype.toString.call(str) !== "[object String]")
    throw "Must use a string as argument to FuzzySet functions";
  return str.toLowerCase();
};

/**
   * isEmptyObject ..
   * @param obj .
   * @returns boolean
   */
export const isEmptyObject = function(obj: Record<string, any>) {
  for (const prop in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(prop)) return false;
  }
  return true;
}

/**
     * sortDescending
     * @param a ..
     * @param b ..
     * @returns number
     */
export const sortDescending = function (a: any, b: any) {
  if (a[0] < b[0]) {
    return 1;
  } else if (a[0] > b[0]) {
    return -1;
  } else {
    return 0;
  }
};
