# Tiny invariant 😎

[![Build Status](https://travis-ci.org/alexreardon/tiny-invariant.svg?branch=master)](https://travis-ci.org/alexreardon/tiny-invariant)
[![npm](https://img.shields.io/npm/v/tiny-invariant.svg)](https://www.npmjs.com/package/tiny-invariant) [![dependencies](https://david-dm.org/alexreardon/tiny-invariant.svg)](https://david-dm.org/alexreardon/tiny-invariant)
[![min](https://img.shields.io/bundlephobia/min/tiny-invariant.svg)](https://www.npmjs.com/package/tiny-invariant)
[![minzip](https://img.shields.io/bundlephobia/minzip/tiny-invariant.svg)](https://www.npmjs.com/package/tiny-invariant)

A tiny [`invariant`](https://www.npmjs.com/package/invariant) alternative.

* The second argument for `invariant` is a `message`. `invariant` supports passing in messages in a sprintf style. It has internal logic to execute the sprintf substitutions. We have dropped all of this logic. We simply simply allow you to pass a string. With [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) there is really no need for a custom message formatter to be built into the library. You can just do this: `invariant(condition, 'Hello, ${name} - how are you today?')`
* We support a es module build for deduplication
* Full [flowtype](https://flowtype.org) support

## Usage

```js
import invariant from 'tiny-invariant';

invariant(truthyValue, 'This should not throw!');

invariant(falsyValue, 'This will throw!');
// Error('Invariant violation: This will throw!');
```

## API: `(value: mixed, message?: string) => void`

* `value` is required and can be anything
* `message` is an optional string

## Installation

```bash
# yarn
yarn add tiny-invariant

# bash
npm add tiny-invariant --save
```

## Dropping your `message` for kb savings!

We recommend using [`babel-plugin-dev-expression`](https://www.npmjs.com/package/babel-plugin-dev-expression) to remove the `message` argument from your `invariant` calls in production builds to save kbs!

What it does it turn your code that looks like this:

```js
invariant(condition, message);
```

into this

```js
if (!condition) {
  if ('production' !== process.env.NODE_ENV) {
    invariant(false, argument, argument);
  } else {
    invariant(false);
  }
}
```

Your bundler can then drop the code in the `"production" !== process.env.NODE_ENV` block for your production builds

Final result:

```js
if (!condition) {
  invariant(false);
}
```

> [webpack instructions](https://webpack.js.org/guides/production/#specify-the-mode)

## Builds

* We have a `es` (EcmaScript module) build (because you _know_ you want to deduplicate this super heavy library)
* We have a `cjs` (CommonJS) build
* We expect `process.env.NODE_ENV` to be available at module compilation. We cache this value
* We have a `umd` (Universal module definition) build in case you needed it

## That's it!

🤘
