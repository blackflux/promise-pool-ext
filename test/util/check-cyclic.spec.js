const expect = require('chai').expect;
const { describe } = require('node-tdd');
const checkCyclic = require('../../src/util/check-cyclic');

describe('Testing checkCyclic', () => {
  let helper;
  beforeEach(() => {
    helper = (graph, error) => {
      if (error === null) {
        expect(checkCyclic((graph))).to.equal(undefined);
      } else {
        expect(() => checkCyclic(graph)).to.throw(`Cycle detected: ${error}`);
      }
    };
  });

  it('Testing simple cycle', () => {
    helper({
      p1: ['p3'],
      p2: ['p1'],
      p3: ['p2']
    }, 'p1 <- p3 <- p2 <- p1');
  });

  it('Testing sub-cycle', () => {
    helper({
      p0: ['p1'],
      p1: ['p3'],
      p2: ['p1'],
      p3: ['p2']
    }, 'p1 <- p3 <- p2 <- p1');
  });

  it('Testing separate cycle', () => {
    helper({
      pA: [],
      pB: ['pA'],
      p1: ['p3'],
      p2: ['p1'],
      p3: ['p2']
    }, 'p1 <- p3 <- p2 <- p1');
  });

  it('Testing single node cycle', () => {
    helper({ p1: ['p1'] }, 'p1 <- p1');
  });

  it('Testing graph ok', () => {
    helper({
      pA: [],
      pB: ['pA']
    }, null);
  });

  it('Testing empty graph', () => {
    helper({}, null);
  });
});
