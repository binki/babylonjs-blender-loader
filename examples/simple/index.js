const BABYLON = require('babylonjs');

const engine = new BABYLON.Engine(document.getElementById('render-canvas'), true);
const scene = new BABYLON.Scene(engine);
require('./simple.blend').Append(BABYLON.SceneLoader, scene, loadedScene => {/*onsuccess*/}, x => {/*onprogress*/}, ex => {/*onerror*/});
engine.runRenderLoop(() => scene.render());
