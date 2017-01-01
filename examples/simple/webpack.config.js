module.exports = {
  entry: '.',
  module: {
    loaders: [
      {
        test: /\.blend$/,
        // In a real module you’d use the name, we’re inside the module so have to specify a path instead.
        //loader: 'babylonjs-blender-loader',
        loader: '../../index.js',
      }
    ],
  },
  output: {
    filename: 'bundle.js',
  },
}
