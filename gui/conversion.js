const { exec } = require('child_process')
const { EOL } = require('os')
const path = require('path')

const converter = path.resolve('../converter/dist/hexconverter.exe')

const MSG_IDENT = "__MSG__IDENT__"

class PyConverter {
    constructor(source, target) {
        this.source = path.resolve(source)
        this.target = path.resolve(target)
    }

    convert(onMessage, onLog, onError, onExit) {
        try {
            const cmd = `${converter} --path "${this.source}" --out "${this.target}"  --messaging`
            const proc = exec(cmd)

            proc.stdout.on('data', data => {
                const lines = data.split(EOL)
                lines.forEach((e, i) => {
                    if (e.startsWith(MSG_IDENT)) {
                        const json = JSON.parse(e.split('|')[1])
                        onMessage(json)
                    } else {
                        onLog(e)
                    }
                })
            })

            proc.stderr.on('data', data => {
                onError(data)
            })

            proc.on('close', data => {
                onExit(data)
            })
        } catch (e) {
        }
    }
}


module.exports = {
    PyConverter
}