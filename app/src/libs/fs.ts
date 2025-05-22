import sea = require("node:sea")
import fs = require("node:fs");
import path = require("path");
import sea_config = require("./sea_config")
import memfs = require("memfs")
import unionfs = require("unionfs")
import fsmonkey = require('fs-monkey')
import os = require("os")
import package_meta = require("../../../package.json")

let _fs: typeof fs | unionfs.IUnionFs

if (sea.isSea()) {
    console.log("Setting up filesystem")
    let union = new unionfs.Union()
    let vol = new memfs.Volume()
    let fs_struct = {}
    let __fs: typeof fs = {
        ...fs,

        existsSync: union.existsSync,
        readFileSync: union.readFileSync,
        statSync: union.statSync,
        lstatSync: union.lstatSync,
        fstatSync: union.fstatSync,
        readdirSync: union.readdirSync,

        readFile: union.readFile,
        stat: union.stat,
        lstat: union.lstat,
        fstat: union.fstat,
        readdir: union.readdir,

        createReadStream: union.createReadStream
    }

    //@ts-ignore
    union.use(vol).use({...fs})
    
    for (let key in sea_config.assets) {
        let buf = Buffer.from(sea.getRawAsset(key) as string);
        fs_struct[key] = buf
        console.log(key)
        if (key.startsWith('_native_')) {
            fs.mkdirSync(path.dirname(path.resolve(os.tmpdir(), package_meta.name, key.replace('_native_/', ''))), { recursive: true })
            fs.writeFileSync(path.resolve(os.tmpdir(), package_meta.name, key.replace('_native_/', '')), buf)
        }
    }

    vol.fromJSON(fs_struct, path.resolve())
    
    fsmonkey.patchFs(__fs)
    // Use to require js files bundled via sea (assets.json) vs webpack (direct require)
    // fsmonkey.patchRequire(union)
    
    _fs = union
    //@ts-ignore
    // _fs = vol
} else {
    _fs = fs
}

export = _fs
