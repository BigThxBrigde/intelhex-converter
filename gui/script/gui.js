
const path = require('path')
const { IPC, pathExists } = require('../application')

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

convertBtn.addEventListener('click', () => IPC.send('on-conv', pathInput.value, targetFolderInput.value))

IPC.rendererOn('on-conv-message', (e, args) => {
    console.log(args)
})
IPC.rendererOn('on-conv-log', (e, args) => {
    console.log(args)
})
IPC.rendererOn('on-conv-error', (e, args) => {
    console.log(args)
})
IPC.rendererOn('on-conv-exit', (e, args) => {
    console.log(args)
})