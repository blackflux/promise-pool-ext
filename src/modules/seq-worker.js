import Joi from 'joi-strict';
import promiseTimeout from '../util/promise-timeout.js';

export default (opt) => {
  Joi.assert(opt, Joi.object().keys({
    timeout: Joi.number().integer().min(0).optional(),
    debounce: Joi.boolean().optional()
  }));

  let firstError = null;
  const throwIfError = () => {
    if (firstError !== null) {
      throw firstError;
    }
  };

  const tasks = [];
  const work = () => {
    if (tasks.length === 0) {
      return;
    }
    const task = tasks[0];
    if (task.done === true) {
      tasks.shift();
      work();
      return;
    }
    if (typeof task.assignment === 'function') {
      if (opt.debounce === true && tasks.length > 1) {
        while (tasks.length > 1) {
          tasks.shift();
        }
        work();
      } else {
        task.assignment = task.assignment();
      }
    }
  };

  return {
    enqueue: (fn) => {
      const obj = {
        assignment: async () => {
          try {
            await (
              [0, undefined].includes(opt.timeout)
                ? fn()
                : promiseTimeout(fn(), opt.timeout, fn.name)
            );
          } catch (e) {
            if (firstError === null) {
              firstError = e;
            }
          } finally {
            obj.done = true;
            work();
          }
        },
        done: false
      };
      tasks.push(obj);
      work();
    },
    flush: async () => {
      throwIfError();
      while (tasks.length !== 0) {
        // eslint-disable-next-line no-await-in-loop
        await tasks[0].assignment;
        throwIfError();
      }
    }
  };
};