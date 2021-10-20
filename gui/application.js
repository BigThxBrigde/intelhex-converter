
const { app, BrowserWindow, Menu, ipcMain, ipcRenderer } = require('electron')

const { stat } = require('fs/promises')

/**
 * Check if the path exists 
 * @param {String} path 
 * @returns 
 */
const pathExists = async (path) => await
    stat(path).then((stats) => {
        return stats.isFile() || stats.isDirectory()
    }).catch(e => {
        return false
    })


/**
 * Class Application
 */
class Application {

    constructor() {
        this.mainWindow = null;
    }

    /**
     * Startup the application
     */
    async startup() {
        const createWindow = () => {
            this.mainWindow = new BrowserWindow({
                width: 800,
                height: 763,
                useContentSize: true,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                }
            })

            // If not in debug, hide the menu and could not resize
            if (process.env.CONFIGURATION !== "DEBUG") {
                this.mainWindow.setResizable(false)
                this.mainWindow.setMenu(new Menu())
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


/**
 * A class to provide the static methods to handle message between ipcMain and ipcRenderer 
 */
class IPC {

    /**
     * ipcMain listen messages from ipcRenderer 
     * @param {String} name 
     * @param {Function} handler 
     */
    static handle(name, handler) { ipcMain.handle(name, handler) }

    static async invoke(name, ...args) { return await ipcRenderer.invoke(name, ...args) }

    static on(name, handler) { ipcMain.on(name, handler) }

    static send(name, ...args) { ipcRenderer.send(name, ...args) }

    static rendererOn(name, handler) { ipcRenderer.on(name, handler) }

    static mainSend(mainWindow, name, ...args) { mainWindow.webContents.send(name, ...args) }
}


module.exports = { Application, IPC, pathExists }