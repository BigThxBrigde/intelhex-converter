const { app, BrowserWindow, Menu } = require('electron')

Menu.setApplicationMenu(false)

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600
    })

    win.setResizable(false)
    win.loadFile('index.html')
}


app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

