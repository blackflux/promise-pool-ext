const Joi = require('joi-strict');

module.exports.Pool = (opt = {}) => {
  Joi.assert(opt, Joi.object().keys({
    concurrency: Joi.number().integer().min(1).optional()
  }));
  const concurrency = opt.concurrency || 10;

  let pending = 0;
  const queue = [];

  const processQueue = () => {
    while (queue.length !== 0 && pending < concurrency) {
      queue.shift()();
      pending += 1;
    }
  };

  return (payload) => {
    Joi.assert(payload, Joi.alternatives(
      Joi.function(),
      Joi.array().items(Joi.function())
    ));

    const isArray = Array.isArray(payload);
    const fns = isArray ? payload : [payload];

    return new Promise((resolve, reject) => {
      const state = {
        total: fns.length,
        processed: 0,
        result: [],
        success: true
      };
      fns.forEach((fn, idx) => {
        const wrappedFn = () => fn()
          .catch((e) => {
            state.success = false;
            return e;
          })
          .then((r) => {
            state.result[idx] = r;
            state.processed += 1;
            pending -= 1;
            if (state.processed === state.total) {
              (state.success ? resolve : reject)(isArray ? state.result : state.result[0]);
            }
            processQueue();
          });
        queue.push(wrappedFn);
      });
      processQueue();
    });
  };
};
