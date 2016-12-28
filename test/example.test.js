'use strict';

const assert = require('assert');
const crossSpawn = require('cross-spawn');
const fs = require('fs');
const path = require('path');

describe('example', function () {
  this.timeout(20000);

  it('should succesfully build a bundle', function (done) {
    const simpleDir = path.join(__dirname, '..', 'examples', 'simple');
    const bundleJsPath = path.join(simpleDir, 'bundle.js');
    let exists = false;
    try {
      fs.accessSync(bundleJsPath);
      exists = true;
    } catch (ex) {
    }
    if (exists) {
      fs.unlinkSync(bundleJsPath);
    }
    crossSpawn('webpack', ['--bail', ], {
      cwd: simpleDir,
      stdio: 'inherit',
    })
      .on('error', done)
      .on('exit', code => {
          console.log(`code=${code}`);
        assert.equal(code, 0);
          fs.accessSync(bundleJsPath);
          console.log(`being done`);
        done();
      })
    ;
  });
});
