'use strict';

const BabylonjsBlenderWorker = require('babylonjs-blender').BabylonjsBlenderWorker;

const deadWorkers = new Set();
const pool = require('generic-pool').createPool({
  create: () => {
    const worker = new BabylonjsBlenderWorker();
    worker.on('error', () => deadWorkers.add(worker));
    return worker;
  },
  destroy: worker => {
    deadWorkers.delete(worker);
    worker.end();
  },
  validate: worker => !deadWorkers.has(worker),
}, {
  max: require('os').cpus().length,
  testOnBorrow: true,
});

require('exit-hook')(() => {
  pool.drain().then(() => {
    pool.clear();
  });
});

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
          callback(null, `module.exports = ${contents}`);
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
