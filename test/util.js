import util from 'util';

export const sleep = util.promisify(setTimeout);
export const Worker = (() => {
  // eslint-disable-next-line no-console
  const log = (...args) => console.log(...args);
  return (id, delayMs) => () => new Promise((resolve) => {
    log(`start ${id}`);
    sleep(delayMs).then(() => {
      log(`end ${id}`);
      resolve(id);
    });
  });
})();
