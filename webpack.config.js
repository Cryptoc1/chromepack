const path = require('path')

const SRC_DIR = path.resolve(__dirname, './src/')
const BUILD_DIR = path.resolve(__dirname, './dist')

const config = {
  devtool: 'source-map',

  entry: `${SRC_DIR}/chromepack.js`,

  module: {
    loaders: [{
      exclude: /(node_modules|bower_components)/,
      include: SRC_DIR,
      loader: 'babel-loader',
      options: {
        presets: ['minify'],
        plugins: ['syntax-dynamic-import', 'transform-decorators']
      },
      test: /\.js?/
    }]
  },

  output: {
    filename: 'chromepack.js',
    path: BUILD_DIR
  },

  plugins: [],

  target: 'node'
}

module.exports = config
