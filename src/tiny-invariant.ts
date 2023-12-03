const isProduction: boolean = process.env.NODE_ENV === 'production';
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
export default function invariant(
  condition: any,
  message?: string | (() => string),
): asserts condition {
  if (condition) {
    return;
  }
  // Condition not passed

  // In production we strip the message but still throw
  if (isProduction) {
    throw new Error(prefix);
  }

  // When not in production we allow the message to pass through
  // *This block will be removed in production builds*

  const provided: string | undefined = typeof message === 'function' ? message() : message;

  // Options:
  // 1. message provided: `${prefix}: ${provided}`
  // 2. message not provided: prefix
  const value: string = provided ? `${prefix}: ${provided}` : prefix;
  throw new Error(value);
}
