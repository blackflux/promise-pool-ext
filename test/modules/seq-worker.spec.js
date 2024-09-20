import { expect } from 'chai';
import { describe } from 'node-tdd';
import SeqWorker from '../../src/modules/seq-worker.js';
import { sleep, Worker } from '../util.js';

describe('Testing Seq Worker', { record: console }, () => {
  it('Basic logic', async ({ recorder }) => {
    const worker = SeqWorker({});
    worker.enqueue(Worker(1, 200));
    worker.enqueue(Worker(2, 100));
    worker.enqueue(Worker(3, 100));
    await worker.flush();
    expect(recorder.get()).to.deep.equal([
      'start 1', 'end 1',
      'start 2', 'end 2',
      'start 3', 'end 3'
    ]);
  });

  it('Basic async finish', async ({ recorder }) => {
    const worker = SeqWorker({});
    worker.enqueue(Worker(1, 200));
    worker.enqueue(Worker(2, 100));
    worker.enqueue(Worker(3, 100));
    await sleep(500);
    await worker.flush();
    expect(recorder.get()).to.deep.equal([
      'start 1', 'end 1',
      'start 2', 'end 2',
      'start 3', 'end 3'
    ]);
  });

  it('Testing exception', async ({ capture }) => {
    const e = new Error();
    const worker = SeqWorker({});
    worker.enqueue(async () => {
      throw e;
    });
    const result = await capture(() => worker.flush());
    expect(result).to.deep.equal(e);
  });

  it('Testing sync exception', async ({ capture }) => {
    const e = new Error();
    const worker = SeqWorker({});
    worker.enqueue(() => {
      throw e;
    });
    const result = await capture(() => worker.flush());
    expect(result).to.deep.equal(e);
  });

  it('Testing timout', async ({ capture }) => {
    const worker = SeqWorker({ timeout: 1 });
    worker.enqueue(() => new Promise(() => {
    }));
    const err = await capture(() => worker.flush());
    expect(err.message).to.equal('Promise "" timed out after 1 ms');
  });

  it('Testing non promise', async () => {
    const worker = SeqWorker({});
    worker.enqueue(async () => {
      await sleep(100);
      return 1;
    });
    const result = await worker.flush();
    expect(result).to.deep.equal(undefined);
  });

  it('Testing simple function', async () => {
    const worker = SeqWorker({});
    worker.enqueue(() => 1);
    const result = await worker.flush();
    expect(result).to.deep.equal(undefined);
  });
});
