class Util {
    /**
     * A decorator to mark methods as deprecated
     *
     * @static
     * @param {string} message
     * @memberof Util
     */
  static deprecate (message) {
    return (target, key, descriptor) => {
      if (typeof descriptor.value !== 'function') throw new TypeError('Only functions can be deprecated')

      const msg = `[Deprecation] ${target.constructor.name}.${key}() is being deprecated. ${message}`

      let ret = Object.assign({}, descriptor)
      ret.value = function () {
        console.warn(msg)
        return descriptor.value.apply(this, arguments)
      }

      return ret
    }
  }

    /**
     * Determine if something has a value. Having a value is defined as NOT being undefined, NOT being null, and, if the value is a string, is NOT and empty string
     *
     * @static
     * @param {any} value
     * @returns {boolean}
     * @memberof Util
     */
  static hasValue (value) {
    let hasValue = typeof value !== 'undefined' && value !== null
    if (hasValue && typeof value === 'string') hasValue = hasValue && value !== ''
    return hasValue
  }
}

export default Util
