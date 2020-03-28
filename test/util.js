const util = require('util');

const sleep = util.promisify(setTimeout);


module.exports.sleep = sleep;
module.exports.Worker = (() => {
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
