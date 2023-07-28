import Joi from 'joi-strict';
import promiseTimeout from '../util/promise-timeout.js';

export default (opt) => {
  Joi.assert(opt, Joi.object().keys({
    concurrency: Joi.number().integer().min(1),
    timeout: Joi.number().integer().min(0).optional()
  }));

  let pending = 0;
  const queue = [];

  const processQueue = () => {
    while (queue.length !== 0 && pending < opt.concurrency) {
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
    if (fns.length === 0) {
      return Promise.resolve([]);
    }

    return new Promise((resolve, reject) => {
      const state = {
        total: fns.length,
        processed: 0,
        result: [],
        success: true
      };
      fns.forEach((fn, idx) => {
        const wrappedFn = async () => {
          let r;
          try {
            r = await (
              [0, undefined].includes(opt.timeout)
                ? fn()
                : promiseTimeout(fn(), opt.timeout, fn.name)
            );
          } catch (e) {
            state.success = false;
            r = e;
          }
          state.result[idx] = r;
          state.processed += 1;
          pending -= 1;
          if (state.processed === state.total) {
            (state.success ? resolve : reject)(isArray ? state.result : state.result[0]);
          }
          processQueue();
        };
        queue.push(wrappedFn);
      });
      processQueue();
    });
  };
};
