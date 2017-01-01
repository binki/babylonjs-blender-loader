'use strict';

const pool = require('../workerPool.js');

describe('workerPool', function () {
  this.timeout(20000);

  it('lets workers be acquired', function () {
    return new Promise((resolve, reject) => {
      pool.acquire().then(worker => {
        // Acquisition worked at least.
        resolve();
        pool.release(worker);
      });
    });
  });

  it('lets workers be released', function () {
    return Promise.all(new Array(128).map(() => pool.acquire().then(worker => {
      pool.release(worker);
    })));
  });
});
