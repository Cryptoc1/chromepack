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
  static async main (argv) {
    let config = await ConfigUtility.load(argv.config, argv.manifest)

    let packer = new ChromePacker(config)

    Program.bindEvents(packer)

    let result = null
    try {
      result = await packer.pack()
    } catch (err) {
      Program.onPackerError(err)
    }

    let [size, unit] = formatBytes(result.bytes)

    console.log(`\n[${Math.round(result.duration)}] > ${result.dest} ${size.toFixed(2).replace(/.00/, '')} ${unit}`, '\x1b[32m{built}\x1b[0m')
    console.log(`\nComplete: Packed ${result.files.length} files in ${result.timing.duration}ms\n`)
  }

  static bindEvents (packer) {
    packer.on('error', err => Program.onPackerError(err))
    packer.on('warning', warning => Program.onPackerWarning(warning))

    packer.on('pack.start', e => Program.onPackerStart(e))
    packer.on('pack.archive.entry', e => Program.onPackerEntry(e))
    packer.on('pack.progress', e => Program.onPackerProgress(e))

    packer.on('task.before-execute', e => Program.onBeforeTaskExecute(e))
    packer.on('task.executed', e => Program.onTaskExecuted(e))

    packer.on('tasks.pre-executed', e => Program.onPrePackTasksExecuted(e))
    packer.on('tasks.post-executed', e => Program.onPostPackTasksExecuted(e))
  }

  static onBeforeTaskExecute (e) {
    console.log(`Running ${e.type}-pack task \`${e.task}\``)
  }

  static onPackerEntry (e) {
    console.json(e)
  }

  static onPackerError (err) {
    if (!(err instanceof Error)) err = new Error(err.toString())
    throw err
  }

  static onPackerProgress (e) {
    console.json(e)
  }

  static onPackerStart (e) {
    console.log(`Packing ${e.files.length} files:`)
  }

  static onPackerWarning (e) {
    console.warn(e)
  }

  static onPostPackTasksExecuted (e) {
    console.log(`[${e.timing.duration}] > Finished executing ${e.count} post-pack tasks\n`)
  }

  static onPrePackTasksExecuted (e) {
    console.log(`[${e.timing.duration}] > Finished executing ${e.count} pre-pack tasks\n`)
  }

  static onTaskExecuted (e) {
    console.log(`Completed ${e.type}-pack task: \`${e.task}\`\n${e.output}`)
  }
}

export default Program
