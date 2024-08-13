/** Starting point for your code here */

import fs = require("./libs/fs")
import _repl = require("repl")

let repl = _repl.start({})

repl.context.fs = fs

