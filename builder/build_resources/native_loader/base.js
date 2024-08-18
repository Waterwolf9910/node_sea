let os = require("os")
let fs = require("fs")
let path = require("path")

let data = "{base_node_module_file}"
let module_path = path.resolve(os.tmpdir(), "temp_{base_node_module_name}")
fs.mkdirSync(module_path, { recursive: true })
let file = path.resolve(module_path, "{base_node_module_name}")
let deps = JSON.parse('{base_node_module_deps}')
//@ts-ignore
//let isDev = {_is_dev_}

if (!fs.existsSync(file) || fs.readFileSync(file).equals(Buffer.from(data))) {
    fs.writeFileSync(file, Buffer.from(data, "base64"))
}
for (let dep_file of Object.keys(deps)) {
    let dep_path = path.resolve(module_path, dep_file)
    let module_data = Buffer.from(deps[ dep_file ], 'base64')
    fs.mkdirSync(path.dirname(dep_path), { recursive: true })
    // console.log(dep_path, fs.existsSync(dep_path))
    if (fs.existsSync(dep_path) && fs.readFileSync(dep_path).equals(module_data)) {
        continue
    }
    fs.writeFileSync(dep_path, module_data)
}
process.dlopen(module, file, os.constants.dlopen.RTLD_NOW)
/* if (isDev) {
    setTimeout(() => {
        try {
            fs.unlinkSync(file)
        } catch (err) {
            console.warn(`native-loader: Unable to delete temp file ${file}\n${err}`)
        }
    }, 10000).unref()
} */
