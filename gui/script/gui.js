
const path = require('path')
const { IPC, pathExists } = require('../application')
const { PyConverter } = require('../conversion')


const inputFileSelector = document.querySelector('#inputFileSelector')
const inputFolderSelector = document.querySelector('#inputFolderSelector')
const pathInput = document.querySelector('#pathInput')
const targetFolderSelector = document.querySelector('#targetFolderSelector')
const targetFolderInput = document.querySelector('#targetFolderInput')
const convertBtn = document.querySelector('#convertBtn')

const selectPath = async (name, target, ...args) => {
    const selected = await IPC.invoke(name, ...args)
    if (!selected) { return }
    if (await pathExists(selected)) {
        target.value = selected
    }
}

targetFolderInput.value = path.resolve('.')

inputFileSelector.addEventListener('click', async () => await selectPath('path-selection', pathInput, true))

inputFolderSelector.addEventListener('click', async () => await selectPath('path-selection', pathInput, false))

targetFolderSelector.addEventListener('click', async () => await selectPath('target-selection', targetFolderInput))

convertBtn.addEventListener('click', async () => {
    const converter = new PyConverter(pathInput.value, targetFolderInput.value)
    const onMessage = (data) => {
        console.log(data)
    }
    const onLog = (data) => {
        console.log(data)
    }
    const onError = (data) => {
        console.log(data)
    }
    const onExit = (data) => {
        console.log(data)
    }

    await converter.convert(onMessage, onLog, onError, onExit)
})