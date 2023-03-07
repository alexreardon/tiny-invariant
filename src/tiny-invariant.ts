const isProduction: boolean = process.env.NODE_ENV === 'production';
const prefix: string = 'Invariant failed';

/**
 * Throw an error if the condition fails. Strip out error messages for production.
 *
 * @param condition A boolean condition - if falsey will thrown an error.
 * @param message The message provided to accompany the invariant. No inline default argument for message as the result is smaller.
 *
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
  // Can provide a string, or a function that returns a string for cases where
  // the message takes a fair amount of effort to compute
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
