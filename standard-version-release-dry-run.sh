#!/bin/bash

npm i -g standard-version
cd greeting-service ; standard-version --dry-run
cd .. ; cd name-service ; standard-version --dry-run --skip.changelog true --skip.commit true --skip.tag true
