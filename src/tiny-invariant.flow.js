// @flow
const prefix: string = 'Invariant failed';

// Throw an error if the condition fails
// Strip out error messages for production
// > Not providing an inline default argument for message as the result is smaller
export default function invariant(condition: mixed, message?: string) {
  if (condition) {
    return;
  }
  // Condition not passed
  throw new Error(`${prefix}: ${message || ''}`);
}
