import sea = require("node:sea")
let sea_config: {
    main: string,
    output: string,
    disableExperiementalSEAWarning: boolean,
    useSnapshot: boolean,
    useCodeCache: boolean,
    assets: {
        [key: string]: string
    }
} = sea.isSea() ? JSON.parse(sea.getAsset("_sea_config_", 'utf-8')) : {}

export = sea_config
