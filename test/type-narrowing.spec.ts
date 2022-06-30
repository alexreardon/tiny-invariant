import { expectTypeOf } from 'expect-type';
import invariant from '../src/tiny-invariant';

it('should correctly narrow a type (boolean)', (done) => {
  try {
    const value: boolean = false;

    invariant(value, 'Value is false');
    // this will never be hit as value is false, but it is showing
    // that in order to get to this point the type would need to be true
    expectTypeOf<never>(value);
  } catch {
    // Ensures that invariant has thrown and goes through the catch block.
    done();
  }
});

it('should correctly narrow a type (custom type)', () => {
  type Nullable<T> = T | null;
  type Person = { name: string };

  function tryGetPerson(name: string): Nullable<Person> {
    return { name };
  }

  const alex: Nullable<Person> = tryGetPerson('Alex');

  invariant(alex);
  expectTypeOf<Person>(alex);
});
