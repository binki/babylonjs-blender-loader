'use strict';

const BlendWrapper = function (dataUri) {
  this.dataUri = dataUri;
  this.rootUri = '';
};

BlendWrapper.prototype.ImportMesh = function (sceneLoader, meshesNames, scene, onsuccess, progressCallBack, onerror) {
  return sceneLoader.ImportMesh(meshesNames, this.rootUri, this.dataUri, scene, onsuccess, progressCallBack, onerror);
};

BlendWrapper.prototype.Load = function (sceneLoader, engine, onsuccess, progressCallBack, onerror) {
  return sceneLoader.Load(this.rootUri, this.dataUri, engine, onsuccess, progressCallBack, onerror);
};

BlendWrapper.prototype.Append = function (sceneLoader, scene, onsuccess, progressCallBack, onerror) {
  return sceneLoader.Append(this.rootUri, this.dataUri, scene, onsuccess, progressCallBack, onerror);
};

module.exports.BlendWrapper = BlendWrapper;
