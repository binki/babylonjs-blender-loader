'use strict';

const pool = require('./workerPool.js');

const promisify = require('promisify-node');
const fs = promisify('fs');
const path = require('path');
const tmp = require('tmp-promise');

module.exports = function (source) {
  this.cacheable();
  const callback = this.async();
  tmp.dir().then(dirInfo => {
    const input = path.join(dirInfo.path, 'input.blend');
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
