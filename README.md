# Tiny invariant 😎

[![Greenkeeper badge](https://badges.greenkeeper.io/alexreardon/tiny-invariant.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/alexreardon/tiny-invariant.svg?branch=master)](https://travis-ci.org/alexreardon/tiny-invariant) [![npm](https://img.shields.io/npm/v/react-beautiful-dnd.svg)](https://www.npmjs.com/package/react-beautiful-dnd) [![dependencies](https://david-dm.org/alexreardon/tiny-invariant.svg)](https://david-dm.org/alexreardon/tiny-invariant)

A `~100 byte` [`invariant`](https://www.npmjs.com/package/invariant) alternative.

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

## Builds

* We have a `es` (EcmaScript module) build (because you _know_ you want to deduplicate this super heavy library)
* We have a `cjs` (CommonJS) build
* We expect `process.env.NODE_ENV` to be available at module compilation. We cache this value

## That's it!

🤘
