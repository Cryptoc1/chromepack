# chromepack

Chromepack is a small tool to simplify deployment of Chrome Extensions.

`$ npm install -g chromepack`
`$ chromepack -c chromepack.config.json`

### Usage

Simply run `chromepack` in a directory containing a `chromepack.config.json` file, or use `chromepack -c` to specify a path to your `chromepack.config.json` file.

Run `chromepack -h` to see all options.

### Configuration

The following are the options for a `chromepack.config.json` file:

| Field | Type | Description |
|-------|------|-------------|
| `manifest` | `string` | Specify the path to the manifest.json |
| `output.name` | `string` | The name of the `.zip` archive that is generated. Supports formatting of `[name]`, `[version]`, `[timestamp]` variables. |
| `output.path` | `string` | The path to the directory to generate the `.zip` archive in. |
| `src` | `Array<string>` | An array of files to be included in the archive, along with files calculated from the `manifest.json`. Supports glob notation. |
| `tasks.pre` | `Array<string>` | A array of commands to run BEFORE packing |
| `tasks.post` | `Array<string>` | A array of commands to run AFTER packing |

Example:

```json
{
  "manifest": "./manifest.json",
  "output": {
    "name": "[name].[version]"
  },
  "src": [ "!dist/*.map" ],
  "tasks": {
    "pre": [ "npm run build" ]
  }
}
```