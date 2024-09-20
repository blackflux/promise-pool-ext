import { expect } from 'chai';
import { describe } from 'node-tdd';
import * as index from '../src/index.js';

describe('Testing Exports', () => {
  it('Testing exported functions', async () => {
    expect(Object.entries(index).map(([k, v]) => [k, typeof v])).to.deep.equal([
      ['Pool', 'function'],
      ['PoolManager', 'function'],
      ['SeqWorker', 'function']
    ]);
  });
});
