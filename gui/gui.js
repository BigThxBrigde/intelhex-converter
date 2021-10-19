const { invoke } = require('./application')
const path = require('path')

const pathSelector = document.querySelector('#pathSelector')

const folderSelector = document.querySelector('#folderSelector')
const folderInput = document.querySelector('#folderInput')

folderInput.value = path.resolve('.')

pathSelector.addEventListener('click', async () => {
    const path = await invoke('path-selection')
    console.log(path)
})

folderSelector.addEventListener('click', async () => {
    const path = await invoke('folder-selection')
    console.log(path)
})