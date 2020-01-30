import invariant from '../src/tiny-invariant';
import { expectType } from 'ts-expect';

it('should correctly narrow a type (boolean)', () => {
  try {
    const value: boolean = false;

    invariant(value, 'Value is false');
    expectType<true>(value);
    // this will never be hit as value is false, but it is showing
    // that in order to get to this point the type would need to be true
  } catch {}
});

it('should correctly narrow a type (custom type)', () => {
  type Nullable<T> = T | null;
  type Person = { name: string };

  function tryGetPerson(name: string): Nullable<Person> {
    return { name };
  }

  const alex: Nullable<Person> = tryGetPerson('Alex');

  invariant(alex);
  expectType<Person>(alex);
});
