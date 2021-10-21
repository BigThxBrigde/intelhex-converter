
const path = require('path')
const { IPC, pathExists } = require('../application')
const { HtmlHelper } = require('../conversion')
const inputFileSelector = document.querySelector('#inputFileSelector')
const inputFolderSelector = document.querySelector('#inputFolderSelector')
const pathInput = document.querySelector('#pathInput')
const targetFolderSelector = document.querySelector('#targetFolderSelector')
const targetFolderInput = document.querySelector('#targetFolderInput')
const convertBtn = document.querySelector('#convertBtn')
const openLogBtn = document.querySelector('#openLogBtn')
const resultGrid = document.querySelector('#resultGrid')
const logPanel = document.querySelector('#logPanel')
const progressBar = document.querySelector('#progressBar')
const messages = []

const selectPath = async (name, target, ...args) => {
    const selected = await IPC.invoke(name, ...args)
    if (!selected) { return }
    if (await pathExists(selected)) {
        target.value = selected
    }
}

const enableElements = (disabled) => {
    inputFileSelector.disabled = disabled
    inputFolderSelector.disabled = disabled
    pathInput.disabled = disabled
    targetFolderInput.disabled = disabled
    targetFolderSelector.disabled = disabled
    convertBtn.disabled = disabled
    openLogBtn.disabled = disabled
}

const clearStates = () => {
    progressBar.value = 0
    resultGrid.innerHTML = ''
    logPanel.innerHTML = ''
}
const setProgress = (i) => {
    i = Math.min(100, i)
    progressBar.value = i
}

const openFile = (file) => IPC.send('open-file', file)

const logFile = path.resolve(path.join(process.env.APPDATA, 'hex-converter.log'))

targetFolderInput.value = path.resolve(path.join(process.env.USERPROFILE, 'hexconverter'))

inputFileSelector.addEventListener('click', async () => await selectPath('path-selection', pathInput, true))

inputFolderSelector.addEventListener('click', async () => await selectPath('path-selection', pathInput, false))

targetFolderSelector.addEventListener('click', async () => await selectPath('target-selection', targetFolderInput))

convertBtn.addEventListener('click', () => IPC.send('on-conv', pathInput.value, targetFolderInput.value))

openLogBtn.addEventListener('click', () => openFile(logFile))

IPC.rendererOn('on-conv-start', (e, args) => {
    messages.length = 0
    enableElements(true)
    clearStates()
    setProgress(10)
})

IPC.rendererOn('on-conv-message', (e, args) => {
    const msg = args.msg
    const i = messages.findIndex((v, i) => v.source === msg.source)
    if (i == -1) {
        messages.push(msg)
    } else {
        messages[i].status = msg.status
    }
    resultGrid.innerHTML = ''
    messages.forEach((v, i) => {
        resultGrid.innerHTML += `<tr>
                                <td>${HtmlHelper.escape(v.source)}</td>
                                <td><a href="#">${HtmlHelper.escape(v.target)}</a></td>
                                <td>${HtmlHelper.escape(v.status)}</td>
                            </tr>`
    })
    const anchors = resultGrid.querySelectorAll('a')
    anchors.forEach((a, i) => {
        a.addEventListener('click', () => {
            openFile(a.innerText)
        })
    })
    setProgress(progressBar.value + parseInt(Math.random() * 10))
})

IPC.rendererOn('on-conv-log', (e, args) => {
    logPanel.innerHTML += `<p class="pb-1">${HtmlHelper.escape(args)}</p>`
    setProgress(progressBar.value + parseInt(Math.random() * 10))
})

IPC.rendererOn('on-conv-error', (e, args) => {
    console.log(args)
})

IPC.rendererOn('on-conv-exit', (e, args) => {
    enableElements(false)
    setProgress(100)
})

