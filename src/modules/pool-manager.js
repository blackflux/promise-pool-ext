const assert = require('assert');
const Joi = require('joi-strict');
const Pool = require('./pool');

module.exports = (logic, { concurrency = 50 } = {}) => {
  Joi.assert(logic, Joi.object().min(1).pattern(
    Joi.string(),
    Joi.object().keys({
      requires: Joi.array().items(Joi.string().valid(...Object.keys(logic))).optional(),
      if: Joi.function().optional(),
      fn: Joi.function()
    })
  ));

  (() => {
    const steps = Object.keys(logic);
    const validate = (paths) => {
      const firstStep = paths[0];
      const lastStep = paths[paths.length - 1];
      if (paths.length !== 1 && firstStep === lastStep) {
        throw new Error(`Recursion detected: ${paths.join(' <- ')}`);
      }
      (logic[lastStep].requires || [])
        .forEach((s) => validate(paths.concat(s)));
    };
    do {
      validate([steps.shift()]);
    } while (steps.length !== 0);
  })();

  const pool = Pool({ concurrency });
  const ready = {};

  const enqueue = async (name) => {
    if (ready[name] === undefined) {
      ready[name] = (async () => {
        const task = logic[name];
        if (task.if !== undefined && task.if() !== true) {
          return undefined;
        }
        if (task.requires === undefined || task.requires.length === 0) {
          return pool(task.fn);
        }
        task.requires.forEach((n) => {
          ready[n] = enqueue(n);
        });
        return pool(async () => {
          try {
            const kwargs = (await pool(task.requires.map((n) => async () => [n, await ready[n]])))
              .reduce((p, [k, v]) => Object.assign(p, { [k] : v }));
            return task.fn(kwargs);
          } catch (errors) {
            throw errors.find((e) => e instanceof Error);
          }
        });
      })();
    }
    return ready[name];
  };

  return {
    get: (name) => {
      assert(logic[name] !== undefined);
      return enqueue(name);
    }
  };
};
