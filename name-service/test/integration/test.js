'use strict';

const test = require('tape');
const request = require('supertest');
const rhoaster = require('rhoaster');

const testEnvironment = rhoaster({
  deploymentName: 'nodejs-circuit-breaker-name',
  nodeVersion: '10.x'
});

testEnvironment.deploy()
  .then(runTests)
  .then(_ => test.onFinish(testEnvironment.undeploy))
  .catch(console.error);

function runTests (route) {
  test('/api/info', t => {
    t.plan(1);
    request(route)
      .get('/api/info')
      .expect(200)
      .then(response => {
        t.equal(JSON.parse(response.text).state, 'ok');
      })
      .then(_ => t.end())
      .catch(t.fail);
  });

  test('/api/name', t => {
    t.plan(1);
    request(route)
      .get('/api/name')
      .expect(200)
      .then(response => {
        t.equal(response.text, 'World!');
      })
      .then(_ => t.end())
      .catch(t.fail);
  });
}
