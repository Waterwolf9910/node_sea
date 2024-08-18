let fs = require("fs")
let path = require("path")
let glob = require("glob")
let base = fs.readFileSync(path.resolve(__dirname, "base.js"), "utf8")
/**
 * Source is buffer
 * @type {import('webpack').LoaderDefinitionFunction}
 */
module.exports = function loader (source) {
    // this.cacheable()
    let resource_path = this.resource || this.resourcePath
    // this.emitFile(`out-${path.basename(resource_path)}.data`, util.format(this))
    let libraries = {}
    let _glob = glob.globSync((path.dirname(resource_path) + `/**/*.${process.platform == 'win32' ? 'dll' : 'so*'}`).replaceAll('\\', '/'), { absolute: true })
    for (let file of _glob) {
        // if (file == path.dirname(resource_path)) { continue }
        libraries[ path.relative(path.dirname(resource_path), file) ] = fs.readFileSync(file, 'base64')
    }
    // if (Object.keys(libraries).length > 0) {
    //     fs.writeFileSync("out.json", JSON.stringify(libraries))
    //     process.exit(0)
    // }
    return base
        .replaceAll("{base_node_module_deps}", JSON.stringify(libraries))
        //@ts-ignore
        .replaceAll("{base_node_module_file}", source.toString('base64'))
        .replaceAll("{base_node_module_name}", path.basename(resource_path))
    // @ts-ignore
    // .replaceAll("{_is_dev_}", this.mode == 'development')
}

//@ts-ignore
module.exports.raw = true
