import path from 'path'
import { Util, FileUtility } from '.'

const WORKING_DIR = process.cwd()

class ConfigUtility {
  /**
   * Loads the manifest, and the chromepack config to build a glob of sources to include in the package
   *
   * @static
   * @returns {Promise.<object>}
   * @memberof ConfigUtility
   */
  /* static loadManifest () {
    return ConfigUtility.getManifest()
      .then(manifest => {
        const config = require(path.resolve(process.cwd(), './chromepack.config.js'))
        config.output = Object.assign({
          name: '[name].[version].[timestamp]',
          path: process.cwd()
        }, config.output)
        config.output.name = config.output.name
          .replace(/\[name\]/, manifest.name.toLowerCase().replace(/\s/g, '-'))
          .replace(/\[version\]/, manifest.version.replace(/\./g, '_'))
          .replace(/\[timestamp\]/, Date.now())

        /* src modifications *
        config.src = config.src || []
        config.src.push('manifest.json')

        /* tasks *
        config.tasks = Object.assign({}, config.tasks)

        /* Scrape the manifest for sources that should be included *
        // background pages
        if (manifest.background) {
          if (manifest.background.scripts) config.src.push(...manifest.background.scripts)
        }
        // content script sources
        if (manifest.content_scripts) {
          for (let entry of manifest.content_scripts) {
            if (entry.css) config.src.push(...entry.css)
            if (entry.js) config.src.push(...entry.js)
          }
        }
        // icons
        if (manifest.icons) for (let key in manifest.icons) config.src.push(manifest.icons[key])
        // web accessible resources
        if (manifest.web_accessible_resources) config.src.push(...manifest.web_accessible_resources)

        return config
      })
  } */

  static configure (config, manifest) {
    console.json(config)

    this.configureOutput(config, manifest)
    this.configureSource(config, manifest)
    this.configureTasks(config, manifest)

    console.json(config)

    return config
  }

  static configureOutput (config, manifest) {
    config.output = Object.assign({
      name: '[name].[version].[timestamp]',
      path: WORKING_DIR
    }, config.output)
    config.output.name = this.formatOutputName(config.output.name, manifest)
  }

  static configureSource (config, manifest) {
    config.src = config.src || []
    config.src.push('manifest.json')

    // console.json(config)

    /* Scrape the manifest for sources that should be included */
    // background pages
    if (manifest.background) {
      if (manifest.background.scripts) config.src.push(...manifest.background.scripts)
    }
    // content script sources
    if (manifest.content_scripts) {
      for (let entry of manifest.content_scripts) {
        if (entry.css) config.src.push(...entry.css)
        if (entry.js) config.src.push(...entry.js)
      }
    }
    // icons
    if (manifest.icons) for (let key in manifest.icons) config.src.push(manifest.icons[key])
    // web accessible resources
    if (manifest.web_accessible_resources) config.src.push(...manifest.web_accessible_resources)
  }

  static configureTasks (config, manifest) {
    config.tasks = Object.assign({}, config.tasks)
    config.tasks.pre = config.tasks.pre || []
    config.tasks.post = config.tasks.post || []
  }

  static formatOutputName (name, manifest) {
    let _name = Util.hasValue(manifest.name) ? manifest.name.toLowerCase().replace(/\s/g, '-') : 'extenion'
    let version = Util.hasValue(manifest.version) ? manifest.version.replace(/\./g, '_') : 'x_x_x'
    return name.replace(/\[name\]/, _name)
      .replace(/\[version\]/, version)
      .replace(/\[timestamp\]/, Date.now())
  }

  static async load (configPath, manifestPath) {
    configPath = path.resolve(WORKING_DIR, configPath)
    let config = await this.loadConfig(configPath)
    let index = configPath.lastIndexOf(path.sep)
    config.__dir = configPath.substring(0, index < 0 ? configPath.length : index)

    manifestPath = path.resolve(path.parse(configPath).dir, Util.hasValue(manifestPath) ? manifestPath : Util.hasValue(config.manifest) ? config.manifest : './manifest.json')
    let manifest = await this.loadManifest(manifestPath)

    console.json(config)

    return this.configure(config, manifest)
  }

  static async loadConfig (path) {
    let buf = await FileUtility.read(path)

    let str = buf.toString('utf8')
    let config = JSON.parse(str)

    return config
  }

  static async loadManifest (path) {
    let buf = null
    try {
      buf = await FileUtility.read(path)
    } catch (err) {
      return {}
    }

    let str = buf.toString('utf8')
    let manifest = JSON.parse(str)

    return manifest
  }
}

export default ConfigUtility
