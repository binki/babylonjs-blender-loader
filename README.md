Load Blender `.blend` files as BabylonJS objects through a webpack
loader.

Unfortunately, textures are not supported yet. The BabylonJS API makes
it really hard to load things yet because it requires textures to be
loaded through its own XHR mechanism and its own loader stuff. It
doesn’t even really have a proper plain JavaScript object loader, so
we have to feed it stringified JSON as a `data:` URI. To try to reduce
the amount of necessary refactoring later if texture loading is ever
supported properly, this loader loads an object with an API that wraps
`SceneLoader`.

# Usage

The BabylonJS
[`SceneLoader`](http://doc.babylonjs.com/classes/2.5/SceneLoader)
offers `ImportMesh()` to load a single mesh to an existing scene,
`Load()` to generate a new scene from the entire file, and `Append()`
to mix an entire file to an existing scene. The scene provided by this
loader will have equivalent methods except that you must pass it
`SceneLoader` and omit the `rootUrl` and `sceneFilename`
arguments. Thus, it has the following API:

* `loadedBlend.dataUri`: the raw data as a `data:` URI. If you are
  working around the lack of texture support, you may need this, but
  this should be considered deprecated because of the possibility that
  textures may eventually be handled correctly (through webpack image
  loaders).

* `loadedBlend.ImportMesh(sceneLoader, meshesNames, scene, onsuccess, progressCallBack, onerror)`

* `loadedBlend.Load(sceneLoader, engine, onsuccess, progressCallBack, onerror)`

* `loadedBlend.Append(sceneLoader, scene, onsuccess, progressCallBack, onerror)`

An example:

```javascript
var engine = new BABYLON.Engine(document.getElementById('render-canvas'), true);
var scene = new BABYLON.Scene(engine);
require('./scene.blend').Append(BABYLON.SceneLoader, scene, loadedScene => {/*onsuccess*/}, x => {/*onprogress*/}, ex => {/*onerror*/});
engine.runRenderLoop(() => scene.render());
```

## Prerequisites

You must have `blender` in your `PATH` and have the [BabylonJS Blender
Exporter](https://github.com/BabylonJS/Babylon.js/tree/master/Exporters/Blender)
plugin installed (but not necessarily activated) in Blender. See more
detailed instructions in the documentation for
[`babylonjs-blender`](https://www.npmjs.com/package/babylonjs-blender).

## Installation

    $ npm install --save webpack-babylonjs-blender

## Configuration

You are free to write
`require('webpack-babylonjs-blender!../models/person.blend')`, but
that is clunky and you probably want to use this loader for all
`.blend` files. To do so, configure webpack to use this loader as the
default for `.blend` files:

```javascript
({
    module: {
        loaders: [
            { test: /\.blend$/, loader: 'webpack-babylonjs-blender', },
        ],
    },
})
```
