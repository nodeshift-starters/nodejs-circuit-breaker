#!/bin/bash

OC_USER=$(oc whoami)

if [ $? != 0 ] ; then
  echo "You must be logged into openshift to run this script."
  echo "try 'oc login -u developer'"
  exit 1
fi

echo "Logged in as ${OC_USER}."
oc project

echo "Building greeting service"
cd greeting-service
npm install
echo "Deploying greeting service"
npm run openshift

cd ../name-service
echo "Building name service"
npm install
echo "Deploying name service"
npm run openshift

cd ..
open http://`oc get route nodejs-circuit-breaker-greeting | tail -1 | cut -d ' ' -f 4`