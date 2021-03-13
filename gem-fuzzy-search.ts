/*
 * @Author: Nora Galvin 
 * @Date: 2020-08-05 14:16:53 
 * @Last Modified by: Nora
 * @Last Modified time: 2020-08-05 17:06:57
 */


type TypeFuzzySet = {
  gramSizeLower: number;
  gramSizeUpper: number;
  useLevenshtein: boolean;
  exactSet: any;
  matchDict: any;
  items: any;
  get?: any;
  _get?: any;
  __get?: any;
  _normalizeStr?: any;
  add?: any;
  _add?: any;
  length?: any;
  isEmpty?: any;
  values?: any;
}

/**
 * Fuzzy Search, see more example here:
 * https://glench.github.io/fuzzyset.js/
 * https://github.com/Glench/fuzzyset.js
 * @param arr An array of strings to initialize the data structure with
 * @param useLevenshtein Whether or not to use the levenshtein distance to determine the match scoring. Default: True
 * @param gramSizeLower The lower bound of gram sizes to use, inclusive (see Theory of operation). Default: 2
 * @param gramSizeUpper ..
 * @returns The upper bound of gram sizes to use, inclusive (see Theory of operation). Default: 3
 */
const FuzzySet = function (arr: Array<any>, useLevenshtein: boolean, gramSizeLower: number, gramSizeUpper: number): any {
  const fuzzyset: TypeFuzzySet = {
    gramSizeLower: gramSizeLower || 2,
    gramSizeUpper: gramSizeUpper || 3,
    useLevenshtein: typeof useLevenshtein !== "boolean" ? true : useLevenshtein,
    // define all the object functions and attributes
    exactSet: {},
    matchDict: {},
    items: {}
  };

  // default options
  arr = arr || [];

  /**
   * helper functions ..
   * @param str1 ..
   * @param str2 ..
   * @returns string
   */
  const levenshtein = function (str1: string, str2: string) {
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
  const _distance = function (str1: string, str2: string) {
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
  const _nonWordRe = /[^a-zA-Z0-9\u00C0-\u00FF, ]+/g;

  /**
   * _iterateGrams ..
   * @param value string
   * @param gramSize number
   * @returns array
   */
  const _iterateGrams = function (value: string, gramSize: number): Array<string> {
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
  const _gramCounter = function (value: string, gramSize: number) {
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
   * the main functions
   * @param value ..
   * @param defaultValue ..
   * @param minMatchScore ..
   * @returns object
   */
  fuzzyset.get = function (value: string, defaultValue: string, minMatchScore: number) {
    // check for value in set, returning defaultValue or null if none found
    if (minMatchScore === undefined) {
      minMatchScore = 0.33;
    }
    const result = this._get(value, minMatchScore);
    if (!result && typeof defaultValue !== "undefined") {
      return defaultValue;
    }
    return result;
  };

  /**
   * _get ..
   * @param value ..
   * @param minMatchScore ..
   * @returns object
   */
  fuzzyset._get = function (value: string, minMatchScore: number) {
    let results = [];
    // start with high gram size and if there are no results, go to lower gram sizes
    for (
      let gramSize = this.gramSizeUpper;
      gramSize >= this.gramSizeLower;
      --gramSize
    ) {
      results = this.__get(value, gramSize, minMatchScore);
      if (results && results.length > 0) {
        return results;
      }
    }
    return null;
  };

  /**
   * __get
   * @param value ..
   * @param gramSize ..
   * @param minMatchScore ..
   * @returns object
   */
  fuzzyset.__get = function (value: string, gramSize: number, minMatchScore: number) {
    const normalizedValue = this._normalizeStr(value);
    const matches = Array<number>();
    const gramCounts = _gramCounter(normalizedValue, gramSize);
    const items = this.items[gramSize];
    let sumOfSquareGramCounts = 0;
    let gram;
    let gramCount: number;
    let index;
    let otherGramCount;

    for (gram in gramCounts) {
      gramCount = gramCounts[gram];
      sumOfSquareGramCounts += Math.pow(gramCount, 2);
      if (gram in this.matchDict) {
        for (let i = 0; i < this.matchDict[gram].length; ++i) {
          index = this.matchDict[gram][i][0];
          otherGramCount = this.matchDict[gram][i][1];
          if (index in matches) {
            matches[index] += gramCount * otherGramCount;
          } else {
            matches[index] = gramCount * otherGramCount;
          }
        }
      }
    }

    /**
     * isEmptyObject ..
     * @param obj .
     * @returns boolean
     */
    function isEmptyObject(obj: Record<string, any>) {
      for (const prop in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(prop)) return false;
      }
      return true;
    }

    if (isEmptyObject(matches)) {
      return null;
    }

    const vectorNormal = Math.sqrt(sumOfSquareGramCounts);
    let results = [];
    let matchScore;
    // build a results list of [score, str]
    for (const matchIndex in matches) {
      matchScore = matches[matchIndex];
      results.push([
        matchScore / (vectorNormal * items[matchIndex][0]),
        items[matchIndex][1],
      ]);
    }
    /**
     * sortDescending
     * @param a ..
     * @param b ..
     * @returns number
     */
    const sortDescending = function (a: any, b: any) {
      if (a[0] < b[0]) {
        return 1;
      } else if (a[0] > b[0]) {
        return -1;
      } else {
        return 0;
      }
    };

    let newResults = [];

    results.sort(sortDescending);
    if (this.useLevenshtein) {
      newResults = [];
      const endIndex = Math.min(50, results.length);
      // truncate somewhat arbitrarily to 50
      for (let i = 0; i < endIndex; ++i) {
        newResults.push([
          _distance(results[i][1], normalizedValue),
          results[i][1],
        ]);
      }
      results = newResults;
      results.sort(sortDescending);
    }

    results.forEach((scoreWordPair: any) => {
      if (scoreWordPair[0] >= minMatchScore) {
        newResults.push([
          scoreWordPair[0],
          this.exactSet[scoreWordPair[1]],
        ]);
      }
    });
    return newResults;
  };

  /**
   * add ..
   * @param value ..
   * @returns void
   */
  fuzzyset.add = function (value: string) {
    const normalizedValue = this._normalizeStr(value);
    if (normalizedValue in this.exactSet) {
      return false;
    }

    let i = this.gramSizeLower;
    for (i; i < this.gramSizeUpper + 1; ++i) {
      this._add(value, i);
    }
  };

  /**
   * _add
   * @param value ..
   * @param gramSize ..
   * @returns void
   */
  fuzzyset._add = function (value: string, gramSize: number) {
    const normalizedValue = this._normalizeStr(value),
      items = this.items[gramSize] || [],
      index = items.length;

    items.push(0);
    const gramCounts = _gramCounter(normalizedValue, gramSize);
    let sumOfSquareGramCounts = 0;
    let gram;
    let gramCount;
    for (gram in gramCounts) {
      gramCount = gramCounts[gram];
      sumOfSquareGramCounts += Math.pow(gramCount, 2);
      if (gram in this.matchDict) {
        this.matchDict[gram].push([index, gramCount]);
      } else {
        this.matchDict[gram] = [[index, gramCount]];
      }
    }
    const vectorNormal = Math.sqrt(sumOfSquareGramCounts);
    items[index] = [vectorNormal, normalizedValue];
    this.items[gramSize] = items;
    this.exactSet[normalizedValue] = value;
  };

  /**
   * _normalizeStr ..
   * @param str ..
   * @returns string
   */
  fuzzyset._normalizeStr = function (str: string) {
    if (Object.prototype.toString.call(str) !== "[object String]")
      throw "Must use a string as argument to FuzzySet functions";
    return str.toLowerCase();
  };

  /**
   * return length of items in set
   * @returns number
   */
  fuzzyset.length = function () {
    let count = 0,
      prop;
    for (prop in this.exactSet) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.exactSet.hasOwnProperty(prop)) {
        count += 1;
      }
    }
    return count;
  };

  /**
   * return is set is empty
   * @returns boolean
   */
  fuzzyset.isEmpty = function () {
    for (const prop in this.exactSet) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.exactSet.hasOwnProperty(prop)) {
        return false;
      }
    }
    return true;
  };

  /**
   * return list of values loaded into set
   * @returns array
   */
  fuzzyset.values = function () {
    const values = [];
    let prop;
    for (prop in this.exactSet) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.exactSet.hasOwnProperty(prop)) {
        values.push(this.exactSet[prop]);
      }
    }
    return values;
  };

  // initialization
  let i = fuzzyset.gramSizeLower;
  for (i; i < fuzzyset.gramSizeUpper + 1; ++i) {
    fuzzyset.items[i] = [];
  }
  // add all the items to the set
  for (i = 0; i < arr.length; ++i) {
    fuzzyset.add(arr[i]);
  }

  return fuzzyset;
};

export default FuzzySet;