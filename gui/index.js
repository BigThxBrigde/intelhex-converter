const { dialog } = require('electron')
const { Application, handle } = require('./application')

const app = new Application()

app.startup().then(() => {
    handle('path-selection', async (e, ...args) => {
        const dlg = await dialog.showOpenDialog({
            properties: ['openFile', 'openDirectory']
        })
        return dlg.filePaths[0]
    })
    handle('folder-selection', async (e, ...args) => {
        const dlg = await dialog.showOpenDialog({
            properties: ['openDirectory']
        })
        return dlg.filePaths[0]
    })
})