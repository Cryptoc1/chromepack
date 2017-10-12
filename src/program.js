import { ConfigUtility } from './utilities'

class Program {
  static async main (argv) {
    let config = await ConfigUtility.load(argv.config)
  }
}

export default Program
