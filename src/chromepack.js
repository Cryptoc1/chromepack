import optimist from 'optimist'
import Program from './program'

const args = optimist
  .options('c', {
    alias: 'config',
    default: './chromepack.config.js',
    description: 'Specify the path to your chromepack.config.js',
    type: 'string'
  }).argv

if (args.h) {
  console.log(optimist.help())
} else {
  Program.main(args)
}
