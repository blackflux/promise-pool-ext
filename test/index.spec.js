const util = require('util');
const expect = require('chai').expect;
const { describe } = require('node-tdd');
const { Pool } = require('../src/index');

const sleep = util.promisify(setTimeout);

describe('Testing Promise Pool', { record: console }, () => {
  let Worker;
  before(() => {
    // eslint-disable-next-line no-console
    const log = (...args) => console.log(...args);
    Worker = (id, delayMs) => () => new Promise((resolve) => {
      log(`start ${id}`);
      sleep(delayMs);
      log(`end ${id}`);
      resolve(id);
    });
  });

  it('Testing limit', async ({ recorder }) => {
    const pool = Pool({ concurrency: 1 });
    const result = await pool([
      Worker(1, 200),
      Worker(2, 100)
    ]);
    expect(result).to.deep.equal([1, 2]);
    expect(recorder.get()).to.deep.equal([
      'start 1',
      'end 1',
      'start 2',
      'end 2'
    ]);
  });
});
