// clearTimeout is used to allow for time freezing in tests
export default (promise, ms, name) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(`Promise "${name}" timed out after ${ms} ms`)), ms);
  promise.then((value) => {
    clearTimeout(timer);
    resolve(value);
  }).catch((err) => {
    clearTimeout(timer);
    reject(err);
  });
});
