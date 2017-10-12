import path from 'path'

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

  static async load(configPath) {
    let cwd = process.cwd()
    configPath = path.relative(cwd, path.resolve(cwd, configPath))
    console.log(configPath)
    // let config = await this.loadConfig(`./${configPath}`)
    let config = require(`./${configPath}`)
    let manifest = await this.loadManifest(path.resolve(cwd, config.manifest || './manifest.json'))

    config.output = Object.assign({
      name: '[name].[version].[timestamp]',
      path: process.cwd()
    }, config.output)
    config.output.name = config.output.name
      .replace(/\[name\]/, manifest.name.toLowerCase().replace(/\s/g, '-'))
      .replace(/\[version\]/, manifest.version.replace(/\./g, '_'))
      .replace(/\[timestamp\]/, Date.now())

    /* src modifications */
    config.src = config.src || []
    config.src.push('manifest.json')

    /* tasks */
    config.tasks = Object.assign({}, config.tasks)

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

    return config
  }

  static async loadConfig(path) {
    return await import(path)
  }

  static loadManifest(path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) return reject(err)
        const manifest = JSON.parse(data.toString('utf8'))
        resolve(manifest)
      })
    })
  }
}

export default ConfigUtility
