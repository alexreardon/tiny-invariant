// @flow
// This file is not actually executed
// It is just used by flow for typing

const prefix: string = 'Invariant failed';

/**
 * __invariant__
 * 
 * The `invariant` function takes a value, and if the value is falsy then the `invariant` function will throw. If the value is truthy, then the function will not throw.
 *
 * @param {boolean} condition A boolean condition - if falsey will thrown an error.
 * @param {(string|() => string)} message The message provided to accompany the invariant. Can provide a string, or a function that returns a string for cases where the message takes a fair amount of effort to compute.
 *  
 * @returns {asserts condition is true}
 * @example
 * ```tsx
 * import invariant from 'tiny-invariant';
 *
 * // throws when 1 no longer equals 1
 * invariant(1 === 1, 'Maths is broken');
 * ```
 */
export default function invariant(condition: mixed, message?: string | (() => string)) {
  if (condition) {
    return;
  }
  throw new Error(`${prefix}: ${message || ''}`);
}
