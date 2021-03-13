import GemFuzzySearch from '../src/core';

describe('without all parameters', () => {
  it('should return SearchResult Array', () => {
    const gfs = new GemFuzzySearch();
    gfs.add("Minh");
    gfs.add("Minh");
  })
})