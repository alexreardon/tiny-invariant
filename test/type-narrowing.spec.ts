import invariant from '../src/tiny-invariant';
import { expectType } from 'ts-expect';

it('should correctly narrow a type (boolean)', () => {
  const value: boolean = true;
  invariant(value, 'Value is false');
  expectType<true>(value);
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
