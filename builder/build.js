require("../.pnp.cjs").setup()
let fs = require("fs")
let path = require("path")
let child_process = require("child_process")
let util = require('util')
let sea_config = require('./build_resources/base_sea-config.json')
let assets = require('../app/assets.json')
let glob = require("glob")

let date = new Date()
let log_datetime = `${date.getDate().toString().padStart(2, '0')}-${date.getMonth().toString().padStart(2, '0')}-${date.getFullYear()}_${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}-${date.getSeconds().toString().padStart(2, '0')}`

try {
    fs.rmSync(path.resolve(__dirname, "out"), {recursive: true})
} catch {}
fs.mkdirSync(path.resolve(__dirname, "out"))
fs.mkdirSync(path.resolve(__dirname, `logs`), { recursive: true })
fs.mkdirSync(path.resolve(__dirname, 'build'), { recursive: true })
let log = fs.createWriteStream(path.resolve(__dirname, `logs/out_${log_datetime}.log`), { autoClose: false })

/**
 * 
 * @param {number | null} code
 */
let check_bs_err = (code) => {
    if (code) {
        console.error("There was an error in one of the build steps")
        console.log("Check", `logs/${log_datetime}.log`, 'for more info')
        log.close()
        process.exit(code)
    }
    if (log.writableEnded) {
        log.close()
        log = fs.createWriteStream(path.resolve(__dirname, `logs/out_${log_datetime}.log`), { autoClose: false, flags: 'a' })
    }
}

let build_resources = path.resolve(__dirname, "build_resources/")

sea_config.main = path.relative(build_resources, path.resolve(build_resources, sea_config.main))
sea_config.output = path.relative(build_resources, path.resolve(build_resources, sea_config.output))
sea_config.assets[ "_missing_" ] = "./missing.txt"
sea_config.assets[ "_package_" ] = "../../package.json"
sea_config.assets[ "_sea_config_" ] = "./sea-config.json"

let add_assets = (assets) => {
    for (let key in assets) {
        let _path = path.resolve(__dirname, "../app/", assets[ key ])
        if (!fs.existsSync(_path) && !_path.endsWith("*")) {
            sea_config.assets[ key ] = './missing.txt'
            continue
        }
        if (_path.endsWith("*") || fs.statSync(_path).isDirectory()) {
            let pattern = _path.replaceAll('\\', '/').replace(/^[A-z]:/, '')
            for (let result of glob.globSync(pattern.endsWith("*") ? pattern : pattern + '/**', { nodir: true, magicalBraces: true })) {
                // console.log(result, path.relative(path.resolve('../app/assets'), result).replace(RegExp(`(.*${key})`), '$1'), path.relative(build_resources, result))
                // sea_config.assets[ path.relative(origin, result).replace(RegExp(`(.*${key})`), '$1') ] = path.relative(build_resources, result)
                sea_config.assets[ path.join(key, path.relative(_path.replace(/\/\*\*$/, ''), result)) ] = path.relative(build_resources, result)
            }
            delete sea_config.assets[ key ]
            continue
        }
        sea_config.assets[ key ] = path.relative(build_resources, _path)
    }
}


log.write("Starting Webpack Step\n")
let webpack = child_process.spawn("yarn", [ 'webpack', '--no-color', '-c', 'webpack.config.js' ], { shell: true, cwd: build_resources, stdio: [ 'ignore', 'pipe', 'pipe' ] })
webpack.on('exit', (code) => {
    check_bs_err(code)
    log.write("\n\nStarting Blob Creation\n")

    let native_assets = {}
    if (fs.existsSync(path.resolve(__dirname, "out/native"))) {
        for (let out_path of fs.readdirSync(path.resolve(__dirname, "out/native"), { withFileTypes: true })) {
            native_assets[ './_native_/' + out_path.name ] = out_path.parentPath + path.sep + out_path.name
            if (out_path.isDirectory()) {
                native_assets[ './_native_/' + out_path.name ] += "/**"
            }
        }
    }
    add_assets(assets)
    add_assets(native_assets)
    fs.writeFileSync(path.resolve(__dirname, "out/missing.txt"), "This file was not found during build time and is marked at included only")
    fs.writeFileSync(path.resolve(__dirname, 'out/sea-config.json'), JSON.stringify(sea_config))
    log.write("Config: \n")
    log.write(util.format(sea_config))

    let sea_blob = child_process.spawn('node', [ '--experimental-sea-config', './sea-config.json' ], { shell: true, cwd: path.resolve('out'), stdio: [ 'ignore', 'pipe', 'pipe' ] })
    sea_blob.on('exit', (code) => {
        check_bs_err(code)
        log.write("\n\nStarting Binrary Injection\n")
        fs.copyFileSync(process.execPath, `node_binary${process.platform == 'win32' ? '.exe' : ''}`)
        let postject = child_process.spawn("yarn", [ 'postject', `node_binary${process.platform == 'win32' ? '.exe' : ''}`, 'NODE_SEA_BLOB', './out/index.blob', '--sentinel-fuse', 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2', ...(process.platform == 'darwin' ? [ '--macho-segment-name', 'NODE_JS' ] : []) ], { shell: true, stdio: [ 'ignore', 'pipe', 'pipe' ] })
        postject.on("exit", (code) => {
            check_bs_err(code)
            log.write("\n\nCleaning up")
            fs.renameSync(`node_binary${process.platform == 'win32' ? '.exe' : ''}`, `./build/app${process.platform == 'win32' ? '.exe' : ''}`)
            log.close()
        })

        postject.stdout.pipe(log)
        postject.stderr.pipe(log)
    })
    sea_blob.stdout.pipe(log)
    sea_blob.stderr.pipe(log)

});
webpack.stdout.pipe(log)
webpack.stderr.pipe(log)
