/* eslint-env jest */

import cleanProfanity from './profanityFilter';

describe('cleanProfanity', () => {
  test('keeps clean text unchanged', () => {
    expect(cleanProfanity('hello channel')).toBe('hello channel');
  });

  test('replaces english profanity', () => {
    const result = cleanProfanity('hello fuck world');

    expect(result).not.toBe('hello fuck world');
    expect(result).not.toContain('fuck');
    expect(result).toContain('hello');
    expect(result).toContain('world');
  });
});
