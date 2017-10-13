import archiver from 'archiver'
import EventEmitter from 'events'
import { exec } from 'child_process'
import fs from 'fs'
import glob from 'globby'
import path from 'path'
import TaskType from './task-type'

class ChromePacker extends EventEmitter {
  constructor (config) {
    super()
    this.config = config
    this.timing = {
      start: null,
      end: null,
      duration: null
    }
  }

  async getFiles () {
    let files = await glob(this.config.src, {
      cwd: this.config.__dir
    })

    const cwd = process.cwd()
    return files.map(file => path.relative(cwd, path.resolve(this.config.__dir, file)))
  }

  pack () {
    return new Promise(async (resolve, reject) => {
      await this.runPrePackTasks()

      const start = this.timing.start = Date.now()

      let files = await this.getFiles()

      if (files.length === 0) {
        let err = new Error('There are no files to pack')
        this.emit('error', err)
        throw err
      }

      this.emit('pack.start', {
        files: files,
        start: start
      })

      const dest = path.resolve(this.config.output.path, `${this.config.output.name}.zip`)
      const outputStream = fs.createWriteStream(dest)
      const archive = archiver('zip')

      outputStream.on('close', async e => {
        const end = this.timing.end = Date.now()
        const duration = this.timing.duration = end - start

        const res = {
          bytes: archive.pointer(),
          destination: dest,
          files: files,
          timing: {
            start: start,
            end: end,
            duration: duration
          }
        }

        this.emit('packed', res)

        await this.runPostPackTasks()

        this.emit('pack.done', res)
        this.emit('done', res)
        resolve(res)
      })
      outputStream.on('error', err => {
        this.emit('pack.error', err)
        this.emit('error', err)
        reject(err)
      })

      archive.on('entry', e => this.emit('pack.archive.entry', e))
      archive.on('error', err => {
        this.emit('pack.error', err)
        this.emit('error', err)
        reject(err)
      })
      archive.on('progress', e => this.emit('pack.progress', e))
      archive.on('warning', warning => {
        this.emit('pack.warning', warning)
        this.emit('warning', warning)
      })

      archive.pipe(outputStream)

      for (let file of files) archive.file(file, { name: path.relative(this.config.__dir, file) })

      archive.finalize()
    })
  }

  async runPrePackTasks () {
    let tasks = this.config.tasks.pre || []

    const start = Date.now()
    await this.runTasks(tasks.map(task => Object.assign({ command: task, type: TaskType.Pre })))
    const end = Date.now()

    this.emit('tasks.pre-executed', {
      count: tasks.length,
      tasks: tasks,
      timing: {
        start: start,
        end: end,
        duration: end - start
      }
    })
  }

  async runPostPackTasks () {
    let tasks = this.config.tasks.post || []

    const start = Date.now()
    await this.runTasks(tasks.map(task => Object.assign({ command: task, type: TaskType.Post })))
    const end = Date.now()

    this.emit('tasks.post-executed', {
      count: tasks.length,
      tasks: tasks,
      timing: {
        start: start,
        end: end,
        duration: end - start
      }
    })
  }

  runTask (task, rejectOnStdErr = false) {
    return new Promise((resolve, reject) => exec(task.command, (err, stdout, stderr) => {
      if (err || (stderr && rejectOnStdErr)) return reject(err || new Error(`Child command wrote to stderr: \n${stderr}`))
      resolve(stdout)
    }))
  }

  async runTasks (tasks) {
    for (let task of tasks) {
      const e = {
        task: task.command,
        type: task.type
      }
      this.emit('task.before-execute', e)

      const start = Date.now()
      let stdout = await this.runTask(task)
      const end = Date.now()

      this.emit('task.executed', Object.assign({
        output: stdout,
        timing: {
          start: start,
          end: end,
          duration: end - start
        }
      }, e))
    }
  }
}

export default ChromePacker
