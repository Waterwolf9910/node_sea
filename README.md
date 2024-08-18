# node_sea

A template repo for NodeJS' Single Executable Application (sea)

Entry point: ``app/src/index.ts``

Files in ``builder\out`` are added into binary

~~use ``libs/fs.ts`` instead of node:fs to insure all assets are properly found~~ Remembered I could just have ``libs/fs.ts`` as the first item in webpack config

- for any assets you want not bundled within the javascript with webpack, make sure to add a references in assets.json

  - Glob patterns are covered by [glob](https://www.npmjs.com/package/glob)
