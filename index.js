'use strict';

const pool = require('./workerPool.js');

const promisify = require('promisify-node');
const fs = promisify('fs');

// cleantmp(actionOptionallyReturningPromise).then(…)
const cleantmp = (() => {
  const cleantmp = require('webpack-util-cleantmp').cleantmp;
  return action => new Promise((resolve, reject) => {
    const subscription = cleantmp().subscribe(dir => {
      const p = Promise.resolve().then(() => action(dir))
      // Useful for debugging—keep the tempdir around for long enough to figure out what’s happening.
      //.then(() => new Promise((resolve, reject) => setTimeout(resolve, 12000)))
      ;
      p.catch().then(() => subscription.unsubscribe());
      p.then(resolve, reject);
    });
  });
})();

const path = require('path');

module.exports = function (source) {
  this.cacheable();
  const callback = this.async();
  cleantmp(dir => {
    const input = path.join(dir, 'input.blend');
    return fs.writeFile(input, source).then(() => {
      return pool.acquire().then(worker => {
        return worker.process(input).then(job => {
          return fs.readFile(job.output);
        }).then(contents => {
          // For some reason, they use “data:” but do not allow
          // “application/json,” or encodeURIComponent(). It’s… like…
          // wrong!
          callback(null, `module.exports = new (require(${JSON.stringify(path.join(__dirname, 'runtime.js'))})).BlendWrapper(${JSON.stringify(`data:${contents}`)});`);
        }, ex => {
          callback(ex);
        }).then(() => {
          pool.release(worker);
        });
      });
    });
  });
};
// Prevent webpack from mangling the binary—it normally parses it as
// UTF-8.
module.exports.raw = true;
