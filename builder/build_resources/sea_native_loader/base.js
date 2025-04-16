let os = require("os")
let fs = require("fs")
let path = require("path")
let package_meta = JSON.parse(fs.readFileSync('_package_', 'utf-8'))

process.dlopen(module, path.resolve(os.tmpdir(), package_meta.name, '{base_node_module_name}'), os.constants.dlopen.RTLD_NOW)
