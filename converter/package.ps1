if (Test-Path '.\build') {
    rm -Force -Recurse '.\build'
}

if (Test-Path '.\hexconverter.spec') {
    rm -Force '.\hexconverter.spec'
}

if (Test-Path '../gui/pyconverter') {
    rm -Force -Recurse '../gui/pyconverter'
}

pyinstaller .\hexconverter.py -F --distpath '../gui/pyconverter'
