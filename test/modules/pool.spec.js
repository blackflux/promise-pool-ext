import { expect } from 'chai';
import { describe } from 'node-tdd';
import Pool from '../../src/modules/pool.js';
import { Worker, sleep } from '../util.js';

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

  it('Testing timout', async ({ capture }) => {
    const pool = Pool({ concurrency: 1, timeout: 1 });
    const err = await capture(() => pool([
      () => new Promise(() => {})
    ]));
    expect(err.length).to.equal(1);
    expect(err[0].message).to.equal('Promise "" timed out after 1 ms');
  });

  it('Testing empty list input', async () => {
    const pool = Pool({ concurrency: 1, timeout: 1 });
    const r = await pool([]);
    expect(r.length).to.equal(0);
  });
});
