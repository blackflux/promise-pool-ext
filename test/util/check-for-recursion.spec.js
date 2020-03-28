const expect = require('chai').expect;
const { describe } = require('node-tdd');
const checkForRecursion = require('../../src/util/check-for-recursion');

describe('Testing checkForRecursion', () => {
  let helper;
  beforeEach(() => {
    helper = (graph, error) => {
      expect(() => checkForRecursion(graph)).to.throw(error);
    };
  });

  it('Testing full-loop', () => {
    helper({
      p1: ['p3'],
      p2: ['p1'],
      p3: ['p2']
    }, 'Recursion detected: p1 <- p3 <- p2 <- p1');
  });

  it('Testing sub-loop', () => {
    helper({
      p0: ['p1'],
      p1: ['p3'],
      p2: ['p1'],
      p3: ['p2']
    }, 'Recursion detected: p1 <- p3 <- p2 <- p1');
  });

  it('Testing separate ok and loop', () => {
    helper({
      pA: [],
      pB: ['pA'],
      p1: ['p3'],
      p2: ['p1'],
      p3: ['p2']
    }, 'Recursion detected: p1 <- p3 <- p2 <- p1');
  });

  it('Testing self-recursion', () => {
    helper({ p1: ['p1'] }, 'Recursion detected: p1 <- p1');
  });
});
