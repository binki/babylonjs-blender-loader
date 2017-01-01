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

module.exports = pool;
