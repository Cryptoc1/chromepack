import path from 'path'
import { Util, FileUtility } from '.'

const WORKING_DIR = process.cwd()

class ConfigUtility {
  static configure (config, manifest) {
    ConfigUtility.configureOutput(config, manifest)
    ConfigUtility.configureSource(config, manifest)
    ConfigUtility.configureTasks(config, manifest)

    return config
  }

  static configureOutput (config, manifest) {
    config.output = Object.assign({
      name: '[name].[version].[timestamp]',
      path: config.__dir
    }, config.output)
    config.output.name = ConfigUtility.formatOutputName(config.output.name, manifest)
  }

  static configureSource (config, manifest) {
    config.src = config.src || []
    config.src.push('manifest.json')

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
    let config = await ConfigUtility.loadConfig(configPath)
    let index = configPath.lastIndexOf(path.sep)
    config.__dir = configPath.substring(0, index < 0 ? configPath.length : index)

    manifestPath = path.resolve(path.parse(configPath).dir, Util.hasValue(manifestPath) ? manifestPath : Util.hasValue(config.manifest) ? config.manifest : './manifest.json')
    let manifest = await ConfigUtility.loadManifest(manifestPath)

    return ConfigUtility.configure(config, manifest)
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
