const { exec, execFile } = require('child_process')
const { EOL } = require('os')
const path = require('path')

const MSG_IDENT = "__MSG__IDENT__"

const converters = {
    'win32': path.resolve('./pyconverter/hexconverter.exe'),
    'linux': path.resolve('./pyconverter/hexconverter')
}
const converter = converters[process.platform] || ''

const openers = {
    'win32': 'cmd',
    'linux': 'xdg-open'
}

const opener = openers[process.platform] || ''

const openFile = (file) => {
    if (!opener) return
    const args = process.platform === 'win32' ? ['/c', 'start', file] : [file]
    execFile(opener, args)
}


class PyConverter {
    constructor(source, target) {
        this.source = path.resolve(source)
        this.target = path.resolve(target)
    }

    async convert(options) {
      return new Promise((resolve, reject)=>{
        try {
            const { onStart, onMessage, onLog, onError, onExit } = options
            if (!converter) {
                onError('No converter found')
                reject() 
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

            resolve()
        } catch (e) {
            console.log(e)
            onExit('Unknown error')
            reject()
        }
      })
    }
}

const rules = [
    { expression: /&/g, replacement: '&amp;' }, // keep this rule at first position
    { expression: /</g, replacement: '&lt;' },
    { expression: />/g, replacement: '&gt;' },
    { expression: /"/g, replacement: '&quot;' },
    { expression: /'/g, replacement: '&#039;' } // or  &#39;  or  &#0039;
]

class HtmlHelper {
    static escape(html) {
        let result = html
        rules.forEach((e, i) => {
            result = result.replace(e.expression, e.replacement);
        })
        return result
    }
}


module.exports = {
    PyConverter, openFile, HtmlHelper
}