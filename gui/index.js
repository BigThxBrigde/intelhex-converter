const { dialog } = require('electron')
const { Application, IPC } = require('./application')

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

}).catch((e) => {
    console.log(e)
})