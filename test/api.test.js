'use strict';

const assert = require('assert');
const path = require('path');
const promisify = require('promisify-node');
const fs = promisify('fs');
const webpackBabylonjsBlender = require('..');

const FakeLoaderContext = function () {
};
FakeLoaderContext.prototype.run = function (loader, input) {
  var result = loader.call(this, input);
  if (this.pending) {
    return this.pending;
  } else {
    return Promise.resolve(result);
  }
};
FakeLoaderContext.prototype.async = function () {
  let resolve, reject;
  this.pending = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return (ex, result, map) => {
    if (ex) return reject(ex);
    resolve(result);
  };
};
FakeLoaderContext.prototype.cacheable = function () {
  this.calledCacheable = true;
};

describe('api', function () {
  this.timeout(20000);

  const simpleBlendBufPromise = fs.readFile(path.join(__dirname, '..', 'examples', 'simple', 'simple.blend'));
  const callApi = () => simpleBlendBufPromise.then(simpleBlendBuf => {
    return new FakeLoaderContext().run(webpackBabylonjsBlender, simpleBlendBuf).then(script => {
      return eval(script);
    });
  });

  it('should successfully transform a Buffer', function () {
    return callApi();
  });

  it('should return a wrapper object with a malformed dataUri', function () {
    return callApi().then(wrapper => {
      assert.ok(wrapper.dataUri, 'dataUri not set');
      // Should start with data:
      var start = wrapper.dataUri.substring(0, 'data:'.length);
      assert.equal(start, 'data:');
      var tail = wrapper.dataUri.substring(start.length);
      return {
        value: JSON.parse(tail),
      };
    });
  });

  it('should have API mirroring babylonjs', function () {
    return callApi().then(wrapper => {
      // Can’t figure out how to use babylonjs without a canvas, so
      // just have to fake it :-/.
      const FakeSceneLoader = function () {
      };
      FakeSceneLoader.prototype.ImportMesh = function (meshesNames, rootUrl, sceneFilename, scene, onsuccess, progressCallBack, onerror) {
        this.called = { rootUrl: rootUrl, sceneFilename: sceneFilename, };
      };
      FakeSceneLoader.prototype.Load = function (rootUrl, sceneFilename, engine, onsuccess, progressCallBack, onerror) {
        this.called = { rootUrl: rootUrl, sceneFilename: sceneFilename, };
      };
      FakeSceneLoader.prototype.Append = function (rootUrl, sceneFilename, scene, onsuccess, progressCallBack, onerror) {
        this.called = { rootUrl: rootUrl, sceneFilename: sceneFilename, };
      };

      let fakeSceneLoader;

      wrapper.ImportMesh(fakeSceneLoader = new FakeSceneLoader(), '');
      assert.ok(fakeSceneLoader.called);
      assert.equal(fakeSceneLoader.called.sceneFilename, wrapper.dataUri);

      wrapper.Load(fakeSceneLoader = new FakeSceneLoader());
      assert.ok(fakeSceneLoader.called);
      assert.equal(fakeSceneLoader.called.sceneFilename, wrapper.dataUri);

      wrapper.Append(fakeSceneLoader = new FakeSceneLoader());
      assert.ok(fakeSceneLoader.called);
      assert.equal(fakeSceneLoader.called.sceneFilename, wrapper.dataUri);
    });
  });
});
