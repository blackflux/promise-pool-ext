import { expect } from 'chai';
import { describe } from 'node-tdd';
import promiseTimeout from '../../src/util/promise-timeout.js';

describe('Testing promise-timeout', () => {
  it('Testing Promise does not finish within Timeout', async ({ capture }) => {
    const err = await capture(() => promiseTimeout(new Promise(() => {}), 1, 'name'));
    expect(err.message).to.equal('Promise "name" timed out after 1 ms');
  });

  it('Testing Promise Resolves within Timeout', async ({ capture }) => {
    const r = await promiseTimeout(new Promise((resolve) => { resolve(true); }), 1, 'name');
    expect(r).to.equal(true);
  });

  it('Testing Promise Rejects within Timeout', async ({ capture }) => {
    const e = new Error();
    const err = await capture(() => promiseTimeout(new Promise((resolve, reject) => { reject(e); }), 1, 'name'));
    expect(err).to.equal(e);
  });
});
