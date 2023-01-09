#!/bin/sh

if !(type "clasp" > /dev/null 2>&1); then
    echo << EOS
clasp is not found. Install clasp.
https://github.com/google/clasp#install
EOS
    exit 1;
fi

mkdir -p ./dist
clasp create --type sheets --title "PushyReminder" --rootDir ./dist
mv ./dist/.clasp.json .
rm -rf ./dist

npm install
npm run deploy
