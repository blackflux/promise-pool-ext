module.exports = (graph) => {
  const nodes = new Set(Object.keys(graph));
  const validate = (trace, node) => {
    const loopIdx = trace.indexOf(node);
    if (loopIdx !== -1) {
      throw new Error(`Recursion detected: ${trace
        .slice(loopIdx).concat(node).join(' <- ')}`);
    }
    if (nodes.delete(node) === true) {
      const nextTrace = trace.concat(node);
      graph[node].forEach((nextNode) => validate(nextTrace, nextNode));
    }
  };
  do {
    validate([], nodes.values().next().value);
  } while (nodes.size !== 0);
};
