'use strict';

const configLoader = require('openshift-config-loader');
const openshift = require('openshift-rest-client');
const nodeshift = require('nodeshift');
const path = require('path');

/**
 *
 * @param {Object} options - optional configuration parameters
 * @param {String} options.projectLocation - the location of the project under test. Default: path.join(__dirname, '../', '../')
 * @param {String} options.deploymentName - the name of the deployment in your OpenShift cluster.
 *                 Default: path.basename(path.dirname(__dirname, '..', '..'))
 * @param {boolean} options.strictSSL - set to true if a self-signed security certificate is not OK. Default: false
 * @param {boolean} options.forceDeploy - set to true if you would like rhoaster to create a new deployment configuration
 *                  for this application, even if one with options.deploymentName already exists
 */
function rhoaster (options) {
  const opts = Object.assign({
    projectLocation: path.join(__dirname, '../', '../'),
    deploymentName: path.basename(path.dirname(__dirname, '..', '..')),
    strictSSL: false
  }, options);
  return {
    deploy: deploy(opts),
    undeploy: undeploy(opts),
    build: build(opts)
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

function undeploy ({ projectLocation, strictSSL }) {
  return async () =>
    nodeshift.undeploy({ projectLocation, strictSSL });
}

function build ({ projectLocation, strictSSL }) {
  return async () =>
    nodeshift.build({ projectLocation, strictSSL });
}

function applyResources ({ projectLocation, strictSSL }) {
  return nodeshift
    .applyResource({ projectLocation, strictSSL })
    .then(getRoute)
    .catch(console.error);
}

function runDeploy ({ projectLocation, strictSSL }) {
  return nodeshift.deploy({ projectLocation, strictSSL })
  .then(getRoute)
  .catch(console.error);
}

function getRoute (output) {
  return `http://${output.appliedResources.find(val => val.kind === 'Route').spec.host}`;
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
