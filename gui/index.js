const { dialog } = require('electron')
const { Application, IPC } = require('./application')
const { PyConverter } = require('./conversion')

const app = new Application()

app.startup().then(() => {
    const openDialog = async (e, ...args) => {
        const isFolder = !args[0]
        const options = {
            properties: isFolder ? ['openDirectory'] : ['openFile'],
            filters: isFolder ? [] :
                [
                    { name: 'Hex Files', extensions: ['hex'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
        }

        const d = await dialog.showOpenDialog(options)
        return d.filePaths[0]
    }

    IPC.handle('path-selection', openDialog)
    IPC.handle('target-selection', openDialog)

    IPC.on('on-conv', async (e, ...args) => {
        const converter = new PyConverter(args[0], args[1])
        const onMessage = (data) => {
            IPC.mainSend(app.mainWindow, 'on-conv-message', data)
        }
        const onLog = (data) => {
            IPC.mainSend(app.mainWindow, 'on-conv-log', data)
        }
        const onError = (data) => {
            IPC.mainSend(app.mainWindow, 'on-conv-error', data)
        }
        const onExit = (data) => {
            IPC.mainSend(app.mainWindow, 'on-conv-exit', data)
        }
        converter.convert(onMessage, onLog, onError, onExit)
    })

}).catch((e) => {
    console.log(e)
})