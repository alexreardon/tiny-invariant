/**
 * Throw an error if the condition fails.
 *
 * Strip out error messages for production.
 */
declare const invariant: (condition: boolean, message?: string) => void;

export default invariant;
export { invariant };
