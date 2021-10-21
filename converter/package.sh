#! /usr/bin/env bash
[ -d ./build ] && rm -rf ./build 
[ -f ./hexconverter.spec ] && rm -f ./hexconverter.spec

[ -d ../gui/pyconverter ] && rm -rf ../gui/pyconverter

pyinstaller ./hexconverter.py -F --distpath ../gui/pyconverter
