const { exec } = require('child_process')
const { EOL } = require('os')
const path = require('path')

const converters = {
    'win32': path.resolve('../converter/dist/hexconverter.exe'),
    'linux': path.resolve('../converter/dist/hexconverter')
}
const converter = converters[process.platform] || ''

const MSG_IDENT = "__MSG__IDENT__"

class PyConverter {
    constructor(source, target) {
        this.source = path.resolve(source)
        this.target = path.resolve(target)
    }

    convert(options) {
        try {
            const { onStart, onMessage, onLog, onError, onExit } = options
            if (!converter) {
                onError('No converter found')
                return;
            }

            onStart()
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
            console.log(e)
            onExit('Unknown error')
        }
    }
}


module.exports = {
    PyConverter
}