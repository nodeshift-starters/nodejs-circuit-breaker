'use strict';

const test = require('tape');
const request = require('supertest');
const rhoaster = require('rhoaster');

const testEnvironment = rhoaster({
  deploymentName: 'nodejs-circuit-breaker-greeting'
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
      t.equal(response.text, 'OK');
    })
    .then(_ => t.end())
    .catch(t.fail);
  });

  test('/api/greeting', t => {
    t.plan(1);
    request(route)
    .get('/api/greeting')
    .expect(200)
    .expect('Content-Type', /json/)
    .then(response => {
      t.equal(response.body.content, 'Hello, Fallback');
    })
    .then(_ => t.end())
    .catch(t.fail);
  });
}
