module.exports = (graph) => {
  const nodes = new Set(Object.keys(graph));
  const searchCycle = (trace, node) => {
    const cycleStartIdx = trace.indexOf(node);
    if (cycleStartIdx !== -1) {
      throw new Error(`Cycle detected: ${trace
        .slice(cycleStartIdx).concat(node).join(' <- ')}`);
    }
    if (nodes.delete(node) === true) {
      const nextTrace = trace.concat(node);
      graph[node].forEach((nextNode) => searchCycle(nextTrace, nextNode));
    }
  };
  while (nodes.size !== 0) {
    searchCycle([], nodes.values().next().value);
  }
};
