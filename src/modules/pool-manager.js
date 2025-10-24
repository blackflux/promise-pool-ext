import assert from 'assert';
import Joi from 'joi-strict';
import Pool from './pool.js';
import checkCyclic from '../util/check-cyclic.js';

export default (logic_, opts) => {
  Joi.assert(logic_, Joi.object().min(1).pattern(
    Joi.string(),
    Joi.object().keys({
      requires: Joi.alternatives(
        Joi.array().items(Joi.string().valid(...Object.keys(logic_))),
        Joi.string().valid('*')
      ).optional(),
      if: Joi.function().optional(),
      fn: Joi.function()
    })
  ));
  const logic = Object.fromEntries(
    Object
      .entries(logic_)
      .map(([k, v], idx, arr) => [k, v.requires === '*' ? {
        ...v,
        requires: arr.slice(0, idx).map((e) => e[0])
      } : v])
  );
  checkCyclic(Object.entries(logic)
    .reduce((p, [k, v]) => Object.assign(p, { [k]: v.requires || [] }), {}));

  const pool = Pool({ concurrency: 50, ...opts });
  const ready = {};

  const enqueue = async (name) => {
    if (ready[name] === undefined) {
      ready[name] = (async () => {
        const task = logic[name];
        if (
          task.if !== undefined
          && (
            task.if.length === 0
            || task.requires === undefined
            || task.requires.length === 0
          )
          && task.if() !== true
        ) {
          return undefined;
        }
        if (task.requires === undefined || task.requires.length === 0) {
          return pool(task.fn);
        }
        task.requires.forEach((n) => {
          ready[n] = enqueue(n);
        });
        return pool(async () => {
          const tasks = task.requires.map((n) => ready[n]);
          const results = await Promise.all(tasks);
          const kwargs = Object.fromEntries(task.requires.map((n, idx) => [n, results[idx]]));
          if (task.if !== undefined && task.if(kwargs) !== true) {
            return undefined;
          }
          return task.fn(kwargs);
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
