'use strict';

const configLoader = require('openshift-config-loader');
const openshift = require('openshift-rest-client');
const nodeshift = require('nodeshift');

function rhoaster (options) {
  return {
    deploy: deploy(options),
    undeploy: undeploy(options),
    build: build(options)
  };
}

function deploy (options) {
  return async () => {
    const config = Object.assign(await configLoader(options), options);
    if (config.forceDeploy) {
      return runDeploy(config);
    }
    return openshift(config, {request: { strictSSL: options.strictSSL }}).then(client => {
      return client.deploymentconfigs.find(config.deploymentName)
        .then(result => {
          if (result.code === 404) throw new Error(result.reason);
          console.log(`Deployment ${config.deploymentName} already exists. To force redeployment provide options.forceDeploy=true.`);
          return applyResources(config);
        })
        .catch(_ => {
          console.log('No deployment found. Deploying...');
          return runDeploy(config).then(_ => waitForDeployment(client, config));
        });
    });
  };
}

function undeploy (options) {
  return async () => {
    const config = Object.assign(await configLoader(options), options);
    return nodeshift.undeploy({ projectLocation: config.projectLocation, strictSSL: config.strictSSL });
  };
}

function build (options) {
  return async () => {
    const config = Object.assign(await configLoader(options), options);
    return nodeshift.build({ projectLocation: config.projectLocation, strictSSL: config.strictSSL });
  };
}

function applyResources (config) {
  return nodeshift
    .applyResource({ projectLocation: config.projectLocation, strictSSL: config.strictSSL })
    .then(output => `http://${output.appliedResources.find(val => val.kind === 'Route').spec.host}`)
    .catch(console.error);
}

function runDeploy (config) {
  return nodeshift.deploy({ projectLocation: config.projectLocation, strictSSL: config.strictSSL })
  .then(output => `http://${output.appliedResources.find(val => val.kind === 'Route').spec.host}`)
  .catch(console.error);
}

function wait (timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

async function waitForDeployment (client, config, count) {
  count = count || 0;
  while (count++ < 20) {
    const data = await client.deploymentconfigs.find(config.deploymentName);
    if (data.status.availableReplicas > 0) {
      return applyResources(config);
    } else {
      await wait(count * 100);
    }
  }
  throw new Error('Service unavailable');
}

module.exports = rhoaster;
