import './extensions'
import optimist from 'optimist'
import Program from './program'

const args = optimist
  .options('c', {
    alias: 'config',
    default: './chromepack.config.json',
    description: 'Specify the path to your chromepack.config.json',
    type: 'string'
  })
  .options('m', {
    alias: 'manifest',
    description: 'Specify the path to your Chrome Extension\'s manifest',
    type: 'string'
  })
  .argv

if (args.h) {
  console.log(optimist.help())
} else {
  Program.main(args)
}
