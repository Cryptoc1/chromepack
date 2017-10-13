console.json = (...args) => console.log.apply(console, args.map(arg => JSON.stringify(arg, null, 4)))
