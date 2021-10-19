const { exec } = require('child_process')
const path = require('path')

const converter = path.resolve('../converter/dist/hexconverter.exe')
const hexFile = path.resolve('../samples/PJEZC0E000.hex')
const cmd = `${converter} --path "${hexFile}"  --messaging`

let proc = exec(cmd)

proc.stdout.on('data', data => {
    console.log(data)
})

proc.stderr.on('data', data => {
    console.log(data)
})

proc.on('close', data => {
    console.log("exit")
})


