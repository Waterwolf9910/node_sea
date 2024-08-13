# node_sea

A template repo for NodeJS' Single Executable Application (sea)

Entry point: ``app/src/index.ts``

use fs.ts instead of node:fs to insure all assets are properly found

- for any assets you want not bundled within the javascript with webpack, make sure to add a references in assets.json

  - Glob patterns are covered by [glob](https://www.npmjs.com/package/glob)
