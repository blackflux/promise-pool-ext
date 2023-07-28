export default (G) => {
  const pending = new Set(Object.keys(G));
  while (pending.size !== 0) {
    const trace = [pending.values().next().value];
    const parentIdx = [0];
    pending.delete(trace[0]);

    while (trace.length !== 0) {
      const lastIdx = trace.length - 1;
      const parent = G[trace[lastIdx]][parentIdx[lastIdx]];
      if (parent === undefined) {
        trace.pop();
        parentIdx.pop();
      } else {
        if (trace.includes(parent)) {
          throw new Error(`Cycle detected: ${trace
            .slice(trace.indexOf(parent)).concat(parent).join(' <- ')}`);
        }
        parentIdx[lastIdx] += 1;
        if (pending.delete(parent)) {
          trace.push(parent);
          parentIdx.push(0);
        }
      }
    }
  }
};
