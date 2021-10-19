
const { app, BrowserWindow, Menu, ipcMain, dialog, ipcRenderer } = require('electron')


class Application {

    constructor() {
        this.mainWindow = null;
    }

    async startup() {
        if (process.env.DEBUG) {
            Menu.setApplicationMenu(false)
        }
        const createWindow = () => {
            this.mainWindow = new BrowserWindow({
                width: 800,
                height: 600,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                }
            })

            this.mainWindow.setResizable(false)
            this.mainWindow.loadFile('index.html')
        }

        await app.whenReady()

        createWindow()


        app.on('activate', function () {
            if (BrowserWindow.getAllWindows().length === 0) createWindow()
        })

        app.on('window-all-closed', function () {
            if (process.platform !== 'darwin') app.quit()
        })

    }

}

const handle = (name, handler) => ipcMain.handle(name, handler)

const invoke = async (name, ...args) => await ipcRenderer.invoke(name, args)

module.exports = { Application, handle, invoke }