import fs from 'fs'

class FileUtility {
  static read (path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }
}

export default FileUtility
