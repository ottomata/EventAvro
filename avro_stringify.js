#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

var fs = require('fs');
var avroFile = process.argv[2];
var payload = JSON.stringify(fs.readFileSync(avroFile, "utf8"));
console.log(payload);
