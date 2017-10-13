import { ConfigUtility } from './utilities'
import ChromePacker from './chrome-packer'

const formatBytes = bytes => {
  let unit = 'bytes'
  let size = bytes

  if (size > 1024) {
    size = size / 1024
    unit = 'kB'
  }
  if (size > 1024) {
    size = size / 1024
    unit = 'MB'
  }

  return [size, unit]
}

class Program {
  static async main (...args) {
    return program.main.apply(program, args)
  }

  async main (argv) {
    let config = await ConfigUtility.load(argv.config, argv.manifest)

    this.packer = new ChromePacker(config)

    this.bindEvents()

    console.log('> Starting pack')

    let result = null
    try {
      result = await this.packer.pack()
    } catch (err) {
      this.onPackerError(err)
    }

    console.log(`\n\nComplete: Packed ${result.files.length} files in ${result.timing.duration}ms\n`)
  }

  bindEvents () {
    this.packer.on('error', err => this.onPackerError(err))
    this.packer.on('warning', warning => this.onPackerWarning(warning))

    this.packer.on('pack.start', e => this.onPackerStart(e))
    this.packer.on('pack.archive.entry', e => this.onPackerEntry(e))
    this.packer.on('packed', e => this.onPackerPacked(e))

    this.packer.on('task.before-execute', e => this.onBeforeTaskExecute(e))
    this.packer.on('task.executed', e => this.onTaskExecuted(e))

    this.packer.on('tasks.pre-executed', e => this.onPrePackTasksExecuted(e))
    this.packer.on('tasks.post-executed', e => this.onPostPackTasksExecuted(e))
  }

  getTimeSinceStart () {
    return Math.round(Date.now() - this.packer.timing.start)
  }

  onBeforeTaskExecute (e) {
    console.log(`Running ${e.type}-pack task \`${e.task}\`:`)
  }

  onPackerEntry (e) {
    let [size, unit] = formatBytes(e.stats.size)
    console.log(`[${this.getTimeSinceStart()}] + ${e.name} ${size.toFixed(2).replace(/.00/, '')} ${unit}`, '\x1b[32m{packed}\x1b[0m')
  }

  onPackerError (err) {
    if (!(err instanceof Error)) err = new Error(err.toString())
    throw err
  }

  onPackerPacked (e) {
    let [size, unit] = formatBytes(e.bytes)
    console.log(`\n[${this.getTimeSinceStart()}] ${e.destination} ${size.toFixed(2).replace(/.00/, '')} ${unit}`, '\x1b[32m{built}\x1b[0m')
    console.log(`> Finished packing ${e.files.length} files\n`)
  }

  onPackerStart (e) {
    console.log(`\nPacking ${e.files.length} files:`)
  }

  onPackerWarning (e) {
    console.warn(e)
  }

  onPostPackTasksExecuted (e) {
    console.log(`> Finished executing ${e.count} post-pack tasks`)
  }

  onPrePackTasksExecuted (e) {
    console.log(`> Finished executing ${e.count} pre-pack tasks`)
  }

  onTaskExecuted (e) {
    // console.log(`Completed ${e.type}-pack task: \`${e.task}\`\n${e.output}`)
    console.log(e.output)
  }
}

export { Program }

const program = new Program()

export default program
