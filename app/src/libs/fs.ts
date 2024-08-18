import sea = require("node:sea")
import fs = require("node:fs");
import path = require("path");
import sea_config = require("./sea_config")
import memfs = require("memfs")
import unionfs = require("unionfs")
import fsmonkey = require('fs-monkey')

let _fs: typeof fs | unionfs.IUnionFs

if (sea.isSea()) {
    let union = new unionfs.Union()
    let vol = new memfs.Volume()
    let fs_struct = {}

    //@ts-ignore
    union.use(vol).use({...fs})
    
    for (let key in sea_config.assets) {
        fs_struct[key] = Buffer.from(sea.getAsset(key))
    }

    console.log(fs_struct)
    
    vol.fromJSON(fs_struct, path.resolve())
    
    fsmonkey.patchFs(union)
    // Use to require js files bundled via sea (assets.json) vs webpack (direct require)
    // fsmonkey.patchRequire(union)
    
    _fs = union
    //@ts-ignore
    // _fs = vol
} else {
    _fs = fs
}

export = _fs
