const babylonjsJson = require('./simple.blend');

// You should load these into babylon directly. Since I’m no good at
// that type of stuff, for the moment just going to demo accessing the
// internal JSON output (which you should probably not rely on for
// normal stuff).
babylonjsJson.meshes.forEach(mesh => console.log(mesh.name));
