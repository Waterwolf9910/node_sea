require("../.pnp.cjs").setup()
let fs = require("fs")
let path = require("path")
let child_process = require("child_process")
let sea_config = require('./build_resources/base_sea-config.json')
let assets = require('../app/assets.json')

let date = new Date()
let log_datetime = `${date.getDate().toString().padStart(2, '0')}-${date.getMonth().toString().padStart(2, '0')}-${date.getFullYear()}_${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}-${date.getSeconds().toString().padStart(2, '0')}`

fs.mkdirSync(path.resolve(__dirname, `logs`), { recursive: true })
fs.mkdirSync(path.resolve(__dirname, 'build'), { recursive : true })
let log = fs.createWriteStream(path.resolve(__dirname, `logs/out_${log_datetime}.log`), {autoClose: false})

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
sea_config.assets[ "_sea_config_" ] = "./sea-config.json"
for (let key in assets) {
    let _path = path.resolve(__dirname, "../app/", assets[key])
    if (!fs.existsSync(_path)) {
        sea_config.assets[key] = './missing.txt'
        continue
    }
    sea_config.assets[key] = path.relative(build_resources, _path)
}
console.log(sea_config)
fs.writeFileSync(path.resolve(__dirname, "build_resources/missing.txt"), "This file was not found during build time and is marked at included only")
fs.writeFileSync(path.resolve(__dirname, 'build_resources/sea-config.json'), JSON.stringify(sea_config))
let webpack = child_process.spawn("yarn", [ 'webpack', '-c', 'webpack.config.js'], {shell: true, cwd: build_resources, stdio: ['ignore', 'pipe', 'pipe']})
webpack.on('exit', (code) => {
    check_bs_err(code)
    let sea_blob = child_process.spawn('node', [ '--experimental-sea-config', './sea-config.json' ], { shell: true, cwd: build_resources, stdio: [ 'ignore', 'pipe', 'pipe' ] })
    sea_blob.on('exit', (code) => {
        check_bs_err(code)

        fs.copyFileSync(process.execPath, `node_binary${process.platform == 'win32' ? '.exe' : ''}`)
        let postject = child_process.spawn("yarn", [ 'postject', `node_binary${process.platform == 'win32' ? '.exe' : ''}`, 'NODE_SEA_BLOB', './out/index.blob', '--sentinel-fuse', 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2' ], { shell: true, stdio: [ 'ignore', 'pipe', 'pipe' ] })
        postject.on("exit", (code) => {
            check_bs_err(code)
            fs.renameSync(`node_binary${process.platform == 'win32' ? '.exe' : ''}`, `./build/app${process.platform == 'win32' ? '.exe' : ''}`)
            fs.unlinkSync(path.resolve(__dirname, 'build_resources/missing.txt'))
            fs.unlinkSync(path.resolve(__dirname, 'build_resources/sea-config.json'))
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
