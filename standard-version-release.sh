#!/bin/bash

npm i -g standard-version
cd greeting-service ; standard-version
mv CHANGELOG.md ..
cd .. ; cd name-service ; standard-version --skip.changelog true --skip.commit true --skip.tag true
