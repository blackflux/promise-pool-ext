const expect = require('chai').expect;
const { describe } = require('node-tdd');
const index = require('../src/index');

describe('Testing Exports', () => {
  it('Testing exported functions', async () => {
    expect(Object.entries(index).map(([k, v]) => [k, typeof v])).to.deep.equal([
      ['Pool', 'function'],
      ['PoolManager', 'function']
    ]);
  });
});
