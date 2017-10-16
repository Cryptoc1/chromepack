const path = require('path')

const SRC_DIR = path.resolve(__dirname, './src/')
const BUILD_DIR = path.resolve(__dirname, './dist')

const config = {
  devtool: 'source-map',

  entry: {
    chromepack: `${SRC_DIR}/chromepack.js`,
    'chrome-packer': `${SRC_DIR}/chrome-packer.js`
  },

  module: {
    loaders: [{
      exclude: /(node_modules|bower_components)/,
      include: SRC_DIR,
      loader: 'babel-loader',
      options: {
        presets: ['minify'],
        plugins: ['syntax-dynamic-import', 'transform-decorators'],
        sourceMaps: true
      },
      test: /\.js?/
    }]
  },

  output: {
    filename: '[name].js',
    path: BUILD_DIR
  },

  plugins: [],

  target: 'async-node'
}

module.exports = config
