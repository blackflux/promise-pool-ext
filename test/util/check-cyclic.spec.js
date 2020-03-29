const expect = require('chai').expect;
const { describe } = require('node-tdd');
const randomDag = require('random-dag');
const checkCyclic = require('../../src/util/check-cyclic');

describe('Testing checkCyclic', () => {
  let Graph;
  let helper;
  beforeEach(() => {
    Graph = (cyclic) => new Promise((resolve) => {
      randomDag.graphlib({
        max_per_rank: 10, // how 'fat' the DAG should be
        min_per_rank: 1,
        max_ranks: 10, // how 'tall' the DAG should be
        min_ranks: 1,
        probability: 0.3 // chance of having an edge
      }, (err, g) => {
        const result = {};
        g.nodes().forEach((n) => {
          result[n] = [];
        });
        g.edges().forEach((e) => {
          result[e.v].push(e.w);
        });
        if (cyclic === true) {
          const randomNode = Object.keys(result)[Math.floor(Math.random() * g.nodeCount())];
          const trace = [randomNode];
          let parents = result[randomNode];
          while (parents.length !== 0) {
            const parent = parents[Math.floor(Math.random() * parents.length)];
            trace.push(parent);
            parents = result[parent];
          }
          const otherNode = trace[Math.floor(Math.random() * trace.length)];
          result[otherNode].push(randomNode);
        }
        resolve(result);
      });
    });
    helper = (graph, error) => {
      if (error === false) {
        expect(checkCyclic((graph))).to.equal(undefined);
      } else if (error === true) {
        expect(() => checkCyclic(graph)).to.throw();
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
      p3: ['p2'],
      p4: ['p3']
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
    }, false);
  });

  it('Testing empty graph', () => {
    helper({}, false);
  });

  it('Testing Random Non Cyclic', async () => {
    for (let idx = 0; idx < 1000; idx += 1) {
      // eslint-disable-next-line no-await-in-loop
      const G = await Graph(false);
      helper(G, false);
    }
  });

  it('Testing Random Cyclic', async () => {
    for (let idx = 0; idx < 1000; idx += 1) {
      // eslint-disable-next-line no-await-in-loop
      const G = await Graph(true);
      helper(G, true);
    }
  });
});
