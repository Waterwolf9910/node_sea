let fs = require("fs")
let path = require("path")
let base = fs.readFileSync(path.resolve(__dirname, "base.js"), "utf8")
/**
 * Source is buffer
 * @type {import('webpack').LoaderDefinitionFunction}
 */
module.exports = function loader(source) {
    
    //@ts-ignore
    return base.replace("{base_node_module_file}", source.toString('base64')).replace("{base_node_module_name}", path.basename(this.resource || this.resourcePath)).replace("{_is_dev_}", this.mode == 'development')
}

//@ts-ignore
module.exports.raw = true
