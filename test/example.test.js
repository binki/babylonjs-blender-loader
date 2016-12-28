'use strict';

const assert = require('assert');
const crossSpawn = require('cross-spawn');
const path = require('path');

describe('example', function () {
  this.timeout(20000);

  it('should succesfully build a bundle', function (done) {
    crossSpawn('webpack', {
      cwd: path.join(__dirname, '..', 'examples', 'simple'),
      stdio: 'inherit',
    })
      .on('error', ex => done(ex))
      .on('exit', code => {
        assert.equal(code, 0);
        done();
      })
    ;
  });
});
