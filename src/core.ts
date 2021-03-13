/*
 * @Author: Nora Galvin 
 * @Date: 2020-08-05 14:16:53 
 * @Last Modified by: Nora
 * @Last Modified time: 2020-08-05 17:06:57
 */

import { TypeGemFuzzySearch } from "./types";
import { _distance, _iterateGrams, _gramCounter, normalizeStr, isEmptyObject, sortDescending } from "./helpers";

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
class GemFuzzySearch implements TypeGemFuzzySearch {
  public gramSizeLower: number;
  public gramSizeUpper: number;
  public useLevenshtein: boolean;
  public exactSet: any = {};
  public matchDict: any = {};
  public items: any = {};
  public arr: Array<any>;

  constructor(arr: Array<any> = [], useLevenshtein?: boolean, gramSizeLower: number = 2, gramSizeUpper: number = 3) {
    this.gramSizeLower = gramSizeLower;
    this.gramSizeUpper = gramSizeUpper;
    this.useLevenshtein = typeof useLevenshtein !== "boolean" ? true : useLevenshtein;
    this.arr = arr;

    // initialization
    let i = this.gramSizeLower;
    for (i; i < this.gramSizeUpper + 1; ++i) {
      this.items[i] = [];
    }
    // add all the items to the set
    for (i = 0; i < arr.length; ++i) {
      this.add(arr[i]);
    }
  }

  public get(value: string, defaultValue?: string, minMatchScore?: number) {
    // check for value in set, returning defaultValue or null if none found
    if (minMatchScore === undefined) {
      minMatchScore = 0.33;
    }
    const result = this._get(value, minMatchScore);
    if (!result && typeof defaultValue !== "undefined") {
      return defaultValue;
    }
    return result;
  }

  /**
   * _get ..
   * @param value ..
   * @param minMatchScore ..
   * @returns object
   */
  public _get(value: string, minMatchScore: number) {
    let results: any[][] | null = [];
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
  public __get(value: string, gramSize: number, minMatchScore: number) {
    const normalizedValue = normalizeStr(value);
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
  public add (value: string) {
    const normalizedValue = normalizeStr(value);
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
  public _add (value: string, gramSize: number) {
    const normalizedValue = normalizeStr(value),
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
   * return length of items in set
   * @returns number
   */
  public length () {
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
  public isEmpty () {
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
  public values () {
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
}

export default GemFuzzySearch;