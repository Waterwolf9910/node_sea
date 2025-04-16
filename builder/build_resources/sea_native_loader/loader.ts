import fs = require("fs")
import path = require("path")
let base = fs.readFileSync(path.resolve(__dirname, "base.js"), "utf8")

module.exports = function loader(this: ThisParameterType<import('webpack').LoaderDefinitionFunction<{ temp_path: string }>>, source: string | Buffer) {
    let folder_name = this._module.rawRequest.replace(/^\.\.\//, './').replace(/build\/([Rr]elease|[Dd]ebug)\//, '').replace(/\.node/, '')
    let out = path.resolve(this.getOptions().temp_path, folder_name)
    let resource_path = this.resource || this.resourcePath
    let files = fs.readdirSync(path.dirname(resource_path).replace('\\', '')).filter(v => v.match(/\.(so|a)([0-9]+)?$/))//.map(v => path.resolve(resource_path, v))

    fs.mkdirSync(out, { recursive: true })
    fs.writeFileSync(path.resolve(out, 'module.node'), source)

    for (let file of files) {
        let out_lib = path.resolve(out, file)

        fs.mkdirSync(path.dirname(out_lib), { recursive: true })
        fs.writeFileSync(out_lib, fs.readFileSync(path.resolve(path.dirname(resource_path), file)))
    }

    return base
        .replaceAll("{base_node_module_name}", path.join(folder_name, 'module.node'))
}

module.exports.raw = true
