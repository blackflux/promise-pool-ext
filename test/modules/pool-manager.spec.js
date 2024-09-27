import { expect } from 'chai';
import { describe } from 'node-tdd';
import PoolManager from '../../src/modules/pool-manager.js';
import { Worker } from '../util.js';

describe('Testing Promise Pool Manager', { record: console }, () => {
  it('Testing pre executed only once', async ({ recorder }) => {
    const manager = PoolManager({
      pre: {
        fn: Worker('pre', 100)
      },
      mid: {
        requires: ['pre'],
        fn: Worker('mid', 100)
      },
      result: {
        requires: ['pre', 'mid'],
        fn: Worker('result', 100)
      }
    });
    expect(await manager.get('result'))
      .to.deep.equal('result');
    expect(recorder.get()).to.deep.equal([
      'start pre',
      'end pre',
      'start mid',
      'end mid',
      'start result',
      'end result'
    ]);
  });

  it('Testing sequential execution', async ({ recorder }) => {
    const manager = PoolManager({
      pre: {
        fn: Worker('pre', 100)
      },
      mid: {
        requires: ['pre'],
        fn: Worker('mid', 100)
      },
      result: {
        requires: ['mid'],
        fn: Worker('result', 100)
      }
    });
    expect(await manager.get('result'))
      .to.deep.equal('result');
    expect(recorder.get()).to.deep.equal([
      'start pre',
      'end pre',
      'start mid',
      'end mid',
      'start result',
      'end result'
    ]);
  });

  it('Testing if returns false', async ({ recorder }) => {
    const manager = PoolManager({
      result: {
        if: () => false,
        fn: Worker('result', 100)
      }
    });
    expect(await manager.get('result'))
      .to.deep.equal(undefined);
    expect(recorder.get()).to.deep.equal([]);
  });

  it('Testing if returns true', async ({ recorder }) => {
    const manager = PoolManager({
      result: {
        if: () => true,
        fn: Worker('result', 100)
      }
    });
    expect(await manager.get('result'))
      .to.deep.equal('result');
    expect(recorder.get()).to.deep.equal([
      'start result',
      'end result'
    ]);
  });

  it('Testing if returns false with requires', async ({ recorder }) => {
    const manager = PoolManager({
      a: {
        if: () => false,
        fn: Worker('a', 100)
      },
      b: {
        requires: ['a'],
        if: ({ a }) => a === 'a',
        fn: Worker('b', 100)
      }
    });
    expect(await manager.get('b')).to.deep.equal(undefined);
    expect(recorder.get()).to.deep.equal([]);
  });

  it('Testing if returns true with requires', async ({ recorder }) => {
    const manager = PoolManager({
      a: {
        fn: Worker('a', 100)
      },
      b: {
        requires: ['a'],
        if: ({ a }) => a === 'a',
        fn: Worker('b', 100)
      }
    });
    expect(await manager.get('b')).to.deep.equal('b');
    expect(recorder.get()).to.deep.equal([
      'start a',
      'end a',
      'start b',
      'end b'
    ]);
  });

  describe('Testing Error Handling', { record: console }, () => {
    it('Testing error thrown from nested', async ({ recorder, capture }) => {
      const manager = PoolManager({
        err: {
          fn: () => {
            throw new Error('error');
          }
        },
        result: {
          requires: ['err'],
          fn: Worker('result', 100)
        }
      });
      const err = await capture(() => manager.get('result'));
      expect(err.message).to.deep.equal('error');
      expect(recorder.get()).to.deep.equal([]);
    });

    it('Testing error thrown from nested as string', async ({ recorder, capture }) => {
      const manager = PoolManager({
        err: {
          fn: () => {
            // eslint-disable-next-line no-throw-literal
            throw 'error';
          }
        },
        result: {
          requires: ['err'],
          fn: Worker('result', 100)
        }
      });
      const err = await capture(() => manager.get('result'));
      expect(err).to.deep.equal(['error']);
      expect(recorder.get()).to.deep.equal([]);
    });

    it('Testing error thrown from root', async ({ recorder, capture }) => {
      const manager = PoolManager({
        pre: {
          fn: () => true
        },
        result: {
          requires: ['pre'],
          fn: () => {
            throw new Error('error');
          }
        }
      });
      const err = await capture(() => manager.get('result'));
      expect(err.message).to.deep.equal('error');
      expect(recorder.get()).to.deep.equal([]);
    });

    it('Testing self recursion error', async ({ recorder, capture }) => {
      const err = await capture(() => PoolManager({
        p1: {
          requires: ['p1'],
          fn: Worker('p1', 100)
        }
      }));
      expect(err.message).to.deep.equal('Cycle detected: p1 <- p1');
      expect(recorder.get()).to.deep.equal([]);
    });

    it('Testing star recursion error', async ({ recorder, capture }) => {
      const err = await capture(() => PoolManager({
        p1: {
          requires: ['p2'],
          fn: Worker('p1', 100)
        },
        p2: {
          requires: '*',
          fn: Worker('p1', 100)
        }
      }));
      expect(err.message).to.deep.equal('Cycle detected: p1 <- p2 <- p1');
      expect(recorder.get()).to.deep.equal([]);
    });

    it('Testing star requires', async ({ recorder }) => {
      const manager = PoolManager({
        a: {
          fn: Worker('a', 10)
        },
        b: {
          fn: Worker('b', 10)
        },
        c: {
          fn: Worker('c', 10)
        },
        d: {
          requires: '*',
          fn: (...kwargs) => kwargs
        }
      });
      const r = await manager.get('d');
      expect(r).to.deep.equal([
        { a: 'a', b: 'b', c: 'c' }
      ]);
      expect(recorder.get()).to.deep.equal([
        'start a',
        'start b',
        'start c',
        'end a',
        'end b',
        'end c'
      ]);
    });
  });
});
