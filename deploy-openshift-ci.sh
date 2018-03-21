#!/bin/bash

cd greeting-service
npm install
npm run openshift

cd ../name-service
npm install
npm run openshift
