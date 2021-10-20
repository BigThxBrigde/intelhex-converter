
const { app, BrowserWindow, Menu, ipcMain, ipcRenderer } = require('electron')

const pathExists = async (path) => await
    stat(path).then((stats) => {
        return stats.isFile() || stats.isDirectory()
    }).catch(e => {
        return false
    })

class Application {

    constructor() {
        this.mainWindow = null;
    }

    async startup() {
        if (process.env.CONFIGURATION != "DEBUG") {
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

            if (process.env.CONFIGURATION !== "DEBUG") {
                this.mainWindow.setResizable(false)
            }
            this.mainWindow.loadFile('view/index.html')
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

class IPC {

    static handle(name, handler) { ipcMain.handle(name, handler) }

    static async invoke(name, ...args) { return await ipcRenderer.invoke(name, ...args) }
}

const { stat } = require('fs/promises')


module.exports = { Application, IPC, pathExists }