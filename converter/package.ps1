rm -Force -Recurse .\build
rm -Force .\hexconverter.spec
rm -Force -Recurse '../gui/pyconverter'
pyinstaller .\hexconverter.py -F --distpath '../gui/pyconverter'
