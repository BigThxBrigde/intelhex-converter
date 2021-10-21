#!/usr/bin/env bash

[ -d ./dist ] && rm -rf ./dist

cd ./converter

bash ./package.sh

cd ../gui

npm run pack-linux

cd ..
