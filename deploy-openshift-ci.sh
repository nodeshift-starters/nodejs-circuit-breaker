#!/bin/bash

cd greeting-service
npm install
npm test

cd ../name-service
npm install
npm test
