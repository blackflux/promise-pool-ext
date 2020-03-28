const expect = require('chai').expect;
const { describe } = require('node-tdd');
const Pool = require('../../src/modules/pool');
const { Worker, sleep } = require('../util');


describe('Testing Promise Pool', { record: console }, () => {
  it('Testing concurrency is 1', async ({ recorder }) => {
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

  it('Testing concurrency is 2', async ({ recorder }) => {
    const pool = Pool({ concurrency: 2 });
    const result = await pool([
      Worker(1, 200),
      Worker(2, 100)
    ]);
    expect(result).to.deep.equal([1, 2]);
    expect(recorder.get()).to.deep.equal([
      'start 1',
      'start 2',
      'end 2',
      'end 1'
    ]);
  });

  it('Testing non promise', async () => {
    const pool = Pool({ concurrency: 1 });
    const result = await pool([
      async () => {
        await sleep(100);
        return 1;
      }
    ]);
    expect(result).to.deep.equal([1]);
  });

  it('Testing simple function', async () => {
    const pool = Pool({ concurrency: 1 });
    const result = await pool(() => 1);
    expect(result).to.deep.equal(1);
  });

  it('Testing exception', async ({ capture }) => {
    const e = new Error();
    const pool = Pool({ concurrency: 1 });
    const result = await capture(() => pool([
      () => {
        throw e;
      }
    ]));
    expect(result).to.deep.equal([e]);
  });
});
