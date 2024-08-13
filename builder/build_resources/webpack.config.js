const path = require("path");
let webpack = require("webpack");

/**
 * @type {webpack.Configuration}
 */
let config = {
    entry: "./index.ts",
    context: path.resolve(__dirname, "../../app/src"),
    devtool: "inline-source-map",
    output: {
        path: path.resolve(__dirname, "../out"),
        filename: "index.js",
        clean: true,
    },
    stats: {
        errorDetails: true
    },
    module: {
        rules: [
            {
                test: /.tsx?$/,
                loader: 'ts-loader',
                options: {
                    // configFile: "../tsconfig.json"
                }
            },
            {
                test: /\.node$/,
                loader: path.resolve(__dirname, "./native_loader/loader.js")
            }
        ]
    },
    resolve: {
        extensions: [".js", ".ts", ".tsx"],
        // extensionAlias: {
        //     ".ts": [".js", ".ts"],
        // },
    },
    target: "node",
    mode:'development'
}

module.exports = config;
