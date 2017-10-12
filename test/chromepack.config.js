const config = {

  manifest: './manifest.json',

  output: {
    name: '[name].[version]'
  },
  // exclude map files
  src: ['!**/*.map'],
  tasks: {
    pre: ['npm run webpack', 'npm run gulp css']
  }
}

module.exports = config
