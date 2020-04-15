# promise-pool-ext

[![Build Status](https://circleci.com/gh/blackflux/promise-pool-ext.png?style=shield)](https://circleci.com/gh/blackflux/promise-pool-ext)
[![Test Coverage](https://img.shields.io/coveralls/blackflux/promise-pool-ext/master.svg)](https://coveralls.io/github/blackflux/promise-pool-ext?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=blackflux/promise-pool-ext)](https://dependabot.com)
[![Dependencies](https://david-dm.org/blackflux/promise-pool-ext/status.svg)](https://david-dm.org/blackflux/promise-pool-ext)
[![NPM](https://img.shields.io/npm/v/promise-pool-ext.svg)](https://www.npmjs.com/package/promise-pool-ext)
[![Downloads](https://img.shields.io/npm/dt/promise-pool-ext.svg)](https://www.npmjs.com/package/promise-pool-ext)
[![Semantic-Release](https://github.com/blackflux/js-gardener/blob/master/assets/icons/semver.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/blackflux/js-gardener/blob/master/assets/badge.svg)](https://github.com/blackflux/js-gardener)

Queue promises into pool limiting concurrency

## Install

Install with [npm](https://www.npmjs.com/):

    $ npm install --save promise-pool-ext

## Usage

### Pool

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const { Pool } = require('promise-pool-ext');

const pool = Pool({ concurrency: 10 });

// queue array of functions, returns Promise < array of function results >
pool([
  () => new Promise((resolve) => { /* do async logic here */ }),
  async () => { /* do async logic here */ }
]);

// queue function, returns Promise < function result >
pool(async () => { /* do async logic here */ });
```

See tests for more examples

### PoolManager

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const { PoolManager } = require('promise-pool-ext');

const manager = PoolManager({
  check1: {
    if: () => false, // when not true returned, promise is not resolved and undefined is returned
    fn: () => { /* return async logic */ }
  },
  check2: {
    requires: ['check1'],
    fn: ({ check1 }) => {
      if (check1) { /* return async logic */ }
    }
  },
  data: {
    requires: ['check1', 'check2'],
    fn: ({ check1, check2 }) => {
      if (check1 && check2) { /* return async logic */ }
    }
  }
}, { concurrency: 10 });

// returns Promise < data.fn result >
manager.get('data');
```

See tests for more examples


### Parameters

#### concurrency: Integer

How many promises can resolve in parallel.

#### timeout: Integer = undefined

Maximum amount of time in ms that a promise can take to resolve before a failure is returned.

If `0` or `undefined` is passes, no timeout is enforced.

## Errors

When a promise is rejected or an error is thrown,
the returned promise is rejected once all promises in batch have completed execution.

## Why

As an example, when making a lot of external requests one can hit limits of the external API or the node runtime itself.
This library makes it easy to limit the amount of parallel executions.
