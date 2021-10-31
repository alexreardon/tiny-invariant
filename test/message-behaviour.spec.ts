// @flow
import invariant from '../src/tiny-invariant';

it('should include a default message when an invariant does throw and no message is provided', () => {
  try {
    invariant(false);
  } catch (e) {
    invariant(e instanceof Error);
    expect(e.message).toEqual('Invariant failed');
  }
});

it('should include a provided message when an invariant does throw', () => {
  try {
    invariant(false, 'my message');
  } catch (e) {
    invariant(e instanceof Error);
    expect(e.message).toEqual('Invariant failed: my message');
  }
});

it('should not execute a message function if the invariant does not throw', () => {
  const message = jest.fn(() => 'lazy message');
  invariant(true, message);
  expect(message).not.toHaveBeenCalled();
});

it('should execute a message function if the invariant does throw', () => {
  const message = jest.fn(() => 'lazy message');
  try {
    invariant(false, message);
  } catch (e) {
    invariant(e instanceof Error);
    expect(message).toHaveBeenCalled();
    expect(e.message).toEqual('Invariant failed: lazy message');
  }
});
