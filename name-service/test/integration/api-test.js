'use strict';

const test = require('tape');
const request = require('supertest');
const rhoaster = require('rhoaster');

const testEnvironment = rhoaster({
  deploymentName: 'nodejs-circuit-breaker-name'
});

testEnvironment.deploy()
  .then(runTests)
  .then(_ => test.onFinish(testEnvironment.undeploy))
  .catch(console.error);

function runTests (route) {
  test('/api/health/readiness', t => {
    t.plan(1);
    request(route)
    .get('/api/health/readiness')
    .expect(200)
    // .expect('Content-Type', /text\/html/)
    .then(response => {
      t.equal(response.text, 'OK');
    })
    .then(_ => t.end())
    .catch(t.fail);
  });

  test('/api/health/liveness', t => {
    t.plan(1);
    request(route)
    .get('/api/health/liveness')
    .expect(200)
    // .expect('Content-Type', /text\/html/)
    .then(response => {
      console.log(response);
      t.equal(response.text, 'OK');
    })
    .then(_ => t.end())
    .catch(t.fail);
  });

  test('/api/info', t => {
    t.plan(1);
    request(route)
    .get('/api/info')
    .expect(200)
    .expect('Content-Type', /json/)
    .then(response => {
      t.equal(response.body.state, 'ok');
    })
    .then(_ => t.end())
    .catch(t.fail);
  });

  test('/api/name', t => {
    t.plan(1);
    request(route)
    .get('/api/name')
    .expect(200)
    .expect('Content-Type', /text\/html/)
    .then(response => {
      t.equal(response.text, 'World');
    })
    .then(_ => t.end())
    .catch(t.fail);
  });
}
