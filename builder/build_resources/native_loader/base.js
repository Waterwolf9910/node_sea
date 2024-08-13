let os = require("os")
let fs = require("fs")
let path = require("path")

let data = "{base_node_module_file}"
let file = path.resolve(os.tmpdir(), "temp_{base_node_module_name}")
let isDev = {_is_dev_}

fs.writeFileSync(file, Buffer.from(data, "base64"))
process.dlopen(module, file, os.constants.dlopen.RTLD_NOW)
if (isDev) {
    setTimeout(() => {
        try {
            fs.unlinkSync(file)
        } catch (err) {
            console.warn(`native-loader: Unable to delete temp file ${file}\n${err}`)
        }
    }, 10000).unref()
}
